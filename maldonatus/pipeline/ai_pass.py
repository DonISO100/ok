#!/usr/bin/env python3
"""AI pass: let a small Claude model choose between the readings the rule-based
normalizer could not settle (fit/sit, folum/solum, Fn/In, ...).

The model never writes text: for each doubtful word it must pick one of the
readings listed in ai-queue.json (built by build.py) or answer "unsure", in
which case the word stays as printed. One request per page.

    pip install anthropic
    export ANTHROPIC_API_KEY=...            # or `ant auth login`
    python3 maldonatus/pipeline/ai_pass.py --dry-run           # counts, no API calls
    python3 maldonatus/pipeline/ai_pass.py                     # Haiku 5.5 over the queue
    python3 maldonatus/pipeline/ai_pass.py --compare claude-opus-5-5 --sample 12
                                                               # agreement check on 12 pages
    python3 maldonatus/pipeline/build.py ...                   # rebuild: applies ai-decisions.json

Decisions go to ai-decisions.json (resumable: pages already decided are
skipped). The comparison goes to ai-compare.json.
"""

import argparse
import collections
import concurrent.futures as cf
import json
import os
import random
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL = "claude-haiku-5-5"

SYSTEM = """You are helping prepare a reading text of Juan Maldonado's Latin commentary on the Gospels \
(Pont-à-Mousson, 1596), from OCR of the printed book.

The OCR reads the long s (ſ) as f, the printer's nasal tilde as an accent, and makes the usual letter \
confusions (n/u, c/e, F/I). Rules have already fixed every word they could decide alone. You get the \
words they could not: each is marked ⟦like this⟧ in its line, with the lines before and after, and a \
list of possible readings.

For each word, choose the reading the printed book most likely has, judging by Latin grammar and \
sense in context (e.g. "fit" vs "sit": is a subjunctive of esse needed, or "becomes"?). Answer only \
with one of the listed options, copied exactly. Keep the book's spelling (u/v, i/j, æ) as given. If \
the context does not decide between the options, answer "unsure" - a wrong guess is worse than \
leaving the printed form."""


def load(path, default):
    return json.load(open(path, encoding="utf-8")) if os.path.exists(path) else default


def pages_of(queue):
    by = collections.defaultdict(list)
    for k, q in queue.items():
        by[q["img"]].append((k, q))
    return dict(sorted(by.items()))


def prompt_for(items):
    lines = []
    for n, (k, q) in enumerate(items, 1):
        lines.append(f"[{n}] options: {' | '.join(q['options'])}\n"
                     f"    before: {q['before']}\n    line:   {q['text']}\n    after:  {q['after']}")
    return "Choose a reading for each marked word.\n\n" + "\n\n".join(lines)


def schema_for(items):
    return {
        "type": "object",
        "properties": {
            "decisions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "n": {"type": "integer"},
                        "choice": {"type": "string"},
                    },
                    "required": ["n", "choice"],
                    "additionalProperties": False,
                },
            }
        },
        "required": ["decisions"],
        "additionalProperties": False,
    }


def ask(client, model, items, effort):
    resp = client.messages.create(
        model=model,
        max_tokens=8000,
        system=SYSTEM,
        output_config={"effort": effort, "format": {"type": "json_schema", "schema": schema_for(items)}},
        messages=[{"role": "user", "content": prompt_for(items)}],
    )
    if resp.stop_reason in ("refusal", "max_tokens"):
        raise RuntimeError(f"stop_reason {resp.stop_reason}")
    text = next(b.text for b in resp.content if b.type == "text")
    got = {d["n"]: d["choice"] for d in json.loads(text)["decisions"]}
    out = {}
    for n, (k, q) in enumerate(items, 1):
        ch = got.get(n, "unsure")
        valid = ch in q["options"]
        out[k] = {"word": q["word"], "options": q["options"], "choice": ch if valid else None,
                  "unsure": not valid, "model": model}
    return out, resp.usage


def run(model, pages, done, workers, effort, label):
    import anthropic
    client = anthropic.Anthropic()
    results, usage = {}, collections.Counter()
    todo = {img: items for img, items in pages.items() if not all(k in done for k, _ in items)}
    print(f"{label}: {len(todo)} pages, {sum(len(v) for v in todo.values())} words, model {model}")

    def one(img):
        try:
            return img, ask(client, model, todo[img], effort)
        except anthropic.RateLimitError as e:
            return img, e
        except anthropic.APIStatusError as e:
            return img, e
        except anthropic.APIConnectionError as e:
            return img, e
        except (RuntimeError, ValueError, KeyError) as e:
            return img, e

    # first page alone: a bad key or model name stops the run here, not 84 times
    imgs = list(todo)
    if not imgs:
        return results, usage
    first = one(imgs[0])
    if isinstance(first[1], (anthropic.AuthenticationError, anthropic.PermissionDeniedError, anthropic.NotFoundError)):
        sys.exit(f"stopping: {type(first[1]).__name__}: {first[1]}")

    def rest():
        yield first
        with cf.ThreadPoolExecutor(workers) as ex:
            yield from ex.map(one, imgs[1:])

    for img, r in rest():
        if isinstance(r, Exception):
            print(f"  img {img}: failed ({type(r).__name__}: {r}) - left for the next run")
            continue
        dec, u = r
        results.update(dec)
        usage["in"] += u.input_tokens
        usage["out"] += u.output_tokens
        print(f"  img {img}: {sum(1 for d in dec.values() if not d['unsure'])}/{len(dec)} decided")
    return results, usage


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--queue", default=os.path.join(HERE, "ai-queue.json"))
    ap.add_argument("--out", default=os.path.join(HERE, "ai-decisions.json"))
    ap.add_argument("--model", default=MODEL)
    ap.add_argument("--effort", default="low", choices=["low", "medium", "high"])
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--compare", metavar="MODEL", help="second model for the agreement check")
    ap.add_argument("--sample", type=int, default=12, help="pages to sample for --compare")
    a = ap.parse_args()

    queue = load(a.queue, {})
    pages = pages_of(queue)
    if a.dry_run:
        chars = sum(len(SYSTEM) + len(prompt_for(items)) for items in pages.values())
        tok_in = chars / 3.0                       # Latin tokenizes densely
        tok_out = sum(len(items) for items in pages.values()) * 18
        print(f"{len(pages)} requests, {len(queue)} words")
        print(f"~{tok_in / 1e6:.2f}M input tokens, ~{tok_out / 1e6:.3f}M output tokens")
        print(f"Haiku 5.5 at $0.10/$0.50 per M: ~${tok_in / 1e6 * 0.10 + tok_out / 1e6 * 0.50:.3f}")
        first = next(iter(pages.values()))
        print("\n--- sample request ---\n" + prompt_for(first[:3]))
        return

    if a.compare:
        rnd = random.Random(1596)
        sample = dict(rnd.sample(sorted(pages.items()), min(a.sample, len(pages))))
        r1, _ = run(a.model, sample, {}, a.workers, a.effort, "small model")
        r2, _ = run(a.compare, sample, {}, a.workers, "medium", "reference model")
        keys = [k for k in r1 if k in r2]
        both = [k for k in keys if not r1[k]["unsure"] and not r2[k]["unsure"]]
        agree = [k for k in both if r1[k]["choice"] == r2[k]["choice"]]
        report = {
            "pages": sorted(sample), "words": len(keys),
            "small_unsure": sum(r1[k]["unsure"] for k in keys), "reference_unsure": sum(r2[k]["unsure"] for k in keys),
            "both_decided": len(both), "agree": len(agree),
            "agreement": round(len(agree) / len(both), 3) if both else None,
            "disagreements": [{"key": k, "word": r1[k]["word"], "small": r1[k]["choice"], "reference": r2[k]["choice"],
                               "line": queue[k]["text"]} for k in both if k not in agree],
        }
        json.dump(report, open(os.path.join(HERE, "ai-compare.json"), "w"), ensure_ascii=False, indent=1)
        print(f"\nagreement where both decided: {report['agreement']} ({len(agree)}/{len(both)}); "
              f"unsure: small {report['small_unsure']}, reference {report['reference_unsure']}")
        return

    done = load(a.out, {})
    res, usage = run(a.model, pages, done, a.workers, a.effort, "AI pass")
    done.update(res)
    json.dump(done, open(a.out, "w"), ensure_ascii=False, indent=0)
    n_ok = sum(1 for d in done.values() if not d["unsure"])
    print(f"\n{n_ok}/{len(done)} decided ({len(done) - n_ok} unsure, kept as printed); "
          f"tokens in {usage['in']}, out {usage['out']}. Wrote {a.out}")


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Opus re-check of the Haiku pass's weak spots: every fit/sit queue entry and every
entry Haiku answered "unsure". Reuses ai_pass.py's prompt, schema and validation.
Opus's answer replaces Haiku's when Opus decides; if Opus is unsure the Haiku
decision stands (and the entry is marked model=haiku). Changed entries get
model=opus and "was": <haiku choice>.

    python3 maldonatus/pipeline/ai_recheck.py --queue <ai-queue as committed at the Haiku-pass commit>
"""
import argparse, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ai_pass

ap = argparse.ArgumentParser()
ap.add_argument("--queue", required=True, help="the full 2029-word queue")
ap.add_argument("--out", default=os.path.join(HERE, "ai-decisions.json"))
ap.add_argument("--model", default="claude-opus-5-5")
ap.add_argument("--effort", default="medium")
a = ap.parse_args()

queue = json.load(open(a.queue, encoding="utf-8"))
dec = json.load(open(a.out, encoding="utf-8"))
pick = {k: v for k, v in queue.items()
        if ("fit" in v["options"] and "sit" in v["options"]) or dec.get(k, {}).get("unsure")}
pages = ai_pass.pages_of(pick)
print(f"re-check: {len(pick)} words on {len(pages)} pages with {a.model}")
res, usage = ai_pass.run(a.model, pages, {}, 4, a.effort, "Opus re-check")
changed = kept = still_unsure = 0
log = []
for k, r in res.items():
    old = dec[k]
    if r["unsure"]:
        still_unsure += 1
        continue
    if old["unsure"] or old["choice"] != r["choice"]:
        changed += 1
        log.append((old["word"], old["choice"], r["choice"], queue[k]["text"]))
        dec[k] = {**r, "model": "opus", "was": old["choice"] if not old["unsure"] else "unsure"}
    else:
        kept += 1
        dec[k] = {**old, "model": "haiku+opus-agree"}
json.dump(dec, open(a.out, "w"), ensure_ascii=False, indent=0)
json.dump(log, open(os.path.join(HERE, "ai-recheck-changes.json"), "w"), ensure_ascii=False, indent=1)
print(f"changed {changed}, confirmed {kept}, opus unsure {still_unsure}; tokens in {usage['in']}, out {usage['out']}")

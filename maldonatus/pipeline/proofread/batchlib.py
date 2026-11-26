"""Message Batches helpers shared by proofread3.py and opus_review.py.

submit -> poll until ended -> collect results keyed by custom_id. Batch ids are
recorded in $MALD_WORK/batches.json so an interrupted run can be resumed with
`<script> collect BATCH_ID`.
"""
import json
import os
import sys
import time

from config import CFG

# Batch prices, $ per million tokens (half the standard rate). Opus 5.5: $4/$20; Sonnet 5.5: $2/$10.
PRICE_BATCH = {"claude-sonnet-5-5": (1.0, 5.0), "claude-opus-5-5": (2.0, 10.0), "claude-haiku-5-5": (0.05, 0.25)}
MAX_BATCH_BYTES = 200 * 1024 * 1024        # stay under the 256 MB batch limit


def client():
    if not os.environ.get("ANTHROPIC_API_KEY") and not os.environ.get("ANTHROPIC_AUTH_TOKEN"):
        sys.exit("ANTHROPIC_API_KEY is not set (use --dry-run to build requests without calling the API)")
    import anthropic
    return anthropic.Anthropic()


def _registry():
    os.makedirs(CFG.work, exist_ok=True)
    return os.path.join(CFG.work, "batches.json")


def record(batch_id, info):
    p = _registry()
    d = json.load(open(p)) if os.path.exists(p) else {}
    d[batch_id] = info
    json.dump(d, open(p, "w"), indent=1)


def chunks(requests):
    """Split requests into batches under MAX_BATCH_BYTES."""
    cur, size = [], 0
    for r in requests:
        n = len(json.dumps(r))
        if cur and size + n > MAX_BATCH_BYTES:
            yield cur; cur, size = [], 0
        cur.append(r); size += n
    if cur:
        yield cur


def submit(requests, kind):
    c = client()
    ids = []
    for part in chunks(requests):
        b = c.messages.batches.create(requests=part)
        record(b.id, {"kind": kind, "custom_ids": [r["custom_id"] for r in part], "created": time.strftime("%Y-%m-%d %H:%M:%S")})
        print(f"submitted batch {b.id} ({len(part)} requests, {sum(len(json.dumps(r)) for r in part) / 1e6:.1f} MB)")
        ids.append(b.id)
    return ids


def wait(batch_ids, every=60):
    c = client()
    pending = list(batch_ids)
    while pending:
        for bid in list(pending):
            b = c.messages.batches.retrieve(bid)
            rc = b.request_counts
            print(f"  {bid}: {b.processing_status} (processing {rc.processing}, succeeded {rc.succeeded}, errored {rc.errored})", flush=True)
            if b.processing_status == "ended":
                pending.remove(bid)
        if pending:
            time.sleep(every)


def results(batch_id):
    """Yield (custom_id, dict) for each result: {"ok", "stop", "text", "in", "out", "error"}."""
    c = client()
    for r in c.messages.batches.results(batch_id):
        if r.result.type != "succeeded":
            yield r.custom_id, {"ok": False, "error": r.result.type}
            continue
        m = r.result.message
        txt = next((x.text for x in m.content if x.type == "text"), "")
        yield r.custom_id, {"ok": True, "stop": m.stop_reason, "text": txt, "in": m.usage.input_tokens,
                            "out": m.usage.output_tokens, "model": m.model}


def cost(model, tin, tout):
    pi, po = PRICE_BATCH.get(model, (2.0, 10.0))
    return tin / 1e6 * pi + tout / 1e6 * po


def image_tokens(w, h):
    """Approximate image tokens (about one token per 750 pixels after the 2576 px / 3.75 MP cap)."""
    s = min(1.0, 2576 / max(w, h), (3.75e6 / (w * h)) ** 0.5)
    return int(w * s * h * s / 750)

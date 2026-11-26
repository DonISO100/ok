# Maldonatus v3 run: status notes (start 15:32, Nov 26)
Spend by batch (list prices, batch API):
- run1 pages 0032,0065,0063: first batch ~$0.25 + retry 0063 $0.14 = $0.39
- run2 pages 0036,0050,0058,0100: $0.26 + retry (0050,0058) $0.19 = $0.44
- opus review: $0.40 (160 flags) + $3.09 (1309 flags) = $3.49
- rerun 0032,0036,0065,0100 (batch msgbatch_01FCtAbWQmuzpQtBSZ4xSoFV, submitted 16:12): pending collect
Running total before that rerun: $4.32.
Fixes in working tree: proofread3.validate (cross-column paragraphs, notes, body paragraph coverage), adapt3.to_blocks (cross-column paragraphs split per column), prompt wording.
Rules: do NOT resubmit anything in batches.json; use `collect <id>`.
Next: collect 01FCt..., merge, (maybe Opus review of new flags), rebuild, screenshots, commit/push, zip -> Drive.
- collected 01FCt..: --.36; 0032,0065,0100 ok, 0036 INCOMPLETE (empty normalized). 0050 revalidated ok with fixed validator (no spend). Running total .68
- retry batch for 0036 submitted: ['msgbatch_01YbLUMXSDR6462RUHA8AoN5'] (est $0.12)
- retry 0036 collected: cost $0.13, bad=False. Total $4.81
- merged after 0036 retry; total spend $4.81; Opus on new flags NOT run (budget guidance)
- hunspell reinstalled (box restored), merge rerun OK
- screenshots done in /workspace/maldonatus-screens-v3 (0050 dip+norm, 0036 greek, 0032 and 0063 dense); spot-check 0020,0032,0036,0050,0063,0080,0100 no JS errors

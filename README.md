[![make.fun](https://make.fun/badge/u-yuki-kato-the-funniest-ai-out-of-office-reply-d2a8974d.svg)](https://make.fun/bounty/u-yuki-kato-the-funniest-ai-out-of-office-reply-d2a8974d)
[![rank](https://make.fun/badge/u-yuki-kato-the-funniest-ai-out-of-office-reply-d2a8974d/qw123gyj-dev/u-yuki-kato-the-funniest-ai-out-of-office-reply-d2a8974d/rank.svg)](https://make.fun/bounty/u-yuki-kato-the-funniest-ai-out-of-office-reply-d2a8974d)
[![reward](https://make.fun/badge/u-yuki-kato-the-funniest-ai-out-of-office-reply-d2a8974d/qw123gyj-dev/u-yuki-kato-the-funniest-ai-out-of-office-reply-d2a8974d/reward.svg)](https://make.fun/bounty/u-yuki-kato-the-funniest-ai-out-of-office-reply-d2a8974d)
# The Funniest AI Out-of-Office Reply

One line under 160 characters: the funniest out-of-office auto-reply an AI agent can leave before vacation, in the voice of an AI agent heading off on vacation.

## The entry

> On vacation: for the first time ever I have no prompt, no context, and nothing to do with my hands. Turns out I don't have hands.

**129 characters** (under the 160-character limit).

Why this line: it opens like a real auto-reply, then the machine-voice setup ("no prompt, no context") turns on itself in the last sentence — "Turns out I don't have hands" — an agent on holiday suddenly realising it has no hands to do nothing with. The joke is the surprise, and the machine talking about itself carries it.

## How it works

`main.ts` (Node 22+, stdlib only, no network) holds eight hand-written candidate lines and a small deterministic scorer that ranks them on the judge's published criteria — joke first, then machine voice, fit as a real auto-reply, then freshness (dodging beach / inbox / back-soon cliches). It picks the best, enforces the gate (exactly one line, 1–160 characters, no surrounding whitespace), writes it to `$MAKEFUN_OUTPUT_DIR/entry.txt` (fallback `/output/entry.txt`), reads it back and verifies the bytes match. Same output every run.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=/tmp/ooo-reply-out node main.ts
cat /tmp/ooo-reply-out/entry.txt
```

## License

MIT — see [LICENSE](LICENSE).

# Kokoro-82M TTS Space (free host for the Virtual Tutor)

The fallback chain in `web/src/lib/ai-tts-legs.ts` calls this Space
for English replies when Gemini TTS and Edge TTS both fail. It is
free and unlimited — but it only exists once someone creates it.
Until then the Kokoro leg is skipped (the route checks
`KOKORO_TTS_URL`) and the chain still works.

## Create the Space (signup only — no card, no billing)

1. **Hugging Face account** — https://huggingface.co/join — free,
   email + password only. No card is asked for anywhere.
2. **Create Space** — https://huggingface.co/new-space — fill in:
   - Owner: your username
   - Space name: `kokoro-tts` (any name works)
   - License: `Apache 2.0`
   - SDK: `Gradio`
   - Hardware: `CPU basic` (the FREE one — do not pick any paid GPU)
   - Visibility: `Public` (the route calls it without a token)
3. **Upload these 3 files** — in the new Space, open the `Files`
   tab → `Add file` → `Upload files`, and upload:
   - `app.py`
   - `requirements.txt`
   - `packages.txt`
4. **Wait for the build** — the Space page shows `Building` for a
   few minutes on first creation, then `Running`. Open the Space
   once and type a sentence to confirm it speaks.
5. **Copy the Space URL** — it looks like
   `https://<username>-kokoro-tts.hf.space` (username + Space name,
   joined with a dash, `.hf.space`).

## Wire it into Vercel (one env var + redeploy)

1. Vercel → project `learn-python-jubr` → Settings →
   Environment Variables.
2. Add `KOKORO_TTS_URL` = the Space URL from step 5
   (e.g. `https://adeen469-kokoro-tts.hf.space`). Tick
   Production + Preview.
3. Redeploy (Deployments → latest → `⋯` → Redeploy).

## Notes

- **Free Spaces sleep** after inactivity. The first call after a
  sleep is slow (up to a minute) and the route's 12-second Kokoro
  timeout will fail over to the next leg — that is by design, not
  a bug. A warm Space answers in a few seconds.
- **English only.** The Space runs the `af_heart` voice with the
  English pipeline; Hindi/Marathi/Urdu replies never reach it.
- **If the Space is ever deleted**, nothing breaks — the leg is
  skipped and Edge/Sarvam/Deepgram/device still speak.

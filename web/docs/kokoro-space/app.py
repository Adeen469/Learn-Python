# Free Kokoro-82M TTS host for the Learn-Python Virtual Tutor.
#
# Runs on a free CPU Hugging Face Space — no key, no billing, no
# card. The /api/ai/tts route calls /generate_first on this Space
# and downloads the returned WAV file. English only (the af_heart
# voice); Hindi/Urdu replies never reach this leg.
#
# Files to upload to the Space: app.py, requirements.txt,
# packages.txt (this folder). See README.md for the exact steps.

import gradio as gr
from kokoro import KModel, KPipeline

model = KModel().to("cpu").eval()
pipeline = KPipeline(lang_code="a", model=model)


def generate_first(text, voice="af_heart", speed=1, lang="en-us"):
    text = (text or "").strip()[:1000]
    if not text:
        raise gr.Error("Text is required")
    pack = pipeline.load_voice(voice)
    audio = None
    for _, ps, _ in pipeline(text, voice, speed):
        ref_s = pack[len(ps) - 1]
        audio = model(ps, ref_s, speed)
    if audio is None:
        raise gr.Error("No audio generated")
    return (24000, audio.numpy())


demo = gr.Interface(
    fn=generate_first,
    inputs=[
        gr.Textbox(label="Input Text"),
        gr.Dropdown(
            choices=["af_heart", "af_bella", "af_nicole", "am_adam", "bf_emma", "bm_george"],
            value="af_heart",
            label="Voice",
        ),
        gr.Slider(0.5, 2, value=1, label="Speed"),
    ],
    outputs=gr.Audio(label="Audio"),
    title="Learn-Python Tutor Voice (Kokoro-82M)",
    api_name="generate_first",
)
demo.launch()

from huggingface_hub import InferenceClient
import os

client = InferenceClient(
    model="sshleifer/distilbart-cnn-12-6",
    token=os.getenv("HF_TOKEN")
)

res = client.summarization(
    text="The quiet park suddenly came alive as the evening breeze carried the sound of laughter and music through the trees."
)

print(res)
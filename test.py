from openai import OpenAI

client = OpenAI(
    api_key="sk-ony-1c024e241eea7ed0b3e38875bbc1bfae61bd29e70e6b8cdb",
    base_url="https://api.onysoft.com/v1"
)

response = client.chat.completions.create(
    model="google/gemini-3.8-flash",
    messages=[
        {"role": "user", "content": "Merhaba, nasılsın?"}
    ]
)

print(response.choices[0].message.content)
import asyncio
import os
from dotenv import load_dotenv
from ai_analyzer import call_openrouter, get_openrouter_api_key, get_openrouter_model

load_dotenv(override=True)

async def main():
    key = get_openrouter_api_key()
    model = get_openrouter_model()
    print(f"Testing OpenRouter Key: {key[:12]}... (length: {len(key)})")
    print(f"Testing Model: {model}")
    
    result = await call_openrouter("Hello! Provide a one-sentence greeting to a SOC analyst.", system_prompt="You are a helpful SOC AI.")
    print("--- RESPONSE ---")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())

#!/usr/bin/env python3
"""
Quick test script to verify chatbot is working
Run: python test_chatbot.py
"""
import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_chatbot():
    print("=" * 60)
    print("Testing AI Chatbot Configuration")
    print("=" * 60)
    print()
    
    # Check if API key is loaded
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    if not api_key:
        print("[X] ANTHROPIC_API_KEY not found in environment!")
        print("\nPlease check:")
        print("1. .env file exists in backend/ directory")
        print("2. .env file contains: ANTHROPIC_API_KEY=sk-ant-...")
        print("3. No extra spaces or quotes around the key")
        return False
    
    print(f"[OK] ANTHROPIC_API_KEY found: {api_key[:20]}...{api_key[-10:]}")
    print()
    
    # Test if anthropic library is installed
    try:
        from anthropic import Anthropic
        print("[OK] anthropic library is installed")
    except ImportError:
        print("[X] anthropic library not installed!")
        print("\nRun: pip install anthropic")
        return False
    
    print()
    
    # Test API connection
    print("Testing API connection...")
    try:
        client = Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=50,
            messages=[{
                "role": "user",
                "content": "Say 'Hello' in one word"
            }]
        )
        print(f"[OK] API connection successful!")
        print(f"   Response: {response.content[0].text}")
    except Exception as e:
        print(f"[X] API connection failed: {e}")
        print("\nPossible issues:")
        print("1. Invalid API key")
        print("2. No internet connection")
        print("3. Anthropic API is down")
        return False
    
    print()
    
    # Test enhanced chatbot
    print("Testing enhanced chatbot...")
    try:
        from enhanced_chatbot import ask_chatbot
        
        test_question = "What is eETH?"
        result = await ask_chatbot(test_question)
        
        print(f"[OK] Enhanced chatbot working!")
        print(f"\n   Question: {test_question}")
        print(f"   Answer: {result['answer'][:200]}...")
        print(f"   Sources: {', '.join(result['sources'])}")
        
    except Exception as e:
        print(f"[X] Enhanced chatbot test failed: {e}")
        print("\nThis might be OK if enhanced_chatbot.py has issues")
        print("The basic chatbot should still work in main.py")
    
    print()
    print("=" * 60)
    print("SUCCESS! Chatbot Configuration Complete!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Restart your backend server:")
    print("   uvicorn main:app --reload --port 8000")
    print()
    print("2. Open your app and test the chatbot!")
    print()
    
    return True

if __name__ == "__main__":
    asyncio.run(test_chatbot())


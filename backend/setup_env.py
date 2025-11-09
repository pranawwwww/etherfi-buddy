#!/usr/bin/env python3
"""
Quick setup script for creating .env file with API key
Run: python setup_env.py
"""
import os

def setup_env():
    print("=" * 60)
    print("AI Chatbot Setup - Anthropic API Key Configuration")
    print("=" * 60)
    print()
    
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    if os.path.exists(env_path):
        print("⚠️  .env file already exists!")
        response = input("Do you want to update it? (y/N): ").strip().lower()
        if response != 'y':
            print("Setup cancelled.")
            return
    
    print("\nTo get your API key:")
    print("1. Go to: https://console.anthropic.com/")
    print("2. Sign up or log in")
    print("3. Navigate to API Keys section")
    print("4. Create a new API key")
    print("5. Copy the key (starts with 'sk-ant-')")
    print()
    
    api_key = input("Paste your Anthropic API key here: ").strip()
    
    if not api_key:
        print("❌ No API key provided. Setup cancelled.")
        return
    
    if not api_key.startswith('sk-ant-'):
        print("⚠️  Warning: API key should start with 'sk-ant-'")
        response = input("Continue anyway? (y/N): ").strip().lower()
        if response != 'y':
            print("Setup cancelled.")
            return
    
    # Create .env file
    env_content = f"""# Anthropic API Key for Claude AI Chatbot
ANTHROPIC_API_KEY={api_key}

# Application Settings
APP_ORIGIN=http://localhost:8080
DEFAULT_APY_STAKE=0.04
DEFAULT_APY_LIQUID_USD=0.10
DEFAULT_BORROW_RATE=0.05
DEFAULT_LTV_WEETH=0.50
FORECAST_MONTHS=12
"""
    
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print()
    print("✅ .env file created successfully!")
    print(f"📁 Location: {env_path}")
    print()
    print("Next steps:")
    print("1. Restart your backend server:")
    print("   uvicorn main:app --reload --port 8000")
    print()
    print("2. Open your app and click the chat bubble")
    print("3. Try asking: 'What's in my portfolio?'")
    print()
    print("🎉 Your AI chatbot is ready to use!")
    print()

if __name__ == "__main__":
    try:
        setup_env()
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user.")
    except Exception as e:
        print(f"\n❌ Error: {e}")


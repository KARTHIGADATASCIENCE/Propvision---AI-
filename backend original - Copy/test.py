import requests
import sys
import json

def test_gemini_key(api_key):
    # 1. Test Key Validity by Listing Models
    print("Checking key validity and available models...")
    list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    
    try:
        response = requests.get(list_url)
        response.raise_for_status()
        print("✅ Success! The Gemini API key is valid.")
        
        models = response.json().get('models', [])
        model_names = [m['name'] for m in models if 'generateContent' in m.get('supportedGenerationMethods', [])]
        print(f"Found {len(model_names)} capable models.")
        
        if not model_names:
            print("⚠️ No models found that support generateContent.")
            return True # Key is valid but no models?
            
        # Pick a model to test generation
        target_model = "models/gemini-1.5-flash"
        if target_model not in model_names:
            target_model = "models/gemini-pro"
            if target_model not in model_names:
                target_model = model_names[0] # Fallback to first available
        
        print(f"Testing generation with model: {target_model}")
        
        # 2. Test Generation
        gen_url = f"https://generativelanguage.googleapis.com/v1beta/{target_model}:generateContent?key={api_key}"
        headers = {
            "Content-Type": "application/json"
        }
        data = {
            "contents": [{
                "parts": [{"text": "Hello, verify this key works."}]
            }]
        }
        
        gen_response = requests.post(gen_url, headers=headers, json=data)
        gen_response.raise_for_status()
        print(f"✅ Generation successful with {target_model}!")
        print("Response snippet:", gen_response.json().get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', 'No text'))
        return True

    except requests.exceptions.HTTPError as e:
        print(f"❌ Failed to verify key. HTTP Error: {e}")
        try:
            print("Response:", response.json())
        except:
            print("Response:", response.text)
        return False
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        key = sys.argv[1]
    else:
        key = input("Enter your Gemini API Key: ").strip()
    
    if not key:
        print("Error: No API key provided.")
        sys.exit(1)
        
    test_gemini_key(key)

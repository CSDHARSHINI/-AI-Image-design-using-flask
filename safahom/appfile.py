from flask import Flask, render_template, request, jsonify
import os
from datetime import datetime
import base64
from io import BytesIO
from huggingface_hub import InferenceClient
from PIL import Image
import json
app = Flask(__name__)

# Configuration
HF_TOKEN = "hugging face token"  # Your token
HISTORY_FILE = "static/history.json"

# Initialize HF Inference Client
client = InferenceClient(
    api_key=HF_TOKEN,
)

# Ensure history file exists
os.makedirs("static", exist_ok=True)
if not os.path.exists(HISTORY_FILE):
    with open(HISTORY_FILE, 'w') as f:
        open(HISTORY_FILE, 'w').write('[]')

def save_to_history(prompt, image_data):
    """Save generation history"""
    try:
        with open(HISTORY_FILE, 'r') as f:
            history = json.load(f)
    except:
        history = []
    
    history_entry = {
        "prompt": prompt,
        "image": image_data,
        "timestamp": datetime.now().isoformat()
    }
    history.insert(0, history_entry)  # Most recent first
    
    # Keep only last 50 entries
    history = history[:50]
    
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_image():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        # Generate image using Hugging Face InferenceClient
        image = client.text_to_image(
            prompt,
            model="stabilityai/stable-diffusion-xl-base-1.0",
            num_inference_steps=20,
            guidance_scale=7.5
        )
        
        # Convert PIL Image to base64
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        # Save to history
        save_to_history(prompt, image_base64)
        
        return jsonify({
            'success': True,
            'image': f'data:image/png;base64,{image_base64}',
            'prompt': prompt
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/history')
def get_history():
    try:
        with open(HISTORY_FILE, 'r') as f:
            history = json.load(f)
        return jsonify(history)
    except:
        return jsonify([])

if __name__ == '__main__':
    app.run(debug=True, port=5000)

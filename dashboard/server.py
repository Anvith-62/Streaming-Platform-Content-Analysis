from flask import Flask, jsonify, request, send_from_directory
import os
import subprocess
import sys
import webbrowser
import threading
from pathlib import Path

app = Flask(__name__, static_folder='.', template_folder='.')

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "streaming_platform_sample.csv"
SRC_DIR = BASE_DIR / "src"

@app.route('/')
def home():
    return send_from_directory(os.path.dirname(__file__), 'index.html')

@app.route('/data/streaming_platform_sample.csv')
def serve_data():
    return send_from_directory(DATA_PATH.parent, DATA_PATH.name)

@app.route('/api/run-analysis', methods=['POST'])
def run_analysis_api():
    try:
        script_path = SRC_DIR / "analysis.py"
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            cwd=str(BASE_DIR)
        )
        return jsonify({
            "status": "success" if result.returncode == 0 else "error",
            "output": result.stdout,
            "error": result.stderr
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"status": "error", "error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "error": "No selected file"}), 400
    if file and file.filename.endswith('.csv'):
        DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        file.save(str(DATA_PATH))
        
        # Trigger analysis automatically
        script_path = SRC_DIR / "analysis.py"
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            cwd=str(BASE_DIR)
        )
        
        return jsonify({
            "status": "success",
            "message": "File uploaded and analyzed successfully!",
            "output": result.stdout,
            "error": result.stderr
        })
    else:
        return jsonify({"status": "error", "error": "Invalid file format. Please upload a CSV file."}), 400

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(os.path.dirname(__file__), path)

def open_browser():
    webbrowser.open_new("http://127.0.0.1:8000")

if __name__ == '__main__':
    # Start open_browser thread to launch browser after server is up
    threading.Timer(1.5, open_browser).start()
    app.run(port=8000, debug=True, use_reloader=False)

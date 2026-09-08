"""
StreamAnalytica - Streaming Platform Content Analysis
=====================================================
Single entry point: python app.py
- Runs the full data analysis pipeline
- Generates all charts and CSV outputs
- Starts the interactive web dashboard
- Auto-opens the browser
"""

import os
import sys
import subprocess
import threading
import webbrowser
from pathlib import Path

import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from flask import Flask, jsonify, request, Response

# ============================================================================
# PATHS
# ============================================================================
BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "streaming_platform_sample.csv"
OUTPUT_DIR = BASE_DIR / "outputs"
CHART_DIR = OUTPUT_DIR / "charts"
DASHBOARD_DIR = BASE_DIR / "dashboard"

# ============================================================================
# 1. DATA ANALYSIS PIPELINE
# ============================================================================

def load_data(path):
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")
    return pd.read_csv(path)


def clean_data(df):
    df = df.copy()
    fill_values = {
        "director": "Not Available",
        "cast": "Not Available",
        "country": "Unknown",
        "date_added": "Unknown",
        "rating": "Unknown",
        "duration": "Unknown",
        "listed_in": "Unknown",
        "description": "No Description"
    }
    for col, value in fill_values.items():
        if col in df.columns:
            df[col] = df[col].fillna(value)
    if "date_added" in df.columns:
        df["date_added"] = pd.to_datetime(df["date_added"], errors="coerce")
    return df


def save_bar_chart(series, title, xlabel, ylabel, filename):
    plt.figure(figsize=(9, 5))
    series.plot(kind="bar")
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.tight_layout()
    plt.savefig(CHART_DIR / filename, dpi=150)
    plt.close()


def run_analysis():
    """Run the full ETL pipeline: clean data, compute stats, generate charts."""
    OUTPUT_DIR.mkdir(exist_ok=True)
    CHART_DIR.mkdir(parents=True, exist_ok=True)

    df = load_data(DATA_PATH)
    df = clean_data(df)

    print("Dataset Preview:")
    print(df.head())

    print("\nDataset Information:")
    print(df.info())

    print("\nMissing Values:")
    print(df.isnull().sum())

    # Summary statistics
    summary = {
        "total_titles": len(df),
        "total_movies": int((df["type"] == "Movie").sum()),
        "total_tv_shows": int((df["type"] == "TV Show").sum()),
        "total_platforms": df["platform"].nunique() if "platform" in df.columns else "N/A",
        "total_countries": df["country"].nunique(),
        "top_platform": df["platform"].value_counts().idxmax() if "platform" in df.columns else "N/A",
        "top_country": df["country"].value_counts().idxmax(),
        "top_rating": df["rating"].value_counts().idxmax(),
    }
    summary_df = pd.DataFrame([summary])
    summary_df.to_csv(OUTPUT_DIR / "summary_statistics.csv", index=False)
    print("\nSummary Statistics:")
    print(summary_df)

    # CSV outputs
    df["type"].value_counts().to_csv(OUTPUT_DIR / "content_type_count.csv")
    df["country"].value_counts().head(10).to_csv(OUTPUT_DIR / "top_countries.csv")
    df["rating"].value_counts().to_csv(OUTPUT_DIR / "rating_distribution.csv")
    df["release_year"].value_counts().sort_index().to_csv(OUTPUT_DIR / "release_year_trend.csv")

    genre_df = df.assign(genre=df["listed_in"].str.split(", ")).explode("genre")
    genre_df["genre"].value_counts().head(10).to_csv(OUTPUT_DIR / "top_genres.csv")

    # Charts
    save_bar_chart(df["type"].value_counts(), "Movies vs TV Shows", "Content Type", "Count", "movies_vs_tvshows.png")
    save_bar_chart(df["platform"].value_counts(), "Content Count by Platform", "Platform", "Count", "platform_count.png")
    save_bar_chart(df["country"].value_counts().head(10), "Top 10 Countries by Content", "Country", "Count", "top_countries.png")
    save_bar_chart(df["rating"].value_counts(), "Rating Distribution", "Rating", "Count", "rating_distribution.png")
    save_bar_chart(df["release_year"].value_counts().sort_index(), "Release Year Trend", "Release Year", "Count", "release_year_trend.png")
    save_bar_chart(genre_df["genre"].value_counts().head(10), "Top 10 Genres", "Genre", "Count", "top_genres.png")

    print("\nAnalysis completed successfully.")
    print(f"Outputs saved in: {OUTPUT_DIR}")


# ============================================================================
# 2. FLASK WEB DASHBOARD
# ============================================================================

app = Flask(__name__)


@app.route('/')
def home():
    return send_dashboard_file('index.html')


@app.route('/data/streaming_platform_sample.csv')
def serve_csv():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    return Response(content, mimetype='text/csv')


@app.route('/api/run-analysis', methods=['POST'])
def api_run_analysis():
    try:
        result = subprocess.run(
            [sys.executable, str(BASE_DIR / "src" / "analysis.py")],
            capture_output=True, text=True, cwd=str(BASE_DIR)
        )
        return jsonify({
            "status": "success" if result.returncode == 0 else "error",
            "output": result.stdout,
            "error": result.stderr
        })
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500


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
        result = subprocess.run(
            [sys.executable, str(BASE_DIR / "src" / "analysis.py")],
            capture_output=True, text=True, cwd=str(BASE_DIR)
        )
        return jsonify({
            "status": "success",
            "message": "File uploaded and analyzed!",
            "output": result.stdout,
            "error": result.stderr
        })
    return jsonify({"status": "error", "error": "Invalid file. Upload a .csv file."}), 400


@app.route('/<path:path>')
def serve_static(path):
    return send_dashboard_file(path)


def send_dashboard_file(filename):
    """Serve files from the dashboard/ folder."""
    filepath = DASHBOARD_DIR / filename
    if not filepath.exists():
        return Response("File not found", status=404)

    ext = filepath.suffix.lower()
    mime_types = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.json': 'application/json',
    }
    mimetype = mime_types.get(ext, 'application/octet-stream')

    with open(filepath, 'rb') as f:
        content = f.read()
    return Response(content, mimetype=mimetype)


# ============================================================================
# 3. MAIN ENTRY POINT
# ============================================================================

def open_browser():
    webbrowser.open("http://127.0.0.1:8000")


if __name__ == '__main__':
    print("=" * 60)
    print("  StreamAnalytica - Streaming Platform Content Analysis")
    print("=" * 60)
    print()

    # Step 1: Run analysis
    print("[1/2] Running data analysis pipeline...")
    print("-" * 40)
    try:
        run_analysis()
    except Exception as e:
        print(f"WARNING: Analysis encountered an issue: {e}")
    print()

    # Step 2: Launch dashboard
    print("[2/2] Starting interactive dashboard...")
    print("-" * 40)
    print("Dashboard URL: http://127.0.0.1:8000")
    print("Press CTRL+C to stop the server.")
    print()

    threading.Timer(1.5, open_browser).start()
    app.run(port=8000, debug=False)

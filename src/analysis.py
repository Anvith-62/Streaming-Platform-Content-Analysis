"""
Streaming Platform Analysis Project

Run:
    python src/analysis.py

This script reads the dataset, cleans it, performs analysis,
generates charts, and saves summary outputs.
"""

from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "data" / "streaming_platform_sample.csv"
OUTPUT_DIR = BASE_DIR / "outputs"
CHART_DIR = OUTPUT_DIR / "charts"


def load_data(path: Path) -> pd.DataFrame:
    """Load CSV dataset."""
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")
    return pd.read_csv(path)


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean missing values and convert date columns."""
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
    """Save a bar chart."""
    plt.figure(figsize=(9, 5))
    series.plot(kind="bar")
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.tight_layout()
    plt.savefig(CHART_DIR / filename, dpi=150)
    plt.close()


def run_analysis():
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
        "total_platforms": df["platform"].nunique() if "platform" in df.columns else "Not Available",
        "total_countries": df["country"].nunique(),
        "top_platform": df["platform"].value_counts().idxmax() if "platform" in df.columns else "Not Available",
        "top_country": df["country"].value_counts().idxmax(),
        "top_rating": df["rating"].value_counts().idxmax(),
    }

    summary_df = pd.DataFrame([summary])
    summary_df.to_csv(OUTPUT_DIR / "summary_statistics.csv", index=False)

    print("\nSummary Statistics:")
    print(summary_df)

    # Analysis outputs
    df["type"].value_counts().to_csv(OUTPUT_DIR / "content_type_count.csv")
    df["country"].value_counts().head(10).to_csv(OUTPUT_DIR / "top_countries.csv")
    df["rating"].value_counts().to_csv(OUTPUT_DIR / "rating_distribution.csv")
    df["release_year"].value_counts().sort_index().to_csv(OUTPUT_DIR / "release_year_trend.csv")

    # Genre analysis
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


if __name__ == "__main__":
    run_analysis()

# Streaming Platform Content Analysis Project

## Project Title
**Streaming Platform Content Analysis** — Interactive Data Dashboard

## Objective
This project analyzes movies and TV shows available on streaming platforms such as Netflix, Amazon Prime, and Disney+.
It provides a **premium interactive web dashboard** that visualizes platform content distribution, genre popularity, country contribution, rating categories, and yearly release trends — all with real-time filtering and a live Python ETL pipeline runner.

---

## Folder Structure

```text
streaming_platform_analysis_project/
│
├── data/
│   └── streaming_platform_sample.csv          ← Dataset (40 titles across 3 platforms)
│
├── src/
│   ├── analysis.py                             ← Core Python ETL & chart generator
│   └── dashboard_questions.py                 ← Business questions reference list
│
├── dashboard/                                 ← Interactive Web Dashboard
│   ├── index.html                             ← Single-page dashboard layout
│   ├── styles.css                             ← Dark glassmorphism design system
│   ├── app.js                                 ← Frontend Chart.js + CSV data controller
│   └── server.py                              ← Flask server (APIs + static file serving)
│
├── outputs/
│   ├── summary_statistics.csv                 ← Generated summary stats
│   ├── top_genres.csv                         ← Top genre counts
│   └── charts/
│       ├── movies_vs_tvshows.png
│       ├── platform_count.png
│       ├── rating_distribution.png
│       ├── release_year_trend.png
│       ├── top_countries.png
│       └── top_genres.png
│
├── report/
│   └── Streaming_Platform_Analysis_Report.md  ← Full written analysis report
│
├── notebooks/
│   └── streaming_platform_analysis.ipynb      ← Jupyter Notebook (with outputs)
│
├── requirements.txt
└── README.md
```

---

## Tools & Technologies Used

| Tool | Purpose |
|---|---|
| Python 3 | Core data processing and script execution |
| Pandas | Data loading, cleaning, and tabular analysis |
| Matplotlib / Seaborn | Static chart generation |
| Flask | Backend server for the interactive dashboard |
| Chart.js | Interactive browser-side chart rendering |
| PapaParse | In-browser CSV parsing |
| HTML5 / CSS3 / JavaScript | Frontend dashboard (no frameworks, vanilla) |
| Jupyter Notebook | Exploratory analysis with inline outputs |

---

## How to Run

### Step 1: Install required libraries

```bash
pip install -r requirements.txt
```

### Step 2A: Run the Python Analysis Script

Generates all chart PNGs and CSV summaries inside the `outputs/` folder.

```bash
python src/analysis.py
```

### Step 2B: Launch the Interactive Web Dashboard ⭐

```bash
python dashboard/server.py
```

Then open your browser to: **http://127.0.0.1:8000**

The dashboard will launch automatically in your default browser.

---

## Interactive Dashboard Features

The web dashboard (`dashboard/`) is the primary way to explore this project:

| Feature | Description |
|---|---|
| **KPI Summary Cards** | Total titles, Movies count, TV Shows count, Countries represented |
| **Platform Filter** | Instantly filter ALL charts & stats by Netflix / Amazon Prime / Disney+ |
| **Release Year Trend** | Line chart showing content growth trajectory over time |
| **Content Mix Chart** | Donut chart showing Movies vs TV Show percentage split |
| **Top Genres Chart** | Bar chart of the 8 most common content categories |
| **Top Countries Chart** | Horizontal bar chart of leading content-producing nations |
| **Rating Distribution** | Polar area chart of age rating category breakdown |
| **Q&A Insights Accordion** | 10 key analytical & business questions answered with live data |
| **Data Explorer Table** | Searchable, paginated, filterable full content library table |
| **CSV Upload** | Drag-and-drop a new dataset — auto-triggers full re-analysis |
| **Live ETL Pipeline** | Run `analysis.py` from the browser with live terminal output |

---

## Main Analysis Questions Answered

1. How many total titles are available?
2. How many Movies and TV Shows are available?
3. Which streaming platform has the highest number of titles?
4. Which country produces the most streaming content?
5. Which genres are most common?
6. Which age rating has the most titles?
7. How did content releases change year by year?
8. Which platform has more family-friendly content?
9. Which platform has more thriller or drama content?
10. What business insights can be taken from the content library?

---

## Key Findings (Sample Dataset)

- **40 total titles** across Netflix (15), Amazon Prime (13), and Disney+ (12)
- **Movies dominate** at 72.5% — only 27.5% are TV Shows
- **India and the United States** are the top content-producing countries
- **Drama, Family, and Thriller** are the most prevalent genres
- **TV-14** is the most common age rating, followed by TV-PG and PG
- **2023–2024** saw the highest volume of content additions, reflecting OTT platform expansion
- **Disney+** leads family-friendly content (G/PG/TV-G ratings)
- **Netflix and Amazon Prime** carry the bulk of Drama & Thriller genres

---

## Dataset Note

The included dataset is a curated 40-title sample. To run a full-scale analysis:

1. Download one of the following from Kaggle:
   - [Netflix Movies and TV Shows](https://www.kaggle.com/datasets/shivamb/netflix-shows)
   - [Amazon Prime Movies and TV Shows](https://www.kaggle.com/datasets/shivamb/amazon-prime-movies-and-tv-shows)
   - [Disney+ Movies and TV Shows](https://www.kaggle.com/datasets/shivamb/disney-movies-and-tv-shows)
2. Add a `platform` column and combine them
3. Replace `data/streaming_platform_sample.csv` with your merged file
4. Use the **CSV Upload** feature in the dashboard, OR re-run `python src/analysis.py`

---

## Future Scope

- Full Kaggle multi-platform merged datasets
- User review and sentiment analysis
- ML model to predict content popularity / success
- Power BI or Tableau dashboard export
- Recommendation engine based on genre and rating preferences

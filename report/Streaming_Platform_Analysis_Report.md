# Streaming Platform Content Analysis Report

## 1. Abstract

Streaming platforms have become one of the most popular sources of entertainment. They provide movies, TV shows, documentaries, animated content, educational content, and many other categories. This project analyzes content from multiple streaming platforms and identifies useful trends such as platform-wise content count, content type distribution, country-wise contribution, popular genres, rating categories, and release year trends.

## 2. Introduction

Data analytics is useful for understanding content libraries on OTT platforms. By analyzing streaming platform data, we can understand what type of content is more available, which countries produce more content, and what genres are most common. This type of analysis can help streaming companies make better content decisions and help users understand content variety.

## 3. Problem Statement

Streaming platforms contain thousands of movies and TV shows. It becomes difficult to manually understand what type of content is available and how the content is distributed across platforms, genres, countries, and years. This project solves that problem by analyzing streaming platform data using Python.

## 4. Objectives

- To analyze Movies and TV Shows count.
- To compare content across streaming platforms.
- To identify top countries producing content.
- To find the most popular genres.
- To analyze rating distribution.
- To study release year trends.
- To generate useful visualizations.
- To provide business insights from the dataset.

## 5. Dataset Description

The dataset contains the following columns:

| Column | Description |
|---|---|
| show_id | Unique ID of each title |
| platform | Streaming platform name |
| type | Movie or TV Show |
| title | Name of the title |
| director | Director name |
| cast | Main cast |
| country | Country of production |
| date_added | Date when title was added |
| release_year | Year of release |
| rating | Age rating |
| duration | Duration or number of seasons |
| listed_in | Genre/category |
| description | Short description |

## 6. Tools and Technologies Used

- Python
- Pandas
- Matplotlib
- CSV Dataset
- Visual Studio Code / Jupyter Notebook

## 7. Data Cleaning

Data cleaning was performed to handle missing values. Missing director, cast, country, rating, duration, genre, and description values were filled with suitable default values such as `Not Available`, `Unknown`, or `No Description`.

## 8. Exploratory Data Analysis

The project performs the following analysis:

### 8.1 Movies vs TV Shows
This analysis identifies whether the dataset contains more movies or TV shows.

### 8.2 Platform-wise Content Count
This analysis compares content available on platforms such as Netflix, Amazon Prime, and Disney+.

### 8.3 Country-wise Content Count
This analysis identifies countries that produce the highest number of titles.

### 8.4 Genre Analysis
This analysis identifies the most common genres in the dataset.

### 8.5 Rating Analysis
This analysis identifies which age rating category has the highest number of titles.

### 8.6 Release Year Trend
This analysis studies how content releases changed across different years.

## 9. Visualizations

The project generates these charts:

- Movies vs TV Shows
- Content Count by Platform
- Top 10 Countries by Content
- Rating Distribution
- Release Year Trend
- Top 10 Genres

## 10. Findings

Based on the sample dataset:

- Movies are more common than TV Shows.
- Netflix, Amazon Prime, and Disney+ all contain different content categories.
- India and the United States are major content-producing countries in the dataset.
- Drama, Family, Thriller, Adventure, and Comedy are common genres.
- TV-14, TV-PG, PG, and G ratings are commonly found.
- Recent years show more streaming content compared to older years.

## 11. Business Insights

- Streaming platforms can invest more in popular genres such as drama, family, thriller, and adventure.
- Platforms can increase regional content to attract local audiences.
- Family-friendly content can help platforms target children and family audiences.
- Thriller and drama content can be useful for adult audience engagement.
- Yearly trend analysis can help platforms plan future content acquisition.

## 12. Conclusion

This project demonstrates how data analytics can be used to understand streaming platform content. By using Python, Pandas, and Matplotlib, the dataset was cleaned, analyzed, and visualized. The analysis provides useful insights into content type, platform distribution, country contribution, genre popularity, rating categories, and release trends.

## 13. Future Scope

This project can be improved by adding:

- Full Kaggle datasets for Netflix, Amazon Prime, Disney+, and Hulu.
- User ratings and review analysis.
- Sentiment analysis.
- Recommendation system.
- Machine learning model to predict content popularity.
- Power BI dashboard.

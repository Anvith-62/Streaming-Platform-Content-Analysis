"""
Dashboard Question Guide

Use these questions while creating charts in Power BI, Excel, or Python.
"""

questions = [
    "How many total titles are available?",
    "How many Movies and TV Shows are available?",
    "Which streaming platform has the highest number of titles?",
    "Which country produces the most streaming content?",
    "Which genres are most common?",
    "Which age rating has the most titles?",
    "How did content releases change year by year?",
    "Which platform has more family-friendly content?",
    "Which platform has more thriller or drama content?",
    "What business insights can be taken from the content library?"
]

for index, question in enumerate(questions, start=1):
    print(f"{index}. {question}")

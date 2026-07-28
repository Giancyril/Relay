"""
Unit tests for customer sentiment and urgency classifier in rag_service.py.
"""

from app.services.rag_service import analyze_sentiment_and_urgency


def test_frustrated_urgent_query():
    sentiment, urgency = analyze_sentiment_and_urgency("My account is broken and I am locked out ASAP!")
    assert sentiment == "frustrated"
    assert urgency == "high"


def test_frustrated_only_query():
    sentiment, urgency = analyze_sentiment_and_urgency("This service is terrible and useless.")
    assert sentiment == "frustrated"
    assert urgency == "medium"


def test_urgent_only_query():
    sentiment, urgency = analyze_sentiment_and_urgency("Need emergency help with login!")
    assert sentiment == "urgent"
    assert urgency == "high"


def test_inquiring_query():
    sentiment, urgency = analyze_sentiment_and_urgency("What payment methods do you accept?")
    assert sentiment == "inquiring"
    assert urgency == "low"


def test_neutral_query():
    sentiment, urgency = analyze_sentiment_and_urgency("Hello there")
    assert sentiment == "neutral"
    assert urgency == "low"

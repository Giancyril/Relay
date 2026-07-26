"""
Unit tests for app/api/router.py analytics and filtered escalation endpoints.

Tests cover:
  - GET /analytics/summary with empty log file
  - GET /analytics/summary with records
  - GET /escalations filtering by search query
  - GET /escalations filtering by trigger_type ('distance' vs 'llm')
"""

import json
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient


class TestAnalyticsEndpoints:

    def test_analytics_summary_empty_file(self, client: TestClient, tmp_path):
        with patch("app.api.router.escalation_logger._log_path", str(tmp_path / "non_existent.jsonl")):
            response = client.get("/analytics/summary")
            assert response.status_code == 200
            data = response.json()
            assert data["total_escalations"] == 0
            assert data["distance_triggered_count"] == 0
            assert data["llm_triggered_count"] == 0
            assert data["avg_confidence_score"] == 0.0

    def test_analytics_summary_with_records(self, client: TestClient, tmp_path):
        log_file = str(tmp_path / "test_esc_summary.jsonl")
        with open(log_file, "w", encoding="utf-8") as f:
            f.write(json.dumps({
                "timestamp": "2026-07-26T00:00:00Z",
                "question": "What is the return window?",
                "top_distance": 0.8,
                "confidence_score": 0.2,
                "answer_preview": "A1",
                "distance_triggered": True,
                "llm_triggered": False
            }) + "\n")
            f.write(json.dumps({
                "timestamp": "2026-07-26T00:01:00Z",
                "question": "Do you ship to Mars?",
                "top_distance": 0.6,
                "confidence_score": 0.4,
                "answer_preview": "A2",
                "distance_triggered": False,
                "llm_triggered": True
            }) + "\n")

        with patch("app.api.router.escalation_logger._log_path", log_file):
            response = client.get("/analytics/summary")
            assert response.status_code == 200
            data = response.json()
            assert data["total_escalations"] == 2
            assert data["distance_triggered_count"] == 1
            assert data["llm_triggered_count"] == 1
            assert data["avg_confidence_score"] == pytest.approx(0.3, abs=1e-4)

    def test_escalations_filtered_by_search_and_trigger_type(self, client: TestClient, tmp_path):
        log_file = str(tmp_path / "test_esc_filters.jsonl")
        with open(log_file, "w", encoding="utf-8") as f:
            f.write(json.dumps({
                "timestamp": "2026-07-26T00:00:00Z",
                "question": "How to handle returns?",
                "top_distance": 0.9,
                "confidence_score": 0.1,
                "answer_preview": "A1",
                "distance_triggered": True,
                "llm_triggered": False
            }) + "\n")
            f.write(json.dumps({
                "timestamp": "2026-07-26T00:01:00Z",
                "question": "Where is my order refund?",
                "top_distance": 0.7,
                "confidence_score": 0.3,
                "answer_preview": "A2",
                "distance_triggered": False,
                "llm_triggered": True
            }) + "\n")

        with patch("app.api.router.escalation_logger._log_path", log_file):
            # Test search query filter
            resp_search = client.get("/escalations?search=refund")
            assert resp_search.status_code == 200
            data_search = resp_search.json()
            assert data_search["total"] == 1
            assert "refund" in data_search["records"][0]["question"]

            # Test trigger_type=distance filter
            resp_dist = client.get("/escalations?trigger_type=distance")
            assert resp_dist.status_code == 200
            data_dist = resp_dist.json()
            assert data_dist["total"] == 1
            assert data_dist["records"][0]["distance_triggered"] is True

            # Test trigger_type=llm filter
            resp_llm = client.get("/escalations?trigger_type=llm")
            assert resp_llm.status_code == 200
            data_llm = resp_llm.json()
            assert data_llm["total"] == 1
            assert data_llm["records"][0]["llm_triggered"] is True

from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app.api import parse as parse_api
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def override_auth_dependency():
    app.dependency_overrides[parse_api.get_current_user] = lambda: SimpleNamespace(id=1, username="testuser")
    yield
    app.dependency_overrides.clear()


def test_parse_text_endpoint_includes_explanation_field():
    response = client.post(
        "/api/parse/text",
        json={
            "text": """Question 1
What is 2 + 2?
A. 3
B. 4
C. 5
D. 6
Answer: B
Explanation: Because 2 + 2 equals 4.
"""
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["questions"][0]["explanation"] == "Because 2 + 2 equals 4."


def test_parse_text_endpoint_returns_null_explanation_for_format_a():
    response = client.post(
        "/api/parse/text",
        json={
            "text": """Question 1
What is 2 + 2?
A. 3
B. 4
C. 5
D. 6
Answer: B
"""
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["questions"][0]["explanation"] is None

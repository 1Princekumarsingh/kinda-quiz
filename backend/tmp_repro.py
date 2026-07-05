from types import SimpleNamespace
from fastapi.testclient import TestClient
from app.main import app
from app.api import parse as parse_api

app.dependency_overrides[parse_api.get_current_user] = lambda: SimpleNamespace(id=1, username='testuser')
client = TestClient(app)
response = client.post('/api/parse/text', json={'text':'Question 1\nWhat is 2 + 2?\nA. 3\nB. 4\nC. 5\nD. 6\nAnswer: B\nExplanation: Because 2 + 2 equals 4.\n'})
print(response.status_code)
print(response.text)

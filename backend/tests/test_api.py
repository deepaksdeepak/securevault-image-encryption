"""
Integration tests for FastAPI endpoints (/api/health, /api/encrypt, /api/decrypt, /api/history).
"""
import io
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

DUMMY_PNG_BYTES = bytes([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82,
])

def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["algorithm"] == "AES-256-GCM"

def test_api_encrypt_and_decrypt_flow():
    # 1. Encrypt image
    file_tuple = ("test_image.png", io.BytesIO(DUMMY_PNG_BYTES), "image/png")
    enc_res = client.post(
        "/api/encrypt",
        files={"image": file_tuple},
        data={"password": "TestPassword123!"},
    )
    assert enc_res.status_code == 200
    enc_json = enc_res.json()
    assert enc_json["success"] is True
    assert "containerData" in enc_json
    assert enc_json["cryptoDetails"]["algorithm"] == "AES-256-GCM"

    # Decode container bytes
    import base64
    container_bytes = base64.b64decode(enc_json["containerData"])

    # 2. Decrypt with correct password
    svlt_tuple = ("test_image.svlt", io.BytesIO(container_bytes), "application/octet-stream")
    dec_res = client.post(
        "/api/decrypt",
        files={"file": svlt_tuple},
        data={"password": "TestPassword123!"},
    )
    assert dec_res.status_code == 200
    dec_json = dec_res.json()
    assert dec_json["success"] is True
    assert dec_json["filename"] == "test_image.png"

    # 3. Decrypt with wrong password must fail
    wrong_svlt_tuple = ("test_image.svlt", io.BytesIO(container_bytes), "application/octet-stream")
    wrong_res = client.post(
        "/api/decrypt",
        files={"file": wrong_svlt_tuple},
        data={"password": "WrongPassword999!"},
    )
    assert wrong_res.status_code == 400
    assert "Decryption failed" in wrong_res.json()["detail"]

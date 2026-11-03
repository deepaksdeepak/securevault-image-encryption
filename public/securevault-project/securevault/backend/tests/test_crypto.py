"""
Comprehensive Cryptographic and Format Test Suite for SecureVault.
Tests AES-256-GCM, PBKDF2-HMAC-SHA256, format validation, and authentication tag enforcement.
"""
import pytest
from backend.app.crypto.aes_gcm import (
    encrypt_image_data,
    decrypt_image_data,
    DecryptionError,
    InvalidFormatError,
)
from backend.app.crypto.pbkdf2 import derive_key
from backend.app.utils.file_validator import validate_image_upload

# Minimal 1x1 valid PNG image bytes
DUMMY_PNG_BYTES = bytes([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG header
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,  # IDAT chunk
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,  # IEND chunk
    0x42, 0x60, 0x82,
])

def test_key_derivation():
    """PBKDF2 must generate 32 bytes (256 bits) from password and salt."""
    salt = b"0123456789abcdef"
    key1 = derive_key("MySecurePass123!", salt, iterations=1000)
    key2 = derive_key("MySecurePass123!", salt, iterations=1000)
    key3 = derive_key("DifferentPass456!", salt, iterations=1000)

    assert len(key1) == 32
    assert key1 == key2, "Same password and salt must yield identical key"
    assert key1 != key3, "Different password must yield different key"

def test_encryption_and_decryption_roundtrip():
    """Encrypted image must decrypt back byte-for-byte matching original image."""
    password = "SuperSecretPassword#2026"
    meta = {"filename": "test.png", "mimeType": "image/png"}

    container, debug_info = encrypt_image_data(DUMMY_PNG_BYTES, password, meta)

    assert container[:4] == b"SVLT", "Container must start with magic bytes SVLT"
    assert container != DUMMY_PNG_BYTES, "Container must not be plaintext"
    assert DUMMY_PNG_BYTES not in container, "Original image bytes must not appear in container"

    # Decrypt
    decrypted_bytes, restored_meta = decrypt_image_data(container, password)

    assert decrypted_bytes == DUMMY_PNG_BYTES, "Decrypted bytes must match original byte-for-byte!"
    assert restored_meta["filename"] == "test.png"
    assert restored_meta["mimeType"] == "image/png"

def test_wrong_password_fails_decryption():
    """Attempting decryption with an incorrect password MUST fail."""
    container, _ = encrypt_image_data(DUMMY_PNG_BYTES, "correct_pass", {"filename": "img.png"})

    with pytest.raises(DecryptionError) as exc_info:
        decrypt_image_data(container, "wrong_pass")

    assert "Decryption failed" in str(exc_info.value)

def test_corrupted_file_detection():
    """Tampered ciphertext, tag, or header must fail validation."""
    container, _ = encrypt_image_data(DUMMY_PNG_BYTES, "correct_pass", {"filename": "img.png"})

    # 1. Truncated file
    with pytest.raises(InvalidFormatError):
        decrypt_image_data(container[:15], "correct_pass")

    # 2. Corrupted magic header
    corrupted_magic = b"XXXX" + container[4:]
    with pytest.raises(InvalidFormatError):
        decrypt_image_data(corrupted_magic, "correct_pass")

    # 3. Tampered ciphertext (flip bits near the end)
    corrupted_payload = bytearray(container)
    corrupted_payload[-5] ^= 0xFF
    with pytest.raises(DecryptionError):
        decrypt_image_data(bytes(corrupted_payload), "correct_pass")

def test_random_salt_and_nonce_uniqueness():
    """Two encryptions of the same image and password must generate different salts and nonces."""
    c1, d1 = encrypt_image_data(DUMMY_PNG_BYTES, "same_pass", {})
    c2, d2 = encrypt_image_data(DUMMY_PNG_BYTES, "same_pass", {})

    assert d1["salt_hex"] != d2["salt_hex"], "Salt must be cryptographically random per operation"
    assert d1["nonce_hex"] != d2["nonce_hex"], "Nonce must be unique per operation"
    assert c1 != c2, "Ciphertexts must differ due to unique salts/nonces"

def test_file_upload_validation():
    """Test image format validation utility."""
    # Valid PNG
    valid, _ = validate_image_upload("photo.png", DUMMY_PNG_BYTES, "image/png")
    assert valid is True

    # Invalid extension / content
    invalid, reason = validate_image_upload("doc.pdf", b"%PDF-1.4...", "application/pdf")
    assert invalid is False
    assert "Unsupported file format" in reason

    # Empty file
    invalid_empty, _ = validate_image_upload("empty.png", b"")
    assert invalid_empty is False

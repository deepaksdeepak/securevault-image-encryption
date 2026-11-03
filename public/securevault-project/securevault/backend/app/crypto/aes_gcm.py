"""
AES-256-GCM Authenticated Encryption and Decryption Service.
Implements the SecureVault (.svlt) container format.
"""
import os
import json
import struct
from typing import Dict, Any, Tuple
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag

from backend.app.config import (
    MAGIC_HEADER,
    FORMAT_VERSION,
    SALT_LENGTH_BYTES,
    NONCE_LENGTH_BYTES,
    TAG_LENGTH_BYTES,
)
from backend.app.crypto.pbkdf2 import derive_key

class DecryptionError(Exception):
    """Raised when decryption fails due to invalid password or corrupted data."""
    pass

class InvalidFormatError(Exception):
    """Raised when file does not conform to the SecureVault specification."""
    pass

def encrypt_image_data(image_bytes: bytes, password: str, metadata: Dict[str, Any]) -> Tuple[bytes, Dict[str, Any]]:
    """
    Encrypts raw image bytes using AES-256-GCM.
    Returns:
        (container_bytes, crypto_debug_info)
    """
    # 1. Generate cryptographically secure random salt and nonce
    salt = os.urandom(SALT_LENGTH_BYTES)
    nonce = os.urandom(NONCE_LENGTH_BYTES)

    # 2. Derive 256-bit key using PBKDF2-HMAC-SHA256
    key = derive_key(password, salt)

    # 3. Encrypt image bytes with AESGCM
    aesgcm = AESGCM(key)
    # Python cryptography's AESGCM.encrypt appends the 16-byte tag to the ciphertext
    encrypted_payload = aesgcm.encrypt(nonce, image_bytes, None)
    
    # Split ciphertext and authentication tag
    ciphertext = encrypted_payload[:-TAG_LENGTH_BYTES]
    auth_tag = encrypted_payload[-TAG_LENGTH_BYTES:]

    # 4. Serialize metadata
    meta_json = json.dumps(metadata, ensure_ascii=False).encode("utf-8")
    meta_len = len(meta_json)
    if meta_len > 65535:
        raise ValueError("Metadata length exceeds 65535 bytes limit.")

    # 5. Pack into SecureVault binary format:
    # [4B Magic: SVLT] [1B Version] [16B Salt] [12B Nonce] [16B Tag] [2B MetaLen] [Meta] [Ciphertext]
    container = bytearray()
    container.extend(MAGIC_HEADER)
    container.append(FORMAT_VERSION)
    container.extend(salt)
    container.extend(nonce)
    container.extend(auth_tag)
    container.extend(struct.pack(">H", meta_len))
    container.extend(meta_json)
    container.extend(ciphertext)

    debug_info = {
        "algorithm": "AES-256-GCM",
        "key_derivation": "PBKDF2-HMAC-SHA256",
        "salt_hex": salt.hex(),
        "nonce_hex": nonce.hex(),
        "auth_tag_hex": auth_tag.hex(),
        "version": FORMAT_VERSION,
        "original_size": len(image_bytes),
        "encrypted_size": len(container),
    }

    return bytes(container), debug_info

def decrypt_image_data(container_bytes: bytes, password: str) -> Tuple[bytes, Dict[str, Any]]:
    """
    Parses and decrypts a SecureVault (.svlt) container.
    Verifies authentication tag and returns (decrypted_image_bytes, metadata).
    """
    min_len = len(MAGIC_HEADER) + 1 + SALT_LENGTH_BYTES + NONCE_LENGTH_BYTES + TAG_LENGTH_BYTES + 2
    if len(container_bytes) < min_len:
        raise InvalidFormatError("The encrypted file is invalid or corrupted: payload too short.")

    # Check magic header
    if container_bytes[:4] != MAGIC_HEADER:
        raise InvalidFormatError(
            "Invalid file format: This is not a SecureVault (.svlt) encrypted file."
        )

    version = container_bytes[4]
    if version != FORMAT_VERSION:
        raise InvalidFormatError(f"Unsupported container version: {version}")

    offset = 5
    salt = container_bytes[offset : offset + SALT_LENGTH_BYTES]
    offset += SALT_LENGTH_BYTES

    nonce = container_bytes[offset : offset + NONCE_LENGTH_BYTES]
    offset += NONCE_LENGTH_BYTES

    auth_tag = container_bytes[offset : offset + TAG_LENGTH_BYTES]
    offset += TAG_LENGTH_BYTES

    (meta_len,) = struct.unpack(">H", container_bytes[offset : offset + 2])
    offset += 2

    if len(container_bytes) < offset + meta_len:
        raise InvalidFormatError("Corrupted file structure: metadata length exceeds payload.")

    meta_bytes = container_bytes[offset : offset + meta_len]
    offset += meta_len

    try:
        metadata = json.loads(meta_bytes.decode("utf-8"))
    except Exception:
        metadata = {"filename": "decrypted_image.png", "mimeType": "image/png"}

    ciphertext = container_bytes[offset:]
    if len(ciphertext) == 0:
        raise InvalidFormatError("Encrypted container contains no ciphertext.")

    # Derive key from password and extracted salt
    key = derive_key(password, salt)

    # Reconstitute ciphertext + auth_tag for Python cryptography AESGCM.decrypt
    full_encrypted_payload = ciphertext + auth_tag

    aesgcm = AESGCM(key)
    try:
        decrypted_bytes = aesgcm.decrypt(nonce, full_encrypted_payload, None)
    except InvalidTag:
        raise DecryptionError(
            "Decryption failed. The password may be incorrect or the encrypted file may be corrupted."
        )

    metadata["salt_hex"] = salt.hex()
    metadata["nonce_hex"] = nonce.hex()
    metadata["auth_tag_hex"] = auth_tag.hex()
    metadata["algorithm"] = "AES-256-GCM"

    return decrypted_bytes, metadata

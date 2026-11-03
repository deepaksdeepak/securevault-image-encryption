"""
PBKDF2 Key Derivation Service
Derives a 256-bit symmetric encryption key from a user password and cryptographically secure salt.
"""
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from backend.app.config import PBKDF2_ITERATIONS, KEY_LENGTH_BYTES

def derive_key(password: str, salt: bytes, iterations: int = PBKDF2_ITERATIONS) -> bytes:
    """
    Derive a 256-bit AES key from a plaintext password and 16-byte random salt.
    Uses PBKDF2 with HMAC-SHA256 and 100,000 iterations.
    """
    if not password:
        raise ValueError("Password cannot be empty.")
    if len(salt) < 16:
        raise ValueError("Salt must be at least 16 bytes.")

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=KEY_LENGTH_BYTES,
        salt=salt,
        iterations=iterations,
    )
    return kdf.derive(password.encode("utf-8"))

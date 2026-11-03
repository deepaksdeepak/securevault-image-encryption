"""
SecureVault Configuration Settings
AES-256-GCM + PBKDF2-HMAC-SHA256
"""
import os

MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "25"))
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

# Cryptographic parameters
PBKDF2_ITERATIONS = int(os.getenv("PBKDF2_ITERATIONS", "100000"))
KEY_LENGTH_BYTES = 32     # 256-bit encryption key
SALT_LENGTH_BYTES = 16    # 128-bit random salt
NONCE_LENGTH_BYTES = 12   # 96-bit AES-GCM nonce/IV
TAG_LENGTH_BYTES = 16     # 128-bit AES-GCM authentication tag

# Container magic bytes and version
MAGIC_HEADER = b"SVLT"
FORMAT_VERSION = 1

# Supported image types
SUPPORTED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/bmp",
}

SUPPORTED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
}

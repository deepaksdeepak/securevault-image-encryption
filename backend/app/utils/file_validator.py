"""
File validation utilities for SecureVault images and containers.
"""
import os
from typing import Tuple
from backend.app.config import (
    MAX_FILE_SIZE_BYTES,
    SUPPORTED_EXTENSIONS,
    SUPPORTED_MIME_TYPES,
)

def validate_image_upload(filename: str, content: bytes, content_type: str = "") -> Tuple[bool, str]:
    """
    Validates uploaded file size, extension, and binary magic bytes.
    """
    if len(content) == 0:
        return False, "File is empty."

    if len(content) > MAX_FILE_SIZE_BYTES:
        return False, f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024*1024)} MB."

    _, ext = os.path.splitext(filename.lower())
    if ext not in SUPPORTED_EXTENSIONS and content_type.lower() not in SUPPORTED_MIME_TYPES:
        return False, f"Unsupported file format '{ext}'. Supported formats: JPG, JPEG, PNG, WEBP, BMP."

    if len(content) < 8:
        return False, "File size too small to be a valid image."

    # Validate image magic headers
    is_jpeg = content[0:3] == b"\xff\xd8\xff"
    is_png = content[0:8] == b"\x89PNG\r\n\x1a\n"
    is_webp = content[0:4] == b"RIFF" and content[8:12] == b"WEBP"
    is_bmp = content[0:2] == b"BM"

    if not (is_jpeg or is_png or is_webp or is_bmp):
        if ext not in SUPPORTED_EXTENSIONS:
            return False, "Uploaded file content is not a recognized image format."

    return True, ""

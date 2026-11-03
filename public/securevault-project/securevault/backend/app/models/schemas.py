"""
Pydantic schemas for SecureVault API responses.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    algorithm: str
    key_derivation: str
    iterations: int
    key_size_bits: int
    max_file_size_mb: int

class CryptoDetails(BaseModel):
    algorithm: str
    key_derivation: str
    salt_hex: str
    nonce_hex: str
    auth_tag_hex: str
    version: int

class EncryptResponse(BaseModel):
    success: bool
    message: str
    encrypted_filename: str
    original_filename: str
    original_size: int
    encrypted_size: int
    crypto_details: CryptoDetails
    container_base64: Optional[str] = None

class DecryptResponse(BaseModel):
    success: bool
    message: str
    filename: str
    mime_type: str
    size: int
    data_url: str
    metadata: Dict[str, Any]

class HistoryItemModel(BaseModel):
    id: str
    operation: str
    filename: str
    original_size: int
    encrypted_size: Optional[int] = None
    timestamp: str
    status: str
    algorithm: str
    key_derivation: str
    failure_reason: Optional[str] = None

class HistoryResponse(BaseModel):
    success: bool
    history: List[HistoryItemModel]
    stats: Dict[str, int]

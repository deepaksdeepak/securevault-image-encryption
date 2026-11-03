"""
FastAPI Routes for Encryption, Decryption, and Container Inspection.
"""
import uuid
import base64
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from fastapi.responses import JSONResponse

from backend.app.crypto.aes_gcm import (
    encrypt_image_data,
    decrypt_image_data,
    DecryptionError,
    InvalidFormatError,
)
from backend.app.utils.file_validator import validate_image_upload

router = APIRouter(prefix="/api", tags=["cryptography"])

# In-memory history for FastAPI session
history_db = []

@router.post("/encrypt")
async def encrypt_endpoint(
    image: UploadFile = File(...),
    password: str = Form(...),
):
    if not password or len(password) < 4:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 4 characters long."
        )

    content = await image.read()
    valid, reason = validate_image_upload(image.filename or "image.png", content, image.content_type or "")
    if not valid:
        history_db.insert(0, {
            "id": str(uuid.uuid4()),
            "operation": "Encrypt",
            "filename": image.filename or "image",
            "original_size": len(content),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "status": "Failed",
            "algorithm": "AES-256-GCM",
            "key_derivation": "PBKDF2-HMAC-SHA256",
            "failure_reason": reason,
        })
        raise HTTPException(status_code=400, detail=reason)

    metadata = {
        "filename": image.filename,
        "mimeType": image.content_type or "image/png",
        "originalSize": len(content),
        "createdAt": datetime.utcnow().isoformat() + "Z",
    }

    try:
        container_bytes, debug_info = encrypt_image_data(content, password, metadata)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cryptographic failure: {str(e)}")

    encrypted_filename = f"{(image.filename or 'image').rsplit('.', 1)[0]}.svlt"

    history_db.insert(0, {
        "id": str(uuid.uuid4()),
        "operation": "Encrypt",
        "filename": image.filename or "image",
        "original_size": len(content),
        "encrypted_size": len(container_bytes),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "status": "Success",
        "algorithm": "AES-256-GCM",
        "key_derivation": "PBKDF2-HMAC-SHA256",
    })

    return {
        "success": True,
        "message": "Image encrypted successfully.",
        "encryptedFilename": encrypted_filename,
        "originalFilename": image.filename,
        "originalSize": len(content),
        "encryptedSize": len(container_bytes),
        "containerData": base64.b64encode(container_bytes).decode("ascii"),
        "cryptoDetails": {
            "algorithm": "AES-256-GCM",
            "keyDerivation": "PBKDF2-HMAC-SHA256",
            "iterations": 100000,
            "keyLengthBits": 256,
            "saltHex": debug_info["salt_hex"],
            "nonceHex": debug_info["nonce_hex"],
            "authTagHex": debug_info["auth_tag_hex"],
            "formatVersion": 1,
        },
    }

@router.post("/decrypt")
async def decrypt_endpoint(
    file: UploadFile = File(...),
    password: str = Form(...),
):
    if not password:
        raise HTTPException(status_code=400, detail="Password is required.")

    content = await file.read()
    filename = file.filename or "unknown.svlt"

    try:
        decrypted_bytes, metadata = decrypt_image_data(content, password)
    except InvalidFormatError as ife:
        history_db.insert(0, {
            "id": str(uuid.uuid4()),
            "operation": "Decrypt",
            "filename": filename,
            "original_size": len(content),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "status": "Failed",
            "algorithm": "AES-256-GCM",
            "key_derivation": "PBKDF2-HMAC-SHA256",
            "failure_reason": str(ife),
        })
        raise HTTPException(status_code=400, detail=str(ife))
    except DecryptionError as de:
        history_db.insert(0, {
            "id": str(uuid.uuid4()),
            "operation": "Decrypt",
            "filename": filename,
            "original_size": len(content),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "status": "Failed",
            "algorithm": "AES-256-GCM",
            "key_derivation": "PBKDF2-HMAC-SHA256",
            "failure_reason": str(de),
        })
        raise HTTPException(status_code=400, detail=str(de))

    out_mime = metadata.get("mimeType", "image/png")
    out_name = metadata.get("filename", "decrypted_image.png")
    data_url = f"data:{out_mime};base64,{base64.b64encode(decrypted_bytes).decode('ascii')}"

    history_db.insert(0, {
        "id": str(uuid.uuid4()),
        "operation": "Decrypt",
        "filename": out_name,
        "original_size": len(decrypted_bytes),
        "encrypted_size": len(content),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "status": "Success",
        "algorithm": "AES-256-GCM",
        "key_derivation": "PBKDF2-HMAC-SHA256",
    })

    return {
        "success": True,
        "message": "Image decrypted and authenticated successfully.",
        "filename": out_name,
        "mimeType": out_mime,
        "size": len(decrypted_bytes),
        "dataUrl": data_url,
        "metadata": metadata,
    }

@router.get("/history")
async def get_history():
    return {
        "success": True,
        "history": history_db,
        "stats": {
            "total": len(history_db),
            "encryptions": sum(1 for h in history_db if h["operation"] == "Encrypt"),
            "decryptions": sum(1 for h in history_db if h["operation"] == "Decrypt"),
            "successful": sum(1 for h in history_db if h["status"] == "Success"),
            "failed": sum(1 for h in history_db if h["status"] == "Failed"),
        },
    }

@router.delete("/history")
async def clear_history():
    history_db.clear()
    return {"success": True, "message": "History cleared successfully."}

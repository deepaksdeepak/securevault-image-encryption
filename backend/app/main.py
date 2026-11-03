"""
SecureVault FastAPI Main Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routes.crypto_routes import router as crypto_router
from backend.app.config import PBKDF2_ITERATIONS, MAX_FILE_SIZE_MB

app = FastAPI(
    title="SecureVault API",
    description="AES-256-GCM Image Encryption and Decryption Service",
    version="1.0.0",
)

# Enable CORS for local dev / cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crypto_router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "service": "SecureVault",
        "version": "1.0.0",
        "algorithm": "AES-256-GCM",
        "keyDerivation": "PBKDF2-HMAC-SHA256",
        "iterations": PBKDF2_ITERATIONS,
        "keySizeBits": 256,
        "maxFileSizeMb": MAX_FILE_SIZE_MB,
        "supportedFormats": ["JPG", "JPEG", "PNG", "WEBP", "BMP"],
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

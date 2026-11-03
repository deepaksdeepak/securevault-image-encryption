# SecureVault – Image Encryption Using AES-256

[![Security](https://img.shields.io/badge/Security-AES--256--GCM-cyan.svg)](#cryptography)
[![KDF](https://img.shields.io/badge/KDF-PBKDF2--HMAC--SHA256-blue.svg)](#password-key-derivation)
[![Authentication](https://img.shields.io/badge/Integrity-128--bit%20Auth%20Tag-green.svg)](#tamper-detection)
[![Compliance](https://img.shields.io/badge/Standard-NIST%20FIPS%20197-purple.svg)](#standards)

**SecureVault** is a production-grade, college-major-project-ready cybersecurity platform engineered to securely encrypt and decrypt image files (JPEG, PNG, WEBP, BMP) using the Advanced Encryption Standard with 256-bit keys in Galois/Counter Mode (**AES-256-GCM**) and **PBKDF2-HMAC-SHA256** key stretching.

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Cryptographic Workflow](#cryptographic-workflow)
6. [Why AES-256 & AES-GCM?](#why-aes-256--aes-gcm)
7. [The SecureVault Binary Format (.svlt)](#the-securevault-binary-format-svlt)
8. [Installation & Local Setup](#installation--local-setup)
   - [Option A: Full-Stack Node Runtime](#option-a-full-stack-node-runtime)
   - [Option B: Python FastAPI Backend + React Frontend](#option-b-python-fastapi-backend--react-frontend)
9. [Running Automated Tests](#running-automated-tests)
10. [API Endpoint Documentation](#api-endpoint-documentation)
11. [Project Structure](#project-structure)
12. [College Demonstration Notes](#college-demonstration-notes)
13. [Future Enhancements](#future-enhancements)
14. [Author & License](#author--license)

---

## 🔒 Project Overview

Modern images often contain deeply sensitive personal, clinical, or confidential data (e.g., biometric photo IDs, medical diagnostic radiology scans, defense blueprints, financial transactions). Standard storage and transit leave these images susceptible to eavesdropping and data breaches.

**SecureVault** solves this by converting plaintext image bytes into authenticated ciphertext. Utilizing authenticated encryption (AEAD), SecureVault ensures:
- **Confidentiality:** Mathematical impossibility of reading the image without the correct key.
- **Authenticity & Integrity:** Immediate rejection of tampered files or incorrect passwords before displaying or outputting corrupted data.
- **Zero Plaintext Leakage:** No contours or patterns survive encryption (mitigating the classic ECB mode vulnerability).

---

## ⚡ Key Features

- **Authenticated Encryption (AES-256-GCM):** Industry standard authenticated cipher guaranteeing confidentiality and integrity in a single pass.
- **PBKDF2-HMAC-SHA256 Key Derivation:** 100,000 iterations to resist GPU-accelerated dictionary and rainbow table attacks.
- **Cryptographically Secure Salt & Nonce:** Fresh 16-byte random salt and 12-byte random nonce generated per encryption via OS-level CSPRNG.
- **Tamper-Evident Verification:** Any modification to the encrypted file or wrong password trips the 128-bit GHASH authentication tag check and halts execution cleanly.
- **Byte-For-Byte Fidelity:** Restored decrypted images match the original upload bit-by-bit (zero lossy re-encoding).
- **Format Support:** Full support for JPEG, PNG, WEBP, and BMP up to 25 MB.
- **Modern Dark Cybersecurity UI:** Responsive dashboard, password entropy meter, live cryptographic parameter inspection modal, and session audit history.
- **Dual Runtime Support:** Can run as a full-stack Node.js/TypeScript application or as a standalone Python FastAPI backend with identical container compatibility.

---

## 🛠️ Technology Stack

### Frontend:
- **React 19** with **TypeScript**
- **Vite** build system
- **Tailwind CSS v4** for dark cybersecurity aesthetics
- **Lucide React** icons
- **Canvas API** for client-side test image generation

### Backend:
- **Python 3.10+ / FastAPI** (`backend/`)
  - `cryptography` library (`AESGCM`, `PBKDF2HMAC`, `hashes.SHA256`)
  - `python-multipart` & `pydantic`
  - `pytest` & `httpx` for test coverage
- **Node.js / Express** (`server.ts`)
  - Built-in `crypto` module (`aes-256-gcm`, `pbkdf2Sync`)
  - `multer` in-memory buffering

---

## 🏗️ System Architecture

```
User Browser (React + Vite)
       │
       ▼  Multipart Form / REST API
Express Proxy (server.ts)  OR  Python FastAPI (backend/app/main.py)
       │
       ├─► 1. File Validator (MIME, Magic Bytes, File Size <= 25MB)
       ├─► 2. Salt Generator (os.urandom(16) / crypto.randomBytes(16))
       ├─► 3. Nonce Generator (os.urandom(12) / crypto.randomBytes(12))
       ├─► 4. PBKDF2-HMAC-SHA256 (100,000 rounds -> 256-bit Key)
       ├─► 5. AES-256-GCM (Encrypts image bytes -> Ciphertext + 16B Tag)
       ├─► 6. Container Packaging (.svlt binary format)
       └─► 7. Ephemeral In-Memory Session History Log
```

---

## 🔄 Cryptographic Workflow

### 1. Encryption Pipeline:
```
Password ──► PBKDF2-HMAC-SHA256 (100k rounds, 16B salt) ──► 256-bit Key
                                                                 │
Image Buffer ──────────────────────────────────────────► AES-256-GCM (12B Nonce)
                                                                 │
                                                       ┌─────────┴─────────┐
                                                       ▼                   ▼
                                                   Ciphertext      16B Auth Tag
                                                       │                   │
                                                       └─────────┬─────────┘
                                                                 ▼
                                                        .svlt Binary Container
```

### 2. Decryption Pipeline:
```
.svlt File ──► Header Parser (Verify SVLT magic & Version 1)
                    │
                    ├─► Extract Salt (16B)
                    ├─► Extract Nonce (12B)
                    ├─► Extract Auth Tag (16B)
                    ├─► Extract Metadata (JSON: filename, mimeType)
                    └─► Extract Ciphertext
                            │
Password + Salt ──► PBKDF2-HMAC-SHA256 ──► 256-bit Key
                            │
AES-256-GCM Decipher (Key, Nonce, Auth Tag)
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
        Tag Matches?               Tag Mismatch?
               │                         │
     [Decryption Success]        [Decryption Error]
  Restore exact image bytes     "Password may be incorrect
  and metadata to user           or file is corrupted"
```

---

## 📦 The SecureVault Binary Format (.svlt)

Every encrypted container follows this strict, tamper-evident binary layout:

| Byte Offset | Length | Field | Purpose |
| :--- | :--- | :--- | :--- |
| `0x00 .. 0x03` | 4 Bytes | **MAGIC** | ASCII `SVLT` (`0x53 0x56 0x4C 0x54`) |
| `0x04` | 1 Byte | **VERSION** | Format version identifier (`0x01`) |
| `0x05 .. 0x14` | 16 Bytes | **SALT** | 128-bit random salt for PBKDF2 |
| `0x15 .. 0x20` | 12 Bytes | **NONCE** | 96-bit AES-GCM Initialization Vector |
| `0x21 .. 0x30` | 16 Bytes | **AUTH TAG** | 128-bit GHASH authentication tag |
| `0x31 .. 0x32` | 2 Bytes | **META LEN** | Unsigned 16-bit Big-Endian header length |
| `0x33 .. Var` | N Bytes | **METADATA** | JSON string (`filename`, `mimeType`, `size`) |
| Remainder | M Bytes | **CIPHERTEXT** | Raw AES-256-GCM encrypted image payload |

---

## 🚀 Installation & Local Setup

### Option A: Full-Stack Node Runtime (Default AI Studio Stack)

1. From the parent directory (`INS PROJECT` in this workspace), navigate to the project directory:
   ```bash
   cd "securevault-–-image-encryption-using-aes"
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:3000`.

---

### Option B: Python FastAPI Backend + React Frontend

#### 1. Setup Python Backend:
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux / macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install required packages
pip install -r requirements.txt

# Start FastAPI server on port 8000
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Run Backend Tests:
```bash
pytest tests/ -v
```

#### 3. Setup Frontend:
```bash
# In the project root:
npm install
npm run dev
```

---

## 🧪 Running Automated Tests

Run backend tests using `pytest`:

```bash
pytest backend/tests/test_crypto.py -v
```

Test coverage includes:
1. `test_key_derivation`: Validates 256-bit key output and PBKDF2 repeatability with same salt.
2. `test_encryption_and_decryption_roundtrip`: Verifies decrypted output matches original image bytes bit-by-bit.
3. `test_wrong_password_fails_decryption`: Asserts invalid passwords raise authentication failures.
4. `test_corrupted_file_detection`: Verifies truncated, modified, or altered payloads fail authentication.
5. `test_random_salt_and_nonce_uniqueness`: Verifies identical plaintexts produce non-identical ciphertexts.
6. `test_file_upload_validation`: Checks file format and size boundaries.

---

## 📡 API Endpoint Documentation

### 1. `GET /api/health`
Checks backend cryptographic engine status.
- **Response:**
  ```json
  {
    "status": "ok",
    "service": "SecureVault",
    "version": "1.0.0",
    "algorithm": "AES-256-GCM",
    "keyDerivation": "PBKDF2-HMAC-SHA256",
    "iterations": 100000,
    "keySizeBits": 256,
    "maxFileSizeMb": 25
  }
  ```

### 2. `POST /api/encrypt`
Encrypts an image using AES-256-GCM.
- **Form Data:**
  - `image`: Image file (JPG, PNG, WEBP, BMP, <= 25MB)
  - `password`: String (>= 4 characters)
- **Response:**
  ```json
  {
    "success": true,
    "message": "Image encrypted successfully.",
    "encryptedFilename": "photo.svlt",
    "originalFilename": "photo.png",
    "originalSize": 1048576,
    "encryptedSize": 1048738,
    "containerData": "<base64_encoded_container>",
    "cryptoDetails": {
      "algorithm": "AES-256-GCM",
      "keyDerivation": "PBKDF2-HMAC-SHA256",
      "iterations": 100000,
      "saltHex": "a1b2...",
      "nonceHex": "c3d4...",
      "authTagHex": "e5f6..."
    }
  }
  ```

### 3. `POST /api/decrypt`
Decrypts and authenticates a `.svlt` file.
- **Form Data:**
  - `file`: SecureVault container file (`.svlt`)
  - `password`: String
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Image decrypted and authenticated successfully.",
    "filename": "photo.png",
    "mimeType": "image/png",
    "size": 1048576,
    "dataUrl": "data:image/png;base64,...",
    "metadata": { ... }
  }
  ```
- **Response (Wrong Password / Corrupted File - HTTP 400):**
  ```json
  {
    "success": false,
    "error": "Decryption failed. The password may be incorrect or the encrypted file may be corrupted."
  }
  ```

### 4. `POST /api/verify`
Inspects container header without password.

### 5. `GET /api/history`
Returns session activity audit trail and summary counts.

### 6. `DELETE /api/history`
Clears session activity log.

---

## 📁 Project Structure

```
securevault/
├── backend/                        # Complete Python FastAPI backend
│   ├── app/
│   │   ├── crypto/
│   │   │   ├── aes_gcm.py          # AES-256-GCM cipher and container packer
│   │   │   └── pbkdf2.py           # PBKDF2-HMAC-SHA256 key derivation
│   │   ├── models/
│   │   │   └── schemas.py          # Pydantic validation models
│   │   ├── routes/
│   │   │   └── crypto_routes.py    # /api/encrypt, /api/decrypt, /api/history
│   │   ├── utils/
│   │   │   └── file_validator.py   # MIME and magic byte checkers
│   │   ├── config.py               # Constants, limits, iterations
│   │   └── main.py                 # FastAPI application entrypoint
│   ├── tests/
│   │   ├── test_crypto.py          # Pytest suite for cryptographic primitives
│   │   └── test_api.py             # Integration test suite
│   └── requirements.txt            # Python dependencies
│
├── src/                            # React 19 Frontend
│   ├── components/
│   │   ├── Navbar.tsx              # Navigation bar with live engine status
│   │   ├── Footer.tsx              # Cryptographic footnotes & compliance
│   │   ├── PasswordStrengthMeter.tsx # Real-time entropy evaluator
│   │   └── CryptoDetailsModal.tsx  # Hex breakdown of salt, nonce & tag
│   ├── pages/
│   │   ├── HomePage.tsx            # Dashboard, statistics, and pipeline visualizer
│   │   ├── EncryptPage.tsx         # Image drag & drop, password input, .svlt export
│   │   ├── DecryptPage.tsx         # Container upload, tag verification, image preview
│   │   ├── HistoryPage.tsx         # Session activity audit log & filters
│   │   └── SecurityPage.tsx        # Cryptographic theory, math, diagrams, binary map
│   ├── services/
│   │   └── api.ts                  # REST API client & binary download helpers
│   ├── utils/
│   │   └── sampleImages.ts         # High-resolution canvas test image generators
│   ├── types/
│   │   └── crypto.ts               # Shared TypeScript interfaces
│   ├── App.tsx                     # Main React router and state container
│   ├── main.tsx                    # React DOM entrypoint
│   └── index.css                   # Tailwind CSS styling and theme
│
├── server.ts                       # Node.js/Express full-stack dev & production server
├── index.html                      # HTML5 entrypoint with metadata
├── package.json                    # Node dependencies and build scripts
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
├── metadata.json                   # AI Studio applet metadata
└── README.md                       # Comprehensive documentation
```

---

## 🎓 College Demonstration Guide

When presenting SecureVault for a project review, follow this recommended sequence:

1. **Dashboard Overview:** Explain why AES-256 is the gold standard for symmetric encryption.
2. **Preset Sample Demonstration:** Click "Or test immediately with a sample image preset" (e.g. *Confidential Employee Badge* or *Diagnostic Patient Scan*) to load an image in 1 click without browsing.
3. **Password Entropy Analysis:** Enter a passphrase and explain how the password strength meter calculates entropy.
4. **Encryption Demonstration:** Click "Encrypt Image" and show the animated steps:
   - PBKDF2 stretching (100,000 iterations)
   - Random 16-byte salt and 12-byte nonce generation
   - AES-256-GCM block encryption
   - 128-bit authentication tag calculation
5. **Inspect Cryptographic Parameters:** Open the "Inspect Cryptographic Parameters" modal to display the actual hexadecimal values of the Salt, Nonce, and Auth Tag.
6. **Download .svlt Container:** Download the encrypted file and show that it cannot be opened by an image viewer (corrupt/unrecognized binary).
7. **Decryption with Correct Password:** Upload the `.svlt` file, enter the correct password, and show the instant restoration of the exact image with dimensions and metadata.
8. **Security Failure Demonstration:** Re-upload the same file and enter a wrong password. Show how the GCM authentication tag check fails immediately without outputting broken pixels or leaking information.
9. **History Audit:** Open the History tab to show the logged operations with timestamps, algorithm identifiers, and zero credential exposure.

---

## 🔮 Future Enhancements

- Hardware Security Module (HSM) and WebAuthn biometric key derivation integration.
- Steganographic embedding mode (concealing AES ciphertext inside decoy carrier images).
- Asymmetric key encapsulation (hybrid RSA-4096 / Kyber-1024 post-quantum key exchange).

---

## 👨‍💻 Author

Developed for academic and cybersecurity project evaluation.
Standards: **NIST FIPS 197**, **NIST SP 800-38D**, **RFC 8018**.

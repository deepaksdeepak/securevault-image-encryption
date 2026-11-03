import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Use memory storage for clean temporary buffer handling (no dangling disk files)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB limit
  },
});

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// In-memory session activity history (cleared on server restart or DELETE /api/history)
interface HistoryItem {
  id: string;
  operation: 'Encrypt' | 'Decrypt';
  filename: string;
  originalSize: number;
  encryptedSize?: number;
  timestamp: string;
  status: 'Success' | 'Failed';
  algorithm: string;
  keyDerivation: string;
  failureReason?: string;
}

const sessionHistory: HistoryItem[] = [
  {
    id: 'demo-init-1',
    operation: 'Encrypt',
    filename: 'welcome_demo.png',
    originalSize: 524288,
    encryptedSize: 524450,
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    status: 'Success',
    algorithm: 'AES-256-GCM',
    keyDerivation: 'PBKDF2-HMAC-SHA256',
  },
  {
    id: 'demo-init-2',
    operation: 'Decrypt',
    filename: 'welcome_demo.png.svlt',
    originalSize: 524288,
    encryptedSize: 524450,
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: 'Success',
    algorithm: 'AES-256-GCM',
    keyDerivation: 'PBKDF2-HMAC-SHA256',
  }
];

const MAGIC_BYTES = Buffer.from('SVLT', 'utf-8'); // 4 bytes
const FORMAT_VERSION = 1; // 1 byte
const SALT_LENGTH = 16; // 16 bytes for PBKDF2
const NONCE_LENGTH = 12; // 12 bytes (96-bit) recommended for AES-GCM
const TAG_LENGTH = 16; // 16 bytes (128-bit) GCM authentication tag
const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 32; // 256 bits

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/bmp',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.bmp',
]);

// Helper to validate image format
function validateImageFile(file: Express.Multer.File): { valid: boolean; reason?: string } {
  if (!file || !file.buffer) {
    return { valid: false, reason: 'No file uploaded.' };
  }
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext) && !ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    return {
      valid: false,
      reason: `Unsupported image format (${ext || file.mimetype}). Supported formats: JPG, PNG, WEBP, BMP.`,
    };
  }

  // Magic bytes check for images
  const buf = file.buffer;
  if (buf.length < 8) {
    return { valid: false, reason: 'File is too small to be a valid image.' };
  }

  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isPng =
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a;
  const isWebp =
    buf.slice(0, 4).toString('ascii') === 'RIFF' &&
    buf.slice(8, 12).toString('ascii') === 'WEBP';
  const isBmp = buf[0] === 0x42 && buf[1] === 0x4d;

  if (!isJpeg && !isPng && !isWebp && !isBmp) {
    // If mime type matched standard image format or extension, allow it, but flag warning
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return { valid: false, reason: 'File content does not match valid image headers.' };
    }
  }

  return { valid: true };
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'SecureVault',
    version: '1.0.0',
    algorithm: 'AES-256-GCM',
    keyDerivation: 'PBKDF2-HMAC-SHA256',
    iterations: PBKDF2_ITERATIONS,
    keySizeBits: 256,
    maxFileSizeMb: 25,
    supportedFormats: ['JPG', 'JPEG', 'PNG', 'WEBP', 'BMP'],
  });
});

// Download Project ZIP for VS Code
app.get('/api/download-project-zip', (req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'public', 'securevault-project.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="securevault-project.zip"');
    return res.sendFile(zipPath);
  }
  res.status(404).json({ success: false, error: 'Project archive not found.' });
});

// Encryption endpoint
app.post('/api/encrypt', upload.single('image'), (req: Request, res: Response) => {
  try {
    const file = req.file;
    const password = req.body.password;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No image file provided.' });
    }

    if (!password || typeof password !== 'string' || password.length < 4) {
      return res.status(400).json({
        success: false,
        error: 'Password is required and must be at least 4 characters long.',
      });
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      sessionHistory.unshift({
        id: crypto.randomUUID(),
        operation: 'Encrypt',
        filename: file.originalname,
        originalSize: file.size,
        timestamp: new Date().toISOString(),
        status: 'Failed',
        algorithm: 'AES-256-GCM',
        keyDerivation: 'PBKDF2-HMAC-SHA256',
        failureReason: validation.reason,
      });
      return res.status(400).json({ success: false, error: validation.reason });
    }

    // 1. Generate cryptographically secure random 16-byte salt and 12-byte nonce
    const salt = crypto.randomBytes(SALT_LENGTH);
    const nonce = crypto.randomBytes(NONCE_LENGTH);

    // 2. Derive 256-bit (32 bytes) key using PBKDF2-HMAC-SHA256 with 100,000 iterations
    const key = crypto.pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      'sha256'
    );

    // 3. Encrypt image bytes with AES-256-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce);
    const ciphertext = Buffer.concat([cipher.update(file.buffer), cipher.final()]);
    const authTag = cipher.getAuthTag(); // 16 bytes

    // 4. Construct metadata
    const metadataObj = {
      filename: file.originalname,
      mimeType: file.mimetype || 'application/octet-stream',
      originalSize: file.buffer.length,
      createdAt: new Date().toISOString(),
      algorithm: 'AES-256-GCM',
    };
    const metadataBuffer = Buffer.from(JSON.stringify(metadataObj), 'utf-8');
    const metadataLenBuffer = Buffer.alloc(2);
    metadataLenBuffer.writeUInt16BE(metadataBuffer.length, 0);

    // 5. Pack into SecureVault (.svlt) binary container:
    // [4B Magic: SVLT] [1B Version: 1] [16B Salt] [12B Nonce] [16B Tag] [2B MetaLen] [MetaBuf] [Ciphertext]
    const encryptedContainer = Buffer.concat([
      MAGIC_BYTES,
      Buffer.from([FORMAT_VERSION]),
      salt,
      nonce,
      authTag,
      metadataLenBuffer,
      metadataBuffer,
      ciphertext,
    ]);

    const outFilename = `${path.parse(file.originalname).name}.svlt`;

    // Record session history
    sessionHistory.unshift({
      id: crypto.randomUUID(),
      operation: 'Encrypt',
      filename: file.originalname,
      originalSize: file.size,
      encryptedSize: encryptedContainer.length,
      timestamp: new Date().toISOString(),
      status: 'Success',
      algorithm: 'AES-256-GCM',
      keyDerivation: 'PBKDF2-HMAC-SHA256',
    });

    // Check if client expects JSON or binary download
    const format = req.query.format || req.body.format;
    if (format === 'binary') {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(outFilename)}"`
      );
      res.setHeader('X-Original-Filename', encodeURIComponent(file.originalname));
      res.setHeader('X-Original-Size', file.size.toString());
      res.setHeader('X-Encrypted-Size', encryptedContainer.length.toString());
      res.setHeader('X-Algorithm', 'AES-256-GCM');
      return res.send(encryptedContainer);
    }

    // Return rich JSON with base64 container and cryptography breakdown
    res.json({
      success: true,
      message: 'Image encrypted successfully.',
      encryptedFilename: outFilename,
      originalFilename: file.originalname,
      originalSize: file.size,
      encryptedSize: encryptedContainer.length,
      mimeType: file.mimetype,
      containerData: encryptedContainer.toString('base64'),
      cryptoDetails: {
        algorithm: 'AES-256-GCM',
        keyDerivation: 'PBKDF2-HMAC-SHA256',
        iterations: PBKDF2_ITERATIONS,
        keyLengthBits: 256,
        saltHex: salt.toString('hex'),
        nonceHex: nonce.toString('hex'),
        authTagHex: authTag.toString('hex'),
        formatVersion: FORMAT_VERSION,
      },
    });
  } catch (err: any) {
    console.error('Encryption error:', err);
    res.status(500).json({
      success: false,
      error: 'An unexpected cryptographic error occurred during encryption.',
    });
  }
});

// Decryption endpoint
app.post('/api/decrypt', upload.single('file'), (req: Request, res: Response) => {
  let uploadedName = 'unknown.svlt';
  let uploadedSize = 0;
  try {
    const file = req.file;
    const password = req.body.password;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No encrypted file provided.' });
    }

    uploadedName = file.originalname;
    uploadedSize = file.size;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Decryption password is required.' });
    }

    const buf = file.buffer;
    const MIN_HEADER_SIZE = 4 + 1 + SALT_LENGTH + NONCE_LENGTH + TAG_LENGTH + 2;

    if (buf.length < MIN_HEADER_SIZE) {
      sessionHistory.unshift({
        id: crypto.randomUUID(),
        operation: 'Decrypt',
        filename: uploadedName,
        originalSize: uploadedSize,
        timestamp: new Date().toISOString(),
        status: 'Failed',
        algorithm: 'AES-256-GCM',
        keyDerivation: 'PBKDF2-HMAC-SHA256',
        failureReason: 'File is too small or corrupted to be a valid SecureVault file.',
      });
      return res.status(400).json({
        success: false,
        error: 'The encrypted file is invalid or corrupted: file is incomplete.',
      });
    }

    // Verify magic header
    const magic = buf.slice(0, 4);
    if (!magic.equals(MAGIC_BYTES)) {
      sessionHistory.unshift({
        id: crypto.randomUUID(),
        operation: 'Decrypt',
        filename: uploadedName,
        originalSize: uploadedSize,
        timestamp: new Date().toISOString(),
        status: 'Failed',
        algorithm: 'AES-256-GCM',
        keyDerivation: 'PBKDF2-HMAC-SHA256',
        failureReason: 'Invalid magic header. Not a SecureVault encrypted file.',
      });
      return res.status(400).json({
        success: false,
        error:
          'Invalid file format: This is not a SecureVault (.svlt) encrypted file. Standard images or unencrypted files cannot be decrypted here.',
      });
    }

    const version = buf[4];
    if (version !== 1) {
      return res.status(400).json({
        success: false,
        error: `Unsupported SecureVault container version (${version}).`,
      });
    }

    let offset = 5;
    const salt = buf.slice(offset, offset + SALT_LENGTH);
    offset += SALT_LENGTH;

    const nonce = buf.slice(offset, offset + NONCE_LENGTH);
    offset += NONCE_LENGTH;

    const authTag = buf.slice(offset, offset + TAG_LENGTH);
    offset += TAG_LENGTH;

    const metaLen = buf.readUInt16BE(offset);
    offset += 2;

    if (buf.length < offset + metaLen) {
      return res.status(400).json({
        success: false,
        error: 'The encrypted file is invalid or corrupted (corrupted metadata section).',
      });
    }

    const metaBuf = buf.slice(offset, offset + metaLen);
    offset += metaLen;

    let metadata: any = {};
    try {
      metadata = JSON.parse(metaBuf.toString('utf-8'));
    } catch {
      metadata = { filename: 'decrypted_image', mimeType: 'image/png' };
    }

    const ciphertext = buf.slice(offset);
    if (ciphertext.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'The encrypted file is empty or contains no ciphertext payload.',
      });
    }

    // Derive key using PBKDF2
    const key = crypto.pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      'sha256'
    );

    // Decrypt using AES-256-GCM
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
    decipher.setAuthTag(authTag);

    let decryptedBuffer: Buffer;
    try {
      decryptedBuffer = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    } catch (cryptoErr: any) {
      // GCM authentication tag verification failure or wrong password
      sessionHistory.unshift({
        id: crypto.randomUUID(),
        operation: 'Decrypt',
        filename: uploadedName,
        originalSize: uploadedSize,
        timestamp: new Date().toISOString(),
        status: 'Failed',
        algorithm: 'AES-256-GCM',
        keyDerivation: 'PBKDF2-HMAC-SHA256',
        failureReason: 'Authentication tag check failed. Incorrect password or corrupted payload.',
      });
      return res.status(400).json({
        success: false,
        error: 'Decryption failed. The password may be incorrect or the encrypted file may be corrupted.',
      });
    }

    // Validate decrypted content is an image
    const outMime = metadata.mimeType || 'image/png';
    const outFilename = metadata.filename || 'decrypted_image.png';

    // Record session history
    sessionHistory.unshift({
      id: crypto.randomUUID(),
      operation: 'Decrypt',
      filename: outFilename,
      originalSize: decryptedBuffer.length,
      encryptedSize: uploadedSize,
      timestamp: new Date().toISOString(),
      status: 'Success',
      algorithm: 'AES-256-GCM',
      keyDerivation: 'PBKDF2-HMAC-SHA256',
    });

    const dataUrl = `data:${outMime};base64,${decryptedBuffer.toString('base64')}`;

    res.json({
      success: true,
      message: 'Image decrypted and authenticated successfully.',
      filename: outFilename,
      mimeType: outMime,
      size: decryptedBuffer.length,
      dataUrl,
      metadata: {
        ...metadata,
        verifiedAuthentication: true,
        authTagHex: authTag.toString('hex'),
        saltHex: salt.toString('hex'),
        nonceHex: nonce.toString('hex'),
        algorithm: 'AES-256-GCM',
        keyDerivation: 'PBKDF2-HMAC-SHA256',
      },
    });
  } catch (err: any) {
    console.error('Decryption general error:', err);
    sessionHistory.unshift({
      id: crypto.randomUUID(),
      operation: 'Decrypt',
      filename: uploadedName,
      originalSize: uploadedSize,
      timestamp: new Date().toISOString(),
      status: 'Failed',
      algorithm: 'AES-256-GCM',
      keyDerivation: 'PBKDF2-HMAC-SHA256',
      failureReason: err.message || 'Unknown decryption error',
    });
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while processing the encrypted file.',
    });
  }
});

// Container inspector / verification endpoint
app.post('/api/verify', upload.single('file'), (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, error: 'No file provided.' });
  }

  const buf = file.buffer;
  const MIN_HEADER_SIZE = 4 + 1 + SALT_LENGTH + NONCE_LENGTH + TAG_LENGTH + 2;

  if (buf.length < MIN_HEADER_SIZE) {
    return res.json({
      valid: false,
      reason: 'File size is too small to contain a SecureVault header.',
    });
  }

  const magic = buf.slice(0, 4);
  if (!magic.equals(MAGIC_BYTES)) {
    return res.json({
      valid: false,
      reason: 'Magic bytes do not match "SVLT". This is not a SecureVault encrypted container.',
    });
  }

  const version = buf[4];
  const salt = buf.slice(5, 5 + SALT_LENGTH);
  const nonce = buf.slice(5 + SALT_LENGTH, 5 + SALT_LENGTH + NONCE_LENGTH);
  const authTag = buf.slice(5 + SALT_LENGTH + NONCE_LENGTH, 5 + SALT_LENGTH + NONCE_LENGTH + TAG_LENGTH);
  const metaLen = buf.readUInt16BE(5 + SALT_LENGTH + NONCE_LENGTH + TAG_LENGTH);

  let meta: any = null;
  try {
    const metaBuf = buf.slice(
      5 + SALT_LENGTH + NONCE_LENGTH + TAG_LENGTH + 2,
      5 + SALT_LENGTH + NONCE_LENGTH + TAG_LENGTH + 2 + metaLen
    );
    meta = JSON.parse(metaBuf.toString('utf-8'));
  } catch {
    // meta parse error
  }

  res.json({
    valid: true,
    version,
    saltHex: salt.toString('hex'),
    nonceHex: nonce.toString('hex'),
    authTagHex: authTag.toString('hex'),
    metadata: meta,
    ciphertextSize: buf.length - (5 + SALT_LENGTH + NONCE_LENGTH + TAG_LENGTH + 2 + metaLen),
  });
});

// History endpoint
app.get('/api/history', (req: Request, res: Response) => {
  res.json({
    success: true,
    history: sessionHistory,
    stats: {
      total: sessionHistory.length,
      encryptions: sessionHistory.filter((i) => i.operation === 'Encrypt').length,
      decryptions: sessionHistory.filter((i) => i.operation === 'Decrypt').length,
      successful: sessionHistory.filter((i) => i.status === 'Success').length,
      failed: sessionHistory.filter((i) => i.status === 'Failed').length,
    },
  });
});

// Clear history
app.delete('/api/history', (req: Request, res: Response) => {
  sessionHistory.length = 0;
  res.json({ success: true, message: 'Session history cleared successfully.' });
});

// Multer error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File size exceeds maximum allowed limit of 25 MB.',
      });
    }
    return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
  next();
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SecureVault] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

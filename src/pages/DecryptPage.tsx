import React, { useState, useRef, useEffect } from 'react';
import { Page, DecryptResult } from '../types/crypto';
import {
  UploadCloud,
  FileKey,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle2,
  Download,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Layers,
  Cpu,
  FileX,
  FileCheck2,
} from 'lucide-react';
import {
  decryptFileApi,
  verifyContainerApi,
  formatBytes,
  downloadDataUrl,
} from '../services/api';

interface DecryptPageProps {
  setCurrentPage: (p: Page) => void;
  onOperationSuccess: () => void;
  preloadedFile?: File | null;
  clearPreloadedFile?: () => void;
}

export const DecryptPage: React.FC<DecryptPageProps> = ({
  setCurrentPage,
  onOperationSuccess,
  preloadedFile,
  clearPreloadedFile,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [containerInfo, setContainerInfo] = useState<{
    valid: boolean;
    reason?: string;
    version?: number;
    saltHex?: string;
    nonceHex?: string;
    authTagHex?: string;
    metadata?: any;
    ciphertextSize?: number;
  } | null>(null);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionStep, setDecryptionStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'auth' | 'format' | 'generic' | null>(null);
  const [result, setResult] = useState<DecryptResult | null>(null);

  const [decryptedDimensions, setDecryptedDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If a preloaded file was passed from the Encrypt page, auto-select it
  useEffect(() => {
    if (preloadedFile) {
      handleFileSelect(preloadedFile);
      if (clearPreloadedFile) clearPreloadedFile();
    }
  }, [preloadedFile]);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setErrorType(null);
    setResult(null);
    setDecryptedDimensions(null);
    setSelectedFile(file);

    // Run container inspection without needing password
    try {
      const info = await verifyContainerApi(file);
      setContainerInfo(info);
      if (!info.valid) {
        setError(info.reason || 'The selected file is not a valid SecureVault encrypted file.');
        setErrorType('format');
      }
    } catch {
      setContainerInfo({ valid: true });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorType(null);

    if (!selectedFile) {
      setError('Please select or upload a SecureVault encrypted (.svlt) file.');
      return;
    }

    if (!password) {
      setError('Enter Decryption Password');
      return;
    }

    try {
      setIsDecrypting(true);

      // Multi-step progress animation
      setDecryptionStep('Reading encrypted file header and container metadata...');
      await new Promise((r) => setTimeout(r, 350));

      setDecryptionStep('Validating SecureVault magic bytes and parameters...');
      await new Promise((r) => setTimeout(r, 350));

      setDecryptionStep('Deriving 256-bit AES key via PBKDF2-HMAC-SHA256 (100k rounds)...');
      await new Promise((r) => setTimeout(r, 400));

      setDecryptionStep('Verifying 128-bit GCM authentication tag integrity...');
      await new Promise((r) => setTimeout(r, 300));

      setDecryptionStep('Decrypting ciphertext and restoring image stream...');
      const res = await decryptFileApi(selectedFile, password);

      setResult(res);

      // Measure dimensions of the restored image
      const img = new Image();
      img.onload = () => {
        setDecryptedDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = res.dataUrl;

      onOperationSuccess();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('password may be incorrect') || msg.includes('Authentication tag')) {
        setError('Decryption failed. The password may be incorrect.');
        setErrorType('auth');
      } else if (msg.includes('not a SecureVault') || msg.includes('magic header') || msg.includes('format')) {
        setError('Invalid file format. Normal unencrypted images cannot be decrypted here.');
        setErrorType('format');
      } else if (msg.includes('corrupted') || msg.includes('too small')) {
        setError('The encrypted file is invalid or corrupted.');
        setErrorType('format');
      } else {
        setError(msg || 'An unexpected error occurred during decryption.');
        setErrorType('generic');
      }
    } finally {
      setIsDecrypting(false);
      setDecryptionStep('');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    downloadDataUrl(result.dataUrl, result.filename);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setContainerInfo(null);
    setPassword('');
    setResult(null);
    setError(null);
    setErrorType(null);
    setDecryptedDimensions(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Title & Description */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-mono">
          <Unlock className="w-3.5 h-3.5 text-purple-400" />
          <span>Authenticated Decryption & Integrity Verification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Decrypt Image
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Upload your <code className="text-purple-300 font-mono">.svlt</code> encrypted file and enter your password to authenticate and restore the original image.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {!result ? (
          <form onSubmit={handleDecrypt} className="space-y-6">
            {/* Step 1: Upload Container */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[11px]">
                    1
                  </span>
                  Upload Encrypted Container (.svlt)
                </label>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
              </div>

              {!selectedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-purple-400 bg-purple-500/10 scale-[1.01]'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-950/80'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                      <FileKey className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Click to browse or drag and drop your .svlt file
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Encrypted SecureVault file containing ciphertext and auth tag
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Selected Encrypted File Info */
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
                        <FileKey className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md font-mono">
                          {selectedFile.name}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">
                          {formatBytes(selectedFile.size)}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {containerInfo?.valid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                          Valid SVLT Container
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                          <FileX className="w-3.5 h-3.5 text-rose-400" />
                          Invalid Format
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Container Header Specs */}
                  {containerInfo?.valid && (
                    <div className="pt-2 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80">
                        <span className="text-slate-500 block uppercase text-[10px]">Header</span>
                        <span className="text-cyan-400 font-bold">SVLT (v1)</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80">
                        <span className="text-slate-500 block uppercase text-[10px]">Auth Tag</span>
                        <span className="text-emerald-400 font-medium">128-bit MAC</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80">
                        <span className="text-slate-500 block uppercase text-[10px]">Salt</span>
                        <span className="text-slate-300 font-medium">16B Random</span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80">
                        <span className="text-slate-500 block uppercase text-[10px]">Target File</span>
                        <span className="text-purple-300 truncate block">
                          {containerInfo.metadata?.filename || 'Encrypted Image'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Password */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[11px]">
                  2
                </span>
                Enter Decryption Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the password used to encrypt this file"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                AES-GCM verifies that the password and ciphertext are unmodified. An incorrect password will be rejected immediately without corrupting your screen.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-rose-200">
                  <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>
                    {errorType === 'auth'
                      ? 'Authentication Failure'
                      : errorType === 'format'
                      ? 'Invalid File Structure'
                      : 'Decryption Error'}
                  </span>
                </div>
                <p className="pl-6 text-rose-300/90">{error}</p>
                {errorType === 'auth' && (
                  <p className="pl-6 text-[11px] text-slate-400 pt-1">
                    Security Note: In AES-256-GCM, the GHASH authentication tag check fails if a single bit of the key or ciphertext does not match.
                  </p>
                )}
              </div>
            )}

            {/* Decryption progress animation */}
            {isDecrypting && (
              <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-5 space-y-3 animate-pulse">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-400 flex items-center gap-2">
                    <Cpu className="w-4 h-4 animate-spin text-purple-400" />
                    Authenticating & Decrypting...
                  </span>
                  <span className="text-slate-400">AES-256-GCM</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-400 to-cyan-500 h-full w-4/5 animate-pulse rounded-full"></div>
                </div>
                <p className="text-xs text-slate-300 font-mono">{decryptionStep}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isDecrypting || !selectedFile || !password || Boolean(containerInfo && !containerInfo.valid)}
                className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>{isDecrypting ? 'Decrypting Image...' : 'Decrypt Image'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Success Screen */
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Image decrypted successfully.</h3>
                <p className="text-xs text-emerald-300/90">
                  Authentication tag verified (100% genuine). Ciphertext restored to original image.
                </p>
              </div>
            </div>

            {/* Restored Image Preview & Details */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Image Preview Box */}
                <div className="relative w-full md:w-64 h-56 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center group flex-shrink-0">
                  <img
                    src={result.dataUrl}
                    alt={result.filename}
                    className="max-w-full max-h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 border border-emerald-800">
                    AUTHENTICATED
                  </div>
                </div>

                {/* Details list */}
                <div className="flex-1 w-full space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Restored Filename</span>
                      <span className="text-white font-medium truncate block">{result.filename}</span>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">File Format</span>
                      <span className="text-cyan-300 font-medium">{result.mimeType}</span>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Decrypted Size</span>
                      <span className="text-emerald-400 font-medium">{formatBytes(result.size)}</span>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Image Dimensions</span>
                      <span className="text-purple-300 font-medium">
                        {decryptedDimensions
                          ? `${decryptedDimensions.width} × ${decryptedDimensions.height} px`
                          : 'Original Resolution'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Algorithm: AES-256-GCM</span>
                    <span className="text-emerald-400">Tag Verification: PASSED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleDownload}
                className="w-full py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Download Decrypted Image ({result.filename})</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setCurrentPage('encrypt')}
                  className="py-3 px-4 rounded-xl font-medium text-cyan-300 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <span>Encrypt Another Image</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleReset}
                  className="py-3 px-4 rounded-xl font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Decrypt Another Container</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

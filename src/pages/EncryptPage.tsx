import React, { useState, useRef, useEffect } from 'react';
import { Page, EncryptResult } from '../types/crypto';
import {
  UploadCloud,
  FileImage,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Download,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  ArrowRight,
  Layers,
  Cpu,
} from 'lucide-react';
import {
  encryptImageApi,
  formatBytes,
  downloadBase64,
} from '../services/api';
import { PasswordStrengthMeter, getPasswordStrength } from '../components/PasswordStrengthMeter';
import { CryptoDetailsModal } from '../components/CryptoDetailsModal';
import { SAMPLE_PRESETS, createSampleImageFile, SampleImageDef } from '../utils/sampleImages';

interface EncryptPageProps {
  setCurrentPage: (p: Page) => void;
  onOperationSuccess: () => void;
  setDecryptionFileToPass?: (file: File) => void;
}

export const EncryptPage: React.FC<EncryptPageProps> = ({
  setCurrentPage,
  onOperationSuccess,
  setDecryptionFileToPass,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionStep, setEncryptionStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EncryptResult | null>(null);
  const [showCryptoModal, setShowCryptoModal] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = (file: File) => {
    setError(null);
    setResult(null);

    // Validate size limit (25 MB)
    if (file.size > 25 * 1024 * 1024) {
      setError('File exceeds maximum allowed size of 25 MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
      setError(`Unsupported image format (${ext || file.type}). Please select a JPG, PNG, WEBP, or BMP file.`);
      return;
    }

    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;
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

  const handleLoadSample = async (preset: SampleImageDef) => {
    try {
      const sampleFile = await createSampleImageFile(preset);
      handleFileSelect(sampleFile);
    } catch (err: any) {
      setError('Failed to generate sample image: ' + err.message);
    }
  };

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedFile) {
      setError('Please select or upload an image file.');
      return;
    }

    if (!password) {
      setError('Please enter an encryption password.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    try {
      setIsEncrypting(true);

      // Smooth step updates mimicking the actual cryptographic pipeline
      setEncryptionStep('Generating secure 256-bit key via PBKDF2 (100,000 rounds)...');
      await new Promise((r) => setTimeout(r, 400));

      setEncryptionStep('Encrypting image blocks using AES-256-GCM authenticated cipher...');
      await new Promise((r) => setTimeout(r, 400));

      setEncryptionStep('Computing 128-bit authentication tag and packing SecureVault container...');
      const res = await encryptImageApi(selectedFile, password);

      setResult(res);
      onOperationSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred during encryption.');
    } finally {
      setIsEncrypting(false);
      setEncryptionStep('');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    downloadBase64(
      result.containerData,
      result.encryptedFilename,
      'application/octet-stream'
    );
  };

  const handleGoToDecrypt = () => {
    if (result && setDecryptionFileToPass) {
      // Create a File object from the containerData to automatically hand over to Decrypt page
      const byteCharacters = atob(result.containerData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const file = new File([byteArray], result.encryptedFilename, {
        type: 'application/octet-stream',
      });
      setDecryptionFileToPass(file);
    }
    setCurrentPage('decrypt');
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageDimensions(null);
    setPassword('');
    setConfirmPassword('');
    setResult(null);
    setError(null);
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Title & Description */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span>AES-256-GCM + PBKDF2 Key Derivation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Encrypt Image
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Convert your image into a tamper-evident, encrypted <code className="text-cyan-400 font-mono">.svlt</code> file protected by authenticated AES-256.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {!result ? (
          <form onSubmit={handleEncrypt} className="space-y-6">
            {/* Step 1: Upload or Sample Picker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px]">
                    1
                  </span>
                  Select or Upload Image
                </label>
                <span className="text-[11px] text-slate-500">Max size: 25 MB</span>
              </div>

              {/* Upload Dropzone */}
              {!selectedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-950/80'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.bmp,image/jpeg,image/png,image/webp,image/bmp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Click to browse or drag and drop image here
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Supports JPEG, PNG, WEBP, and BMP formats
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Selected File Preview Box */
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative w-36 h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0 group">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-cyan-300 font-mono bg-slate-900/90 px-2.5 py-1 rounded border border-cyan-500/40"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left w-full">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white truncate max-w-sm">
                        {selectedFile.name}
                      </h4>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Size</span>
                        <span className="font-mono text-cyan-300 font-medium">
                          {formatBytes(selectedFile.size)}
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Type</span>
                        <span className="font-mono text-white font-medium">
                          {selectedFile.type || 'image/png'}
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Dimensions</span>
                        <span className="font-mono text-purple-300 font-medium">
                          {imageDimensions
                            ? `${imageDimensions.width} × ${imageDimensions.height} px`
                            : 'Analyzing...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sample Images Quick Loader (College demo feature) */}
              {!selectedFile && (
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Or test immediately with a sample image preset:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SAMPLE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleLoadSample(preset)}
                        className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 text-left transition-all group"
                      >
                        <span className="text-xs font-semibold text-slate-200 block truncate group-hover:text-cyan-300 font-mono">
                          {preset.type}
                        </span>
                        <span className="text-[10px] text-slate-500 line-clamp-1">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Password and Confirmation */}
            <div className="space-y-4 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px]">
                  2
                </span>
                Encryption Key & Passphrase
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password field */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">
                    Enter Encryption Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="e.g. MasterPass@2026!"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors pr-10 font-mono ${
                        confirmPassword && confirmPassword !== password
                          ? 'border-rose-500 focus:border-rose-400'
                          : 'border-slate-800 focus:border-cyan-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-[11px] text-rose-400">Passwords do not match.</p>
                  )}
                </div>
              </div>

              {/* Password strength indicator */}
              <PasswordStrengthMeter password={password} />
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Encryption progress animation */}
            {isEncrypting && (
              <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl p-5 space-y-3 animate-pulse">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 flex items-center gap-2">
                    <Cpu className="w-4 h-4 animate-spin text-cyan-400" />
                    Encrypting Image Payload...
                  </span>
                  <span className="text-slate-400">AES-256-GCM</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full w-4/5 animate-pulse rounded-full"></div>
                </div>
                <p className="text-xs text-slate-300 font-mono">{encryptionStep}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isEncrypting || !selectedFile || !password || password !== confirmPassword}
                className="w-full py-4 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{isEncrypting ? 'Encrypting Image...' : 'Encrypt Image'}</span>
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
                <h3 className="font-bold text-white text-base">Image encrypted successfully.</h3>
                <p className="text-xs text-emerald-300/90">
                  Protected with authenticated AES-256-GCM. Plaintext image data converted to ciphertext.
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <span className="text-slate-500 uppercase text-[10px] block">Original File</span>
                  <p className="text-white font-medium truncate">{result.originalFilename}</p>
                  <p className="text-slate-400">{formatBytes(result.originalSize)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 uppercase text-[10px] block">Encrypted Container</span>
                  <p className="text-cyan-300 font-medium truncate">{result.encryptedFilename}</p>
                  <p className="text-slate-400">{formatBytes(result.encryptedSize)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 uppercase text-[10px] block">Cipher Algorithm</span>
                  <p className="text-white font-medium">AES-256-GCM (Authenticated)</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 uppercase text-[10px] block">Key Derivation</span>
                  <p className="text-purple-300 font-medium">PBKDF2-HMAC-SHA256 (100k rounds)</p>
                </div>
              </div>

              {/* Cryptographic Parameters Preview */}
              <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Unique Salt & Nonce generated for this file.</span>
                </div>
                <button
                  onClick={() => setShowCryptoModal(true)}
                  className="text-cyan-400 hover:text-cyan-300 font-mono text-xs flex items-center gap-1 transition-colors underline underline-offset-4"
                >
                  <Info className="w-3.5 h-3.5" />
                  Inspect Cryptographic Parameters
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleDownload}
                className="w-full py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Download Encrypted File ({result.encryptedFilename})</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleGoToDecrypt}
                  className="py-3 px-4 rounded-xl font-medium text-cyan-300 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <span>Test Decryption with this file</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleReset}
                  className="py-3 px-4 rounded-xl font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Encrypt Another Image</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Crypto Details Modal */}
      {result && (
        <CryptoDetailsModal
          details={result.cryptoDetails}
          isOpen={showCryptoModal}
          onClose={() => setShowCryptoModal(false)}
          title={`Crypto Breakdown: ${result.originalFilename}`}
        />
      )}
    </div>
  );
};

export type Page = 'home' | 'encrypt' | 'decrypt' | 'history' | 'security';

export interface CryptoDetails {
  algorithm: string;
  keyDerivation: string;
  iterations: number;
  keyLengthBits: number;
  saltHex: string;
  nonceHex: string;
  authTagHex: string;
  formatVersion: number;
}

export interface EncryptResult {
  success: boolean;
  message: string;
  encryptedFilename: string;
  originalFilename: string;
  originalSize: number;
  encryptedSize: number;
  mimeType: string;
  containerData: string; // Base64 representation of .svlt
  cryptoDetails: CryptoDetails;
}

export interface DecryptResult {
  success: boolean;
  message: string;
  filename: string;
  mimeType: string;
  size: number;
  dataUrl: string;
  metadata: {
    filename?: string;
    mimeType?: string;
    originalSize?: number;
    createdAt?: string;
    algorithm?: string;
    saltHex?: string;
    nonceHex?: string;
    authTagHex?: string;
    verifiedAuthentication?: boolean;
    [key: string]: any;
  };
}

export interface HistoryItem {
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

export interface HistoryStats {
  total: number;
  encryptions: number;
  decryptions: number;
  successful: number;
  failed: number;
}

export interface HealthInfo {
  status: string;
  service: string;
  version: string;
  algorithm: string;
  keyDerivation: string;
  iterations: number;
  keySizeBits: number;
  maxFileSizeMb: number;
  supportedFormats: string[];
}

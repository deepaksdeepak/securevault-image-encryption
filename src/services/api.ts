import {
  HealthInfo,
  EncryptResult,
  DecryptResult,
  HistoryItem,
  HistoryStats,
} from '../types/crypto';

export async function getHealth(): Promise<HealthInfo> {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new Error('Health check failed');
  }
  return res.json();
}

export async function encryptImageApi(file: File, password: string): Promise<EncryptResult> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('password', password);

  const res = await fetch('/api/encrypt', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Encryption failed on server');
  }

  return data;
}

export async function decryptFileApi(file: File, password: string): Promise<DecryptResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);

  const res = await fetch('/api/decrypt', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Decryption failed on server');
  }

  return data;
}

export async function verifyContainerApi(file: File): Promise<{
  valid: boolean;
  reason?: string;
  version?: number;
  saltHex?: string;
  nonceHex?: string;
  authTagHex?: string;
  metadata?: any;
  ciphertextSize?: number;
}> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/verify', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    return { valid: false, reason: 'Failed to inspect file.' };
  }
  return res.json();
}

export async function getHistory(): Promise<{
  history: HistoryItem[];
  stats: HistoryStats;
}> {
  const res = await fetch('/api/history');
  if (!res.ok) {
    throw new Error('Failed to fetch history');
  }
  const data = await res.json();
  return {
    history: data.history || [],
    stats: data.stats || {
      total: 0,
      encryptions: 0,
      decryptions: 0,
      successful: 0,
      failed: 0,
    },
  };
}

export async function clearHistoryApi(): Promise<void> {
  const res = await fetch('/api/history', {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to clear history');
  }
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function downloadBase64(base64: string, filename: string, mimeType: string = 'application/octet-stream') {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

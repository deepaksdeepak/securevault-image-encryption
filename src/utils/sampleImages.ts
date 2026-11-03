/**
 * Utility to generate test PNG images on-the-fly using HTML5 Canvas.
 * Ideal for quick testing and college project demonstrations.
 */

export interface SampleImageDef {
  id: string;
  name: string;
  description: string;
  type: string;
  colorScheme: {
    bgStart: string;
    bgEnd: string;
    accent: string;
    border: string;
  };
}

export const SAMPLE_PRESETS: SampleImageDef[] = [
  {
    id: 'id_badge',
    name: 'Confidential_Employee_Badge.png',
    description: 'High-security biometric identity badge with clearance level',
    type: 'Identity Document',
    colorScheme: {
      bgStart: '#0f172a',
      bgEnd: '#0284c7',
      accent: '#38bdf8',
      border: '#0ea5e9',
    },
  },
  {
    id: 'medical_scan',
    name: 'Diagnostic_Patient_Scan_098.png',
    description: 'HIPAA-protected medical radiology scan with patient vitals',
    type: 'Medical Record',
    colorScheme: {
      bgStart: '#052e16',
      bgEnd: '#064e3b',
      accent: '#34d399',
      border: '#10b981',
    },
  },
  {
    id: 'cyber_blueprint',
    name: 'Architectural_Defense_Blueprint.png',
    description: 'Proprietary server architecture schema with confidential keys',
    type: 'Proprietary IP',
    colorScheme: {
      bgStart: '#3b0764',
      bgEnd: '#1e1b4b',
      accent: '#c084fc',
      border: '#a855f7',
    },
  },
  {
    id: 'financial_ledger',
    name: 'Encrypted_Treasury_Audit_Q4.png',
    description: 'Confidential financial transaction ledger and balances',
    type: 'Financial Data',
    colorScheme: {
      bgStart: '#451a03',
      bgEnd: '#78350f',
      accent: '#fbbf24',
      border: '#f59e0b',
    },
  },
];

export function createSampleImageFile(preset: SampleImageDef): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    // 1. Background gradient
    const grad = ctx.createLinearGradient(0, 0, 640, 420);
    grad.addColorStop(0, preset.colorScheme.bgStart);
    grad.addColorStop(1, preset.colorScheme.bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 420);

    // 2. Tech grid overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 640; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 420);
      ctx.stroke();
    }
    for (let y = 0; y < 420; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(640, y);
      ctx.stroke();
    }

    // 3. Cyber border
    ctx.strokeStyle = preset.colorScheme.border;
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, 610, 390);

    // Corner brackets
    ctx.lineWidth = 4;
    ctx.strokeStyle = preset.colorScheme.accent;
    const bracketSize = 24;
    // top-left
    ctx.beginPath();
    ctx.moveTo(15, 15 + bracketSize);
    ctx.lineTo(15, 15);
    ctx.lineTo(15 + bracketSize, 15);
    ctx.stroke();
    // top-right
    ctx.beginPath();
    ctx.moveTo(625 - bracketSize, 15);
    ctx.lineTo(625, 15);
    ctx.lineTo(625, 15 + bracketSize);
    ctx.stroke();
    // bottom-left
    ctx.beginPath();
    ctx.moveTo(15, 405 - bracketSize);
    ctx.lineTo(15, 405);
    ctx.lineTo(15 + bracketSize, 405);
    ctx.stroke();
    // bottom-right
    ctx.beginPath();
    ctx.moveTo(625 - bracketSize, 405);
    ctx.lineTo(625, 405);
    ctx.lineTo(625, 405 - bracketSize);
    ctx.stroke();

    // 4. Header Badge
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(35, 35, 570, 60);

    ctx.fillStyle = preset.colorScheme.accent;
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`CLASSIFIED // ${preset.type.toUpperCase()}`, 50, 72);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(preset.name.replace('.png', '').replace(/_/g, ' '), 50, 140);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`DOCUMENT REF: SEC-VAULT-2026-X992`, 50, 175);
    ctx.fillText(`SECURITY CLEARANCE: LEVEL 5 (AES-256 REQUIRED)`, 50, 200);
    ctx.fillText(`TIMESTAMP: ${new Date().toISOString()}`, 50, 225);

    // 5. Simulated data block / graphic
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(50, 250, 540, 120);

    ctx.fillStyle = preset.colorScheme.accent;
    ctx.font = '12px monospace';
    ctx.fillText('ENCRYPTION TARGET PAYLOAD:', 70, 280);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('0x7F 0x45 0x4C 0x46 0x02 0x01 0x01 0x00 [SENSITIVE BIOMETRIC / GEOMETRIC STREAM]', 70, 305);
    ctx.fillText('PROTECT WITH NIST SP 800-38D AES-GCM BEFORE EXTERNAL TRANSMISSION', 70, 330);

    ctx.fillStyle = '#64748b';
    ctx.fillText('SecureVault Cryptographic Test Artifact • Ready for AES-256-GCM', 70, 355);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], preset.name, { type: 'image/png' });
        resolve(file);
      } else {
        reject(new Error('Failed to create image blob'));
      }
    }, 'image/png');
  });
}

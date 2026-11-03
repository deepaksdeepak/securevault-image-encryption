import React from 'react';
import { X, ShieldCheck, Key, Hash, Layers, Lock, Copy, Check } from 'lucide-react';
import { CryptoDetails } from '../types/crypto';

interface CryptoDetailsModalProps {
  details: CryptoDetails;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const CryptoDetailsModal: React.FC<CryptoDetailsModalProps> = ({
  details,
  isOpen,
  onClose,
  title = 'Cryptographic Parameters & Security Specs',
}) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-mono">{title}</h3>
              <p className="text-xs text-slate-400">Authenticated AES-256-GCM + PBKDF2-HMAC-SHA256</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Algorithm</span>
              <span className="text-sm font-semibold text-cyan-400 font-mono">{details.algorithm}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Key Size</span>
              <span className="text-sm font-semibold text-white font-mono">{details.keyLengthBits}-bit (32B)</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Iterations</span>
              <span className="text-sm font-semibold text-emerald-400 font-mono">{details.iterations.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Version</span>
              <span className="text-sm font-semibold text-purple-400 font-mono">v{details.formatVersion}</span>
            </div>
          </div>

          {/* Cryptographic Parameters */}
          <div className="space-y-3 pt-2">
            {/* Salt */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  Cryptographic Salt (16 Bytes / 128-bit)
                </span>
                <button
                  onClick={() => copyToClipboard(details.saltHex, 'salt')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {copiedKey === 'salt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'salt' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="font-mono text-xs text-cyan-300/90 break-all bg-slate-900/80 p-2 rounded border border-slate-800">
                {details.saltHex}
              </p>
              <p className="text-[11px] text-slate-500">
                Generated via cryptographically secure pseudo-random number generator (<code className="text-slate-400">os.urandom / crypto.randomBytes</code>). Defends against precomputed rainbow table attacks.
              </p>
            </div>

            {/* Nonce */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-purple-400" />
                  Initialization Vector / Nonce (12 Bytes / 96-bit)
                </span>
                <button
                  onClick={() => copyToClipboard(details.nonceHex, 'nonce')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {copiedKey === 'nonce' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'nonce' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="font-mono text-xs text-purple-300/90 break-all bg-slate-900/80 p-2 rounded border border-slate-800">
                {details.nonceHex}
              </p>
              <p className="text-[11px] text-slate-500">
                NIST SP 800-38D recommended 96-bit nonce length for optimal AES-GCM GHASH performance without pre-hash reduction.
              </p>
            </div>

            {/* Authentication Tag */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  GCM Authentication Tag / MAC (16 Bytes / 128-bit)
                </span>
                <button
                  onClick={() => copyToClipboard(details.authTagHex, 'tag')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {copiedKey === 'tag' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'tag' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="font-mono text-xs text-emerald-300/90 break-all bg-slate-900/80 p-2 rounded border border-slate-800">
                {details.authTagHex}
              </p>
              <p className="text-[11px] text-slate-500">
                Guarantees cryptographic integrity. If even 1 bit of ciphertext is modified or password is off by 1 character, tag verification fails instantly and no corrupted image is produced.
              </p>
            </div>
          </div>

          {/* SecureVault Binary Format breakdown */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              SecureVault (.svlt) Container Binary Map
            </h4>
            <div className="flex flex-wrap gap-1 font-mono text-[10px]">
              <span className="px-2 py-1 bg-cyan-950 text-cyan-300 rounded border border-cyan-800">
                [0..3] Magic: SVLT
              </span>
              <span className="px-2 py-1 bg-purple-950 text-purple-300 rounded border border-purple-800">
                [4] Ver: 0x01
              </span>
              <span className="px-2 py-1 bg-blue-950 text-blue-300 rounded border border-blue-800">
                [5..20] Salt (16B)
              </span>
              <span className="px-2 py-1 bg-amber-950 text-amber-300 rounded border border-amber-800">
                [21..32] Nonce (12B)
              </span>
              <span className="px-2 py-1 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
                [33..48] Auth Tag (16B)
              </span>
              <span className="px-2 py-1 bg-indigo-950 text-indigo-300 rounded border border-indigo-800">
                [49..50] MetaLen
              </span>
              <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
                JSON Metadata
              </span>
              <span className="px-2 py-1 bg-rose-950 text-rose-300 rounded border border-rose-800 font-bold">
                Ciphertext Payload (AES-GCM)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

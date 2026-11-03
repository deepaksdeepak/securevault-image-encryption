import React from 'react';
import { ShieldCheck, Cpu, Terminal, FileCode2, ExternalLink } from 'lucide-react';
import { Page } from '../types/crypto';

interface FooterProps {
  setCurrentPage: (p: Page) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 mt-20 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-white tracking-wide font-mono">
                SecureVault Cryptographic System
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              An advanced image encryption and decryption platform engineered with NIST-compliant
              AES-256-GCM (Galois/Counter Mode) authenticated encryption, 100,000-round PBKDF2-HMAC-SHA256
              key stretching, and unique cryptographic salt and nonce generation.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                AES-256-GCM
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                PBKDF2 (100,000 iter)
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                128-bit Salt & Tag
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                96-bit Nonce
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 font-mono">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Dashboard Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('encrypt')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Encrypt Image (.svlt)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('decrypt')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Decrypt Image
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('history')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Session Activity Log
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('security')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Security Architecture & Math
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 font-mono">
              Academic Project Notes
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400">•</span>
                <span>Zero plaintext password logging or retention.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400">•</span>
                <span>Cryptographic verification prevents silent file corruption.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400">•</span>
                <span>Complete full-stack implementation with Python FastAPI backend + Node runtime.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400">•</span>
                <span>Tamper-evident container verification via GCM authentication tag.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SecureVault – Image Encryption Using AES. College Major Project Edition.</p>
          <div className="flex items-center gap-4 font-mono">
            <span>FIPS 197 Standard Compliant</span>
            <span>•</span>
            <span>OWASP Recommended KDF</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

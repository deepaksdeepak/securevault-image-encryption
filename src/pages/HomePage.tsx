import React from 'react';
import { Page, HistoryItem, HistoryStats } from '../types/crypto';
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  FileCheck,
  Zap,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
} from 'lucide-react';
import { formatBytes } from '../services/api';

interface HomePageProps {
  setCurrentPage: (p: Page) => void;
  stats: HistoryStats;
  recentActivity: HistoryItem[];
}

export const HomePage: React.FC<HomePageProps> = ({
  setCurrentPage,
  stats,
  recentActivity,
}) => {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12">
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>NIST FIPS-197 AES-256-GCM Authenticated Encryption</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Protect Your Images with{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              AES-256 Encryption
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Encrypt and decrypt sensitive photos, confidential credentials, blueprints, and medical
            imaging using authenticated AES-256-GCM and PBKDF2-HMAC-SHA256 key stretching.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setCurrentPage('encrypt')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <Lock className="w-5 h-5 text-slate-950" />
              <span>Encrypt Image</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setCurrentPage('decrypt')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-cyan-300 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 transition-all flex items-center justify-center gap-2.5 shadow-[0_0_15px_rgba(6,182,212,0.1)] cursor-pointer"
            >
              <Unlock className="w-5 h-5 text-cyan-400" />
              <span>Decrypt Image</span>
            </button>

            <a
              href="/api/download-project-zip"
              download="securevault-project.zip"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-2.5 shadow-sm text-sm"
              title="Download full project ZIP to open and run in VS Code"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download Project ZIP (VS Code)</span>
            </a>
          </div>
        </div>

        {/* Interactive Visual Cybersecurity Pipeline */}
        <div className="mt-14 max-w-4xl mx-auto bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Cryptographic Workflow Pipeline
            </span>
            <span className="text-slate-500">Zero Plaintext Leakage</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center space-y-2 relative group hover:border-cyan-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-1">
                <FileCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-300 font-mono">1. Image Input</span>
              <span className="text-[11px] text-slate-500">JPG, PNG, WEBP, BMP up to 25 MB</span>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center space-y-2 relative group hover:border-cyan-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-1">
                <KeyRound className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-300 font-mono">2. PBKDF2-HMAC</span>
              <span className="text-[11px] text-slate-500">100k rounds + 128-bit random salt</span>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center space-y-2 relative group hover:border-cyan-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-1">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-300 font-mono">3. AES-256-GCM</span>
              <span className="text-[11px] text-slate-500">Galois Counter Mode + 96-bit nonce</span>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center space-y-2 relative group hover:border-cyan-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-1">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-300 font-mono">4. SecureVault (.svlt)</span>
              <span className="text-[11px] text-slate-500">Ciphertext + 128-bit MAC Auth Tag</span>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics & Statistics Bar */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Total Operations
            </span>
            <div className="text-3xl font-extrabold text-white font-mono">{stats.total}</div>
            <div className="text-[11px] text-slate-500 mt-1">Processed in session</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-1">
              Encryptions
            </span>
            <div className="text-3xl font-extrabold text-cyan-400 font-mono">
              {stats.encryptions}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Images converted to ciphertext</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <span className="text-xs font-mono text-purple-400 uppercase tracking-wider block mb-1">
              Decryptions
            </span>
            <div className="text-3xl font-extrabold text-purple-400 font-mono">
              {stats.decryptions}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Containers verified & restored</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block mb-1">
              Success Rate
            </span>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">
              {stats.total > 0
                ? `${Math.round((stats.successful / stats.total) * 100)}%`
                : '100%'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {stats.successful} verified successful
            </div>
          </div>
        </div>
      </section>

      {/* Core Security Features */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Why SecureVault AES-256?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Engineered with strict adherence to modern cryptographic standards to eliminate
            plaintext exposure, padding oracle exploits, and replay vulnerabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3 hover:border-cyan-500/40 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">AES-256-GCM Encryption</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides both confidentiality and message authenticity. The 256-bit key size is
              mathematically unbreakable against brute-force searches.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3 hover:border-purple-500/40 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">PBKDF2 Key Stretching</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Derives a 256-bit cryptographic key from any passphrase using 100,000 iterations of
              HMAC-SHA256, rendering GPU dictionary attacks computationally infeasible.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3 hover:border-blue-500/40 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Random Salt & Nonce</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every single encryption generates a freshly sampled 128-bit random salt and 96-bit
              random nonce. Identical images encrypted with the same password yield completely unique ciphertexts.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3 hover:border-emerald-500/40 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Tamper Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an attacker flips even a single bit in the ciphertext or attempts a wrong password,
              the GCM 128-bit authentication tag verification fails instantly, rejecting corrupted outputs.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Activity Table Preview */}
      <section className="max-w-6xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Recent Cryptographic Activity
            </h3>
            <p className="text-xs text-slate-400">Operations executed during this active session</p>
          </div>
          <button
            onClick={() => setCurrentPage('history')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No cryptographic operations recorded yet. Try encrypting an image above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Operation</th>
                    <th className="py-3 px-4">Target File</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Algorithm</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {recentActivity.slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                            item.operation === 'Encrypt'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                              : 'bg-purple-950 text-purple-300 border border-purple-800/60'
                          }`}
                        >
                          {item.operation === 'Encrypt' ? (
                            <Lock className="w-3 h-3 text-cyan-400" />
                          ) : (
                            <Unlock className="w-3 h-3 text-purple-400" />
                          )}
                          {item.operation}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200 max-w-xs truncate">
                        {item.filename}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {formatBytes(item.originalSize)}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        <span className="text-slate-300">{item.algorithm}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            item.status === 'Success' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {item.status === 'Success' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

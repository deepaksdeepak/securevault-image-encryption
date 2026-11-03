import React, { useState } from 'react';
import { HistoryItem, HistoryStats } from '../types/crypto';
import {
  History as HistoryIcon,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  ShieldAlert,
  ArrowUpDown,
  Download,
  Clock,
  HardDrive,
} from 'lucide-react';
import { formatBytes, clearHistoryApi } from '../services/api';

interface HistoryPageProps {
  history: HistoryItem[];
  stats: HistoryStats;
  onRefresh: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  history,
  stats,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'All' | 'Encrypted' | 'Decrypted' | 'Successful' | 'Failed'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all session activity history?')) {
      try {
        setIsClearing(true);
        await clearHistoryApi();
        onRefresh();
      } catch (err: any) {
        console.error('Failed to clear history:', err);
      } finally {
        setIsClearing(false);
      }
    }
  };

  const filteredHistory = history.filter((item) => {
    // Search filter
    const matchesSearch =
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.algorithm.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'All') return true;
    if (filter === 'Encrypted') return item.operation === 'Encrypt';
    if (filter === 'Decrypted') return item.operation === 'Decrypt';
    if (filter === 'Successful') return item.status === 'Success';
    if (filter === 'Failed') return item.status === 'Failed';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono mb-2">
            <HistoryIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Session Audit Log</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Operation History
          </h1>
          <p className="text-sm text-slate-400">
            Audit trail of image encryption and decryption operations during this active session.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            disabled={isClearing}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/30 hover:bg-rose-900/60 border border-rose-800/60 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 uppercase font-mono block">Total Ops</span>
          <span className="text-2xl font-bold text-white font-mono">{stats.total}</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-cyan-400 uppercase font-mono block">Encryptions</span>
          <span className="text-2xl font-bold text-cyan-400 font-mono">{stats.encryptions}</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-purple-400 uppercase font-mono block">Decryptions</span>
          <span className="text-2xl font-bold text-purple-400 font-mono">{stats.decryptions}</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-emerald-400 uppercase font-mono block">Successful</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono">{stats.successful}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 border border-slate-800 p-3.5 rounded-2xl">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['All', 'Encrypted', 'Decrypted', 'Successful', 'Failed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filter === tab
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by filename..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 mx-auto">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No matching activity records</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {history.length === 0
                ? 'Your session activity history is currently empty. Encrypt or decrypt an image to begin logging.'
                : 'No operations match your current search or filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Operation</th>
                  <th className="py-3.5 px-4">Filename</th>
                  <th className="py-3.5 px-4">Original Size</th>
                  <th className="py-3.5 px-4">Container Size</th>
                  <th className="py-3.5 px-4">Algorithm & KDF</th>
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 text-slate-200 font-medium max-w-xs truncate">
                      <div>{item.filename}</div>
                      {item.failureReason && (
                        <div className="text-[10px] text-rose-400 font-sans line-clamp-1 pt-0.5">
                          {item.failureReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {formatBytes(item.originalSize)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {item.encryptedSize ? formatBytes(item.encryptedSize) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{item.algorithm}</div>
                      <div className="text-[10px] text-slate-500">{item.keyDerivation}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      <div>{new Date(item.timestamp).toLocaleDateString()}</div>
                      <div className="text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
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

      {/* Security Privacy Notice */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-300">Security Guarantee:</strong> Passwords, derived encryption keys, and image byte content are strictly transient in-memory buffers and are never saved to disk or stored in this audit log.
        </p>
      </div>
    </div>
  );
};

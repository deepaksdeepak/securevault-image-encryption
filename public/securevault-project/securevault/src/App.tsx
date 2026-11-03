import React, { useState, useEffect } from 'react';
import { Page, HealthInfo, HistoryItem, HistoryStats } from './types/crypto';
import { getHealth, getHistory } from './services/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { EncryptPage } from './pages/EncryptPage';
import { DecryptPage } from './pages/DecryptPage';
import { HistoryPage } from './pages/HistoryPage';
import { SecurityPage } from './pages/SecurityPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<HistoryStats>({
    total: 0,
    encryptions: 0,
    decryptions: 0,
    successful: 0,
    failed: 0,
  });

  // Optional file handed over from Encrypt success to Decrypt page
  const [decryptionFileToPass, setDecryptionFileToPass] = useState<File | null>(null);

  const loadHealthAndHistory = async () => {
    try {
      const h = await getHealth();
      setHealth(h);
    } catch (err) {
      console.warn('Backend health check error:', err);
    }

    try {
      const histData = await getHistory();
      setHistory(histData.history);
      setStats(histData.stats);
    } catch (err) {
      console.warn('History fetch error:', err);
    }
  };

  useEffect(() => {
    loadHealthAndHistory();
  }, []);

  const handleOperationSuccess = () => {
    loadHealthAndHistory();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative selection:bg-cyan-500 selection:text-slate-950">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 cyber-grid opacity-25 pointer-events-none"></div>
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] radial-glow pointer-events-none"></div>
      <div className="fixed top-1/3 right-10 w-[600px] h-[600px] radial-glow-purple pointer-events-none"></div>

      {/* Main navigation header */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        health={health}
      />

      {/* Main page content area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        {currentPage === 'home' && (
          <HomePage
            setCurrentPage={setCurrentPage}
            stats={stats}
            recentActivity={history}
          />
        )}

        {currentPage === 'encrypt' && (
          <EncryptPage
            setCurrentPage={setCurrentPage}
            onOperationSuccess={handleOperationSuccess}
            setDecryptionFileToPass={setDecryptionFileToPass}
          />
        )}

        {currentPage === 'decrypt' && (
          <DecryptPage
            setCurrentPage={setCurrentPage}
            onOperationSuccess={handleOperationSuccess}
            preloadedFile={decryptionFileToPass}
            clearPreloadedFile={() => setDecryptionFileToPass(null)}
          />
        )}

        {currentPage === 'history' && (
          <HistoryPage
            history={history}
            stats={stats}
            onRefresh={loadHealthAndHistory}
          />
        )}

        {currentPage === 'security' && <SecurityPage />}
      </main>

      {/* Global footer */}
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

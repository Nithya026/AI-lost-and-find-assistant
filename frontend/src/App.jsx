import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ReportLostForm from './components/ReportLostForm';
import ReportFoundForm from './components/ReportFoundForm';
import MatchList from './components/MatchList';
import MatchDetailModal from './components/MatchDetailModal';
import EmailInboxModal from './components/EmailInboxModal';
import BrowseCatalog from './components/BrowseCatalog';
import AuthModal from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || '');
  
  const [stats, setStats] = useState({ total_lost: 0, total_found: 0, total_matches: 0, total_claimed: 0, recovery_rate: 0 });
  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchStats();
    fetchMatches();
    fetchNotifications();
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  };

  const fetchMatches = async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/matches', { headers });
      if (res.ok) setMatches(await res.json());
    } catch (e) {
      console.error("Error fetching matches:", e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/notifications', { headers });
      if (res.ok) setNotifications(await res.json());
    } catch (e) {
      console.error("Error fetching notifications:", e);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUser(await res.json());
      } else {
        // Token expired or invalid
        localStorage.removeItem('jwt_token');
        setToken('');
        setUser(null);
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setToken('');
    setUser(null);
    showToast("Logged out successfully");
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleTriggerAIScan = async () => {
    try {
      showToast("Running FAISS vector similarity search across all items...");
      const res = await fetch('/api/matches/scan', {
        method: 'POST',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
      fetchMatches();
      fetchStats();
      fetchNotifications();
      showToast(`AI Scan Finished! ${data.new_matches_created} new matches found.`);
    } catch (e) {
      console.error("Error running AI scan:", e);
    }
  };

  const handleReportSubmitted = (response) => {
    fetchStats();
    fetchMatches();
    fetchNotifications();
    showToast(`Report submitted! ${response.matches_found} potential AI matches identified.`);
    setActiveTab('matches');
  };

  const handleMatchClaimed = (matchId) => {
    fetchStats();
    fetchMatches();
    showToast("Item match successfully claimed and marked as recovered!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-bounce bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-400 text-xs font-semibold flex items-center gap-2">
          <span>🎯 {toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onTriggerScan={handleTriggerAIScan}
      />

      {/* Main Container View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            stats={stats} 
            matches={matches} 
            setActiveTab={setActiveTab}
            onSelectMatch={(m) => setSelectedMatch(m)}
            onTriggerScan={handleTriggerAIScan}
          />
        )}

        {activeTab === 'lost' && (
          <ReportLostForm 
            onSubmitSuccess={handleReportSubmitted}
            onCancel={() => setActiveTab('dashboard')}
            token={token}
          />
        )}

        {activeTab === 'found' && (
          <ReportFoundForm 
            onSubmitSuccess={handleReportSubmitted}
            onCancel={() => setActiveTab('dashboard')}
            token={token}
          />
        )}

        {activeTab === 'matches' && (
          <MatchList 
            matches={matches} 
            onSelectMatch={(m) => setSelectedMatch(m)}
            onClaimMatch={handleMatchClaimed}
            token={token}
          />
        )}

        {activeTab === 'catalog' && (
          <BrowseCatalog token={token} />
        )}

        {activeTab === 'emails' && (
          <EmailInboxModal notifications={notifications} />
        )}
      </main>

      {/* Match Detail Inspection Modal */}
      {selectedMatch && (
        <MatchDetailModal 
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onClaimMatch={handleMatchClaimed}
          token={token}
        />
      )}

      {/* JWT Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(userData, authToken) => {
            setUser(userData);
            setToken(authToken);
            showToast(`Welcome back, ${userData.full_name}!`);
          }}
        />
      )}

      {/* Modern Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 AI Lost & Found Assistant. Powered by Sentence Transformers, OpenCLIP & FAISS.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-slate-300">Dashboard</button>
            <button onClick={() => setActiveTab('catalog')} className="hover:text-slate-300">Item Search</button>
            <button onClick={() => setActiveTab('emails')} className="hover:text-slate-300">Email Audit</button>
          </div>
        </div>
      </footer>

    </div>
  );
}

import React, { useState } from 'react';
import { 
  Inbox, 
  Mail, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  Search,
  ChevronRight
} from 'lucide-react';

export default function EmailInboxModal({ notifications }) {
  const [selectedNotif, setSelectedNotif] = useState(notifications[0] || null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotifs = notifications.filter(n => 
    n.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.recipient_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-outfit">Automated Email Notification Audit</h2>
            <p className="text-xs text-slate-400">Live preview of HTML emails generated when match confidence &ge; 55%</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search email logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Main Mailbox View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        
        {/* Left Column: Email List (4 cols) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-4 border border-slate-800 space-y-3 max-h-[600px] overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Inbox ({filteredNotifs.length} Dispatch Logs)
          </h3>

          {filteredNotifs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No email notifications logged yet.
            </div>
          ) : (
            filteredNotifs.map((n) => (
              <div
                key={n.id}
                onClick={() => setSelectedNotif(n)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedNotif?.id === n.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {n.recipient_email}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(n.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-white mt-1 line-clamp-1">
                  {n.subject}
                </h4>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Sent via System
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: HTML Email Render View (8 cols) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col">
          {selectedNotif ? (
            <div className="space-y-4 flex-1 flex flex-col">
              
              {/* Email Envelope Info */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{selectedNotif.subject}</h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    {new Date(selectedNotif.sent_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-400">To:</strong> {selectedNotif.recipient_email}
                </p>
              </div>

              {/* Rendered HTML Sandbox */}
              <div className="flex-1 bg-white text-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-300 p-2">
                <iframe
                  title="Email Preview"
                  srcDoc={selectedNotif.body_html}
                  className="w-full h-full min-h-[450px] border-0 rounded-lg"
                />
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-slate-500 py-16">
              <Mail className="w-12 h-12 text-slate-600" />
              <p className="text-sm font-semibold">Select an email log from the left list to view HTML content</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

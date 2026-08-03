import React from 'react';
import StatsOverview from './StatsOverview';
import { 
  Sparkles, 
  PlusCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Mail, 
  Layers,
  MapPin,
  Clock
} from 'lucide-react';

export default function Dashboard({ stats, matches, setActiveTab, onSelectMatch, onTriggerScan }) {
  const pendingMatches = matches.filter(m => m.status === 'pending');

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-indigo-500/20 p-8 md:p-10">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            AI-Driven Vector Similarity & Image Recognition
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-outfit leading-tight">
            Intelligent Item Recovery powered by <span className="gradient-text">Artificial Intelligence</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Report lost items or turn in found belongings. Our dual-embedding AI model extracts sentence semantic vectors and OpenCLIP visual features to automatically cross-match reports in milliseconds.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab('lost')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-sm shadow-lg shadow-rose-500/25 transition-all hover:scale-105"
            >
              <PlusCircle className="w-5 h-5" />
              Report a Lost Item
            </button>

            <button
              onClick={() => setActiveTab('found')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition-all hover:scale-105"
            >
              <CheckCircle2 className="w-5 h-5" />
              Report a Found Item
            </button>

            <button
              onClick={() => setActiveTab('matches')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 font-semibold text-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              View Matches ({pendingMatches.length})
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <StatsOverview stats={stats} />

      {/* Main Grid: Pending AI Matches & How It Works */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Top AI Matches Feed */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-outfit">Top AI Vector Matches</h2>
                <p className="text-xs text-slate-400">Items auto-matched by Sentence Transformers & OpenCLIP</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('matches')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View All Matches <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingMatches.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">No Pending Unmatched Items</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Submit new lost or found reports to trigger vector embeddings and real-time FAISS similarity matching.
              </p>
              <button
                onClick={onTriggerScan}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
              >
                Trigger Manual AI Search
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingMatches.slice(0, 3).map((match) => (
                <div
                  key={match.id}
                  onClick={() => onSelectMatch(match)}
                  className="glass-card rounded-2xl p-5 cursor-pointer border border-slate-800 hover:border-indigo-500/50 transition-all group"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    
                    {/* Items Info */}
                    <div className="flex items-center gap-4">
                      {/* Thumbnail comparison */}
                      <div className="flex items-center -space-x-4">
                        <img 
                          src={match.lost_item.image_url || "https://via.placeholder.com/100?text=Lost"} 
                          alt="Lost"
                          className="w-14 h-14 rounded-xl object-cover border-2 border-slate-900 shadow-md group-hover:scale-105 transition-transform"
                        />
                        <img 
                          src={match.found_item.image_url || "https://via.placeholder.com/100?text=Found"} 
                          alt="Found"
                          className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-500 shadow-md group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base font-outfit">
                            {match.lost_item.name}
                          </h4>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {match.lost_item.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          Found at: <span className="text-slate-300 font-medium">{match.found_item.location_found}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            Match generated {new Date(match.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Similarity Score Badge */}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 badge-glow-emerald">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          {int(match.overall_score * 100)}% Similarity
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Text: {int(match.text_similarity * 100)}% | Image: {int(match.image_similarity * 100)}%
                        </p>
                      </div>

                      <button className="px-3 py-1.5 rounded-lg bg-indigo-600 group-hover:bg-indigo-500 text-white text-xs font-semibold transition-all">
                        Verify
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Workflow Architecture */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-outfit">AI System Architecture</h3>
              <p className="text-xs text-slate-400">How the match engine operates</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
                1
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Multimodal Embeddings</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sentence Transformers encodes text descriptions; OpenCLIP extracts 512-dim visual features.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-xs font-bold shrink-0">
                2
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">FAISS Similarity Index</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Flat Inner-Product vector index evaluates cosine similarity matrices across lost vs found entries.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 text-xs font-bold shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Confidence Thresholding</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Matches scoring &ge; 55% trigger high confidence badges and automatic match tickets.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-xs font-bold shrink-0">
                4
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Automated Owner Notification</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sends formatted HTML email with photo comparison and recovery desk collection details.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-2">
            <Mail className="w-6 h-6 text-indigo-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-200">Automated Dispatch Active</p>
            <p className="text-[11px] text-slate-400">
              Check out the Email Inbox tab to test live notification audit logs.
            </p>
            <button
              onClick={() => setActiveTab('emails')}
              className="text-xs font-semibold text-indigo-400 hover:underline"
            >
              Open Email Inbox &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function int(val) {
  return Math.round(val);
}

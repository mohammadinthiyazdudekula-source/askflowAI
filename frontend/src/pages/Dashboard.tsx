import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchConversationStats } from '../lib/api';
import { MessageSquare, Plus, Sparkles, ArrowRight, Bot } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [totalConversations, setTotalConversations] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      const stats = await fetchConversationStats();
      setTotalConversations(stats.totalConversations);
      setIsLoading(false);
    }
    loadStats();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full space-y-8 animate-fade-in">
      {/* Personalized Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden p-8 md:p-10 bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900/60 border border-indigo-500/20 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AskFlow AI Platform</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Welcome, <span className="gradient-text">{user?.fullName || 'Explorer'}</span>!
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
            Your personal AI intelligence hub powered by Google Gemini and Supabase. Start a new conversation or access your existing chats seamlessly.
          </p>
        </div>
      </div>

      {/* Two Required Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Total AI Conversations */}
        <div className="glass-card rounded-2xl p-6 md:p-8 border border-slate-800/80 hover:border-indigo-500/30 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl group-hover:bg-indigo-600/15 transition-all" />
          
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50">
              Live Metrics
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Total AI Conversations
            </h3>
            <div className="flex items-baseline space-x-2">
              {isLoading ? (
                <div className="h-10 w-24 bg-slate-800/60 animate-pulse rounded-lg" />
              ) : (
                <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
                  {totalConversations}
                </span>
              )}
              <span className="text-xs text-slate-400 font-medium">conversations created</span>
            </div>
          </div>
        </div>

        {/* Card 2: Start New Chat Button */}
        <div
          onClick={() => navigate('/chat')}
          className="glass-card rounded-2xl p-6 md:p-8 border border-indigo-500/30 hover:border-indigo-500/60 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-[#0d1322] hover:shadow-indigo-500/10 shadow-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all" />
          
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
              Start New Chat
              <Plus className="w-5 h-5 text-indigo-400 group-hover:rotate-90 transition-transform duration-300" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Launch a full-page interactive AI session with Google Gemini. Ask code questions, generate ideas, or analyze text.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

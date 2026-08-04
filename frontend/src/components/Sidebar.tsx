import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Plus,
  LogOut,
  MessageSquare,
  Trash2,
  Sparkles,
  ChevronRight,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchConversations, deleteConversationApi } from '../lib/api';
import { Conversation } from '../types/chat';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadConversations = async () => {
    const convs = await fetchConversations();
    setConversations(convs);
  };

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNewChat = () => {
    navigate('/chat');
    setMobileOpen(false);
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDeleting(id);
    const success = await deleteConversationApi(id);
    if (success) {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (location.pathname === `/chat/${id}`) {
        navigate('/chat');
      }
    }
    setIsDeleting(null);
  };

  const activeConvId = location.pathname.startsWith('/chat/')
    ? location.pathname.split('/chat/')[1]
    : null;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0d1322]/90 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand Logo */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d1322] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                AskFlow <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">AI</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Smart AI Workspace</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action: New Chat */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-200 group active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Main Navigation Menu */}
        <div className="px-3 py-2 space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Navigation Menu
          </p>
          <NavLink
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/chat"
            end
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive && !activeConvId
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`
            }
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>AI Chatbot</span>
          </NavLink>
        </div>

        {/* Recent Conversations Sub-list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Recent Chats
            </span>
            <span className="text-xs text-indigo-400 font-mono font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              {conversations.length}
            </span>
          </div>

          {conversations.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-slate-800 rounded-xl my-2">
              <MessageSquare className="w-6 h-6 text-slate-600 mx-auto mb-1 opacity-60" />
              <p className="text-xs text-slate-500 font-medium">No chat history yet</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = activeConvId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    navigate(`/chat/${conv.id}`);
                    setMobileOpen(false);
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/80 text-white border border-slate-700/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-6">
                    <MessageSquare
                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                        isSelected ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'
                      }`}
                    />
                    <span className="truncate">{conv.title}</span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    disabled={isDeleting === conv.id}
                    title="Delete Conversation"
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Demo Mode Notice Banner if active */}
        {isDemoMode && (
          <div className="px-4 py-2 mx-3 my-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between">
            <span className="font-semibold">Demo Mode Active</span>
            <span className="text-[10px] text-amber-400/80 underline">Configure .env</span>
          </div>
        )}

        {/* Bottom Section: User Profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-[#090d16]/80 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 flex-shrink-0 shadow-md">
              <div className="w-full h-full bg-[#0d1322] rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-indigo-300" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'AskFlow User'}</p>
              <p className="text-[11px] text-slate-400 truncate" title={user?.email}>
                {user?.email || 'user@askflow.ai'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-700/50"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};

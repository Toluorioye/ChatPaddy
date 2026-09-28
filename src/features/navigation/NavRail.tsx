import React from 'react';
import {
  MessageSquare,
  Users,
  Phone,
  Sparkles,
  Settings,
  ShieldAlert,
  LogOut,
  LogIn,
  Sun,
  Moon,
} from 'lucide-react';
import { Logo } from '../../shared/ui/Logo';
import { Avatar } from '../../shared/ui/Avatar';
import { Tooltip } from '../../shared/ui/Tooltip';
import { useChatStore } from '../chat/chatStore';
import { useAuthStore } from '../auth/authStore';

interface NavRailProps {
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  onOpenAISearch: () => void;
  currentTheme?: 'light' | 'dark' | 'system';
  onToggleTheme?: () => void;
  isAdmin?: boolean;
}

export const NavRail: React.FC<NavRailProps> = ({
  onOpenProfile,
  onOpenSettings,
  onOpenAdmin,
  onOpenAuth,
  onOpenAISearch,
  currentTheme = 'system',
  onToggleTheme,
  isAdmin: propIsAdmin,
}) => {
  const { activeTab, setActiveTab, conversations } = useChatStore();
  const { user, signOut, isAdmin: storeIsAdmin } = useAuthStore();
  const isAdmin = propIsAdmin !== undefined ? propIsAdmin : storeIsAdmin;

  const isDarkActive =
    currentTheme === 'dark' ||
    (currentTheme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches);

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  const navItems = [
    {
      id: 'chats' as const,
      label: 'Chats',
      icon: <MessageSquare className="w-5 h-5" />,
      badge: totalUnread > 0 ? totalUnread : undefined,
    },
    {
      id: 'calls' as const,
      label: 'Calls',
      icon: <Phone className="w-5 h-5" />,
    },
  ];

  return (
    <div className="hidden md:flex flex-col items-center justify-between w-18 h-full bg-slate-900 text-slate-400 py-4 select-none z-30 border-r border-slate-800">
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center gap-6">
        <div className="cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('chats')}>
          <Logo size="md" showWordmark={false} />
        </div>

        {/* Primary Navigation Icons */}
        <div className="flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Tooltip key={item.id} content={item.label} position="right">
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center relative transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-500/25'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`}
                >
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-slate-900">
                      {item.badge}
                    </span>
                  )}
                </button>
              </Tooltip>
            );
          })}

          {/* AI Message Search Quick Action */}
          <Tooltip content="Paddy AI Semantic Search" position="right">
            <button
              onClick={onOpenAISearch}
              className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-amber-500/10 hover:text-[#F59E0B] text-slate-400 transition-all cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-[#F59E0B]" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Bottom User Profile & Tools */}
      <div className="flex flex-col items-center gap-2">
        {/* Admin Portal (Visible only to platform administrators) */}
        {isAdmin && (
          <Tooltip content="Admin Moderation Portal" position="right">
            <button
              onClick={onOpenAdmin}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-800 hover:text-white text-indigo-400 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-5 h-5" />
            </button>
          </Tooltip>
        )}

        {/* Quick Theme Toggle */}
        {onToggleTheme && (
          <Tooltip
            content={`Theme: ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} (Click to switch to ${isDarkActive ? 'Light' : 'Dark'} mode)`}
            position="right"
          >
            <button
              onClick={onToggleTheme}
              aria-label="Toggle theme mode"
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
            >
              {isDarkActive ? (
                <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-300 hover:-rotate-12 transition-transform" />
              )}
            </button>
          </Tooltip>
        )}

        {/* Preferences / Settings */}
        <Tooltip content="Settings & Theme" position="right">
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-800 hover:text-white text-slate-400 transition-colors cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>
        </Tooltip>

        <div className="w-8 h-px bg-slate-800 my-1" />

        {/* User profile avatar or Login button */}
        {user ? (
          <Tooltip content={`${user.display_name} (@${user.username})`} position="right">
            <button
              onClick={onOpenProfile}
              className="cursor-pointer hover:ring-2 hover:ring-[#4F46E5] rounded-full transition-all"
            >
              <Avatar
                src={user.avatar_url}
                name={user.display_name}
                size="md"
                isOnline={user.is_online}
                showOnlineStatus
              />
            </button>
          </Tooltip>
        ) : (
          <Tooltip content="Sign In" position="right">
            <button
              onClick={onOpenAuth}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#4F46E5] text-white hover:bg-indigo-600 transition-colors cursor-pointer"
            >
              <LogIn className="w-5 h-5" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

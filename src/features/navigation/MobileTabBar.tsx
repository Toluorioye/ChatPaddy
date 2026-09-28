import React from 'react';
import { MessageSquare, Users, Phone, Settings, Sparkles, ShieldAlert, Sun, Moon } from 'lucide-react';
import { useChatStore } from '../chat/chatStore';
import { useAuthStore } from '../auth/authStore';

interface MobileTabBarProps {
  onOpenSettings: () => void;
  onOpenAISearch: () => void;
  onOpenAdmin?: () => void;
  currentTheme?: 'light' | 'dark' | 'system';
  onToggleTheme?: () => void;
  isAdmin?: boolean;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  onOpenSettings,
  onOpenAISearch,
  onOpenAdmin,
  currentTheme = 'system',
  onToggleTheme,
  isAdmin: propIsAdmin,
}) => {
  const { activeTab, setActiveTab, conversations } = useChatStore();
  const { isAdmin: storeIsAdmin } = useAuthStore();
  const isAdmin = propIsAdmin !== undefined ? propIsAdmin : storeIsAdmin;
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  const isDarkActive =
    currentTheme === 'dark' ||
    (currentTheme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches);

  return (
    <div className="md:hidden flex items-center justify-around h-16 bg-white dark:bg-[#0E1526] border-t border-slate-200 dark:border-slate-800/80 px-2 select-none z-30">
      {/* Chats */}
      <button
        onClick={() => setActiveTab('chats')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 relative ${
          activeTab === 'chats' ? 'text-[#4F46E5] dark:text-[#818CF8]' : 'text-slate-400'
        }`}
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              {totalUnread}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold">Chats</span>
      </button>

      {/* Calls */}
      <button
        onClick={() => setActiveTab('calls')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 ${
          activeTab === 'calls' ? 'text-[#4F46E5] dark:text-[#818CF8]' : 'text-slate-400'
        }`}
      >
        <Phone className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Calls</span>
      </button>

      {/* AI Semantic Search */}
      <button
        onClick={onOpenAISearch}
        className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[#F59E0B]"
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Paddy AI</span>
      </button>

      {/* Theme Toggle */}
      {onToggleTheme && (
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme mode"
          className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-slate-400 hover:text-amber-400 cursor-pointer"
        >
          {isDarkActive ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-400" />
          )}
          <span className="text-[10px] font-semibold">{isDarkActive ? 'Light' : 'Dark'}</span>
        </button>
      )}

      {/* Settings */}
      <button
        onClick={onOpenSettings}
        className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-slate-400"
      >
        <Settings className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Settings</span>
      </button>

      {/* Admin (Only visible if user has platform administrator privileges) */}
      {isAdmin && onOpenAdmin && (
        <button
          onClick={onOpenAdmin}
          className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-slate-400 hover:text-[#4F46E5]"
        >
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
          <span className="text-[10px] font-semibold">Admin</span>
        </button>
      )}
    </div>
  );
};

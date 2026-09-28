import React, { useState, useMemo } from 'react';
import {
  Search,
  Pin,
  VolumeX,
  Check,
  CheckCheck,
  Plus,
  Users,
  MessageSquare,
  Sparkles,
  Archive,
  WifiOff,
  RefreshCw,
  X,
} from 'lucide-react';
import { Avatar } from '../../shared/ui/Avatar';
import { IconButton } from '../../shared/ui/IconButton';
import { EmptyState } from '../../shared/ui/EmptyState';
import { useChatStore } from './chatStore';
import { UIConversation } from '../../types/chat.types';

interface ChatListProps {
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
}

// Memoized single conversation row component to prevent re-rendering entire list on message arrival
const ConversationListItem = React.memo<{
  conv: UIConversation;
  isActive: boolean;
  isOnline?: boolean;
  isTyping: boolean;
  onSelect: (id: string) => void;
  formatTime: (iso?: string) => string;
}>(({ conv, isActive, isOnline, isTyping, onSelect, formatTime }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(conv.id)}
      aria-selected={isActive}
      className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all duration-150 relative group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
        isActive
          ? 'bg-[#EEF2FF] dark:bg-indigo-950/50 text-slate-900 dark:text-white shadow-xs'
          : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
      }`}
    >
      {/* Avatar with online status */}
      <div className="relative shrink-0">
        <Avatar
          src={conv.avatar_url}
          name={conv.name}
          size="md"
          isOnline={isOnline}
          showOnlineStatus={conv.type === 'direct'}
        />
        {conv.type === 'group' && (
          <span
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-[#0E1526] flex items-center justify-center text-[9px] text-slate-600 dark:text-slate-300"
            aria-label="Group conversation"
          >
            <Users className="w-2.5 h-2.5" />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h4
            className={`text-sm font-semibold truncate ${
              isActive
                ? 'text-[#4F46E5] dark:text-[#818CF8]'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {conv.name}
          </h4>
          <span className="text-[11px] text-slate-400 shrink-0">
            {formatTime(conv.last_message_at)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0 text-xs text-slate-500 dark:text-slate-400 truncate">
            {isTyping ? (
              <span className="text-[#4F46E5] dark:text-[#818CF8] font-medium flex items-center gap-1 animate-pulse">
                <span>typing</span>
                <span className="flex gap-0.5">
                  <span
                    className="w-1 h-1 rounded-full bg-current animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-1 h-1 rounded-full bg-current animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1 h-1 rounded-full bg-current animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </span>
              </span>
            ) : (
              <>
                {conv.last_message_is_mine && (
                  <span className="shrink-0 inline-flex items-center">
                    {conv.last_message_status === 'read' ? (
                      <CheckCheck className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#818CF8]" />
                    ) : conv.last_message_status === 'delivered' ? (
                      <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </span>
                )}
                <span className="truncate">{conv.last_message_preview || 'No messages yet'}</span>
              </>
            )}
          </div>

          {/* Badges & Indicators */}
          <div className="flex items-center gap-1.5 shrink-0">
            {conv.is_muted && (
              <span title="Notifications muted" aria-label="Muted">
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              </span>
            )}
            {conv.is_pinned && (
              <span title="Pinned chat" aria-label="Pinned">
                <Pin className="w-3 h-3 text-slate-400 fill-slate-400 rotate-45" />
              </span>
            )}
            {conv.unread_count > 0 && (
              <span
                className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#4F46E5] text-white text-[10px] font-bold flex items-center justify-center shadow-xs"
                aria-label={`${conv.unread_count} unread messages`}
              >
                {conv.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
});

ConversationListItem.displayName = 'ConversationListItem';

export const ChatList: React.FC<ChatListProps> = ({ onOpenNewChat, onOpenNewGroup }) => {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    searchQuery,
    setSearchQuery,
    onlineUsers,
    typingUsers,
    realtimeStatus,
    reconnect,
    isLoadingConversations,
  } = useChatStore();

  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'groups' | 'archived'>('all');

  const totalUnread = useMemo(
    () => conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0),
    [conversations]
  );

  // Filter conversations with memoization
  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchPreview = (c.last_message_preview || '').toLowerCase().includes(q);
        const matchUsername = c.other_user?.username.toLowerCase().includes(q);
        if (!matchName && !matchPreview && !matchUsername) return false;
      }

      if (activeTab === 'archived') return c.is_archived;
      if (c.is_archived) return false;

      if (activeTab === 'direct') return c.type === 'direct';
      if (activeTab === 'groups') return c.type === 'group';

      return true;
    });
  }, [conversations, searchQuery, activeTab]);

  // Separate pinned vs regular
  const pinnedList = useMemo(() => filtered.filter((c) => c.is_pinned), [filtered]);
  const regularList = useMemo(() => filtered.filter((c) => !c.is_pinned), [filtered]);

  // Format relative time helper
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <nav
      aria-label="Conversation list"
      className="flex flex-col h-full bg-white dark:bg-[#0E1526] border-r border-slate-200 dark:border-slate-800/80 select-none"
    >
      {/* Realtime Connection Status Notification */}
      {realtimeStatus !== 'connected' && (
        <div
          role="status"
          className={`px-3 py-2 text-xs flex items-center justify-between border-b transition-colors ${
            realtimeStatus === 'connecting'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/40'
              : realtimeStatus === 'reconnecting'
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/40'
              : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border-red-200 dark:border-red-900/40'
          }`}
        >
          <div className="flex items-center gap-1.5 font-medium truncate">
            {realtimeStatus === 'connecting' ? (
              <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-ping shrink-0" />
            ) : realtimeStatus === 'reconnecting' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="truncate">
              {realtimeStatus === 'connecting'
                ? 'Connecting to chat server...'
                : typeof navigator !== 'undefined' && !navigator.onLine
                ? 'No internet connection. Working offline.'
                : 'Syncing real-time messages...'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => reconnect()}
            className="text-[11px] underline font-semibold cursor-pointer hover:opacity-80 shrink-0 ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Action Header */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-heading font-extrabold text-slate-900 dark:text-white">
              Messages
            </h2>
            {totalUnread > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#4F46E5] text-white text-[11px] font-bold">
                {totalUnread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              aria-label="New direct chat"
              size="sm"
              variant="secondary"
              onClick={onOpenNewChat}
            >
              <Plus className="w-4 h-4" />
            </IconButton>
            <IconButton
              aria-label="New group chat"
              size="sm"
              variant="ghost"
              onClick={onOpenNewGroup}
            >
              <Users className="w-4 h-4" />
            </IconButton>
          </div>
        </div>

        {/* Search input with clear button */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations, people, or groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-[#131A2E] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl pl-9 pr-8 py-2 border border-transparent focus:border-[#4F46E5] focus:outline-none transition-all"
            aria-label="Search conversations"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters tab pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'direct', label: 'Direct' },
            { id: 'groups', label: 'Groups' },
            { id: 'archived', label: 'Archived' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-[#4F46E5] dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations scroll area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Loading Skeleton State */}
        {isLoadingConversations && conversations.length === 0 ? (
          <div className="space-y-2 p-1 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty States */
          <div className="py-12 px-4 text-center">
            {searchQuery ? (
              <EmptyState
                title="No results found"
                description={`No conversation matched "${searchQuery}".`}
                actionLabel="Clear Search"
                onAction={() => setSearchQuery('')}
              />
            ) : activeTab === 'archived' ? (
              <EmptyState
                title="No archived chats"
                description="Chats you archive will appear here safely stored away."
                actionLabel="View All Chats"
                onAction={() => setActiveTab('all')}
              />
            ) : activeTab === 'groups' ? (
              <EmptyState
                title="No group chats yet"
                description="Create a team space to collaborate with multiple people at once."
                actionLabel="Create a Group"
                onAction={onOpenNewGroup}
              />
            ) : (
              <EmptyState
                title="No conversations found"
                description="Start your first direct or group conversation with your contacts."
                actionLabel="Start a Chat"
                onAction={onOpenNewChat}
              />
            )}
          </div>
        ) : (
          <>
            {/* Pinned section */}
            {pinnedList.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Pin className="w-3 h-3 rotate-45" /> Pinned
                </div>
                <div className="space-y-0.5">
                  {pinnedList.map((conv) => (
                    <ConversationListItem
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === activeConversationId}
                      isOnline={
                        conv.type === 'direct' && conv.other_user
                          ? onlineUsers[conv.other_user.id]
                          : undefined
                      }
                      isTyping={(typingUsers[conv.id] || []).length > 0}
                      onSelect={setActiveConversation}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All / Regular chats */}
            <div>
              {pinnedList.length > 0 && regularList.length > 0 && (
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  All Chats
                </div>
              )}
              <div className="space-y-0.5">
                {regularList.map((conv) => (
                  <ConversationListItem
                    key={conv.id}
                    conv={conv}
                    isActive={conv.id === activeConversationId}
                    isOnline={
                      conv.type === 'direct' && conv.other_user
                        ? onlineUsers[conv.other_user.id]
                        : undefined
                    }
                    isTyping={(typingUsers[conv.id] || []).length > 0}
                    onSelect={setActiveConversation}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

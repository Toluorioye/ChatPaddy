import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  Search,
  MoreVertical,
  Info,
  Sparkles,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Avatar } from '../../shared/ui/Avatar';
import { IconButton } from '../../shared/ui/IconButton';
import { Dropdown } from '../../shared/ui/Dropdown';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChatStore } from './chatStore';
import { useToast } from '../../shared/ui/Toast';
import { UIConversation, UIMessage } from '../../types/chat.types';

interface ConversationPaneProps {
  conversation: UIConversation;
  onBack: () => void;
  onForwardMessage: (msg: UIMessage) => void;
  onOpenAISummarize: () => void;
  onOpenSmartReplies: () => void;
}

export const ConversationPane: React.FC<ConversationPaneProps> = ({
  conversation,
  onBack,
  onForwardMessage,
  onOpenAISummarize,
  onOpenSmartReplies,
}) => {
  const {
    onlineUsers,
    typingUsers,
    startCall,
    togglePinConversation,
    toggleMuteConversation,
    toggleArchiveConversation,
    toggleRightPanel,
    sendMessage,
  } = useChatStore();

  const { toast } = useToast();
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [searchInChatQuery, setSearchInChatQuery] = useState('');

  const isOnline =
    conversation.type === 'direct' && conversation.other_user
      ? onlineUsers[conversation.other_user.id]
      : undefined;

  const typingList = typingUsers[conversation.id] || [];
  const isTyping = typingList.length > 0;

  // Smart suggestions preset
  const quickSuggestions = [
    'Sounds great, let us proceed!',
    'Can you send over the documentation?',
    'LGTM! Pushing this now.',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#0B1020] relative overflow-hidden">
      {/* Conversation Top Header */}
      <div className="px-4 py-3 bg-white dark:bg-[#0E1526] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between z-10 select-none shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button for mobile */}
          <IconButton
            aria-label="Back to conversations"
            size="sm"
            variant="ghost"
            onClick={onBack}
            className="md:hidden text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </IconButton>

          {/* Avatar */}
          <div className="cursor-pointer" onClick={toggleRightPanel}>
            <Avatar
              src={conversation.avatar_url}
              name={conversation.name}
              size="md"
              isOnline={isOnline}
              showOnlineStatus={conversation.type === 'direct'}
            />
          </div>

          {/* Name & status */}
          <div className="min-w-0 cursor-pointer" onClick={toggleRightPanel}>
            <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
              <span>{conversation.name}</span>
              {conversation.type === 'group' && (
                <span className="text-[11px] font-normal text-slate-400">
                  ({conversation.participants.length} members)
                </span>
              )}
            </h3>

            <div className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
              {isTyping ? (
                <span className="text-[#4F46E5] dark:text-[#818CF8] font-semibold animate-pulse">
                  {typingList.map((t) => t.displayName).join(', ')} is typing...
                </span>
              ) : conversation.type === 'direct' ? (
                isOnline ? (
                  <span className="text-emerald-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                  </span>
                ) : (
                  <span>Offline</span>
                )
              ) : (
                <span>{conversation.description || 'Group conversation'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* AI Helper Quick Trigger */}
          <IconButton
            aria-label="AI Summarize thread"
            size="sm"
            variant="soft"
            onClick={onOpenAISummarize}
            className="text-[#4F46E5] hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300"
          >
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          </IconButton>

          {/* Voice Call */}
          <IconButton
            aria-label="Start voice call"
            size="sm"
            variant="ghost"
            onClick={() => startCall(conversation.id, 'voice')}
            className="text-slate-600 dark:text-slate-300 hover:text-[#4F46E5]"
          >
            <Phone className="w-4 h-4" />
          </IconButton>

          {/* Video Call */}
          <IconButton
            aria-label="Start video call"
            size="sm"
            variant="ghost"
            onClick={() => startCall(conversation.id, 'video')}
            className="text-slate-600 dark:text-slate-300 hover:text-[#4F46E5]"
          >
            <Video className="w-4 h-4" />
          </IconButton>

          {/* Search inside conversation */}
          <IconButton
            aria-label="Search messages"
            size="sm"
            variant="ghost"
            onClick={() => setIsSearchingInChat(!isSearchingInChat)}
            className={isSearchingInChat ? 'text-[#4F46E5] bg-indigo-50 dark:bg-indigo-950' : 'text-slate-600 dark:text-slate-300'}
          >
            <Search className="w-4 h-4" />
          </IconButton>

          {/* Info panel toggle */}
          <IconButton
            aria-label="Conversation details"
            size="sm"
            variant="ghost"
            onClick={toggleRightPanel}
            className="text-slate-600 dark:text-slate-300 hover:text-[#4F46E5]"
          >
            <Info className="w-4 h-4" />
          </IconButton>

          {/* More options dropdown */}
          <Dropdown
            align="right"
            trigger={
              <IconButton
                aria-label="More options"
                size="sm"
                variant="ghost"
                className="text-slate-600 dark:text-slate-300"
              >
                <MoreVertical className="w-4 h-4" />
              </IconButton>
            }
            items={[
              {
                id: 'pin',
                label: conversation.is_pinned ? 'Unpin chat' : 'Pin chat',
                onClick: () => togglePinConversation(conversation.id),
              },
              {
                id: 'mute',
                label: conversation.is_muted ? 'Unmute notifications' : 'Mute notifications',
                onClick: () => toggleMuteConversation(conversation.id),
              },
              {
                id: 'archive',
                label: conversation.is_archived ? 'Unarchive chat' : 'Archive chat',
                onClick: () => toggleArchiveConversation(conversation.id),
              },
              'divider' as const,
              {
                id: 'summarize',
                label: 'AI Summarize discussion',
                icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
                onClick: onOpenAISummarize,
              },
            ]}
          />
        </div>
      </div>

      {/* In-Chat Search Bar Overlay */}
      {isSearchingInChat && (
        <div className="px-4 py-2 bg-slate-100 dark:bg-[#131A2E] border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 animate-in slide-in-from-top-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search in this chat..."
            value={searchInChatQuery}
            onChange={(e) => setSearchInChatQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
          {searchInChatQuery && (
            <button
              onClick={() => setSearchInChatQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => {
              setIsSearchingInChat(false);
              setSearchInChatQuery('');
            }}
            className="text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8]"
          >
            Done
          </button>
        </div>
      )}

      {/* Message List */}
      <MessageList
        conversation={conversation}
        onForwardMessage={onForwardMessage}
        searchHighlight={searchInChatQuery}
      />

      {/* Smart Reply Quick Suggestions Bar */}
      <div className="px-4 py-1.5 bg-slate-50 dark:bg-[#0B1020] flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-[#F59E0B]" /> Smart:
        </span>
        {quickSuggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => sendMessage({ content: suggestion, type: 'text' })}
            className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-[#131A2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-[#4F46E5] hover:text-[#4F46E5] transition-all whitespace-nowrap cursor-pointer shadow-2xs"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Message Input Bottom Bar */}
      <MessageInput
        conversationId={conversation.id}
        onOpenAISummarize={onOpenAISummarize}
        onOpenSmartReplies={onOpenSmartReplies}
      />
    </div>
  );
};

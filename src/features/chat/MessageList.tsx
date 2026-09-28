import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Check,
  CheckCheck,
  Play,
  Pause,
  Reply,
  Smile,
  MoreVertical,
  Copy,
  Edit2,
  Trash2,
  Share2,
  Download,
  FileIcon,
  Maximize2,
  X,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';
import { Avatar } from '../../shared/ui/Avatar';
import { Dropdown } from '../../shared/ui/Dropdown';
import { IconButton } from '../../shared/ui/IconButton';
import { useChatStore } from './chatStore';
import { useAuthStore } from '../auth/authStore';
import { UIMessage, UIConversation } from '../../types/chat.types';
import { escapeRegExp, sanitizeUrl } from '../../shared/utils/security';

interface MessageListProps {
  conversation: UIConversation;
  onForwardMessage: (msg: UIMessage) => void;
  searchHighlight?: string;
}

const QUICK_EMOJIS = ['❤️', '👍', '🔥', '😂', '😮', '🚀'];

// Check if message is strictly emoji-only
function isOnlyEmojis(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const emojiRegex =
    /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83d\ud83e][\ud000-\udfff]|[\u200d\ufe0e\ufe0f\u200b])+$/;
  return emojiRegex.test(trimmed) && trimmed.length <= 12;
}

// Format relative date
function formatDateSeparator(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0 && now.getDate() === date.getDate()) {
    return 'Today';
  } else if (diffDays <= 1) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

function formatBubbleTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Memoized individual message bubble component
interface MessageBubbleProps {
  msg: UIMessage;
  isMine: boolean;
  isPrevSameSender: boolean;
  showDateSeparator: boolean;
  conversationType: 'direct' | 'group';
  playingVoiceId: string | null;
  onToggleVoice: (id: string) => void;
  onOpenLightbox: (url: string, title: string) => void;
  searchHighlight?: string;
  onReact: (id: string, emoji: string) => void;
  onReply: (msg: UIMessage) => void;
  onForward: (msg: UIMessage) => void;
  onEdit: (msg: UIMessage) => void;
  onDelete: (id: string, forEveryone: boolean) => void;
  onRetry: (id: string) => void;
}

const MessageBubble = React.memo<MessageBubbleProps>(
  ({
    msg,
    isMine,
    isPrevSameSender,
    showDateSeparator,
    conversationType,
    playingVoiceId,
    onToggleVoice,
    onOpenLightbox,
    searchHighlight,
    onReact,
    onReply,
    onForward,
    onEdit,
    onDelete,
    onRetry,
  }) => {
    const isDeleted = msg.deleted_for_everyone;
    const isEmojiOnly = !isDeleted && msg.type === 'text' && isOnlyEmojis(msg.content);

    // Safe regex highlighter with sanitization
    const highlightedContent = useMemo(() => {
      if (!msg.content) return null;
      if (!searchHighlight || !searchHighlight.trim()) {
        return msg.content;
      }
      try {
        const safeQuery = escapeRegExp(searchHighlight.trim());
        const regex = new RegExp(`(${safeQuery})`, 'gi');
        const parts = msg.content.split(regex);
        return parts.map((part, i) =>
          part.toLowerCase() === searchHighlight.toLowerCase() ? (
            <mark key={i} className="bg-[#F59E0B] text-slate-900 px-0.5 rounded-xs font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        );
      } catch {
        return msg.content;
      }
    }, [msg.content, searchHighlight]);

    return (
      <div className="w-full">
        {/* Date Separator */}
        {showDateSeparator && (
          <div className="flex items-center justify-center my-3 select-none">
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs">
              {formatDateSeparator(msg.created_at)}
            </span>
          </div>
        )}

        {/* System message */}
        {msg.type === 'system' ? (
          <div className="flex justify-center my-2 select-none">
            <span className="text-xs px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 italic">
              {msg.content}
            </span>
          </div>
        ) : (
          /* Regular Message Row */
          <div
            id={msg.id}
            className={`flex items-end gap-2 group relative transition-colors ${
              isMine ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Avatar for received group messages */}
            {!isMine && (
              <div className="w-8 shrink-0">
                {!isPrevSameSender ? (
                  <Avatar
                    src={msg.sender?.avatar_url}
                    name={msg.sender?.display_name || 'User'}
                    size="sm"
                  />
                ) : (
                  <div className="w-8" />
                )}
              </div>
            )}

            {/* Message Bubble Container */}
            <div
              className={`max-w-[88%] sm:max-w-[72%] flex flex-col ${
                isMine ? 'items-end' : 'items-start'
              }`}
            >
              {/* Group sender name */}
              {!isMine && !isPrevSameSender && conversationType === 'group' && (
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1 select-none">
                  {msg.sender?.display_name || 'Member'}
                </span>
              )}

              {/* Quoted Reply Preview */}
              {msg.reply_to && !isDeleted && (
                <div
                  onClick={() => {
                    const el = document.getElementById(msg.reply_to!.id);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`mb-1 p-2 rounded-xl text-xs cursor-pointer border-l-3 transition-opacity hover:opacity-90 max-w-full ${
                    isMine
                      ? 'bg-indigo-700/40 text-indigo-100 border-white'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-[#4F46E5]'
                  }`}
                >
                  <div className="font-semibold text-[10px] text-current truncate">
                    {msg.reply_to.sender?.display_name || 'Reply'}
                  </div>
                  <div className="truncate text-[11px] opacity-85">
                    {msg.reply_to.content || 'Attachment'}
                  </div>
                </div>
              )}

              {/* Bubble Surface */}
              <div
                className={`relative px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-2xs break-words ${
                  isMine
                    ? 'bg-bubble-sent text-white rounded-br-xs'
                    : 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-800 rounded-bl-xs'
                } ${isDeleted ? 'italic text-slate-400 dark:text-slate-500' : ''}`}
              >
                {/* Deleted message */}
                {isDeleted ? (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 select-none">
                    <span>🚫 This message was deleted</span>
                  </div>
                ) : (
                  <>
                    {/* Image Attachment */}
                    {msg.type === 'image' && msg.attachments && msg.attachments[0] && (
                      <div className="mb-2 -mx-2 -mt-1 rounded-xl overflow-hidden cursor-pointer relative group">
                        <img
                          src={
                            sanitizeUrl(msg.attachments[0].storage_path) ||
                            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80'
                          }
                          alt={msg.attachments[0].file_name || 'Image'}
                          loading="lazy"
                          className="max-h-72 w-full object-cover rounded-xl"
                          onClick={() =>
                            onOpenLightbox(
                              msg.attachments![0].storage_path,
                              msg.attachments![0].file_name || 'Image'
                            )
                          }
                        />
                        <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}

                    {/* Voice Note Player */}
                    {msg.type === 'voice' && (
                      <div className="flex items-center gap-2 sm:gap-3 py-1 min-w-[170px] sm:min-w-[220px]">
                        <button
                          type="button"
                          onClick={() => onToggleVoice(msg.id)}
                          aria-label={playingVoiceId === msg.id ? 'Pause voice note' : 'Play voice note'}
                          className={`w-8 sm:w-9 h-8 sm:h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-transform active:scale-95 ${
                            isMine ? 'bg-white text-[#4F46E5]' : 'bg-[#4F46E5] text-white'
                          }`}
                        >
                          {playingVoiceId === msg.id ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>

                        {/* Interactive Audio Waveform Visualization */}
                        <div className="flex-1 flex items-center gap-0.5 h-6">
                          {[35, 60, 20, 80, 45, 90, 70, 40, 65, 85, 30, 50, 75, 40, 95, 30].map(
                            (height, i) => (
                              <span
                                key={i}
                                style={{ height: `${height}%` }}
                                className={`w-1 rounded-full transition-all ${
                                  playingVoiceId === msg.id ? 'animate-soundwave' : ''
                                } ${isMine ? 'bg-white/80' : 'bg-[#4F46E5]/70 dark:bg-indigo-400'}`}
                              />
                            )
                          )}
                        </div>

                        <span
                          className={`text-[10px] sm:text-[11px] font-mono shrink-0 ${
                            isMine ? 'text-white/80' : 'text-slate-500'
                          }`}
                        >
                          {playingVoiceId === msg.id ? '0:07' : '0:14'}
                        </span>
                      </div>
                    )}

                    {/* File Attachment Card */}
                    {msg.type === 'file' && msg.attachments && msg.attachments[0] && (
                      <div
                        className={`flex items-center gap-3 p-2.5 rounded-xl mb-1.5 border ${
                          isMine
                            ? 'bg-indigo-800/40 border-white/20 text-white'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-indigo-500/20">
                          <FileIcon className="w-5 h-5 text-current" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-xs font-semibold truncate">
                            {msg.attachments[0].file_name}
                          </div>
                          <div className="text-[10px] opacity-75">
                            {(msg.attachments[0].size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <IconButton
                          aria-label="Download file"
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            const safe = sanitizeUrl(msg.attachments![0].storage_path);
                            if (safe) window.open(safe, '_blank');
                          }}
                          className="text-current hover:bg-black/10"
                        >
                          <Download className="w-4 h-4" />
                        </IconButton>
                      </div>
                    )}

                    {/* Text Message Content */}
                    {msg.content && (
                      <div
                        className={`leading-relaxed whitespace-pre-wrap select-text ${
                          isEmojiOnly ? 'text-3xl sm:text-4xl py-1' : 'text-sm'
                        }`}
                      >
                        {highlightedContent}
                      </div>
                    )}
                  </>
                )}

                {/* Bubble Timestamp & Status */}
                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
                    isMine ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {msg.edited_at && !isDeleted && (
                    <span className="italic opacity-80 mr-0.5">edited</span>
                  )}
                  <span>{formatBubbleTime(msg.created_at)}</span>
                  {isMine && !isDeleted && (
                    <span className="inline-flex items-center">
                      {msg.receipt_status === 'failed' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetry(msg.id);
                          }}
                          title="Failed to send. Click to retry."
                          className="inline-flex items-center gap-1 text-red-300 hover:text-red-100 bg-red-500/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                        >
                          <AlertCircle className="w-3 h-3 text-red-300" />
                          <span className="text-[9px] font-semibold underline">Retry</span>
                        </button>
                      ) : msg.receipt_status === 'read' ? (
                        <span title="Read" aria-label="Read">
                          <CheckCheck className="w-3.5 h-3.5 text-amber-300" />
                        </span>
                      ) : msg.receipt_status === 'delivered' ? (
                        <span title="Delivered" aria-label="Delivered">
                          <CheckCheck className="w-3.5 h-3.5 text-white/80" />
                        </span>
                      ) : msg.receipt_status === 'sent' ? (
                        <span title="Sent" aria-label="Sent">
                          <Check className="w-3.5 h-3.5 text-white/80" />
                        </span>
                      ) : (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/60 border-t-transparent animate-spin"
                          title="Sending..."
                          aria-label="Sending..."
                        />
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Reactions Pill Display */}
              {msg.reactions && Object.keys(msg.reactions).length > 0 && !isDeleted && (
                <div className="flex flex-wrap gap-1 mt-1 select-none">
                  {Object.entries(msg.reactions).map(([emoji, data]) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => onReact(msg.id, emoji)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                        data.userReacted
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-[#4F46E5] text-[#4F46E5] dark:text-indigo-300'
                          : 'bg-white dark:bg-[#131A2E] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span className="text-[11px] font-semibold">{data.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Menu (Visible on hover on desktop, or always subtly available on mobile) */}
            {!isDeleted && (
              <div
                className={`opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-0.5 self-center pb-2 ${
                  isMine ? 'order-first' : ''
                }`}
              >
                {/* Quick reaction dropdown */}
                <Dropdown
                  align={isMine ? 'right' : 'left'}
                  trigger={
                    <IconButton
                      aria-label="React with emoji"
                      size="xs"
                      variant="ghost"
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </IconButton>
                  }
                  items={QUICK_EMOJIS.map((emoji) => ({
                    id: emoji,
                    label: emoji,
                    onClick: () => onReact(msg.id, emoji),
                  }))}
                />

                {/* Reply button */}
                <IconButton
                  aria-label="Reply to message"
                  size="xs"
                  variant="ghost"
                  onClick={() => onReply(msg)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Reply className="w-3.5 h-3.5" />
                </IconButton>

                {/* More Actions Dropdown */}
                <Dropdown
                  align={isMine ? 'right' : 'left'}
                  trigger={
                    <IconButton
                      aria-label="More message options"
                      size="xs"
                      variant="ghost"
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </IconButton>
                  }
                  items={[
                    {
                      id: 'copy',
                      label: 'Copy text',
                      icon: <Copy className="w-3.5 h-3.5" />,
                      onClick: () => {
                        navigator.clipboard.writeText(msg.content);
                      },
                    },
                    {
                      id: 'forward',
                      label: 'Forward message',
                      icon: <Share2 className="w-3.5 h-3.5" />,
                      onClick: () => onForward(msg),
                    },
                    ...(isMine && msg.type === 'text'
                      ? [
                          {
                            id: 'edit',
                            label: 'Edit message',
                            icon: <Edit2 className="w-3.5 h-3.5" />,
                            onClick: () => onEdit(msg),
                          },
                        ]
                      : []),
                    'divider' as const,
                    {
                      id: 'delete_me',
                      label: 'Delete for me',
                      danger: true,
                      icon: <Trash2 className="w-3.5 h-3.5" />,
                      onClick: () => onDelete(msg.id, false),
                    },
                    ...(isMine
                      ? [
                          {
                            id: 'delete_all',
                            label: 'Delete for everyone',
                            danger: true,
                            icon: <Trash2 className="w-3.5 h-3.5" />,
                            onClick: () => onDelete(msg.id, true),
                          },
                        ]
                      : []),
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

MessageBubble.displayName = 'MessageBubble';

export const MessageList: React.FC<MessageListProps> = ({
  conversation,
  onForwardMessage,
  searchHighlight,
}) => {
  const {
    messages,
    toggleReaction,
    deleteMessage,
    setReplyingToMessage,
    setEditingMessage,
    loadOlderMessages,
    isLoadingOlder,
    hasMoreMessages,
    retryMessage,
    typingUsers,
    isLoadingMessages,
  } = useChatStore();
  const { user } = useAuthStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const convMessages = messages[conversation.id] || [];

  const isOlderLoading = isLoadingOlder[conversation.id] || false;
  const hasMore = hasMoreMessages[conversation.id] !== false;
  const typingList = typingUsers[conversation.id] || [];

  // Voice note playback state
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (prevScrollHeightRef.current === 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [convMessages.length, conversation.id]);

  // Infinite scroll upwards trigger
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop } = containerRef.current;

    if (scrollTop < 50 && hasMore && !isOlderLoading) {
      prevScrollHeightRef.current = containerRef.current.scrollHeight;
      loadOlderMessages(conversation.id).then((loaded) => {
        if (loaded && containerRef.current) {
          const newScrollHeight = containerRef.current.scrollHeight;
          containerRef.current.scrollTop = newScrollHeight - prevScrollHeightRef.current;
        }
        prevScrollHeightRef.current = 0;
      });
    }
  }, [conversation.id, hasMore, isOlderLoading, loadOlderMessages]);

  const handleToggleVoice = useCallback((id: string) => {
    setPlayingVoiceId((prev) => (prev === id ? null : id));
  }, []);

  const handleOpenLightbox = useCallback((url: string, title: string) => {
    const safeUrl = sanitizeUrl(url) || url;
    setLightboxImage({ url: safeUrl, title });
  }, []);

  const handleReact = useCallback(
    (id: string, emoji: string) => {
      toggleReaction(id, emoji);
    },
    [toggleReaction]
  );

  const handleReply = useCallback(
    (msg: UIMessage) => {
      setReplyingToMessage(msg);
    },
    [setReplyingToMessage]
  );

  const handleEdit = useCallback(
    (msg: UIMessage) => {
      setEditingMessage(msg);
    },
    [setEditingMessage]
  );

  const handleDelete = useCallback(
    (id: string, forEveryone: boolean) => {
      deleteMessage(id, forEveryone);
    },
    [deleteMessage]
  );

  const handleRetry = useCallback(
    (id: string) => {
      retryMessage(id);
    },
    [retryMessage]
  );

  return (
    <section
      ref={containerRef}
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      aria-label={`Chat history with ${conversation.name}`}
      className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-3 sm:space-y-4 relative"
    >
      {/* Infinite Scroll Loader at Top */}
      {isOlderLoading && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-500 dark:text-slate-400 animate-fade-in">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-[#4F46E5] border-t-transparent animate-spin" />
          <span>Loading older messages...</span>
        </div>
      )}

      {!hasMore && convMessages.length > 10 && (
        <div className="flex items-center justify-center py-2 select-none">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-slate-800/60 px-3 py-0.5 rounded-full">
            Beginning of conversation
          </span>
        </div>
      )}

      {/* Loading Skeleton State */}
      {isLoadingMessages && convMessages.length === 0 ? (
        <div className="space-y-4 py-8 animate-pulse">
          <div className="flex justify-start">
            <div className="w-48 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl rounded-bl-xs" />
          </div>
          <div className="flex justify-end">
            <div className="w-56 h-10 bg-indigo-200/60 dark:bg-indigo-950/60 rounded-2xl rounded-br-xs" />
          </div>
          <div className="flex justify-start">
            <div className="w-64 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl rounded-bl-xs" />
          </div>
          <div className="flex justify-end">
            <div className="w-40 h-10 bg-indigo-200/60 dark:bg-indigo-950/60 rounded-2xl rounded-br-xs" />
          </div>
        </div>
      ) : convMessages.length === 0 ? (
        /* Empty Conversation State */
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-16 px-4">
          <div className="w-14 h-14 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-3 text-[#4F46E5]">
            <MessageCircle className="w-7 h-7" />
          </div>
          <h3 className="text-base font-heading font-bold text-slate-800 dark:text-slate-200 mb-1">
            No messages yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
            This is the start of your direct conversation with {conversation.name}. Say hello or send a note!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['👋 Say Hello', '🚀 Ready to collaborate', '📅 Set up a quick call'].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  useChatStore.getState().sendMessage({ content: prompt, type: 'text' });
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#4F46E5] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Message list rendering with memoized bubbles */
        convMessages.map((msg, index) => {
          const isMine = msg.sender_id === user?.id;
          const isPrevSameSender =
            index > 0 && convMessages[index - 1].sender_id === msg.sender_id;
          const showDateSeparator =
            index === 0 ||
            formatDateSeparator(msg.created_at) !==
              formatDateSeparator(convMessages[index - 1].created_at);

          return (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isMine={isMine}
              isPrevSameSender={isPrevSameSender}
              showDateSeparator={showDateSeparator}
              conversationType={conversation.type}
              playingVoiceId={playingVoiceId}
              onToggleVoice={handleToggleVoice}
              onOpenLightbox={handleOpenLightbox}
              searchHighlight={searchHighlight}
              onReact={handleReact}
              onReply={handleReply}
              onForward={onForwardMessage}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRetry={handleRetry}
            />
          );
        })
      )}

      {/* Live typing bubble indicator */}
      {typingList.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pl-2 animate-fade-in">
          <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#131A2E] border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-2">
            <span className="font-semibold text-[#4F46E5] dark:text-[#818CF8]">
              {typingList.map((t) => t.displayName).join(', ')}
            </span>
            <span className="text-[11px] text-slate-400">typing</span>
            <span className="flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      {/* Lightbox Preview Modal */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image Preview"
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <IconButton
              aria-label="Close image preview"
              size="md"
              variant="ghost"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </IconButton>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-white text-xs mt-3">{lightboxImage.title}</span>
          </div>
        </div>
      )}
    </section>
  );
};

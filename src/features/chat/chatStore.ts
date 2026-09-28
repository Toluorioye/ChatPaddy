import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  UIConversation,
  UIMessage,
  Profile,
  TypingIndicator,
  CallState,
  RealtimeConnectionStatus,
} from '../../types/chat.types';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  CURRENT_USER,
  MOCK_USERS,
} from '../../lib/mockData';
import {
  playMessageSentSound,
  playMessageReceivedSound,
  startCallRingtone,
  stopCallRingtone,
} from '../../lib/sound';
import { useAuthStore } from '../auth/authStore';

interface ChatState {
  conversations: UIConversation[];
  activeConversationId: string | null;
  messages: Record<string, UIMessage[]>;
  typingUsers: Record<string, TypingIndicator[]>;
  onlineUsers: Record<string, boolean>;
  realtimeStatus: RealtimeConnectionStatus;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isLoadingOlder: Record<string, boolean>;
  hasMoreMessages: Record<string, boolean>;

  searchQuery: string;
  activeFilter: 'all' | 'direct' | 'groups' | 'unread' | 'archived';
  replyingToMessage: UIMessage | null;
  editingMessage: UIMessage | null;
  isRightPanelOpen: boolean;
  activeTab: 'chats' | 'groups' | 'calls' | 'ai' | 'settings';
  callState: CallState;

  // Actions
  initialize: () => void;
  reconnect: () => void;
  loadConversations: () => Promise<void>;
  loadConversationMessages: (conversationId: string) => Promise<void>;
  loadOlderMessages: (conversationId: string) => Promise<boolean>;
  setActiveConversation: (id: string | null) => Promise<void>;
  markConversationAsRead: (conversationId: string) => Promise<void>;

  setActiveTab: (tab: 'chats' | 'groups' | 'calls' | 'ai' | 'settings') => void;
  setActiveFilter: (filter: 'all' | 'direct' | 'groups' | 'unread' | 'archived') => void;
  setSearchQuery: (query: string) => void;
  setReplyingToMessage: (msg: UIMessage | null) => void;
  setEditingMessage: (msg: UIMessage | null) => void;
  toggleRightPanel: () => void;

  // Messaging Actions
  sendMessage: (payload: {
    content: string;
    type?: 'text' | 'image' | 'file' | 'voice';
    attachments?: any[];
    replyToId?: string | null;
  }) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string, deleteForEveryone: boolean) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  forwardMessage: (message: UIMessage, targetConversationId: string) => Promise<void>;

  // Conversation Management
  createDirectChat: (targetUser: Profile) => Promise<string>;
  createGroupChat: (
    name: string,
    description: string,
    memberIds: string[],
    avatarUrl?: string
  ) => Promise<string>;
  togglePinConversation: (conversationId: string) => void;
  toggleArchiveConversation: (conversationId: string) => void;
  toggleMuteConversation: (conversationId: string) => void;
  leaveGroup: (conversationId: string) => void;

  // Typing & Presence
  sendTyping: (isTyping: boolean) => void;
  setOnlineStatus: (userId: string, isOnline: boolean) => void;

  // Calls
  startCall: (conversationId: string, callType: 'voice' | 'video') => void;
  endCall: () => void;
  toggleCallMute: () => void;
  toggleCallCamera: () => void;
  toggleCallScreenShare: () => void;
}

// Multi-tab broadcast channel for local preview multi-window sync
const tabSyncChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('chatpaddy_tab_sync')
    : null;

// References for active Supabase realtime channels
let dbChangesChannel: any = null;
let presenceChannel: any = null;
let typingBroadcastChannel: any = null;
let typingStopTimer: any = null;
let isCleaningUp = false;
let reconnectTimer: any = null;
const typingExpiryTimers: Record<string, any> = {};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: INITIAL_CONVERSATIONS,
  activeConversationId: 'conv_ada_direct',
  messages: INITIAL_MESSAGES,
  typingUsers: {},
  onlineUsers: {
    usr_paddy_ai: true,
    usr_ada_002: true,
    usr_chidi_003: true,
    usr_zainab_004: false,
    usr_marcus_005: false,
    '78a74594-c658-4b86-b58d-d7a040509d05': true, // Ada Supabase ID
    'a9f639d3-9cb8-4661-a9cd-d4506e7f204e': true, // Chidi Supabase ID
  },
  realtimeStatus: 'connecting',
  isLoadingConversations: false,
  isLoadingMessages: false,
  isLoadingOlder: {},
  hasMoreMessages: {},

  searchQuery: '',
  activeFilter: 'all',
  replyingToMessage: null,
  editingMessage: null,
  isRightPanelOpen: false,
  activeTab: 'chats',
  callState: {
    isOpen: false,
    callType: 'voice',
    status: 'ended',
    durationSeconds: 0,
    isMuted: false,
    isCameraOff: false,
    isScreenSharing: false,
  },

  initialize: () => {
    if (typeof window !== 'undefined') {
      (window as any).__chatStoreReconnect = () => get().reconnect();
    }

    // 1. Try to load local cache first for instant layout
    try {
      const savedConvs = localStorage.getItem('chatpaddy_conversations');
      const savedMsgs = localStorage.getItem('chatpaddy_messages');
      if (savedConvs) set({ conversations: JSON.parse(savedConvs) });
      if (savedMsgs) set({ messages: JSON.parse(savedMsgs) });
    } catch (e) {
      console.warn('Local storage load note:', e);
    }

    // 2. Listen for tab sync events in browser
    if (tabSyncChannel) {
      tabSyncChannel.onmessage = (event) => {
        const { type, data } = event.data || {};
        if (type === 'NEW_MESSAGE') {
          const { message, convId } = data;
          const currentMsgs = get().messages[convId] || [];
          if (!currentMsgs.some((m) => m.id === message.id)) {
            set((state) => ({
              messages: {
                ...state.messages,
                [convId]: [...currentMsgs, message],
              },
            }));
            playMessageReceivedSound();
          }
        } else if (type === 'TYPING') {
          const { conversationId, indicator, isTyping } = data;
          set((state) => {
            const list = state.typingUsers[conversationId] || [];
            if (isTyping) {
              const filtered = list.filter((t) => t.userId !== indicator.userId);
              return {
                typingUsers: {
                  ...state.typingUsers,
                  [conversationId]: [...filtered, indicator],
                },
              };
            } else {
              return {
                typingUsers: {
                  ...state.typingUsers,
                  [conversationId]: list.filter((t) => t.userId !== indicator.userId),
                },
              };
            }
          });
        }
      };
    }

    // 3. Online/Offline network listeners for graceful reconnection
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (get().realtimeStatus !== 'connected') {
          get().reconnect();
        }
      });

      window.addEventListener('offline', () => {
        set({ realtimeStatus: 'disconnected' });
      });
    }

    // 4. Load conversations from Supabase & configure Realtime
    if (isSupabaseConfigured) {
      set({ realtimeStatus: 'connecting' });
      get().loadConversations();
      get().reconnect();
    } else {
      set({ realtimeStatus: 'connected' });
    }
  },

  reconnect: () => {
    if (!isSupabaseConfigured) {
      set({ realtimeStatus: 'connected' });
      return;
    }

    // Don't show "reconnecting" if we were just "connecting" on startup
    const currentStatus = get().realtimeStatus;
    if (currentStatus === 'connected') {
      set({ realtimeStatus: 'reconnecting' });
    } else if (currentStatus === 'disconnected') {
      set({ realtimeStatus: navigator.onLine ? 'connecting' : 'disconnected' });
    }

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    // Clean up existing channels before reconnecting
    isCleaningUp = true;
    try {
      if (dbChangesChannel) supabase.removeChannel(dbChangesChannel);
      if (presenceChannel) supabase.removeChannel(presenceChannel);
      if (typingBroadcastChannel) supabase.removeChannel(typingBroadcastChannel);
    } catch (e) {
      console.warn('Channel cleanup note:', e);
    } finally {
      isCleaningUp = false;
    }

    const authUser = useAuthStore.getState().user;
    const currentUserId = authUser?.id || CURRENT_USER.id;

    // --- Channel 1: Supabase Presence (Online Status Tracking) ---
    presenceChannel = supabase.channel('online_presence', {
      config: { presence: { key: currentUserId } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const onlineMap: Record<string, boolean> = { ...get().onlineUsers };

        // Mark active keys as online
        Object.keys(state).forEach((key) => {
          onlineMap[key] = true;
        });

        // Ensure Paddy AI and demo contacts remain accessible
        onlineMap.usr_paddy_ai = true;
        onlineMap['78a74594-c658-4b86-b58d-d7a040509d05'] = true; // Ada Lovelace

        set({ onlineUsers: onlineMap });
      })
      .on('presence', { event: 'join' }, ({ key }: any) => {
        set((prev) => ({
          onlineUsers: { ...prev.onlineUsers, [key]: true },
        }));
      })
      .on('presence', { event: 'leave' }, ({ key }: any) => {
        set((prev) => ({
          onlineUsers: { ...prev.onlineUsers, [key]: false },
        }));
      })
      .subscribe(async (status: string) => {
        if (isCleaningUp) return;
        if (status === 'SUBSCRIBED') {
          set({ realtimeStatus: 'connected' });
          try {
            await presenceChannel.track({
              user_id: currentUserId,
              username: authUser?.username || 'user',
              online_at: new Date().toISOString(),
            });
          } catch (e) {}
        }
      });

    // --- Channel 2: Realtime Broadcast (Typing Indicators) ---
    typingBroadcastChannel = supabase.channel('global_typing_broadcast', {
      config: { broadcast: { self: false } },
    });

    typingBroadcastChannel
      .on('broadcast', { event: 'typing' }, ({ payload }: any) => {
        if (!payload || !payload.conversationId || !payload.userId) return;
        const { conversationId, userId, displayName, isTyping } = payload;
        const currentUid = useAuthStore.getState().user?.id || CURRENT_USER.id;
        if (userId === currentUid) return;

        const timerKey = `${conversationId}_${userId}`;
        if (typingExpiryTimers[timerKey]) {
          clearTimeout(typingExpiryTimers[timerKey]);
          delete typingExpiryTimers[timerKey];
        }

        set((state) => {
          const list = state.typingUsers[conversationId] || [];
          if (isTyping) {
            const filtered = list.filter((t) => t.userId !== userId);
            const indicator: TypingIndicator = {
              conversationId,
              userId,
              username: payload.username || displayName,
              displayName: displayName || 'Someone',
              timestamp: Date.now(),
            };
            return {
              typingUsers: {
                ...state.typingUsers,
                [conversationId]: [...filtered, indicator],
              },
            };
          } else {
            return {
              typingUsers: {
                ...state.typingUsers,
                [conversationId]: list.filter((t) => t.userId !== userId),
              },
            };
          }
        });

        // Auto-expire typing indicator after 3.5 seconds if no stop received
        if (isTyping) {
          typingExpiryTimers[timerKey] = setTimeout(() => {
            set((state) => ({
              typingUsers: {
                ...state.typingUsers,
                [conversationId]: (state.typingUsers[conversationId] || []).filter(
                  (t) => t.userId !== userId
                ),
              },
            }));
            delete typingExpiryTimers[timerKey];
          }, 3500);
        }
      })
      .subscribe();

    // --- Channel 3: Postgres Changes (Messages, Receipts, Reactions) ---
    dbChangesChannel = supabase
      .channel('chat_db_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: any) => {
          const newMsg = payload.new as any;
          if (!newMsg || !newMsg.conversation_id) return;
          const convId = newMsg.conversation_id;
          const currUser = useAuthStore.getState().user || CURRENT_USER;
          const currentMsgs = get().messages[convId] || [];

          // If message is already present (e.g. from optimistic send), update it
          const existingIdx = currentMsgs.findIndex((m) => m.id === newMsg.id);
          if (existingIdx !== -1) {
            const updated = [...currentMsgs];
            updated[existingIdx] = {
              ...updated[existingIdx],
              receipt_status: 'sent',
              is_optimistic: false,
            };
            set((state) => ({
              messages: { ...state.messages, [convId]: updated },
            }));
            return;
          }

          // Otherwise, incoming message from someone else
          const isMine = newMsg.sender_id === currUser.id;
          const incomingMsg: UIMessage = {
            id: newMsg.id,
            conversation_id: convId,
            sender_id: newMsg.sender_id,
            content: newMsg.content,
            type: newMsg.type || 'text',
            reply_to_id: newMsg.reply_to_id,
            forwarded_from: newMsg.forwarded_from,
            edited_at: newMsg.edited_at,
            deleted_at: newMsg.deleted_at,
            deleted_for_everyone: newMsg.deleted_for_everyone || false,
            created_at: newMsg.created_at,
            receipt_status: isMine ? 'sent' : 'delivered',
            is_optimistic: false,
          };

          // Append to messages list
          set((state) => ({
            messages: {
              ...state.messages,
              [convId]: [...(state.messages[convId] || []), incomingMsg],
            },
          }));

          // Bump conversation to top in conversations list
          const activeId = get().activeConversationId;
          const isViewingActive = activeId === convId && typeof document !== 'undefined' && !document.hidden;

          set((state) => ({
            conversations: state.conversations
              .map((c) => {
                if (c.id === convId) {
                  return {
                    ...c,
                    last_message_at: newMsg.created_at,
                    last_message_preview:
                      newMsg.type === 'image'
                        ? '📷 Photo'
                        : newMsg.type === 'voice'
                        ? '🎤 Voice message'
                        : newMsg.type === 'file'
                        ? '📎 File'
                        : newMsg.content?.slice(0, 60),
                    last_message_status: isMine ? ('sent' as const) : undefined,
                    last_message_is_mine: isMine,
                    unread_count: isViewingActive || isMine ? 0 : (c.unread_count || 0) + 1,
                  };
                }
                return c;
              })
              .sort(
                (a, b) =>
                  new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
              ),
          }));

          if (!isMine) {
            playMessageReceivedSound();
            // If user is currently looking at this conversation, mark as read immediately
            if (isViewingActive) {
              get().markConversationAsRead(convId);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload: any) => {
          const updated = payload.new as any;
          if (!updated || !updated.conversation_id) return;
          const convId = updated.conversation_id;

          set((state) => {
            const list = state.messages[convId] || [];
            return {
              messages: {
                ...state.messages,
                [convId]: list.map((m) =>
                  m.id === updated.id
                    ? {
                        ...m,
                        content: updated.deleted_for_everyone ? 'This message was deleted' : updated.content,
                        edited_at: updated.edited_at,
                        deleted_at: updated.deleted_at,
                        deleted_for_everyone: updated.deleted_for_everyone,
                      }
                    : m
                ),
              },
            };
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_receipts' },
        (payload: any) => {
          const row = payload.new as any;
          if (!row || !row.message_id) return;
          const currUid = useAuthStore.getState().user?.id || CURRENT_USER.id;

          // If the receipt is from someone else acknowledging my message
          if (row.user_id !== currUid) {
            const newStatus = row.read_at ? 'read' : row.delivered_at ? 'delivered' : 'sent';

            set((state) => {
              const updatedMsgs = { ...state.messages };
              for (const cId in updatedMsgs) {
                const list = updatedMsgs[cId];
                const msgIndex = list.findIndex((m) => m.id === row.message_id);
                if (msgIndex !== -1) {
                  const copy = [...list];
                  copy[msgIndex] = {
                    ...copy[msgIndex],
                    receipt_status: newStatus,
                  };
                  updatedMsgs[cId] = copy;
                  break;
                }
              }
              return { messages: updatedMsgs };
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_reactions' },
        (payload: any) => {
          // When a reaction is added or removed, re-sync reactions for that message
          const row = (payload.new || payload.old) as any;
          if (!row || !row.message_id) return;
          // Local optimistic update already provides instant feedback
        }
      )
      .subscribe((status: string) => {
        if (isCleaningUp) return;
        if (status === 'SUBSCRIBED') {
          set({ realtimeStatus: 'connected' });
          if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
          }
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          console.warn('Realtime channel status warning:', status);
          if (typeof navigator !== 'undefined' && !navigator.onLine) {
            set({ realtimeStatus: 'disconnected' });
          } else {
            set({ realtimeStatus: 'reconnecting' });
          }
          if (!reconnectTimer) {
            reconnectTimer = setTimeout(() => {
              reconnectTimer = null;
              get().reconnect();
            }, 3500);
          }
        } else if (status === 'CLOSED') {
          if (!isCleaningUp) {
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
              set({ realtimeStatus: 'disconnected' });
            } else {
              set({ realtimeStatus: 'reconnecting' });
              if (!reconnectTimer) {
                reconnectTimer = setTimeout(() => {
                  reconnectTimer = null;
                  get().reconnect();
                }, 3500);
              }
            }
          }
        }
      });
  },

  loadConversations: async () => {
    if (!isSupabaseConfigured) return;

    set({ isLoadingConversations: true });
    try {
      const user = useAuthStore.getState().user;
      const { data, error } = await (supabase as any).rpc('get_user_conversations', {
        p_user_id: user?.id || null,
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        const remoteConvs: UIConversation[] = (data as any[]).map((item: any) => ({
          id: item.id,
          type: item.type,
          name: item.name || 'Chat',
          avatar_url: item.avatar_url,
          description: item.description,
          is_pinned: item.is_pinned || false,
          is_archived: item.is_archived || false,
          is_muted: item.is_muted || false,
          unread_count: item.unread_count || 0,
          last_message_at: item.last_message_at || item.created_at,
          last_message_preview: item.last_message_preview || 'No messages yet',
          other_user: item.other_user,
          participants: item.participants || [],
          last_message_status: item.last_message_status,
          last_message_is_mine: item.last_message_is_mine,
        }));

        // Always keep Paddy AI available at the top or merged in
        const paddyConv = INITIAL_CONVERSATIONS.find((c) => c.id === 'conv_paddy_ai');
        const merged = paddyConv && !remoteConvs.some((c) => c.other_user?.username === 'paddy_ai')
          ? [paddyConv, ...remoteConvs]
          : remoteConvs;

        set({ conversations: merged });

        // Set active conversation if not set or invalid
        const activeId = get().activeConversationId;
        const validActive = merged.some((c) => c.id === activeId);
        const selectedId = validActive ? activeId : merged[0]?.id || null;
        if (selectedId && selectedId !== activeId) {
          set({ activeConversationId: selectedId });
        }

        if (selectedId) {
          get().loadConversationMessages(selectedId);
        }
      } else {
        // Fallback to initial mock data if no Supabase records returned
        const activeId = get().activeConversationId || INITIAL_CONVERSATIONS[0].id;
        set({
          conversations: INITIAL_CONVERSATIONS,
          activeConversationId: activeId,
        });
        get().loadConversationMessages(activeId);
      }
    } catch (err) {
      console.warn('Failed to load conversations from Supabase:', err);
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  loadConversationMessages: async (conversationId: string) => {
    if (!conversationId) return;

    // If we already have messages loaded in store and it's a mock conversation, don't overwrite
    const isMockId = conversationId.startsWith('conv_');
    if (!isSupabaseConfigured || (isMockId && !conversationId.includes('-'))) {
      if (!get().messages[conversationId] && INITIAL_MESSAGES[conversationId]) {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: INITIAL_MESSAGES[conversationId],
          },
          hasMoreMessages: { ...state.hasMoreMessages, [conversationId]: false },
        }));
      }
      return;
    }

    set({ isLoadingMessages: true });
    try {
      const { data, error } = await (supabase as any).rpc('get_conversation_messages', {
        p_conversation_id: conversationId,
        p_limit: 30,
      });

      if (!error && Array.isArray(data)) {
        const formatted: UIMessage[] = (data as any[]).map((m: any) => ({
          id: m.id,
          conversation_id: m.conversation_id,
          sender_id: m.sender_id,
          content: m.content,
          type: m.type || 'text',
          reply_to_id: m.reply_to_id,
          forwarded_from: m.forwarded_from,
          edited_at: m.edited_at,
          deleted_at: m.deleted_at,
          deleted_for_everyone: m.deleted_for_everyone || false,
          created_at: m.created_at,
          sender: m.sender,
          reply_to: m.reply_to,
          attachments: m.attachments || [],
          reactions: m.reactions || {},
          receipt_status: m.receipt_status || 'delivered',
          is_optimistic: false,
        }));

        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: formatted,
          },
          hasMoreMessages: {
            ...state.hasMoreMessages,
            [conversationId]: data.length >= 30,
          },
        }));
      }
    } catch (err) {
      console.warn('Failed to load messages for conversation:', err);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  loadOlderMessages: async (conversationId: string): Promise<boolean> => {
    const { messages, isLoadingOlder, hasMoreMessages } = get();
    if (isLoadingOlder[conversationId] || hasMoreMessages[conversationId] === false) {
      return false;
    }

    const currentList = messages[conversationId] || [];
    if (currentList.length === 0) return false;

    set((state) => ({
      isLoadingOlder: { ...state.isLoadingOlder, [conversationId]: true },
    }));

    try {
      const oldestMessage = currentList[0];
      const oldestTimestamp = oldestMessage?.created_at;

      if (!isSupabaseConfigured || (!conversationId.includes('-') && conversationId.startsWith('conv_'))) {
        // Mock infinite scroll: simulate 5 older messages
        await new Promise((resolve) => setTimeout(resolve, 600));
        const olderBatch: UIMessage[] = [
          {
            id: `msg_mock_old_${Date.now()}_1`,
            conversation_id: conversationId,
            sender_id: oldestMessage.sender_id,
            content: 'Sharing earlier context from our system architecture review.',
            type: 'text',
            reply_to_id: null,
            forwarded_from: null,
            edited_at: null,
            deleted_at: null,
            deleted_for_everyone: false,
            created_at: new Date(new Date(oldestTimestamp).getTime() - 86400000).toISOString(),
            sender: oldestMessage.sender,
            receipt_status: 'read',
          },
          {
            id: `msg_mock_old_${Date.now()}_2`,
            conversation_id: conversationId,
            sender_id: useAuthStore.getState().user?.id || CURRENT_USER.id,
            content: 'Thanks! Let us verify the RLS policies and table indexes.',
            type: 'text',
            reply_to_id: null,
            forwarded_from: null,
            edited_at: null,
            deleted_at: null,
            deleted_for_everyone: false,
            created_at: new Date(new Date(oldestTimestamp).getTime() - 86000000).toISOString(),
            sender: useAuthStore.getState().user || CURRENT_USER,
            receipt_status: 'read',
          },
        ];

        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [...olderBatch, ...(state.messages[conversationId] || [])],
          },
          hasMoreMessages: { ...state.hasMoreMessages, [conversationId]: false },
          isLoadingOlder: { ...state.isLoadingOlder, [conversationId]: false },
        }));
        return true;
      }

      const { data, error } = await (supabase as any).rpc('get_conversation_messages', {
        p_conversation_id: conversationId,
        p_limit: 25,
        p_before: oldestTimestamp,
      });

      if (!error && Array.isArray(data)) {
        if ((data as any[]).length === 0) {
          set((state) => ({
            hasMoreMessages: { ...state.hasMoreMessages, [conversationId]: false },
            isLoadingOlder: { ...state.isLoadingOlder, [conversationId]: false },
          }));
          return false;
        }

        const olderFormatted: UIMessage[] = (data as any[]).map((m: any) => ({
          id: m.id,
          conversation_id: m.conversation_id,
          sender_id: m.sender_id,
          content: m.content,
          type: m.type || 'text',
          reply_to_id: m.reply_to_id,
          forwarded_from: m.forwarded_from,
          edited_at: m.edited_at,
          deleted_at: m.deleted_at,
          deleted_for_everyone: m.deleted_for_everyone || false,
          created_at: m.created_at,
          sender: m.sender,
          reply_to: m.reply_to,
          attachments: m.attachments || [],
          reactions: m.reactions || {},
          receipt_status: m.receipt_status || 'read',
          is_optimistic: false,
        }));

        set((state) => {
          const existingIds = new Set((state.messages[conversationId] || []).map((m) => m.id));
          const filteredOlder = olderFormatted.filter((m) => !existingIds.has(m.id));

          return {
            messages: {
              ...state.messages,
              [conversationId]: [...filteredOlder, ...(state.messages[conversationId] || [])],
            },
            hasMoreMessages: {
              ...state.hasMoreMessages,
              [conversationId]: data.length >= 25,
            },
            isLoadingOlder: { ...state.isLoadingOlder, [conversationId]: false },
          };
        });
        return true;
      }
    } catch (e) {
      console.warn('Failed to load older messages:', e);
    } finally {
      set((state) => ({
        isLoadingOlder: { ...state.isLoadingOlder, [conversationId]: false },
      }));
    }
    return false;
  },

  setActiveConversation: async (id) => {
    set({
      activeConversationId: id,
      replyingToMessage: null,
      editingMessage: null,
    });

    if (id) {
      // Clear unread badge in UI immediately
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, unread_count: 0 } : c
        ),
      }));

      // Load messages if not loaded or if switching
      get().loadConversationMessages(id);

      // Auto mark as read in Supabase
      get().markConversationAsRead(id);
    }
  },

  markConversationAsRead: async (conversationId: string) => {
    if (!conversationId) return;

    // Locally clear unread count
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unread_count: 0 } : c
      ),
    }));

    // If Supabase is configured and it's a real UUID conversation
    if (isSupabaseConfigured && conversationId.includes('-')) {
      try {
        await (supabase as any).rpc('mark_conversation_as_read', { conv_id: conversationId });
      } catch (err) {
        console.warn('mark_conversation_as_read note:', err);
      }
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setReplyingToMessage: (msg) => set({ replyingToMessage: msg }),
  setEditingMessage: (msg) => set({ editingMessage: msg }),
  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

  sendMessage: async ({ content, type = 'text', attachments, replyToId }) => {
    const { activeConversationId, messages, conversations, replyingToMessage } = get();
    if (!activeConversationId) return;

    const currentConv = conversations.find((c) => c.id === activeConversationId);
    const authUser = useAuthStore.getState().user || CURRENT_USER;
    const now = new Date().toISOString();

    // Use a standard UUID for optimistic message so it matches Supabase schema type
    const messageId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const optimisticMessage: UIMessage = {
      id: messageId,
      conversation_id: activeConversationId,
      sender_id: authUser.id,
      content,
      type,
      reply_to_id: replyToId || replyingToMessage?.id || null,
      reply_to: replyingToMessage,
      forwarded_from: null,
      edited_at: null,
      deleted_at: null,
      deleted_for_everyone: false,
      created_at: now,
      sender: authUser,
      attachments: attachments || [],
      reactions: {},
      receipt_status: 'sending',
      is_optimistic: true,
    };

    // 1. Optimistic UI update: message appears immediately!
    const convMessages = messages[activeConversationId] || [];
    const updatedMessages = [...convMessages, optimisticMessage];

    const previewText =
      type === 'image'
        ? '📷 Photo'
        : type === 'voice'
        ? '🎤 Voice note'
        : type === 'file'
        ? '📎 File'
        : content.substring(0, 60);

    const updatedConversations = conversations
      .map((conv) => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            last_message_at: now,
            last_message_preview: previewText,
            last_message_status: 'sent' as const,
            last_message_is_mine: true,
          };
        }
        return conv;
      })
      .sort(
        (a, b) =>
          new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );

    set({
      messages: { ...messages, [activeConversationId]: updatedMessages },
      conversations: updatedConversations,
      replyingToMessage: null,
    });

    playMessageSentSound();

    // Broadcast to other browser tabs
    if (tabSyncChannel) {
      tabSyncChannel.postMessage({
        type: 'NEW_MESSAGE',
        data: { message: optimisticMessage, convId: activeConversationId },
      });
    }

    // 2. Perform Supabase database insert if configured and UUID conversation
    const isRealSupabaseConv = isSupabaseConfigured && activeConversationId.includes('-');

    if (isRealSupabaseConv) {
      try {
        const { error } = await (supabase.from('messages') as any).insert({
          id: messageId,
          conversation_id: activeConversationId,
          sender_id: authUser.id,
          content,
          type,
          reply_to_id: replyToId || replyingToMessage?.id || null,
        });

        if (error) {
          console.warn('Supabase message insert error:', error.message);
          set((state) => ({
            messages: {
              ...state.messages,
              [activeConversationId]: (state.messages[activeConversationId] || []).map((m) =>
                m.id === messageId ? { ...m, receipt_status: 'failed' } : m
              ),
            },
          }));
        } else {
          // Status updated to sent
          set((state) => ({
            messages: {
              ...state.messages,
              [activeConversationId]: (state.messages[activeConversationId] || []).map((m) =>
                m.id === messageId ? { ...m, receipt_status: 'sent', is_optimistic: false } : m
              ),
            },
          }));

          // Update conversation last_message preview in Supabase
          await (supabase.from('conversations') as any)
            .update({
              last_message_at: now,
              last_message_preview: previewText,
            })
            .eq('id', activeConversationId);
        }
      } catch (err) {
        console.warn('Message send error:', err);
        set((state) => ({
          messages: {
            ...state.messages,
            [activeConversationId]: (state.messages[activeConversationId] || []).map((m) =>
              m.id === messageId ? { ...m, receipt_status: 'failed' } : m
            ),
          },
        }));
      }
    } else {
      // Demo / simulated mode receipt flow
      setTimeout(() => {
        set((state) => ({
          messages: {
            ...state.messages,
            [activeConversationId]: (state.messages[activeConversationId] || []).map((m) =>
              m.id === messageId
                ? { ...m, receipt_status: 'delivered', is_optimistic: false }
                : m
            ),
          },
        }));
      }, 500);

      setTimeout(() => {
        set((state) => ({
          messages: {
            ...state.messages,
            [activeConversationId]: (state.messages[activeConversationId] || []).map((m) =>
              m.id === messageId ? { ...m, receipt_status: 'read' } : m
            ),
          },
        }));
      }, 1600);
    }

    // Persist to local cache
    try {
      localStorage.setItem(
        'chatpaddy_messages',
        JSON.stringify({ ...messages, [activeConversationId]: updatedMessages })
      );
      localStorage.setItem('chatpaddy_conversations', JSON.stringify(updatedConversations));
    } catch (e) {}

    // 3. Automated responses from Paddy AI or simulated contacts
    if (
      currentConv?.other_user?.id === 'usr_paddy_ai' ||
      currentConv?.name?.includes('Paddy AI')
    ) {
      setTimeout(() => {
        get().sendTyping(true);
      }, 600);

      setTimeout(() => {
        get().sendTyping(false);
        const lower = content.toLowerCase();
        let replyText = `I hear you! I'm Paddy AI, your real-time co-pilot on ChatPaddy. Ask me questions, request a summary, or draft code.`;

        if (lower.includes('summar') || lower.includes('tldr')) {
          replyText = `### 📋 Conversation Summary\n- **Architecture**: Supabase Realtime (Postgres changes, Broadcast, Presence)\n- **State**: Optimistic sending, receipts (sent/delivered/read), unread badges\n- **Next Step**: Deploy to production or add voice notes.`;
        } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
          replyText = `Hello ${authUser.display_name}! Everything is synchronized via Supabase Realtime. Feel free to test typing indicators or open another window!`;
        } else if (lower.includes('test') || lower.includes('realtime') || lower.includes('broadcast')) {
          replyText = `Realtime Broadcast and Presence are active! Notice the online status dot, delivery receipts, and live typing indicator in action.`;
        }

        const aiMsgId =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `msg_ai_${Date.now()}`;

        const aiMsg: UIMessage = {
          id: aiMsgId,
          conversation_id: activeConversationId,
          sender_id: 'usr_paddy_ai',
          content: replyText,
          type: 'text',
          reply_to_id: messageId,
          forwarded_from: null,
          edited_at: null,
          deleted_at: null,
          deleted_for_everyone: false,
          created_at: new Date().toISOString(),
          sender: MOCK_USERS[0],
          receipt_status: 'delivered',
        };

        set((state) => {
          const existing = state.messages[activeConversationId] || [];
          return {
            messages: {
              ...state.messages,
              [activeConversationId]: [...existing, aiMsg],
            },
          };
        });
        playMessageReceivedSound();
      }, 1800);
    }
  },

  retryMessage: async (messageId: string) => {
    const { activeConversationId, messages } = get();
    if (!activeConversationId) return;

    const list = messages[activeConversationId] || [];
    const target = list.find((m) => m.id === messageId);
    if (!target) return;

    // Reset status to sending
    set((state) => ({
      messages: {
        ...state.messages,
        [activeConversationId]: (state.messages[activeConversationId] || []).map((m) =>
          m.id === messageId ? { ...m, receipt_status: 'sending' } : m
        ),
      },
    }));

    if (isSupabaseConfigured && activeConversationId.includes('-')) {
      try {
        const { error } = await (supabase.from('messages') as any).insert({
          id: target.id,
          conversation_id: activeConversationId,
          sender_id: target.sender_id,
          content: target.content,
          type: target.type,
          reply_to_id: target.reply_to_id,
        });

        if (error) {
          set((state) => ({
            messages: {
              ...state.messages,
              [activeConversationId]: (state.messages[activeConversationId] || []).map((m) =>
                m.id === messageId ? { ...m, receipt_status: 'failed' } : m
              ),
            },
          }));
        } else {
          set((state) => ({
            messages: {
              ...state.messages,
              [activeConversationId]: (state.messages[activeConversationId] || []).map((m) =>
                m.id === messageId ? { ...m, receipt_status: 'sent', is_optimistic: false } : m
              ),
            },
          }));
        }
      } catch (e) {
        set((state) => ({
          messages: {
            ...state.messages,
            [activeConversationId]: (state.messages[activeConversationId] || []).map((m) =>
              m.id === messageId ? { ...m, receipt_status: 'failed' } : m
            ),
          },
        }));
      }
    }
  },

  editMessage: async (messageId, newContent) => {
    const { activeConversationId, messages } = get();
    if (!activeConversationId) return;

    const convMessages = messages[activeConversationId] || [];
    const updated = convMessages.map((m) =>
      m.id === messageId
        ? { ...m, content: newContent, edited_at: new Date().toISOString() }
        : m
    );

    set({
      messages: { ...messages, [activeConversationId]: updated },
      editingMessage: null,
    });

    if (isSupabaseConfigured && activeConversationId.includes('-')) {
      try {
        await (supabase.from('messages') as any)
          .update({ content: newContent, edited_at: new Date().toISOString() })
          .eq('id', messageId);
      } catch (e) {}
    }
  },

  deleteMessage: async (messageId, deleteForEveryone) => {
    const { activeConversationId, messages } = get();
    if (!activeConversationId) return;

    const convMessages = messages[activeConversationId] || [];
    let updated: UIMessage[];

    if (deleteForEveryone) {
      updated = convMessages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              content: 'This message was deleted',
              deleted_at: new Date().toISOString(),
              deleted_for_everyone: true,
              attachments: [],
            }
          : m
      );
    } else {
      updated = convMessages.filter((m) => m.id !== messageId);
    }

    set({ messages: { ...messages, [activeConversationId]: updated } });

    if (isSupabaseConfigured && deleteForEveryone && activeConversationId.includes('-')) {
      try {
        await (supabase.from('messages') as any)
          .update({
            content: 'This message was deleted',
            deleted_at: new Date().toISOString(),
            deleted_for_everyone: true,
          })
          .eq('id', messageId);
      } catch (e) {}
    }
  },

  toggleReaction: async (messageId, emoji) => {
    const { activeConversationId, messages } = get();
    if (!activeConversationId) return;
    const authUser = useAuthStore.getState().user || CURRENT_USER;

    const convMessages = messages[activeConversationId] || [];
    const updated = convMessages.map((m) => {
      if (m.id !== messageId) return m;

      const currentReactions = { ...(m.reactions || {}) };
      const current = currentReactions[emoji] || { count: 0, users: [], userReacted: false };

      if (current.userReacted) {
        const newCount = current.count - 1;
        if (newCount <= 0) {
          delete currentReactions[emoji];
        } else {
          currentReactions[emoji] = {
            count: newCount,
            users: current.users.filter((u) => u !== authUser.id),
            userReacted: false,
          };
        }
      } else {
        currentReactions[emoji] = {
          count: current.count + 1,
          users: [...current.users, authUser.id],
          userReacted: true,
        };
      }

      return { ...m, reactions: currentReactions };
    });

    set({ messages: { ...messages, [activeConversationId]: updated } });

    if (isSupabaseConfigured && activeConversationId.includes('-')) {
      try {
        // Toggle reaction in database
        const { data: existing } = await (supabase.from('message_reactions') as any)
          .select('id')
          .match({ message_id: messageId, user_id: authUser.id, emoji })
          .maybeSingle();

        if (existing) {
          await (supabase.from('message_reactions') as any).delete().eq('id', (existing as any).id);
        } else {
          await (supabase.from('message_reactions') as any).insert({
            message_id: messageId,
            user_id: authUser.id,
            emoji,
          });
        }
      } catch (e) {}
    }
  },

  forwardMessage: async (message, targetConversationId) => {
    const { messages, sendMessage } = get();
    const currentActive = get().activeConversationId;
    await get().setActiveConversation(targetConversationId);
    await sendMessage({
      content: message.content,
      type: message.type as any,
      attachments: message.attachments,
    });
  },

  createDirectChat: async (targetUser) => {
    const { conversations } = get();
    const authUser = useAuthStore.getState().user || CURRENT_USER;

    // Check if direct conversation already exists
    const existing = conversations.find(
      (c) => c.type === 'direct' && c.other_user?.id === targetUser.id
    );
    if (existing) {
      await get().setActiveConversation(existing.id);
      return existing.id;
    }

    if (isSupabaseConfigured && targetUser.id.includes('-') && authUser.id.includes('-')) {
      try {
        const { data: convId, error } = await (supabase as any).rpc('get_or_create_direct_conversation', {
          other_user_id: targetUser.id,
        });

        if (!error && convId) {
          await get().loadConversations();
          await get().setActiveConversation(convId);
          return convId;
        }
      } catch (err) {
        console.warn('RPC create direct chat note:', err);
      }
    }

    // Local fallback direct chat creation
    const newConvId = `conv_direct_${Date.now()}`;
    const newConv: UIConversation = {
      id: newConvId,
      type: 'direct',
      name: targetUser.display_name,
      avatar_url: targetUser.avatar_url,
      description: targetUser.bio || 'Direct message',
      is_pinned: false,
      is_archived: false,
      is_muted: false,
      unread_count: 0,
      last_message_at: new Date().toISOString(),
      last_message_preview: 'Started a new conversation',
      other_user: targetUser,
      participants: [
        {
          conversation_id: newConvId,
          user_id: authUser.id,
          role: 'member',
          last_read_at: new Date().toISOString(),
          is_pinned: false,
          is_archived: false,
          is_muted: false,
          joined_at: new Date().toISOString(),
          profile: authUser,
        },
        {
          conversation_id: newConvId,
          user_id: targetUser.id,
          role: 'member',
          last_read_at: new Date().toISOString(),
          is_pinned: false,
          is_archived: false,
          is_muted: false,
          joined_at: new Date().toISOString(),
          profile: targetUser,
        },
      ],
    };

    set((state) => ({
      conversations: [newConv, ...state.conversations],
      activeConversationId: newConvId,
      messages: { ...state.messages, [newConvId]: [] },
    }));

    return newConvId;
  },

  createGroupChat: async (name, description, memberIds, avatarUrl) => {
    const authUser = useAuthStore.getState().user || CURRENT_USER;
    const newConvId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `conv_group_${Date.now()}`;

    const selectedMembers = MOCK_USERS.filter((u) => memberIds.includes(u.id));

    const participants = [
      {
        conversation_id: newConvId,
        user_id: authUser.id,
        role: 'owner' as const,
        last_read_at: new Date().toISOString(),
        is_pinned: false,
        is_archived: false,
        is_muted: false,
        joined_at: new Date().toISOString(),
        profile: authUser,
      },
      ...selectedMembers.map((m) => ({
        conversation_id: newConvId,
        user_id: m.id,
        role: 'member' as const,
        last_read_at: new Date().toISOString(),
        is_pinned: false,
        is_archived: false,
        is_muted: false,
        joined_at: new Date().toISOString(),
        profile: m,
      })),
    ];

    const newGroup: UIConversation = {
      id: newConvId,
      type: 'group',
      name,
      avatar_url: avatarUrl || null,
      description,
      is_pinned: false,
      is_archived: false,
      is_muted: false,
      unread_count: 0,
      last_message_at: new Date().toISOString(),
      last_message_preview: `Group "${name}" created`,
      participants,
      group_meta: {
        conversation_id: newConvId,
        name,
        description,
        avatar_url: avatarUrl || null,
        created_by: authUser.id,
        created_at: new Date().toISOString(),
      },
    };

    const initialSysMsg: UIMessage = {
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `msg_sys_${Date.now()}`,
      conversation_id: newConvId,
      sender_id: authUser.id,
      content: `${authUser.display_name} created group "${name}"`,
      type: 'system',
      reply_to_id: null,
      forwarded_from: null,
      edited_at: null,
      deleted_at: null,
      deleted_for_everyone: false,
      created_at: new Date().toISOString(),
      sender: authUser,
    };

    set((state) => ({
      conversations: [newGroup, ...state.conversations],
      activeConversationId: newConvId,
      messages: { ...state.messages, [newConvId]: [initialSysMsg] },
    }));

    return newConvId;
  },

  togglePinConversation: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, is_pinned: !c.is_pinned } : c
      ),
    }));
  },

  toggleArchiveConversation: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, is_archived: !c.is_archived } : c
      ),
    }));
  },

  toggleMuteConversation: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, is_muted: !c.is_muted } : c
      ),
    }));
  },

  leaveGroup: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== conversationId),
      activeConversationId:
        state.activeConversationId === conversationId ? null : state.activeConversationId,
    }));
  },

  sendTyping: (isTyping) => {
    const { activeConversationId } = get();
    if (!activeConversationId) return;

    const authUser = useAuthStore.getState().user || CURRENT_USER;

    // Send via Supabase Broadcast
    if (typingBroadcastChannel) {
      try {
        typingBroadcastChannel.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            conversationId: activeConversationId,
            userId: authUser.id,
            displayName: authUser.display_name,
            username: authUser.username,
            isTyping,
          },
        });
      } catch (e) {}
    }

    // Send via local Tab BroadcastChannel for multi-window preview
    if (tabSyncChannel) {
      tabSyncChannel.postMessage({
        type: 'TYPING',
        data: {
          conversationId: activeConversationId,
          indicator: {
            conversationId: activeConversationId,
            userId: authUser.id,
            displayName: authUser.display_name,
            username: authUser.username,
            timestamp: Date.now(),
          },
          isTyping,
        },
      });
    }

    // Auto-debounce stop typing if user stops interacting for 2.5s
    if (isTyping) {
      if (typingStopTimer) clearTimeout(typingStopTimer);
      typingStopTimer = setTimeout(() => {
        get().sendTyping(false);
      }, 2500);
    }
  },

  setOnlineStatus: (userId, isOnline) => {
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [userId]: isOnline },
    }));
  },

  startCall: (conversationId, callType) => {
    const { conversations } = get();
    const conv = conversations.find((c) => c.id === conversationId);
    startCallRingtone();
    set({
      callState: {
        isOpen: true,
        conversationId,
        callType,
        status: 'ringing',
        recipient: conv?.other_user,
        durationSeconds: 0,
        isMuted: false,
        isCameraOff: false,
        isScreenSharing: false,
      },
    });

    // Simulate answering after 3.5s
    setTimeout(() => {
      stopCallRingtone();
      set((state) => ({
        callState: {
          ...state.callState,
          status: 'connected',
        },
      }));
    }, 3500);
  },

  endCall: () => {
    stopCallRingtone();
    set((state) => ({
      callState: {
        ...state.callState,
        isOpen: false,
        status: 'ended',
      },
    }));
  },

  toggleCallMute: () => {
    set((state) => ({
      callState: {
        ...state.callState,
        isMuted: !state.callState.isMuted,
      },
    }));
  },

  toggleCallCamera: () => {
    set((state) => ({
      callState: {
        ...state.callState,
        isCameraOff: !state.callState.isCameraOff,
      },
    }));
  },

  toggleCallScreenShare: () => {
    set((state) => ({
      callState: {
        ...state.callState,
        isScreenSharing: !state.callState.isScreenSharing,
      },
    }));
  },
}));

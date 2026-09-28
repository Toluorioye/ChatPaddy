import { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ConversationRow = Database['public']['Tables']['conversations']['Row'];
export type ParticipantRow = Database['public']['Tables']['conversation_participants']['Row'];
export type GroupMetadata = Database['public']['Tables']['groups_metadata']['Row'];
export type MessageRow = Database['public']['Tables']['messages']['Row'];
export type Attachment = Database['public']['Tables']['attachments']['Row'];
export type Reaction = Database['public']['Tables']['message_reactions']['Row'];
export type Receipt = Database['public']['Tables']['message_receipts']['Row'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type CallLog = Database['public']['Tables']['call_logs']['Row'];

export interface UIConversation {
  id: string;
  type: 'direct' | 'group';
  last_message_at: string;
  last_message_preview?: string | null;
  name: string;
  avatar_url?: string | null;
  description?: string;
  is_pinned: boolean;
  is_archived: boolean;
  is_muted: boolean;
  unread_count: number;
  other_user?: Profile;
  participants: (ParticipantRow & { profile?: Profile })[];
  group_meta?: GroupMetadata;
  last_message_status?: 'sent' | 'delivered' | 'read';
  last_message_is_mine?: boolean;
}

export interface UIMessage extends MessageRow {
  sender?: Profile;
  attachments?: Attachment[];
  reactions?: { [emoji: string]: { count: number; users: string[]; userReacted: boolean } };
  reply_to?: UIMessage | null;
  receipts?: Receipt[];
  receipt_status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  is_optimistic?: boolean;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  username: string;
  displayName: string;
  timestamp: number;
}

export type RealtimeConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface CallState {
  isOpen: boolean;
  conversationId?: string;
  callType: 'voice' | 'video';
  status: 'ringing' | 'connected' | 'ended';
  recipient?: Profile;
  durationSeconds: number;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
}

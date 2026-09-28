export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          phone: string | null;
          status_text: string | null;
          is_online: boolean;
          last_seen_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          status_text?: string | null;
          is_online?: boolean;
          last_seen_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          status_text?: string | null;
          is_online?: boolean;
          last_seen_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          type: 'direct' | 'group';
          last_message_at: string;
          last_message_preview: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: 'direct' | 'group';
          last_message_at?: string;
          last_message_preview?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: 'direct' | 'group';
          last_message_at?: string;
          last_message_preview?: string | null;
          updated_at?: string;
        };
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          user_id: string;
          role: 'member' | 'admin' | 'owner';
          last_read_at: string;
          is_pinned: boolean;
          is_archived: boolean;
          is_muted: boolean;
          joined_at: string;
        };
        Insert: {
          conversation_id: string;
          user_id: string;
          role?: 'member' | 'admin' | 'owner';
          last_read_at?: string;
          is_pinned?: boolean;
          is_archived?: boolean;
          is_muted?: boolean;
          joined_at?: string;
        };
        Update: {
          role?: 'member' | 'admin' | 'owner';
          last_read_at?: string;
          is_pinned?: boolean;
          is_archived?: boolean;
          is_muted?: boolean;
        };
      };
      groups_metadata: {
        Row: {
          conversation_id: string;
          name: string;
          description: string | null;
          avatar_url: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          conversation_id: string;
          name: string;
          description?: string | null;
          avatar_url?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          avatar_url?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          type: 'text' | 'image' | 'file' | 'voice' | 'system';
          reply_to_id: string | null;
          forwarded_from: string | null;
          edited_at: string | null;
          deleted_at: string | null;
          deleted_for_everyone: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content?: string;
          type?: 'text' | 'image' | 'file' | 'voice' | 'system';
          reply_to_id?: string | null;
          forwarded_from?: string | null;
          edited_at?: string | null;
          deleted_at?: string | null;
          deleted_for_everyone?: boolean;
          created_at?: string;
        };
        Update: {
          content?: string;
          type?: 'text' | 'image' | 'file' | 'voice' | 'system';
          edited_at?: string | null;
          deleted_at?: string | null;
          deleted_for_everyone?: boolean;
        };
      };
      message_receipts: {
        Row: {
          message_id: string;
          user_id: string;
          delivered_at: string | null;
          read_at: string | null;
        };
        Insert: {
          message_id: string;
          user_id: string;
          delivered_at?: string | null;
          read_at?: string | null;
        };
        Update: {
          delivered_at?: string | null;
          read_at?: string | null;
        };
      };
      attachments: {
        Row: {
          id: string;
          message_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          size: number;
          duration: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          size: number;
          duration?: number | null;
          created_at?: string;
        };
        Update: {
          file_name?: string;
          mime_type?: string;
          size?: number;
          duration?: number | null;
        };
      };
      message_reactions: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          emoji: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          user_id: string;
          emoji: string;
          created_at?: string;
        };
        Update: {
          emoji?: string;
        };
      };
      blocked_users: {
        Row: {
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: {
          blocker_id: string;
          blocked_id: string;
          created_at?: string;
        };
        Update: {};
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string | null;
          reported_message_id: string | null;
          reason: string;
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_user_id?: string | null;
          reported_message_id?: string | null;
          reason: string;
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          created_at?: string;
        };
        Update: {
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          theme: 'light' | 'dark' | 'system';
          sound_enabled: boolean;
          read_receipts_enabled: boolean;
          last_seen_privacy: 'everyone' | 'contacts' | 'nobody';
          avatar_privacy: 'everyone' | 'contacts' | 'nobody';
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: 'light' | 'dark' | 'system';
          sound_enabled?: boolean;
          read_receipts_enabled?: boolean;
          last_seen_privacy?: 'everyone' | 'contacts' | 'nobody';
          avatar_privacy?: 'everyone' | 'contacts' | 'nobody';
          updated_at?: string;
        };
        Update: {
          theme?: 'light' | 'dark' | 'system';
          sound_enabled?: boolean;
          read_receipts_enabled?: boolean;
          last_seen_privacy?: 'everyone' | 'contacts' | 'nobody';
          avatar_privacy?: 'everyone' | 'contacts' | 'nobody';
          updated_at?: string;
        };
      };
      admin_roles: {
        Row: {
          user_id: string;
          role: 'super_admin' | 'moderator';
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: 'super_admin' | 'moderator';
          created_at?: string;
        };
        Update: {
          role?: 'super_admin' | 'moderator';
        };
      };
      call_logs: {
        Row: {
          id: string;
          caller_id: string;
          receiver_id: string | null;
          conversation_id: string | null;
          type: 'voice' | 'video';
          status: 'initiated' | 'ringing' | 'connected' | 'ended' | 'missed' | 'declined';
          duration_seconds: number;
          started_at: string;
          ended_at: string | null;
        };
        Insert: {
          id?: string;
          caller_id: string;
          receiver_id?: string | null;
          conversation_id?: string | null;
          type: 'voice' | 'video';
          status?: 'initiated' | 'ringing' | 'connected' | 'ended' | 'missed' | 'declined';
          duration_seconds?: number;
          started_at?: string;
          ended_at?: string | null;
        };
        Update: {
          status?: 'initiated' | 'ringing' | 'connected' | 'ended' | 'missed' | 'declined';
          duration_seconds?: number;
          ended_at?: string | null;
        };
      };
    };
    Functions: {
      get_or_create_direct_conversation: {
        Args: { other_user_id: string };
        Returns: string;
      };
      get_user_conversations: {
        Args: { p_user_id?: string | null };
        Returns: Json;
      };
      get_conversation_messages: {
        Args: { p_conversation_id: string; p_limit?: number; p_before?: string | null };
        Returns: Json;
      };
      mark_conversation_as_read: {
        Args: { conv_id: string };
        Returns: void;
      };
      get_unread_counts: {
        Args: Record<string, never>;
        Returns: { conversation_id: string; unread_count: number }[];
      };
      is_participant: {
        Args: { conv_id: string };
        Returns: boolean;
      };
      is_group_admin: {
        Args: { conv_id: string };
        Returns: boolean;
      };
      is_platform_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}

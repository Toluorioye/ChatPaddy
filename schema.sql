-- ==========================================================
-- ChatPaddy: Complete Supabase Database Schema & Migration
-- ==========================================================
-- Production PostgreSQL schema for ChatPaddy real-time chat platform
-- Includes full tables, constraints, foreign keys, triggers, RPCs, 
-- and Row Level Security (RLS) policies.
-- ==========================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ----------------------------------------------------------
-- 1. Profiles Table
-- ----------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text default 'Hey there! I am using ChatPaddy.',
  phone text,
  status_text text default 'Available',
  is_online boolean default false,
  last_seen_at timestamptz default timezone('utc'::text, now()),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  constraint username_length check (char_length(username) >= 3 and char_length(username) <= 30),
  constraint username_format check (username ~* '^[a-zA-Z0-9_.]+$')
);

create index if not exists idx_profiles_username on public.profiles (username);
create index if not exists idx_profiles_is_online on public.profiles (is_online);

-- ----------------------------------------------------------
-- 2. Conversations Table
-- ----------------------------------------------------------
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('direct', 'group')),
  last_message_at timestamptz default timezone('utc'::text, now()),
  last_message_preview text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_conversations_last_message_at on public.conversations (last_message_at desc);

-- ----------------------------------------------------------
-- 3. Conversation Participants Table
-- ----------------------------------------------------------
create table if not exists public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member' check (role in ('member', 'admin', 'owner')),
  last_read_at timestamptz default timezone('utc'::text, now()),
  is_pinned boolean default false not null,
  is_archived boolean default false not null,
  is_muted boolean default false not null,
  joined_at timestamptz default timezone('utc'::text, now()) not null,
  primary key (conversation_id, user_id)
);

create index if not exists idx_participants_user_id on public.conversation_participants (user_id);
create index if not exists idx_participants_conv_id on public.conversation_participants (conversation_id);

-- ----------------------------------------------------------
-- 4. Groups Metadata Table
-- ----------------------------------------------------------
create table if not exists public.groups_metadata (
  conversation_id uuid references public.conversations(id) on delete cascade primary key,
  name text not null,
  description text,
  avatar_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  constraint group_name_length check (char_length(name) >= 1 and char_length(name) <= 100)
);

-- ----------------------------------------------------------
-- 5. Messages Table (with full-text search tsvector)
-- ----------------------------------------------------------
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete set null not null,
  content text not null default '',
  type text not null default 'text' check (type in ('text', 'image', 'file', 'voice', 'system')),
  reply_to_id uuid references public.messages(id) on delete set null,
  forwarded_from uuid references auth.users(id) on delete set null,
  edited_at timestamptz,
  deleted_at timestamptz,
  deleted_for_everyone boolean default false,
  fts tsvector,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  constraint content_length check (char_length(content) <= 10000)
);

create index if not exists idx_messages_conv_created on public.messages (conversation_id, created_at desc);
create index if not exists idx_messages_fts on public.messages using gin (fts);

-- ----------------------------------------------------------
-- 6. Message Receipts Table (Sent, Delivered, Read)
-- ----------------------------------------------------------
create table if not exists public.message_receipts (
  message_id uuid references public.messages(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  delivered_at timestamptz default timezone('utc'::text, now()),
  read_at timestamptz,
  primary key (message_id, user_id)
);

create index if not exists idx_receipts_user_read on public.message_receipts (user_id, read_at);

-- ----------------------------------------------------------
-- 7. Attachments Table
-- ----------------------------------------------------------
create table if not exists public.attachments (
  id uuid default gen_random_uuid() primary key,
  message_id uuid references public.messages(id) on delete cascade not null,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size bigint not null check (size <= 10485760), -- 10MB limit
  duration int default null, -- in seconds for voice notes
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ----------------------------------------------------------
-- 8. Message Reactions Table
-- ----------------------------------------------------------
create table if not exists public.message_reactions (
  id uuid default gen_random_uuid() primary key,
  message_id uuid references public.messages(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  emoji text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (message_id, user_id, emoji)
);

-- ----------------------------------------------------------
-- 9. Blocked Users Table
-- ----------------------------------------------------------
create table if not exists public.blocked_users (
  blocker_id uuid references auth.users(id) on delete cascade not null,
  blocked_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  primary key (blocker_id, blocked_id),
  constraint cant_block_self check (blocker_id <> blocked_id)
);

-- ----------------------------------------------------------
-- 10. Reports Table
-- ----------------------------------------------------------
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references auth.users(id) on delete set null not null,
  reported_user_id uuid references auth.users(id) on delete cascade,
  reported_message_id uuid references public.messages(id) on delete set null,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ----------------------------------------------------------
-- 11. Notifications Table
-- ----------------------------------------------------------
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  body text not null,
  conversation_id uuid references public.conversations(id) on delete cascade,
  is_read boolean default false not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_notifications_user_read on public.notifications (user_id, is_read);

-- ----------------------------------------------------------
-- 12. Call Logs Table
-- ----------------------------------------------------------
create table if not exists public.call_logs (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  caller_id uuid references auth.users(id) on delete set null not null,
  call_type text not null check (call_type in ('voice', 'video')),
  status text not null check (status in ('completed', 'missed', 'declined', 'cancelled')),
  duration_seconds int default 0,
  started_at timestamptz default timezone('utc'::text, now()) not null,
  ended_at timestamptz
);

-- ----------------------------------------------------------
-- 13. User Settings Table
-- ----------------------------------------------------------
create table if not exists public.user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  sound_enabled boolean default true not null,
  read_receipts_enabled boolean default true not null,
  last_seen_privacy text default 'everyone' check (last_seen_privacy in ('everyone', 'contacts', 'nobody')),
  avatar_privacy text default 'everyone' check (avatar_privacy in ('everyone', 'contacts', 'nobody')),
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- ----------------------------------------------------------
-- 14. Admin Roles Table
-- ----------------------------------------------------------
create table if not exists public.admin_roles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('super_admin', 'moderator')),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ==========================================================
-- SECURITY DEFINER HELPER FUNCTIONS (Prevent Recursive Policies)
-- ==========================================================

-- Check if current authenticated user is a participant of a conversation
create or replace function public.is_participant(conv_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = conv_id
      and user_id = auth.uid()
  );
$$;

-- Check if current user is an admin or owner of a group conversation
create or replace function public.is_group_admin(conv_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = conv_id
      and user_id = auth.uid()
      and role in ('admin', 'owner')
  );
$$;

-- Check if current user has platform administrator privileges
create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_roles
    where user_id = auth.uid()
  );
$$;

-- Check if two users have blocked each other
create or replace function public.is_blocked_between(u1 uuid, u2 uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.blocked_users
    where (blocker_id = u1 and blocked_id = u2)
       or (blocker_id = u2 and blocked_id = u1)
  );
$$;

-- ==========================================================
-- TRIGGERS & RPC FUNCTIONS
-- ==========================================================

-- Auto-generate full-text search tsvector on message content
create or replace function public.handle_message_fts()
returns trigger
language plpgsql
as $$
begin
  new.fts := to_tsvector('english', coalesce(new.content, ''));
  return new;
end;
$$;

create or replace trigger trigger_message_fts
before insert or update of content on public.messages
for each row execute function public.handle_message_fts();

-- Auto-create profile & settings when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_username text;
begin
  default_username := split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4);
  
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    default_username,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Update conversation last_message_at and last_message_preview on new message
create or replace function public.handle_new_message()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.conversations
  set last_message_at = new.created_at,
      last_message_preview = case 
        when new.type = 'image' then '📷 Photo'
        when new.type = 'voice' then '🎤 Voice message'
        when new.type = 'file' then '📎 File'
        else left(new.content, 60)
      end,
      updated_at = timezone('utc'::text, now())
  where id = new.conversation_id;

  -- Create delivery receipts for all other participants in the conversation
  insert into public.message_receipts (message_id, user_id, delivered_at)
  select new.id, cp.user_id, timezone('utc'::text, now())
  from public.conversation_participants cp
  where cp.conversation_id = new.conversation_id
    and cp.user_id <> new.sender_id;

  return new;
end;
$$;

create or replace trigger on_message_created
after insert on public.messages
for each row execute function public.handle_new_message();

-- RPC: Get or create 1:1 direct conversation between current user and target user
create or replace function public.get_or_create_direct_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_conv_id uuid;
  new_conv_id uuid;
  curr_user_id uuid := auth.uid();
begin
  if curr_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if curr_user_id = other_user_id then
    raise exception 'Cannot create direct conversation with yourself';
  end if;

  -- Look for existing 1:1 conversation containing exactly both users
  select c.id into existing_conv_id
  from public.conversations c
  join public.conversation_participants p1 on p1.conversation_id = c.id and p1.user_id = curr_user_id
  join public.conversation_participants p2 on p2.conversation_id = c.id and p2.user_id = other_user_id
  where c.type = 'direct'
  limit 1;

  if existing_conv_id is not null then
    return existing_conv_id;
  end if;

  -- Otherwise create new direct conversation
  insert into public.conversations (type)
  values ('direct')
  returning id into new_conv_id;

  insert into public.conversation_participants (conversation_id, user_id, role)
  values 
    (new_conv_id, curr_user_id, 'member'),
    (new_conv_id, other_user_id, 'member');

  return new_conv_id;
end;
$$;

-- RPC: Fetch unread counts across all conversations for current user
create or replace function public.get_unread_counts()
returns table (
  conversation_id uuid,
  unread_count bigint
)
language sql
security definer
stable
as $$
  select 
    m.conversation_id,
    count(m.id) as unread_count
  from public.messages m
  join public.conversation_participants cp 
    on cp.conversation_id = m.conversation_id 
   and cp.user_id = auth.uid()
  where m.created_at > cp.last_read_at
    and m.sender_id <> auth.uid()
    and m.deleted_at is null
  group by m.conversation_id;
$$;

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

-- 1. Profiles RLS
alter table public.profiles enable row level security;

drop policy if exists "Anyone can view profiles" on public.profiles;
create policy "Anyone can view profiles"
  on public.profiles for select
  to public
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- 2. Conversations RLS
alter table public.conversations enable row level security;

drop policy if exists "Users can view conversations they belong to" on public.conversations;
create policy "Users can view conversations they belong to"
  on public.conversations for select
  to authenticated
  using (public.is_participant(id));

drop policy if exists "Authenticated users can insert conversations" on public.conversations;
create policy "Authenticated users can insert conversations"
  on public.conversations for insert
  to authenticated
  with check (true);

drop policy if exists "Participants can update conversation timestamp" on public.conversations;
create policy "Participants can update conversation timestamp"
  on public.conversations for update
  to authenticated
  using (public.is_participant(id));

-- 3. Conversation Participants RLS
alter table public.conversation_participants enable row level security;

drop policy if exists "Participants can view conversation participant list" on public.conversation_participants;
create policy "Participants can view conversation participant list"
  on public.conversation_participants for select
  to authenticated
  using (public.is_participant(conversation_id));

drop policy if exists "Users or admins can add participants" on public.conversation_participants;
create policy "Users or admins can add participants"
  on public.conversation_participants for insert
  to authenticated
  with check (
    user_id = auth.uid() or public.is_group_admin(conversation_id)
  );

drop policy if exists "Users can update their own participant settings or admins can update" on public.conversation_participants;
create policy "Users can update their own participant settings or admins can update"
  on public.conversation_participants for update
  to authenticated
  using (
    user_id = auth.uid() or public.is_group_admin(conversation_id)
  );

drop policy if exists "Users can leave or admins can remove members" on public.conversation_participants;
create policy "Users can leave or admins can remove members"
  on public.conversation_participants for delete
  to authenticated
  using (
    user_id = auth.uid() or public.is_group_admin(conversation_id)
  );

-- 4. Groups Metadata RLS
alter table public.groups_metadata enable row level security;

drop policy if exists "Participants can view group metadata" on public.groups_metadata;
create policy "Participants can view group metadata"
  on public.groups_metadata for select
  to authenticated
  using (public.is_participant(conversation_id));

drop policy if exists "Group creators can create group metadata" on public.groups_metadata;
create policy "Group creators can create group metadata"
  on public.groups_metadata for insert
  to authenticated
  with check (created_by = auth.uid());

drop policy if exists "Only group admins can update group metadata" on public.groups_metadata;
create policy "Only group admins can update group metadata"
  on public.groups_metadata for update
  to authenticated
  using (public.is_group_admin(conversation_id));

-- 5. Messages RLS
alter table public.messages enable row level security;

drop policy if exists "Users can view messages in conversations they belong to" on public.messages;
create policy "Users can view messages in conversations they belong to"
  on public.messages for select
  to authenticated
  using (public.is_participant(conversation_id));

drop policy if exists "Users can insert messages into conversations they belong to" on public.messages;
create policy "Users can insert messages into conversations they belong to"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid() 
    and public.is_participant(conversation_id)
  );

drop policy if exists "Users can update their own messages (edit or soft delete)" on public.messages;
create policy "Users can update their own messages (edit or soft delete)"
  on public.messages for update
  to authenticated
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

-- 6. Message Receipts RLS
alter table public.message_receipts enable row level security;

drop policy if exists "Participants can view message receipts" on public.message_receipts;
create policy "Participants can view message receipts"
  on public.message_receipts for select
  to authenticated
  using (
    exists (
      select 1 from public.messages m
      where m.id = message_id and public.is_participant(m.conversation_id)
    )
  );

drop policy if exists "Users can insert or update their own receipts" on public.message_receipts;
create policy "Users can insert or update their own receipts"
  on public.message_receipts for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 7. Attachments RLS
alter table public.attachments enable row level security;

drop policy if exists "Participants can view attachments" on public.attachments;
create policy "Participants can view attachments"
  on public.attachments for select
  to authenticated
  using (
    exists (
      select 1 from public.messages m
      where m.id = message_id and public.is_participant(m.conversation_id)
    )
  );

drop policy if exists "Users can insert attachments for their messages" on public.attachments;
create policy "Users can insert attachments for their messages"
  on public.attachments for insert
  to authenticated
  with check (
    exists (
      select 1 from public.messages m
      where m.id = message_id and m.sender_id = auth.uid()
    )
  );

-- 8. Message Reactions RLS
alter table public.message_reactions enable row level security;

drop policy if exists "Participants can view reactions" on public.message_reactions;
create policy "Participants can view reactions"
  on public.message_reactions for select
  to authenticated
  using (
    exists (
      select 1 from public.messages m
      where m.id = message_id and public.is_participant(m.conversation_id)
    )
  );

drop policy if exists "Users can manage their own reactions" on public.message_reactions;
create policy "Users can manage their own reactions"
  on public.message_reactions for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 9. Blocked Users RLS
alter table public.blocked_users enable row level security;

drop policy if exists "Users can view and manage their own blocks" on public.blocked_users;
create policy "Users can view and manage their own blocks"
  on public.blocked_users for all
  to authenticated
  using (blocker_id = auth.uid())
  with check (blocker_id = auth.uid());

-- 10. Reports RLS
alter table public.reports enable row level security;

drop policy if exists "Users can submit reports" on public.reports;
create policy "Users can submit reports"
  on public.reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

drop policy if exists "Platform admins can view and manage reports" on public.reports;
create policy "Platform admins can view and manage reports"
  on public.reports for all
  to authenticated
  using (public.is_platform_admin());

-- 11. Notifications RLS
alter table public.notifications enable row level security;

drop policy if exists "Users can view and update their own notifications" on public.notifications;
create policy "Users can view and update their own notifications"
  on public.notifications for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 12. Call Logs RLS
alter table public.call_logs enable row level security;

drop policy if exists "Participants can view call logs" on public.call_logs;
create policy "Participants can view call logs"
  on public.call_logs for select
  to authenticated
  using (public.is_participant(conversation_id));

drop policy if exists "Callers can insert call logs" on public.call_logs;
create policy "Callers can insert call logs"
  on public.call_logs for insert
  to authenticated
  with check (caller_id = auth.uid());

-- 13. User Settings RLS
alter table public.user_settings enable row level security;

drop policy if exists "Users can view and update their own settings" on public.user_settings;
create policy "Users can view and update their own settings"
  on public.user_settings for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 14. Admin Roles RLS
alter table public.admin_roles enable row level security;

drop policy if exists "Platform admins can view admin roles" on public.admin_roles;
create policy "Platform admins can view admin roles"
  on public.admin_roles for select
  to authenticated
  using (public.is_platform_admin());

-- ==========================================================
-- STORAGE BUCKET POLICIES (Avatars, Attachments, Voice)
-- ==========================================================
-- Note: Create buckets in Supabase dashboard: 'avatars', 'attachments', 'voice'
-- 
-- Storage RLS examples:
-- avatars: public read, insert/update where (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1])
-- attachments: private read where participant, insert where participant
-- voice: private read where participant, insert where participant

-- ==========================================================
-- ENABLE REALTIME PUBLICATION & REPLICA IDENTITY (IDEMPOTENT)
-- ==========================================================
do $$
begin
  -- Add relevant tables to supabase_realtime publication only if not already present
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'message_receipts'
  ) then
    alter publication supabase_realtime add table public.message_receipts;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'message_reactions'
  ) then
    alter publication supabase_realtime add table public.message_reactions;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'conversation_participants'
  ) then
    alter publication supabase_realtime add table public.conversation_participants;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
end $$;

-- Ensure UPDATE/DELETE payloads have full old record for realtime
alter table public.messages replica identity full;
alter table public.message_receipts replica identity full;
alter table public.conversations replica identity full;
alter table public.conversation_participants replica identity full;

-- ==========================================================
-- REALTIME RPC FUNCTIONS
-- ==========================================================

-- 1. Mark conversation as read (updates participant last_read_at and upserts message_receipts)
create or replace function public.mark_conversation_as_read(conv_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  curr_user_id uuid := auth.uid();
begin
  if curr_user_id is null then
    return;
  end if;

  update public.conversation_participants
  set last_read_at = now()
  where conversation_id = conv_id and user_id = curr_user_id;

  insert into public.message_receipts (message_id, user_id, delivered_at, read_at)
  select m.id, curr_user_id, coalesce(m.created_at, now()), now()
  from public.messages m
  where m.conversation_id = conv_id
    and m.sender_id <> curr_user_id
    and m.deleted_at is null
  on conflict (message_id, user_id)
  do update set read_at = now();
end;
$$;

-- 2. Fetch user conversations with metadata, participants, and unread counts
create or replace function public.get_user_conversations(p_user_id uuid default null)
returns json
language plpgsql
security definer
as $$
declare
  curr_user_id uuid := coalesce(auth.uid(), p_user_id);
  result json;
begin
  if curr_user_id is null then
    return '[]'::json;
  end if;

  select coalesce(json_agg(row_to_json(t)), '[]'::json) into result
  from (
    select 
      c.id,
      c.type,
      c.last_message_at,
      c.last_message_preview,
      c.created_at,
      coalesce(my_cp.is_pinned, false) as is_pinned,
      coalesce(my_cp.is_archived, false) as is_archived,
      coalesce(my_cp.is_muted, false) as is_muted,
      coalesce((
        select count(m.id)
        from public.messages m
        where m.conversation_id = c.id
          and m.created_at > coalesce(my_cp.last_read_at, '1970-01-01'::timestamptz)
          and m.sender_id <> curr_user_id
          and m.deleted_at is null
      ), 0) as unread_count,
      case 
        when c.type = 'group' then coalesce(gm.name, 'Group Chat')
        else coalesce(other_p.display_name, other_p.username, 'Chat')
      end as name,
      case
        when c.type = 'group' then gm.avatar_url
        else other_p.avatar_url
      end as avatar_url,
      case
        when c.type = 'group' then gm.description
        else other_p.bio
      end as description,
      case
        when c.type = 'direct' and other_p.id is not null then
          json_build_object(
            'id', other_p.id,
            'username', other_p.username,
            'display_name', other_p.display_name,
            'avatar_url', other_p.avatar_url,
            'bio', other_p.bio,
            'status_text', other_p.status_text,
            'is_online', other_p.is_online,
            'last_seen_at', other_p.last_seen_at
          )
        else null
      end as other_user,
      coalesce((
        select json_agg(json_build_object(
          'conversation_id', cp.conversation_id,
          'user_id', cp.user_id,
          'role', cp.role,
          'last_read_at', cp.last_read_at,
          'is_pinned', cp.is_pinned,
          'is_archived', cp.is_archived,
          'is_muted', cp.is_muted,
          'joined_at', cp.joined_at,
          'profile', json_build_object(
            'id', p.id,
            'username', p.username,
            'display_name', p.display_name,
            'avatar_url', p.avatar_url,
            'bio', p.bio,
            'status_text', p.status_text,
            'is_online', p.is_online,
            'last_seen_at', p.last_seen_at
          )
        ))
        from public.conversation_participants cp
        left join public.profiles p on p.id = cp.user_id
        where cp.conversation_id = c.id
      ), '[]'::json) as participants,
      (
        select m.sender_id = curr_user_id
        from public.messages m
        where m.conversation_id = c.id
        order by m.created_at desc
        limit 1
      ) as last_message_is_mine,
      (
        select case 
          when exists (
            select 1 from public.message_receipts mr 
            where mr.message_id = m.id and mr.read_at is not null and mr.user_id <> curr_user_id
          ) then 'read'
          when exists (
            select 1 from public.message_receipts mr 
            where mr.message_id = m.id and mr.delivered_at is not null and mr.user_id <> curr_user_id
          ) then 'delivered'
          else 'sent'
        end
        from public.messages m
        where m.conversation_id = c.id and m.sender_id = curr_user_id
        order by m.created_at desc
        limit 1
      ) as last_message_status
    from public.conversations c
    join public.conversation_participants my_cp 
      on my_cp.conversation_id = c.id and my_cp.user_id = curr_user_id
    left join public.groups_metadata gm 
      on gm.conversation_id = c.id
    left join public.conversation_participants other_cp 
      on other_cp.conversation_id = c.id and other_cp.user_id <> curr_user_id and c.type = 'direct'
    left join public.profiles other_p 
      on other_p.id = other_cp.user_id
    order by coalesce(c.last_message_at, c.created_at) desc
  ) t;

  return result;
end;
$$;

-- 3. Fetch conversation messages with sender, reactions, receipts, and attachments
create or replace function public.get_conversation_messages(
  p_conversation_id uuid,
  p_limit int default 30,
  p_before timestamptz default null
)
returns json
language plpgsql
security definer
as $$
declare
  curr_user_id uuid := auth.uid();
  result json;
begin
  select coalesce(json_agg(row_to_json(msg_row)), '[]'::json) into result
  from (
    select *
    from (
      select 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.type,
        m.reply_to_id,
        m.forwarded_from,
        m.edited_at,
        m.deleted_at,
        m.deleted_for_everyone,
        m.created_at,
        json_build_object(
          'id', p.id,
          'username', p.username,
          'display_name', p.display_name,
          'avatar_url', p.avatar_url
        ) as sender,
        case when rm.id is not null then
          json_build_object(
            'id', rm.id,
            'content', rm.content,
            'type', rm.type,
            'sender_id', rm.sender_id,
            'sender', json_build_object(
              'display_name', rp.display_name
            )
          )
        else null end as reply_to,
        coalesce((
          select json_agg(json_build_object(
            'id', a.id,
            'file_name', a.file_name,
            'file_type', a.mime_type,
            'size', a.size,
            'storage_path', a.storage_path
          ))
          from public.attachments a
          where a.message_id = m.id
        ), '[]'::json) as attachments,
        coalesce((
          select json_object_agg(
            sub.emoji,
            json_build_object(
              'count', sub.cnt,
              'userReacted', sub.user_reacted
            )
          )
          from (
            select 
              mr.emoji,
              count(*) as cnt,
              bool_or(mr.user_id = curr_user_id) as user_reacted
            from public.message_reactions mr
            where mr.message_id = m.id
            group by mr.emoji
          ) sub
        ), '{}'::json) as reactions,
        case
          when curr_user_id is not null and m.sender_id = curr_user_id then
            case 
              when exists (
                select 1 from public.message_receipts rec 
                where rec.message_id = m.id and rec.read_at is not null and rec.user_id <> curr_user_id
              ) then 'read'
              when exists (
                select 1 from public.message_receipts rec 
                where rec.message_id = m.id and rec.delivered_at is not null and rec.user_id <> curr_user_id
              ) then 'delivered'
              else 'sent'
            end
          else 'read'
        end as receipt_status
      from public.messages m
      left join public.profiles p on p.id = m.sender_id
      left join public.messages rm on rm.id = m.reply_to_id
      left join public.profiles rp on rp.id = rm.sender_id
      where m.conversation_id = p_conversation_id
        and (p_before is null or m.created_at < p_before)
      order by m.created_at desc
      limit p_limit
    ) inner_msgs
    order by inner_msgs.created_at asc
  ) msg_row;

  return result;
end;
$$;

-- ==========================================================
-- 15. ADMIN DASHBOARD & SITE CONFIGURATION MODULES
-- ==========================================================

-- 15.1 Site Feature Manager
create table if not exists public.site_features (
  id text primary key,
  name text not null,
  description text,
  category text not null default 'general',
  is_enabled boolean not null default true,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 15.2 Global Site Settings (Key-Value JSON store)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 15.3 Site CMS Pages
create table if not exists public.site_pages (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  content text not null default '',
  meta_title text,
  meta_description text,
  is_published boolean not null default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 15.4 Custom Scripts & Monetization (AdSense)
create table if not exists public.site_custom_scripts (
  id uuid default gen_random_uuid() primary key,
  header_scripts text default '',
  body_scripts text default '',
  footer_scripts text default '',
  adsense_enabled boolean default false not null,
  adsense_client_id text default '',
  adsense_slots jsonb default '{}'::jsonb,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 15.5 Brute Force Security & Bad Login Limits
create table if not exists public.brute_force_config (
  id int primary key default 1,
  bad_login_limit int not null default 5,
  lockout_duration_minutes int not null default 30,
  whitelist_ips text[] default array[]::text[],
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.login_attempts (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  ip_address text not null,
  user_agent text,
  status text not null check (status in ('success', 'failed', 'blocked')),
  attempted_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_login_attempts_email_time on public.login_attempts (email, attempted_at desc);
create index if not exists idx_login_attempts_ip_time on public.login_attempts (ip_address, attempted_at desc);

-- 15.6 Language Management & Translations
create table if not exists public.languages (
  code text primary key,
  name text not null,
  native_name text not null,
  is_default boolean default false not null,
  is_active boolean default true not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.language_translations (
  id uuid default gen_random_uuid() primary key,
  lang_code text references public.languages(code) on delete cascade not null,
  key text not null,
  value text not null default '',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (lang_code, key)
);

create index if not exists idx_translations_lang on public.language_translations (lang_code);

-- 15.7 Menu & Navigation Manager
create table if not exists public.menu_items (
  id uuid default gen_random_uuid() primary key,
  menu_type text not null check (menu_type in ('header', 'footer')),
  label text not null,
  path text not null,
  sort_order int not null default 0,
  is_external boolean not null default false,
  is_visible boolean not null default true,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 15.8 Registration Form Builder Fields
create table if not exists public.form_builder_fields (
  id uuid default gen_random_uuid() primary key,
  field_type text not null,
  label text not null,
  placeholder text default '',
  is_required boolean not null default false,
  sort_order int not null default 0,
  options jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 15.9 Announcements & Broadcast Banners
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  type text not null default 'info' check (type in ('info', 'warning', 'success', 'critical')),
  is_active boolean not null default true,
  starts_at timestamptz default timezone('utc'::text, now()),
  expires_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 15.10 Mass Notifications
create table if not exists public.mass_notifications (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  target_audience text not null default 'all_users',
  channels jsonb not null default '["in_app"]'::jsonb,
  status text not null default 'sent' check (status in ('draft', 'scheduled', 'sent', 'failed')),
  sent_at timestamptz default timezone('utc'::text, now()),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 15.11 SMTP Email Settings
create table if not exists public.smtp_configs (
  id uuid default gen_random_uuid() primary key,
  host text not null,
  port int not null default 587,
  username text not null,
  password_encrypted text not null,
  sender_email text not null,
  sender_name text not null default 'ChatPaddy Support',
  encryption text not null default 'tls' check (encryption in ('tls', 'ssl', 'none')),
  is_active boolean not null default false,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 15.12 Role & Permission Management
create table if not exists public.custom_roles (
  id text primary key,
  name text not null,
  description text,
  color text default '#4F46E5',
  permissions text[] not null default array[]::text[],
  is_system boolean not null default false,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 15.13 Referral Management System
create table if not exists public.referral_settings (
  id int primary key default 1,
  commission_type text not null default 'percentage' check (commission_type in ('flat', 'percentage')),
  commission_value numeric(10,2) not null default 15.00,
  cookie_duration_days int not null default 30,
  min_payout numeric(10,2) not null default 50.00,
  is_active boolean not null default true,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_id uuid references auth.users(id) on delete cascade not null,
  referred_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'paid', 'cancelled')),
  commission_amount numeric(10,2) not null default 0.00,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ==========================================================
-- ROW LEVEL SECURITY FOR ADMIN TABLES
-- ==========================================================
alter table public.site_features enable row level security;
create policy "Anyone can view site features" on public.site_features for select using (true);
create policy "Admins can manage site features" on public.site_features for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.site_settings enable row level security;
create policy "Anyone can view public settings" on public.site_settings for select using (true);
create policy "Admins can manage settings" on public.site_settings for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.site_pages enable row level security;
create policy "Anyone can view published pages" on public.site_pages for select using (is_published or public.is_platform_admin());
create policy "Admins can manage pages" on public.site_pages for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.site_custom_scripts enable row level security;
create policy "Anyone can view scripts" on public.site_custom_scripts for select using (true);
create policy "Admins can manage scripts" on public.site_custom_scripts for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.brute_force_config enable row level security;
create policy "Admins can view brute force config" on public.brute_force_config for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.login_attempts enable row level security;
create policy "Admins can view login attempts" on public.login_attempts for select to authenticated using (public.is_platform_admin());
create policy "System can log attempts" on public.login_attempts for insert to public with check (true);

alter table public.languages enable row level security;
create policy "Anyone can view active languages" on public.languages for select using (true);
create policy "Admins can manage languages" on public.languages for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.language_translations enable row level security;
create policy "Anyone can view translations" on public.language_translations for select using (true);
create policy "Admins can manage translations" on public.language_translations for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.menu_items enable row level security;
create policy "Anyone can view visible menu items" on public.menu_items for select using (is_visible or public.is_platform_admin());
create policy "Admins can manage menu items" on public.menu_items for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.form_builder_fields enable row level security;
create policy "Anyone can view form fields" on public.form_builder_fields for select using (true);
create policy "Admins can manage form fields" on public.form_builder_fields for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.announcements enable row level security;
create policy "Anyone can view active announcements" on public.announcements for select using (is_active or public.is_platform_admin());
create policy "Admins can manage announcements" on public.announcements for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.mass_notifications enable row level security;
create policy "Admins can manage mass notifications" on public.mass_notifications for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.smtp_configs enable row level security;
create policy "Admins can view and manage smtp configs" on public.smtp_configs for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.custom_roles enable row level security;
create policy "Anyone can view custom roles" on public.custom_roles for select using (true);
create policy "Admins can manage custom roles" on public.custom_roles for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.referral_settings enable row level security;
create policy "Anyone can view referral settings" on public.referral_settings for select using (true);
create policy "Admins can manage referral settings" on public.referral_settings for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.referrals enable row level security;
create policy "Users can view own referrals" on public.referrals for select to authenticated using (referrer_id = auth.uid() or public.is_platform_admin());
create policy "Admins can manage all referrals" on public.referrals for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

-- ==========================================================
-- DEFAULT SEED DATA
-- ==========================================================

-- Seed Features
insert into public.site_features (id, name, description, category, is_enabled)
values 
  ('ai_assistant', 'Paddy AI Assistant', 'Gemini AI summarization, search, and replies', 'AI', true),
  ('voice_notes', 'Voice Notes & Player', 'Native audio recording with live waveform visualizer', 'Messaging', true),
  ('video_calls', 'HD Video & Audio Calls', 'WebRTC peer audio and video communications', 'Calling', true),
  ('file_attachments', 'Document & Media Sharing', 'Upload and share files up to 10MB', 'Messaging', true),
  ('read_receipts', 'Read Receipts (Checkmarks)', 'Sent, delivered, and read tracking', 'Messaging', true),
  ('screen_sharing', 'Screen Sharing', 'Real-time desktop streaming during calls', 'Calling', true),
  ('referral_system', 'Referral Program', 'Reward members for inviting new users', 'Monetization', true)
on conflict (id) do nothing;

-- Seed Global Site Settings
insert into public.site_settings (key, value)
values
  ('global', '{"currency": "USD", "currency_symbol": "$", "timezone": "UTC", "primary_color": "#4F46E5", "accent_color": "#F59E0B", "site_name": "ChatPaddy", "logo_url": "", "favicon_url": ""}'::jsonb),
  ('seo', '{"meta_title": "ChatPaddy - Chat like friends. Build like pros.", "meta_description": "Modern real-time messaging platform with direct chats, groups, voice notes, rich media, and AI intelligence.", "meta_keywords": "chat, messaging, realtime, supabase, react, collaboration", "og_image": ""}'::jsonb),
  ('pwa', '{"name": "ChatPaddy", "short_name": "ChatPaddy", "theme_color": "#4F46E5", "background_color": "#0B1020", "display": "standalone"}'::jsonb)
on conflict (key) do nothing;

-- Seed Default Roles
insert into public.custom_roles (id, name, description, color, permissions, is_system)
values
  ('super_admin', 'Super Admin', 'Full unrestricted control of platform and infrastructure', '#EF4444', array['all'], true),
  ('moderator', 'Moderator', 'Review reports, manage violations, and silence abusive users', '#F59E0B', array['moderation:view', 'moderation:ban', 'chat:delete'], true),
  ('support', 'Support Specialist', 'Assist users, view non-confidential logs, and credit balances', '#3B82F6', array['users:view', 'users:credit'], false),
  ('member', 'Standard Member', 'Default permissions for regular verified members', '#10B981', array['chat:send', 'call:start'], true)
on conflict (id) do nothing;

-- Seed Default Languages
insert into public.languages (code, name, native_name, is_default, is_active)
values
  ('en', 'English', 'English', true, true),
  ('es', 'Spanish', 'Español', false, true),
  ('fr', 'French', 'Français', false, true),
  ('de', 'German', 'Deutsch', false, true),
  ('ar', 'Arabic', 'العربية', false, true)
on conflict (code) do nothing;

-- Seed Initial Brute Force Configuration
insert into public.brute_force_config (id, bad_login_limit, lockout_duration_minutes, whitelist_ips)
values (1, 5, 30, array['127.0.0.1']::text[])
on conflict (id) do nothing;

-- Seed Referral Settings
insert into public.referral_settings (id, commission_type, commission_value, cookie_duration_days, min_payout, is_active)
values (1, 'percentage', 15.00, 30, 50.00, true)
on conflict (id) do nothing;

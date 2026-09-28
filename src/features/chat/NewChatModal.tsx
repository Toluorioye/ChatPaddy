import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Plus, Sparkles } from 'lucide-react';
import { Modal } from '../../shared/ui/Modal';
import { Avatar } from '../../shared/ui/Avatar';
import { useChatStore } from './chatStore';
import { useAuthStore } from '../auth/authStore';
import { MOCK_USERS } from '../../lib/mockData';
import { Profile } from '../../types/chat.types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [allUsers, setAllUsers] = useState<Profile[]>(MOCK_USERS);
  const { createDirectChat } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (isOpen && isSupabaseConfigured) {
      supabase
        .from('profiles')
        .select('*')
        .then(({ data }) => {
          if (data && data.length > 0) {
            // Merge Supabase profiles with mock users avoiding duplicates
            const map = new Map<string, Profile>();
            MOCK_USERS.forEach((u) => map.set(u.id, u));
            data.forEach((p: Profile) => map.set(p.id, p));
            setAllUsers(Array.from(map.values()));
          }
        });
    }
  }, [isOpen]);

  const otherUsers = allUsers.filter((u) => u.id !== user?.id);
  const filteredUsers = otherUsers.filter(
    (u) =>
      u.display_name.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      (u.bio && u.bio.toLowerCase().includes(query.toLowerCase()))
  );

  const handleStartChat = async (targetUser: Profile) => {
    await createDirectChat(targetUser);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start a Conversation" size="sm">
      <div className="flex flex-col gap-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, username, or role..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-slate-100 dark:bg-[#131A2E] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl pl-9 pr-3.5 py-2.5 border border-transparent focus:border-[#4F46E5] outline-none"
          />
        </div>

        {/* Contacts list */}
        <div className="max-h-72 overflow-y-auto space-y-1 mt-1">
          {filteredUsers.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No matching users found</p>
          ) : (
            filteredUsers.map((targetUser) => (
              <button
                key={targetUser.id}
                type="button"
                onClick={() => handleStartChat(targetUser)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    src={targetUser.avatar_url}
                    name={targetUser.display_name}
                    size="md"
                    isOnline={targetUser.is_online}
                    showOnlineStatus
                  />
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                      <span>{targetUser.display_name}</span>
                      {targetUser.id === 'usr_paddy_ai' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> AI
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      @{targetUser.username} · {targetUser.status_text}
                    </div>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-500 group-hover:bg-[#4F46E5] group-hover:text-white flex items-center justify-center transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

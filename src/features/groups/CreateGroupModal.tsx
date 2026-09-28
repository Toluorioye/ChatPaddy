import React, { useState } from 'react';
import { Users, Check, Camera, Search } from 'lucide-react';
import { Modal } from '../../shared/ui/Modal';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { Avatar } from '../../shared/ui/Avatar';
import { useChatStore } from '../chat/chatStore';
import { useAuthStore } from '../auth/authStore';
import { useToast } from '../../shared/ui/Toast';
import { MOCK_USERS } from '../../lib/mockData';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [searchMember, setSearchMember] = useState('');

  const { createGroupChat } = useChatStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const availableMembers = MOCK_USERS.filter((u) => u.id !== user?.id);
  const filteredMembers = availableMembers.filter(
    (u) =>
      u.display_name.toLowerCase().includes(searchMember.toLowerCase()) ||
      u.username.toLowerCase().includes(searchMember.toLowerCase())
  );

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createGroupChat(
      name.trim(),
      description.trim(),
      selectedMemberIds,
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80'
    );

    toast({
      type: 'success',
      title: 'Group Created',
      message: `Group "${name}" has been created with ${selectedMemberIds.length + 1} members.`,
    });

    setName('');
    setDescription('');
    setSelectedMemberIds([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Group Chat" size="md">
      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        {/* Name and description */}
        <Input
          label="Group Name"
          placeholder="e.g. Frontend Engineering, Project Alpha..."
          leftIcon={<Users className="w-4 h-4" />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
            Description (optional)
          </label>
          <input
            type="text"
            placeholder="Topic or team focus..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white dark:bg-[#131A2E] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm py-2 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
          />
        </div>

        {/* Member multi-select */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Members ({selectedMemberIds.length} selected)
            </span>
          </div>

          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-xs rounded-xl pl-8 pr-3 py-1.5 outline-none"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 border border-slate-100 dark:border-slate-800 rounded-xl p-1.5">
            {filteredMembers.map((m) => {
              const isSelected = selectedMemberIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-300'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar src={m.avatar_url} name={m.display_name} size="sm" />
                    <div className="truncate">
                      <div className="font-semibold text-xs truncate">{m.display_name}</div>
                      <div className="text-[10px] text-slate-400 truncate">@{m.username}</div>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#4F46E5] border-[#4F46E5] text-white'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={!name.trim()}>
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
};

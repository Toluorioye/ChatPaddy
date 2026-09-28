import React, { useState } from 'react';
import { Share2, Search, Check } from 'lucide-react';
import { Modal } from '../../shared/ui/Modal';
import { Avatar } from '../../shared/ui/Avatar';
import { Button } from '../../shared/ui/Button';
import { useChatStore } from './chatStore';
import { useToast } from '../../shared/ui/Toast';
import { UIMessage } from '../../types/chat.types';

interface ForwardModalProps {
  message: UIMessage | null;
  onClose: () => void;
}

export const ForwardModal: React.FC<ForwardModalProps> = ({ message, onClose }) => {
  const { conversations, forwardMessage } = useChatStore();
  const { toast } = useToast();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  if (!message) return null;

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleForward = async () => {
    if (!selectedConvId) return;
    const target = conversations.find((c) => c.id === selectedConvId);
    await forwardMessage(message, selectedConvId);
    toast({
      type: 'success',
      title: 'Message Forwarded',
      message: `Forwarded to ${target?.name}`,
    });
    onClose();
  };

  return (
    <Modal isOpen={Boolean(message)} onClose={onClose} title="Forward Message" size="sm">
      <div className="flex flex-col gap-3">
        {/* Preview of message being forwarded */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 italic truncate">
          "{message.content || 'Attachment'}"
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search destination chat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-[#131A2E] text-xs rounded-xl pl-8 pr-3 py-2 outline-none"
          />
        </div>

        {/* List of conversations */}
        <div className="max-h-60 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No matching conversations</p>
          ) : (
            filtered.map((c) => {
            const isSelected = selectedConvId === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedConvId(c.id)}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5]'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar src={c.avatar_url} name={c.name} size="sm" />
                  <span className="font-semibold text-xs truncate">{c.name}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </div>
            );
          }))}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!selectedConvId}
            onClick={handleForward}
            leftIcon={<Share2 className="w-3.5 h-3.5" />}
          >
            Forward
          </Button>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Pin,
  Users,
  Shield,
  UserPlus,
  UserMinus,
  Ban,
  Flag,
  LogOut,
  FileText,
  Image as ImageIcon,
  Share2,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Avatar } from '../../shared/ui/Avatar';
import { IconButton } from '../../shared/ui/IconButton';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Modal } from '../../shared/ui/Modal';
import { useChatStore } from './chatStore';
import { useAuthStore } from '../auth/authStore';
import { useToast } from '../../shared/ui/Toast';
import { UIConversation, Profile } from '../../types/chat.types';
import { MOCK_USERS } from '../../lib/mockData';

interface RightInfoPanelProps {
  conversation: UIConversation;
  onClose: () => void;
  onOpenAddMember?: () => void;
}

export const RightInfoPanel: React.FC<RightInfoPanelProps> = ({
  conversation,
  onClose,
  onOpenAddMember,
}) => {
  const {
    toggleMuteConversation,
    togglePinConversation,
    leaveGroup,
    messages,
  } = useChatStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'details' | 'media' | 'files'>('details');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);

  const convMessages = messages[conversation.id] || [];
  const sharedImages = convMessages
    .flatMap((m) => m.attachments || [])
    .filter((a) => a.mime_type.startsWith('image/'));
  const sharedFiles = convMessages
    .flatMap((m) => m.attachments || [])
    .filter((a) => !a.mime_type.startsWith('image/'));

  const handleBlockUser = () => {
    setIsBlocked(!isBlocked);
    toast({
      type: isBlocked ? 'info' : 'error',
      title: isBlocked ? 'User Unblocked' : 'User Blocked',
      message: `${conversation.name} has been ${isBlocked ? 'unblocked' : 'blocked'}.`,
    });
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      type: 'success',
      title: 'Report Submitted',
      message: 'Our moderation team will review this report within 24 hours.',
    });
    setReportReason('');
    setReportModalOpen(false);
  };

  return (
    <div className="w-80 h-full bg-white dark:bg-[#0E1526] border-l border-slate-200 dark:border-slate-800/80 flex flex-col select-none overflow-y-auto z-20">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
          {conversation.type === 'group' ? 'Group Info' : 'Contact Info'}
        </h3>
        <IconButton
          aria-label="Close info panel"
          size="sm"
          variant="ghost"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </IconButton>
      </div>

      {/* Main Profile Info */}
      <div className="p-5 flex flex-col items-center text-center border-b border-slate-100 dark:border-slate-800">
        <Avatar
          src={conversation.avatar_url}
          name={conversation.name}
          size="xl"
          className="mb-3 shadow-md ring-4 ring-slate-100 dark:ring-slate-800"
        />
        <h4 className="text-base font-heading font-bold text-slate-900 dark:text-white">
          {conversation.name}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px]">
          {conversation.description || conversation.other_user?.bio || 'Hey there! I am using ChatPaddy.'}
        </p>

        {conversation.other_user?.phone && (
          <p className="text-xs text-slate-400 font-mono mt-1">
            {conversation.other_user.phone}
          </p>
        )}

        {/* Action quick toggles */}
        <div className="grid grid-cols-2 gap-2 w-full mt-4">
          <Button
            variant={conversation.is_muted ? 'soft' : 'outline'}
            size="sm"
            onClick={() => toggleMuteConversation(conversation.id)}
            leftIcon={conversation.is_muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          >
            {conversation.is_muted ? 'Muted' : 'Mute'}
          </Button>
          <Button
            variant={conversation.is_pinned ? 'soft' : 'outline'}
            size="sm"
            onClick={() => togglePinConversation(conversation.id)}
            leftIcon={<Pin className="w-3.5 h-3.5" />}
          >
            {conversation.is_pinned ? 'Pinned' : 'Pin'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors ${
            activeTab === 'details'
              ? 'border-[#4F46E5] text-[#4F46E5] dark:text-[#818CF8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors ${
            activeTab === 'media'
              ? 'border-[#4F46E5] text-[#4F46E5] dark:text-[#818CF8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Media ({sharedImages.length})
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors ${
            activeTab === 'files'
              ? 'border-[#4F46E5] text-[#4F46E5] dark:text-[#818CF8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Files ({sharedFiles.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 flex-1">
        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* Group Members List */}
            {conversation.type === 'group' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Members ({conversation.participants.length})
                  </span>
                  {onOpenAddMember && (
                    <button
                      onClick={onOpenAddMember}
                      className="text-xs font-semibold text-[#4F46E5] hover:underline flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" /> Add
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {conversation.participants.map((p) => (
                    <div
                      key={p.user_id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          src={p.profile?.avatar_url}
                          name={p.profile?.display_name || 'Member'}
                          size="sm"
                        />
                        <div className="truncate">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {p.profile?.display_name} {p.user_id === user?.id ? '(You)' : ''}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            @{p.profile?.username}
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant={p.role === 'owner' ? 'spark' : p.role === 'admin' ? 'primary' : 'neutral'}
                        size="sm"
                      >
                        {p.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy & Safety Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
              {conversation.type === 'direct' && (
                <button
                  onClick={handleBlockUser}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium transition-colors ${
                    isBlocked
                      ? 'text-emerald-600 hover:bg-emerald-50'
                      : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  }`}
                >
                  <Ban className="w-4 h-4" />
                  <span>{isBlocked ? 'Unblock Contact' : 'Block Contact'}</span>
                </button>
              )}

              <button
                onClick={() => setReportModalOpen(true)}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Flag className="w-4 h-4 text-amber-500" />
                <span>Report conversation or user</span>
              </button>

              {conversation.type === 'group' && (
                <button
                  onClick={() => {
                    leaveGroup(conversation.id);
                    onClose();
                    toast({
                      type: 'info',
                      title: 'Left Group',
                      message: `You left ${conversation.name}`,
                    });
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Leave Group</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Media Grid */}
        {activeTab === 'media' && (
          <div>
            {sharedImages.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No photos shared yet</p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {sharedImages.map((img) => (
                  <img
                    key={img.id}
                    src={img.storage_path}
                    alt={img.file_name}
                    className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-85 transition-opacity"
                    onClick={() => window.open(img.storage_path, '_blank')}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Files List */}
        {activeTab === 'files' && (
          <div>
            {sharedFiles.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No files shared yet</p>
            ) : (
              <div className="space-y-1.5">
                {sharedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-[#4F46E5] shrink-0" />
                      <span className="truncate">{file.file_name}</span>
                    </div>
                    <IconButton
                      aria-label="Download"
                      size="xs"
                      variant="ghost"
                      onClick={() => window.open(file.storage_path, '_blank')}
                    >
                      <Share2 className="w-3 h-3" />
                    </IconButton>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report to Moderation"
        size="sm"
      >
        <form onSubmit={handleReportSubmit} className="flex flex-col gap-3">
          <p className="text-xs text-slate-500">
            Tell us why you are reporting this user or conversation. Our moderation team reviews all reports.
          </p>
          <textarea
            rows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Describe the issue (harassment, spam, impersonation, etc.)..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
            required
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm">
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

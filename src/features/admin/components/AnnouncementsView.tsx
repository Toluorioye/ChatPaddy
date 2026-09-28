import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  Check,
  Eye,
  AlertCircle,
  Bell,
  Save,
  ExternalLink,
} from 'lucide-react';
import { useAdminStore, Announcement } from '../adminStore';
import { useToast } from '../../../shared/ui/Toast';
import { Modal } from '../../../shared/ui/Modal';

export const AnnouncementsView: React.FC = () => {
  const {
    announcements,
    addAnnouncement,
    editAnnouncement,
    deleteAnnouncement,
    toggleAnnouncement,
  } = useAdminStore();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<Announcement['type']>('banner');
  const [priority, setPriority] = useState<Announcement['priority']>('info');
  const [targetAudience, setTargetAudience] = useState<Announcement['targetAudience']>('all');
  const [actionText, setActionText] = useState('');
  const [actionUrl, setActionUrl] = useState('');

  const openAddModal = () => {
    setTitle('');
    setContent('');
    setType('banner');
    setPriority('info');
    setTargetAudience('all');
    setActionText('');
    setActionUrl('');
    setEditingAnn(null);
    setIsAddOpen(true);
  };

  const openEditModal = (a: Announcement) => {
    setEditingAnn(a);
    setTitle(a.title);
    setContent(a.content);
    setType(a.type);
    setPriority(a.priority);
    setTargetAudience(a.targetAudience);
    setActionText(a.actionText || '');
    setActionUrl(a.actionUrl || '');
    setIsAddOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast({ type: 'error', title: 'Missing required fields', message: 'Title and announcement message are required.' });
      return;
    }

    if (editingAnn) {
      editAnnouncement(editingAnn.id, {
        title,
        content,
        type,
        priority,
        targetAudience,
        actionText,
        actionUrl,
      });
      toast({ type: 'success', title: 'Announcement Updated', message: `Saved changes to "${title}".` });
    } else {
      addAnnouncement({
        title,
        content,
        type,
        priority,
        targetAudience,
        active: true,
        startDate: new Date().toISOString().split('T')[0],
        actionText,
        actionUrl,
      });
      toast({ type: 'success', title: 'Announcement Published', message: `"${title}" is now active.` });
    }

    setIsAddOpen(false);
  };

  const handleDelete = (a: Announcement) => {
    if (confirm(`Delete announcement "${a.title}"?`)) {
      deleteAnnouncement(a.id);
      toast({ type: 'info', title: 'Announcement Deleted', message: `Removed "${a.title}".` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            Announcements & Site Banners
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Broadcast platform updates, scheduled maintenance notices, and promotional banners to active users.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map((a) => (
          <div
            key={a.id}
            className={`p-5 rounded-2xl border transition-all ${
              a.active
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-60'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                    {a.title}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      a.priority === 'critical'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                        : a.priority === 'warning'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                    }`}
                  >
                    {a.priority}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {a.type} display · Audience: {a.targetAudience}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {a.content}
                </p>
                {a.actionText && (
                  <div className="pt-1">
                    <span className="text-xs font-semibold text-[#4F46E5] inline-flex items-center gap-1">
                      Button: "{a.actionText}" → {a.actionUrl || '(action)'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-start">
                {/* Active Toggle Switch */}
                <button
                  type="button"
                  onClick={() => toggleAnnouncement(a.id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    a.active ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      a.active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>

                <button
                  onClick={() => openEditModal(a)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#4F46E5] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(a)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Announcement Modal */}
      {isAddOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddOpen(false)}
          title={editingAnn ? `Edit Announcement` : 'Compose Announcement'}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Headline / Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Network Maintenance"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Announcement Message *
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Full details of the announcement..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Display Format
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="banner">Top Banner</option>
                  <option value="modal">Modal Dialog</option>
                  <option value="toast">Corner Toast</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="info">Info (Blue)</option>
                  <option value="warning">Warning (Amber)</option>
                  <option value="critical">Critical (Red)</option>
                  <option value="success">Success (Green)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="all">All Users</option>
                  <option value="free">Free Tier</option>
                  <option value="premium">Premium Tiers</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Action Button Text (Optional)
                </label>
                <input
                  type="text"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="e.g. Learn More"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Action Link URL
                </label>
                <input
                  type="text"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="e.g. /status or https://..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsAddOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] text-white hover:bg-indigo-700 cursor-pointer shadow-xs"
              >
                Save Announcement
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

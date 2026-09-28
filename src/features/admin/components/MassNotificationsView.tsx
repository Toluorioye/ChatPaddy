import React, { useState } from 'react';
import {
  BellRing,
  Plus,
  Send,
  Trash2,
  CheckCircle,
  Clock,
  Users,
  Smartphone,
  Mail,
  Save,
} from 'lucide-react';
import { useAdminStore, MassNotification } from '../adminStore';
import { useToast } from '../../../shared/ui/Toast';
import { Modal } from '../../../shared/ui/Modal';

export const MassNotificationsView: React.FC = () => {
  const { massNotifications, sendMassNotification, deleteMassNotification } = useAdminStore();
  const { toast } = useToast();

  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState<('in_app' | 'email' | 'push')[]>(['in_app', 'email']);
  const [targetAudience, setTargetAudience] = useState<MassNotification['targetAudience']>('all');

  const openComposeModal = () => {
    setTitle('');
    setMessage('');
    setChannels(['in_app', 'email']);
    setTargetAudience('all');
    setIsComposeOpen(true);
  };

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast({ type: 'error', title: 'Missing required fields', message: 'Title and message body are required.' });
      return;
    }

    sendMassNotification({
      title,
      message,
      channels,
      targetAudience,
    });

    toast({
      type: 'success',
      title: 'Dispatched to Fleet',
      message: `Broadcasting "${title}" to target audience via ${channels.join(', ').toUpperCase()}.`,
    });

    setIsComposeOpen(false);
  };

  const handleDelete = (n: MassNotification) => {
    if (confirm(`Delete notification record "${n.title}"?`)) {
      deleteMassNotification(n.id);
      toast({ type: 'info', title: 'Deleted', message: `Removed "${n.title}".` });
    }
  };

  const toggleChannel = (ch: 'in_app' | 'email' | 'push') => {
    if (channels.includes(ch)) {
      if (channels.length > 1) {
        setChannels(channels.filter((c) => c !== ch));
      }
    } else {
      setChannels([...channels, ch]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            Mass Notifications & Broadcasts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dispatch multi-channel notification blasts across in-app modals, push notifications, and email relays.
          </p>
        </div>

        <button
          onClick={openComposeModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Compose Notification
        </button>
      </div>

      {/* Broadcast History Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500">
              <th className="py-3 px-4 font-semibold">Title & Content</th>
              <th className="py-3 px-4 font-semibold">Channels</th>
              <th className="py-3 px-4 font-semibold">Audience</th>
              <th className="py-3 px-4 font-semibold">Dispatch Timestamp</th>
              <th className="py-3 px-4 font-semibold">Delivery & Read</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {massNotifications.map((n) => (
              <tr key={n.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BellRing className="w-3.5 h-3.5 text-[#4F46E5]" />
                    {n.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{n.message}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    {n.channels.map((ch) => (
                      <span
                        key={ch}
                        className="font-mono uppercase font-bold text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 capitalize text-slate-600 dark:text-slate-300">
                  {n.targetAudience === 'all'
                    ? 'All Registered Users'
                    : n.targetAudience === 'active_7d'
                    ? 'Active (Past 7d)'
                    : n.targetAudience === 'premium'
                    ? 'Pro Subscribers'
                    : 'System Admins'}
                </td>
                <td className="py-3 px-4 text-slate-500">
                  {n.sentAt}
                </td>
                <td className="py-3 px-4">
                  <div className="text-slate-900 dark:text-white font-medium">
                    {n.sentCount.toLocaleString()} delivered
                  </div>
                  <div className="text-[10px] text-emerald-600">
                    {Math.round((n.readCount / (n.sentCount || 1)) * 100)}% read ({n.readCount.toLocaleString()})
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDelete(n)}
                    title="Delete Record"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsComposeOpen(false)}
          title="Compose & Dispatch Mass Broadcast"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notification Headline / Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ChatPaddy 2.0 is Live!"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Broadcast Body Message *
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your push/email announcement message..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Cohort
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="all">Entire User Base (All Registered)</option>
                  <option value="active_7d">Active Users (Past 7 Days)</option>
                  <option value="premium">Pro / Paid Subscribers</option>
                  <option value="admins">Admin Team Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dispatch Channels
                </label>
                <div className="flex gap-2 pt-1">
                  {(['in_app', 'email', 'push'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleChannel(ch)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer border ${
                        channels.includes(ch)
                          ? 'bg-[#4F46E5] text-white border-transparent'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsComposeOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] text-white hover:bg-indigo-700 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Broadcast Now
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

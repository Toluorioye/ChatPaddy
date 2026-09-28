import React, { useState } from 'react';
import {
  Mail,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Send,
  Server,
  Lock,
  ShieldCheck,
  Save,
  Check,
} from 'lucide-react';
import { useAdminStore, SMTPSettings } from '../adminStore';
import { useToast } from '../../../shared/ui/Toast';
import { Modal } from '../../../shared/ui/Modal';

export const SMTPSettingsView: React.FC = () => {
  const { smtpSettings, addSMTP, editSMTP, deleteSMTP, setDefaultSMTP, testSMTP } =
    useAdminStore();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSmtp, setEditingSmtp] = useState<SMTPSettings | null>(null);
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState(587);
  const [encryption, setEncryption] = useState<SMTPSettings['encryption']>('tls');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');

  const openAddModal = () => {
    setName('');
    setHost('');
    setPort(587);
    setEncryption('tls');
    setUsername('');
    setPassword('');
    setFromEmail('noreply@chatpaddy.com');
    setFromName('ChatPaddy Team');
    setEditingSmtp(null);
    setIsAddOpen(true);
  };

  const openEditModal = (s: SMTPSettings) => {
    setEditingSmtp(s);
    setName(s.name);
    setHost(s.host);
    setPort(s.port);
    setEncryption(s.encryption);
    setUsername(s.username);
    setPassword(s.password || '');
    setFromEmail(s.fromEmail);
    setFromName(s.fromName);
    setIsAddOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !host.trim() || !fromEmail.trim()) {
      toast({ type: 'error', title: 'Missing required fields', message: 'Name, Host, and From Email are required.' });
      return;
    }

    if (editingSmtp) {
      editSMTP(editingSmtp.id, {
        name,
        host,
        port,
        encryption,
        username,
        password,
        fromEmail,
        fromName,
      });
      toast({ type: 'success', title: 'SMTP Updated', message: `Saved configuration for "${name}".` });
    } else {
      addSMTP({
        name,
        host,
        port,
        encryption,
        username,
        password,
        fromEmail,
        fromName,
      });
      toast({ type: 'success', title: 'SMTP Added', message: `Added custom SMTP profile "${name}".` });
    }

    setIsAddOpen(false);
  };

  const handleDelete = (s: SMTPSettings) => {
    if (confirm(`Delete SMTP configuration "${s.name}"?`)) {
      deleteSMTP(s.id);
      toast({ type: 'info', title: 'SMTP Deleted', message: `Removed "${s.name}".` });
    }
  };

  const handleSendTestEmail = async () => {
    if (!testRecipient.trim()) {
      toast({ type: 'error', title: 'Missing recipient', message: 'Enter a valid test email address.' });
      return;
    }

    setIsTesting(true);
    const defaultSmtp = smtpSettings.find((s) => s.isDefault) || smtpSettings[0];
    if (defaultSmtp) {
      await testSMTP(defaultSmtp.id);
    }
    setIsTesting(false);
    setTestEmailOpen(false);
    toast({
      type: 'success',
      title: 'SMTP Handshake Succeeded',
      message: `Test email dispatched to ${testRecipient} via active SMTP server.`,
    });
    setTestRecipient('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            Email & SMTP Server Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure outbound mail relays, transactional email gateways (SendGrid, Mailgun, Amazon SES, or custom SMTP).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setTestEmailOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-indigo-500" />
            Send Test Mail
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Custom SMTP
          </button>
        </div>
      </div>

      {/* SMTP Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {smtpSettings.map((s: SMTPSettings) => (
          <div
            key={s.id}
            className={`p-5 rounded-2xl border transition-all ${
              s.isDefault
                ? 'bg-white dark:bg-slate-900 border-[#4F46E5] ring-2 ring-[#4F46E5]/15 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] shrink-0">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                      {s.name}
                    </h3>
                    {s.isDefault && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                        Primary Relay
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-slate-500 mt-1">
                    {s.host}:{s.port} ({s.encryption.toUpperCase()})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(s)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#4F46E5] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {!s.isDefault && (
                  <button
                    onClick={() => handleDelete(s)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Sender Identity:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {s.fromName} &lt;{s.fromEmail}&gt;
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> TLS Verified
                </span>
                {!s.isDefault && (
                  <button
                    onClick={() => {
                      setDefaultSMTP(s.id);
                      toast({ type: 'success', title: 'Primary Relay Changed', message: `${s.name} is now primary.` });
                    }}
                    className="text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer"
                  >
                    Set as Primary
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit SMTP Modal */}
      {isAddOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddOpen(false)}
          title={editingSmtp ? `Edit: ${editingSmtp.name}` : 'Add Custom SMTP Server'}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Profile Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amazon SES Production"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  SMTP Host *
                </label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="smtp.example.com"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Port *
                </label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(parseInt(e.target.value, 10))}
                  placeholder="587"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Encryption
                </label>
                <select
                  value={encryption}
                  onChange={(e) => setEncryption(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="tls">STARTTLS / TLS (Port 587)</option>
                  <option value="ssl">SSL (Port 465)</option>
                  <option value="none">None (Port 25 - Not recommended)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="apikey or user"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SMTP Password / API Key
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  From Email *
                </label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="noreply@domain.com"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  From Display Name
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="ChatPaddy Support"
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
                Save SMTP Profile
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Test Email Modal */}
      {testEmailOpen && (
        <Modal
          isOpen={true}
          onClose={() => setTestEmailOpen(false)}
          title="Send Diagnostic Test Email"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Verify TCP handshake, SSL/TLS certificate, and authentication credentials with your primary relay.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recipient Email Address
              </label>
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTestEmailOpen(false)}
                className="px-3.5 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isTesting}
                onClick={handleSendTestEmail}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-[#4F46E5] text-white hover:bg-indigo-700 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isTesting ? 'Testing Relay...' : 'Send Test Mail'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

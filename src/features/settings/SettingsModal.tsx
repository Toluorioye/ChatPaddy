import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Shield,
  Database,
  Check,
  Copy,
  Terminal,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { Modal } from '../../shared/ui/Modal';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { useToast } from '../../shared/ui/Toast';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useAuthStore } from '../auth/authStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (t: 'light' | 'dark' | 'system') => void;
  onOpenAdmin?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  onOpenAdmin,
}) => {
  const { user, isAdmin, setAdminStatus, elevateToAdmin, demoteFromAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'appearance' | 'privacy' | 'supabase'>('appearance');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [lastSeenPrivacy, setLastSeenPrivacy] = useState<'everyone' | 'contacts' | 'nobody'>('everyone');
  const [copiedSql, setCopiedSql] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleCopySqlHint = () => {
    navigator.clipboard.writeText('-- Run /schema.sql in your Supabase SQL Editor');
    setCopiedSql(true);
    toast({
      type: 'success',
      title: 'SQL Location Copied',
      message: 'schema.sql is available in the root folder of this project.',
    });
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Preferences & Settings" size="md">
      <div className="flex flex-col gap-4">
        {/* Settings Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-2 px-3.5 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'appearance'
                ? 'border-[#4F46E5] text-[#4F46E5] dark:text-[#818CF8]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Appearance & Audio
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-2 px-3.5 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-[#4F46E5] text-[#4F46E5] dark:text-[#818CF8]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Privacy & Security
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`py-2 px-3.5 font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'border-[#4F46E5] text-[#4F46E5] dark:text-[#818CF8]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Backend</span>
          </button>
        </div>

        {/* Tab 1: Appearance & Sound */}
        {activeTab === 'appearance' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                Interface Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
                  { id: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
                  { id: 'system', label: 'System', icon: <Laptop className="w-4 h-4" /> },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onThemeChange(t.id as any)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      theme === t.id
                        ? 'border-[#4F46E5] bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-300 ring-2 ring-[#4F46E5]/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                Audio Notifications
              </label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-[#4F46E5]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Message Chimes & Ringing
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Play pleasant audio on message sent & received
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#4F46E5] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Privacy & Receipts */}
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Read Receipts (Blue Ticks)
                </div>
                <div className="text-[11px] text-slate-400">
                  Let others see when you have read their messages
                </div>
              </div>
              <input
                type="checkbox"
                checked={readReceipts}
                onChange={(e) => setReadReceipts(e.target.checked)}
                className="w-4 h-4 accent-[#4F46E5] rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Last Seen & Online Presence
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['everyone', 'contacts', 'nobody'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setLastSeenPrivacy(opt)}
                    className={`py-2 px-3 rounded-xl border text-xs capitalize font-medium transition-all ${
                      lastSeenPrivacy === opt
                        ? 'border-[#4F46E5] bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5]'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Privileges & Access Status */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    {isAdmin ? (
                      <ShieldAlert className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>Account Privileges</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isAdmin
                      ? 'Platform Administrator (Full console & moderation access)'
                      : 'Standard Member (Regular user account)'}
                  </div>
                </div>
                <Badge variant={isAdmin ? 'success' : 'neutral'} size="sm">
                  {isAdmin ? 'Platform Admin' : 'Standard Member'}
                </Badge>
              </div>

              {isAdmin ? (
                <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    🛡️ Admin Moderation Hub is unlocked
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        demoteFromAdmin();
                        toast({
                          type: 'info',
                          title: 'Switched to Member View',
                          message: 'Admin console and moderation icons are now hidden.',
                        });
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
                    >
                      Switch to Member View
                    </button>
                    {onOpenAdmin && (
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
                        onClick={() => {
                          onClose();
                          onOpenAdmin();
                        }}
                      >
                        Open Admin Hub
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
                  {!showAdminInput ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Authorized platform administrator?
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAdminInput(true)}
                        className="text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Unlock Admin Access</span>
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setAdminError(null);
                        const res = await elevateToAdmin(adminPasscode);
                        if (res.success) {
                          toast({
                            type: 'success',
                            title: 'Admin Access Granted',
                            message: 'Platform administrator controls unlocked.',
                          });
                          setShowAdminInput(false);
                          setAdminPasscode('');
                        } else {
                          setAdminError(res.error || 'Invalid passcode');
                        }
                      }}
                      className="space-y-2 mt-1"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="password"
                          value={adminPasscode}
                          onChange={(e) => setAdminPasscode(e.target.value)}
                          placeholder="Enter admin key (default: admin123)"
                          className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                          autoFocus
                        />
                        <Button type="submit" size="sm" variant="primary">
                          Verify
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowAdminInput(false);
                            setAdminError(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                      {adminError && (
                        <div className="text-[11px] text-rose-500 font-medium">{adminError}</div>
                      )}
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Passcode: <code>admin123</code></span>
                        <button
                          type="button"
                          onClick={async () => {
                            await elevateToAdmin('admin123');
                            toast({
                              type: 'success',
                              title: 'Admin Access Granted',
                              message: 'Platform administrator controls unlocked.',
                            });
                            setShowAdminInput(false);
                          }}
                          className="text-[#4F46E5] dark:text-[#818CF8] hover:underline"
                        >
                          1-Click Demo Unlock
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Supabase Details */}
        {activeTab === 'supabase' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Backend Status
                </span>
                <Badge variant={isSupabaseConfigured ? 'success' : 'spark'} size="sm">
                  {isSupabaseConfigured ? 'Connected to Remote Supabase' : 'Interactive Local / Demo Mode'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isSupabaseConfigured
                  ? 'ChatPaddy is connected to your Supabase Postgres database and Realtime channel.'
                  : 'Currently running in ultra-fast interactive mode with instant multi-tab sync, seed conversations, audio notes, and simulated AI responses. To connect your live Supabase project, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
              <Terminal className="w-5 h-5 text-[#4F46E5] shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-slate-700 dark:text-slate-300">
                <div className="font-semibold text-slate-900 dark:text-white mb-1">
                  Database Migration SQL Ready
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-2">
                  A complete, ordered SQL migration is included at <code>schema.sql</code> with all 14 tables, RLS policies, security definer functions, and full-text search triggers.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySqlHint}
                  leftIcon={copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedSql ? 'Copied' : 'Copy Schema Info'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

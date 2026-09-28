import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Ban,
  CheckCircle,
  AlertTriangle,
  Save,
  RefreshCw,
  Clock,
  Eye,
  Key,
} from 'lucide-react';
import { useAdminStore } from '../adminStore';
import { useToast } from '../../../shared/ui/Toast';

export const BruteForceSecurityView: React.FC = () => {
  const { bruteForce, updateBruteForce } = useAdminStore();
  const { toast } = useToast();

  const [maxBadLoginAttempts, setMaxBadLoginAttempts] = useState(bruteForce.maxBadLoginAttempts);
  const [lockoutDurationMinutes, setLockoutDurationMinutes] = useState(bruteForce.lockoutDurationMinutes);
  const [enableCaptchaAfterAttempts, setEnableCaptchaAfterAttempts] = useState(bruteForce.enableCaptchaAfterAttempts);
  const [ipWhitelist, setIpWhitelist] = useState(bruteForce.ipWhitelist);
  const [ipBlacklist, setIpBlacklist] = useState(bruteForce.ipBlacklist);

  // Simulated live security incidents
  const securityLogs = [
    { id: 'sec_1', ip: '198.51.100.42', attempts: 7, action: 'IP Auto-Banned for 15 mins', time: '14m ago', status: 'blocked' },
    { id: 'sec_2', ip: '203.0.113.19', attempts: 5, action: 'Rate limited (Exceeded bad logins)', time: '1h ago', status: 'blocked' },
    { id: 'sec_3', ip: '192.168.1.105', attempts: 2, action: 'Captcha challenge solved', time: '3h ago', status: 'resolved' },
    { id: 'sec_4', ip: '127.0.0.1', attempts: 1, action: 'Whitelisted bypass', time: '5h ago', status: 'allowed' },
  ];

  const handleSave = () => {
    updateBruteForce({
      maxBadLoginAttempts,
      lockoutDurationMinutes,
      enableCaptchaAfterAttempts,
      ipWhitelist,
      ipBlacklist,
    });

    toast({
      type: 'success',
      title: 'Security Policy Updated',
      message: `Bad login limit set to ${maxBadLoginAttempts} attempts with ${lockoutDurationMinutes}m lockout.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            Brute Force Detection & Security
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Protect user accounts against dictionary attacks, credential stuffing, and repetitive bad logins.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Detection Thresholds */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#4F46E5]" />
            Login Limits & Lockout Directives
          </h2>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Bad Login Limit (Max Failed Attempts)
              </label>
              <span className="text-xs font-bold text-[#4F46E5]">{maxBadLoginAttempts} attempts</span>
            </div>
            <input
              type="range"
              min={3}
              max={15}
              step={1}
              value={maxBadLoginAttempts}
              onChange={(e) => setMaxBadLoginAttempts(parseInt(e.target.value, 10))}
              className="w-full accent-[#4F46E5] cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              When an IP or email fails {maxBadLoginAttempts} consecutive attempts, authentication is frozen.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Lockout Duration (Minutes)
              </label>
              <span className="text-xs font-bold text-[#4F46E5]">{lockoutDurationMinutes} min</span>
            </div>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={lockoutDurationMinutes}
              onChange={(e) => setLockoutDurationMinutes(parseInt(e.target.value, 10))}
              className="w-full accent-[#4F46E5] cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Duration the offending IP address or user account remains suspended before retry is permitted.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Trigger Captcha Challenge After
              </label>
              <span className="text-xs font-bold text-amber-500">{enableCaptchaAfterAttempts} attempts</span>
            </div>
            <input
              type="range"
              min={1}
              max={maxBadLoginAttempts}
              step={1}
              value={enableCaptchaAfterAttempts}
              onChange={(e) => setEnableCaptchaAfterAttempts(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Requires human verification before proceeding to final lockout threshold.
            </p>
          </div>
        </div>

        {/* IP Filtering Matrix */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            IP Access Control Lists (ACL)
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              IP Whitelist (Bypasses brute force restrictions · One per line)
            </label>
            <textarea
              rows={4}
              value={ipWhitelist}
              onChange={(e) => setIpWhitelist(e.target.value)}
              placeholder="127.0.0.1&#10;192.168.1.0/24"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              IP Blacklist (Instantly rejected · One per line)
            </label>
            <textarea
              rows={4}
              value={ipBlacklist}
              onChange={(e) => setIpBlacklist(e.target.value)}
              placeholder="198.51.100.42&#10;203.0.113.19"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Security Audit Feed */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Recent Login Security Events
            </h2>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Shield Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500">
                  <th className="py-2.5 font-semibold">IP Address</th>
                  <th className="py-2.5 font-semibold">Failed Attempts</th>
                  <th className="py-2.5 font-semibold">Enforced Action</th>
                  <th className="py-2.5 font-semibold">Time</th>
                  <th className="py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {securityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 font-mono font-medium text-slate-900 dark:text-white">{log.ip}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 font-semibold">{log.attempts}</td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">{log.action}</td>
                    <td className="py-3 text-slate-500">{log.time}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          log.status === 'blocked'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                            : log.status === 'resolved'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

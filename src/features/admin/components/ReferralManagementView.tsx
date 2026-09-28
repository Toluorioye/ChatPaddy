import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  Save,
  Trash2,
  Coins,
  Plus,
} from 'lucide-react';
import { useAdminStore, ReferralSettings } from '../adminStore';
import { useToast } from '../../../shared/ui/Toast';

export const ReferralManagementView: React.FC = () => {
  const { referralSettings, updateReferralSettings } = useAdminStore();
  const { toast } = useToast();

  const [enabled, setEnabled] = useState(referralSettings.enabled);
  const [commissionType, setCommissionType] = useState(referralSettings.commissionType);
  const [commissionRate, setCommissionRate] = useState(referralSettings.commissionRate);
  const [cookieDurationDays, setCookieDurationDays] = useState(referralSettings.cookieDurationDays);
  const [minimumPayout, setMinimumPayout] = useState(referralSettings.minimumPayout);
  const [topReferrers, setTopReferrers] = useState(referralSettings.topReferrers || []);

  const handleSave = () => {
    updateReferralSettings({
      enabled,
      commissionType,
      commissionRate,
      cookieDurationDays,
      minimumPayout,
      topReferrers,
    });

    toast({
      type: 'success',
      title: 'Referral Settings Saved',
      message: `Commission updated to ${
        commissionType === 'percentage' ? `${commissionRate}%` : `$${commissionRate}`
      } with $${minimumPayout} threshold.`,
    });
  };

  const handleDeleteReferral = (refId: string, code: string) => {
    if (confirm(`Remove referral code "${code}"?`)) {
      const updated = topReferrers.filter((r) => r.id !== refId);
      setTopReferrers(updated);
      updateReferralSettings({ topReferrers: updated });
      toast({ type: 'info', title: 'Referral Removed', message: `Deleted ${code}.` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            Referral & Affiliate Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure partner referral programs, affiliate commissions (Flat or Percentage), tracking cookies, and payout minimums.
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
        {/* Commission Setup Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              Commission Structure
            </h2>

            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Commission Type *
              </label>
              <select
                value={commissionType}
                onChange={(e) => setCommissionType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="percentage">Percentage of Subscription (%)</option>
                <option value="flat">Flat Dollar Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Commission Value ({commissionType === 'percentage' ? '%' : '$'}) *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700">
                  {commissionType === 'percentage' ? '%' : '$'}
                </span>
                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-r-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Attribution Window (Cookie Days)
              </label>
              <input
                type="number"
                value={cookieDurationDays}
                onChange={(e) => setCookieDurationDays(parseInt(e.target.value, 10) || 30)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Minimum Payout Threshold ($)
              </label>
              <input
                type="number"
                value={minimumPayout}
                onChange={(e) => setMinimumPayout(parseFloat(e.target.value) || 50)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>
        </div>

        {/* Live Program Highlight Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Program Performance Summary
            </h2>
            <p className="text-xs text-slate-500">
              Aggregated metrics across all registered affiliate partners and referral codes.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Referrals</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {referralSettings.totalReferrals.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Paid Out</span>
                <span className="text-base font-bold text-[#4F46E5]">
                  ${referralSettings.totalPaidOut.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Pending</span>
                <span className="text-base font-bold text-emerald-600">
                  ${referralSettings.pendingPayouts.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-300 mt-4">
            <span className="font-bold">Affiliate Terms Rule: </span>
            Partners receive {commissionType === 'percentage' ? `${commissionRate}% recurring` : `$${commissionRate} flat`} for every user who converts within {cookieDurationDays} days.
          </div>
        </div>

        {/* Top Affiliates Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4F46E5]" />
              Active Referral Partners & Codes ({topReferrers.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500">
                  <th className="py-2.5 px-3 font-semibold">Affiliate Name</th>
                  <th className="py-2.5 px-3 font-semibold">Referral Code / Link</th>
                  <th className="py-2.5 px-3 font-semibold">Successful Referrals</th>
                  <th className="py-2.5 px-3 font-semibold">Total Paid Out</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topReferrers.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {r.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                      https://chatpaddy.com/?ref={r.code}
                    </td>
                    <td className="py-3 px-3 text-[#4F46E5] font-semibold">
                      {r.referralsCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-emerald-600 font-bold">
                      ${r.earnings.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteReferral(r.id, r.code)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Referral"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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

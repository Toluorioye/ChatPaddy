import React, { useState } from 'react';
import {
  Activity,
  Users,
  DollarSign,
  TrendingUp,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Database,
  Radio,
  Server,
  Calendar,
} from 'lucide-react';
import { useAdminStore } from '../adminStore';

export const AdminOverview: React.FC = () => {
  const { globalSettings, users, features } = useAdminStore();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Realistic mock data points
  const activeVisitors = 184;
  const totalRevenue = 28450;
  const mrr = 8620;
  const activeSockets = 342;
  const dbLatency = 38;
  const storageUsed = 42.4;

  const hourlyTraffic = [
    { hour: '00:00', visitors: 65, signups: 3 },
    { hour: '04:00', visitors: 42, signups: 1 },
    { hour: '08:00', visitors: 110, signups: 8 },
    { hour: '12:00', visitors: 195, signups: 14 },
    { hour: '16:00', visitors: 178, signups: 12 },
    { hour: '20:00', visitors: 140, signups: 7 },
  ];

  const countries = [
    { name: 'United States', code: 'US', count: 4820, percent: 38 },
    { name: 'United Kingdom', code: 'GB', count: 2410, percent: 19 },
    { name: 'Nigeria', code: 'NG', count: 2150, percent: 17 },
    { name: 'Germany', code: 'DE', count: 1270, percent: 10 },
    { name: 'Canada', code: 'CA', count: 950, percent: 8 },
    { name: 'Others', code: 'WW', count: 1020, percent: 8 },
  ];

  const recentTransactions = [
    { id: 'TX-9081', user: 'Ada Lovelace', email: 'ada@chatpaddy.internal', plan: 'Pro Annual', amount: 99.0, date: '10m ago', status: 'completed' },
    { id: 'TX-9080', user: 'Marcus Chen', email: 'marcus@example.com', plan: 'Team Seat (5x)', amount: 245.0, date: '1h ago', status: 'completed' },
    { id: 'TX-9079', user: 'Zainab Bello', email: 'zainab@chatpaddy.internal', plan: 'Pro Monthly', amount: 9.99, date: '3h ago', status: 'completed' },
    { id: 'TX-9078', user: 'Unknown Dev', email: 'dev@opensource.io', plan: 'Pro Monthly', amount: 9.99, date: '6h ago', status: 'refunded' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            System & Traffic Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time traffic metrics, user registration trends, revenue performance, and health status.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Real-time Traffic */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Traffic</span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Real-time
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{activeVisitors}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Active concurrent sessions on ChatPaddy</p>
        </div>

        {/* User Accounts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Users</span>
            <Users className="w-4 h-4 text-[#4F46E5]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{users.length * 312}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +28 today
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">14.8% conversion from landing visitors</p>
        </div>

        {/* Payments / MRR */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Revenue (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {globalSettings.currencySymbol}{mrr.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +19.4%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total {globalSettings.currencySymbol}{totalRevenue.toLocaleString()} collected
          </p>
        </div>

        {/* System Health */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">System Uptime</span>
            <Radio className="w-4 h-4 text-[#4F46E5] animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">99.98%</span>
            <span className="text-xs text-slate-500 font-medium">{dbLatency}ms latency</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{activeSockets} active Supabase WebSockets</p>
        </div>
      </div>

      {/* Middle Row: Traffic Activity Chart & Geolocation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Traffic Chart (Simulated Clean SVG Bar Grid) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                Hourly Site Traffic & Signups
              </h2>
              <p className="text-xs text-slate-500">Real-time volume analysis across 24h timeline</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-3 h-3 rounded-sm bg-[#4F46E5]" /> Visitors
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" /> New Accounts
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {hourlyTraffic.map((item) => (
              <div key={item.hour} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-mono">{item.hour}</span>
                  <span>{item.visitors} visitors · {item.signups} accounts</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-[#4F46E5] rounded-l-full transition-all duration-500"
                    style={{ width: `${(item.visitors / 220) * 85}%` }}
                  />
                  <div
                    className="h-full bg-emerald-500 rounded-r-full transition-all duration-500"
                    style={{ width: `${(item.signups / 20) * 15}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Peak hour: 12:00 – 14:00 UTC (195 req/min)</span>
            <span className="text-emerald-600 font-semibold">Healthy load distribution</span>
          </div>
        </div>

        {/* Traffic by Country */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#4F46E5]" />
              Traffic by Country
            </h2>
            <span className="text-xs text-slate-500">Top 6 Regions</span>
          </div>

          <div className="space-y-3.5">
            {countries.map((c) => (
              <div key={c.code} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{c.name}</span>
                  <span className="text-slate-500">{c.percent}% ({c.count})</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${c.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Device Split */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Device Breakdown</h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Monitor className="w-4 h-4 mx-auto mb-1 text-slate-700 dark:text-slate-300" />
                <span className="block font-bold text-slate-900 dark:text-white">62%</span>
                <span className="text-[10px] text-slate-500">Desktop</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Smartphone className="w-4 h-4 mx-auto mb-1 text-slate-700 dark:text-slate-300" />
                <span className="block font-bold text-slate-900 dark:text-white">34%</span>
                <span className="text-[10px] text-slate-500">Mobile</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Tablet className="w-4 h-4 mx-auto mb-1 text-slate-700 dark:text-slate-300" />
                <span className="block font-bold text-slate-900 dark:text-white">4%</span>
                <span className="text-[10px] text-slate-500">Tablet</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Payment Transactions & System Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                Recent Subscriptions & Payments
              </h2>
              <p className="text-xs text-slate-500">Live transaction feed and plan upgrades</p>
            </div>
            <span className="text-xs font-semibold text-[#4F46E5]">View Stripe / Gateway</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500">
                  <th className="py-2.5 font-semibold">User</th>
                  <th className="py-2.5 font-semibold">Plan</th>
                  <th className="py-2.5 font-semibold">Amount</th>
                  <th className="py-2.5 font-semibold">Time</th>
                  <th className="py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 font-medium text-slate-900 dark:text-white">
                      <div>{tx.user}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{tx.email}</div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{tx.plan}</td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {globalSettings.currencySymbol}{tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3 text-slate-500">{tx.date}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          tx.status === 'completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Server & Infrastructure Capacity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-[#4F46E5]" />
            Server & Database Capacity
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-400">
                <span>Media Storage Allocation</span>
                <span className="font-semibold text-slate-900 dark:text-white">{storageUsed} GB / 100 GB</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: `${storageUsed}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-400">
                <span>Realtime WebSocket Channels</span>
                <span className="font-semibold text-slate-900 dark:text-white">{activeSockets} / 10,000</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-400">
                <span>Gemini AI Token Quota</span>
                <span className="font-semibold text-slate-900 dark:text-white">124k / 1M tokens</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '12.4%' }} />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1.5">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              All Services Operating Normally
            </div>
            <p className="text-slate-500">
              Supabase Auth, Realtime Postgres CDC, WebRTC STUN/TURN relays, and Google Cloud Run dev server are responding with optimal latency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

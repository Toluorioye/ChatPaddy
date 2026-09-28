import React, { useState } from 'react';
import {
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  Check,
  RefreshCw,
  Sparkles,
  Phone,
  MessageSquare,
  Users,
  Shield,
  DollarSign,
  Info,
  Mic,
  Smile,
  Paperclip,
  CheckCheck,
  Activity,
  Megaphone,
  Share2,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { useAdminStore, FeatureItem } from '../adminStore';
import { useToast } from '../../../shared/ui/Toast';

export const FeatureManagerView: React.FC = () => {
  const { features, toggleFeature, updateFeature } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { toast } = useToast();

  const categories = [
    { id: 'all', label: 'All Features' },
    { id: 'messaging', label: 'Messaging & Chat' },
    { id: 'calls', label: 'Voice & Video' },
    { id: 'ai', label: 'AI & Intelligence' },
    { id: 'monetization', label: 'Monetization' },
    { id: 'security', label: 'Security & Auth' },
    { id: 'general', label: 'General & PWA' },
  ];

  const filteredFeatures = features.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggle = (feature: FeatureItem) => {
    toggleFeature(feature.id);
    toast({
      type: feature.enabled ? 'info' : 'success',
      title: `${feature.name} ${feature.enabled ? 'Disabled' : 'Enabled'}`,
      message: `System feature state updated instantly across platform clients.`,
    });
  };

  const enableAll = () => {
    features.forEach((f) => {
      if (!f.enabled) toggleFeature(f.id);
    });
    toast({ type: 'success', title: 'All Features Enabled', message: 'All platform modules are now active.' });
  };

  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-indigo-500" />;
      case 'Users': return <Users className="w-5 h-5 text-blue-500" />;
      case 'Phone': return <Phone className="w-5 h-5 text-emerald-500" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'Mic': return <Mic className="w-5 h-5 text-rose-500" />;
      case 'Paperclip': return <Paperclip className="w-5 h-5 text-slate-500" />;
      case 'Smile': return <Smile className="w-5 h-5 text-yellow-500" />;
      case 'CheckCheck': return <CheckCheck className="w-5 h-5 text-sky-500" />;
      case 'Activity': return <Activity className="w-5 h-5 text-teal-500" />;
      case 'Megaphone': return <Megaphone className="w-5 h-5 text-purple-500" />;
      case 'Share2': return <Share2 className="w-5 h-5 text-orange-500" />;
      case 'DollarSign': return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case 'ShieldAlert': return <Shield className="w-5 h-5 text-red-500" />;
      case 'Download': return <Download className="w-5 h-5 text-cyan-500" />;
      default: return <Sparkles className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            Feature Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control platform capabilities in real time. Toggling off a feature dynamically disables it across web, mobile, and desktop clients.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={enableAll}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Enable All
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search features (e.g. calls, ai, adsense)..."
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-slate-900 dark:text-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === c.id
                  ? 'bg-[#4F46E5] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFeatures.map((feature) => (
          <div
            key={feature.id}
            className={`p-5 rounded-2xl border transition-all ${
              feature.enabled
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                  {getFeatureIcon(feature.iconName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                      {feature.name}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {feature.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => handleToggle(feature)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 ${
                  feature.enabled ? 'bg-[#4F46E5]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={feature.enabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    feature.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono">ID: {feature.id}</span>
              <span className={`font-semibold ${feature.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                {feature.enabled ? '● Active in production' : '○ Disabled'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

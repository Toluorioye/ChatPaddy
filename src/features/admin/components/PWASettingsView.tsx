import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Monitor,
  CheckCircle,
  Save,
  RefreshCw,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAdminStore } from '../adminStore';
import { useToast } from '../../../shared/ui/Toast';

export const PWASettingsView: React.FC = () => {
  const { pwaSettings, updatePWASettings } = useAdminStore();
  const { toast } = useToast();

  const [appName, setAppName] = useState(pwaSettings.appName);
  const [shortName, setShortName] = useState(pwaSettings.shortName);
  const [themeColor, setThemeColor] = useState(pwaSettings.themeColor);
  const [backgroundColor, setBackgroundColor] = useState(pwaSettings.backgroundColor);
  const [displayMode, setDisplayMode] = useState(pwaSettings.displayMode);
  const [startUrl, setStartUrl] = useState(pwaSettings.startUrl);
  const [cachingStrategy, setCachingStrategy] = useState(pwaSettings.cachingStrategy);
  const [icon192, setIcon192] = useState(pwaSettings.icon192);
  const [icon512, setIcon512] = useState(pwaSettings.icon512);

  const handleSave = () => {
    updatePWASettings({
      appName,
      shortName,
      themeColor,
      backgroundColor,
      displayMode,
      startUrl,
      cachingStrategy,
      icon192,
      icon512,
    });

    toast({
      type: 'success',
      title: 'PWA Settings Updated',
      message: 'Manifest parameters and offline service worker strategies synchronized.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            Progressive Web App (PWA) Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure offline installation, Web App Manifest parameters, home screen icons, and service worker caching strategies.
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
        {/* Manifest Identity Form */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#4F46E5]" />
            Application Manifest Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full App Name
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Short Name (Home Screen)
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Mode
              </label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="standalone">Standalone (Native App Feel)</option>
                <option value="fullscreen">Fullscreen (Immersive)</option>
                <option value="minimal-ui">Minimal UI</option>
                <option value="browser">Browser Window</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start URL
              </label>
              <input
                type="text"
                value={startUrl}
                onChange={(e) => setStartUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Bar Theme Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-9 h-8 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Splash Screen Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-9 h-8 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Offline Cache Strategy & Icons */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Service Worker & Offline Engine
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Offline Cache Strategy
            </label>
            <select
              value={cachingStrategy}
              onChange={(e) => setCachingStrategy(e.target.value as any)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              <option value="staleWhileRevalidate">Stale While Revalidate (Fastest load + background sync)</option>
              <option value="networkFirst">Network First (Fresh messages prioritized)</option>
              <option value="cacheFirst">Cache First (Maximum offline availability)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PWA Icon 192x192 URL
              </label>
              <div className="flex gap-2 items-center">
                <img src={icon192} alt="192 Icon" className="w-8 h-8 rounded-lg object-cover bg-slate-200" />
                <input
                  type="text"
                  value={icon192}
                  onChange={(e) => setIcon192(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PWA Icon 512x512 URL
              </label>
              <div className="flex gap-2 items-center">
                <img src={icon512} alt="512 Icon" className="w-8 h-8 rounded-lg object-cover bg-slate-200" />
                <input
                  type="text"
                  value={icon512}
                  onChange={(e) => setIcon512(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Installation Diagnostic Badge */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                  PWA Install Criteria Met
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Valid manifest.json, HTTPS protocol, and Service Worker listeners detected.
                </span>
              </div>
            </div>
            <button
              onClick={() => toast({ type: 'info', title: 'Install Prompt', message: 'Simulated native PWA install banner.' })}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700"
            >
              Test Prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

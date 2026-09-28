import React, { useState } from 'react';
import {
  Code2,
  DollarSign,
  Save,
  Check,
  AlertCircle,
  Eye,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAdminStore } from '../adminStore';
import { useToast } from '../../../shared/ui/Toast';

export const CustomScriptsView: React.FC = () => {
  const { customScripts, updateCustomScripts, updateAdsense } = useAdminStore();
  const { toast } = useToast();

  const [headerScripts, setHeaderScripts] = useState(customScripts.headerScripts);
  const [bodyScripts, setBodyScripts] = useState(customScripts.bodyScripts);
  const [footerScripts, setFooterScripts] = useState(customScripts.footerScripts);

  const [adsenseEnabled, setAdsenseEnabled] = useState(customScripts.adsense.enabled);
  const [publisherId, setPublisherId] = useState(customScripts.adsense.publisherId);
  const [autoAds, setAutoAds] = useState(customScripts.adsense.autoAds);
  const [headerAdSlot, setHeaderAdSlot] = useState(customScripts.adsense.headerAdSlot);
  const [sidebarAdSlot, setSidebarAdSlot] = useState(customScripts.adsense.sidebarAdSlot);
  const [callViewAdSlot, setCallViewAdSlot] = useState(customScripts.adsense.callViewAdSlot);

  const handleSaveAll = () => {
    updateCustomScripts({
      headerScripts,
      bodyScripts,
      footerScripts,
    });

    updateAdsense({
      enabled: adsenseEnabled,
      publisherId,
      autoAds,
      headerAdSlot,
      sidebarAdSlot,
      callViewAdSlot,
    });

    toast({
      type: 'success',
      title: 'Scripts & AdSense Saved',
      message: 'Custom tracking tags, scripts, and Google AdSense units updated.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            Custom Scripts & Google AdSense
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Inject third-party scripts, conversion trackers, analytics pixels, and configure Google AdSense monetization units.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Part 1: Google AdSense Manager */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                Google AdSense Monetization Manager
              </h2>
              <p className="text-xs text-slate-500">
                Display programmatic ad slots in non-intrusive zones across the web client.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAdsenseEnabled(!adsenseEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              adsenseEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                adsenseEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {adsenseEnabled && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  AdSense Publisher ID (Client ID)
                </label>
                <input
                  type="text"
                  value={publisherId}
                  onChange={(e) => setPublisherId(e.target.value)}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="autoAds"
                  checked={autoAds}
                  onChange={(e) => setAutoAds(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="autoAds" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Enable Google Auto Ads (Let Google place ads automatically)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Header Banner Ad Slot ID
                </label>
                <input
                  type="text"
                  value={headerAdSlot}
                  onChange={(e) => setHeaderAdSlot(e.target.value)}
                  placeholder="e.g. 8492019283"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chat Sidebar Ad Slot ID
                </label>
                <input
                  type="text"
                  value={sidebarAdSlot}
                  onChange={(e) => setSidebarAdSlot(e.target.value)}
                  placeholder="e.g. 1928301923"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Call View Ad Slot ID
                </label>
                <input
                  type="text"
                  value={callViewAdSlot}
                  onChange={(e) => setCallViewAdSlot(e.target.value)}
                  placeholder="e.g. 4829103948"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Ad Preview Box */}
            <div className="p-4 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
                AdSense Placement Live Preview (Header Banner · 728x90)
              </span>
              <div className="h-16 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                <span>Google AdSense · Responsive Ad Container (Slot #{headerAdSlot || 'Sample'})</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Part 2: Custom JavaScript & Tracking Scripts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Header Script */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Code2 className="w-4 h-4 text-[#4F46E5]" />
            Header Scripts (&lt;head&gt;)
          </div>
          <p className="text-[11px] text-slate-500">
            Injected inside the &lt;head&gt; element. Ideal for Google Analytics, Meta Pixel, or font links.
          </p>
          <textarea
            rows={8}
            value={headerScripts}
            onChange={(e) => setHeaderScripts(e.target.value)}
            placeholder="<script async src='https://...'></script>"
            className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>

        {/* Body Script */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Code2 className="w-4 h-4 text-emerald-500" />
            Body Open Scripts (&lt;body&gt;)
          </div>
          <p className="text-[11px] text-slate-500">
            Injected immediately after &lt;body&gt;. Ideal for Google Tag Manager (GTM noscript fallback).
          </p>
          <textarea
            rows={8}
            value={bodyScripts}
            onChange={(e) => setBodyScripts(e.target.value)}
            placeholder="<noscript><iframe src='...'></iframe></noscript>"
            className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>

        {/* Footer Script */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Code2 className="w-4 h-4 text-purple-500" />
            Footer Scripts (&lt;/body&gt;)
          </div>
          <p className="text-[11px] text-slate-500">
            Injected right before &lt;/body&gt;. Ideal for live support chat widgets, Hotjar, or custom event listeners.
          </p>
          <textarea
            rows={8}
            value={footerScripts}
            onChange={(e) => setFooterScripts(e.target.value)}
            placeholder="<script>/* custom JS hook */</script>"
            className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>
      </div>
    </div>
  );
};

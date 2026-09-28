import React, { useState } from 'react';
import {
  Globe,
  DollarSign,
  Palette,
  Clock,
  Image,
  Save,
  Check,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useAdminStore } from '../adminStore';
import { useToast } from '../../../shared/ui/Toast';

export const GlobalSettingsView: React.FC = () => {
  const { globalSettings, updateGlobalSettings } = useAdminStore();
  const { toast } = useToast();

  const [siteName, setSiteName] = useState(globalSettings.siteName);
  const [tagline, setTagline] = useState(globalSettings.tagline);
  const [currencySymbol, setCurrencySymbol] = useState(globalSettings.currencySymbol);
  const [currencyCode, setCurrencyCode] = useState(globalSettings.currencyCode);
  const [currencyPosition, setCurrencyPosition] = useState(globalSettings.currencyPosition);
  const [logoUrl, setLogoUrl] = useState(globalSettings.logoUrl);
  const [faviconUrl, setFaviconUrl] = useState(globalSettings.faviconUrl);
  const [timezone, setTimezone] = useState(globalSettings.timezone);
  const [primaryColor, setPrimaryColor] = useState(globalSettings.primaryColor);
  const [accentColor, setAccentColor] = useState(globalSettings.accentColor);

  const colorPresets = [
    { name: 'Indigo (Default)', color: '#4F46E5' },
    { name: 'Electric Blue', color: '#2563EB' },
    { name: 'Emerald Teal', color: '#059669' },
    { name: 'Royal Violet', color: '#7C3AED' },
    { name: 'Crimson Rose', color: '#E11D48' },
    { name: 'Midnight Slate', color: '#0F172A' },
  ];

  const handleSave = () => {
    updateGlobalSettings({
      siteName,
      tagline,
      currencySymbol,
      currencyCode,
      currencyPosition,
      logoUrl,
      faviconUrl,
      timezone,
      primaryColor,
      accentColor,
    });

    // Apply primary color as CSS variable for real-time app styling
    document.documentElement.style.setProperty('--brand-primary', primaryColor);

    toast({
      type: 'success',
      title: 'Global Settings Saved',
      message: 'Currency, site identity, and theme colors have been updated.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            Global Settings & Config
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure site branding, logos, currency formatting, system timezone, and brand color themes.
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
        {/* Section 1: Site Identity & Branding */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#4F46E5]" />
            Site Identity
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Site / Brand Name
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Platform Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Logo Image URL
              </label>
              <div className="flex gap-2 items-center">
                <img
                  src={logoUrl}
                  alt="Logo Preview"
                  className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Favicon Path / URL
              </label>
              <input
                type="text"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Currency & Regional Localization */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Currency & Regional Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="$"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency Code (ISO)
              </label>
              <input
                type="text"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                placeholder="USD"
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency Symbol Position
              </label>
              <select
                value={currencyPosition}
                onChange={(e) => setCurrencyPosition(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="before">Before Amount ({currencySymbol}9.99)</option>
                <option value="after">After Amount (9.99 {currencySymbol})</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                System Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="UTC">UTC (Universal Coordinated Time)</option>
                <option value="America/New_York">America / New York (EST)</option>
                <option value="America/Los_Angeles">America / Los Angeles (PST)</option>
                <option value="Europe/London">Europe / London (GMT)</option>
                <option value="Europe/Berlin">Europe / Berlin (CET)</option>
                <option value="Africa/Lagos">Africa / Lagos (WAT)</option>
                <option value="Asia/Tokyo">Asia / Tokyo (JST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Site Colours & Styling */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#4F46E5]" />
            Site Color Theme & Live Palette
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Primary Brand Color (Buttons, Badges, Highlights)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs font-mono uppercase rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Color Presets */}
              <div className="mt-3 flex flex-wrap gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.color}
                    type="button"
                    onClick={() => setPrimaryColor(preset.color)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.color }} />
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Accent Glow Color (AI Badges & Notifications)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-12 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs font-mono uppercase rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Live Preview Box */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Live Theme Component Preview
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    style={{ backgroundColor: primaryColor }}
                    className="px-4 py-1.5 rounded-lg text-white text-xs font-bold shadow-xs"
                  >
                    Primary Action Button
                  </button>
                  <span
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                  >
                    Active Nav Badge
                  </span>
                  <span
                    style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Paddy AI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

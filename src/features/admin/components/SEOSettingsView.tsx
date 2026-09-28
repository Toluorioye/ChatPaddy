import React, { useState } from 'react';
import {
  Search,
  Globe,
  Share2,
  FileCode,
  Download,
  Copy,
  Check,
  Save,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAdminStore } from '../adminStore';
import { useToast } from '../../../shared/ui/Toast';
import { Modal } from '../../../shared/ui/Modal';

export const SEOSettingsView: React.FC = () => {
  const { seoSettings, updateSEOSettings, generateSitemap, generateRobotsTxt } = useAdminStore();
  const { toast } = useToast();

  const [metaTitle, setMetaTitle] = useState(seoSettings.metaTitle);
  const [metaDescription, setMetaDescription] = useState(seoSettings.metaDescription);
  const [metaKeywords, setMetaKeywords] = useState(seoSettings.metaKeywords);
  const [metaImageUrl, setMetaImageUrl] = useState(seoSettings.metaImageUrl);
  const [faviconUrl, setFaviconUrl] = useState(seoSettings.faviconUrl);
  const [robotsTxt, setRobotsTxt] = useState(seoSettings.robotsTxt);
  const [sitemapXml, setSitemapXml] = useState(seoSettings.sitemapXml);

  const [isSitemapModalOpen, setIsSitemapModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    updateSEOSettings({
      metaTitle,
      metaDescription,
      metaKeywords,
      metaImageUrl,
      faviconUrl,
      robotsTxt,
      sitemapXml,
    });

    // Update document title dynamically
    if (typeof document !== 'undefined') {
      document.title = metaTitle;
    }

    toast({
      type: 'success',
      title: 'SEO Settings Saved',
      message: 'Meta tags, social preview cards, and search directives updated.',
    });
  };

  const handleGenerateSitemap = () => {
    generateSitemap();
    setSitemapXml(useAdminStore.getState().seoSettings.sitemapXml);
    setIsSitemapModalOpen(true);
    toast({ type: 'success', title: 'Sitemap.xml Generated', message: 'Sitemap indexing updated with all published pages.' });
  };

  const handleGenerateRobots = () => {
    generateRobotsTxt();
    setRobotsTxt(useAdminStore.getState().seoSettings.robotsTxt);
    toast({ type: 'success', title: 'Robots.txt Generated', message: 'Default crawl rules generated.' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ type: 'info', title: 'Copied to clipboard', message: 'Ready to paste.' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            SEO & Search Optimization
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control search engine rankings, OpenGraph social share cards, automated XML sitemaps, and robots crawl directives.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleGenerateSitemap}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-500" />
            Generate Sitemap
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meta Tags Form */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-[#4F46E5]" />
            Meta Tags & Keywords
          </h2>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Meta Title Tag
              </label>
              <span className={`text-[10px] ${metaTitle.length > 60 ? 'text-amber-500' : 'text-slate-400'}`}>
                {metaTitle.length}/60 chars recommended
              </span>
            </div>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Meta Description
              </label>
              <span className={`text-[10px] ${metaDescription.length > 160 ? 'text-amber-500' : 'text-slate-400'}`}>
                {metaDescription.length}/160 chars recommended
              </span>
            </div>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Meta Keywords (comma separated)
            </label>
            <input
              type="text"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder="chat, realtime, voice calls, messaging"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                OpenGraph Share Image URL
              </label>
              <input
                type="text"
                value={metaImageUrl}
                onChange={(e) => setMetaImageUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Favicon URL
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

        {/* Live Social Share Card Preview & Google SERP Snippet */}
        <div className="space-y-6">
          {/* Google Search Result Preview */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Google Search Result Snippet
            </span>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
              <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                <span>https://chatpaddy.com</span>
                <span className="text-slate-400">›</span>
              </div>
              <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1">
                {metaTitle || 'ChatPaddy — Modern Real-Time Chat'}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {metaDescription || 'Real-time messaging, audio calls, video collaboration and AI Co-Pilot.'}
              </p>
            </div>
          </div>

          {/* Twitter / OpenGraph Card Preview */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[#4F46E5]" />
              Social Card Preview (X / WhatsApp / LinkedIn)
            </span>
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
              <img
                src={metaImageUrl}
                alt="OG Preview"
                className="w-full h-36 object-cover bg-slate-200"
              />
              <div className="p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  chatpaddy.com
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {metaTitle}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {metaDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Robots.txt Directive Editor */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#4F46E5]" />
              Robots.txt Crawler Directives
            </h2>
            <button
              onClick={handleGenerateRobots}
              className="text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Default Rules
            </button>
          </div>

          <textarea
            rows={5}
            value={robotsTxt}
            onChange={(e) => setRobotsTxt(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>
      </div>

      {/* Sitemap Modal */}
      {isSitemapModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsSitemapModalOpen(false)}
          title="Generated Sitemap.xml"
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              The sitemap has been compiled with all published pages, priority weights, and today's timestamp.
            </p>

            <textarea
              readOnly
              rows={12}
              value={sitemapXml}
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 focus:outline-none"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 font-mono">Location: /sitemap.xml</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(sitemapXml)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy XML'}
                </button>
                <button
                  onClick={() => setIsSitemapModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#4F46E5] text-white cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Languages,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Globe,
  Save,
  X,
} from 'lucide-react';
import { useAdminStore } from '../adminStore';
import { useToast } from '../../../shared/ui/Toast';
import { Modal } from '../../../shared/ui/Modal';

export const LanguageManager: React.FC = () => {
  const {
    languages,
    defaultLanguage,
    dictionary,
    toggleLanguage,
    setDefaultLanguage,
    addLanguageKeyword,
    deleteLanguageKeyword,
    editLanguageKeyword,
  } = useAdminStore();
  const { toast } = useToast();

  const [selectedLang, setSelectedLang] = useState(defaultLanguage || 'en');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddKeyOpen, setIsAddKeyOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const currentDict = dictionary[selectedLang] || {};
  const currentKeys = Object.keys(currentDict);

  const filteredKeys = currentKeys.filter(
    (k) =>
      k.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (currentDict[k] || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddKeyword = () => {
    if (!newKey.trim() || !newValue.trim()) {
      toast({ type: 'error', title: 'Missing fields', message: 'Keyword key and value are required.' });
      return;
    }
    addLanguageKeyword(selectedLang, newKey.trim(), newValue.trim());
    toast({ type: 'success', title: 'Keyword Added', message: `Added "${newKey}" to ${selectedLang}.` });
    setNewKey('');
    setNewValue('');
    setIsAddKeyOpen(false);
  };

  const handleDeleteKeyword = (k: string) => {
    if (confirm(`Delete keyword "${k}" from ${selectedLang}?`)) {
      deleteLanguageKeyword(selectedLang, k);
      toast({ type: 'info', title: 'Keyword Deleted', message: `Removed key "${k}".` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            Manage Languages & Translations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure platform localization, manage language packs, and edit keyword translation pairs.
          </p>
        </div>

        <button
          onClick={() => setIsAddKeyOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Keyword
        </button>
      </div>

      {/* Installed Languages List */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#4F46E5]" />
          Supported Language Packs
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {languages.map((lang) => {
            const isDefault = lang.code === defaultLanguage;
            return (
              <div
                key={lang.code}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  selectedLang === lang.code
                    ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">
                      {lang.name}
                    </span>
                    <span className="text-[11px] text-slate-500">{lang.nativeName} ({lang.code})</span>
                  </div>

                  {isDefault ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4F46E5] text-white">
                      Default
                    </span>
                  ) : (
                    <button
                      onClick={() => setDefaultLanguage(lang.code)}
                      className="text-[10px] font-semibold text-slate-500 hover:text-[#4F46E5] cursor-pointer"
                    >
                      Make Default
                    </button>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setSelectedLang(lang.code)}
                    className="font-semibold text-[#4F46E5] hover:underline cursor-pointer"
                  >
                    Edit Keywords →
                  </button>

                  <button
                    onClick={() => toggleLanguage(lang.code)}
                    className={`text-[11px] font-semibold cursor-pointer ${
                      lang.enabled ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {lang.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keywords Translation Dictionary */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Languages className="w-4 h-4 text-[#4F46E5]" />
              Translation Keywords ({languages.find((l) => l.code === selectedLang)?.name})
            </h2>
            <p className="text-xs text-slate-500">
              Manage key-value strings used across the entire frontend application.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search key or value..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500">
                <th className="py-2.5 px-4 font-semibold w-1/3">Keyword (Key)</th>
                <th className="py-2.5 px-4 font-semibold">Localized String (Value)</th>
                <th className="py-2.5 px-4 font-semibold text-right w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-400">
                    No keywords matching your search.
                  </td>
                </tr>
              ) : (
                filteredKeys.map((key) => (
                  <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">
                      {key}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={currentDict[key] || ''}
                        onChange={(e) => editLanguageKeyword(selectedLang, key, e.target.value)}
                        className="w-full px-2.5 py-1 text-xs rounded-lg bg-transparent border border-transparent hover:border-slate-200 focus:border-[#4F46E5] focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteKeyword(key)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Keyword Modal */}
      {isAddKeyOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddKeyOpen(false)}
          title={`Add Translation Key to ${selectedLang.toUpperCase()}`}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Keyword Identifier (Key) *
              </label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g. auth.welcome_heading"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Translated Text (Value) *
              </label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g. Welcome back to ChatPaddy!"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddKeyOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddKeyword}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] text-white hover:bg-indigo-700 cursor-pointer shadow-xs"
              >
                Save Keyword
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

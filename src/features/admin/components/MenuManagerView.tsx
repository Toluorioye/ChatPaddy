import React, { useState } from 'react';
import {
  Menu,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Save,
  Check,
  Layout,
  Copyright,
} from 'lucide-react';
import { useAdminStore, MenuItem, FooterColumn } from '../adminStore';
import { useToast } from '../../../shared/ui/Toast';
import { Modal } from '../../../shared/ui/Modal';

export const MenuManagerView: React.FC = () => {
  const {
    menuItems,
    footerColumns,
    footerCopyright,
    addMenuItem,
    editMenuItem,
    deleteMenuItem,
    updateFooterCopyright,
    updateFooterColumns,
  } = useAdminStore();
  const { toast } = useToast();

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(false);

  const [localCopyright, setLocalCopyright] = useState(footerCopyright);
  const [localColumns, setLocalColumns] = useState<FooterColumn[]>(footerColumns);

  const openAddModal = () => {
    setLabel('');
    setUrl('');
    setOpenInNewTab(false);
    setEditingItem(null);
    setIsAddMenuOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setLabel(item.label);
    setUrl(item.url);
    setOpenInNewTab(item.openInNewTab);
    setEditingItem(item);
    setIsAddMenuOpen(true);
  };

  const handleSaveMenuItem = () => {
    if (!label.trim() || !url.trim()) {
      toast({ type: 'error', title: 'Missing fields', message: 'Label and target URL are required.' });
      return;
    }

    if (editingItem) {
      editMenuItem(editingItem.id, { label, url, openInNewTab });
      toast({ type: 'success', title: 'Menu Item Updated', message: `Saved changes to "${label}".` });
    } else {
      addMenuItem({
        label,
        url,
        openInNewTab,
        order: menuItems.length + 1,
      });
      toast({ type: 'success', title: 'Menu Item Added', message: `"${label}" added to main navigation.` });
    }
    setIsAddMenuOpen(false);
  };

  const handleDeleteItem = (item: MenuItem) => {
    if (confirm(`Remove "${item.label}" from navigation menu?`)) {
      deleteMenuItem(item.id);
      toast({ type: 'info', title: 'Menu Item Deleted', message: `Removed "${item.label}".` });
    }
  };

  const handleSaveFooter = () => {
    updateFooterCopyright(localCopyright);
    updateFooterColumns(localColumns);
    toast({ type: 'success', title: 'Footer Layout Saved', message: 'Footer columns and copyright notice updated.' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            Menu & Navigation Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Customize header navigation links, sidebar order, footer directory columns, and copyright statements.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Navigation Link
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Navigation Menu Items List */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Menu className="w-4 h-4 text-[#4F46E5]" />
              Primary Header & Sidebar Navigation
            </h2>
            <span className="text-xs text-slate-400">{menuItems.length} Links</span>
          </div>

          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      {item.label}
                      {item.openInNewTab && <ExternalLink className="w-3 h-3 text-slate-400" />}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{item.url}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#4F46E5] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Layout & Copyright Editor */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layout className="w-4 h-4 text-emerald-600" />
              Footer Layout & Copyright
            </h2>
            <button
              onClick={handleSaveFooter}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Footer
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Footer Copyright Notice
            </label>
            <input
              type="text"
              value={localCopyright}
              onChange={(e) => setLocalCopyright(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Configured Footer Columns ({localColumns.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {localColumns.map((col, idx) => (
                <div
                  key={col.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5"
                >
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    {col.title}
                  </span>
                  <div className="space-y-0.5">
                    {col.links.map((link, lIdx) => (
                      <span key={lIdx} className="block text-[11px] text-slate-500 truncate">
                        • {link.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Menu Item Modal */}
      {isAddMenuOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddMenuOpen(false)}
          title={editingItem ? `Edit: ${editingItem.label}` : 'Add Navigation Menu Link'}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Link Label *
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Help Center"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Destination URL / Route *
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. /help or https://..."
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="newTab"
                checked={openInNewTab}
                onChange={(e) => setOpenInNewTab(e.target.checked)}
                className="w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5]"
              />
              <label htmlFor="newTab" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                Open in new browser tab (_blank)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsAddMenuOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMenuItem}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] text-white hover:bg-indigo-700 cursor-pointer shadow-xs"
              >
                Save Link
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  Search,
  ExternalLink,
  Globe,
  Calendar,
  X,
  Save,
} from 'lucide-react';
import { useAdminStore, AdminPage } from '../adminStore';
import { useToast } from '../../../shared/ui/Toast';
import { Modal } from '../../../shared/ui/Modal';

export const PageContentsManager: React.FC = () => {
  const { pages, addPage, editPage, deletePage } = useAdminStore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingPage, setEditingPage] = useState<AdminPage | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewingPage, setPreviewingPage] = useState<AdminPage | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setTitle('');
    setSlug('');
    setContent('# New Page Title\n\nEnter formatted page content here...');
    setExcerpt('');
    setMetaTitle('');
    setMetaDescription('');
    setStatus('published');
    setEditingPage(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (page: AdminPage) => {
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setExcerpt(page.excerpt);
    setMetaTitle(page.metaTitle);
    setMetaDescription(page.metaDescription);
    setStatus(page.status);
    setEditingPage(page);
    setIsCreateOpen(true);
  };

  const handleSavePage = () => {
    if (!title.trim() || !slug.trim()) {
      toast({ type: 'error', title: 'Missing required fields', message: 'Page title and slug are required.' });
      return;
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-');

    if (editingPage) {
      editPage(editingPage.id, {
        title,
        slug: cleanSlug,
        content,
        excerpt,
        metaTitle: metaTitle || `${title} | ChatPaddy`,
        metaDescription: metaDescription || excerpt,
        status,
      });
      toast({ type: 'success', title: 'Page Updated', message: `Saved changes to "${title}".` });
    } else {
      addPage({
        title,
        slug: cleanSlug,
        content,
        excerpt,
        metaTitle: metaTitle || `${title} | ChatPaddy`,
        metaDescription: metaDescription || excerpt,
        status,
        author: 'Admin Team',
      });
      toast({ type: 'success', title: 'Page Created', message: `"${title}" has been created successfully.` });
    }

    setIsCreateOpen(false);
  };

  const handleDeletePage = (page: AdminPage) => {
    if (confirm(`Are you sure you want to permanently delete "${page.title}"?`)) {
      deletePage(page.id);
      toast({ type: 'info', title: 'Page Deleted', message: `Removed "${page.title}".` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            Page Contents & CMS
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create, edit, preview, and publish customized content pages, policy documents, and landing resources.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Page
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search pages by title or slug..."
          className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-slate-900 dark:text-white"
        />
      </div>

      {/* Pages Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500">
                <th className="py-3.5 px-4 font-semibold">Page Title</th>
                <th className="py-3.5 px-4 font-semibold">URL Path</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Last Updated</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[#4F46E5] shrink-0" />
                      <div>
                        <div>{page.title}</div>
                        <div className="text-[11px] text-slate-400 font-normal line-clamp-1">{page.excerpt}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    /{page.slug}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        page.status === 'published'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {page.status === 'published' ? '● Published' : '○ Draft'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewingPage(page)}
                        title="Preview Page"
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(page)}
                        title="Edit Page"
                        className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-[#4F46E5] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePage(page)}
                        title="Delete Page"
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Page Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={editingPage ? `Edit: ${editingPage.title}` : 'Add New Content Page'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Page Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!editingPage) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
                  }
                }}
                placeholder="e.g. Terms of Service"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                URL Slug *
              </label>
              <div className="flex items-center">
                <span className="px-2.5 py-2 text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700">
                  /
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="terms"
                  className="w-full px-3 py-2 text-xs rounded-r-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Short Excerpt
            </label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief 1-sentence summary of the page..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Page Content (Markdown & HTML supported) *
            </label>
            <textarea
              rows={9}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write page content in markdown format..."
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SEO Meta Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Title tag for search engines"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="published">Published (Public)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePage}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Live Preview Modal */}
      {previewingPage && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewingPage(null)}
          title={`Preview: ${previewingPage.title}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="font-mono">URL: https://chatpaddy.com/{previewingPage.slug}</span>
              <span className="font-semibold text-emerald-600">● {previewingPage.status}</span>
            </div>

            <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <h1 className="text-xl font-heading font-extrabold mb-2">{previewingPage.title}</h1>
              <p className="text-slate-400 italic mb-4">{previewingPage.excerpt}</p>
              <div className="whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200">
                {previewingPage.content}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewingPage(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#4F46E5] text-white cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

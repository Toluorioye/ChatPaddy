import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Save,
  Check,
  Eye,
  Type,
  Mail,
  Lock,
  Phone,
  Calendar,
  Globe,
  FileText,
  CheckSquare,
  Upload,
  User,
  AtSign,
  Shield,
  HelpCircle,
  Sparkles,
  MapPin,
  Share2,
  ToggleLeft,
  List,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { useAdminStore, FormField } from '../adminStore';
import { useToast } from '../../../shared/ui/Toast';
import { Modal } from '../../../shared/ui/Modal';

// Comprehensive 40+ Field Types Palette
const FIELD_PALETTE: {
  type: string;
  label: string;
  category: FormField['category'];
  icon: string;
  placeholder: string;
  options?: string[];
}[] = [
  // Basic
  { type: 'text', label: 'Single Line Text', category: 'basic', icon: 'Type', placeholder: 'Enter text...' },
  { type: 'textarea', label: 'Multi-line Textarea', category: 'basic', icon: 'FileText', placeholder: 'Enter longer description...' },
  { type: 'email', label: 'Email Address', category: 'basic', icon: 'Mail', placeholder: 'name@example.com' },
  { type: 'password', label: 'Secure Password', category: 'basic', icon: 'Lock', placeholder: '••••••••' },
  { type: 'number', label: 'Number Input', category: 'basic', icon: 'Hash', placeholder: '0' },
  { type: 'tel', label: 'Phone Number', category: 'basic', icon: 'Phone', placeholder: '+1 (555) 000-0000' },
  { type: 'url', label: 'Website URL', category: 'basic', icon: 'Globe', placeholder: 'https://' },

  // Selection
  { type: 'select', label: 'Dropdown Select', category: 'selection', icon: 'List', placeholder: 'Choose an option', options: ['Option 1', 'Option 2', 'Option 3'] },
  { type: 'radio', label: 'Radio Button Group', category: 'selection', icon: 'CheckSquare', placeholder: '', options: ['Choice A', 'Choice B'] },
  { type: 'checkbox', label: 'Single Checkbox', category: 'selection', icon: 'CheckSquare', placeholder: '' },
  { type: 'multiselect', label: 'Multi-Select Tags', category: 'selection', icon: 'List', placeholder: 'Select multiple...', options: ['Tech', 'Design', 'Marketing', 'Founder'] },
  { type: 'toggle', label: 'Boolean Toggle Switch', category: 'selection', icon: 'ToggleLeft', placeholder: '' },
  { type: 'rating', label: 'Star Rating Widget', category: 'selection', icon: 'Sparkles', placeholder: '5-star' },

  // Profile & Identity
  { type: 'display_name', label: 'Display Name', category: 'profile', icon: 'User', placeholder: 'Your Name' },
  { type: 'username', label: 'Unique Username', category: 'profile', icon: 'AtSign', placeholder: 'handle_dev' },
  { type: 'full_name', label: 'Legal Full Name', category: 'profile', icon: 'User', placeholder: 'First and Last' },
  { type: 'avatar', label: 'Avatar Image Picker', category: 'profile', icon: 'Upload', placeholder: 'Upload profile photo' },
  { type: 'bio', label: 'Short Bio', category: 'profile', icon: 'FileText', placeholder: 'Tell us about yourself...' },
  { type: 'dob', label: 'Date of Birth', category: 'profile', icon: 'Calendar', placeholder: 'YYYY-MM-DD' },
  { type: 'gender', label: 'Gender / Identity', category: 'profile', icon: 'User', placeholder: 'Select gender', options: ['Prefer not to say', 'Female', 'Male', 'Non-binary', 'Custom'] },
  { type: 'pronouns', label: 'Pronouns', category: 'profile', icon: 'AtSign', placeholder: 'they/them, she/her, he/him' },

  // Location & Contact
  { type: 'country', label: 'Country Selector', category: 'location', icon: 'Globe', placeholder: 'Select Country', options: ['United States', 'United Kingdom', 'Nigeria', 'Canada', 'Germany', 'Brazil', 'Other'] },
  { type: 'state', label: 'State / Province', category: 'location', icon: 'MapPin', placeholder: 'e.g. California / Lagos' },
  { type: 'city', label: 'City', category: 'location', icon: 'MapPin', placeholder: 'City name' },
  { type: 'postal', label: 'Postal / ZIP Code', category: 'location', icon: 'MapPin', placeholder: '10001' },
  { type: 'address', label: 'Street Address', category: 'location', icon: 'MapPin', placeholder: '123 Main St, Suite 400' },
  { type: 'timezone', label: 'Timezone Picker', category: 'location', icon: 'Globe', placeholder: 'Auto-detect UTC' },
  { type: 'language', label: 'Preferred Language', category: 'location', icon: 'Globe', placeholder: 'Select language', options: ['English', 'Spanish', 'French', 'German', 'Yoruba'] },

  // Media & Files
  { type: 'file_doc', label: 'Document / PDF Upload', category: 'media', icon: 'Upload', placeholder: 'Upload PDF/Doc' },
  { type: 'portfolio', label: 'Portfolio / GitHub Link', category: 'media', icon: 'Globe', placeholder: 'https://github.com/...' },
  { type: 'id_verification', label: 'Government ID Document', category: 'media', icon: 'Shield', placeholder: 'Passport / Driver License' },

  // Social Links
  { type: 'twitter', label: 'Twitter / X Handle', category: 'social', icon: 'Share2', placeholder: '@username' },
  { type: 'linkedin', label: 'LinkedIn Profile', category: 'social', icon: 'Share2', placeholder: 'linkedin.com/in/...' },
  { type: 'discord', label: 'Discord Tag', category: 'social', icon: 'Share2', placeholder: 'user#0000' },
  { type: 'telegram', label: 'Telegram Handle', category: 'social', icon: 'Share2', placeholder: '@telegram_user' },

  // Security & Legal
  { type: 'terms_agree', label: 'Terms of Service Consent', category: 'security', icon: 'CheckSquare', placeholder: 'I agree to the Terms & Privacy Policy' },
  { type: 'age_verify', label: 'Age Confirmation (18+)', category: 'security', icon: 'Shield', placeholder: 'I confirm that I am at least 18 years old' },
  { type: 'marketing_optin', label: 'Marketing Newsletter Opt-In', category: 'security', icon: 'Mail', placeholder: 'Send me product announcements and updates' },
  { type: 'captcha', label: 'Captcha Verification Widget', category: 'security', icon: 'Shield', placeholder: 'Cloudflare Turnstile / reCAPTCHA' },

  // Layout Widgets
  { type: 'heading', label: 'Section Header Widget', category: 'layout', icon: 'Type', placeholder: 'Step 1: Account Information' },
  { type: 'divider', label: 'Visual Divider Line', category: 'layout', icon: 'Layers', placeholder: '---' },
  { type: 'info_box', label: 'Informational Alert Box', category: 'layout', icon: 'AlertCircle', placeholder: 'We respect your privacy. No spam ever.' },
];

export const FormBuilderView: React.FC = () => {
  const { formFields, addFormField, editFormField, deleteFormField, reorderFormFields } = useAdminStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit Field state
  const [editLabel, setEditLabel] = useState('');
  const [editPlaceholder, setEditPlaceholder] = useState('');
  const [editHelpText, setEditHelpText] = useState('');
  const [editRequired, setEditRequired] = useState(false);

  const categories = [
    { id: 'all', label: 'All 40+ Widgets' },
    { id: 'basic', label: 'Basic Inputs' },
    { id: 'selection', label: 'Selection' },
    { id: 'profile', label: 'Profile' },
    { id: 'location', label: 'Location' },
    { id: 'media', label: 'Media & Docs' },
    { id: 'social', label: 'Social' },
    { id: 'security', label: 'Security & Legal' },
    { id: 'layout', label: 'Layout Widgets' },
  ];

  const filteredPalette = FIELD_PALETTE.filter(
    (f) => selectedCategory === 'all' || f.category === selectedCategory
  );

  const handleAddFieldFromPalette = (item: typeof FIELD_PALETTE[0]) => {
    addFormField({
      type: item.type,
      label: item.label,
      placeholder: item.placeholder,
      helpText: '',
      required: item.category === 'security' || item.type === 'email' || item.type === 'password',
      icon: item.icon,
      category: item.category,
      options: item.options,
    });
    toast({ type: 'success', title: 'Field Added', message: `Added "${item.label}" to registration form.` });
  };

  const openEditModal = (field: FormField) => {
    setEditingField(field);
    setEditLabel(field.label);
    setEditPlaceholder(field.placeholder);
    setEditHelpText(field.helpText || '');
    setEditRequired(field.required);
    setIsEditOpen(true);
  };

  const handleSaveFieldEdit = () => {
    if (!editingField) return;
    editFormField(editingField.id, {
      label: editLabel,
      placeholder: editPlaceholder,
      helpText: editHelpText,
      required: editRequired,
    });
    toast({ type: 'success', title: 'Field Saved', message: `Updated configuration for "${editLabel}".` });
    setIsEditOpen(false);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < formFields.length) {
      reorderFormFields(index, targetIndex);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
            Registration Form Builder
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Build bespoke user onboarding forms with 40+ block types, drag/reorder controls, and instant live preview.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'builder'
                ? 'bg-white dark:bg-slate-700 text-[#4F46E5] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Form Canvas ({formFields.length})
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-700 text-[#4F46E5] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview
          </button>
        </div>
      </div>

      {activeTab === 'builder' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Canvas: Configured Form Fields */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#4F46E5]" />
                  Active Form Flow
                </h2>
                <p className="text-xs text-slate-500">
                  Reorder and customize the fields displayed to new users during sign up.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600">
                {formFields.filter((f) => f.required).length} Required Fields
              </span>
            </div>

            <div className="space-y-2.5">
              {formFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 group hover:border-[#4F46E5]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        disabled={index === 0}
                        onClick={() => moveField(index, 'up')}
                        className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        disabled={index === formFields.length - 1}
                        onClick={() => moveField(index, 'down')}
                        className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {field.label}
                        </span>
                        {field.required && (
                          <span className="text-[10px] font-bold text-rose-500">*Required</span>
                        )}
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {field.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 line-clamp-1">
                        Placeholder: "{field.placeholder || '(none)'}"
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(field)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#4F46E5] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        deleteFormField(field.id);
                        toast({ type: 'info', title: 'Field Removed', message: `Deleted ${field.label}.` });
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Palette: 40+ Click-to-Add Form Fields */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#4F46E5]" />
                Widget Palette (40+ Fields)
              </h2>
              <p className="text-xs text-slate-500">Click any block to append to registration form.</p>
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-1 pb-1">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors cursor-pointer ${
                    selectedCategory === c.id
                      ? 'bg-[#4F46E5] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredPalette.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddFieldFromPalette(item)}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-indigo-950/30 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-400 flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#4F46E5]">
                      {item.label}
                    </span>
                    <span className="text-[9px] uppercase px-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 font-mono">
                      {item.category}
                    </span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#4F46E5]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Live Registration Form Preview */
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
              Create your ChatPaddy Account
            </h2>
            <p className="text-xs text-slate-500">
              Interactive preview rendered directly from the configured fields above.
            </p>
          </div>

          <div className="space-y-4">
            {formFields.map((field) => (
              <div key={field.id} className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {field.label} {field.required && <span className="text-rose-500">*</span>}
                </label>

                {field.type === 'textarea' || field.type === 'bio' ? (
                  <textarea
                    rows={3}
                    placeholder={field.placeholder}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                ) : field.type === 'select' || field.type === 'country' || field.type === 'gender' ? (
                  <select className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]">
                    <option value="">{field.placeholder || 'Select...'}</option>
                    {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' || field.type === 'terms_agree' || field.type === 'age_verify' ? (
                  <div className="flex items-center gap-2 pt-1">
                    <input type="checkbox" id={field.id} className="w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5]" />
                    <label htmlFor={field.id} className="text-xs text-slate-600 dark:text-slate-400">
                      {field.placeholder || field.label}
                    </label>
                  </div>
                ) : (
                  <input
                    type={field.type === 'password' ? 'password' : 'text'}
                    placeholder={field.placeholder}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                )}
              </div>
            ))}

            <button
              type="button"
              className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              Complete Registration
            </button>
          </div>
        </div>
      )}

      {/* Edit Field Modal */}
      {isEditOpen && editingField && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditOpen(false)}
          title={`Edit Field: ${editingField.label}`}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Field Label *
              </label>
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Placeholder Text
              </label>
              <input
                type="text"
                value={editPlaceholder}
                onChange={(e) => setEditPlaceholder(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="reqCheck"
                checked={editRequired}
                onChange={(e) => setEditRequired(e.target.checked)}
                className="w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5]"
              />
              <label htmlFor="reqCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Mark as Mandatory / Required Field
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFieldEdit}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#4F46E5] text-white hover:bg-indigo-700 cursor-pointer shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

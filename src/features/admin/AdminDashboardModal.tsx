import React, { useState } from 'react';
import {
  ShieldAlert,
  BarChart3,
  ToggleLeft,
  FileText,
  Settings,
  Search,
  Code2,
  Lock,
  Languages,
  Menu as MenuIcon,
  Layers,
  Smartphone,
  Users,
  ShieldCheck,
  Megaphone,
  BellRing,
  Mail,
  Coins,
  X,
  ChevronDown,
} from 'lucide-react';
import { Modal } from '../../shared/ui/Modal';
import { AdminOverview } from './components/AdminOverview';
import { FeatureManagerView } from './components/FeatureManagerView';
import { PageContentsManager } from './components/PageContentsManager';
import { GlobalSettingsView } from './components/GlobalSettingsView';
import { SEOSettingsView } from './components/SEOSettingsView';
import { CustomScriptsView } from './components/CustomScriptsView';
import { BruteForceSecurityView } from './components/BruteForceSecurityView';
import { LanguageManager } from './components/LanguageManager';
import { MenuManagerView } from './components/MenuManagerView';
import { FormBuilderView } from './components/FormBuilderView';
import { PWASettingsView } from './components/PWASettingsView';
import { UsersManagementView } from './components/UsersManagementView';
import { RoleManagementView } from './components/RoleManagementView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { MassNotificationsView } from './components/MassNotificationsView';
import { SMTPSettingsView } from './components/SMTPSettingsView';
import { ReferralManagementView } from './components/ReferralManagementView';
import { useAuthStore } from '../auth/authStore';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export type AdminTab =
  | 'overview'
  | 'features'
  | 'pages'
  | 'global_settings'
  | 'seo'
  | 'custom_scripts'
  | 'security'
  | 'languages'
  | 'menu'
  | 'form_builder'
  | 'pwa'
  | 'users'
  | 'roles'
  | 'announcements'
  | 'notifications'
  | 'smtp'
  | 'referrals';

interface NavSection {
  title: string;
  items: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Core & Architecture',
    items: [
      { id: 'overview', label: 'Admin Overview', icon: BarChart3 },
      { id: 'features', label: 'Feature Manager', icon: ToggleLeft },
    ],
  },
  {
    title: 'Site Setup & CMS',
    items: [
      { id: 'pages', label: 'Page Contents', icon: FileText },
      { id: 'menu', label: 'Menu & Footer', icon: MenuIcon },
      { id: 'form_builder', label: 'Form Builder', icon: Layers },
    ],
  },
  {
    title: 'Global Setup & Config',
    items: [
      { id: 'global_settings', label: 'Global Settings', icon: Settings },
      { id: 'seo', label: 'SEO Settings', icon: Search },
      { id: 'custom_scripts', label: 'Scripts & AdSense', icon: Code2 },
      { id: 'security', label: 'Brute Force & ACL', icon: Lock },
      { id: 'languages', label: 'Manage Languages', icon: Languages },
      { id: 'pwa', label: 'PWA Settings', icon: Smartphone },
    ],
  },
  {
    title: 'Users & Access Control',
    items: [
      { id: 'users', label: 'Users Management', icon: Users },
      { id: 'roles', label: 'Role Management', icon: ShieldCheck },
    ],
  },
  {
    title: 'Comms & Growth',
    items: [
      { id: 'announcements', label: 'Announcements', icon: Megaphone },
      { id: 'notifications', label: 'Mass Notifications', icon: BellRing },
      { id: 'smtp', label: 'Email SMTP', icon: Mail },
      { id: 'referrals', label: 'Referral System', icon: Coins },
    ],
  },
];

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  isAdmin: propIsAdmin,
}) => {
  const { isAdmin: storeIsAdmin } = useAuthStore();
  const isAdmin = propIsAdmin !== undefined ? propIsAdmin : storeIsAdmin;

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Flat list of all tabs for quick lookup
  const allNavItems = NAV_SECTIONS.flatMap((s) => s.items);
  const currentItem = allNavItems.find((i) => i.id === activeTab) || allNavItems[0];
  const CurrentIcon = currentItem.icon;

  if (!isAdmin) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={true}>
        <div className="flex flex-col items-center text-center p-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Admin Privileges Required</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-sm">
              You do not have administrative permissions to view or manage the Admin Control Hub. This portal is restricted to authorized platform administrators.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-[#4F46E5] text-white hover:bg-indigo-600 transition-colors cursor-pointer"
          >
            Return to Chats
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" showCloseButton={false}>
      <div className="flex h-full flex-col -m-4 sm:-m-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131A2E] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  Admin Control Hub
                </h2>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  Master Console
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                Full site configuration, analytics, access control, and monetization engine.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Exit
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Admin Modal"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Responsive Navigation Selector Bar (Visible < lg) */}
        <div className="lg:hidden px-3.5 py-2.5 bg-slate-100 dark:bg-[#0E1526] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <CurrentIcon className="w-4 h-4 text-[#4F46E5] shrink-0" />
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {currentItem.label}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <span>{mobileMenuOpen ? 'Close Menu' : 'Switch Module'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile Menu Dropdown Accordion */}
        {mobileMenuOpen && (
          <div className="lg:hidden max-h-72 overflow-y-auto bg-white dark:bg-[#131A2E] border-b border-slate-200 dark:border-slate-800 p-3 space-y-3 z-30 shadow-lg shrink-0 animate-in slide-in-from-top-2">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  {section.title}
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-left cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-[#4F46E5] text-white'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Body Layout: Sidebar Navigation + Content Canvas */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar Nav (Visible on lg+) */}
          <aside className="hidden lg:block w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0E1526] p-4 overflow-y-auto shrink-0 space-y-6">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1">
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                  {section.title}
                </span>

                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                          isActive
                            ? 'bg-[#4F46E5] text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </aside>

          {/* Main Content Area: full width on mobile/tablet, flex-1 on desktop */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 bg-slate-50/30 dark:bg-[#0E1526]/40">
            {activeTab === 'overview' && <AdminOverview />}
            {activeTab === 'features' && <FeatureManagerView />}
            {activeTab === 'pages' && <PageContentsManager />}
            {activeTab === 'global_settings' && <GlobalSettingsView />}
            {activeTab === 'seo' && <SEOSettingsView />}
            {activeTab === 'custom_scripts' && <CustomScriptsView />}
            {activeTab === 'security' && <BruteForceSecurityView />}
            {activeTab === 'languages' && <LanguageManager />}
            {activeTab === 'menu' && <MenuManagerView />}
            {activeTab === 'form_builder' && <FormBuilderView />}
            {activeTab === 'pwa' && <PWASettingsView />}
            {activeTab === 'users' && <UsersManagementView onExitAdminToChat={onClose} />}
            {activeTab === 'roles' && <RoleManagementView />}
            {activeTab === 'announcements' && <AnnouncementsView />}
            {activeTab === 'notifications' && <MassNotificationsView />}
            {activeTab === 'smtp' && <SMTPSettingsView />}
            {activeTab === 'referrals' && <ReferralManagementView />}
          </main>
        </div>
      </div>
    </Modal>
  );
};

import { create } from 'zustand';

export interface FeatureItem {
  id: string;
  name: string;
  description: string;
  category: 'messaging' | 'calls' | 'ai' | 'monetization' | 'security' | 'general';
  enabled: boolean;
  iconName: string;
}

export interface AdminPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  status: 'published' | 'draft';
  updatedAt: string;
  author: string;
}

export interface GlobalSettings {
  siteName: string;
  tagline: string;
  currencySymbol: string;
  currencyCode: string;
  currencyPosition: 'before' | 'after';
  logoUrl: string;
  faviconUrl: string;
  timezone: string;
  primaryColor: string;
  accentColor: string;
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  metaImageUrl: string;
  faviconUrl: string;
  robotsTxt: string;
  sitemapXml: string;
}

export interface CustomScripts {
  headerScripts: string;
  bodyScripts: string;
  footerScripts: string;
  adsense: {
    enabled: boolean;
    publisherId: string;
    autoAds: boolean;
    headerAdSlot: string;
    sidebarAdSlot: string;
    callViewAdSlot: string;
  };
}

export interface BruteForceSettings {
  maxBadLoginAttempts: number;
  lockoutDurationMinutes: number;
  enableCaptchaAfterAttempts: number;
  ipWhitelist: string;
  ipBlacklist: string;
}

export interface LanguageItem {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
  enabled: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  openInNewTab: boolean;
  order: number;
  icon?: string;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: { label: string; url: string }[];
}

export interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  helpText?: string;
  required: boolean;
  icon: string;
  category: 'basic' | 'selection' | 'profile' | 'location' | 'media' | 'social' | 'security' | 'layout';
  options?: string[];
}

export interface PWASettings {
  appName: string;
  shortName: string;
  themeColor: string;
  backgroundColor: string;
  displayMode: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  startUrl: string;
  cachingStrategy: 'cacheFirst' | 'networkFirst' | 'staleWhileRevalidate';
  icon192: string;
  icon512: string;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'suspended' | 'banned';
  avatar: string;
  creditsBalance: number;
  joinedAt: string;
  lastLogin: string;
  banReason?: string;
  suspensionEnd?: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  color: string;
  isSystem: boolean;
  userCount: number;
  permissions: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'banner' | 'modal' | 'toast';
  priority: 'info' | 'warning' | 'critical' | 'success';
  targetAudience: 'all' | 'free' | 'premium';
  active: boolean;
  startDate: string;
  actionText?: string;
  actionUrl?: string;
}

export interface MassNotification {
  id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'active_7d' | 'premium' | 'admins';
  channels: ('in_app' | 'email' | 'push')[];
  sentAt: string;
  sentCount: number;
  readCount: number;
  status: 'sent' | 'scheduled' | 'draft';
}

export interface SMTPSettings {
  id: string;
  name: string;
  host: string;
  port: number;
  encryption: 'tls' | 'ssl' | 'none';
  username: string;
  password?: string;
  fromName: string;
  fromEmail: string;
  isDefault: boolean;
  lastTestedAt?: string;
  testStatus?: 'success' | 'failed';
}

export interface ReferralSettings {
  enabled: boolean;
  commissionType: 'flat' | 'percentage';
  commissionRate: number;
  minimumPayout: number;
  cookieDurationDays: number;
  totalReferrals: number;
  totalPaidOut: number;
  pendingPayouts: number;
  topReferrers: {
    id: string;
    name: string;
    code: string;
    referralsCount: number;
    earnings: number;
  }[];
}

// ----------------------------------------------------
// DEFAULT SEED DATA
// ----------------------------------------------------

const INITIAL_FEATURES: FeatureItem[] = [
  {
    id: 'enable_chat',
    name: 'Real-Time Messaging',
    description: 'Instant 1-to-1 direct messaging, read receipts, and reactions.',
    category: 'messaging',
    enabled: true,
    iconName: 'MessageSquare',
  },
  {
    id: 'enable_groups',
    name: 'Group Conversations',
    description: 'Create multi-user group chats with admin control and topic previews.',
    category: 'messaging',
    enabled: true,
    iconName: 'Users',
  },
  {
    id: 'enable_calls',
    name: 'Voice & Video Calls',
    description: 'WebRTC end-to-end voice and video call system.',
    category: 'calls',
    enabled: true,
    iconName: 'Phone',
  },
  {
    id: 'enable_ai',
    name: 'Paddy AI Co-Pilot',
    description: 'AI chat assistant, thread summarization, and semantic search.',
    category: 'ai',
    enabled: true,
    iconName: 'Sparkles',
  },
  {
    id: 'enable_voice_notes',
    name: 'Voice Notes Recording',
    description: 'Record and send high-fidelity voice messages with audio waveforms.',
    category: 'messaging',
    enabled: true,
    iconName: 'Mic',
  },
  {
    id: 'enable_file_uploads',
    name: 'Media & File Attachments',
    description: 'Upload and preview documents, images, and project files.',
    category: 'messaging',
    enabled: true,
    iconName: 'Paperclip',
  },
  {
    id: 'enable_reactions',
    name: 'Emoji Reactions',
    description: 'Real-time message emoji counters and reactions drawer.',
    category: 'messaging',
    enabled: true,
    iconName: 'Smile',
  },
  {
    id: 'enable_read_receipts',
    name: 'Read & Delivery Receipts',
    description: 'Sent, delivered, and read status ticks for messages.',
    category: 'messaging',
    enabled: true,
    iconName: 'CheckCheck',
  },
  {
    id: 'enable_typing_indicators',
    name: 'Typing Presence Indicators',
    description: 'Live broadcast when users are actively composing text.',
    category: 'messaging',
    enabled: true,
    iconName: 'Activity',
  },
  {
    id: 'enable_announcements',
    name: 'Global Announcements Bar',
    description: 'Broadcast persistent informational notices across top of workspace.',
    category: 'general',
    enabled: true,
    iconName: 'Megaphone',
  },
  {
    id: 'enable_referrals',
    name: 'Affiliate & Referral System',
    description: 'User referral links with flat or percentage rewards.',
    category: 'monetization',
    enabled: true,
    iconName: 'Share2',
  },
  {
    id: 'enable_adsense',
    name: 'Google AdSense Monetization',
    description: 'Render responsive ad slots in header, sidebar, and call screens.',
    category: 'monetization',
    enabled: false,
    iconName: 'DollarSign',
  },
  {
    id: 'enable_brute_force',
    name: 'Brute Force Login Shield',
    description: 'Lockout malicious attempts and require verification on repeated failures.',
    category: 'security',
    enabled: true,
    iconName: 'ShieldAlert',
  },
  {
    id: 'enable_pwa',
    name: 'Progressive Web App (PWA)',
    description: 'Allow users to install ChatPaddy as a native desktop and mobile app.',
    category: 'general',
    enabled: true,
    iconName: 'Download',
  },
];

const INITIAL_PAGES: AdminPage[] = [
  {
    id: 'page_terms',
    slug: 'terms',
    title: 'Terms of Service',
    content: `# Terms of Service\n\nWelcome to ChatPaddy. By accessing or using our real-time communication platform, you agree to be bound by these Terms of Service.\n\n### 1. Account Usage\nYou must be at least 13 years old to use this service. You are responsible for maintaining the confidentiality of your credentials.\n\n### 2. Community Standards\nYou agree not to distribute malware, unsolicited spam, or abusive communications.\n\n### 3. Service Level Agreement\nWe strive for 99.9% uptime for all real-time messaging and voice servers.`,
    excerpt: 'Platform terms, user responsibilities, and service commitments.',
    metaTitle: 'Terms of Service | ChatPaddy',
    metaDescription: 'Read the official terms and conditions for using ChatPaddy.',
    status: 'published',
    updatedAt: new Date().toISOString(),
    author: 'Admin Team',
  },
  {
    id: 'page_privacy',
    slug: 'privacy',
    title: 'Privacy Policy',
    content: `# Privacy Policy\n\nYour privacy is paramount. ChatPaddy enforces end-to-end transport encryption and strict tenant isolation.\n\n### Data We Collect\n- Basic profile information (Display name, handle, avatar).\n- Encrypted message payloads routed via Supabase Realtime.\n- Anonymous telemetry for network health and call diagnostic metrics.`,
    excerpt: 'How ChatPaddy protects and encrypts user data.',
    metaTitle: 'Privacy Policy | ChatPaddy',
    metaDescription: 'Discover our privacy commitments, encryption protocols, and data practices.',
    status: 'published',
    updatedAt: new Date().toISOString(),
    author: 'Security Officer',
  },
  {
    id: 'page_about',
    slug: 'about',
    title: 'About ChatPaddy',
    content: `# About ChatPaddy\n\nChat like friends, build like pros. ChatPaddy combines the playful warmth of modern community chat with enterprise real-time reliability.`,
    excerpt: 'The story and mission behind the ChatPaddy communications suite.',
    metaTitle: 'About Us | ChatPaddy',
    metaDescription: 'Learn about ChatPaddy’s mission to connect people seamlessly.',
    status: 'published',
    updatedAt: new Date().toISOString(),
    author: 'Product Team',
  },
  {
    id: 'page_pricing',
    slug: 'pricing',
    title: 'Pricing & Enterprise Plans',
    content: `# Transparent Pricing\n\n- **Free Starter**: Unlimited messages, direct chats, and community features.\n- **Pro Paddy ($9.99/mo)**: AI summaries, 4K video calling, 100GB media storage.\n- **Team Enterprise ($49/seat)**: Custom SMTP, dedicated tenant, audit logs, and priority SLA.`,
    excerpt: 'Detailed comparison of plans and platform capabilities.',
    metaTitle: 'Pricing Plans | ChatPaddy',
    metaDescription: 'Compare ChatPaddy Free, Pro, and Enterprise subscription tiers.',
    status: 'published',
    updatedAt: new Date().toISOString(),
    author: 'Growth Team',
  },
];

const INITIAL_GLOBAL_SETTINGS: GlobalSettings = {
  siteName: 'ChatPaddy',
  tagline: 'Chat like friends. Build like pros.',
  currencySymbol: '$',
  currencyCode: 'USD',
  currencyPosition: 'before',
  logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
  faviconUrl: '/favicon.ico',
  timezone: 'UTC',
  primaryColor: '#4F46E5',
  accentColor: '#F59E0B',
};

const INITIAL_SEO_SETTINGS: SEOSettings = {
  metaTitle: 'ChatPaddy — Modern Real-Time Chat & Collaboration',
  metaDescription: 'Chat like friends, build like pros. Fast real-time messaging, group channels, voice calls, rich media, and AI intelligence.',
  metaKeywords: 'chat, messaging, real-time, voice calls, video calls, collaboration, ai chat',
  metaImageUrl: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=1200&auto=format&fit=crop&q=80',
  faviconUrl: '/favicon.ico',
  robotsTxt: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://chatpaddy.com/sitemap.xml`,
  sitemapXml: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://chatpaddy.com/</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://chatpaddy.com/about</loc>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>https://chatpaddy.com/pricing</loc>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>https://chatpaddy.com/terms</loc>\n    <priority>0.5</priority>\n  </url>\n  <url>\n    <loc>https://chatpaddy.com/privacy</loc>\n    <priority>0.5</priority>\n  </url>\n</urlset>`,
};

const INITIAL_CUSTOM_SCRIPTS: CustomScripts = {
  headerScripts: `<!-- Google Analytics or Tag Manager -->\n<!-- <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script> -->`,
  bodyScripts: `<!-- Body Opening Scripts -->`,
  footerScripts: `<!-- ChatPaddy Realtime Diagnostic Hook -->\n<script>\n  window.__chatpaddy_loaded = true;\n</script>`,
  adsense: {
    enabled: false,
    publisherId: 'ca-pub-9823471092837410',
    autoAds: false,
    headerAdSlot: '8492019283',
    sidebarAdSlot: '1928301923',
    callViewAdSlot: '4829103948',
  },
};

const INITIAL_BRUTE_FORCE: BruteForceSettings = {
  maxBadLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  enableCaptchaAfterAttempts: 3,
  ipWhitelist: '127.0.0.1\n::1\n192.168.1.0/24',
  ipBlacklist: '198.51.100.42\n203.0.113.19',
};

const INITIAL_LANGUAGES: LanguageItem[] = [
  { code: 'en', name: 'English', nativeName: 'English', isRTL: false, enabled: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false, enabled: true },
  { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false, enabled: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isRTL: false, enabled: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true, enabled: false },
  { code: 'yo', name: 'Yoruba', nativeName: 'Èdè Yorùbá', isRTL: false, enabled: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', isRTL: false, enabled: true },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', isRTL: false, enabled: false },
];

const INITIAL_DICTIONARY: Record<string, Record<string, string>> = {
  en: {
    'nav.chats': 'Chats',
    'nav.calls': 'Calls',
    'nav.settings': 'Settings',
    'nav.admin': 'Admin Portal',
    'chat.type_message': 'Type a message...',
    'chat.online': 'Online',
    'chat.offline': 'Offline',
    'chat.search': 'Search chats...',
    'common.save': 'Save Changes',
    'common.delete': 'Delete',
    'common.cancel': 'Cancel',
  },
  es: {
    'nav.chats': 'Chats',
    'nav.calls': 'Llamadas',
    'nav.settings': 'Ajustes',
    'nav.admin': 'Panel Admin',
    'chat.type_message': 'Escribe un mensaje...',
    'chat.online': 'En línea',
    'chat.offline': 'Desconectado',
    'chat.search': 'Buscar chats...',
    'common.save': 'Guardar Cambios',
    'common.delete': 'Eliminar',
    'common.cancel': 'Cancelar',
  },
  fr: {
    'nav.chats': 'Discussions',
    'nav.calls': 'Appels',
    'nav.settings': 'Paramètres',
    'nav.admin': 'Portail Admin',
    'chat.type_message': 'Tapez un message...',
    'chat.online': 'En ligne',
    'chat.offline': 'Hors ligne',
    'chat.search': 'Rechercher...',
    'common.save': 'Sauvegarder',
    'common.delete': 'Supprimer',
    'common.cancel': 'Annuler',
  },
  yo: {
    'nav.chats': 'Ìfọ̀rọ̀wérọ̀',
    'nav.calls': 'Ìpè',
    'nav.settings': 'Àtòjọ',
    'nav.admin': 'Àkóso',
    'chat.type_message': 'Kọ ọ̀rọ̀ rẹ...',
    'chat.online': 'Wà lórí afẹ́fẹ́',
    'chat.offline': 'Kò sí lórí afẹ́fẹ́',
    'chat.search': 'Wá ìfọ̀rọ̀wérọ̀...',
    'common.save': 'Fipamọ́',
    'common.delete': 'Pa rẹ́',
    'common.cancel': 'Fagilé',
  },
};

const INITIAL_MENU_ITEMS: MenuItem[] = [
  { id: 'menu_1', label: 'Chats', url: '/#chats', openInNewTab: false, order: 1, icon: 'MessageSquare' },
  { id: 'menu_2', label: 'Calls', url: '/#calls', openInNewTab: false, order: 2, icon: 'Phone' },
  { id: 'menu_3', label: 'Pricing', url: '/pricing', openInNewTab: false, order: 3, icon: 'DollarSign' },
  { id: 'menu_4', label: 'About', url: '/about', openInNewTab: false, order: 4, icon: 'Info' },
  { id: 'menu_5', label: 'Help Center', url: '/help', openInNewTab: true, order: 5, icon: 'HelpCircle' },
];

const INITIAL_FOOTER_COLUMNS: FooterColumn[] = [
  {
    id: 'col_product',
    title: 'Product',
    links: [
      { label: 'Realtime Chat', url: '/#chats' },
      { label: 'Voice & Video Calls', url: '/#calls' },
      { label: 'AI Co-pilot', url: '/ai' },
      { label: 'Desktop App (PWA)', url: '/download' },
    ],
  },
  {
    id: 'col_resources',
    title: 'Resources',
    links: [
      { label: 'Documentation', url: '/docs' },
      { label: 'Help & FAQs', url: '/help' },
      { label: 'System Status', url: '/status' },
      { label: 'Changelog', url: '/changelog' },
    ],
  },
  {
    id: 'col_legal',
    title: 'Legal & Security',
    links: [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms of Service', url: '/terms' },
      { label: 'Security Overview', url: '/security' },
      { label: 'Cookie Settings', url: '/cookies' },
    ],
  },
];

// 40+ form fields for registration builder
const INITIAL_FORM_FIELDS: FormField[] = [
  { id: 'f_full_name', type: 'text', label: 'Full Name', placeholder: 'Alex Rivera', required: true, icon: 'User', category: 'basic' },
  { id: 'f_username', type: 'text', label: 'Desired Username', placeholder: 'alex_dev', required: true, icon: 'AtSign', category: 'profile' },
  { id: 'f_email', type: 'email', label: 'Work or Personal Email', placeholder: 'alex@example.com', required: true, icon: 'Mail', category: 'basic' },
  { id: 'f_password', type: 'password', label: 'Password', placeholder: 'Minimum 8 characters', required: true, icon: 'Lock', category: 'basic' },
  { id: 'f_phone', type: 'tel', label: 'Phone Number', placeholder: '+1 (555) 000-0000', required: false, icon: 'Phone', category: 'basic' },
  { id: 'f_bio', type: 'textarea', label: 'Bio / Status', placeholder: 'A few words about you...', required: false, icon: 'FileText', category: 'profile' },
  { id: 'f_country', type: 'select', label: 'Country', placeholder: 'Select your country', required: true, icon: 'Globe', category: 'location', options: ['United States', 'United Kingdom', 'Nigeria', 'Germany', 'Canada', 'Brazil', 'Japan', 'France'] },
  { id: 'f_terms', type: 'checkbox', label: 'I agree to the Terms of Service and Privacy Policy', placeholder: '', required: true, icon: 'CheckSquare', category: 'security' },
];

const INITIAL_PWA_SETTINGS: PWASettings = {
  appName: 'ChatPaddy Messenger',
  shortName: 'ChatPaddy',
  themeColor: '#4F46E5',
  backgroundColor: '#0E1526',
  displayMode: 'standalone',
  startUrl: '/',
  cachingStrategy: 'staleWhileRevalidate',
  icon192: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=192&auto=format&fit=crop&q=80',
  icon512: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&auto=format&fit=crop&q=80',
};

const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr_me_001',
    name: 'Alex Rivera',
    username: 'alex_dev',
    email: 'alex@chatpaddy.internal',
    role: 'Super Admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    creditsBalance: 500,
    joinedAt: '2026-01-10',
    lastLogin: 'Just now',
  },
  {
    id: '78a74594-c658-4b86-b58d-d7a040509d05',
    name: 'Ada Lovelace',
    username: 'ada',
    email: 'ada@chatpaddy.internal',
    role: 'Administrator',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    creditsBalance: 250,
    joinedAt: '2026-02-14',
    lastLogin: '10m ago',
  },
  {
    id: 'a9f639d3-9cb8-4661-a9cd-d4506e7f204e',
    name: 'Chidi Anagonye',
    username: 'chidi',
    email: 'chidi@chatpaddy.internal',
    role: 'Moderator',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    creditsBalance: 120,
    joinedAt: '2026-03-01',
    lastLogin: '1h ago',
  },
  {
    id: 'f3e36b6c-b666-4dda-93ec-30b47ec496b1',
    name: 'Zainab Bello',
    username: 'zainab',
    email: 'zainab@chatpaddy.internal',
    role: 'Verified Member',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    creditsBalance: 50,
    joinedAt: '2026-04-12',
    lastLogin: 'Yesterday',
  },
  {
    id: 'usr_marcus_005',
    name: 'Marcus Chen',
    username: 'marcus_c',
    email: 'marcus@example.com',
    role: 'Member',
    status: 'suspended',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    creditsBalance: 0,
    joinedAt: '2026-05-02',
    lastLogin: '3d ago',
    suspensionEnd: '2026-10-01',
  },
  {
    id: 'usr_spambot_99',
    name: 'Spam Bot 404',
    username: 'free_crypto_bot',
    email: 'bot404@disposable.net',
    role: 'Guest',
    status: 'banned',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    creditsBalance: 0,
    joinedAt: '2026-06-20',
    lastLogin: '1w ago',
    banReason: 'Automated referral spam violations in public groups',
  },
];

const INITIAL_ROLES: AdminRole[] = [
  {
    id: 'role_super_admin',
    name: 'Super Admin',
    description: 'Unrestricted full access to entire system, configurations, financial logs, and site layout.',
    color: '#4F46E5',
    isSystem: true,
    userCount: 1,
    permissions: [
      'manage_features',
      'edit_site_layout',
      'manage_users',
      'ban_suspend_users',
      'credit_users',
      'impersonate_users',
      'manage_roles',
      'manage_pages',
      'manage_seo',
      'manage_scripts',
      'manage_smtp',
      'send_announcements',
      'send_mass_notifications',
      'view_financials',
      'manage_referrals',
      'delete_any_message',
    ],
  },
  {
    id: 'role_admin',
    name: 'Administrator',
    description: 'Platform administrator with capabilities to manage users, moderation, and content.',
    color: '#0284C7',
    isSystem: true,
    userCount: 2,
    permissions: [
      'manage_features',
      'manage_users',
      'ban_suspend_users',
      'manage_pages',
      'send_announcements',
      'send_mass_notifications',
      'delete_any_message',
    ],
  },
  {
    id: 'role_moderator',
    name: 'Community Moderator',
    description: 'Can review user reports, mute/suspend offenders, and delete flagged content.',
    color: '#D97706',
    isSystem: true,
    userCount: 4,
    permissions: [
      'manage_users',
      'ban_suspend_users',
      'delete_any_message',
    ],
  },
  {
    id: 'role_member',
    name: 'Standard Member',
    description: 'Verified platform user with access to messaging, calls, and group creation.',
    color: '#10B981',
    isSystem: true,
    userCount: 1842,
    permissions: [],
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_1',
    title: '✨ Welcome to ChatPaddy v2.4 with Supabase Realtime!',
    content: 'Experience ultra-fast real-time messaging, multi-user groups, and AI Co-Pilot thread summaries.',
    type: 'banner',
    priority: 'info',
    targetAudience: 'all',
    active: true,
    startDate: '2026-09-20',
    actionText: 'Explore Features',
    actionUrl: '#chats',
  },
  {
    id: 'ann_2',
    title: 'Scheduled Maintenance Notice',
    content: 'We will be conducting brief network optimization on Sunday at 02:00 UTC. Call reconnection will be automatic.',
    type: 'toast',
    priority: 'warning',
    targetAudience: 'all',
    active: false,
    startDate: '2026-09-28',
  },
];

const INITIAL_MASS_NOTIFICATIONS: MassNotification[] = [
  {
    id: 'notif_1',
    title: 'Important Security Update',
    message: 'We have updated our Brute Force Protection shields and Session Revocation policies for your security.',
    targetAudience: 'all',
    channels: ['in_app', 'email'],
    sentAt: '2026-09-22 14:30',
    sentCount: 1842,
    readCount: 1420,
    status: 'sent',
  },
  {
    id: 'notif_2',
    title: 'Paddy AI Co-pilot is now available for all workspaces',
    message: 'Summarize long conversation threads, generate smart replies, and perform semantic search instantly.',
    targetAudience: 'all',
    channels: ['in_app'],
    sentAt: '2026-09-18 10:00',
    sentCount: 1842,
    readCount: 1689,
    status: 'sent',
  },
];

const INITIAL_SMTP: SMTPSettings[] = [
  {
    id: 'smtp_default',
    name: 'Primary SendGrid Production',
    host: 'smtp.sendgrid.net',
    port: 587,
    encryption: 'tls',
    username: 'apikey',
    fromName: 'ChatPaddy Team',
    fromEmail: 'noreply@chatpaddy.internal',
    isDefault: true,
    lastTestedAt: '2026-09-23 16:45',
    testStatus: 'success',
  },
  {
    id: 'smtp_backup',
    name: 'Amazon SES Backup',
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 465,
    encryption: 'ssl',
    username: 'AKIAIOSFODNN7EXAMPLE',
    fromName: 'ChatPaddy Emergency Dispatch',
    fromEmail: 'alerts@chatpaddy.internal',
    isDefault: false,
    lastTestedAt: '2026-09-20 09:12',
    testStatus: 'success',
  },
];

const INITIAL_REFERRAL: ReferralSettings = {
  enabled: true,
  commissionType: 'percentage',
  commissionRate: 20, // 20%
  minimumPayout: 50,
  cookieDurationDays: 60,
  totalReferrals: 418,
  totalPaidOut: 4850,
  pendingPayouts: 920,
  topReferrers: [
    { id: 'ref_1', name: 'Alex Rivera', code: 'ALEX20', referralsCount: 84, earnings: 1260 },
    { id: 'ref_2', name: 'Ada Lovelace', code: 'ALGO99', referralsCount: 62, earnings: 930 },
    { id: 'ref_3', name: 'Zainab Bello', code: 'ZEECHAT', referralsCount: 45, earnings: 675 },
    { id: 'ref_4', name: 'Chidi Anagonye', code: 'ETHICS', referralsCount: 38, earnings: 570 },
  ],
};

// ----------------------------------------------------
// ZUSTAND STORE INTERFACE
// ----------------------------------------------------

interface AdminState {
  // Navigation / Views
  activeAdminSection: string;
  setActiveAdminSection: (section: string) => void;

  // Features
  features: FeatureItem[];
  toggleFeature: (featureId: string) => void;
  updateFeature: (featureId: string, updates: Partial<FeatureItem>) => void;
  isFeatureEnabled: (featureId: string) => boolean;

  // Pages CMS
  pages: AdminPage[];
  addPage: (page: Omit<AdminPage, 'id' | 'updatedAt'>) => void;
  editPage: (id: string, updates: Partial<AdminPage>) => void;
  deletePage: (id: string) => void;

  // Global Settings
  globalSettings: GlobalSettings;
  updateGlobalSettings: (updates: Partial<GlobalSettings>) => void;

  // SEO Settings
  seoSettings: SEOSettings;
  updateSEOSettings: (updates: Partial<SEOSettings>) => void;
  generateSitemap: () => void;
  generateRobotsTxt: () => void;

  // Custom Scripts & AdSense
  customScripts: CustomScripts;
  updateCustomScripts: (updates: Partial<CustomScripts>) => void;
  updateAdsense: (updates: Partial<CustomScripts['adsense']>) => void;

  // Brute Force & Security
  bruteForce: BruteForceSettings;
  updateBruteForce: (updates: Partial<BruteForceSettings>) => void;

  // Languages & Dictionary
  languages: LanguageItem[];
  defaultLanguage: string;
  dictionary: Record<string, Record<string, string>>;
  toggleLanguage: (code: string) => void;
  setDefaultLanguage: (code: string) => void;
  addLanguageKeyword: (langCode: string, key: string, value: string) => void;
  deleteLanguageKeyword: (langCode: string, key: string) => void;
  editLanguageKeyword: (langCode: string, key: string, value: string) => void;

  // Menu Manager & Footer
  menuItems: MenuItem[];
  footerColumns: FooterColumn[];
  footerCopyright: string;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  editMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  updateFooterCopyright: (text: string) => void;
  updateFooterColumns: (columns: FooterColumn[]) => void;

  // Form Builder
  formFields: FormField[];
  addFormField: (field: Omit<FormField, 'id'>) => void;
  editFormField: (id: string, updates: Partial<FormField>) => void;
  deleteFormField: (id: string) => void;
  reorderFormFields: (startIndex: number, endIndex: number) => void;

  // PWA Settings
  pwaSettings: PWASettings;
  updatePWASettings: (updates: Partial<PWASettings>) => void;

  // Users Management
  users: AdminUser[];
  addUser: (user: Omit<AdminUser, 'id' | 'joinedAt'>) => void;
  editUser: (id: string, updates: Partial<AdminUser>) => void;
  deleteUser: (id: string) => void;
  banUser: (id: string, reason: string) => void;
  suspendUser: (id: string, days: number, reason: string) => void;
  unbanUser: (id: string) => void;
  creditUser: (id: string, amount: number, note: string) => void;

  // Role Management
  roles: AdminRole[];
  addRole: (role: Omit<AdminRole, 'id' | 'userCount'>) => void;
  editRole: (id: string, updates: Partial<AdminRole>) => void;
  deleteRole: (id: string) => void;

  // Announcements
  announcements: Announcement[];
  addAnnouncement: (ann: Omit<Announcement, 'id'>) => void;
  editAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  toggleAnnouncement: (id: string) => void;

  // Mass Notifications
  massNotifications: MassNotification[];
  sendMassNotification: (notif: Omit<MassNotification, 'id' | 'sentAt' | 'sentCount' | 'readCount' | 'status'>) => void;
  deleteMassNotification: (id: string) => void;

  // SMTP Settings
  smtpSettings: SMTPSettings[];
  addSMTP: (smtp: Omit<SMTPSettings, 'id' | 'isDefault'>) => void;
  editSMTP: (id: string, updates: Partial<SMTPSettings>) => void;
  deleteSMTP: (id: string) => void;
  setDefaultSMTP: (id: string) => void;
  testSMTP: (id: string) => Promise<boolean>;

  // Referral Management
  referralSettings: ReferralSettings;
  updateReferralSettings: (updates: Partial<ReferralSettings>) => void;
}

const STORAGE_KEY = 'chatpaddy_admin_state_v1';

const getInitialState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read admin state from localStorage', e);
  }
  return null;
};

const savedState = getInitialState();

export const useAdminStore = create<AdminState>((set, get) => {
  // Helper to persist state to local storage
  const persist = (partial: Partial<AdminState>) => {
    if (typeof window === 'undefined') return;
    try {
      const current = get();
      const payload = {
        features: partial.features ?? current.features,
        pages: partial.pages ?? current.pages,
        globalSettings: partial.globalSettings ?? current.globalSettings,
        seoSettings: partial.seoSettings ?? current.seoSettings,
        customScripts: partial.customScripts ?? current.customScripts,
        bruteForce: partial.bruteForce ?? current.bruteForce,
        languages: partial.languages ?? current.languages,
        defaultLanguage: partial.defaultLanguage ?? current.defaultLanguage,
        dictionary: partial.dictionary ?? current.dictionary,
        menuItems: partial.menuItems ?? current.menuItems,
        footerColumns: partial.footerColumns ?? current.footerColumns,
        footerCopyright: partial.footerCopyright ?? current.footerCopyright,
        formFields: partial.formFields ?? current.formFields,
        pwaSettings: partial.pwaSettings ?? current.pwaSettings,
        users: partial.users ?? current.users,
        roles: partial.roles ?? current.roles,
        announcements: partial.announcements ?? current.announcements,
        massNotifications: partial.massNotifications ?? current.massNotifications,
        smtpSettings: partial.smtpSettings ?? current.smtpSettings,
        referralSettings: partial.referralSettings ?? current.referralSettings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Could not save admin state', e);
    }
  };

  return {
    activeAdminSection: 'overview',
    setActiveAdminSection: (section) => set({ activeAdminSection: section }),

    // Features
    features: savedState?.features || INITIAL_FEATURES,
    toggleFeature: (featureId) => {
      set((state) => {
        const next = state.features.map((f) =>
          f.id === featureId ? { ...f, enabled: !f.enabled } : f
        );
        persist({ features: next });
        return { features: next };
      });
    },
    updateFeature: (featureId, updates) => {
      set((state) => {
        const next = state.features.map((f) =>
          f.id === featureId ? { ...f, ...updates } : f
        );
        persist({ features: next });
        return { features: next };
      });
    },
    isFeatureEnabled: (featureId) => {
      const f = get().features.find((item) => item.id === featureId);
      return f ? f.enabled : true;
    },

    // Pages CMS
    pages: savedState?.pages || INITIAL_PAGES,
    addPage: (page) => {
      set((state) => {
        const newPage: AdminPage = {
          ...page,
          id: `page_${Date.now()}`,
          updatedAt: new Date().toISOString(),
        };
        const next = [newPage, ...state.pages];
        persist({ pages: next });
        return { pages: next };
      });
    },
    editPage: (id, updates) => {
      set((state) => {
        const next = state.pages.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        );
        persist({ pages: next });
        return { pages: next };
      });
    },
    deletePage: (id) => {
      set((state) => {
        const next = state.pages.filter((p) => p.id !== id);
        persist({ pages: next });
        return { pages: next };
      });
    },

    // Global Settings
    globalSettings: savedState?.globalSettings || INITIAL_GLOBAL_SETTINGS,
    updateGlobalSettings: (updates) => {
      set((state) => {
        const next = { ...state.globalSettings, ...updates };
        persist({ globalSettings: next });
        return { globalSettings: next };
      });
    },

    // SEO Settings
    seoSettings: savedState?.seoSettings || INITIAL_SEO_SETTINGS,
    updateSEOSettings: (updates) => {
      set((state) => {
        const next = { ...state.seoSettings, ...updates };
        persist({ seoSettings: next });
        return { seoSettings: next };
      });
    },
    generateSitemap: () => {
      set((state) => {
        const domain = 'https://chatpaddy.com';
        const today = new Date().toISOString().split('T')[0];
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        xml += `  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${today}</lastmod>\n    <priority>1.0</priority>\n  </url>\n`;
        state.pages.forEach((p) => {
          if (p.status === 'published') {
            xml += `  <url>\n    <loc>${domain}/${p.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.8</priority>\n  </url>\n`;
          }
        });
        xml += `</urlset>`;
        const next = { ...state.seoSettings, sitemapXml: xml };
        persist({ seoSettings: next });
        return { seoSettings: next };
      });
    },
    generateRobotsTxt: () => {
      set((state) => {
        const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /private/\n\nSitemap: https://chatpaddy.com/sitemap.xml`;
        const next = { ...state.seoSettings, robotsTxt: robots };
        persist({ seoSettings: next });
        return { seoSettings: next };
      });
    },

    // Custom Scripts & AdSense
    customScripts: savedState?.customScripts || INITIAL_CUSTOM_SCRIPTS,
    updateCustomScripts: (updates) => {
      set((state) => {
        const next = { ...state.customScripts, ...updates };
        persist({ customScripts: next });
        return { customScripts: next };
      });
    },
    updateAdsense: (updates) => {
      set((state) => {
        const next = {
          ...state.customScripts,
          adsense: { ...state.customScripts.adsense, ...updates },
        };
        persist({ customScripts: next });
        return { customScripts: next };
      });
    },

    // Brute Force & Security
    bruteForce: savedState?.bruteForce || INITIAL_BRUTE_FORCE,
    updateBruteForce: (updates) => {
      set((state) => {
        const next = { ...state.bruteForce, ...updates };
        persist({ bruteForce: next });
        return { bruteForce: next };
      });
    },

    // Languages & Dictionary
    languages: savedState?.languages || INITIAL_LANGUAGES,
    defaultLanguage: savedState?.defaultLanguage || 'en',
    dictionary: savedState?.dictionary || INITIAL_DICTIONARY,
    toggleLanguage: (code) => {
      set((state) => {
        const next = state.languages.map((l) =>
          l.code === code ? { ...l, enabled: !l.enabled } : l
        );
        persist({ languages: next });
        return { languages: next };
      });
    },
    setDefaultLanguage: (code) => {
      set(() => {
        persist({ defaultLanguage: code });
        return { defaultLanguage: code };
      });
    },
    addLanguageKeyword: (langCode, key, value) => {
      set((state) => {
        const dict = { ...state.dictionary };
        if (!dict[langCode]) dict[langCode] = {};
        dict[langCode][key] = value;
        persist({ dictionary: dict });
        return { dictionary: dict };
      });
    },
    deleteLanguageKeyword: (langCode, key) => {
      set((state) => {
        const dict = { ...state.dictionary };
        if (dict[langCode]) {
          delete dict[langCode][key];
        }
        persist({ dictionary: dict });
        return { dictionary: dict };
      });
    },
    editLanguageKeyword: (langCode, key, value) => {
      set((state) => {
        const dict = { ...state.dictionary };
        if (!dict[langCode]) dict[langCode] = {};
        dict[langCode][key] = value;
        persist({ dictionary: dict });
        return { dictionary: dict };
      });
    },

    // Menu Manager & Footer
    menuItems: savedState?.menuItems || INITIAL_MENU_ITEMS,
    footerColumns: savedState?.footerColumns || INITIAL_FOOTER_COLUMNS,
    footerCopyright: savedState?.footerCopyright || '© 2026 ChatPaddy Inc. All rights reserved. Real-time messaging with end-to-end reliability.',
    addMenuItem: (item) => {
      set((state) => {
        const next = [...state.menuItems, { ...item, id: `menu_${Date.now()}` }];
        persist({ menuItems: next });
        return { menuItems: next };
      });
    },
    editMenuItem: (id, updates) => {
      set((state) => {
        const next = state.menuItems.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        );
        persist({ menuItems: next });
        return { menuItems: next };
      });
    },
    deleteMenuItem: (id) => {
      set((state) => {
        const next = state.menuItems.filter((m) => m.id !== id);
        persist({ menuItems: next });
        return { menuItems: next };
      });
    },
    updateFooterCopyright: (text) => {
      set(() => {
        persist({ footerCopyright: text });
        return { footerCopyright: text };
      });
    },
    updateFooterColumns: (columns) => {
      set(() => {
        persist({ footerColumns: columns });
        return { footerColumns: columns };
      });
    },

    // Form Builder
    formFields: savedState?.formFields || INITIAL_FORM_FIELDS,
    addFormField: (field) => {
      set((state) => {
        const next = [...state.formFields, { ...field, id: `field_${Date.now()}` }];
        persist({ formFields: next });
        return { formFields: next };
      });
    },
    editFormField: (id, updates) => {
      set((state) => {
        const next = state.formFields.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        );
        persist({ formFields: next });
        return { formFields: next };
      });
    },
    deleteFormField: (id) => {
      set((state) => {
        const next = state.formFields.filter((f) => f.id !== id);
        persist({ formFields: next });
        return { formFields: next };
      });
    },
    reorderFormFields: (startIndex, endIndex) => {
      set((state) => {
        const result = Array.from(state.formFields);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        persist({ formFields: result });
        return { formFields: result };
      });
    },

    // PWA Settings
    pwaSettings: savedState?.pwaSettings || INITIAL_PWA_SETTINGS,
    updatePWASettings: (updates) => {
      set((state) => {
        const next = { ...state.pwaSettings, ...updates };
        persist({ pwaSettings: next });
        return { pwaSettings: next };
      });
    },

    // Users Management
    users: savedState?.users || INITIAL_ADMIN_USERS,
    addUser: (user) => {
      set((state) => {
        const newUser: AdminUser = {
          ...user,
          id: `usr_${Date.now()}`,
          joinedAt: new Date().toISOString().split('T')[0],
        };
        const next = [newUser, ...state.users];
        persist({ users: next });
        return { users: next };
      });
    },
    editUser: (id, updates) => {
      set((state) => {
        const next = state.users.map((u) =>
          u.id === id ? { ...u, ...updates } : u
        );
        persist({ users: next });
        return { users: next };
      });
    },
    deleteUser: (id) => {
      set((state) => {
        const next = state.users.filter((u) => u.id !== id);
        persist({ users: next });
        return { users: next };
      });
    },
    banUser: (id, reason) => {
      set((state) => {
        const next = state.users.map((u) =>
          u.id === id ? { ...u, status: 'banned' as const, banReason: reason } : u
        );
        persist({ users: next });
        return { users: next };
      });
    },
    suspendUser: (id, days, reason) => {
      set((state) => {
        const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const next = state.users.map((u) =>
          u.id === id ? { ...u, status: 'suspended' as const, suspensionEnd: expiry, banReason: reason } : u
        );
        persist({ users: next });
        return { users: next };
      });
    },
    unbanUser: (id) => {
      set((state) => {
        const next = state.users.map((u) =>
          u.id === id ? { ...u, status: 'active' as const, banReason: undefined, suspensionEnd: undefined } : u
        );
        persist({ users: next });
        return { users: next };
      });
    },
    creditUser: (id, amount, note) => {
      set((state) => {
        const next = state.users.map((u) =>
          u.id === id ? { ...u, creditsBalance: Math.max(0, u.creditsBalance + amount) } : u
        );
        persist({ users: next });
        return { users: next };
      });
    },

    // Role Management
    roles: savedState?.roles || INITIAL_ROLES,
    addRole: (role) => {
      set((state) => {
        const newRole: AdminRole = {
          ...role,
          id: `role_${Date.now()}`,
          userCount: 0,
        };
        const next = [...state.roles, newRole];
        persist({ roles: next });
        return { roles: next };
      });
    },
    editRole: (id, updates) => {
      set((state) => {
        const next = state.roles.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        );
        persist({ roles: next });
        return { roles: next };
      });
    },
    deleteRole: (id) => {
      set((state) => {
        const next = state.roles.filter((r) => r.id !== id);
        persist({ roles: next });
        return { roles: next };
      });
    },

    // Announcements
    announcements: savedState?.announcements || INITIAL_ANNOUNCEMENTS,
    addAnnouncement: (ann) => {
      set((state) => {
        const newAnn: Announcement = {
          ...ann,
          id: `ann_${Date.now()}`,
        };
        const next = [newAnn, ...state.announcements];
        persist({ announcements: next });
        return { announcements: next };
      });
    },
    editAnnouncement: (id, updates) => {
      set((state) => {
        const next = state.announcements.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        );
        persist({ announcements: next });
        return { announcements: next };
      });
    },
    deleteAnnouncement: (id) => {
      set((state) => {
        const next = state.announcements.filter((a) => a.id !== id);
        persist({ announcements: next });
        return { announcements: next };
      });
    },
    toggleAnnouncement: (id) => {
      set((state) => {
        const next = state.announcements.map((a) =>
          a.id === id ? { ...a, active: !a.active } : a
        );
        persist({ announcements: next });
        return { announcements: next };
      });
    },

    // Mass Notifications
    massNotifications: savedState?.massNotifications || INITIAL_MASS_NOTIFICATIONS,
    sendMassNotification: (notif) => {
      set((state) => {
        const newNotif: MassNotification = {
          ...notif,
          id: `notif_${Date.now()}`,
          sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          sentCount: state.users.length * 280, // Simulation of full user base
          readCount: 1,
          status: 'sent',
        };
        const next = [newNotif, ...state.massNotifications];
        persist({ massNotifications: next });
        return { massNotifications: next };
      });
    },
    deleteMassNotification: (id) => {
      set((state) => {
        const next = state.massNotifications.filter((n) => n.id !== id);
        persist({ massNotifications: next });
        return { massNotifications: next };
      });
    },

    // SMTP Settings
    smtpSettings: savedState?.smtpSettings || INITIAL_SMTP,
    addSMTP: (smtp) => {
      set((state) => {
        const next = [
          ...state.smtpSettings,
          { ...smtp, id: `smtp_${Date.now()}`, isDefault: state.smtpSettings.length === 0 },
        ];
        persist({ smtpSettings: next });
        return { smtpSettings: next };
      });
    },
    editSMTP: (id, updates) => {
      set((state) => {
        const next = state.smtpSettings.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        );
        persist({ smtpSettings: next });
        return { smtpSettings: next };
      });
    },
    deleteSMTP: (id) => {
      set((state) => {
        const next = state.smtpSettings.filter((s) => s.id !== id);
        persist({ smtpSettings: next });
        return { smtpSettings: next };
      });
    },
    setDefaultSMTP: (id) => {
      set((state) => {
        const next = state.smtpSettings.map((s) => ({
          ...s,
          isDefault: s.id === id,
        }));
        persist({ smtpSettings: next });
        return { smtpSettings: next };
      });
    },
    testSMTP: async (id) => {
      // Simulate real SMTP ping
      await new Promise((r) => setTimeout(r, 1200));
      const success = true;
      set((state) => {
        const next = state.smtpSettings.map((s) =>
          s.id === id
            ? {
                ...s,
                lastTestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                testStatus: 'success' as const,
              }
            : s
        );
        persist({ smtpSettings: next });
        return { smtpSettings: next };
      });
      return success;
    },

    // Referral Management
    referralSettings: savedState?.referralSettings || INITIAL_REFERRAL,
    updateReferralSettings: (updates) => {
      set((state) => {
        const next = { ...state.referralSettings, ...updates };
        persist({ referralSettings: next });
        return { referralSettings: next };
      });
    },
  };
});

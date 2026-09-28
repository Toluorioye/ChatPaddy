# ChatPaddy 💬⚡
> *"Chat like friends. Build like pros."*

ChatPaddy is a production-grade, real-time collaboration and messaging platform engineered with React 19, TypeScript, Tailwind CSS, TanStack Query, Zustand, and Supabase (Postgres, Realtime, Storage, Auth, and Edge Functions for Gemini AI).

---

## 🚀 Key Features

### 1. Real-Time Messaging & Delivery Pipeline
- **Sub-50ms Delivery**: Built on Supabase Realtime (`postgres_changes`) with Web Audio feedback.
- **Three-State Receipts**:
  - Sent: `✓`
  - Delivered: `✓✓`
  - Read: `✓✓` (colored amber)
- **Typing Indicators**: Real-time broadcast channel debounce ("Ada is typing...", multi-user in groups).
- **Presence & Last Seen**: Realtime presence tracking with online status badges and last-seen timestamps.
- **Message Actions**:
  - Quoted replies with smooth jump-to-source scrolling.
  - Interactive emoji reactions with live counters and user lists.
  - Message editing with `edited` flag (own messages only).
  - Message deletion (Delete for me vs Delete for everyone with placeholder).
  - Message forwarding to any conversation.
  - Emoji-only enlargement (up to 4xl for expressive communication).

### 2. Rich Media & Voice Communication
- **Voice Notes**: Native audio recording with live duration timer, waveform visualization, and instant playback.
- **Image Sharing & Lightbox**: Full-resolution modal viewer with zoom and backdrop blur.
- **Document Attachments**: Clean file metadata cards with size calculation and direct download triggers.
- **HD Audio/Video Calling UI**:
  - WebRTC-ready interface with ringtone, duration timer, mute, camera toggle, screen sharing, and mirrored camera view.

### 3. Groups & Team Collaboration
- **Group Management**:
  - Name, avatar, description, member checklist.
  - Role hierarchy: `owner`, `admin`, `member`.
  - Member addition/removal, leave group, and safety controls.
- **Shared Gallery**: Instant access to all shared photos, documents, and links within any conversation.

### 4. Paddy AI Intelligence (Gemini 2.5)
- **Thread Summarization**: Automatically synthesizes long discussions into bulleted highlights, decisions, and action items.
- **Semantic Message Search**: Natural language query search (e.g. *"find where we discussed the release deadline"* or *"database security policies"*).
- **Smart Reply Suggestions**: Context-aware one-tap response chips.
- **Server-Side Security**: All Gemini interactions proxy through the Supabase Edge Function (`/supabase/functions/paddy-ai`) to keep API keys strictly protected.

---

## 🛡️ Admin Dashboard & Master Console

ChatPaddy includes an enterprise-grade Admin Hub accessible from the navigation rail, granting administrators complete control over every aspect of the site:

1. **Admin Overview**:
   - Real-time site traffic, active sessions, and websocket throughput.
   - User account creation analytics (daily, weekly, monthly trends).
   - Platform billing and payment summary.
2. **Feature Manager**:
   - Master list of all site capabilities (AI assistant, voice notes, video calls, attachments, screen sharing, read receipts, referrals).
   - 1-click instant toggle (ON/OFF) for every module.
3. **Page Contents & CMS**:
   - Create, edit, preview, and publish custom pages and policies (e.g., Terms of Service, Privacy Policy, Changelog).
   - Automatic slug generation and SEO meta tagging.
4. **Global Setup & Config**:
   - Currency settings, Logo & Favicon URLs, Timezone picker, Primary & Accent brand colors.
5. **SEO Settings Engine**:
   - Meta title, description, keywords, OpenGraph share card image, favicon updater.
   - 1-click generators for dynamic `sitemap.xml` and `robots.txt`.
6. **Custom Scripts & Google AdSense Manager**:
   - Injection zones for `<head>`, opening `<body>`, and closing `</body>` scripts (Google Analytics, GTM, Hotjar, custom JS).
   - Google AdSense integration with auto-ads toggle and slot IDs for header banner, sidebar, and call view.
7. **Brute Force Detection & Security ACL**:
   - Configurable Bad Login Limit (e.g., 3-10 attempts) and lockout durations.
   - IP whitelist and audit log of blocked suspicious login attempts.
8. **Manage Languages & Localization**:
   - Multi-language support with key-value dictionary manager, keyword addition, and instant deletion.
9. **Menu & Footer Manager**:
   - Drag-and-drop navigation items ordering (Header menu & Footer links).
   - Customizable copyright notice and footer layout.
10. **Drag-and-Drop Registration Form Builder**:
    - Custom user onboarding fields (Text, Email, Phone, File Upload, Terms Checkbox, Dropdowns, Date Pickers).
    - Field order re-ordering, required toggles, and instant preview.
11. **PWA (Progressive Web App) Settings**:
    - App name, short name, theme color, display mode (standalone, minimal-ui), and offline cache settings.
12. **Users Management**:
    - Add, edit, delete, credit balance, suspend, or permanently ban users.
    - Login-as-user (impersonation) for support troubleshooting.
13. **Role & Permission Management**:
    - Custom role creation (Super Admin, Moderator, Support Specialist, VIP User).
    - Granular permissions matrix for messaging, calling, moderation, and billing.
14. **Announcements & Broadcasts**:
    - Scheduled platform-wide announcement banners with type badges (info, warning, success, critical).
15. **Mass Notifications**:
    - Compose and push notifications to all users or filtered user segments.
16. **Email SMTP Settings**:
    - View existing SMTP configuration, add custom host/port/credentials, encryption toggle (TLS/SSL), and test email verification.
17. **Referral Management**:
    - Referral program configuration with commission type (Flat vs. Percentage), payout thresholds, and referral tracking.

---

## 🔒 Security Audit & Review

A thorough security evaluation was conducted across the codebase:

1. **Client Secret Isolation**:
   - Audited all files in `src/` and configuration files.
   - Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are referenced on the client.
   - Zero private API keys, service role keys, or database passwords exist in client bundles.
   - Server-side Gemini AI features proxy strictly through Supabase Edge Functions with secret storage.
2. **PostgreSQL Row Level Security (RLS) Coverage**:
   - All 14 tables in `schema.sql` have RLS explicitly enabled:
     - `profiles`: Public view of active profiles; update restricted strictly to `auth.uid() = id`.
     - `conversations`: Select restricted to conversation participants via `is_participant()` helper function.
     - `conversation_participants`: Viewable by participants; inserts/deletes controlled by group admins and owners.
     - `messages`: Insert, update, and read operations enforced strictly to verified participants; soft-deletion and edits restricted to message authors.
     - `message_reactions`, `message_attachments`, `message_receipts`: Participant-checked with cascade consistency.
     - `call_logs`, `moderation_reports`, `platform_admins`: Protected with strict administrative and ownership checks.
   - Uses `SECURITY DEFINER` helper functions (`is_participant`, `is_group_admin`, `is_platform_admin`) with fixed `search_path = public` to prevent recursive policy query loops and search_path escalation attacks.
3. **Input Sanitization & XSS Defense**:
   - Added `src/shared/utils/security.ts`:
     - `escapeRegExp()`: Escapes search query strings before RegExp compilation, preventing ReDoS and SyntaxErrors.
     - `sanitizeUrl()`: Validates and sanitizes image URLs, avatar links, and attachments, strictly blocking `javascript:`, `vbscript:`, and dangerous data schemes.
     - `sanitizeInputText()`: Strips unprintable ASCII control characters from user messages before dispatch.
   - React JSX standard text node encoding is utilized throughout; zero instances of `dangerouslySetInnerHTML` or `eval()`.

---

## 📱 Responsiveness Across Viewports

The application is engineered and tested across key responsive breakpoints:

- **Mobile Viewport (360px - 480px)**:
  - Responsive single-pane workflow: Displays chat list or active conversation pane, never overlapping or horizontally clipping.
  - Smooth back button (`ArrowLeft`) to return to conversations list.
  - Mobile bottom tab navigation bar for instant switching between Chats, Calls, AI Search, and Settings.
  - Mobile Drawer for Contact / Group Info (`RightInfoPanel`) with swipe-to-dismiss and backdrop touch.
  - Touch-friendly message action menus (reactions, copy, forward, edit, delete) accessible without mouse hover.
  - Scaled voice note player and audio waveform visualization that fits small displays without horizontal scrolling.
  - Full-screen adaptive modals with optimized padding (`px-4 py-4`) and responsive header dropdowns in the Admin Hub.
- **Tablet Viewport (768px - 1024px)**:
  - Adaptive 2-column layout: Navigation Rail + Chat List (320px) + Conversation Pane (fluid remaining width).
  - Modal dialogues utilize `max-w-lg` to `max-w-2xl` for comfortable reading and editing.
- **Desktop Viewport (1440px+)**:
  - Full 4-zone layout: Slim Navigation Rail (72px) + Master Chat List (384px) + Active Conversation Pane (fluid) + Right Information & Shared Media Panel (320px).
  - High-DPI asset rendering, keyboard navigation shortcuts, and spacious multi-participant grids.

---

## ⚡ Performance Optimizations

1. **Component Memoization**:
   - `MessageBubble`: Isolated into `React.memo` with custom prop change comparison. Receiving a new message or updating a reaction only updates the targeted message bubble rather than re-rendering the whole conversation list.
   - `ConversationListItem`: Isolated into `React.memo` to eliminate re-renders of the sidebar during active typing or message reception.
   - `Avatar`: Wrapped in `React.memo` with URL protocol sanitization.
2. **Virtualization & Windowing**:
   - Message list features date-grouped memory caches and upwards infinite scrolling with scroll position preservation.
   - Computed filters (`filteredConversations`, unread counts, and search matches) are wrapped in `useMemo`.
3. **Debounced Real-Time Operations**:
   - Broadcast typing events are debounced with automatic timeout clearance to avoid saturating websocket channels.
   - Local optimistic message rendering displays instant feedback (`sending...` spinner transitioning to `✓` upon Supabase confirmation).

---

## ♿ Accessibility (WCAG 2.1 AA)

- **Semantic HTML**: Proper `<main>`, `<nav>`, `<aside>`, and `<header>` element hierarchy.
- **Screen Reader Announcements**: Chat history container has `role="log"` and `aria-live="polite"` for automatic updates.
- **Dialog Trapping**: Modals have `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `Escape` key listeners.
- **Focus Indicators**: Standard `focus-visible:ring-2 focus-visible:ring-[#4F46E5]` on all interactive buttons and inputs.
- **Accessible Names**: All icon buttons have explicit `aria-label` attributes for screen readers.
- **Contrast**: Text contrast ratios meet or exceed 4.5:1 on both light and dark themes.

---

## 🛠️ Supabase Backend Setup

To connect your own live Supabase instance:

### 1. Database Schema & RLS
Open your Supabase project's **SQL Editor** and execute [`/schema.sql`](./schema.sql).
This configures:
- 14 relational tables with primary keys, cascading foreign keys, and indexes.
- Full Row Level Security (RLS) policies.
- Helper `SECURITY DEFINER` functions (`is_participant`, `is_group_admin`, `is_platform_admin`).
- PostgreSQL full-text search `tsvector` index and triggers.
- `supabase_realtime` publication for instant streaming.

### 2. Storage Buckets
Create two public/authenticated storage buckets in your Supabase dashboard:
1. `avatars` (allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, max size: 5MB).
2. `attachments` (images, audio, and documents up to 10MB).

### 3. Deploy Edge Function for AI
Deploy the included Edge Function to proxy Gemini requests securely:
```bash
supabase functions deploy paddy-ai --no-verify-jwt
supabase secrets set GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Client Environment Variables
Set your credentials in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 💻 Tech Stack
- **Frontend Framework**: React 19, TypeScript
- **Styling & Design System**: Tailwind CSS, Plus Jakarta Sans, Inter
- **State Management**: Zustand
- **Data Fetching & Cache**: TanStack Query
- **Backend & Database**: Supabase (PostgreSQL, Realtime WebSockets, Storage)
- **AI Engine**: Google Gemini API via Supabase Edge Function
- **Icons**: Lucide React

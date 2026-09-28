/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavRail } from './features/navigation/NavRail';
import { MobileTabBar } from './features/navigation/MobileTabBar';
import { ChatList } from './features/chat/ChatList';
import { ConversationPane } from './features/chat/ConversationPane';
import { RightInfoPanel } from './features/chat/RightInfoPanel';
import { CallHistoryView } from './features/calls/CallHistoryView';
import { CallModal } from './features/calls/CallModal';
import { AuthModal } from './features/auth/AuthModal';
import { ProfileModal } from './features/profile/ProfileModal';
import { SettingsModal } from './features/settings/SettingsModal';
import { AdminDashboardModal } from './features/admin/AdminDashboardModal';
import { NewChatModal } from './features/chat/NewChatModal';
import { CreateGroupModal } from './features/groups/CreateGroupModal';
import { ForwardModal } from './features/chat/ForwardModal';
import { AISummaryModal } from './features/ai/AISummaryModal';
import { AISemanticSearchModal } from './features/ai/AISemanticSearchModal';
import { EmptyState } from './shared/ui/EmptyState';
import { useChatStore } from './features/chat/chatStore';
import { useAuthStore } from './features/auth/authStore';
import { UIMessage } from './types/chat.types';

export default function App() {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    activeTab,
    isRightPanelOpen,
    toggleRightPanel,
    messages,
    initialize: initChat,
  } = useChatStore();

  const { initialize: initAuth, isAdmin } = useAuthStore();

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<UIMessage | null>(null);
  const [isAISummaryOpen, setIsAISummaryOpen] = useState(false);
  const [isAISearchOpen, setIsAISearchOpen] = useState(false);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('chatpaddy_theme') as 'light' | 'dark' | 'system') || 'system';
    }
    return 'system';
  });

  const applyTheme = (t: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    const isDark =
      t === 'dark' ||
      (t === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    try {
      localStorage.setItem('chatpaddy_theme', newTheme);
    } catch (e) {
      console.warn('Failed to persist theme:', e);
    }
    applyTheme(newTheme);
  };

  const handleQuickToggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const nextTheme = isCurrentlyDark ? 'light' : 'dark';
    handleThemeChange(nextTheme);
  };

  // Initialize data stores sequentially so chat channels bind to authenticated session
  useEffect(() => {
    let isMounted = true;
    const setup = async () => {
      await initAuth();
      if (isMounted) {
        initChat();
      }
    };
    setup();

    // Theme initialization
    const savedTheme = (localStorage.getItem('chatpaddy_theme') as 'light' | 'dark' | 'system') || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);

    // Dynamic listener for OS system theme changes
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      const activeTheme = (localStorage.getItem('chatpaddy_theme') as 'light' | 'dark' | 'system') || 'system';
      if (activeTheme === 'system') {
        applyTheme('system');
      }
    };

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if (mediaQuery?.addListener) {
      mediaQuery.addListener(handleMediaChange);
    }

    // Global Admin Shortcut: Ctrl/Cmd + Shift + A, or URL param ?admin=1
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const currentIsAdmin = useAuthStore.getState().isAdmin;
        if (currentIsAdmin) {
          setIsAdminOpen((prev) => !prev);
        } else {
          setIsSettingsOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Check URL parameter on load
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === '1' || urlParams.get('admin') === 'true') {
        const currentIsAdmin = useAuthStore.getState().isAdmin;
        if (currentIsAdmin) {
          setIsAdminOpen(true);
        } else {
          setIsSettingsOpen(true);
        }
      }
    }

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else if (mediaQuery?.removeListener) {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const activeMessages = activeConversation ? messages[activeConversation.id] || [] : [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-[#0B1020] text-slate-900 dark:text-slate-100 antialiased font-sans">
      {/* Zone 1: Slim Nav Rail (Desktop lg+) */}
      <NavRail
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAdmin={() => {
          if (isAdmin) setIsAdminOpen(true);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAISearch={() => setIsAISearchOpen(true)}
        currentTheme={theme}
        onToggleTheme={handleQuickToggleTheme}
        isAdmin={isAdmin}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden relative">
        {/* Zone 2: Navigation / Master List (Chats or Calls) */}
        <div
          className={`w-full md:w-80 lg:w-96 h-full shrink-0 flex flex-col transition-all duration-200 ${
            activeConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeTab === 'calls' ? (
            <CallHistoryView />
          ) : (
            <ChatList
              onOpenNewChat={() => setIsNewChatOpen(true)}
              onOpenNewGroup={() => setIsNewGroupOpen(true)}
            />
          )}

          {/* Mobile Bottom Tab Bar (Visible on mobile/tablet when list is active) */}
          <MobileTabBar
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAISearch={() => setIsAISearchOpen(true)}
            onOpenAdmin={() => {
              if (isAdmin) setIsAdminOpen(true);
            }}
            currentTheme={theme}
            onToggleTheme={handleQuickToggleTheme}
            isAdmin={isAdmin}
          />
        </div>

        {/* Zone 3: Active Detail Pane (Conversation / Detail View) */}
        <div
          className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-200 ${
            activeConversationId ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeConversation ? (
            <div className="flex-1 flex h-full overflow-hidden relative">
              <ConversationPane
                conversation={activeConversation}
                onBack={() => setActiveConversation(null)}
                onForwardMessage={(msg) => setForwardingMessage(msg)}
                onOpenAISummarize={() => setIsAISummaryOpen(true)}
                onOpenSmartReplies={() => {}}
              />

              {/* Zone 4: Right Info Panel */}
              {isRightPanelOpen && (
                <>
                  {/* Desktop inline panel */}
                  <div className="hidden lg:block h-full shrink-0">
                    <RightInfoPanel
                      conversation={activeConversation}
                      onClose={toggleRightPanel}
                      onOpenAddMember={() => setIsNewChatOpen(true)}
                    />
                  </div>

                  {/* Mobile & Tablet slide-in drawer */}
                  <div className="lg:hidden fixed inset-0 z-40 flex justify-end animate-in fade-in duration-200">
                    <div
                      className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                      onClick={toggleRightPanel}
                      aria-hidden="true"
                    />
                    <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-[#0E1526] z-50 shadow-2xl animate-in slide-in-from-right duration-200">
                      <RightInfoPanel
                        conversation={activeConversation}
                        onClose={toggleRightPanel}
                        onOpenAddMember={() => setIsNewChatOpen(true)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Empty State when no conversation selected on desktop */
            <div className="hidden md:flex flex-1 items-center justify-center p-8 bg-slate-50 dark:bg-[#0B1020]">
              <EmptyState
                title="Select a chat to begin messaging"
                description="Choose from an existing conversation on the left, or create a new direct or group chat to collaborate in real-time."
                actionLabel="Start New Chat"
                onAction={() => setIsNewChatOpen(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Global Modals & Dialogs */}
      <CallModal />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={handleThemeChange}
        onOpenAdmin={() => {
          if (isAdmin) setIsAdminOpen(true);
        }}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen && isAdmin}
        onClose={() => setIsAdminOpen(false)}
      />

      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
      />

      <CreateGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
      />

      <ForwardModal
        message={forwardingMessage}
        onClose={() => setForwardingMessage(null)}
      />

      {activeConversation && (
        <AISummaryModal
          isOpen={isAISummaryOpen}
          onClose={() => setIsAISummaryOpen(false)}
          conversation={activeConversation}
          messages={activeMessages}
        />
      )}

      <AISemanticSearchModal
        isOpen={isAISearchOpen}
        onClose={() => setIsAISearchOpen(false)}
      />
    </div>
  );
}

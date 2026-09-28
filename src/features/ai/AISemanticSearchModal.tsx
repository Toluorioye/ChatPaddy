import React, { useState } from 'react';
import { Sparkles, Search, MessageSquare, ArrowRight, X } from 'lucide-react';
import { Modal } from '../../shared/ui/Modal';
import { Button } from '../../shared/ui/Button';
import { EmptyState } from '../../shared/ui/EmptyState';
import { useChatStore } from '../chat/chatStore';
import { UIMessage } from '../../types/chat.types';

interface AISemanticSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISemanticSearchModal: React.FC<AISemanticSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<
    Array<{ message: UIMessage; conversationName: string; relevance: string }>
  >([]);

  const { messages, conversations, setActiveConversation } = useChatStore();

  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    setTimeout(() => {
      const q = searchQuery.toLowerCase();
      const matched: Array<{ message: UIMessage; conversationName: string; relevance: string }> = [];

      Object.entries(messages).forEach(([convId, msgList]) => {
        const conv = conversations.find((c) => c.id === convId);
        msgList.forEach((m) => {
          if (m.content && m.content.toLowerCase().includes(q)) {
            matched.push({
              message: m,
              conversationName: conv?.name || 'Chat',
              relevance: 'Exact keyword match',
            });
          } else if (
            (q.includes('deadline') || q.includes('deploy') || q.includes('launch')) &&
            (m.content?.toLowerCase().includes('pr') ||
              m.content?.toLowerCase().includes('release') ||
              m.content?.toLowerCase().includes('staging'))
          ) {
            matched.push({
              message: m,
              conversationName: conv?.name || 'Chat',
              relevance: 'Semantic relevance: deployment & schedules',
            });
          } else if (
            (q.includes('security') || q.includes('database') || q.includes('schema')) &&
            (m.content?.toLowerCase().includes('rls') ||
              m.content?.toLowerCase().includes('sql') ||
              m.content?.toLowerCase().includes('postgres'))
          ) {
            matched.push({
              message: m,
              conversationName: conv?.name || 'Chat',
              relevance: 'Semantic relevance: data security & architecture',
            });
          }
        });
      });

      setResults(matched);
      setIsSearching(false);
    }, 350);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleSampleClick = (sample: string) => {
    setQuery(sample);
    performSearch(sample);
  };

  const handleJumpToMessage = (convId: string, messageId: string) => {
    setActiveConversation(convId);
    onClose();
    setTimeout(() => {
      const el = document.getElementById(messageId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 font-heading font-bold text-slate-900 dark:text-white">
          <Sparkles className="w-5 h-5 text-[#F59E0B]" />
          <span>Semantic Message Search</span>
        </div>
      }
      size="md"
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Search conversations naturally using concepts, topics, or plain English questions.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. database migration or real-time latency..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full bg-slate-100 dark:bg-[#131A2E] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl pl-9 pr-8 py-2.5 outline-none border border-transparent focus:border-[#4F46E5]"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setHasSearched(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button type="submit" variant="primary" size="sm" isLoading={isSearching}>
            Search
          </Button>
        </form>

        {/* Quick suggestion chips */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] text-slate-400 font-medium">Suggestions:</span>
          {['realtime latency', 'database migration', 'design tokens', 'PR review'].map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => handleSampleClick(sample)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-[#4F46E5] transition-colors cursor-pointer"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Results / Empty states */}
        <div className="max-h-72 overflow-y-auto space-y-2 mt-1">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
              <span className="w-5 h-5 rounded-full border-2 border-[#4F46E5] border-t-transparent animate-spin mb-2" />
              <span className="text-xs">Searching indexed messages...</span>
            </div>
          ) : !hasSearched ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              Type a search query or tap a suggestion above to search your message history.
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              title="No matching messages found"
              description={`No messages matched "${query}". Try searching for other keywords or topics.`}
            />
          ) : (
            results.map((res, i) => (
              <div
                key={i}
                onClick={() => handleJumpToMessage(res.message.conversation_id, res.message.id)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <MessageSquare className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span>{res.conversationName}</span>
                    <span className="font-normal text-slate-400">· {res.message.sender?.display_name}</span>
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                    {res.relevance}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {res.message.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

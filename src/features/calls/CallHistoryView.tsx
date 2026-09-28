import React, { useState } from 'react';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Video,
  Plus,
} from 'lucide-react';
import { Avatar } from '../../shared/ui/Avatar';
import { IconButton } from '../../shared/ui/IconButton';
import { EmptyState } from '../../shared/ui/EmptyState';
import { useChatStore } from '../chat/chatStore';
import { MOCK_USERS } from '../../lib/mockData';

export const CallHistoryView: React.FC = () => {
  const { startCall, setActiveTab } = useChatStore();
  const [filter, setFilter] = useState<'all' | 'missed'>('all');

  const allCalls = [
    {
      id: 'call_1',
      user: MOCK_USERS[1], // Ada Lovelace
      type: 'voice' as const,
      direction: 'incoming' as const,
      status: 'completed',
      duration: '14m 20s',
      time: 'Today, 2:15 PM',
      convId: 'conv_ada_direct',
    },
    {
      id: 'call_2',
      user: MOCK_USERS[2], // Chidi Anagonye
      type: 'video' as const,
      direction: 'outgoing' as const,
      status: 'completed',
      duration: '22m 04s',
      time: 'Yesterday, 5:30 PM',
      convId: 'conv_chidi_direct',
    },
    {
      id: 'call_3',
      user: MOCK_USERS[3], // Zainab Bello
      type: 'voice' as const,
      direction: 'missed' as const,
      status: 'missed',
      duration: 'Missed',
      time: 'Monday, 10:12 AM',
      convId: 'conv_zainab_direct',
    },
    {
      id: 'call_4',
      user: MOCK_USERS[1], // Ada Lovelace
      type: 'video' as const,
      direction: 'outgoing' as const,
      status: 'completed',
      duration: '08m 45s',
      time: 'Sept 18, 4:00 PM',
      convId: 'conv_ada_direct',
    },
  ];

  const filteredCalls = allCalls.filter((c) => (filter === 'missed' ? c.direction === 'missed' : true));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0E1526] border-r border-slate-200 dark:border-slate-800/80 select-none">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-heading font-extrabold text-slate-900 dark:text-white">
            Calls
          </h2>
          <p className="text-xs text-slate-400">Audio and video communications</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('missed')}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'missed'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Missed
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredCalls.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <EmptyState
              title={filter === 'missed' ? 'No missed calls' : 'No call logs'}
              description={
                filter === 'missed'
                  ? "You haven't missed any voice or video calls."
                  : 'Start a voice or video call with your contacts anytime.'
              }
              actionLabel="Return to Chats"
              onAction={() => setActiveTab('chats')}
            />
          </div>
        ) : (
          filteredCalls.map((call) => (
            <div
              key={call.id}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={call.user.avatar_url}
                  name={call.user.display_name}
                  size="md"
                  isOnline={call.user.is_online}
                  showOnlineStatus
                />

                <div className="truncate">
                  <div
                    className={`text-sm font-semibold truncate ${
                      call.direction === 'missed' ? 'text-rose-500' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {call.user.display_name}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    {call.direction === 'incoming' && (
                      <PhoneIncoming className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    {call.direction === 'outgoing' && (
                      <PhoneOutgoing className="w-3.5 h-3.5 text-[#4F46E5]" />
                    )}
                    {call.direction === 'missed' && (
                      <PhoneMissed className="w-3.5 h-3.5 text-rose-500" />
                    )}

                    <span>{call.time}</span>
                    <span>·</span>
                    <span>{call.duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <IconButton
                  aria-label="Call voice"
                  size="sm"
                  variant="ghost"
                  onClick={() => startCall(call.convId, 'voice')}
                  className="text-slate-500 hover:text-[#4F46E5]"
                >
                  <Phone className="w-4 h-4" />
                </IconButton>
                <IconButton
                  aria-label="Call video"
                  size="sm"
                  variant="ghost"
                  onClick={() => startCall(call.convId, 'video')}
                  className="text-slate-500 hover:text-[#4F46E5]"
                >
                  <Video className="w-4 h-4" />
                </IconButton>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

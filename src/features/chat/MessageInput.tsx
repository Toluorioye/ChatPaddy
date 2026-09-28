import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Square,
  X,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Check,
  Edit2,
  Trash2,
} from 'lucide-react';
import { IconButton } from '../../shared/ui/IconButton';
import { Button } from '../../shared/ui/Button';
import { useChatStore } from './chatStore';
import { useToast } from '../../shared/ui/Toast';
import { sanitizeInputText } from '../../shared/utils/security';

interface MessageInputProps {
  conversationId: string;
  onOpenAISummarize?: () => void;
  onOpenSmartReplies?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  onOpenAISummarize,
  onOpenSmartReplies,
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingTimerRef = useRef<any>(null);

  const {
    sendMessage,
    replyingToMessage,
    setReplyingToMessage,
    editingMessage,
    setEditingMessage,
    editMessage,
    sendTyping,
  } = useChatStore();

  const { toast } = useToast();

  // If editing message, populate input
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  // Voice recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const handleSend = async () => {
    const trimmed = sanitizeInputText(text);
    if (!trimmed && !isRecording) return;

    if (editingMessage) {
      await editMessage(editingMessage.id, trimmed);
      setText('');
      setEditingMessage(null);
      return;
    }

    // Rate-limit check & debounce
    sendTyping(false);
    await sendMessage({
      content: trimmed,
      type: 'text',
      replyToId: replyingToMessage?.id,
    });

    setText('');
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    sendTyping(e.target.value.length > 0);

    // Auto resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isImageOnly = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      toast({
        type: 'error',
        title: 'File Too Large',
        message: 'Maximum file size is 10MB.',
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const isImage = file.type.startsWith('image/');

    sendMessage({
      content: isImage ? '' : file.name,
      type: isImage ? 'image' : 'file',
      attachments: [
        {
          id: `att_${Date.now()}`,
          message_id: '',
          storage_path: objectUrl,
          file_name: file.name,
          mime_type: file.type,
          size: file.size,
          duration: null,
          created_at: new Date().toISOString(),
        },
      ],
    });

    setShowAttachmentMenu(false);
  };

  const handleStartVoiceRecord = () => {
    setIsRecording(true);
  };

  const handleStopVoiceRecord = (shouldSend: boolean) => {
    setIsRecording(false);
    if (shouldSend) {
      sendMessage({
        content: '',
        type: 'voice',
        attachments: [
          {
            id: `att_voice_${Date.now()}`,
            message_id: '',
            storage_path: 'voice_recording',
            file_name: `Voice note (${recordingDuration}s)`,
            mime_type: 'audio/webm',
            size: 32000,
            duration: recordingDuration || 8,
            created_at: new Date().toISOString(),
          },
        ],
      });
      toast({
        type: 'success',
        title: 'Voice Note Sent',
        message: `Recorded ${recordingDuration} seconds.`,
      });
    }
    setRecordingDuration(0);
  };

  // Common emoji picker catalog
  const emojiCategories = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😋', '😛',
    '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👏', '🙌',
    '🔥', '✨', '⚡', '🎉', '🚀', '❤️', '🧡', '💛', '💚', '💙',
    '💡', '💯', '🏆', '🎯', '💻', '📱', '🔒', '🔑', '☕', '🍕',
  ];

  const formatRecordTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-3 sm:p-4 bg-white dark:bg-[#0E1526] border-t border-slate-200 dark:border-slate-800/80 relative">
      {/* Reply banner preview */}
      {replyingToMessage && (
        <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border-l-4 border-[#4F46E5] text-xs animate-in slide-in-from-bottom-2">
          <div className="truncate pr-2">
            <span className="font-bold text-[#4F46E5] dark:text-indigo-300">
              Replying to {replyingToMessage.sender?.display_name}:{' '}
            </span>
            <span className="text-slate-600 dark:text-slate-300 truncate">
              {replyingToMessage.content || 'Attachment'}
            </span>
          </div>
          <IconButton
            aria-label="Cancel reply"
            size="xs"
            variant="ghost"
            onClick={() => setReplyingToMessage(null)}
          >
            <X className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      )}

      {/* Edit message banner preview */}
      {editingMessage && (
        <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border-l-4 border-amber-500 text-xs animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
            <Edit2 className="w-3.5 h-3.5" /> Editing Message
          </div>
          <IconButton
            aria-label="Cancel edit"
            size="xs"
            variant="ghost"
            onClick={() => {
              setEditingMessage(null);
              setText('');
            }}
          >
            <X className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-40 bg-white dark:bg-[#131A2E] p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-72 animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
            <span>Frequently Used Emojis</span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto">
            {emojiCategories.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setText((prev) => prev + emoji);
                  textareaRef.current?.focus();
                }}
                className="w-7 h-7 flex items-center justify-center text-lg hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-transform hover:scale-125 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Menu Popover */}
      {showAttachmentMenu && (
        <div className="absolute bottom-16 left-12 z-40 bg-white dark:bg-[#131A2E] p-2 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-48 animate-in zoom-in-95 duration-150">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="w-full flex items-center gap-3 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-[#4F46E5] transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950">
              <ImageIcon className="w-4 h-4" />
            </div>
            <span>Photo / Image</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-[#4F46E5] transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950">
              <FileText className="w-4 h-4" />
            </div>
            <span>Document / File</span>
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        onChange={(e) => handleFileUpload(e, true)}
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e, false)}
        className="hidden"
      />

      {/* Input Action Bar */}
      {isRecording ? (
        /* Voice Recording Active Bar */
        <div className="flex items-center justify-between p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 animate-pulse">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold pl-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span>Recording audio note: {formatRecordTime(recordingDuration)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStopVoiceRecord(false)}
              className="text-slate-500 hover:text-rose-600"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleStopVoiceRecord(true)}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send Voice
            </Button>
          </div>
        </div>
      ) : (
        /* Standard Message Bar */
        <div className="flex items-end gap-1.5 bg-slate-100 dark:bg-[#131A2E] rounded-2xl p-1.5 border border-slate-200 dark:border-slate-800 focus-within:border-[#4F46E5] focus-within:ring-2 focus-within:ring-[#4F46E5]/20 transition-all">
          {/* Attachment button */}
          <IconButton
            aria-label="Add attachment"
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowAttachmentMenu(!showAttachmentMenu);
              setShowEmojiPicker(false);
            }}
            className="text-slate-500 dark:text-slate-400 hover:text-[#4F46E5]"
          >
            <Paperclip className="w-4 h-4" />
          </IconButton>

          {/* Emoji button */}
          <IconButton
            aria-label="Pick emoji"
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachmentMenu(false);
            }}
            className="text-slate-500 dark:text-slate-400 hover:text-amber-500"
          >
            <Smile className="w-4 h-4" />
          </IconButton>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={editingMessage ? 'Edit your message...' : 'Type a message... (Enter to send)'}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border-none outline-none resize-none py-2 px-1 max-h-32 min-h-[36px]"
          />

          {/* Quick Voice / Send Action */}
          {text.trim() || editingMessage ? (
            <IconButton
              aria-label={editingMessage ? 'Save edit' : 'Send message'}
              size="sm"
              variant="primary"
              onClick={handleSend}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white"
            >
              {editingMessage ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            </IconButton>
          ) : (
            <IconButton
              aria-label="Record voice message"
              size="sm"
              variant="ghost"
              onClick={handleStartVoiceRecord}
              className="text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Mic className="w-4 h-4" />
            </IconButton>
          )}
        </div>
      )}
    </div>
  );
};

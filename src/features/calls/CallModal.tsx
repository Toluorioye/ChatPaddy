import React, { useEffect, useState, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Volume2,
  Minimize2,
} from 'lucide-react';
import { Avatar } from '../../shared/ui/Avatar';
import { IconButton } from '../../shared/ui/IconButton';
import { useChatStore } from '../chat/chatStore';

export const CallModal: React.FC = () => {
  const { callState, endCall, toggleCallMute, toggleCallCamera, toggleCallScreenShare } =
    useChatStore();
  const [timer, setTimer] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Call duration counter
  useEffect(() => {
    let interval: any = null;
    if (callState.isOpen && callState.status === 'connected') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState.isOpen, callState.status]);

  // Request camera stream if video call
  useEffect(() => {
    if (callState.isOpen && callState.callType === 'video' && !callState.isCameraOff) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            setLocalStream(stream);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch((err) => {
            console.log('Camera permission or availability note:', err);
          });
      }
    } else {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [callState.isOpen, callState.callType, callState.isCameraOff]);

  if (!callState.isOpen) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#131A2E] rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle top indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 text-xs text-slate-300 mb-6">
          <span
            className={`w-2 h-2 rounded-full ${
              callState.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400 animate-ping'
            }`}
          />
          <span className="capitalize font-medium">
            {callState.status === 'connected'
              ? `Connected · ${formatDuration(timer)}`
              : `Calling ${callState.recipient?.display_name}...`}
          </span>
        </div>

        {/* Video stream or Avatar */}
        {callState.callType === 'video' && !callState.isCameraOff && localStream ? (
          <div className="w-full h-64 rounded-2xl overflow-hidden bg-black mb-6 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-[10px] text-white">
              Your Camera
            </div>
          </div>
        ) : (
          <div className="relative my-6 flex flex-col items-center">
            {/* Animated ringing pulse rings */}
            {callState.status === 'ringing' && (
              <>
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping -m-4" />
                <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-pulse -m-8" />
              </>
            )}
            <Avatar
              src={callState.recipient?.avatar_url}
              name={callState.recipient?.display_name || 'Contact'}
              size="xl"
              className="w-24 h-24 text-2xl ring-4 ring-indigo-500/30 shadow-xl"
            />
          </div>
        )}

        {/* Name & status */}
        <h3 className="text-xl font-heading font-bold text-white mb-1">
          {callState.recipient?.display_name || 'Contact'}
        </h3>
        <p className="text-xs text-slate-400 mb-8">
          {callState.callType === 'video' ? 'ChatPaddy HD Video Call' : 'ChatPaddy High-Fidelity Audio'}
        </p>

        {/* Call Controls Toolbar */}
        <div className="flex items-center gap-4">
          {/* Mute */}
          <IconButton
            aria-label={callState.isMuted ? 'Unmute microphone' : 'Mute microphone'}
            size="lg"
            variant="secondary"
            onClick={toggleCallMute}
            className={`rounded-full ${
              callState.isMuted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-200'
            }`}
          >
            {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </IconButton>

          {/* Camera toggle */}
          {callState.callType === 'video' && (
            <IconButton
              aria-label={callState.isCameraOff ? 'Turn camera on' : 'Turn camera off'}
              size="lg"
              variant="secondary"
              onClick={toggleCallCamera}
              className={`rounded-full ${
                callState.isCameraOff ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-200'
              }`}
            >
              {callState.isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </IconButton>
          )}

          {/* Screen share */}
          <IconButton
            aria-label="Share screen"
            size="lg"
            variant="secondary"
            onClick={toggleCallScreenShare}
            className={`rounded-full ${
              callState.isScreenSharing ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-200'
            }`}
          >
            <Monitor className="w-5 h-5" />
          </IconButton>

          {/* End Call Button */}
          <button
            onClick={endCall}
            aria-label="End call"
            className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform cursor-pointer"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

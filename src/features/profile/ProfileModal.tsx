import React, { useState, useRef } from 'react';
import { Camera, User, AtSign, Phone, FileText, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../../shared/ui/Modal';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { Avatar } from '../../shared/ui/Avatar';
import { useAuthStore } from '../auth/authStore';
import { useToast } from '../../shared/ui/Toast';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuthStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [statusText, setStatusText] = useState(user?.status_text || 'Available');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WebP, GIF)');
      return;
    }

    // Size validation: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Avatar image size must be under 5MB');
      return;
    }

    setError(null);
    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim()) {
      setError('Display name and username are required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let finalAvatarUrl = avatarPreview;

      // If user uploaded a new image file and Supabase is configured
      if (avatarFile && isSupabaseConfigured && user) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          finalAvatarUrl = publicUrl;
        }
      }

      await updateProfile({
        display_name: displayName.trim(),
        username: username.toLowerCase().trim(),
        bio: bio.trim(),
        phone: phone.trim() || null,
        status_text: statusText.trim(),
        avatar_url: finalAvatarUrl,
      });

      toast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile changes have been saved.',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="md">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Avatar Upload Area */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Avatar
              src={avatarPreview}
              name={displayName || 'User'}
              size="xl"
              className="ring-4 ring-white dark:ring-slate-800 shadow-md"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarSelect}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Profile Photo
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              JPG, PNG or GIF. Max 5MB.
            </p>
            <div className="flex gap-2 mt-2.5 justify-center sm:justify-start">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload New
              </Button>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAvatarPreview(null);
                    setAvatarFile(null);
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Name and Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Display Name"
            placeholder="Alex Rivera"
            leftIcon={<User className="w-4 h-4" />}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <Input
            label="Username"
            placeholder="alex_dev"
            leftIcon={<AtSign className="w-4 h-4" />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Status text */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
            Status Message
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Coding in flow ⚡"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
            />
            {['Coding ⚡', 'Available ✨', 'In a call 🎧'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setStatusText(preset)}
                className="hidden sm:inline-block whitespace-nowrap text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Bio
          </label>
          <textarea
            rows={3}
            placeholder="Tell your team a little about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-white dark:bg-[#131A2E] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 focus:border-[#4F46E5] resize-none"
          />
        </div>

        {/* Phone */}
        <Input
          label="Phone (optional)"
          placeholder="+1 (555) 000-0000"
          leftIcon={<Phone className="w-4 h-4" />}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

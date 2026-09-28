import React, { useState } from 'react';
import { z } from 'zod';
import { Mail, Lock, User, AtSign, ArrowRight, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Modal } from '../../shared/ui/Modal';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { Logo } from '../../shared/ui/Logo';
import { useAuthStore } from './authStore';
import { useToast } from '../../shared/ui/Toast';
import { MOCK_USERS, CURRENT_USER, ADMIN_USER } from '../../lib/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { signInWithPassword, signUpWithPassword, resetPassword, signInDemoUser, isConfigured } = useAuthStore();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const validated = signInSchema.parse({
          email: formData.email,
          password: formData.password,
        });

        const res = await signInWithPassword(validated.email, validated.password);
        if (res.success) {
          toast({
            type: 'success',
            title: 'Welcome back!',
            message: 'Successfully signed in to ChatPaddy.',
          });
          onClose();
        } else {
          setErrors({ general: res.error || 'Failed to sign in.' });
        }
      } else if (mode === 'signup') {
        const validated = signUpSchema.parse(formData);
        const res = await signUpWithPassword(
          validated.email,
          validated.password,
          validated.displayName,
          validated.username
        );
        if (res.success) {
          toast({
            type: 'success',
            title: 'Account created!',
            message: 'Welcome to ChatPaddy! Your profile is ready.',
          });
          onClose();
        } else {
          setErrors({ general: res.error || 'Failed to sign up.' });
        }
      } else if (mode === 'forgot') {
        if (!formData.email || !formData.email.includes('@')) {
          setErrors({ email: 'Please enter a valid email.' });
          setIsSubmitting(false);
          return;
        }
        await resetPassword(formData.email);
        setResetSent(true);
      }
    } catch (err: any) {
      if (err?.issues) {
        const formErrors: Record<string, string> = {};
        err.issues.forEach((e: any) => {
          if (e.path[0]) formErrors[e.path[0] as string] = e.message;
        });
        setErrors(formErrors);
      } else {
        setErrors({ general: err.message || 'An unexpected error occurred' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (userProfile: any) => {
    signInDemoUser(userProfile);
    toast({
      type: 'info',
      title: `Switched user to ${userProfile.display_name}`,
      message: `@${userProfile.username} is now active.`,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center mb-6">
        <Logo size="md" showWordmark={true} showTagline={true} className="mb-2" />
        <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white mt-3">
          {mode === 'signin' && 'Sign in to ChatPaddy'}
          {mode === 'signup' && 'Create your account'}
          {mode === 'forgot' && 'Reset your password'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {mode === 'signin' && 'Enter your credentials to continue your chats'}
          {mode === 'signup' && 'Start real-time messaging with your team in seconds'}
          {mode === 'forgot' && "We'll send you a password recovery link"}
        </p>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
          {errors.general}
        </div>
      )}

      {resetSent ? (
        <div className="text-center py-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Email Sent!</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
            If an account exists for {formData.email}, you will receive a reset link shortly.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setResetSent(false);
              setMode('signin');
            }}
          >
            Back to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === 'signup' && (
            <>
              <Input
                label="Full Name"
                placeholder="e.g. Ada Lovelace"
                leftIcon={<User className="w-4 h-4" />}
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                error={errors.displayName}
                required
              />
              <Input
                label="Username"
                placeholder="e.g. ada_code"
                leftIcon={<AtSign className="w-4 h-4" />}
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                error={errors.username}
                required
              />
            </>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="alex@chatpaddy.com"
            leftIcon={<Mail className="w-4 h-4" />}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            required
          />

          {mode !== 'forgot' && (
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                required
              />
              {mode === 'signin' && (
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-[#4F46E5] dark:text-[#818CF8] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            className="w-full mt-2"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Send Reset Link'}
          </Button>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            {mode === 'signin' ? (
              <>
                <span>Don't have an account?</span>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-semibold text-[#4F46E5] dark:text-[#818CF8] hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="font-semibold text-[#4F46E5] dark:text-[#818CF8] hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>
      )}

      {/* Quick Demo Switcher */}
      <div className="mt-6 pt-5 border-t border-dashed border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#F59E0B]" /> Instant Test Personas
          </span>
          <span className="text-[10px] text-slate-400">1-click login</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[CURRENT_USER, ...MOCK_USERS.slice(1, 4)].map((persona) => (
            <button
              key={persona.id}
              type="button"
              onClick={() => handleQuickDemo(persona)}
              className="flex items-center gap-2 p-2 rounded-xl text-left text-xs bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-100 dark:border-slate-800/80 transition-all hover:border-[#4F46E5]/40"
            >
              <img
                src={persona.avatar_url || ''}
                alt={persona.display_name}
                className="w-6 h-6 rounded-full object-cover shrink-0"
              />
              <div className="truncate">
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {persona.display_name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">@{persona.username}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Administrator Quick Access */}
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => handleQuickDemo(ADMIN_USER)}
            className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100/90 dark:hover:bg-indigo-900/60 border border-indigo-200/90 dark:border-indigo-800/80 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  Platform Administrator
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-200 font-extrabold tracking-wide uppercase">
                    Admin Access
                  </span>
                </div>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400">@admin &bull; Master controls & dashboard</div>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
              Switch &rarr;
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

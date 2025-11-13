import { Lock01 } from '@untitledui/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type LoaderFunctionArgs, redirect, useNavigate } from 'react-router';
import { Alert, Button, Card, Divider, Input, Label, SegmentedControl } from '@/components/ui';
import { LanguageSwitcher } from '../components/language-switcher';
import { authClient } from '../lib/auth-client';

export async function loginLoader(_: LoaderFunctionArgs) {
  // Check if user is already signed in with Better Auth
  const session = await authClient.getSession();
  if (session?.data) {
    throw redirect('/');
  }
  return null;
}

export function LoginRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  // Check session on mount
  useEffect(() => {
    authClient.getSession().then((session) => {
      if (session?.data) {
        navigate('/');
      }
    });
  }, [navigate]);

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const result = await authClient.signUp.email({
          email: formData.email,
          password: formData.password,
          name: formData.name || formData.email.split('@')[0],
        });

        if (result.error) {
          setError(result.error.message || t('login.signUpFailed'));
          return;
        }
      } else {
        const result = await authClient.signIn.email({
          email: formData.email,
          password: formData.password,
        });

        if (result.error) {
          setError(result.error.message || t('login.signInFailed'));
          return;
        }
      }

      // Redirect on success
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeySignIn = async () => {
    setIsLoading(true);
    setError(null);

    // Check if WebAuthn is supported
    if (!globalThis.PublicKeyCredential) {
      setError(
        'Passkeys are not supported in this browser. Please use a modern browser that supports WebAuthn.'
      );
      setIsLoading(false);
      return;
    }

    // Note: You may see a browser console warning "port.close of passkey-signin-prompt failed"
    // This is harmless and occurs when the WebAuthn prompt is cancelled or closed.
    // It's a browser internal message and doesn't affect functionality.

    // Helper function to attempt passkey sign-in
    const attemptPasskeySignIn = (useAutoFill: boolean): Promise<boolean> => {
      return new Promise((resolve) => {
        authClient.signIn
          .passkey({
            autoFill: useAutoFill,
            fetchOptions: {
              onSuccess: () => {
                setIsLoading(false);
                navigate('/');
                resolve(true);
              },
              onError: (ctx) => {
                if (ctx.error && 'code' in ctx.error && ctx.error.code === 'AUTH_CANCELLED') {
                  // User cancelled - don't treat as error, just resolve as false
                  resolve(false);
                } else {
                  // Other error - show message and resolve as false
                  const errorMessage = ctx.error?.message || t('login.passkeySignInFailed');
                  setError(errorMessage);
                  setIsLoading(false);
                  resolve(false);
                }
              },
            },
          })
          .then((result) => {
            // Handle result if callbacks didn't fire
            if (result?.error) {
              if ('code' in result.error && result.error.code === 'AUTH_CANCELLED') {
                resolve(false);
              } else {
                setError(result.error.message || t('login.passkeySignInFailed'));
                setIsLoading(false);
                resolve(false);
              }
            } else if (result?.data) {
              setIsLoading(false);
              navigate('/');
              resolve(true);
            } else {
              resolve(false);
            }
          })
          .catch(() => {
            resolve(false);
          });
      });
    };

    try {
      // First try with autoFill
      const success = await attemptPasskeySignIn(true);

      // If autoFill was cancelled, try without autoFill (user will see selection dialog)
      if (!success) {
        const retrySuccess = await attemptPasskeySignIn(false);

        if (!retrySuccess) {
          // Both attempts failed or were cancelled
          setError(
            'Passkey sign-in was cancelled. Please try again and select your passkey when prompted.'
          );
          setIsLoading(false);
        }
      }
    } catch (err) {
      // Catch any unexpected errors
      setError(err instanceof Error ? err.message : t('login.passkeyAuthFailed'));
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="-top-24 absolute right-1/3 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      {/* Language switcher */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>

      {/* Login card */}
      <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Card className="relative overflow-hidden border-white/10 bg-slate-900/60 p-8 shadow-[0_40px_120px_rgba(8,47,73,0.35)] backdrop-blur">
            {/* Brand header */}
            <header className="mb-8 text-center">
              <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-linear-to-br from-brand-400 via-brand-500 to-sky-500 text-3xl shadow-[0_20px_50px_rgba(99,102,241,0.4)]">
                🌮
              </div>
              <h1 className="font-semibold text-3xl text-white tracking-tight">
                {mode === 'signin' ? t('login.title') : t('login.signUp.title')}
              </h1>
              <p className="mt-2 text-slate-300 text-sm">
                {mode === 'signin' ? t('login.subtitle') : t('login.signUp.subtitle')}
              </p>
            </header>

            {/* Mode toggle */}
            <SegmentedControl
              className="mb-6"
              value={mode}
              onValueChange={(nextMode) => {
                setMode(nextMode);
                setError(null);
              }}
              options={[
                { value: 'signin', label: t('login.signIn') },
                { value: 'signup', label: t('login.signUpButton') },
              ]}
            />

            {/* Passkey Sign In Button (only for sign in mode) */}
            {mode === 'signin' && (
              <>
                <Button
                  type="button"
                  onClick={handlePasskeySignIn}
                  disabled={isLoading}
                  variant="secondary"
                  fullWidth
                  className="mb-6"
                >
                  <Lock01 size={18} />
                  {t('login.signInWithPasskey')}
                </Button>

                <Divider className="mb-6" label={t('login.orUsePassword')} />
              </>
            )}

            {/* Email/Password form */}
            <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">{t('login.name.label')}</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('login.name.placeholder')}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('login.email.label')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('login.email.placeholder')}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('login.password.label')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t('login.password.placeholder')}
                  required
                  disabled={isLoading}
                  minLength={8}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
              </div>

              {error && <Alert tone="error">{error}</Alert>}

              <Button type="submit" disabled={isLoading} variant="primary" size="lg" fullWidth>
                {isLoading
                  ? t('login.pleaseWait')
                  : mode === 'signin'
                    ? t('login.signIn')
                    : t('login.signUpButton')}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

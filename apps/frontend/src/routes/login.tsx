import { useTranslation } from 'react-i18next';
import {
  type ActionFunctionArgs,
  Form,
  type LoaderFunctionArgs,
  redirect,
  useActionData,
  useNavigation,
} from 'react-router';
import { Button, Input } from '@/components/ui';
import { LanguageSwitcher } from '../components/language-switcher';
import { AuthApi } from '../lib/api';
import { ApiError } from '../lib/api/http';
import { sessionStore } from '../lib/session/store';

type LoginActionData = {
  error?: string;
};

export function loginLoader(_: LoaderFunctionArgs) {
  if (sessionStore.getSession()) {
    throw redirect('/');
  }
  return null;
}

export async function loginAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const username = String(formData.get('username') ?? '').trim();

  if (!username) {
    return Response.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const result = await AuthApi.login({ username });

    sessionStore.setSession({
      token: result.token,
      username: result.user.username,
      userId: result.user.id,
    });

    return redirect('/');
  } catch (error) {
    if (error instanceof ApiError) {
      const message =
        typeof error.body === 'object' && error.body && 'error' in error.body
          ? ((error.body as { error?: { message?: string } }).error?.message ?? error.message)
          : error.message;

      return Response.json({ error: message }, { status: error.status });
    }

    return Response.json({ error: 'Unexpected error. Please try again.' }, { status: 500 });
  }
}

export function LoginRoute() {
  const { t } = useTranslation();
  const actionData = useActionData() as LoginActionData | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md">
        <div className="absolute right-4 top-4 z-10">
          <LanguageSwitcher variant="compact" />
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-[0_40px_120px_rgba(99,102,241,0.25)] backdrop-blur md:p-10">
          {/* Brand section */}
          <div className="mb-8 flex flex-col items-center gap-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 via-brand-500 to-sky-500 text-3xl shadow-[0_20px_60px_rgba(99,102,241,0.35)]">
              🌮
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                {t('login.title')}
              </h1>
              <p className="text-sm text-slate-300">{t('login.subtitle')}</p>
            </div>
          </div>

          {/* Form */}
          <Form method="post" className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-slate-200">
                {t('common.username')}
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder={t('login.usernamePlaceholder')}
                required
                disabled={isSubmitting}
                error={!!actionData?.error}
              />
            </div>

            {actionData?.error ? (
              <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                {actionData.error}
              </div>
            ) : null}

            <Button type="submit" disabled={isSubmitting} loading={isSubmitting} fullWidth>
              {isSubmitting ? t('common.signingIn') : t('common.signIn')}
            </Button>
          </Form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              {t('root.tacobot')} · {t('root.appTitle')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

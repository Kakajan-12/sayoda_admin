'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LocaleProvider, useAdminLocale } from '@/lib/i18n/LocaleProvider';
import { LOCALES } from '@/lib/i18n/dictionary';
import { TOKEN_KEY } from '@/lib/auth';

/**
 * Вход в админку.
 *
 * Форма стояла белой карточкой на тёмно-синем поле во весь экран, а
 * заголовок был написан белым по белому — читался он только потому, что
 * рядом стоял класс с цветом. Здесь спокойный фон палитры сайта и
 * нормальная иерархия.
 */
const LoginForm = () => {
    const router = useRouter();
    const { locale, setLocale, t } = useAdminLocale();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSending(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                setError(data?.errors?.[0]?.msg || t('login.error'));
                return;
            }

            const data = await response.json();
            localStorage.setItem(TOKEN_KEY, data.token);
            router.push('/admin');
        } catch (err) {
            console.error(err);
            setError(t('login.error'));
        } finally {
            setSending(false);
        }
    };

    const field =
        'w-full rounded-md border border-sand bg-white px-4 py-2.5 text-base text-ink outline-none transition focus:border-tileLight';

    return (
        <div className="flex min-h-screen items-center justify-center bg-paper px-5">
            <div className="w-full max-w-sm">
                <div className="mb-6 text-center">
                    <p className="text-2xl font-bold tracking-wide text-tile">SAYODA</p>
                    <p className="text-xs uppercase tracking-widest text-inkMuted">admin</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-lg border border-sand bg-white p-8 shadow-sm"
                >
                    <h1 className="mb-6 text-lg font-semibold text-ink">{t('login.title')}</h1>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="mb-1 block text-sm text-inkMuted">
                                {t('login.username')}
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoComplete="username"
                                className={field}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1 block text-sm text-inkMuted">
                                {t('login.password')}
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className={field}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="mt-4 rounded-md bg-brick/10 px-3 py-2 text-sm text-brick">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={sending}
                        className="mt-6 w-full rounded-md bg-tile py-3 font-semibold text-white transition-colors hover:bg-tileDark disabled:opacity-60"
                    >
                        {sending ? '…' : t('login.submit')}
                    </button>
                </form>

                {/* Язык выбирают до входа: иначе форма встречает на языке,
                    которого человек может не знать. */}
                <div className="mt-4 flex justify-center gap-2">
                    {LOCALES.map((code) => (
                        <button
                            key={code}
                            type="button"
                            onClick={() => setLocale(code)}
                            aria-pressed={locale === code}
                            className={`rounded px-2 py-1 text-xs font-semibold uppercase transition-colors ${
                                locale === code
                                    ? 'bg-tile text-white'
                                    : 'text-inkMuted hover:bg-tileTint hover:text-tile'
                            }`}
                        >
                            {code}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Login = () => (
    <LocaleProvider>
        <LoginForm />
    </LocaleProvider>
);

export default Login;

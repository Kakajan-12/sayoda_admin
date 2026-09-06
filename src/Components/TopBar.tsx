'use client'
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LuLogOut, LuExternalLink } from "react-icons/lu";
import { clearToken, decodeJwtPayload, readToken } from "@/lib/auth";
import { findNavLink } from "@/lib/navigation";
import { useAdminLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALES, LOCALE_LABEL } from "@/lib/i18n/dictionary";

const SITE_URL = 'https://sayodatravel.com';

/**
 * Шапка рабочей области.
 *
 * На её месте раньше стоял блок с огромным «Admin Panel» и строкой
 * «Expiration Date: …». Он повторялся на каждой из 77 страниц, был крупнее
 * заголовка самого раздела и сообщал ровно одно — когда истечёт токен.
 * Человеку нужно другое: где он сейчас находится и как выйти.
 *
 * Срок сеанса остался, но ушёл в правый угол мелким текстом и появляется
 * только когда до конца меньше получаса — до этого он не новость.
 */
const TopBar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { locale, setLocale, t } = useAdminLocale();
    const [expiresAt, setExpiresAt] = useState<number | null>(null);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const token = readToken();
        if (!token) {
            router.push('/');
            return;
        }
        const decoded = decodeJwtPayload(token);
        if (!decoded || decoded.exp * 1000 < Date.now()) {
            clearToken();
            router.push('/');
            return;
        }
        setExpiresAt(decoded.exp * 1000);
    }, [router, pathname]);

    // Пересчитываем раз в минуту: секундный отсчёт здесь только отвлекает.
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(id);
    }, []);

    const current = findNavLink(pathname);
    const title = current ? t(current.labelKey) : t('nav.dashboard');

    const minutesLeft = expiresAt ? Math.round((expiresAt - now) / 60_000) : null;
    const showExpiry = minutesLeft !== null && minutesLeft <= 30;

    const logout = () => {
        clearToken();
        router.push('/');
    };

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-sand bg-white/95 px-6 backdrop-blur">
            <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-ink">
                {title}
            </h1>

            {showExpiry && (
                <span className="hidden shrink-0 rounded-full bg-sand px-3 py-1 text-xs text-inkMuted sm:inline">
                    {t('top.session')}{' '}
                    {new Date(expiresAt!).toLocaleTimeString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </span>
            )}

            {/* Переключатель языка интерфейса. Два языка — значит две кнопки:
                выпадающий список ради двух пунктов только добавляет клик. */}
            <div
                className="flex shrink-0 overflow-hidden rounded-md border border-sand"
                role="group"
                aria-label={t('top.language')}
            >
                {LOCALES.map((code) => (
                    <button
                        key={code}
                        type="button"
                        onClick={() => setLocale(code)}
                        title={LOCALE_LABEL[code]}
                        aria-pressed={locale === code}
                        className={`px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
                            locale === code
                                ? 'bg-tile text-white'
                                : 'bg-white text-inkMuted hover:bg-tileTint hover:text-tile'
                        }`}
                    >
                        {code}
                    </button>
                ))}
            </div>

            <a
                href={SITE_URL}
                target="_blank"
                rel="noreferrer"
                title={t('top.openSite')}
                className="hidden shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-inkMuted transition-colors hover:bg-tileTint hover:text-tile md:flex"
            >
                <LuExternalLink className="size-4" />
                {t('top.openSite')}
            </a>

            <button
                type="button"
                onClick={logout}
                className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-inkMuted transition-colors hover:bg-tileTint hover:text-tile"
            >
                <LuLogOut className="size-4" />
                <span className="hidden sm:inline">{t('top.logout')}</span>
            </button>
        </header>
    );
};

export default TopBar;

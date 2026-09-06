'use client'
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuLayoutDashboard } from "react-icons/lu";
import { isActiveHref, navGroups } from "@/lib/navigation";
import { useT } from "@/lib/i18n/LocaleProvider";

/**
 * Меню админки.
 *
 * Было три проблемы. Группы схлопывались, и чтобы найти раздел, приходилось
 * открывать их по очереди — при 24 разделах это перебор вслепую. Переходы шли
 * обычными <a>, то есть каждый клик перезагружал всё приложение целиком.
 * И подписи были английскими, хотя часть разделов уже переехала на русский.
 *
 * Теперь всё открыто сразу: список длинный, но прокрутка дешевле, чем
 * угадывание, в какой группе лежит нужное. Переходы — через Link, без
 * перезагрузки.
 */
const Sidebar = () => {
    const pathname = usePathname();
    const t = useT();

    const dashboardActive = pathname === '/admin';

    return (
        <aside
            className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-sand bg-white"
            aria-label={t('nav.dashboard')}
        >
            <div className="flex h-16 shrink-0 items-center border-b border-sand px-5">
                <span className="text-lg font-bold tracking-wide text-tile">SAYODA</span>
                <span className="ml-2 text-xs uppercase tracking-widest text-inkMuted">admin</span>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <Link
                    href="/admin"
                    className={`mb-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        dashboardActive
                            ? 'bg-tile text-white'
                            : 'text-ink hover:bg-tileTint hover:text-tile'
                    }`}
                >
                    <LuLayoutDashboard className="size-5 shrink-0" />
                    {t('nav.dashboard')}
                </Link>

                {navGroups.map((group) => (
                    <div key={group.key} className="mb-5">
                        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-inkMuted">
                            {t(group.titleKey)}
                        </p>
                        <ul className="space-y-0.5">
                            {group.links.map(({ href, labelKey, icon: Icon }) => {
                                const active = isActiveHref(pathname, href);
                                return (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            aria-current={active ? 'page' : undefined}
                                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                                                active
                                                    ? 'bg-tile font-medium text-white'
                                                    : 'text-ink hover:bg-tileTint hover:text-tile'
                                            }`}
                                        >
                                            <Icon
                                                className={`size-[18px] shrink-0 ${
                                                    active ? 'text-white' : 'text-inkMuted'
                                                }`}
                                            />
                                            <span className="min-w-0 truncate">{t(labelKey)}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;

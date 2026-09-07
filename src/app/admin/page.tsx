'use client'
import { useT } from "@/lib/i18n/LocaleProvider";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { LuInbox, LuArrowRight } from "react-icons/lu";
import { MdTour } from "react-icons/md";
import { PiReadCvLogo } from "react-icons/pi";
import { navGroups } from "@/lib/navigation";
import { readToken } from "@/lib/auth";
import TrafficPanel from "@/Components/TrafficPanel";

/**
 * Дашборд.
 *
 * Раньше здесь была пустая страница: человек входил в админку и видел
 * ничего. Теперь — то, ради чего сюда заходят каждый день: сколько пришло
 * заявок, и быстрый переход в разделы, которые правят чаще всего.
 */

const API = process.env.NEXT_PUBLIC_API_URL;

interface Stats {
    newRequests: number | null;
    totalRequests: number | null;
    tours: number | null;
    blogs: number | null;
}

const Dashboard = () => {
    const t = useT();
    const [stats, setStats] = useState<Stats>({
        newRequests: null, totalRequests: null, tours: null, blogs: null,
    });

    useEffect(() => {
        const load = async () => {
            const token = readToken();
            const auth = { headers: { Authorization: `Bearer ${token}` } };
            // Каждый счётчик грузится независимо: недоступность одного
            // эндпоинта не должна оставлять дашборд пустым целиком.
            const safe = async <T,>(p: Promise<T>, fallback: T) => {
                try { return await p; } catch { return fallback; }
            };
            const [requests, tours, blogs] = await Promise.all([
                safe(axios.get(`${API}/api/requests/stats`, auth).then((r) => r.data), null),
                safe(axios.get(`${API}/api/tours`).then((r) => r.data), null),
                safe(axios.get(`${API}/api/blogs`).then((r) => r.data), null),
            ]);
            setStats({
                newRequests: requests ? Number(requests.new ?? 0) : null,
                totalRequests: requests ? Number(requests.total ?? 0) : null,
                tours: Array.isArray(tours) ? tours.length : null,
                blogs: Array.isArray(blogs) ? blogs.length : null,
            });
        };
        load();
    }, []);

    const cards = [
        {
            key: 'new',
            label: t('dash.newRequests'),
            value: stats.newRequests,
            icon: LuInbox,
            href: '/admin/requests',
            // Новые заявки — единственное, что требует действия сегодня,
            // поэтому только они выделены акцентным цветом.
            accent: true,
        },
        { key: 'total', label: t('dash.requestsTotal'), value: stats.totalRequests, icon: LuInbox, href: '/admin/requests' },
        { key: 'tours', label: t('dash.tours'), value: stats.tours, icon: MdTour, href: '/admin/tours' },
        { key: 'blogs', label: t('dash.blogs'), value: stats.blogs, icon: PiReadCvLogo, href: '/admin/blogs' },
    ];

    const quick = navGroups
        .filter((g) => g.key === 'content' || g.key === 'tours')
        .flatMap((g) => g.links)
        .slice(0, 8);

    return (
        <div className="mx-auto max-w-6xl">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-ink">{t('dash.title')}</h2>
                <p className="mt-1 text-sm text-inkMuted">{t('dash.hint')}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map(({ key, label, value, icon: Icon, href, accent }) => (
                    <Link
                        key={key}
                        href={href}
                        className={`group rounded-lg border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${
                            accent && value ? 'border-brick/30 bg-brick/5' : 'border-sand bg-white'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-inkMuted">{label}</span>
                            <Icon className={`size-5 ${accent && value ? 'text-brick' : 'text-tileMid'}`} />
                        </div>
                        <p className={`mt-3 text-3xl font-bold tabular-nums ${
                            accent && value ? 'text-brick' : 'text-ink'
                        }`}>
                            {/* Пока не загрузилось — прочерк, а не ноль: ноль заявок
                                и «ещё не посчитали» это разные новости. */}
                            {value === null ? '—' : value}
                        </p>
                    </Link>
                ))}
            </div>

            <TrafficPanel />

            <div className="mt-8">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-inkMuted">
                    {t('dash.quick')}
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {quick.map(({ href, labelKey, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className="group flex items-center gap-3 rounded-lg border border-sand bg-white px-4 py-3 text-sm text-ink transition hover:border-tileLight hover:shadow-sm"
                        >
                            <Icon className="size-[18px] shrink-0 text-tileMid" />
                            <span className="min-w-0 flex-1 truncate">{t(labelKey)}</span>
                            <LuArrowRight className="size-4 shrink-0 text-sand transition-transform group-hover:translate-x-0.5 group-hover:text-tileMid" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
    type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { LuEye, LuUsers } from 'react-icons/lu';
import { useT, useAdminLocale } from '@/lib/i18n/LocaleProvider';
import { readToken } from '@/lib/auth';

/**
 * Посещаемость сайта на дашборде.
 *
 * Цифры берутся из своего счётчика, а не из GA4: идентификатор GA4 в
 * настройках не заполнен, да и читать оттуда числа обратно можно только
 * через сервисный аккаунт Google.
 *
 * Chart.js регистрируется поэлементно, а не через `registerables`: так в
 * сборку не тянутся круговые, столбчатые и прочие типы, которые здесь не
 * используются.
 */
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
);

const API = process.env.NEXT_PUBLIC_API_URL;

interface Point {
    date: string;
    views: number;
    visitors: number;
}

interface Stats {
    days: number;
    totals: { views: number; visitors: number };
    period: { views: number; visitors: number };
    today: { views: number; visitors: number };
    series: Point[];
    topPages: { path: string; views: number }[];
    locales: { locale: string; views: number }[];
    /**
     * Страны посетителей. Считаются по адресу в момент запроса, сам адрес
     * нигде не сохраняется — это обещано в политике конфиденциальности.
     */
    countries: { country: string; views: number; visitors: number }[];
    referrers: { referrer: string; views: number }[];
}

const PERIODS = [
    { days: 7, key: 'traffic.days7' },
    { days: 30, key: 'traffic.days30' },
    { days: 90, key: 'traffic.days90' },
] as const;

// Палитра дашборда: бирюза — просмотры, кирпич — посетители.
const TILE = '#1B7A7E';
const BRICK = '#B4441F';

export default function TrafficPanel() {
    const t = useT();
    const { locale } = useAdminLocale();
    const [days, setDays] = useState<number>(30);
    const [stats, setStats] = useState<Stats | null>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(false);
        axios
            .get(`${API}/api/views/stats`, {
                params: { days },
                headers: { Authorization: `Bearer ${readToken()}` },
            })
            .then((r) => {
                if (!cancelled) setStats(r.data);
            })
            .catch(() => {
                if (!cancelled) setError(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [days]);

    /** 2026-09-07 → «7 сен». Ось из полных дат нечитаема уже на 30 днях. */
    const shortDate = useCallback(
        (iso: string) =>
            new Date(`${iso}T00:00:00`).toLocaleDateString(
                locale === 'ru' ? 'ru-RU' : 'en-GB',
                { day: 'numeric', month: 'short' },
            ),
        [locale],
    );

    const chart = useMemo(() => {
        const series = stats?.series ?? [];
        return {
            labels: series.map((p) => shortDate(p.date)),
            datasets: [
                {
                    label: t('traffic.views'),
                    data: series.map((p) => p.views),
                    borderColor: TILE,
                    backgroundColor: 'rgba(27, 122, 126, 0.12)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    // Точка появляется под курсором — на 90 днях постоянные
                    // точки сливаются в сплошную линию.
                    pointHoverRadius: 4,
                    borderWidth: 2,
                },
                {
                    label: t('traffic.visitors'),
                    data: series.map((p) => p.visitors),
                    borderColor: BRICK,
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    borderWidth: 2,
                },
            ],
        };
    }, [stats, t, shortDate]);

    const options: ChartOptions<'line'> = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: { boxWidth: 12, boxHeight: 12, usePointStyle: true },
                },
                tooltip: {
                    // Заголовком подсказки идёт короткая дата из labels,
                    // её достаточно: полная дата в узкой подсказке не нужна.
                    padding: 10,
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 0,
                        autoSkip: true,
                        // На 90 днях подписи каждого дня не помещаются
                        maxTicksLimit: 10,
                    },
                },
                y: {
                    beginAtZero: true,
                    // Просмотры — целые числа; дробные деления оси бессмысленны
                    ticks: { precision: 0 },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                },
            },
        }),
        [],
    );

    const cards = [
        { key: 'viewsToday', label: t('traffic.viewsToday'), value: stats?.today.views, icon: LuEye },
        { key: 'visitorsToday', label: t('traffic.visitorsToday'), value: stats?.today.visitors, icon: LuUsers },
        { key: 'viewsPeriod', label: t('traffic.viewsPeriod'), value: stats?.period.views, icon: LuEye },
        { key: 'viewsTotal', label: t('traffic.viewsTotal'), value: stats?.totals.views, icon: LuEye },
    ];

    // Ноль записей за всё время — счётчик поставлен, но заходов ещё не было.
    const isEmpty = !!stats && Number(stats.totals.views) === 0;

    return (
        <section className="mt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-inkMuted">
                    {t('traffic.title')}
                </h3>
                <div className="flex gap-1 rounded-lg border border-sand bg-white p-1">
                    {PERIODS.map((p) => (
                        <button
                            key={p.days}
                            type="button"
                            onClick={() => setDays(p.days)}
                            className={`rounded-md px-3 py-1 text-xs transition ${
                                days === p.days
                                    ? 'bg-tileMid text-white'
                                    : 'text-inkMuted hover:bg-sand/40'
                            }`}
                        >
                            {t(p.key)}
                        </button>
                    ))}
                </div>
            </div>

            {error ? (
                <p className="rounded-lg border border-sand bg-white p-5 text-sm text-inkMuted">
                    {t('traffic.error')}
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {cards.map(({ key, label, value, icon: Icon }) => (
                            <div key={key} className="rounded-lg border border-sand bg-white p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-inkMuted">{label}</span>
                                    <Icon className="size-5 text-tileMid" />
                                </div>
                                <p className="mt-3 text-3xl font-bold tabular-nums text-ink">
                                    {/* Прочерк, пока не загрузилось: ноль просмотров
                                        и «ещё не посчитали» — разные новости. */}
                                    {loading || value === undefined ? '—' : value}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 rounded-lg border border-sand bg-white p-5">
                        {isEmpty ? (
                            <p className="py-10 text-center text-sm text-inkMuted">
                                {t('traffic.empty')}
                            </p>
                        ) : (
                            // Высота задаётся контейнеру: chart.js с
                            // maintainAspectRatio: false тянется по родителю,
                            // а без явной высоты родитель схлопывается в ноль.
                            <div className="h-72">
                                <Line data={chart} options={options} />
                            </div>
                        )}
                        <p className="mt-3 text-xs text-inkMuted">{t('traffic.hint')}</p>
                    </div>

                    {!isEmpty && (
                        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <ListCard
                                title={t('traffic.topPages')}
                                rows={(stats?.topPages ?? []).map((p) => ({
                                    label: p.path,
                                    value: p.views,
                                }))}
                            />
                            {/*
                                Страны считаем по посетителям, а не по
                                просмотрам: один человек, открывший десять
                                страниц, иначе выглядел бы как десять
                                человек из своей страны.
                            */}
                            <ListCard
                                title={t('traffic.countries')}
                                rows={(stats?.countries ?? []).map((c) => ({
                                    label: countryName(c.country, locale),
                                    value: c.visitors,
                                }))}
                                empty={t('traffic.noCountries')}
                            />
                            <ListCard
                                title={t('traffic.sources')}
                                rows={(stats?.referrers ?? []).map((r) => ({
                                    label: r.referrer,
                                    value: r.views,
                                }))}
                                empty={t('traffic.noSources')}
                            />
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

/**
 * Название страны по двухбуквенному коду.
 *
 * Берём у браузера через Intl: свой справочник на две с лишним сотни стран
 * пришлось бы вести руками и переводить на два языка. Если код незнаком —
 * показываем его как есть, это честнее пустой строки.
 */
function countryName(code: string, locale: string): string {
    if (!code) return '—';
    try {
        const names = new Intl.DisplayNames([locale], { type: 'region' });
        return names.of(code.toUpperCase()) || code.toUpperCase();
    } catch {
        return code.toUpperCase();
    }
}

/** Простой список «подпись — число» с долей от максимума полоской фона. */
function ListCard({
    title,
    rows,
    empty,
}: {
    title: string;
    rows: { label: string; value: number }[];
    empty?: string;
}) {
    const max = Math.max(1, ...rows.map((r) => Number(r.value)));

    return (
        <div className="rounded-lg border border-sand bg-white p-5">
            <h4 className="mb-3 text-sm font-bold text-ink">{title}</h4>
            {rows.length === 0 ? (
                <p className="text-sm text-inkMuted">{empty ?? '—'}</p>
            ) : (
                <ul className="space-y-1.5">
                    {rows.map((row) => (
                        <li key={row.label} className="relative">
                            {/* Полоска показывает вес строки относительно
                                первой: числа в столбик сравнивать медленнее. */}
                            <div
                                className="absolute inset-y-0 left-0 rounded bg-tileTint"
                                style={{ width: `${(Number(row.value) / max) * 100}%` }}
                            />
                            <div className="relative flex items-center justify-between gap-3 px-2 py-1 text-sm">
                                <span className="min-w-0 truncate text-ink" title={row.label}>
                                    {row.label}
                                </span>
                                <span className="shrink-0 tabular-nums text-inkMuted">
                                    {row.value}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

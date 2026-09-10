'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useT } from '@/lib/i18n/LocaleProvider';
import { readToken } from '@/lib/auth';
import { Field, LangTabs, type Lang, inputClass } from '@/Components/form/Field';

/**
 * Правка категории статей.
 *
 * Отдельная страница, а не строка с инпутом в списке: названий три, по
 * одному на язык, и в таблицу они не помещаются.
 */
const EditBlogCategory = () => {
    const t = useT();
    const router = useRouter();
    const { id } = useParams();

    const [lang, setLang] = useState<Lang>('ru');
    const [cat, setCat] = useState({ cat_tk: '', cat_en: '', cat_ru: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/blog-category/${id}`,
                    { headers: { Authorization: `Bearer ${readToken()}` } },
                );
                // Эндпоинт отдаёт массив: тот же обработчик обслуживает и
                // выборку по id, и выборку списком.
                const row = Array.isArray(res.data) ? res.data[0] : res.data;
                if (!row) throw new Error('not found');
                setCat({
                    cat_tk: row.cat_tk ?? '',
                    cat_en: row.cat_en ?? '',
                    cat_ru: row.cat_ru ?? '',
                });
            } catch {
                setError(t('common.error'));
            } finally {
                setLoading(false);
            }
        })();
    }, [id, t]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/blog-category/${id}`,
                cat,
                { headers: { Authorization: `Bearer ${readToken()}` } },
            );
            router.push('/admin/blog-category');
        } catch {
            setError(t('common.error'));
        } finally {
            setBusy(false);
        }
    };

    if (loading) return <p className="mt-8 text-inkMuted">{t('common.loading')}</p>;

    return (
        <div className="mt-8">
            <h1 className="mb-4 text-2xl font-bold">{t('form.editTitle')}</h1>

            <form onSubmit={submit} className="space-y-6 rounded-lg border border-sand bg-white p-6">
                <LangTabs active={lang} onChange={setLang} />

                {(['tk', 'en', 'ru'] as Lang[]).map((code) => (
                    <div key={code} className={lang === code ? '' : 'hidden'}>
                        <Field label={t('list.name')} htmlFor={`cat_${code}`}>
                            <input
                                id={`cat_${code}`}
                                type="text"
                                required
                                value={cat[`cat_${code}` as keyof typeof cat]}
                                onChange={(e) => setCat((prev) => ({ ...prev, [`cat_${code}`]: e.target.value }))}
                                className={inputClass}
                            />
                        </Field>
                    </div>
                ))}

                {error && <p className="rounded-md bg-brick/10 px-4 py-3 text-sm text-brick">{error}</p>}

                <button
                    type="submit"
                    disabled={busy}
                    className="rounded-md bg-tile px-5 py-2.5 font-semibold text-white transition-colors hover:bg-tileDark disabled:opacity-60"
                >
                    {t('common.save')}
                </button>
            </form>
        </div>
    );
};

export default EditBlogCategory;

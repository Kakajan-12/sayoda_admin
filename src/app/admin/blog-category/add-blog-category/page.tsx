'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useT } from '@/lib/i18n/LocaleProvider';
import { readToken } from '@/lib/auth';
import { Field, LangTabs, type Lang, inputClass } from '@/Components/form/Field';

/**
 * Новая категория статей.
 *
 * Название обязательно на всех трёх языках: категория показывается в
 * фильтре на сайте, и пустая подпись превратилась бы там в пустую кнопку.
 *
 * Содержимое всех языков остаётся смонтированным и просто прячется —
 * набранное на одном языке не теряется при переключении на другой.
 */
const AddBlogCategory = () => {
    const t = useT();
    const router = useRouter();

    const [lang, setLang] = useState<Lang>('ru');
    const [cat, setCat] = useState({ cat_tk: '', cat_en: '', cat_ru: '' });
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/blog-category`, cat, {
                headers: { Authorization: `Bearer ${readToken()}` },
            });
            router.push('/admin/blog-category');
        } catch {
            setError(t('common.error'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="mt-8">
            <h1 className="mb-4 text-2xl font-bold">{t('form.addTitle')}</h1>

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
                    {t('common.add')}
                </button>
            </form>
        </div>
    );
};

export default AddBlogCategory;

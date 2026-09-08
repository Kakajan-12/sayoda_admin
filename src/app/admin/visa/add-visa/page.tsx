'use client';
import { useT } from "@/lib/i18n/LocaleProvider";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TipTapEditor from '@/Components/TipTapEditor';

const AddVisa = () => {
    const t = useT();
    const [isClient, setIsClient] = useState(false);
    const [title_tk, setTitleTk] = useState('');
    const [title_en, setTitleEn] = useState('');
    const [title_ru, setTitleRu] = useState('');
    const [text_tk, setTextTk] = useState('');
    const [text_en, setTextEn] = useState('');
    const [text_ru, setTextRu] = useState('');

    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('No token. User is not authenticated.');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/visa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title_tk,
                    text_tk,
                    title_en,
                    text_en,
                    title_ru,
                    text_ru,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('data added successfully!', data);
                setTitleTk('');
                setTitleEn('');
                setTitleRu('');
                setTextTk('');
                setTextEn('');
                setTextRu('');
                router.push('/admin/visa');
            } else {
                const errorText = await response.text();
                console.error('Error adding:', errorText);
            }
        } catch (error) {
            console.error('Request error:', error);
        }
    };


    return (
        <>
        <div className="mt-8">
            <form
                onSubmit={handleSubmit}
                className="w-full rounded-lg border border-sand bg-white p-6 shadow-sm"
            >
                <h2 className="text-2xl font-bold mb-4 text-left">{t('form.addTitle')}</h2>

                {isClient && (
                    <>
                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.tk')}
                                   defaultChecked/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                                    <TipTapEditor
                                        content={title_tk}
                                        onChange={(content) => setTitleTk(content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                                    <TipTapEditor
                                        content={text_tk}
                                        onChange={(content) => setTextTk(content)}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.en')} />
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                                    <TipTapEditor
                                        content={title_en}
                                        onChange={(content) => setTitleEn(content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                                    <TipTapEditor
                                        content={text_en}
                                        onChange={(content) => setTextEn(content)}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.ru')} />
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                                    <TipTapEditor
                                        content={title_ru}
                                        onChange={(content) => setTitleRu(content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                                    <TipTapEditor
                                        content={text_ru}
                                        onChange={(content) => setTextRu(content)}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    className="w-full rounded-md bg-tile py-2.5 px-4 font-semibold text-white transition-colors hover:bg-tileDark"
                >
                    {t('common.add')}
                </button>
            </form>
        </div>
        </>
    );
};

export default AddVisa;

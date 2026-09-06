'use client';
import { useT } from "@/lib/i18n/LocaleProvider";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TipTapEditor from '@/Components/TipTapEditor';

const AddExcludes = () => {
    const t = useT();
    const [isClient, setIsClient] = useState(false);
    const [text_tk, setTextTk] = useState('');
    const [text_en, setTextEn] = useState('');
    const [text_ru, setTextRu] = useState('');
    const [tour_id, setTourId] = useState('');
    const [tours, setTours] = useState<
        { id: number; title_tk: string; title_en: string; title_ru: string }[]
    >([]);


    const router = useRouter();

    useEffect(() => {
        setIsClient(true);

        const fetchTours = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tours`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    setTours(data);
                } else {
                    console.error('Неверный формат данных:', data);
                }
            } catch (err) {
                console.error('Ошибка при загрузке:', err);
            }
        };


        fetchTours();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const formData = {
            text_tk,
            text_en,
            text_ru,
            tour_id,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/excludes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('добавлен!', data);
                setTextTk('');
                setTextEn('');
                setTextRu('');
                setTourId('');
                router.push('/admin/excludes');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении:', errorText);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    return (
        <>
        <div className="mt-8">
            <form
                onSubmit={handleSubmit}
                className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
            >
                <h2 className="text-2xl font-bold mb-4 text-left">{t('form.addTitle')}</h2>

                <div className="mb-4 flex space-x-4">

                    <div className="w-full">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            Tours:
                        </label>
                        <select
                            id="tours"
                            name="tours"
                            value={tour_id}
                            onChange={(e) => setTourId(e.target.value)}
                            required
                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                        >
                            <option value="">Select a category</option>
                            {tours.map((tour) => (
                                <option key={tour.id} value={tour.id}>
                                    {tour.title_en} / {tour.title_tk} / {tour.title_ru}
                                </option>
                            ))}
                        </select>

                    </div>
                </div>

                {isClient && (
                    <>
                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.tk')}
                                   defaultChecked/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
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

export default AddExcludes;

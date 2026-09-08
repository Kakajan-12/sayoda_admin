'use client';
import { useT } from "@/lib/i18n/LocaleProvider";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const AddTourCategory = () => {
    const t = useT();
    const [cat_tk, setCatTk] = useState('');
    const [cat_en, setCatEn] = useState('');
    const [cat_ru, setCatRu] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const payload = {
            cat_tk,
            cat_en,
            cat_ru,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tour-category`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Категория добавлена!', data);
                setCatTk('');
                setCatEn('');
                setCatRu('');
                router.push('/admin/tour-category');
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
                className="w-full rounded-lg border border-sand bg-white p-6 shadow-sm"
            >
                <h2 className="text-2xl font-bold mb-4">{t('form.addTitle')}</h2>

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('lang.tk')}:</label>
                    <input
                        value={cat_tk}
                        onChange={(e) => setCatTk(e.target.value)}
                        type="text"
                        required
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                    />
                </div>

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('lang.en')}:</label>
                    <input
                        value={cat_en}
                        onChange={(e) => setCatEn(e.target.value)}
                        type="text"
                        required
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                    />
                </div>

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('lang.ru')}:</label>
                    <input
                        value={cat_ru}
                        onChange={(e) => setCatRu(e.target.value)}
                        type="text"
                        required
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg text-white font-bold py-2 px-4 rounded"
                >
                    {t('common.add')}
                </button>
            </form>
        </div>
        </>
    );
};

export default AddTourCategory;

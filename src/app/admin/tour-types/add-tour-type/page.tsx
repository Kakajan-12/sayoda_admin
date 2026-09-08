'use client';
import { useT } from "@/lib/i18n/LocaleProvider";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const AddTourType = () => {
    const t = useT();
    const [type_tk, setTypeTk] = useState('');
    const [type_en, setTypeEn] = useState('');
    const [type_ru, setTypeRu] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const payload = {
            type_tk,
            type_en,
            type_ru,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tour-types`, {
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
                setTypeTk('');
                setTypeEn('');
                setTypeRu('');
                router.push('/admin/tour-types');
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
                        value={type_tk}
                        onChange={(e) => setTypeTk(e.target.value)}
                        type="text"
                        required
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                    />
                </div>

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('lang.en')}:</label>
                    <input
                        value={type_en}
                        onChange={(e) => setTypeEn(e.target.value)}
                        type="text"
                        required
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                    />
                </div>

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('lang.ru')}:</label>
                    <input
                        value={type_ru}
                        onChange={(e) => setTypeRu(e.target.value)}
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

export default AddTourType;

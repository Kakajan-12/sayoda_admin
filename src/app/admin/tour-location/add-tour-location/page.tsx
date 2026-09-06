'use client';
import { useT } from "@/lib/i18n/LocaleProvider";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DestinationSelect from '@/Components/DestinationSelect';

const AddTourLocation = () => {
    const t = useT();
    const [location_tk, setLocationTk] = useState('');
    const [location_en, setLocationEn] = useState('');
    const [location_ru, setLocationRu] = useState('');
    const [destination_id, setDestinationId] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const payload = {
            location_tk,
            location_en,
            location_ru,
            // Пусто — связь не ставим, страница страны отберёт туры по названию
            destination_id: destination_id || null,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tour-location`, {
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
                setLocationTk('');
                setLocationEn('');
                setLocationRu('');
                router.push('/admin/tour-location');
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
                <h2 className="text-2xl font-bold mb-4">{t('form.addTitle')}</h2>

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('lang.tk')}:</label>
                    <input
                        value={location_tk}
                        onChange={(e) => setLocationTk(e.target.value)}
                        type="text"
                        required
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                    />
                </div>

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('lang.en')}:</label>
                    <input
                        value={location_en}
                        onChange={(e) => setLocationEn(e.target.value)}
                        type="text"
                        required
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                    />
                </div>

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('lang.ru')}:</label>
                    <input
                        value={location_ru}
                        onChange={(e) => setLocationRu(e.target.value)}
                        type="text"
                        required
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                    />
                </div>

                <div className="mb-4">
                    <DestinationSelect
                        value={destination_id}
                        onChange={setDestinationId}
                        label="Относится к стране:"
                        hint="Туры этой локации попадут на вкладку «Туры» выбранной страны."
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

export default AddTourLocation;

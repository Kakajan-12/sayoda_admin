'use client';
import { useT } from "@/lib/i18n/LocaleProvider";

import {useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import { inputClass } from '@/Components/form/Field';

const ContactLocation = () => {
    const t = useT();
    const [isClient, setIsClient] = useState(false);
    const [location_tk, setLocationTk] = useState('');
    const [location_en, setLocationEn] = useState('');
    const [location_ru, setLocationRu] = useState('');
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

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
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(' добавлены!', data);
                setLocationTk('');
                setLocationEn('');
                setLocationRu('');
                router.push('/admin/locations');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении проекта:', errorText);
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

                {isClient && (
                    <>
                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.tk')}
                                   defaultChecked/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">Location Address:</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={location_tk}
                                        onChange={(e) => setLocationTk(e.target.value)}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.en')}/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">Location Address:</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={location_en}
                                        onChange={(e) => setLocationEn(e.target.value)}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.ru')} />
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">Location Address:</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={location_ru}
                                        onChange={(e) => setLocationRu(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}

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

export default ContactLocation;

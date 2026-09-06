'use client';
import { useT } from "@/lib/i18n/LocaleProvider";

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';

const AddMail = () => {
    const t = useT();
    const [mail, setMail] = useState('');
    const router = useRouter();
    const [location_id, setLocationId] = useState('');
    const [locations, setLocations] = useState<{ id: number, location_tk: string, location_en: string, location_ru: string }[]>([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-location`);
                const data = await res.json();
                setLocations(data);
            } catch (err) {
                console.error('Ошибка при загрузке:', err);
            }
        };

        fetchLocations();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('No token. User is not authenticated.');
            return;
        }

        const locId = Number(location_id);
        if (!locId) {
            console.error('Location is required.');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-mails`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mail,
                    location_id: locId}),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('добавлен!', data);
                setMail('');
                setLocationId('');
                router.push('/admin/mails');
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

                <div className="w-full">
                    <label className="mb-1 block text-sm font-medium text-inkMuted">
                        {t('form.location')}
                    </label>
                    <select
                        id="location_id"
                        name="location_id"
                        value={location_id}
                        onChange={(e) => setLocationId(e.target.value)}
                        required
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                    >
                        <option value="">{t('form.selectLocation')}</option>
                        {locations.map((location) => (
                            <option key={location.id} value={location.id}>
                                {location.location_en} / {location.location_tk} / {location.location_ru}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-inkMuted">Mail address:</label>
                    <input
                        value={mail}
                        onChange={(e) => setMail(e.target.value)}
                        type="text"
                        required
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                    />
                </div>

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

export default AddMail;

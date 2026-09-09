'use client';
import { useAdminLocale } from "@/lib/i18n/LocaleProvider";
import { optionLabel } from "@/Components/form/optionLabel";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AddAddress = () => {
    const { locale, t } = useAdminLocale();
    const [isClient, setIsClient] = useState(false);
    const [iframe, setIframe] = useState('');
    const [address_tk, setAddressTk] = useState('');
    const [address_en, setAddressEn] = useState('');
    const [address_ru, setAddressRu] = useState('');
    const [location_id, setLocationId] = useState('');
    const [locations, setLocations] = useState<{ id: number, location_tk: string, location_en: string, location_ru: string }[]>([]);

    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
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

        if (!iframe.trim()) {
            console.error('Map iframe is required.');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-address`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    address_tk,
                    address_en,
                    address_ru,
                    iframe,
                    location_id: locId
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Data added successfully!', data);
                setAddressTk('');
                setAddressEn('');
                setAddressRu('');
                setIframe('');
                setLocationId('');
                router.push('/admin/address');
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
                        className="w-full rounded-md border border-sand bg-white px-3 py-2 text-ink outline-none transition focus:border-tileLight"
                    >
                        <option value="">{t('form.selectLocation')}</option>
                        {locations.map((location) => (
                            <option key={location.id} value={location.id} title={optionLabel(location, 'location', locale)}>
                                {optionLabel(location, 'location', locale)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4 flex space-x-4">
                    <div className="w-full">
                        <label
                            className="mb-1 block text-sm font-medium text-inkMuted">{t('form.map')}</label>
                        <textarea value={iframe}
                                  onChange={(e) => setIframe(e.target.value)}
                                  rows={10}
                                  required
                                  className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight">

                    </textarea>
                    </div>
                </div>

                {isClient && (
                    <>
                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.tk')}
                                   defaultChecked/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                                    <textarea
                                        rows={3}
                                        className="w-full rounded-md border border-sand bg-white px-3 py-2 text-ink outline-none transition focus:border-tileLight"
                                        value={address_tk}
                                        onChange={(e) => setAddressTk(e.target.value)}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.en')}/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                                    <textarea
                                        rows={3}
                                        className="w-full rounded-md border border-sand bg-white px-3 py-2 text-ink outline-none transition focus:border-tileLight"
                                        value={address_en}
                                        onChange={(e) => setAddressEn(e.target.value)}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.ru')}/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                                    <textarea
                                        rows={3}
                                        className="w-full rounded-md border border-sand bg-white px-3 py-2 text-ink outline-none transition focus:border-tileLight"
                                        value={address_ru}
                                        onChange={(e) => setAddressRu(e.target.value)}
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

export default AddAddress;

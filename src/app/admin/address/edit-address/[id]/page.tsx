'use client';
import { useAdminLocale } from "@/lib/i18n/LocaleProvider";
import { optionLabel } from "@/Components/form/optionLabel";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import TipTapEditor from '@/Components/TipTapEditor';
import { DocumentIcon } from "@heroicons/react/16/solid";

const EditAddress = () => {
    const { locale, t } = useAdminLocale();
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({ address_tk: '', address_en:'', address_ru:'', iframe: '', location_id:''});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [locations, setLocations] = useState<{ id: number, location_tk: string, location_en: string, location_ru: string }[]>([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-location`);
                const data = await res.json();
                setLocations(data);
            } catch (err) {
                console.error('Ошибка при загрузке категорий:', err);
            }
        };

        fetchLocations();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-address/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.length > 0) {
                    const rawData = response.data[0]; // <-- берём первый элемент массива
                    setData({ ...rawData });
                    setLoading(false);
                } else {
                    throw new Error("Данные не найдены");
                }

            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Ошибка при загрузке');
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleEditorChange = (name: keyof typeof data, content: string) => {
        setData((prev) => ({ ...prev, [name]: content }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/contact-address/${id}`,
                {
                    address_tk: data.address_tk,
                    address_en: data.address_en,
                    address_ru: data.address_ru,
                    iframe: data.iframe,
                    location_id: data.location_id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );


            router.push('/admin/address');
        } catch (err) {
            console.error(err);
            setError('Ошибка при сохранении');
        }
    };

    if (loading) return <p className="mt-8 text-inkMuted">{t('common.loading')}</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
        <div className="mt-8">
            <h1 className="text-2xl font-bold mb-4">{t('form.editTitle')}</h1>
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-sand bg-white p-6">
                <div className="w-full">
                    <label className="mb-1 block text-sm font-medium text-inkMuted">
                        {t('form.selectLocation')}
                    </label>
                    <select
                        id="location"
                        name="location_id"
                        value={String(data.location_id)}
                        onChange={(e) => setData((prev) => ({...prev, location_id: e.target.value}))}
                        required
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                    >
                        <option value="">{t('form.selectTour')}</option>
                        {locations.map((location) => (
                            <option key={location.id} value={location.id} title={optionLabel(location, 'location', locale)}>
                                {optionLabel(location, 'location', locale)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4 w-full">
                    <label
                        className="mb-1 block text-sm font-medium text-inkMuted">{t('form.map')}</label>
                    <textarea value={data.iframe}
                              onChange={(e) => setData((prev) => ({...prev, iframe: e.target.value}))}
                              rows={10}
                              required
                              className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight">

                    </textarea>
                </div>

                <div className="tabs tabs-lift">
                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.tk')} defaultChecked/>
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">Address</label>
                            <TipTapEditor
                                content={data.address_tk}
                                onChange={(content) => handleEditorChange('address_tk', content)}
                            />
                        </div>
                    </div>

                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.en')}/>
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">Address:</label>
                            <TipTapEditor
                                content={data.address_en}
                                onChange={(content) => handleEditorChange('address_en', content)}
                            />
                        </div>
                    </div>

                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.ru')}/>
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">Address:</label>
                            <TipTapEditor
                                content={data.address_ru}
                                onChange={(content) => handleEditorChange('address_ru', content)}
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="flex items-center rounded-md bg-tile px-5 py-2.5 text-white transition-colors hover:bg-tileDark"
                >
                    <DocumentIcon className="size-5 mr-2"/>
                    {t('common.save')}
                </button>
            </form>
        </div>
        </>
    );
};

export default EditAddress;

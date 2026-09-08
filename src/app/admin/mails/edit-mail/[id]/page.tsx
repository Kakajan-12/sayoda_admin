'use client';
import { useAdminLocale } from "@/lib/i18n/LocaleProvider";
import { optionLabel } from "@/Components/form/optionLabel";
import React, {FormEvent, useEffect, useState} from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { DocumentIcon } from "@heroicons/react/16/solid";

const EditMail = () => {
    const { locale, t } = useAdminLocale();
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({ mail: '', location_id: '',});
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
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-mails/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setData(response.data[0]);
                setLoading(false);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Ошибка при загрузке');
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-mails/${id}`, {
                mail: data.mail,
                location_id: data.location_id,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            router.push('/admin/mails');
        } catch (err) {
            console.error('Ошибка при сохранении:', err);
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
                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-inkMuted">Mail:</label>
                    <input
                        name="mail"
                        value={data.mail}
                        onChange={handleChange}
                        type="text"
                        required
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                    />
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

export default EditMail;

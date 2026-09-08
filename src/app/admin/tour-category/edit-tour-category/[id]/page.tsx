'use client';
import { useT } from "@/lib/i18n/LocaleProvider";
import React, {FormEvent, useEffect, useState} from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { DocumentIcon } from "@heroicons/react/16/solid";

const EditTourCategory = () => {
    const t = useT();
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({ cat_tk: '', cat_en: '', cat_ru: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tour-category/${id}`, {
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
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/tour-category/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            router.push('/admin/tour-category');
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
                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('lang.tk')}:</label>
                    <input
                        name="cat_tk"
                        value={data.cat_tk}
                        onChange={handleChange}
                        type="text"
                        required
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                    />
                </div>
                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('lang.en')}:</label>
                    <input
                        name="cat_en"
                        value={data.cat_en}
                        onChange={handleChange}
                        type="text"
                        required
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                    />
                </div>
                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('lang.ru')}:</label>
                    <input
                        name="cat_ru"
                        value={data.cat_ru}
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
                    <DocumentIcon className="size-5 mr-2" />
                    {t('common.save')}
                </button>
            </form>
        </div>
        </>
    );
};

export default EditTourCategory;

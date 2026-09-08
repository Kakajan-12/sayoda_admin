'use client';
import { useT } from "@/lib/i18n/LocaleProvider";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import TipTapEditor from '@/Components/TipTapEditor';
import { DocumentIcon } from "@heroicons/react/16/solid";

const EditLocationAddress = () => {
    const t = useT();
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({ location_tk: '', location_en: '', location_ru: ''});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-location/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    const rawData = response.data[0];
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

            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/contact-location/${id}`,
                { ...data },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            router.push('/admin/locations');
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

                <div className="tabs tabs-lift">
                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.tk')} defaultChecked/>
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">Address Location:</label>
                            <TipTapEditor
                                content={data.location_tk}
                                onChange={(content) => handleEditorChange('location_tk', content)}
                            />
                        </div>
                    </div>

                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.en')}/>
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">Address Location:</label>
                            <TipTapEditor
                                content={data.location_en}
                                onChange={(content) => handleEditorChange('location_en', content)}
                            />
                        </div>
                    </div>

                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.ru')}/>
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">Address Location:</label>
                            <TipTapEditor
                                content={data.location_ru}
                                onChange={(content) => handleEditorChange('location_ru', content)}
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

export default EditLocationAddress;

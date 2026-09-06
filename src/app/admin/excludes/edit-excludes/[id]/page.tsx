'use client';
import { useT } from "@/lib/i18n/LocaleProvider";
import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import axios from 'axios';
import TipTapEditor from '@/Components/TipTapEditor';
import {DocumentIcon} from "@heroicons/react/16/solid";

const EditExcludes = () => {
    const t = useT();
    const {id} = useParams();
    const router = useRouter();

    const [data, setData] = useState({
        text_tk: '',
        text_en: '',
        text_ru: '',
        tour_id: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tours, setTours] = useState<{ id: number, title_tk: string, title_en: string, title_ru: string }[]>([]);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tours`);
                const data = await res.json();
                setTours(data);
            } catch (err) {
                console.error('Ошибка при загрузке категорий:', err);
            }
        };

        fetchTours();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/excludes/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.id) {
                    const rawData = response.data;

                    setData({
                        ...rawData,
                    });

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
        setData((prev) => ({...prev, [name]: content}));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');

            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/excludes/${id}`,
                {...data},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            router.push('/admin/excludes');
        } catch (err) {
            console.error(err);
            setError('Ошибка при сохранении');
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
        <div className="mt-8">
            <h1 className="text-2xl font-bold mb-4">{t('form.editTitle')}</h1>
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-sand bg-white p-6">
                <div className="mb-4 flex space-x-4">
                    <div className="w-full">
                        <div className="w-full">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">
                                Select Tours:
                            </label>
                            <select
                                id="tours"
                                name="tour_id"
                                value={String(data.tour_id)}
                                onChange={(e) => setData((prev) => ({...prev, tour_id: e.target.value}))}
                                required
                                className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                            >
                                <option value="">{t('form.selectType')}</option>
                                {tours.map((tour) => (
                                    <option key={tour.id} value={tour.id}>
                                        {tour.title_en} / {tour.title_tk} / {tour.title_ru}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="tabs tabs-lift">
                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.tk')} defaultChecked/>
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                            <TipTapEditor
                                content={data.text_tk}
                                onChange={(content) => handleEditorChange('text_tk', content)}
                            />
                        </div>
                    </div>

                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.en')}/>
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                            <TipTapEditor
                                content={data.text_en}
                                onChange={(content) => handleEditorChange('text_en', content)}
                            />
                        </div>
                    </div>

                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.ru')}/>
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                            <TipTapEditor
                                content={data.text_ru}
                                onChange={(content) => handleEditorChange('text_ru', content)}
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

export default EditExcludes;

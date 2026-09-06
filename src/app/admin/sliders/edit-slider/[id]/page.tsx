'use client';
import { useT } from "@/lib/i18n/LocaleProvider";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import TipTapEditor from "@/Components/TipTapEditor";
import DestinationSelect from "@/Components/DestinationSelect";
import { DocumentIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

const EditSlider = () => {
    const t = useT();
    const { id } = useParams();
    const router = useRouter();

    const [slider, setSlider] = useState({ title_tk: '', text_tk: '', title_en: '', text_en: '', title_ru: '', text_ru: '', image: '', tour_id: '', destination_id: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
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
        const fetchSlider = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sliders/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // Связь со страной может быть пустой — null в select даёт
                // строку "null" и выбранным оказывается несуществующий пункт.
                setSlider({
                    ...response.data,
                    tour_id: response.data.tour_id ?? '',
                    destination_id: response.data.destination_id ?? '',
                });
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Error loading slider');
                setLoading(false);
            }
        };

        if (id) fetchSlider();
    }, [id]);

    const handleEditorChange = (name: keyof typeof slider, content: string) => {
        setSlider((prev) => ({ ...prev, [name]: content }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error("Токен не найден");

            const formData = new FormData();
            formData.append('title_tk', String(slider.title_tk));
            formData.append('title_en', String(slider.title_en));
            formData.append('title_ru', String(slider.title_ru));
            formData.append('text_tk', String(slider.text_tk));
            formData.append('text_en', String(slider.text_en));
            formData.append('text_ru', String(slider.text_ru));
            formData.append('tour_id', slider.tour_id ? String(slider.tour_id) : '');
            formData.append('destination_id', slider.destination_id ? String(slider.destination_id) : '');

            if (imageFile) {

                formData.append('image', imageFile);
            } else {

                formData.append('image', slider.image);
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/sliders/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            router.push('/admin/sliders');
        } catch (err) {
            console.error(err);
            setError('Error saving slider');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <>
        <div className="mt-8">
            <h1 className="text-2xl font-bold mb-4">{t('form.editTitle')}</h1>
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-sand bg-white p-6">
                {slider.image && (
                    <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.currentImage')}</label>
                        <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}/${slider.image.replace('\\', '/')}`}
                            alt="Slider"
                            width={200}
                            height={200}
                            className="w-64 rounded"
                        />
                    </div>
                )}

                <div className="flex space-x-4">
                    <div className="w-full">
                        <label htmlFor="image" className="mb-1 block text-sm font-medium text-inkMuted">{t('form.newImage')}</label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setImageFile(e.target.files[0]);
                                }
                            }}
                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                        />
                    </div>
                    <div className="w-full">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.selectTour')}
                        </label>
                        <select
                            id="tour"
                            name="tour_id"
                            value={String(slider.tour_id)}
                            onChange={(e) => setSlider((prev) => ({...prev, tour_id: e.target.value}))}
                            required
                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                        >
                            <option value="">{t('form.selectTour')}</option>
                            {tours.map((tour) => (
                                <option key={tour.id} value={tour.id}>
                                    {tour.title_en} / {tour.title_tk} / {tour.title_ru}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <DestinationSelect
                    value={String(slider.destination_id ?? '')}
                    onChange={(v) => setSlider((prev) => ({ ...prev, destination_id: v }))}
                    label="Ведёт на страну:"
                    hint="Выбрана страна — карточка ведёт на её страницу, а не на тур."
                />

                <div className="tabs tabs-lift">
                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.tk')} defaultChecked/>
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                            <TipTapEditor
                                content={slider.title_tk}
                                onChange={(content) => handleEditorChange('title_tk', content)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                            <TipTapEditor
                                content={slider.text_tk}
                                onChange={(content) => handleEditorChange('text_tk', content)}
                            />
                        </div>
                    </div>

                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.en')}/>
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                            <TipTapEditor
                                content={slider.title_en}
                                onChange={(content) => handleEditorChange('title_en', content)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                            <TipTapEditor
                                content={slider.text_en}
                                onChange={(content) => handleEditorChange('text_en', content)}
                            />
                        </div>
                    </div>

                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.ru')}/>
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                            <TipTapEditor
                                content={slider.title_ru}
                                onChange={(content) => handleEditorChange('title_ru', content)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                            <TipTapEditor
                                content={slider.text_ru}
                                onChange={(content) => handleEditorChange('text_ru', content)}
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="flex items-center rounded-md bg-tile px-5 py-2.5 text-white transition-colors hover:bg-tileDark"
                >
                    <DocumentIcon className="w-5 h-5 mr-2"/>
                    {t('common.save')}
                </button>
            </form>
        </div>
        </>
    );
};

export default EditSlider;

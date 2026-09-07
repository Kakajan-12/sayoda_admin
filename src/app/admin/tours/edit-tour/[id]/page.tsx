'use client';
import { useT } from "@/lib/i18n/LocaleProvider";
import React, {useEffect, useState} from 'react';
import SlugField from '@/Components/SlugField';
import {useParams, useRouter} from 'next/navigation';
import axios from 'axios';
import TipTapEditor from '@/Components/TipTapEditor';
import {DocumentIcon} from "@heroicons/react/16/solid";
import Image from "next/image";

const EditTour = () => {
    const t = useT();
    const {id} = useParams();
    const router = useRouter();

    type TourData = {
        popular: number;
        slug: string;
        title_tk: string;
        title_en: string;
        title_ru: string;
        text_tk: string;
        text_en: string;
        text_ru: string;
        image: string;
        destination_tk: string;
        destination_en: string;
        destination_ru: string;
        duration_tk: string;
        duration_en: string;
        duration_ru: string;
        lang_tk: string;
        lang_en: string;
        lang_ru: string;
        price: number;
        tour_type_id: number;
        tour_cat_id: number;
        location_id: number;
        map: string;
    };

    const [data, setData] = useState<TourData>({
        popular: 0,
        slug: '',
        title_tk: '',
        title_en: '',
        title_ru: '',
        text_tk: '',
        text_en: '',
        text_ru: '',
        image: '',
        destination_tk: '',
        destination_en: '',
        destination_ru: '',
        duration_tk: '',
        duration_en: '',
        duration_ru: '',
        lang_tk: '',
        lang_en: '',
        lang_ru: '',
        price: 0,
        tour_type_id: 0,
        tour_cat_id: 0,
        location_id: 0,
        map: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [mapFile, setMapFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [types, setTypes] = useState<{ id: number, type_tk: string, type_en: string, type_ru: string }[]>([]);
    const [cat, setCat] = useState<{ id: number, cat_tk: string, cat_en: string, cat_ru: string }[]>([]);
    const [location, setLocation] = useState<{ id: number, location_tk: string, location_en: string, location_ru: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [typesRes, catRes, locationRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tour-types`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tour-category`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tour-location`)
                ]);
                const [typesData, catData, locationData] = await Promise.all([
                    typesRes.json(),
                    catRes.json(),
                    locationRes.json()
                ]);

                setTypes(typesData);
                setCat(catData);
                setLocation(locationData);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tours/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.id) {
                    const rawData = response.data;

                    const formattedDate = rawData.date
                        ? new Date(rawData.date).toISOString().split('T')[0]
                        : '';

                    setData({
                        ...rawData,
                        popular: Number(rawData.popular),
                        date: formattedDate,
                    });

                    setLoading(false);
                } else {
                    throw new Error("Данные не найдены для этой новости");
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

            const formData = new FormData();
            // Слаг отправляем прежний: поле в форме закрыто, но без него
            // бэкенд принял бы пустое значение за просьбу оставить как есть —
            // отправляем явно, чтобы поведение не зависело от умолчаний.
            formData.append('slug', data.slug ?? '');
            formData.append('popular', String(data.popular));
            formData.append('title_tk', data.title_tk);
            formData.append('title_en', data.title_en);
            formData.append('title_ru', data.title_ru);
            formData.append('text_tk', data.text_tk);
            formData.append('text_en', data.text_en);
            formData.append('text_ru', data.text_ru);
            formData.append('destination_tk', data.destination_tk);
            formData.append('destination_en', data.destination_en);
            formData.append('destination_ru', data.destination_ru);
            formData.append('duration_tk', data.duration_tk);
            formData.append('duration_en', data.duration_en);
            formData.append('duration_ru', data.duration_ru);
            formData.append('lang_tk', data.lang_tk);
            formData.append('lang_en', data.lang_en);
            formData.append('lang_ru', data.lang_ru);
            formData.append('price', String(data.price));
            formData.append('tour_type_id', String(data.tour_type_id));
            formData.append('tour_cat_id', String(data.tour_cat_id));
            formData.append('location_id', String(data.location_id));


            if (imageFile) {
                formData.append('image', imageFile);
            }
            if (mapFile) {
                formData.append('map', mapFile);
            }


            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tours/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            router.push('/admin/tours');
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
                <SlugField value={data.slug} onChange={() => {}} section="tours" locked />
                {data.image && (
                    <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.currentImage')}</label>
                        <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image.replace('\\', '/')}`}
                            alt="News"
                            width={200}
                            height={200}
                            className="w-64 rounded"
                        />
                    </div>
                )}
                <div className="mb-4 flex space-x-4">
                    <div className="w-full">
                        <div className="mb-4">
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
                    </div>
                    <div className="w-full">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.selectType')}
                        </label>
                        <select
                            id="tour_type"
                            name="tour_type_id"
                            value={data.tour_type_id} // если это число
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    tour_type_id: Number(e.target.value), // приводим к числу
                                }))
                            }
                            required
                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                        >
                            <option value="">{t('form.selectType')}</option>
                            {types.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.type_en} / {type.type_tk} / {type.type_ru}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.selectCategory')}
                        </label>
                        <select
                            id="tour_cat"
                            name="tour_cat_id"
                            value={data.tour_cat_id} // число
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    tour_cat_id: Number(e.target.value), // приводим к числу
                                }))
                            }
                            required
                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                        >
                            <option value="">{t('form.selectType')}</option>
                            {cat.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.cat_en} / {cat.cat_tk} / {cat.cat_ru}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.selectDestination')}
                        </label>
                        <select
                            id="location_id"
                            name="location_id"
                            value={data.location_id} // число
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    location_id: Number(e.target.value), // приводим к числу
                                }))
                            }
                            required
                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                        >
                            <option value="">{t('form.selectDestination')}</option>
                            {location.map((location) => (
                                <option key={location.id} value={location.id}>
                                    {location.location_en} / {location.location_tk} / {location.location_ru}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4 w-full">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.price')}</label>
                        <input
                            name="price"
                            value={data.price}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    price: Number(e.target.value), // приведение к числу
                                }))
                            }
                            type="number" // лучше number, чтобы на фронте сразу был контроль
                            required
                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                        />
                    </div>

                    <div className="mb-4 w-full">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.popular')}
                        </label>
                        <select
                            id="popular"
                            name="popular"
                            value={String(data.popular)}
                            onChange={(e) =>
                                setData((prev) => ({
                                    ...prev,
                                    popular: Number(e.target.value),
                                }))
                            }
                            required
                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                        >
                            <option value="">Select</option>
                            <option value="1">True</option>
                            <option value="0">False</option>
                        </select>

                    </div>
                </div>

                {/*<div className="mb-4 w-full">*/}
                {/*    <label*/}
                {/*        className="mb-1 block text-sm font-medium text-inkMuted">{t('form.map')}</label>*/}
                {/*    <textarea value={data.map}*/}
                {/*              onChange={(e) => setData((prev) => ({...prev, map: e.target.value}))}*/}
                {/*              rows={10}*/}
                {/*              required*/}
                {/*              className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight">*/}

                {/*    </textarea>*/}
                {/*</div>*/}

                <div className="mb-4">
                    <label htmlFor="image" className="mb-1 block text-sm font-medium text-inkMuted">{t('form.map')}</label>
                    <input
                        type="file"
                        id="map"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setMapFile(e.target.files[0]);
                            }
                        }}
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                    />
                </div>

                <div className="tabs tabs-lift">
                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.tk')} defaultChecked/>
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                            <TipTapEditor
                                content={data.title_tk}
                                onChange={(content) => handleEditorChange('title_tk', content)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                            <TipTapEditor
                                content={data.text_tk}
                                onChange={(content) => handleEditorChange('text_tk', content)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">Destination:</label>
                            <TipTapEditor
                                content={data.destination_tk}
                                onChange={(content) => handleEditorChange('destination_tk', content)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">Duration:</label>
                            <TipTapEditor
                                content={data.duration_tk}
                                onChange={(content) => handleEditorChange('duration_tk', content)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">Lang:</label>
                            <TipTapEditor
                                content={data.lang_tk}
                                onChange={(content) => handleEditorChange('lang_tk', content)}
                            />
                        </div>
                    </div>

                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.en')}/>
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                            <TipTapEditor
                                content={data.title_en}
                                onChange={(content) => handleEditorChange('title_en', content)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                            <TipTapEditor
                                content={data.text_en}
                                onChange={(content) => handleEditorChange('text_en', content)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">Destination:</label>
                            <TipTapEditor
                                content={data.destination_en}
                                onChange={(content) => handleEditorChange('destination_en', content)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">Duration:</label>
                            <TipTapEditor
                                content={data.duration_en}
                                onChange={(content) => handleEditorChange('duration_en', content)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">Lang:</label>
                            <TipTapEditor
                                content={data.lang_en}
                                onChange={(content) => handleEditorChange('lang_en', content)}
                            />
                        </div>
                    </div>

                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.ru')}/>
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                            <TipTapEditor
                                content={data.title_ru}
                                onChange={(content) => handleEditorChange('title_ru', content)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                            <TipTapEditor
                                content={data.text_ru}
                                onChange={(content) => handleEditorChange('text_ru', content)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">Destination:</label>
                            <TipTapEditor
                                content={data.destination_ru}
                                onChange={(content) => handleEditorChange('destination_ru', content)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">Duration:</label>
                            <TipTapEditor
                                content={data.duration_ru}
                                onChange={(content) => handleEditorChange('duration_ru', content)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">Lang:</label>
                            <TipTapEditor
                                content={data.lang_ru}
                                onChange={(content) => handleEditorChange('lang_ru', content)}
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

export default EditTour;

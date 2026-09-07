'use client';
import { useT } from "@/lib/i18n/LocaleProvider";

import React, {useState, useEffect} from 'react';
import SlugField from '@/Components/SlugField';
import {useRouter} from 'next/navigation';
import TipTapEditor from '@/Components/TipTapEditor';

const AddTour = () => {
    const t = useT();
    const [isClient, setIsClient] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [popular, setPopular] = useState(false);
    const [slug, setSlug] = useState('');
    const [title_tk, setTitleTk] = useState('');
    const [title_en, setTitleEn] = useState('');
    const [title_ru, setTitleRu] = useState('');
    const [text_tk, setTextTk] = useState('');
    const [text_en, setTextEn] = useState('');
    const [text_ru, setTextRu] = useState('');
    const [destination_tk, setDestinationTk] = useState('');
    const [destination_en, setDestinationEn] = useState('');
    const [destination_ru, setDestinationRu] = useState('');
    const [duration_tk, setDurationTk] = useState('');
    const [duration_en, setDurationEn] = useState('');
    const [duration_ru, setDurationRu] = useState('');
    const [lang_tk, setLangTk] = useState('');
    const [lang_en, setLangEn] = useState('');
    const [lang_ru, setLangRu] = useState('');
    const [price, setPrice] = useState('');
    const [map, setMap] = useState<File | null>(null);
    const [tour_type_id, setTourType] = useState('');
    const [tour_cat_id, setTourCat] = useState('');
    const [location_id, setLocationTour] = useState('');
    const [types, setTypes] = useState<
        { id: number; type_tk: string; type_en: string; type_ru: string }[]
    >([]);
    const [cat, setCat] = useState<
        { id: number; cat_tk: string; cat_en: string; cat_ru: string }[]
    >([]);
    const [location, setLocation] = useState<
        { id: number; location_tk: string; location_en: string; location_ru: string }[]
    >([]);

    const router = useRouter();

    useEffect(() => {
        setIsClient(true)
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
                setLocation(locationData)
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const formData = new FormData();
        if (image) formData.append('image', image);
        if (map) formData.append('map', map);
        formData.append('popular', popular ? '1' : '0');
        formData.append('slug', slug);
        formData.append('title_tk', title_tk ?? '');
        formData.append('title_en', title_en ?? '');
        formData.append('title_ru', title_ru ?? '');
        formData.append('text_tk', text_tk ?? '');
        formData.append('text_en', text_en ?? '');
        formData.append('text_ru', text_ru ?? '');
        formData.append('destination_tk', destination_tk ?? '');
        formData.append('destination_en', destination_en ?? '');
        formData.append('destination_ru', destination_ru ?? '');
        formData.append('duration_tk', duration_en ?? '');
        formData.append('duration_en', duration_en ?? '');
        formData.append('duration_ru', duration_ru ?? '');
        formData.append('lang_tk', lang_tk ?? '');
        formData.append('lang_en', lang_en ?? '');
        formData.append('lang_ru', lang_ru ?? '');
        formData.append('price', price ?? '');
        // formData.append('map', map ?? '');
        formData.append('tour_type_id', tour_type_id ?? '');
        formData.append('tour_cat_id', tour_cat_id ?? '');
        formData.append('location_id', location_id ?? '');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tours`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('добавлен!', data);
                setImage(null);
                setPopular(Boolean)
                setTitleTk('');
                setTitleEn('');
                setTitleRu('');
                setTextTk('');
                setTextEn('');
                setTextRu('');
                setDestinationTk('');
                setDestinationEn('');
                setDestinationRu('');
                setDurationTk('');
                setDurationEn('');
                setDurationRu('');
                setLangTk('')
                setLangEn('');
                setLangRu('');
                setPrice('')
                setMap(null);
                setTourType('');
                setTourCat('');
                setLocationTour('');
                /*
                 * Открываем сразу созданный тур, а не общий список.
                 *
                 * Программу, состав цены и снимки теперь заводят во вкладках
                 * самого тура, и им нужен уже существующий тур. Возврат
                 * в список означал бы, что редактор тут же ищет только что
                 * созданную запись руками.
                 */
                router.push(
                    data?.id ? `/admin/tours/edit-tour/${data.id}` : '/admin/tours',
                );
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

                <div className="mb-4 flex space-x-4">
                    <div className="w-full">
                        <label htmlFor="image" className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.image')}
                        </label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setImage(e.target.files[0]);
                                }
                            }}
                            required
                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                        />
                    </div>
                    <div className="w-full">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.selectType')}
                        </label>
                        <select
                            id="tour_type"
                            name="tour_type_id"
                            value={tour_type_id}
                            onChange={(e) => setTourType(e.target.value)}
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
                            value={tour_cat_id}
                            onChange={(e) => setTourCat(e.target.value)}
                            required
                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                        >
                            <option value="">{t('form.selectCategory')}</option>
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
                            value={location_id}
                            onChange={(e) => setLocationTour(e.target.value)}
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
                        <label
                            className="mb-1 block text-sm font-medium text-inkMuted">{t('form.price')}</label>
                        <input
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            type="text"
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
                            value={popular ? '1' : '0'}
                            onChange={(e) => setPopular(e.target.value === '1')}
                            required
                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                        >
                            <option value="1">{t('common.yes')}</option>
                            <option value="0">{t('common.no')}</option>
                        </select>
                    </div>
                </div>
                <div className="mb-4">
                    <SlugField value={slug} onChange={setSlug} section="tours" />
                </div>
                {/*<div className="mb-4 w-full">*/}
                {/*    <label*/}
                {/*        className="mb-1 block text-sm font-medium text-inkMuted">{t('form.map')}</label>*/}
                {/*    <textarea value={map}*/}
                {/*              onChange={(e) => setMap(e.target.value)}*/}
                {/*              rows={10}*/}
                {/*              required*/}
                {/*              className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight">*/}

                {/*    </textarea>*/}
                {/*</div>*/}

                <div className="w-full">
                    <label htmlFor="image" className="mb-1 block text-sm font-medium text-inkMuted">
                        {t('form.map')}
                    </label>
                    <input
                        type="file"
                        id="map"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setMap(e.target.files[0]);
                            }
                        }}
                        required
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                    />
                </div>

                {isClient && (
                    <>
                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.tk')}
                                   defaultChecked/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                                    <TipTapEditor
                                        content={title_tk}
                                        onChange={(content) => setTitleTk(content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                                    <TipTapEditor
                                        content={text_tk}
                                        onChange={(content) => setTextTk(content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        className="mb-1 block text-sm font-medium text-inkMuted">Destinations:</label>
                                    <TipTapEditor
                                        content={destination_tk}
                                        onChange={(content) => setDestinationTk(content)}
                                    />
                                </div>
                                <div className="flex w-full space-x-4">
                                    <div className="mb-4 w-full">
                                        <label
                                            className="mb-1 block text-sm font-medium text-inkMuted">Duration:</label>
                                        <input
                                            content={duration_tk}
                                            onChange={(e) => setDurationTk(e.target.value)}
                                            type="text"
                                            required
                                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                                        />
                                    </div>
                                    <div className="mb-4 w-full">
                                        <label
                                            className="mb-1 block text-sm font-medium text-inkMuted">Languages:</label>
                                        <input
                                            value={lang_tk}
                                            onChange={(e) => setLangTk(e.target.value)}
                                            type="text"
                                            required
                                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                                        />
                                    </div>
                                </div>

                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.en')}/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                                    <TipTapEditor
                                        content={title_en}
                                        onChange={(content) => setTitleEn(content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                                    <TipTapEditor
                                        content={text_en}
                                        onChange={(content) => setTextEn(content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        className="mb-1 block text-sm font-medium text-inkMuted">Destinations:</label>
                                    <TipTapEditor
                                        content={destination_en}
                                        onChange={(content) => setDestinationEn(content)}
                                    />
                                </div>
                                <div className="flex w-full space-x-4">
                                    <div className="mb-4 w-full">
                                        <label
                                            className="mb-1 block text-sm font-medium text-inkMuted">Duration:</label>
                                        <input
                                            value={duration_en}
                                            onChange={(e) => setDurationEn(e.target.value)}
                                            type="text"
                                            required
                                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                                        />
                                    </div>
                                    <div className="mb-4 w-full">
                                        <label
                                            className="mb-1 block text-sm font-medium text-inkMuted">Languages:</label>
                                        <input
                                            value={lang_en}
                                            onChange={(e) => setLangEn(e.target.value)}
                                            type="text"
                                            required
                                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                                        />
                                    </div>
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.ru')}/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                                    <TipTapEditor
                                        content={title_ru}
                                        onChange={(content) => setTitleRu(content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                                    <TipTapEditor
                                        content={text_ru}
                                        onChange={(content) => setTextRu(content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        className="mb-1 block text-sm font-medium text-inkMuted">Destinations:</label>
                                    <TipTapEditor
                                        content={destination_ru}
                                        onChange={(content) => setDestinationRu(content)}
                                    />
                                </div>
                                <div className="flex w-full space-x-4">
                                    <div className="mb-4 w-full">
                                        <label
                                            className="mb-1 block text-sm font-medium text-inkMuted">Duration:</label>
                                        <input
                                            value={duration_ru}
                                            onChange={(e) => setDurationRu(e.target.value)}
                                            type="text"
                                            required
                                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                                        />
                                    </div>
                                    <div className="mb-4 w-full">
                                        <label
                                            className="mb-1 block text-sm font-medium text-inkMuted">Languages:</label>
                                        <input
                                            value={lang_ru}
                                            onChange={(e) => setLangRu(e.target.value)}
                                            type="text"
                                            required
                                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                                        />
                                    </div>
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

export default AddTour;

'use client';
import { useT } from "@/lib/i18n/LocaleProvider";
import React, { useEffect, useState } from 'react';
import SlugField from '@/Components/SlugField';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { DocumentIcon } from "@heroicons/react/16/solid";
import Image from "next/image";
import TipTapEditor from "@/Components/TipTapEditor";

interface BlogData {
    slug: string;
    title_tk: string;
    text_tk: string;
    title_en: string;
    text_en: string;
    title_ru: string;
    text_ru: string;
    main_image: string;
}

const EditBlog = () => {
    const t = useT();
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState<BlogData>({
        slug: '',
        title_tk: '',
        text_tk: '',
        title_en: '',
        text_en: '',
        title_ru: '',
        text_ru: '',
        main_image: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("Ответ от сервера:", response.data);

                if (Array.isArray(response.data) && response.data.length > 0) {
                    const rawData = response.data[0]; // Получаем первый элемент массива

                    setData({
                        slug: rawData.slug,
                        title_tk: rawData.title_tk,
                        text_tk: rawData.text_tk,
                        title_en: rawData.title_en,
                        text_en: rawData.text_en,
                        title_ru: rawData.title_ru,
                        text_ru: rawData.text_ru,
                        main_image: rawData.main_image,
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

    const handleEditorChange = (name: keyof BlogData, content: string) => {
        setData((prev) => ({ ...prev, [name]: content }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error("Токен не найден");

            const formData = new FormData();


            // См. комментарий в форме тура: слаг отправляем прежний явно.
            formData.append('slug', data.slug ?? '');
            formData.append('title_tk', data.title_tk);
            formData.append('text_tk', data.text_tk);
            formData.append('title_en', data.title_en);
            formData.append('text_en', data.text_en);
            formData.append('title_ru', data.title_ru);
            formData.append('text_ru', data.text_ru);

            if (imageFile) {
                formData.append('image', imageFile);
            } else {
                formData.append('image', data.main_image);
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            router.push('/admin/blogs');
        } catch (err) {
            console.error('Ошибка при сохранении:', err);
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
                <SlugField value={data.slug} onChange={() => {}} section="blog" locked />
                {data.main_image && (
                    <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.currentImage')}</label>
                        <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}/${data.main_image.replace('\\', '/')}`}
                            alt="Service"
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
                </div>

                <div className="tabs tabs-lift">
                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.tk')} defaultChecked />
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
                    </div>

                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.en')} />
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
                    </div>

                    <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.ru')} />
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
                    </div>
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

export default EditBlog;

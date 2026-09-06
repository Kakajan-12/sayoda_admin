'use client';
import { useT } from "@/lib/i18n/LocaleProvider";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import TipTapEditor from '@/Components/TipTapEditor';
import { DocumentIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

interface BlogData {
    name: string;
    text: string;
    image: string;
}

const EditTestimonials = () => {
    const t = useT();
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState<BlogData>({
        name: '',
        text: '',
        image: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) throw new Error("Токен не найден");

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/testimonials/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("Ответ от сервера:", response.data);

                if (Array.isArray(response.data) && response.data.length > 0) {
                    const rawData = response.data[0]; // Получаем первый элемент массива

                    setData({
                        name: rawData.name || '',
                        text: rawData.text || '',
                        image: rawData.image || '',
                    });

                } else {
                    throw new Error("Данные не найдены");
                }
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Ошибка при загрузке данных');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleEditorChange = (name: keyof BlogData, content: string) => {
        setData(prev => ({ ...prev, [name]: content }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error("Токен не найден");

            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('text', data.text);

            if (imageFile) {
                // Если выбрано новое изображение
                formData.append('image', imageFile);
            } else {
                // Если новое изображение не выбрано, передаем старое
                formData.append('image', data.image);
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            router.push('/admin/testimonials');
        } catch (err) {
            console.error('Ошибка при сохранении:', err);
            setError('Ошибка при сохранении данных');
        }
    };



    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    return (
        <>
        <div className="mt-8">
            <h1 className="text-2xl font-bold mb-4">{t('form.editTitle')}</h1>
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-sand bg-white p-6 max-w-3xl">
                {data.image && (
                    <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.currentImage')}</label>
                        <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image.replace(/\\/g, '/')}`}
                            alt="Service"
                            width={200}
                            height={200}
                            className="w-64 rounded object-contain"
                        />
                    </div>
                )}
                <div className="mb-4">
                    <label htmlFor="image" className="mb-1 block text-sm font-medium text-inkMuted">{t('form.newImage')}</label>
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                                setImageFile(e.target.files[0]);
                            }
                        }}
                        className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                    />
                </div>

                <div className="tabs tabs-lift">
                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Comment" defaultChecked />
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                            <TipTapEditor
                                content={data.name}
                                onChange={content => handleEditorChange('name', content)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                            <TipTapEditor
                                content={data.text}
                                onChange={content => handleEditorChange('text', content)}
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                >
                    <DocumentIcon className="h-5 w-5 mr-2" />
                    {t('common.save')}
                </button>
            </form>
        </div>
        </>
    );
};

export default EditTestimonials;

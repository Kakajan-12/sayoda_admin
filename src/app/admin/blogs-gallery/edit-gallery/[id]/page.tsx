'use client';
import { useAdminLocale } from "@/lib/i18n/LocaleProvider";
import { optionLabel } from "@/Components/form/optionLabel";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { DocumentIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

const EditGallery = () => {
    const { locale, t } = useAdminLocale();
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({ image: '', blog_id: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [blogs, setBlogs] = useState<{ id: number, title_tk: string, title_en: string, title_ru: string }[]>([]);
    const [previewURL, setPreviewURL] = useState<string | null>(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`);
                if (!res.ok) throw new Error('Ошибка при загрузке проектов');
                const data = await res.json();
                setBlogs(data);
            } catch (err) {
                console.error('Ошибка при загрузке:', err);
                setError('Ошибка при загрузке проектов');
            }
        };

        fetchBlogs();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blog-gallery/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.id) {
                    const rawData = response.data;
                    setData(rawData);
                    setLoading(false);
                } else {
                    throw new Error('Данные не найдены');
                }
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Ошибка при загрузке');
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error("Токен не найден");

            const formData = new FormData();
            formData.append('blog_id', String(data.blog_id));

            if (imageFile) {
                formData.append('image', imageFile);
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/blog-gallery/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            router.push('/admin/blogs-gallery');
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
                {data.image && (
                    <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.currentImage')}</label>
                        <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image.replace(/\\/g, '/')}`}
                            alt="Gallery Image"
                            width={200}
                            height={200}
                            className="w-64 rounded"
                        />
                    </div>
                )}
                <div className="mb-4 grid gap-4 sm:grid-cols-2">
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
                                        setPreviewURL(URL.createObjectURL(e.target.files[0]));
                                    }
                                }}
                                className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight"
                            />
                        </div>
                    </div>
                    <div className="w-full sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.selectBlog')}
                        </label>
                        <select
                            id="blog_id"
                            name="blog_id"
                            value={String(data.blog_id)}
                            onChange={(e) => setData((prev) => ({ ...prev, blog_id: e.target.value }))}
                            required
                            className="w-full rounded-md border border-sand bg-white px-3 py-2 text-ink outline-none transition focus:border-tileLight"
                        >
                            <option value="">Select project</option>
                            {blogs.map((blog) => (
                                <option key={blog.id} value={String(blog.id)}>
                                    {optionLabel(blog, 'title', locale)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {previewURL && (
                    <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">Preview of New Image:</label>
                        <Image
                            src={previewURL}
                            alt="Preview"
                            width={200}
                            height={200}
                            className="w-64 rounded"
                        />
                    </div>
                )}

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

export default EditGallery;

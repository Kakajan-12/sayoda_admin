'use client';
import { useAdminLocale } from "@/lib/i18n/LocaleProvider";
import { optionLabel } from "@/Components/form/optionLabel";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AddBlogGallery = () => {
    const { locale, t } = useAdminLocale();
    const [image, setImage] = useState<File | null>(null);
    const [blog_id, setBlogId] = useState('');
    const [blogs, setBlogs] = useState<{ id: number, title_tk: string, title_en: string, title_ru: string }[]>([]);

    const router = useRouter();

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`);
                const data = await res.json();
                setBlogs(data);
            } catch (err) {
                console.error('Ошибка при загрузке:', err);
            }
        };

        fetchBlogs();
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
        formData.append('blog_id', blog_id ?? '');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog-gallery`, {
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
                setBlogId('');
                router.push('/admin/blogs-gallery'); // После добавления слайда редирект
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
                className="w-full rounded-lg border border-sand bg-white p-6 shadow-sm"
            >
                <h2 className="text-2xl font-bold mb-4 text-left">{t('form.addTitle')}</h2>

                <div className="mb-4 grid gap-4 sm:grid-cols-2">
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
                            className="w-full rounded-md border border-sand bg-white px-3 py-2 text-ink outline-none transition focus:border-tileLight"
                        />
                    </div>
                    <div className="w-full sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.selectBlog')}
                        </label>
                        <select
                            id="blog_id"
                            name="blog_id"
                            value={blog_id}
                            onChange={(e) => setBlogId(e.target.value)}
                            required
                            className="w-full rounded-md border border-sand bg-white px-3 py-2 text-ink outline-none transition focus:border-tileLight"
                        >
                            <option value="">{t('form.notSet')}</option>
                            {blogs.map((blog) => (
                                <option key={blog.id} value={blog.id} title={optionLabel(blog, 'title', locale)}>
                                    {optionLabel(blog, 'title', locale)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

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

export default AddBlogGallery;

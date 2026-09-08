'use client';
import { useT } from "@/lib/i18n/LocaleProvider";

import { useState, useEffect } from 'react';
import SlugField from '@/Components/SlugField';
import { useRouter } from 'next/navigation';
import TipTapEditor from '@/Components/TipTapEditor';

const AddBlog = () => {
    const t = useT();
    const [isClient, setIsClient] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [title_tk, setTitleTk] = useState('');
    const [title_en, setTitleEn] = useState('');
    const [title_ru, setTitleRu] = useState('');
    const [text_tk, setTextTk] = useState('');
    const [text_en, setTextEn] = useState('');
    const [text_ru, setTextRu] = useState('');
    const [date, setDate] = useState('');
    const [slug, setSlug] = useState('');

    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('No token. User is not authenticated.');
            return;
        }

        const formData = new FormData();
        if (image) {
            formData.append('image', image);
        } else {
            console.error('No image selected.');
            return;
        }
        formData.append('title_tk', title_tk);
        formData.append('title_en', title_en);
        formData.append('title_ru', title_ru);
        formData.append('text_tk', text_tk);
        formData.append('text_en', text_en);
        formData.append('text_ru', text_ru);
        formData.append('date', date);
        formData.append('slug', slug);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('data added successfully!', data);
                setImage(null);
                setTitleTk('');
                setTitleEn('');
                setTitleRu('');
                setTextTk('');
                setTextEn('');
                setTextRu('');
                setDate('');
                router.push('/admin/blogs');
            } else {
                const errorText = await response.text();
                console.error('Error adding blog:', errorText);
            }
        } catch (error) {
            console.error('Request error:', error);
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
                    <SlugField value={slug} onChange={setSlug} section="blog" />
                    <div>
                        <label className="mb-1 block text-sm font-medium text-inkMuted">
                            {t('form.date')}
                        </label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="w-full rounded-md border border-sand bg-white px-3 py-2 text-ink outline-none transition focus:border-tileLight"
                        />
                    </div>
                </div>

                {isClient && (
                    <>
                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.tk')}
                                   defaultChecked/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                                    <input
                                        type="text"
                                        value={title_tk}
                                        onChange={(e) => setTitleTk(e.target.value)}
                                        className="w-full rounded-md border border-sand bg-white px-3 py-2 text-ink outline-none transition focus:border-tileLight"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                                    <TipTapEditor
                                        content={text_tk}
                                        onChange={(content) => setTextTk(content)}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.en')} />
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                                    <input
                                        type="text"
                                        value={title_en}
                                        onChange={(e) => setTitleEn(e.target.value)}
                                        className="w-full rounded-md border border-sand bg-white px-3 py-2 text-ink outline-none transition focus:border-tileLight"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                                    <TipTapEditor
                                        content={text_en}
                                        onChange={(content) => setTextEn(content)}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label={t('lang.ru')} />
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.title')}</label>
                                    <input
                                        type="text"
                                        value={title_ru}
                                        onChange={(e) => setTitleRu(e.target.value)}
                                        className="w-full rounded-md border border-sand bg-white px-3 py-2 text-ink outline-none transition focus:border-tileLight"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">{t('form.text')}</label>
                                    <TipTapEditor
                                        content={text_ru}
                                        onChange={(content) => setTextRu(content)}
                                    />
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

export default AddBlog;

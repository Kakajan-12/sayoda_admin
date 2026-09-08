'use client';
import { useT } from "@/lib/i18n/LocaleProvider";

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import TipTapEditor from '@/Components/TipTapEditor';

const AddTestimonials = () => {
    const t = useT();
    const [isClient, setIsClient] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [comment, setComment] = useState('');
    const [name,setName] = useState('');


    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
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
        formData.append('text', comment ?? '');
        formData.append('name', name ?? '');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/testimonials`, {
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
                setComment('');
                setName('');
                router.push('/admin/testimonials');
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
                            className="w-full rounded-md border border-sand bg-white px-3 py-2 text-ink outline-none transition focus:border-tileLight"
                        />
                    </div>
                </div>

                {isClient && (
                    <>
                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Testimonials"
                                   defaultChecked/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">Comment:</label>
                                    <TipTapEditor
                                        content={comment}
                                        onChange={(content) => setComment(content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="mb-1 block text-sm font-medium text-inkMuted">Name:</label>
                                    <TipTapEditor
                                        content={name}
                                        onChange={(content) => setName(content)}
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

export default AddTestimonials;

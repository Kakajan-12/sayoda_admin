'use client';
import { useT } from "@/lib/i18n/LocaleProvider";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AddBlogGallery = () => {
    const t = useT();
    const [image, setImage] = useState<File | null>(null);
    const [tour_id, setTourId] = useState('');
    const [tours, setTours] = useState<{ id: number, title_tk: string, title_en: string, title_ru: string }[]>([]);

    const router = useRouter();

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tours`);
                const data = await res.json();
                setTours(data);
            } catch (err) {
                console.error('Ошибка при загрузке:', err);
            }
        };

        fetchTours();
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
        formData.append('tour_id', tour_id ?? '');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tour-gallery`, {
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
                setTourId('');
                router.push('/admin/tour-gallery'); // После добавления слайда редирект
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
                            Blog:
                        </label>
                        <select
                            id="tour_id"
                            name="tour_id"
                            value={tour_id}
                            onChange={(e) => setTourId(e.target.value)}
                            required
                            className="w-full rounded-md border border-sand px-3 py-2 outline-none transition focus:border-tileLight focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
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

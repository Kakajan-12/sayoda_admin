'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

const EditTour = () => {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState({ title_tk: '', title_en:'', title_ru:'', text_tk: '', text_en: '', text_ru: '', image: '', destination_tk: '', destination_en: '', destination_ru:'', duration_tk:'', duration_en:'', duration_ru:'', lang_tk:'', lang_en:'', lang_ru:'', price:'', tour_type_id:'', map:'' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imagePath, setImagePath] = useState('');
    const [types, setTypes] = useState<{ id: number, type_tk: string, type_en: string, type_ru: string }[]>([]);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tour-types`);
                const data = await res.json();
                setTypes(data);
            } catch (err) {
                console.error('Ошибка при загрузке категорий:', err);
            }
        };

        fetchTypes();
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

                    // Форматируем дату для input[type="date"]
                    const formattedDate = rawData.date
                        ? new Date(rawData.date).toISOString().split('T')[0]
                        : '';

                    setData({
                        ...rawData,
                        date: formattedDate,
                    });

                    setImagePath(rawData.image);
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
        setData((prev) => ({ ...prev, [name]: content }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            let imageToSend = imagePath;

            // Если выбрано новое изображение
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);

                const uploadResponse = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/sliders/upload`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                imageToSend = uploadResponse.data.filename;
            }

            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/tours/${id}`,
                { ...data, image: imageToSend },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            router.push(`/admin/tours/view-tour/${id}`);
        } catch (err) {
            console.error(err);
            setError('Ошибка при сохранении');
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <h1 className="text-2xl font-bold mb-4">Edit Tour</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        {data.image && (
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Current image:</label>
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
                                    <label htmlFor="image" className="block font-semibold mb-2">New image:</label>
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setImageFile(e.target.files[0]);
                                            }
                                        }}
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Select Types:
                                </label>
                                <select
                                    id="tour_type"
                                    name="tour_type_id"
                                    value={String(data.tour_type_id)}
                                    onChange={(e) => setData((prev) => ({...prev, tour_type_id: e.target.value}))}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                >
                                    <option value="">Select type</option>
                                    {types.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.type_en} / {type.type_tk} / {type.type_ru}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4 w-full">
                                <label className="block text-gray-700 font-semibold mb-2">Price:</label>
                                <input
                                    name="price"
                                    value={data.price}
                                    onChange={(e) => setData((prev) => ({...prev, price: e.target.value}))}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                        </div>

                        <div className="mb-4 w-full">
                            <label
                                className="block text-gray-700 font-semibold mb-2">Map:</label>
                            <textarea value={data.map}
                                      onChange={(e) => setData((prev) => ({...prev, map: e.target.value}))}
                                      rows={10}
                                      required
                                      className="border border-gray-300 rounded p-2 w-full">

                            </textarea>
                        </div>

                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Turkmen" defaultChecked/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.title_tk}
                                        onEditorChange={(content) => handleEditorChange('title_tk', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Text:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.text_tk}
                                        onEditorChange={(content) => handleEditorChange('text_tk', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Destination:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.destination_tk}
                                        onEditorChange={(content) => handleEditorChange('destination_tk', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Duration:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.duration_tk}
                                        onEditorChange={(content) => handleEditorChange('duration_tk', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Lang:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.lang_tk}
                                        onEditorChange={(content) => handleEditorChange('lang_tk', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="English"/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.title_en}
                                        onEditorChange={(content) => handleEditorChange('title_en', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Text:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.text_en}
                                        onEditorChange={(content) => handleEditorChange('text_en', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Destination:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.destination_en}
                                        onEditorChange={(content) => handleEditorChange('destination_en', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Duration:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.duration_en}
                                        onEditorChange={(content) => handleEditorChange('duration_en', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Lang:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.lang_en}
                                        onEditorChange={(content) => handleEditorChange('lang_en', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Russian"/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.title_ru}
                                        onEditorChange={(content) => handleEditorChange('title_ru', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Text:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.text_ru}
                                        onEditorChange={(content) => handleEditorChange('text_ru', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Destination:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.destination_ru}
                                        onEditorChange={(content) => handleEditorChange('destination_ru', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Duration:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.duration_ru}
                                        onEditorChange={(content) => handleEditorChange('duration_ru', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Lang:</label>
                                    <Editor
                                        apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                        value={data.lang_ru}
                                        onEditorChange={(content) => handleEditorChange('lang_ru', content)}
                                        init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: 'link image code lists',
                                            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="bg text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
                        >
                            <DocumentIcon className="size-5 mr-2"/>
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditTour;

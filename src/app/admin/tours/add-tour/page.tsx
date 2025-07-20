'use client';

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import {Editor} from '@tinymce/tinymce-react';

const AddTour = () => {
    const [isClient, setIsClient] = useState(false);
    const [image, setImage] = useState<File | null>(null);
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
    const [map, setMap] = useState('');
    const [tour_type_id, setTourType] = useState('');
    const [types, setTypes] = useState<
        { id: number; type_tk: string; type_en: string; type_ru: string }[]
    >([]);


    const router = useRouter();

    useEffect(() => {
        setIsClient(true);

        const fetchTypes = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tour-types`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    setTypes(data);
                } else {
                    console.error('Неверный формат данных категорий:', data);
                }
            } catch (err) {
                console.error('Ошибка при загрузке категорий:', err);
            }
        };


        fetchTypes();
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
        formData.append('map', map ?? '');
        formData.append('tour_type_id', tour_type_id ?? '');

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
                setMap('');
                setTourType('');
                router.push('/admin/tours');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении:', errorText);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    const editorConfig = {
        height: 200,
        menubar: false,
        plugins: ['lists link image editimage table code'],
        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image code',
        content_css: '//www.tiny.cloud/css/codepen.min.css',
    };

    return (
        <div className="flex bg-gray-200">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-left">Add new tour</h2>

                        <div className="mb-4 flex space-x-4">
                            <div className="w-full">
                                <label htmlFor="image" className="block text-gray-700 font-semibold mb-2">
                                    Image:
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
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Select Types:
                                </label>
                                <select
                                    id="tour_type"
                                    name="tour_type_id"
                                    value={tour_type_id}
                                    onChange={(e) => setTourType(e.target.value)}
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
                                <label
                                    className="block text-gray-700 font-semibold mb-2">Price:</label>
                                <input
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                        </div>

                        <div className="mb-4 w-full">
                            <label
                                className="block text-gray-700 font-semibold mb-2">Map:</label>
                            <textarea value={map}
                                      onChange={(e) => setMap(e.target.value)}
                                      rows={10}
                                      required
                                      className="border border-gray-300 rounded p-2 w-full">

                            </textarea>
                        </div>

                        {isClient && (
                            <>
                                <div className="tabs tabs-lift">
                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Turkmen"
                                           defaultChecked/>
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                            <Editor
                                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                                init={editorConfig}
                                                value={title_tk}
                                                onEditorChange={(content) => setTitleTk(content)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                            <Editor
                                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                                init={editorConfig}
                                                value={text_tk}
                                                onEditorChange={(content) => setTextTk(content)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label
                                                className="block text-gray-700 font-semibold mb-2">Destinations:</label>
                                            <Editor
                                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                                init={editorConfig}
                                                value={destination_tk}
                                                onEditorChange={(content) => setDestinationTk(content)}
                                            />
                                        </div>
                                        <div className="flex w-full space-x-4">
                                            <div className="mb-4 w-full">
                                                <label
                                                    className="block text-gray-700 font-semibold mb-2">Duration:</label>
                                                <input
                                                    value={duration_tk}
                                                    onChange={(e) => setDurationTk(e.target.value)}
                                                    type="text"
                                                    required
                                                    className="border border-gray-300 rounded p-2 w-full"
                                                />
                                            </div>
                                            <div className="mb-4 w-full">
                                                <label
                                                    className="block text-gray-700 font-semibold mb-2">Languages:</label>
                                                <input
                                                    value={lang_tk}
                                                    onChange={(e) => setLangTk(e.target.value)}
                                                    type="text"
                                                    required
                                                    className="border border-gray-300 rounded p-2 w-full"
                                                />
                                            </div>
                                        </div>

                                    </div>

                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="English"/>
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                            <Editor
                                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                                init={editorConfig}
                                                value={title_en}
                                                onEditorChange={(content) => setTitleEn(content)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                            <Editor
                                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                                init={editorConfig}
                                                value={text_en}
                                                onEditorChange={(content) => setTextEn(content)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label
                                                className="block text-gray-700 font-semibold mb-2">Destinations:</label>
                                            <Editor
                                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                                init={editorConfig}
                                                value={destination_en}
                                                onEditorChange={(content) => setDestinationEn(content)}
                                            />
                                        </div>
                                        <div className="flex w-full space-x-4">
                                            <div className="mb-4 w-full">
                                                <label
                                                    className="block text-gray-700 font-semibold mb-2">Duration:</label>
                                                <input
                                                    value={duration_en}
                                                    onChange={(e) => setDurationEn(e.target.value)}
                                                    type="text"
                                                    required
                                                    className="border border-gray-300 rounded p-2 w-full"
                                                />
                                            </div>
                                            <div className="mb-4 w-full">
                                                <label
                                                    className="block text-gray-700 font-semibold mb-2">Languages:</label>
                                                <input
                                                    value={lang_en}
                                                    onChange={(e) => setLangEn(e.target.value)}
                                                    type="text"
                                                    required
                                                    className="border border-gray-300 rounded p-2 w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Russian"/>
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                            <Editor
                                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                                init={editorConfig}
                                                value={title_ru}
                                                onEditorChange={(content) => setTitleRu(content)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                            <Editor
                                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                                init={editorConfig}
                                                value={text_ru}
                                                onEditorChange={(content) => setTextRu(content)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label
                                                className="block text-gray-700 font-semibold mb-2">Destinations:</label>
                                            <Editor
                                                apiKey="z9ht7p5r21591bc3n06i1yc7nmokdeorgawiso8vkpodbvp0"
                                                init={editorConfig}
                                                value={destination_ru}
                                                onEditorChange={(content) => setDestinationRu(content)}
                                            />
                                        </div>
                                        <div className="flex w-full space-x-4">
                                            <div className="mb-4 w-full">
                                                <label
                                                    className="block text-gray-700 font-semibold mb-2">Duration:</label>
                                                <input
                                                    value={duration_ru}
                                                    onChange={(e) => setDurationRu(e.target.value)}
                                                    type="text"
                                                    required
                                                    className="border border-gray-300 rounded p-2 w-full"
                                                />
                                            </div>
                                            <div className="mb-4 w-full">
                                                <label
                                                    className="block text-gray-700 font-semibold mb-2">Languages:</label>
                                                <input
                                                    value={lang_ru}
                                                    onChange={(e) => setLangRu(e.target.value)}
                                                    type="text"
                                                    required
                                                    className="border border-gray-300 rounded p-2 w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                        >
                            Add tour
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddTour;

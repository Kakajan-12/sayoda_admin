'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { DocumentIcon } from '@heroicons/react/16/solid';
import SlugField from '@/Components/SlugField';
import TipTapEditor from '@/Components/TipTapEditor';
import TourTabsBar, { type TourPageTab } from '@/Components/tour/TourTabsBar';
import TourPanels from '@/Components/tour/TourPanels';
import {
    Checkbox,
    Field,
    FieldRow,
    FormSection,
    LangTabs,
    LANGS,
    inputClass,
    type Lang,
} from '@/Components/form/Field';
import { plainText } from '@/Components/ResourceList';
import { useAdminLocale } from '@/lib/i18n/LocaleProvider';
import { optionLabel } from '@/Components/form/optionLabel';
import { readToken } from '@/lib/auth';

const API = process.env.NEXT_PUBLIC_API_URL;

/**
 * Правка тура.
 *
 * Форма была одним полотном: пять полей стояли в ряд через flex, и каждое
 * объявлено во всю ширину — на обычном экране они сжимались в нечитаемые
 * полоски. Подписи шли вперемешку по-русски и по-английски («Destination:»,
 * «Duration:»), а признак «популярный» предлагал выбрать True или False.
 *
 * Главное же: на странице стояло шестнадцать полноценных редакторов с
 * панелью форматирования. В том числе на полях, где лежит число дней и
 * список языков через запятую. Осталось три — по одному на язык, и только
 * для описания, которое действительно бывает в несколько абзацев.
 */

type TourData = {
    popular: number;
    slug: string;
    title_tk: string; title_en: string; title_ru: string;
    text_tk: string; text_en: string; text_ru: string;
    destination_tk: string; destination_en: string; destination_ru: string;
    duration_tk: string; duration_en: string; duration_ru: string;
    lang_tk: string; lang_en: string; lang_ru: string;
    image: string;
    map: string;
    price: number;
    tour_type_id: number;
    tour_cat_id: number;
    location_id: number;
};

const EMPTY: TourData = {
    popular: 0, slug: '',
    title_tk: '', title_en: '', title_ru: '',
    text_tk: '', text_en: '', text_ru: '',
    destination_tk: '', destination_en: '', destination_ru: '',
    duration_tk: '', duration_en: '', duration_ru: '',
    lang_tk: '', lang_en: '', lang_ru: '',
    image: '', map: '', price: 0,
    tour_type_id: 0, tour_cat_id: 0, location_id: 0,
};

/** Поля, которые раньше редактировались в rich-редакторе и потому хранят «<p>3</p>». */
const PLAIN_FIELDS = ['title', 'destination', 'duration', 'lang'] as const;

/**
 * Multer пишет абсолютный путь внутри контейнера, часть старых записей —
 * относительный, и в некоторых лежат обратные слэши от Windows.
 */
const mediaUrl = (src: string) => {
    const clean = String(src ?? '')
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .replace(/^app\//, '');
    return clean ? `${API}/${clean}` : null;
};

const EditTour = () => {
    const { locale, t } = useAdminLocale();
    const { id } = useParams();
    const router = useRouter();

    const [tab, setTab] = useState<TourPageTab>('main');
    const [lang, setLang] = useState<Lang>('ru');
    const [data, setData] = useState<TourData>(EMPTY);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [mapFile, setMapFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [types, setTypes] = useState<{ id: number; type_ru: string; type_en: string }[]>([]);
    const [cats, setCats] = useState<{ id: number; cat_ru: string; cat_en: string }[]>([]);
    const [places, setPlaces] = useState<{ id: number; location_ru: string; location_en: string }[]>([]);

    useEffect(() => {
        Promise.all([
            axios.get(`${API}/api/tour-types`),
            axios.get(`${API}/api/tour-category`),
            axios.get(`${API}/api/tour-location`),
        ])
            .then(([typesRes, catRes, placeRes]) => {
                setTypes(Array.isArray(typesRes.data) ? typesRes.data : []);
                setCats(Array.isArray(catRes.data) ? catRes.data : []);
                setPlaces(Array.isArray(placeRes.data) ? placeRes.data : []);
            })
            .catch(() => {
                /* справочники не критичны для отрисовки формы */
            });
    }, []);

    useEffect(() => {
        if (!id) return;
        axios
            .get(`${API}/api/tours/${id}`, { headers: { Authorization: `Bearer ${readToken()}` } })
            .then((res) => {
                const row = res.data;
                if (!row?.id) throw new Error('not found');

                /*
                 * Поля, ставшие обычными, приходят из базы обёрнутыми
                 * в «<p>…</p>» — их набирали в rich-редакторе. В простое
                 * поле такое значение попало бы вместе с тегами, поэтому
                 * разметку снимаем при загрузке. Сохранится уже чистый
                 * текст: сайт эти поля всё равно выводит без разметки.
                 */
                const cleaned: Record<string, unknown> = { ...row };
                for (const base of PLAIN_FIELDS) {
                    for (const code of LANGS) {
                        const key = `${base}_${code}`;
                        cleaned[key] = plainText(row[key] ?? '');
                    }
                }

                setData({ ...EMPTY, ...cleaned, popular: Number(row.popular) } as TourData);
            })
            .catch(() => setError(t('common.error')))
            .finally(() => setLoading(false));
    }, [id, t]);

    const set = (patch: Partial<TourData>) => setData((prev) => ({ ...prev, ...patch }));

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setError('');

        try {
            const body = new FormData();
            // Слаг отправляем прежний: поле в форме закрыто, но без него
            // бэкенд принял бы пустое значение за просьбу оставить как есть —
            // отправляем явно, чтобы поведение не зависело от умолчаний.
            body.append('slug', data.slug ?? '');
            body.append('popular', String(data.popular));
            body.append('price', String(data.price));
            body.append('tour_type_id', String(data.tour_type_id));
            body.append('tour_cat_id', String(data.tour_cat_id));
            body.append('location_id', String(data.location_id));

            for (const base of ['title', 'text', 'destination', 'duration', 'lang'] as const) {
                for (const code of LANGS) {
                    const key = `${base}_${code}` as keyof TourData;
                    body.append(key, String(data[key] ?? ''));
                }
            }

            if (imageFile) body.append('image', imageFile);
            if (mapFile) body.append('map', mapFile);

            await axios.put(`${API}/api/tours/${id}`, body, {
                headers: { Authorization: `Bearer ${readToken()}` },
            });
            router.push('/admin/tours');
        } catch {
            setError(t('common.error'));
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="mt-8 text-inkMuted">{t('common.loading')}</p>;
    }

    const heading =
        plainText(data.title_ru) || plainText(data.title_en) || t('form.editTitle');

    const imageSrc = mediaUrl(data.image);
    const mapSrc = mediaUrl(data.map);

    return (
        <div className="mt-8">
            <h1 className="mb-4 text-2xl font-bold text-ink">{heading}</h1>

            {/* Программа, состав цены, «главное», заезды и снимки редактируются
                здесь же — раньше каждый из этих списков был отдельным
                разделом меню. */}
            <TourTabsBar active={tab} onChange={setTab} />

            {tab !== 'main' && <TourPanels tourId={Number(id)} tab={tab} />}

            {/*
                Форма прячется, а не размонтируется: иначе несохранённые
                правки пропадали бы, стоит заглянуть в программу и вернуться.
            */}
            <form
                onSubmit={handleSubmit}
                className={`space-y-6 rounded-lg border border-sand bg-white p-6 ${tab === 'main' ? '' : 'hidden'}`}
            >
                {error && (
                    <p className="rounded-md bg-brick/10 px-4 py-3 text-sm text-brick">{error}</p>
                )}

                <FormSection title={t('form.sectionBasics')}>
                    <SlugField value={data.slug} onChange={() => {}} section="tours" locked />

                    <FieldRow cols={3}>
                        <Field label={t('form.selectType')}>
                            <select
                                value={data.tour_type_id}
                                onChange={(e) => set({ tour_type_id: Number(e.target.value) })}
                                required
                                className={inputClass}
                            >
                                <option value="">{t('form.notSet')}</option>
                                {types.map((type) => (
                                    <option key={type.id} value={type.id} title={optionLabel(type, 'type', locale)}>
                                        {optionLabel(type, 'type', locale)}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label={t('form.selectCategory')}>
                            <select
                                value={data.tour_cat_id}
                                onChange={(e) => set({ tour_cat_id: Number(e.target.value) })}
                                required
                                className={inputClass}
                            >
                                <option value="">{t('form.notSet')}</option>
                                {cats.map((cat) => (
                                    <option key={cat.id} value={cat.id} title={optionLabel(cat, 'cat', locale)}>
                                        {optionLabel(cat, 'cat', locale)}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label={t('form.selectDestination')}>
                            <select
                                value={data.location_id}
                                onChange={(e) => set({ location_id: Number(e.target.value) })}
                                className={inputClass}
                            >
                                <option value="">{t('form.notSet')}</option>
                                {places.map((place) => (
                                    <option key={place.id} value={place.id} title={optionLabel(place, 'location', locale)}>
                                        {optionLabel(place, 'location', locale)}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </FieldRow>

                    <FieldRow>
                        <Field label={t('form.price')}>
                            <input
                                type="number"
                                min={0}
                                value={data.price}
                                onChange={(e) => set({ price: Number(e.target.value) })}
                                required
                                className={inputClass}
                            />
                        </Field>

                        {/* Был выпадающий список с двумя вариантами, до
                            этого — «True / False». Вопрос здесь на «да/нет»,
                            и флажок отвечает на него одним щелчком. */}
                        <Checkbox
                            label={t('form.popular')}
                            checked={data.popular === 1}
                            onChange={(on) => set({ popular: on ? 1 : 0 })}
                        />
                    </FieldRow>
                </FormSection>

                <FormSection title={t('form.sectionImages')}>
                    <FieldRow>
                        <Field label={t('form.image')} hint={t('form.replaceImage')} htmlFor="tour-image">
                            {imageSrc && (
                                <Image
                                    src={imageSrc}
                                    alt={heading}
                                    width={320}
                                    height={200}
                                    unoptimized
                                    className="mb-2 aspect-[16/10] w-full max-w-xs rounded-md border border-sand object-cover"
                                />
                            )}
                            <input
                                id="tour-image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                                className={inputClass}
                            />
                        </Field>

                        <Field label={t('form.map')} hint={t('form.replaceImage')} htmlFor="tour-map">
                            {mapSrc && (
                                <Image
                                    src={mapSrc}
                                    alt={t('form.map')}
                                    width={320}
                                    height={200}
                                    unoptimized
                                    className="mb-2 aspect-[16/10] w-full max-w-xs rounded-md border border-sand object-contain"
                                />
                            )}
                            <input
                                id="tour-map"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => setMapFile(e.target.files?.[0] ?? null)}
                                className={inputClass}
                            />
                        </Field>
                    </FieldRow>
                </FormSection>

                <FormSection title={t('form.sectionTexts')} hint={t('form.sectionTextsHint')}>
                    <LangTabs active={lang} onChange={setLang} />

                    {/*
                        Все три языка остаются в разметке и просто прячутся:
                        так набранный текст не теряется при переключении, а
                        редактор не перезапускается на каждом переходе.
                    */}
                    {LANGS.map((code) => (
                        <div key={code} className={`space-y-4 ${code === lang ? '' : 'hidden'}`}>
                            <Field label={t('form.title')}>
                                <input
                                    type="text"
                                    value={data[`title_${code}`]}
                                    onChange={(e) => set({ [`title_${code}`]: e.target.value } as Partial<TourData>)}
                                    className={inputClass}
                                />
                            </Field>

                            <FieldRow cols={3}>
                                <Field label={t('form.destination')} hint={t('form.destinationHint')}>
                                    <input
                                        type="text"
                                        value={data[`destination_${code}`]}
                                        onChange={(e) => set({ [`destination_${code}`]: e.target.value } as Partial<TourData>)}
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label={t('form.duration')} hint={t('form.durationHint')}>
                                    <input
                                        type="text"
                                        value={data[`duration_${code}`]}
                                        onChange={(e) => set({ [`duration_${code}`]: e.target.value } as Partial<TourData>)}
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label={t('form.lang')} hint={t('form.langHint')}>
                                    <input
                                        type="text"
                                        value={data[`lang_${code}`]}
                                        onChange={(e) => set({ [`lang_${code}`]: e.target.value } as Partial<TourData>)}
                                        className={inputClass}
                                    />
                                </Field>
                            </FieldRow>

                            {/* Описание — единственное поле тура, которое
                                действительно бывает в несколько абзацев. */}
                            <Field label={t('form.text')}>
                                <TipTapEditor
                                    content={data[`text_${code}`]}
                                    onChange={(html) => set({ [`text_${code}`]: html } as Partial<TourData>)}
                                />
                            </Field>
                        </div>
                    ))}
                </FormSection>

                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center rounded-md bg-tile px-5 py-2.5 text-white transition-colors hover:bg-tileDark disabled:opacity-60"
                >
                    <DocumentIcon className="mr-2 size-5" />
                    {t(saving ? 'common.saving' : 'common.save')}
                </button>
            </form>
        </div>
    );
};

export default EditTour;

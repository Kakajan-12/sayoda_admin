'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { DocumentIcon } from '@heroicons/react/16/solid';
import SlugField from '@/Components/SlugField';
import TipTapEditor from '@/Components/TipTapEditor';
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
 * Новый тур.
 *
 * Та же форма, что и при правке, и приведена к тому же виду: поля в сетке
 * вместо ряда из пяти сжатых колонок, подписи на языке интерфейса, а
 * редактор с панелью форматирования остался только у описания.
 *
 * Программа по дням, состав цены и снимки заводятся уже во вкладках самого
 * тура — им нужен существующий тур, поэтому после сохранения открывается
 * он, а не общий список.
 */

const BASES = ['title', 'text', 'destination', 'duration', 'lang'] as const;

/** Пустые значения всех языковых полей: title_tk, title_en, … */
const emptyTexts = () => {
    const out: Record<string, string> = {};
    for (const base of BASES) for (const code of LANGS) out[`${base}_${code}`] = '';
    return out;
};

const AddTour = () => {
    const { locale, t } = useAdminLocale();
    const router = useRouter();

    const [lang, setLang] = useState<Lang>('ru');
    const [texts, setTexts] = useState<Record<string, string>>(emptyTexts);
    const [slug, setSlug] = useState('');
    const [price, setPrice] = useState('');
    const [popular, setPopular] = useState('0');
    const [typeId, setTypeId] = useState('');
    const [catId, setCatId] = useState('');
    const [placeId, setPlaceId] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [mapFile, setMapFile] = useState<File | null>(null);
    const [mapEmbed, setMapEmbed] = useState('');
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

    const setText = (key: string, value: string) =>
        setTexts((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setError('');

        try {
            const body = new FormData();
            body.append('slug', slug);
            body.append('price', price || '0');
            body.append('popular', popular);
            body.append('tour_type_id', typeId);
            body.append('tour_cat_id', catId);
            body.append('location_id', placeId);
            body.append('map_embed', mapEmbed);
            for (const [key, value] of Object.entries(texts)) body.append(key, value);
            if (imageFile) body.append('image', imageFile);
            if (mapFile) body.append('map', mapFile);

            const res = await axios.post(`${API}/api/tours`, body, {
                headers: { Authorization: `Bearer ${readToken()}` },
            });

            /*
             * Открываем сразу созданный тур, а не общий список: программе,
             * составу цены и снимкам нужен уже существующий тур, и возврат
             * в список означал бы, что редактор тут же ищет только что
             * созданную запись руками.
             */
            const newId = res.data?.id;
            router.push(newId ? `/admin/tours/edit-tour/${newId}` : '/admin/tours');
        } catch {
            setError(t('common.error'));
            setSaving(false);
        }
    };

    return (
        <div className="mt-8">
            <h1 className="mb-4 text-2xl font-bold text-ink">{t('form.addTitle')}</h1>

            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-lg border border-sand bg-white p-6"
            >
                {error && (
                    <p className="rounded-md bg-brick/10 px-4 py-3 text-sm text-brick">{error}</p>
                )}

                <FormSection title={t('form.sectionBasics')}>
                    <SlugField value={slug} onChange={setSlug} section="tours" />

                    <FieldRow cols={3}>
                        <Field label={t('form.selectType')}>
                            <select
                                value={typeId}
                                onChange={(e) => setTypeId(e.target.value)}
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
                                value={catId}
                                onChange={(e) => setCatId(e.target.value)}
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
                                value={placeId}
                                onChange={(e) => setPlaceId(e.target.value)}
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
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                className={inputClass}
                            />
                        </Field>

                        <Checkbox
                            label={t('form.popular')}
                            checked={popular === '1'}
                            onChange={(on) => setPopular(on ? '1' : '0')}
                        />
                    </FieldRow>
                </FormSection>

                <FormSection title={t('form.sectionImages')}>
                    <Field label={t('form.mapEmbed')} hint={t('form.mapEmbedHint')}>
                        <input
                            type="text"
                            value={mapEmbed}
                            onChange={(e) => setMapEmbed(e.target.value)}
                            placeholder="https://www.google.com/maps/d/u/0/embed?mid=…"
                            className={inputClass}
                        />
                    </Field>

                    <FieldRow>
                        <Field label={t('form.image')} htmlFor="tour-image">
                            <input
                                id="tour-image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                                className={inputClass}
                            />
                        </Field>

                        <Field label={t('form.map')} htmlFor="tour-map">
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

                    {/* Все три языка остаются в разметке и просто прячутся:
                        набранный текст не теряется при переключении. */}
                    {LANGS.map((code) => (
                        <div key={code} className={`space-y-4 ${code === lang ? '' : 'hidden'}`}>
                            <Field label={t('form.title')}>
                                <input
                                    type="text"
                                    value={texts[`title_${code}`]}
                                    onChange={(e) => setText(`title_${code}`, e.target.value)}
                                    className={inputClass}
                                />
                            </Field>

                            <FieldRow cols={3}>
                                <Field label={t('form.destination')} hint={t('form.destinationHint')}>
                                    <input
                                        type="text"
                                        value={texts[`destination_${code}`]}
                                        onChange={(e) => setText(`destination_${code}`, e.target.value)}
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label={t('form.duration')} hint={t('form.durationHint')}>
                                    <input
                                        type="text"
                                        value={texts[`duration_${code}`]}
                                        onChange={(e) => setText(`duration_${code}`, e.target.value)}
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label={t('form.lang')} hint={t('form.langHint')}>
                                    <input
                                        type="text"
                                        value={texts[`lang_${code}`]}
                                        onChange={(e) => setText(`lang_${code}`, e.target.value)}
                                        className={inputClass}
                                    />
                                </Field>
                            </FieldRow>

                            <Field label={t('form.text')}>
                                <TipTapEditor
                                    content={texts[`text_${code}`]}
                                    onChange={(html) => setText(`text_${code}`, html)}
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
                    {t(saving ? 'common.saving' : 'common.add')}
                </button>
            </form>
        </div>
    );
};

export default AddTour;

'use client'
import React from "react";
import TipTapEditor from "@/Components/TipTapEditor";

/**
 * Поля страны — общая часть форм добавления и редактирования.
 *
 * Название и заголовок обложки идут обычными input: они попадают в h1 и в
 * title страницы, разметка там не нужна. Описание и виза — редактор: в них
 * списки и таблицы, ради которых раздел и существует.
 */

export interface DestinationForm {
    slug: string;
    sort_order: string;
    name_tk: string; name_en: string; name_ru: string;
    hero_title_tk: string; hero_title_en: string; hero_title_ru: string;
    intro_tk: string; intro_en: string; intro_ru: string;
    visa_tk: string; visa_en: string; visa_ru: string;
}

export const EMPTY_DESTINATION: DestinationForm = {
    slug: '', sort_order: '0',
    name_tk: '', name_en: '', name_ru: '',
    hero_title_tk: '', hero_title_en: '', hero_title_ru: '',
    intro_tk: '', intro_en: '', intro_ru: '',
    visa_tk: '', visa_en: '', visa_ru: '',
};

export const DESTINATION_LANGS: { code: 'tk' | 'en' | 'ru'; label: string }[] = [
    { code: 'tk', label: 'Türkmençe' },
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
];

interface Props {
    value: DestinationForm;
    onChange: (patch: Partial<DestinationForm>) => void;
    /** Адрес страницы менять после публикации опасно — ломает ссылки. */
    slugLocked?: boolean;
}

const DestinationFields = ({ value, onChange, slugLocked }: Props) => (
    <>
        <div className="flex gap-4">
            <div className="w-full">
                <label className="block font-semibold mb-2">Адрес страницы</label>
                <input
                    type="text"
                    value={value.slug}
                    onChange={(e) => onChange({ slug: e.target.value })}
                    readOnly={slugLocked}
                    required
                    placeholder="uzbekistan"
                    className={`border border-gray-300 rounded p-2 w-full ${slugLocked ? 'bg-gray-100 text-gray-600' : ''}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                    {slugLocked
                        ? 'Менять нельзя: по этому адресу уже есть ссылки и он в поиске.'
                        : 'Латиницей, без пробелов. Получится /destinations/…'}
                </p>
            </div>
            <div className="w-64 shrink-0">
                <label className="block font-semibold mb-2">Порядок</label>
                <input
                    type="number"
                    value={value.sort_order}
                    onChange={(e) => onChange({ sort_order: e.target.value })}
                    className="border border-gray-300 rounded p-2 w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Меньше — выше в списке.</p>
            </div>
        </div>

        <div className="tabs tabs-lift">
            {DESTINATION_LANGS.map((lang, i) => (
                <React.Fragment key={lang.code}>
                    <input
                        type="radio"
                        name="destination_langs"
                        className="tab"
                        aria-label={lang.label}
                        defaultChecked={i === 0}
                    />
                    <div className="tab-content bg-base-100 border-base-300 p-6">
                        <div className="mb-4">
                            <label className="block font-semibold mb-2">Название страны</label>
                            <input
                                type="text"
                                value={value[`name_${lang.code}`]}
                                onChange={(e) => onChange({ [`name_${lang.code}`]: e.target.value })}
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block font-semibold mb-2">Заголовок на обложке</label>
                            <input
                                type="text"
                                value={value[`hero_title_${lang.code}`]}
                                onChange={(e) => onChange({ [`hero_title_${lang.code}`]: e.target.value })}
                                className="border border-gray-300 rounded p-2 w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block font-semibold mb-2">Описание</label>
                            <TipTapEditor
                                content={value[`intro_${lang.code}`]}
                                onChange={(content) => onChange({ [`intro_${lang.code}`]: content })}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block font-semibold mb-2">Виза</label>
                            <TipTapEditor
                                content={value[`visa_${lang.code}`]}
                                onChange={(content) => onChange({ [`visa_${lang.code}`]: content })}
                            />
                        </div>
                    </div>
                </React.Fragment>
            ))}
        </div>
    </>
);

export default DestinationFields;

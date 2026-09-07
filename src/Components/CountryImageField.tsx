'use client';

import React from "react";
import Image from "next/image";

/**
 * Поле картинки страны: превью, выбор файла и подпись.
 *
 * Картинок у страны две, и они разные по делу: обложка страницы страны
 * горизонтальная, плитка на главной вертикальная. Превью показывается в тех
 * же пропорциях, в каких картинка потом и будет — иначе редактор загрузит
 * горизонтальный кадр в вертикальную плитку и увидит обрезку только на сайте.
 */

const API = process.env.NEXT_PUBLIC_API_URL;

/**
 * Загруженный файл узнаём по «uploads» в пути, а не по отсутствию ведущего
 * слэша: multer отдаёт абсолютный путь внутри контейнера вида
 * «/app/uploads/страна.webp». Пути, перенесённые из статики сайта
 * («/Cards/tm.jpg»), лежат в вёрстке фронтенда — в админке их не показать.
 */
const imageUrl = (src: string | null) => {
    if (!src) return null;
    const normalized = src
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .replace(/^app\//, '');
    if (!normalized.startsWith('uploads/')) return null;
    return `${API}/${normalized}`;
};

export default function CountryImageField({
    label,
    hint,
    current,
    shape,
    onFile,
}: {
    label: string;
    hint: string;
    /** Путь из базы. Пусто — покажем заглушку. */
    current: string | null;
    /** wide — обложка 3:2, card — плитка 3:4. */
    shape: 'wide' | 'card';
    onFile: (file: File | null) => void;
}) {
    const src = imageUrl(current);
    const box = shape === 'wide' ? 'w-64 h-40' : 'w-32 h-[10.67rem]';

    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-inkMuted">{label}</label>
            <div className="flex items-start gap-6">
                <div
                    className={`${box} flex shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100`}
                >
                    {src ? (
                        <Image
                            src={src}
                            alt=""
                            width={320}
                            height={shape === 'wide' ? 213 : 427}
                            className="h-full w-full object-cover"
                            unoptimized
                        />
                    ) : (
                        <span className="px-3 text-center text-xs text-gray-500">
                            {current
                                ? 'Картинка из вёрстки сайта'
                                : 'Картинка не задана'}
                        </span>
                    )}
                </div>
                <div>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => onFile(e.target.files?.[0] || null)}
                        className="text-sm"
                    />
                    <p className="mt-1 max-w-sm text-xs text-gray-500">{hint}</p>
                </div>
            </div>
        </div>
    );
}

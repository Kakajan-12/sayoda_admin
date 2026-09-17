'use client';

import React, { useEffect, useState } from "react";

/**
 * Поле картинки страны: превью, выбор файла и подпись.
 *
 * Картинок у страны две, и они разные по делу: обложка страницы страны
 * горизонтальная, плитка на главной вертикальная. Превью показывается в тех
 * же пропорциях, в каких картинка потом и будет — иначе редактор загрузит
 * горизонтальный кадр в вертикальную плитку и увидит обрезку только на сайте.
 *
 * Показывается либо только что выбранный файл, либо сохранённая картинка.
 * Раньше — только сохранённая: выбрав файл, редактор видел на её месте
 * прежний кадр, а в форме добавления страны и вовсе надпись «Картинка не
 * задана». Проверить, тот ли файл выбран и как он сядет в пропорции,
 * было нельзя до самого сохранения — а весь смысл превью в том, чтобы
 * увидеть это до него.
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

/**
 * Что не так с выбранным файлом — или null, если всё в порядке.
 *
 * Проверка появилась не от придирчивости. Плитки стран на главной вырезаны
 * из горизонтальных кадров: 1920×1279, 1280×720, 915×559 — при том, что
 * место под них вертикальное, 3:4. Браузер уменьшает картинку по ширине
 * плитки, и у горизонтального кадра высоты после этого не хватает —
 * приходится растягивать вдвое. Отсюда и мыло, которое видно на главной.
 *
 * Подпись под полем всё это говорила и раньше, но подпись читают до
 * выбора файла, а расхождение видно только после. Поэтому предупреждение
 * появляется ровно тогда, когда файл уже выбран, и рядом с превью.
 *
 * Это предупреждение, а не запрет: бывает, что другого кадра под рукой
 * нет и лучше поставить хоть какой-то.
 */
function checkSize(w: number, h: number, shape: 'wide' | 'card'): string | null {
    const целевой = shape === 'wide' ? 3 / 2 : 3 / 4;
    const минШирина = shape === 'wide' ? 1600 : 800;
    const свой = w / h;

    // Допуск в четверть: кадр 4:3 вместо 3:2 обрежется без потерь, а вот
    // разворот из вертикали в горизонталь — уже нет.
    const сильноИное = свой > целевой * 1.25 || свой < целевой * 0.8;

    if (сильноИное) {
        const какая = целевой < 1 ? 'вертикальная' : 'горизонтальная';
        return `Файл ${w}×${h}, а нужна ${какая} картинка (${shape === 'wide' ? '3:2' : '3:4'}). `
            + 'Лишнее обрежется по краям, и картинку придётся растянуть — на сайте будет замыленной.';
    }
    if (w < минШирина) {
        return `Файл ${w}×${h} — узковат. Нужно от ${минШирина}px по ширине, иначе на экранах с высокой плотностью точек картинка будет нерезкой.`;
    }
    return null;
}

export default function CountryImageField({
    label,
    hint,
    current,
    file,
    shape,
    onFile,
}: {
    label: string;
    hint: string;
    /** Путь из базы. Пусто — покажем заглушку. */
    current: string | null;
    /**
     * Выбранный, но ещё не сохранённый файл. Хранится в форме, а не здесь:
     * отправляет его она, и она же сбрасывает его после сохранения — тогда
     * превью само уступает место сохранённой картинке.
     */
    file: File | null;
    /** wide — обложка 3:2, card — плитка 3:4. */
    shape: 'wide' | 'card';
    onFile: (file: File | null) => void;
}) {
    /*
     * Ссылка на выбранный файл живёт в памяти вкладки, и её нужно закрывать
     * руками: иначе каждый новый выбор оставляет прежний файл висеть до
     * перезагрузки страницы. Картинки тут тяжёлые — обложка от 1600 пикселей
     * по ширине.
     */
    const [preview, setPreview] = useState<string | null>(null);
    const [size, setSize] = useState<{ w: number; h: number } | null>(null);

    useEffect(() => {
        if (!file) { setPreview(null); setSize(null); return; }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const src = preview ?? imageUrl(current);
    const box = shape === 'wide' ? 'w-64 h-40' : 'w-32 h-[10.67rem]';

    const warning = size ? checkSize(size.w, size.h, shape) : null;

    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-inkMuted">{label}</label>
            <div className="flex items-start gap-6">
                <div
                    className={`${box} flex shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100`}
                >
                    {src ? (
                        /*
                         * Обычный img, а не next/image: у выбранного файла
                         * адрес вида blob:, а он живёт только в этой вкладке —
                         * оптимизатор Next такой адрес открыть не может, и
                         * даже с unoptimized проверка адреса его не пропускает.
                         */
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={src}
                            alt=""
                            className="h-full w-full object-cover"
                            // Размеры читаем у превью: у File их нет, узнать
                            // пропорции можно только после декодирования.
                            onLoad={(e) => {
                                const img = e.currentTarget;
                                setSize(preview ? { w: img.naturalWidth, h: img.naturalHeight } : null);
                            }}
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
                    {warning && (
                        <p className="mt-2 max-w-sm rounded border border-brick/30 bg-brick/5 px-2 py-1.5 text-xs text-brick">
                            {warning}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

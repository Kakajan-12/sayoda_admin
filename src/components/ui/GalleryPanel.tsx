'use client';

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { LuTrash2, LuUpload } from "react-icons/lu";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import { useT } from "@/lib/i18n/LocaleProvider";
import { readToken } from "@/lib/auth";

/**
 * Снимки записи прямо на её странице — для туров и для статей.
 *
 * Обе галереи были отдельными разделами меню, сгруппированными по владельцу:
 * чтобы добавить фотографию к одному туру, редактор уходил со страницы тура,
 * искал его в длинном списке и заново выбирал в форме. Со статьями было то
 * же самое.
 *
 * Панель одна на оба раздела, потому что различий ровно три: адрес эндпоинта,
 * имя поля с владельцем и имя первичного ключа в ответе. Всё остальное —
 * загрузка пачкой, просмотр во весь экран, удаление — совпадает дословно,
 * и вторая копия этих двухсот строк разошлась бы с первой при первой правке.
 *
 * Загрузка сразу нескольких файлов: снимки добавляют пачкой, а прежние формы
 * принимали по одному за раз.
 */

const API = process.env.NEXT_PUBLIC_API_URL;

/**
 * Строка галереи как её отдаёт сервер.
 *
 * Первичный ключ приходит под разными именами: gallery_id у туров,
 * blog_gallery_id у статей — так они названы в самих запросах. Поэтому имя
 * поля передаётся пропсом, а не угадывается. Раньше в панели туров стояло
 * row.id, оно давало undefined, и удаление уходило на адрес
 * /api/tour-gallery/undefined: кнопка нажималась, подтверждение
 * спрашивалось, а фотография оставалась на месте.
 */
type Photo = Record<string, unknown> & { image: string };

/**
 * Multer отдаёт абсолютный путь внутри контейнера («/app/uploads/x.webp»),
 * старые записи хранят относительный, в части лежат обратные слэши.
 */
const imageUrl = (src: unknown) => {
    const clean = String(src ?? '')
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .replace(/^app\//, '');
    return clean ? `${API}/${clean}` : '';
};

export default function GalleryPanel({
    endpoint,
    ownerKey,
    ownerPath,
    ownerId,
    idKey,
    title,
    hint,
}: {
    /** Раздел API: tour-gallery или blog-gallery. */
    endpoint: string;
    /** Имя поля владельца в теле запроса: tour_id или blog_id. */
    ownerKey: string;
    /** Сегмент адреса выборки по владельцу: tour или blog. */
    ownerPath: string;
    ownerId: number;
    /** Имя первичного ключа в ответе: gallery_id или blog_gallery_id. */
    idKey: string;
    title: string;
    hint?: string;
}) {
    const t = useT();
    const [rows, setRows] = useState<Photo[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    // −1 значит «просмотр закрыт»: отдельный флаг рядом с индексом
    // рассинхронился бы и открывал первый снимок вместо выбранного.
    const [viewing, setViewing] = useState(-1);

    const auth = () => ({ Authorization: `Bearer ${readToken()}` });

    const load = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/api/${endpoint}/${ownerPath}/${ownerId}`, { headers: auth() });
            setRows(Array.isArray(res.data) ? res.data : []);
            setError(null);
        } catch {
            setError(t('common.error'));
            setRows([]);
        }
    }, [endpoint, ownerPath, ownerId, t]);

    useEffect(() => { load(); }, [load]);

    const upload = async (files: FileList | null) => {
        if (!files || !files.length) return;
        setBusy(true);
        setError(null);
        setProgress({ done: 0, total: files.length });

        try {
            // По одному запросу на файл: эндпоинт принимает одну картинку.
            // Последовательно, а не пачкой параллельно — десяток одновременных
            // конвертаций в webp кладёт сервер, на котором живут пять проектов.
            let done = 0;
            for (const file of Array.from(files)) {
                const data = new FormData();
                data.append('image', file);
                data.append(ownerKey, String(ownerId));
                await axios.post(`${API}/api/${endpoint}`, data, { headers: auth() });
                done += 1;
                setProgress({ done, total: files.length });
            }
            await load();
        } catch {
            setError(t('common.error'));
        } finally {
            setBusy(false);
            setProgress(null);
        }
    };

    const remove = async (photo: Photo) => {
        const rowId = photo[idKey];
        if (!window.confirm(t('common.confirmDelete', { name: `#${rowId}` }))) return;
        setBusy(true);
        setError(null);
        try {
            await axios.delete(`${API}/api/${endpoint}/${rowId}`, { headers: auth() });
            await load();
        } catch {
            setError(t('list.deleteFailed'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="rounded-lg border border-sand bg-white p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-ink">{title}</h2>
                    {hint && <p className="mt-0.5 text-sm text-inkMuted">{hint}</p>}
                </div>

                <label className="flex cursor-pointer items-center gap-2 rounded-md bg-tile px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-tileDark">
                    <LuUpload className="size-4" />
                    {t('common.add')}
                    <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        disabled={busy}
                        onChange={(e) => {
                            upload(e.target.files);
                            // Сбрасываем значение: иначе повторный выбор того же
                            // файла не вызовет onChange и загрузка не начнётся.
                            e.target.value = '';
                        }}
                        className="hidden"
                    />
                </label>
            </div>

            {error && (
                <p className="mb-4 rounded-md bg-brick/10 px-4 py-3 text-sm text-brick">{error}</p>
            )}

            {progress && (
                <p className="mb-4 text-sm text-inkMuted">
                    {t('list.uploading', { done: progress.done, total: progress.total })}
                </p>
            )}

            {rows === null ? (
                <p className="py-6 text-center text-inkMuted">{t('common.loading')}</p>
            ) : rows.length === 0 ? (
                <p className="py-6 text-center text-inkMuted">{t('common.empty')}</p>
            ) : (
                <>
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {rows.map((photo, index) => (
                            <li
                                key={String(photo[idKey])}
                                className="group relative overflow-hidden rounded-md border border-sand"
                            >
                                {/* Снимок открывается во весь экран: в плитке
                                    150 пикселей шириной не разглядеть, что
                                    именно удаляешь. */}
                                <button
                                    type="button"
                                    onClick={() => setViewing(index)}
                                    aria-label={t('common.view')}
                                    className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tileLight"
                                >
                                    <Image
                                        src={imageUrl(photo.image)}
                                        alt=""
                                        width={320}
                                        height={240}
                                        unoptimized
                                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </button>

                                {/*
                                    Кнопка удаления видна всегда, а не только
                                    при наведении: на планшете наведения нет,
                                    и удалить снимок было бы нечем.
                                */}
                                <button
                                    type="button"
                                    onClick={() => remove(photo)}
                                    disabled={busy}
                                    aria-label={t('common.delete')}
                                    className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-brick shadow-sm transition hover:bg-white disabled:opacity-50"
                                >
                                    <LuTrash2 className="size-4" />
                                </button>
                            </li>
                        ))}
                    </ul>

                    <Lightbox
                        open={viewing >= 0}
                        index={viewing}
                        close={() => setViewing(-1)}
                        slides={rows.map((photo) => ({ src: imageUrl(photo.image) }))}
                        plugins={[Counter, Zoom]}
                        // Подписи кнопок идут в aria-label: без перевода
                        // скринридер читал бы их по-английски.
                        labels={{
                            Previous: t('common.prev'),
                            Next: t('common.next'),
                            Close: t('common.close'),
                            'Zoom in': t('common.zoomIn'),
                            'Zoom out': t('common.zoomOut'),
                        }}
                        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
                        styles={{ container: { backgroundColor: 'rgba(0, 0, 0, .9)' } }}
                    />
                </>
            )}
        </section>
    );
}

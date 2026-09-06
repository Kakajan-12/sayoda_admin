import React from "react";
import Sidebar from "@/Components/Sidebar";
import TopBar from "@/Components/TopBar";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";

/**
 * Оболочка админки.
 *
 * Раньше каждая из 77 страниц сама рисовала меню, шапку и внешние отступы —
 * тремя разными вариантами обёртки. Из-за этого меню перерисовывалось при
 * каждом переходе, а поправить что-то во всех разделах означало править
 * 77 файлов.
 *
 * Теперь оболочка одна. Страница отвечает только за своё содержимое.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <LocaleProvider>
            <div className="min-h-screen bg-paper">
                <Sidebar />
                {/* Отступ слева равен ширине меню: меню зафиксировано, и без
                    него содержимое уезжало бы под него. */}
                <div className="ml-64 flex min-h-screen flex-col">
                    <TopBar />
                    <main className="flex-1 px-6 py-6">{children}</main>
                </div>
            </div>
        </LocaleProvider>
    );
}

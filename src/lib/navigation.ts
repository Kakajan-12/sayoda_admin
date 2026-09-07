import type { IconType } from "react-icons";
import {
    LuInbox,
    LuSettings,
    LuImage,
    LuCalendarClock,
    LuCalendarDays,
    LuMails,
    LuSparkles,
} from "react-icons/lu";
import { VscFeedback, VscTypeHierarchySub } from "react-icons/vsc";
import { PiReadCvLogo } from "react-icons/pi";
import { GrGallery } from "react-icons/gr";
import { IoLocationSharp } from "react-icons/io5";
import { FaPhoneSquareAlt } from "react-icons/fa";
import { MdTour } from "react-icons/md";
import { IoMdCheckmarkCircleOutline, IoIosCloseCircleOutline } from "react-icons/io";
import { TbCategoryFilled } from "react-icons/tb";
import { FaLocationDot, FaPassport, FaEarthAsia } from "react-icons/fa6";
import { RiLinksLine, RiQuestionAnswerLine } from "react-icons/ri";
import type { DictKey } from "./i18n/dictionary";

/**
 * Структура меню админки.
 *
 * Вынесена из компонента: этот же список нужен шапке, чтобы показать
 * название текущего раздела, и дашборду для быстрых переходов. Держать
 * три копии одного перечня — верный способ забыть про новый раздел в одном
 * из мест.
 *
 * Группы названы по тому, как часто в них заходят, а не по устройству базы:
 * «Каждый день» — заявки и настройки, дальше контент по разделам сайта.
 */

export interface NavLink {
    href: string;
    labelKey: DictKey;
    icon: IconType;
}

export interface NavGroup {
    key: string;
    titleKey: DictKey;
    links: NavLink[];
}

export const navGroups: NavGroup[] = [
    {
        key: 'daily',
        titleKey: 'nav.group.daily',
        links: [
            { href: '/admin/requests', labelKey: 'nav.requests', icon: LuInbox },
            { href: '/admin/settings', labelKey: 'nav.settings', icon: LuSettings },
        ],
    },
    {
        key: 'content',
        titleKey: 'nav.group.content',
        links: [
            { href: '/admin/banner', labelKey: 'nav.banner', icon: LuImage },
            { href: '/admin/destinations', labelKey: 'nav.destinations', icon: FaEarthAsia },
            { href: '/admin/faq', labelKey: 'nav.faq', icon: RiQuestionAnswerLine },
            { href: '/admin/testimonials', labelKey: 'nav.testimonials', icon: VscFeedback },
        ],
    },
    {
        key: 'tours',
        titleKey: 'nav.group.tours',
        links: [
            { href: '/admin/tours', labelKey: 'nav.tours', icon: MdTour },
            { href: '/admin/tour-types', labelKey: 'nav.tourTypes', icon: VscTypeHierarchySub },
            { href: '/admin/tour-category', labelKey: 'nav.tourCategory', icon: TbCategoryFilled },
            { href: '/admin/itinerary', labelKey: 'nav.itinerary', icon: LuCalendarDays },
            { href: '/admin/includes', labelKey: 'nav.includes', icon: IoMdCheckmarkCircleOutline },
            { href: '/admin/excludes', labelKey: 'nav.excludes', icon: IoIosCloseCircleOutline },
            { href: '/admin/highlights', labelKey: 'nav.highlights', icon: LuSparkles },
            { href: '/admin/departures', labelKey: 'nav.departures', icon: LuCalendarClock },
            { href: '/admin/tour-gallery', labelKey: 'nav.tourGallery', icon: GrGallery },
            { href: '/admin/visa', labelKey: 'nav.visa', icon: FaPassport },
        ],
    },
    {
        key: 'blog',
        titleKey: 'nav.group.blog',
        links: [
            { href: '/admin/blogs', labelKey: 'nav.blogs', icon: PiReadCvLogo },
            { href: '/admin/blogs-gallery', labelKey: 'nav.blogsGallery', icon: GrGallery },
        ],
    },
    {
        key: 'contacts',
        titleKey: 'nav.group.contacts',
        links: [
            { href: '/admin/address', labelKey: 'nav.address', icon: IoLocationSharp },
            { href: '/admin/mails', labelKey: 'nav.mails', icon: LuMails },
            { href: '/admin/numbers', labelKey: 'nav.numbers', icon: FaPhoneSquareAlt },
            { href: '/admin/social-links', labelKey: 'nav.socialLinks', icon: RiLinksLine },
            { href: '/admin/locations', labelKey: 'nav.locations', icon: FaLocationDot },
        ],
    },
];

/** Раздел активен и на вложенных страницах: /admin/tours/edit-tour/32 — это «Туры». */
export const isActiveHref = (pathname: string, href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

/** Ищет раздел по адресу — шапке нужно название текущей страницы. */
export function findNavLink(pathname: string): NavLink | undefined {
    const all = navGroups.flatMap((g) => g.links);
    // Сначала самое длинное совпадение: /admin/tour-gallery не должен
    // определиться как /admin/tours.
    return [...all]
        .sort((a, b) => b.href.length - a.href.length)
        .find((link) => isActiveHref(pathname, link.href));
}

"use client"

import Link from "next/link";

export default function GodButton({hexColor, className, onClick, href, children}) {
    // Función para hacer el color más claro
    const lightenColor = (color, percent) => {
        const num = parseInt(color.replace("#", ""), 16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt,
            G = (num >> 8 & 0x00FF) + amt,
            B = (num & 0x0000FF) + amt;
        return `#${(
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1)}`;
    }

    const lighterColor = lightenColor(hexColor, 40); // +40% más claro
    const commonProps = {
        className: `${className} relative px-4 py-2 rounded-lg text-white transition-all duration-300`,
        style: {
            '--bg-color': lighterColor,
            '--glow-color': hexColor,
            backgroundColor: 'var(--bg-color)',
            boxShadow: `0 0 15px var(--glow-color)`,
        },
    };

    if (href) {
        const isExternal = /^https?:\/\//i.test(href);

        if (isExternal) {
            return (
                <a
                    {...commonProps}
                    href={href}
                    onClick={onClick}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {children}
                </a>
            );
        }

        return (
            <Link {...commonProps} href={href} onClick={onClick} scroll>
                {children}
            </Link>
        );
    }

    return (
        <button
            type="button"
            {...commonProps}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
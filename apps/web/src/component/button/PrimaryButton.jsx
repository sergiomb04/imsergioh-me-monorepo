"use client"

import Link from "next/link";

export default function PrimaryButton({className, href, children = "BOTÓN", onClick}) {
    const buttonClassName = `text-black bg-white hover:bg-gray-200 active:bg-gray-300 transition-colors py-2 px-4 rounded-full ${className || ""}`;

    if (href) {
        const isExternal = /^https?:\/\//i.test(href);

        if (isExternal) {
            return (
                <a
                    className={buttonClassName}
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
            <Link className={buttonClassName} href={href} onClick={onClick} scroll>
                {children}
            </Link>
        );
    }

    return (
        <button
            type="button"
            className={buttonClassName}
            onClick={onClick}
            data-analytics="primary-button"
        >
            {children}
        </button>
    );
}
"use client";

import Link from "next/link";
import Image from "next/image";
import AvailabilityBadge from "@/component/badge/AvailabilityBadge";
import {
    FaDiscord,
    FaGithub,
    FaInstagram,
    FaTwitch,
    FaXTwitter,
    FaYoutube,
} from "react-icons/fa6";

export default function FooterComponent() {
    const discordLink = "https://discord.gg/B6nxVFaZuq";

    const socialLinks = [
        { label: "GitHub", href: "https://github.com/sergiomb04", icon: FaGithub },
        { label: "Discord", href: discordLink, icon: FaDiscord },
        { label: "X", href: "https://x.com/ImSergioh", icon: FaXTwitter },
        { label: "Twitch", href: "https://www.twitch.tv/imsergioh_", icon: FaTwitch },
        { label: "YouTube", href: "https://www.youtube.com/@iamsergioh", icon: FaYoutube },
        { label: "Instagram", href: "https://www.instagram.com/sergioh.007/", icon: FaInstagram },
    ];

    const linkSections = [
        {
            title: "Navegación",
            items: [
                { label: "Inicio", href: "/", internal: true },
                { label: "Proyectos", href: "/projects", internal: true },
                { label: "Sobre mí", href: "/about", internal: true },
                { label: "Contacto", href: discordLink, external: true },
            ],
        },
        {
            title: "Servicios",
            items: [
                {
                    label: "Minecraft Plugins",
                    href: "https://www.minecraft-hosting.pro/es/articulo/474-que-son-los-plugins-de-minecraft",
                    external: true,
                },
                { label: "Desarrollo Web", href: "https://blog.hubspot.es/website/que-es-desarrollo-web#:~:text=Se%20conoce%20como%20desarrollo%20web,en%20la%20red%20informatica%20mundial.", external: true },
                { label: "APIs & Backend", href: "https://aws.amazon.com/es/what-is/api/", external: true },
                { label: "Consultoría", href: discordLink, external: true },
            ],
        },
        {
            title: "Colaboraciones",
            items: [
                { label: "ZoneCraft", href: "https://www.zonecraft.es/home", external: true },
                { label: "ImSergioh", href: "https://x.com/ImSergioh", external: true },
                { label: "NauticMC", href: "https://web.nauticmc.net/", external: true },
                { label: "SmartMC", muted: true },
                { label: "ZeenMC", muted: true },
            ],
        },
    ];

    const year = new Date().getFullYear();

    return (
        <footer className="relative w-full border-t border-zinc-800/80 bg-zinc-950/90 text-zinc-300 font-sans backdrop-blur-sm">
            <div className="mx-auto w-full max-w-7xl px-6 py-8 md:py-10">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
                    
                    {/* Brand & Info Column */}
                    <div className="lg:col-span-5 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/img/better_logo.png"
                                alt="SergioHub Logo"
                                width={38}
                                height={38}
                                className="transition-transform duration-200 hover:scale-105"
                            />
                            <span className="font-montserrat text-lg font-bold tracking-tight text-white">
                                SERGIOHUB
                            </span>

                            <AvailabilityBadge />
                        </div>

                        <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
                            Desarrollo de plugins para Minecraft, aplicaciones web modernas y soluciones a medida con foco en rendimiento.
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center gap-2 pt-1">
                            {socialLinks.map(({ label, href, icon: Icon }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={label}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 transition-all hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                                >
                                    <Icon size={15} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
                        {linkSections.map((section) => (
                            <div key={section.title} className="flex flex-col gap-2.5">
                                <h3 className="font-montserrat text-xs font-bold uppercase tracking-wider text-zinc-200">
                                    {section.title}
                                </h3>
                                <ul className="flex flex-col gap-1.5 text-xs sm:text-sm">
                                    {section.items.map((item) => {
                                        if (item.muted) {
                                            return (
                                                <li key={item.label} className="text-zinc-600">
                                                    {item.label}
                                                </li>
                                            );
                                        }

                                        if (item.internal) {
                                            return (
                                                <li key={item.label}>
                                                    <Link
                                                        href={item.href}
                                                        className="text-zinc-400 hover:text-white transition-colors duration-150"
                                                    >
                                                        {item.label}
                                                    </Link>
                                                </li>
                                            );
                                        }

                                        return (
                                            <li key={item.label}>
                                                <a
                                                    href={item.href}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-zinc-400 hover:text-white transition-colors duration-150"
                                                >
                                                    {item.label}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800/80 pt-5 text-xs text-zinc-500">
                    <p>© {year} Sergio (ImSergioh). Todos los derechos reservados.</p>
                    <p className="flex items-center gap-1.5 text-zinc-500">
                        <span>Construido con</span>
                        <span className="text-zinc-300">Next.js</span>
                        <span>•</span>
                        <span className="text-zinc-300">Tailwind</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}

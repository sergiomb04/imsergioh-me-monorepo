"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import TypewriterBrand from "@/component/animation/TypewriterBrand";

export default function NavbarComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/projects", label: "Proyectos" },
    { href: "/about", label: "Sobre mí" },
  ];

  return (
    <nav className="w-full sticky top-0 z-50 bg-zinc-950/70 backdrop-blur-md border-b border-zinc-700/70 font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* LOGO + TYPEWRITER BRAND */}
        <Link href="/" className="flex items-center gap-3 group" scroll>
          <Image
            src="/img/better_logo.png"
            alt="Logo"
            width={50}
            height={50}
            className="transition-transform duration-200 group-hover:scale-105"
          />
          <TypewriterBrand />
        </Link>

        {/* MENÚ DERECHA */}
        <div className="flex items-center gap-3 sm:gap-5 md:gap-6">
          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] ${isActive
                      ? "text-white font-semibold"
                      : "text-zinc-300 hover:text-zinc-100"
                    }`}
                  scroll
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* BOTÓN CONTACTO (MANTENIDO EXACTAMENTE IGUAL) */}
          <Link
            href="https://discord.gg/B6nxVFaZuq"
            target="_blank"
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-black bg-white rounded hover:bg-zinc-200 transition-colors shrink-0"
          >
            Contacto
          </Link>

          {/* BOTÓN HAMBURGUESA EN MÓVIL (A LA DERECHA DE CONTACTO) */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/60 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-colors"
            aria-expanded={isOpen}
            aria-label="Abrir o cerrar menú de navegación"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL (EXCLUYENDO CONTACTO QUE YA ESTÁ ARRIBA) */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl px-4 py-3 space-y-2 shadow-2xl transition-all">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                    ? "bg-zinc-800/70 text-white font-semibold"
                    : "text-zinc-300 hover:text-white hover:bg-zinc-900/80"
                  }`}
                scroll
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
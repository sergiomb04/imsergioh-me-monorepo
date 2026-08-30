"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAvailability } from "@/context/AvailabilityContext";
import {
  LayoutDashboard,
  Activity,
  Link2,
  FolderArchive,
  Globe,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import GoogleLogoutButton from "@/component/admin/GoogleLogoutButton";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    description: "Vista general y métricas",
    icon: LayoutDashboard,
    badge: "Inicio",
    accent: "indigo",
  },
  {
    href: "/admin/analytics",
    label: "Analíticas",
    description: "Tráfico en tiempo real",
    icon: Activity,
    badge: "En vivo",
    accent: "cyan",
  },
  {
    href: "/admin/links",
    label: "Acortador de links",
    description: "Gestión de URLs & clicks",
    icon: Link2,
    accent: "emerald",
  },
  {
    href: "/admin/cdn",
    label: "Gestión de CDN",
    description: "Archivos & multimedia",
    icon: FolderArchive,
    accent: "fuchsia",
  },
];

function isItemActive(pathname, href) {
  if (!pathname) return false;
  if (href === "/admin") {
    return pathname === href;
  }
  return pathname.startsWith(href);
}

export default function AdminShell({
  title,
  subtitle,
  badge = "Módulo Admin",
  actions,
  children,
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { available, loading } = useAvailability();
  const isLoading = loading || available === null;
  const isAvailable = Boolean(available);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const currentNav = NAV_ITEMS.find((item) => isItemActive(pathname, item.href)) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-[#07090d] text-zinc-100">

      {/* Top Bar for Mobile */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-4 py-3 backdrop-blur-xl md:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image
            src="/img/better_logo.png"
            alt="SergioHub Logo"
            width={34}
            height={34}
            className="rounded-lg shadow-sm"
          />
          <div className="flex flex-col">
            <span className="font-montserrat text-sm font-bold text-white tracking-wide">
              SergioHub
            </span>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
              Admin Panel
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <GoogleLogoutButton compact />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-xl border border-zinc-700/80 bg-zinc-900/80 p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Abrir navegación móvil"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[57px] z-40 border-b border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col gap-2">
            <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-widest text-zinc-600">
              Navegación Admin
            </div>
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${active
                    ? "border border-zinc-700 bg-zinc-800/70 text-white shadow-sm"
                    : "border border-transparent text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${active ? "text-zinc-200" : "text-zinc-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="my-2 border-t border-zinc-800/80 pt-2">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-3.5 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition"
              >
                <Globe className="h-4 w-4 text-zinc-500" />
                <span>Volver a la Web Pública</span>
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="relative z-10 flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-72 md:shrink-0 md:flex-col md:border-r md:border-zinc-800/80 md:bg-zinc-950/60 md:backdrop-blur-xl sticky top-0 h-screen overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 p-5 shrink-0">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="relative">
                <Image
                  src="/img/better_logo.png"
                  alt="SergioHub Logo"
                  width={38}
                  height={38}
                  className="rounded-xl shadow-md transition-transform duration-200 group-hover:scale-105"
                />
                {isLoading ? (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3" title="Cargando estado...">
                    <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-zinc-950 bg-zinc-700 animate-pulse" />
                  </span>
                ) : (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3" title={isAvailable ? "Disponible" : "Ausente"}>
                    <span
                      className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                        isAvailable ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    ></span>
                    <span
                      className={`relative inline-flex h-3 w-3 rounded-full border-2 border-zinc-950 ${
                        isAvailable ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    ></span>
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-montserrat text-base font-bold text-white tracking-tight">
                    SergioHub
                  </span>
                  <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Panel de Control
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-1 flex-col justify-between p-4">
            <div className="space-y-6">
              <div>
                <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-600">
                  Módulos de Sistema
                </p>
                <nav className="space-y-1.5">
                  {NAV_ITEMS.map((item) => {
                    const active = isItemActive(pathname, item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${active
                          ? "border border-zinc-700/80 bg-zinc-800/60 text-white shadow-sm font-semibold"
                          : "border border-transparent text-zinc-400 hover:border-zinc-800/80 hover:bg-zinc-900/60 hover:text-zinc-200"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`h-4 w-4 transition-colors duration-200 ${active
                              ? "text-zinc-200"
                              : "text-zinc-500 group-hover:text-zinc-300"
                              }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${active
                              ? "bg-zinc-700 text-zinc-300"
                              : "bg-zinc-800/80 text-zinc-500 group-hover:bg-zinc-700/80 group-hover:text-zinc-400"
                              }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div>
                <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-600">
                  Accesos Directos
                </p>
                <div className="space-y-1.5">
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center justify-between rounded-xl border border-transparent px-3.5 py-2 text-xs font-medium text-zinc-400 hover:border-zinc-800/80 hover:bg-zinc-900/40 hover:text-zinc-200 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Web Pública</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-zinc-600" />
                  </Link>
                  <Link
                    href="/projects"
                    target="_blank"
                    className="flex items-center justify-between rounded-xl border border-transparent px-3.5 py-2 text-xs font-medium text-zinc-400 hover:border-zinc-800/80 hover:bg-zinc-900/40 hover:text-zinc-200 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Despliegues Activos</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-zinc-600" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="space-y-3 pt-4 border-t border-zinc-800/80 shrink-0">
              <div className="flex items-center justify-between pt-1">
                <GoogleLogoutButton className="w-full" />
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Main Top Header Banner */}
          <div className="border-b border-zinc-800/60 bg-zinc-950/40 backdrop-blur-md px-4 py-5 sm:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {/* Breadcrumbs & Badge */}
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="font-semibold text-zinc-400">Admin</span>
                  <span>/</span>
                  <span className="text-zinc-400">{currentNav.label}</span>
                  {badge && (
                    <span className="ml-2 inline-flex items-center rounded-md border border-zinc-700/60 bg-zinc-800/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      {badge}
                    </span>
                  )}
                </div>

                {/* Page Title */}
                <h1 className="mt-2 font-montserrat text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-zinc-500 max-w-3xl font-sans">
                    {subtitle}
                  </p>
                )}
              </div>

              {actions && (
                <div className="flex flex-wrap items-center gap-3">
                  {actions}
                </div>
              )}
            </div>
          </div>

          {/* Page Body */}
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

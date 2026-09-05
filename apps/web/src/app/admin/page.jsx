import Link from "next/link";
import Image from "next/image";
import AdminShell from "@/component/admin/AdminShell";
import { getAdminSessionToken } from "@/lib/adminSession";
import GoogleLoginButton from "@/component/admin/GoogleLoginButton";
import AvailabilityToggle from "@/component/admin/AvailabilityToggle";
import {
  Activity,
  Link2,
  FolderArchive,
  ArrowUpRight,
  ShieldCheck,
  Lock,
  ArrowLeft,
} from "lucide-react";

export default async function AdminPage() {
  const token = await getAdminSessionToken();
  const isAllowed = Boolean(token);

  if (isAllowed) {
    const modules = [
      {
        href: "/admin/analytics",
        title: "Analíticas",
        description: "Métricas y tráfico en tiempo real.",
        icon: Activity,
      },
      {
        href: "/admin/links",
        title: "Acortador de links",
        description: "Gestión de enlaces cortos y clics.",
        icon: Link2,
      },
      {
        href: "/admin/cdn",
        title: "Gestión de CDN",
        description: "Subida y organización de archivos multimedia.",
        icon: FolderArchive,
      },
    ];

    return (
      <AdminShell
        title="Dashboard de Administración"
        subtitle="Panel centralizado de control y monitorización"
        badge="Vista Principal"
        actions={<AvailabilityToggle adminToken={token} />}
      >
        <div className="space-y-6">
          {/* Availability Status Card */}
          <AvailabilityToggle adminToken={token} variant="card" />

          {/* Core Modules Grid */}
          <section className="space-y-3">
            <div>
              <h3 className="font-montserrat text-sm font-semibold text-white tracking-tight">
                Módulos de Gestión
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {modules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700/80 hover:bg-zinc-900/70 shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-800/60 p-2.5 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                          <Icon className="h-5 w-5" />
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-zinc-500 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-300" />
                      </div>

                      <div>
                        <h4 className="font-montserrat text-base font-semibold text-white group-hover:text-zinc-100 transition-colors">
                          {mod.title}
                        </h4>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                          {mod.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </AdminShell>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#07090d] px-4 py-16 text-zinc-100 font-sans">
      <div className="relative z-10 w-full max-w-md">
        {/* Return to website link */}
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/60 px-4 py-1.5 text-xs font-medium text-zinc-400 backdrop-blur-md transition hover:border-zinc-700 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a SergioHub</span>
          </Link>
        </div>

        {/* Login Card */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-950/80 p-8 shadow-2xl shadow-black/80 backdrop-blur-2xl">
          {/* Card subtle top glow line */}
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-zinc-600/50 to-transparent" />

          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-5">
              <Image
                src="/img/better_logo.png"
                alt="SergioHub Logo"
                width={64}
                height={64}
                className="relative rounded-2xl shadow-md"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/60 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              <Lock className="h-3 w-3" />
              <span>Acceso Administrativo</span>
            </div>

            <h1 className="mt-3 font-montserrat text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SergioHub Admin
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-sm">
              Inicia sesión con tu cuenta de Google autorizada para acceder a la gestión de enlaces, analíticas y CDN.
            </p>
          </div>

          {/* Action button */}
          <GoogleLoginButton />

          {/* Security notice */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-zinc-600">
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-600" />
            <span>Área restringida protegida con NextAuth</span>
          </div>
        </section>
      </div>
    </main>
  );
}


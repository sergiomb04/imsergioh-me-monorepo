"use client";

import Image from "next/image";
import Link from "next/link";
import GlobalHeroComponent, {
  HeroHighlight,
} from "@/component/hero/GlobalHeroComponent";
import PrimaryButton from "@/component/button/PrimaryButton";
import ArticleAnimation from "@/component/animation/ArticleAnimation";
import {
  Code2,
  Laptop,
  Gamepad2,
  Sparkles,
  Coffee,
  Rocket,
  Milestone,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  ArrowUpRight,
  Compass,
  Flame,
  Zap,
  MapPin,
  Calendar,
} from "lucide-react";

export default function AboutMePage() {
  const journeyMilestones = [
    {
      id: "01",
      era: "Inicios & Pasión",
      badge: "+8 Años de Trayectoria",
      title: "Desarrollo, programo y creo soluciones",
      subtitle: "De la curiosidad con Minecraft al dominio de Java y la web",
      description:
        "Todo empezó hace más de 8 años con plugins de Minecraft por pura curiosidad. Con los años he perfeccionado mis habilidades hasta especializarme en Java avanzado, arquitecturas de backend eficientes y desarrollo de interfaces modernas.",
      highlights: [
        "Especialista en Java y Backend",
        "Creación de contenido & tutoriales en SergiohDev",
        "Enfoque en código limpio y alto rendimiento",
      ],
      imgSrc: "/img/about/sergiohdev.png",
      imgAlt: "Canal y desarrollo SergiohDev",
      link: "https://www.youtube.com/@sergiohdev",
      accent: "indigo",
      icon: Code2,
      gradient: "from-indigo-500/20 via-purple-500/10 to-transparent",
      glowColor: "rgba(99, 102, 241, 0.2)",
    },
    {
      id: "02",
      era: "Productividad",
      badge: "Workspace & Enfoque",
      title: "Mi entorno ideal para crear",
      subtitle: "Organización, claridad y comunicación directa",
      description:
        "Me gusta estar en casa, con un buen café al lado, teniendo los objetivos y requerimientos claros. La comunicación directa con clientes es fundamental para entender lo que necesitan y entregar soluciones sólidas y rápidas.",
      highlights: [
        "Stack: Java, JSON, MongoDB, Redis & WebSockets",
        "Zona libre de distracciones y alta concentración",
        "Desarrollo ágil orientado a resultados",
      ],
      imgSrc: "/img/about/setup.png",
      imgAlt: "Setup de Sergio",
      accent: "amber",
      icon: Laptop,
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      glowColor: "rgba(245, 158, 11, 0.2)",
    },
    {
      id: "03",
      era: "Desconexión",
      badge: "Gamer & Estratega",
      title: "También juego y compito",
      subtitle: "Mundos virtuales, creatividad y estrategia en equipo",
      description:
        "Aunque paso gran parte del tiempo programando y construyendo, los videojuegos son mi espacio para desconectar e inspirarme. Desde la creatividad de Minecraft hasta la estrategia y adrenalina de GTA y Valorant.",
      highlights: [
        "Minecraft: Creatividad y técnica",
        "GTA V / VI: Inmersión y mundo abierto",
        "Valorant: Precisión táctica y trabajo en equipo",
      ],
      imgSrc: "/img/about/gamer.png",
      imgAlt: "Jugando y disfrutando",
      accent: "purple",
      icon: Gamepad2,
      gradient: "from-purple-500/20 via-violet-500/10 to-transparent",
      glowColor: "rgba(168, 85, 247, 0.2)",
    },
    {
      id: "04",
      era: "Mindset",
      badge: "Crecimiento Continuo",
      title: "Apasionado por lo nuevo",
      subtitle: "Cero conformismo, 100% evolución constante",
      description:
        "Me considero una persona activa e inquieta por aprender cosas nuevas. No me gusta acomodarme en una zona de confort: cuando algo me llama la atención, practico intensamente hasta comprenderlo y dominarlo.",
      highlights: [
        "Mentalidad autodidacta y proactiva",
        "Rápida adaptación a nuevas herramientas y lenguajes",
        "Búsqueda constante de progreso personal",
      ],
      imgSrc: "/img/about/apasionnate.png",
      imgAlt: "Mentalidad y aprendizaje",
      accent: "emerald",
      icon: Sparkles,
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      glowColor: "rgba(16, 185, 129, 0.2)",
    },
    {
      id: "05",
      era: "Ritual Diario",
      badge: "El Combustible",
      title: "Me encanta el café",
      subtitle: "La rutina indispensable antes de cada sesión de código",
      description:
        "No puede pasar mucho tiempo sin que me prepare una buena taza de café. Es un hábito indispensable que acompaña mis horas de mayor concentración y desarrollo.",
      highlights: [
        "Acompañante fiel de cada línea de código",
        "Momento de pausa y recarga de energía",
        "Energía positiva para resolver retos complejos",
      ],
      imgSrc: "/img/about/coffee.png",
      imgAlt: "Café diario",
      accent: "rose",
      icon: Coffee,
      gradient: "from-rose-500/20 via-pink-500/10 to-transparent",
      glowColor: "rgba(244, 63, 94, 0.2)",
    },
  ];

  const quickStats = [
    { label: "EXPERIENCIA", value: "+8 Años", sub: "Desarrollo y lógica", icon: Code2, color: "text-indigo-400" },
    { label: "UBICACIÓN", value: "Suiza CH", sub: "Residiendo +13 años", icon: MapPin, color: "text-emerald-400" },
    { label: "EDAD", value: "22 Años", sub: "Español en constante evolución", icon: Calendar, color: "text-amber-400" },
    { label: "FILOSOFÍA", value: "100%", sub: "Autodidacta & Práctico", icon: Flame, color: "text-rose-400" },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Hero at full width */}
      <GlobalHeroComponent
        variant="projects"
        gradient="rose"
        title={
          <>
            MI VIAJE & <HeroHighlight>HISTORIA</HeroHighlight>
          </>
        }
        subtitle={
          <>Un recorrido por mi trayectoria, mentalidad y forma de trabajar</>
        }
      />

      <div className="flex flex-col gap-14 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 w-full">
        {/* Quick Stats Grid */}
        <ArticleAnimation>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{stat.label}</span>
                    <Icon className={`w-5 h-5 ${stat.color} transition-transform group-hover:scale-110`} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black font-montserrat text-white">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                </div>
              );
            })}
          </div>
        </ArticleAnimation>

        {/* Timeline Section */}
        <div className="relative">
          {/* Glowing Center / Left Timeline Track */}
          <div className="hidden lg:block absolute left-1/2 top-8 bottom-12 w-0.5 -translate-x-1/2 bg-linear-to-b from-indigo-500 via-purple-500 to-rose-500 opacity-40 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />

          <div className="space-y-16 lg:space-y-24">
            {journeyMilestones.map((item, idx) => {
              const Icon = item.icon;
              const isEven = idx % 2 === 0;

              return (
                <ArticleAnimation key={item.id}>
                  <div className={`relative flex flex-col lg:flex-row items-center gap-8 ${isEven ? "lg:flex-row-reverse" : ""}`}>

                    {/* Timeline Central Node (Desktop) */}
                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center w-12 h-12 rounded-full border-2 border-white/20 bg-[#07090d] shadow-xl z-20 transition-transform duration-300 hover:scale-125">
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    {/* Content Card */}
                    <div className="w-full lg:w-[calc(50%-2.5rem)]">
                      <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/[0.06] via-white/[0.02] to-transparent backdrop-blur-xl p-6 sm:p-8 transition-all duration-300 hover:border-white/25 hover:shadow-2xl hover:-translate-y-1">
                        <div
                          className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
                          style={{ backgroundColor: item.glowColor }}
                        />

                        {/* Header Chip */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                            {item.id} • {item.era}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            {item.badge}
                          </span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-extrabold font-montserrat text-white">
                          {item.title}
                        </h3>
                        <p className="text-sm font-semibold text-indigo-300 mt-1">
                          {item.subtitle}
                        </p>

                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mt-4">
                          {item.description}
                        </p>

                        {/* Bullet Highlights */}
                        <div className="mt-5 space-y-2 pt-3 border-t border-white/10">
                          {item.highlights.map((h, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-300">
                              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Visual Image Card */}
                    <div className="w-full lg:w-[calc(50%-2.5rem)]">
                      {item.link ? (
                        <Link
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block h-64 sm:h-80 w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-500 hover:border-white/30 hover:scale-[1.02] cursor-pointer"
                        >
                          <Image
                            src={item.imgSrc}
                            alt={item.imgAlt}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-[#07090d]/90 via-[#07090d]/30 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                            <span className="text-xs font-semibold text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                              {item.imgAlt}
                            </span>
                            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                              <ArrowUpRight className="w-4 h-4" />
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="group relative h-64 sm:h-80 w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-500 hover:border-white/25 hover:scale-[1.02]">
                          <Image
                            src={item.imgSrc}
                            alt={item.imgAlt}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-[#07090d]/90 via-[#07090d]/30 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                            <span className="text-xs font-semibold text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                              {item.imgAlt}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </ArticleAnimation>
              );
            })}
          </div>
        </div>

        {/* Finale Milestone / Cosmic Discord CTA */}
        <ArticleAnimation>
          <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-linear-to-br from-rose-950/30 via-purple-950/30 to-[#07090d] backdrop-blur-xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-2xl hover:border-rose-400/50 transition-all">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-rose-400/30 shadow-2xl">
              <Image src="/img/about/space.png" alt="Fin de la presentación" fill className="object-cover" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black font-montserrat text-white tracking-tight max-w-2xl">
              FIN DE LA PRESENTACIÓN ✨
            </h2>

            <p className="text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Hasta aquí ha llegado el &quot;Sobre mí&quot;. Si quieres charlar, debatir de código o formar parte de los próximos proyectos: <span className="text-rose-300 font-semibold">¡Únete a mi comunidad en Discord!</span>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="https://discord.gg/B6nxVFaZuq" target="_blank">
                <PrimaryButton className="inline-flex items-center gap-2 px-8 py-3">
                  <BookOpen className="w-4 h-4" />
                  <span>Mi libro</span>
                  <ExternalLink className="w-4 h-4 opacity-70" />
                </PrimaryButton>
              </Link>
            </div>
          </div>
        </ArticleAnimation>
      </div>
    </div>
  );
}

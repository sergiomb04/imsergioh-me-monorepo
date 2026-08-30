"use client";

import Link from "next/link";
import Image from "next/image";
import PhotoArticle from "@/component/article/PhotoArticle";
import AboutMeButton from "@/component/button/AboutMeButton";
import SubprojectArticle from "@/component/article/SubprojectArticle";
import PageTitleComponent from "@/component/hero/PageTitleComponent";
import ArticleAnimation from "@/component/animation/ArticleAnimation";
import PrimaryButton from "@/component/button/PrimaryButton";
import {
  Code2,
  Cpu,
  Zap,
  Flame,
  ArrowRight,
  Sparkles,
  Layers,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa6";

export default function App() {
  const featurePillars = [
    {
      icon: Code2,
      title: "Java & Backend",
      description:
        "Arquitecturas de alto rendimiento, microservicios, lógica concurrente y plugins.",
      color: "text-indigo-400",
      border: "hover:border-indigo-500/30",
    },
    {
      icon: Cpu,
      title: "Next.js & Frontend",
      description:
        "Interfaces web reactivas, fluidas y diseñadas al detalle con TailwindCSS.",
      color: "text-purple-400",
      border: "hover:border-purple-500/30",
    },
    {
      icon: Zap,
      title: "Tiempo Real & WebSockets",
      description:
        "Comunicación bidireccional instantánea y sincronización de datos en vivo.",
      color: "text-emerald-400",
      border: "hover:border-emerald-500/30",
    },
    {
      icon: Flame,
      title: "Mentalidad Vibe Coding",
      description:
        "Prototipado ágil, aprendizaje continuo y foco en crear soluciones funcionales.",
      color: "text-rose-400",
      border: "hover:border-rose-500/30",
    },
  ];

  return (
    <>
      <PageTitleComponent />

      <main className="flex flex-col gap-16 md:gap-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 w-full">
        {/* Value Pillars Grid */}
        <ArticleAnimation>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2 sm:mt-6">
            {featurePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 transition-all duration-300 ${pillar.border} hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-xl bg-white/[0.05] border border-white/10">
                      <Icon className={`w-5 h-5 ${pillar.color}`} />
                    </div>
                  </div>
                  <h3 className="text-base font-bold font-montserrat text-white group-hover:text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </ArticleAnimation>

        {/* Featured Projects Showcase Section */}
        <div className="flex flex-col gap-8">
          <ArticleAnimation>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-emerald-400 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>DESPLIEGUES DESTACADOS</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-montserrat text-white tracking-tight">
                  Proyectos & Mini-Apps
                </h2>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors group"
              >
                <span>Ver todos los proyectos</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </ArticleAnimation>

          {/* Top Featured Project Card */}
          <SubprojectArticle
            redirect="https://github.com/sergiomb04/LiveState"
            backgroundImgUrl="/img/example/live-state.png"
            title="LiveState Framework"
            subtitle="Frontend Next.js ⟷ Backend Java"
            tags={["Java", "Next.js", "WebSockets", "Fullstack"]}
            description="Framework para crear experiencias interactivas en tiempo real sincronizando Next.js en el frontend con Java en el backend mediante WebSockets."
            buttonText="Ver en GitHub"
            secondaryLink="/projects"
            secondaryText="Ver más proyectos"
            inProgress={false}
            glowColor="rgba(16, 185, 129, 0.25)"
          />

          {/* Quick 2-grid of other live demos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SubprojectArticle
              redirect="/projects/interactive-chat"
              backgroundImgUrl="/img/example/chat.png"
              title="Chat Interactivo"
              tags={["WebSockets", "Real-time", "Chat"]}
              description="Un chat global a tiempo real para hablar con todas las personas conectadas al instante."
              buttonText="Abrir Chat"
              inProgress={false}
              glowColor="rgba(59, 130, 246, 0.2)"
            />

            <SubprojectArticle
              redirect="https://blog.imsergioh.me/Herramienta-Blog-Gratuita/Introducci%C3%B3n-a-Articles-Web"
              backgroundImgUrl="/img/example/blog.png"
              title="Blog de Artículos"
              tags={["Markdown", "Articles", "Vibe Coding"]}
              description="Herramienta vibe-codeada para alojar y visualizar documentos técnicos en Markdown."
              buttonText="Leer Artículos"
              inProgress={false}
              glowColor="rgba(244, 63, 94, 0.2)"
            />
          </div>
        </div>

        {/* Story & Experience Articles */}
        <div className="flex flex-col gap-12">
          <PhotoArticle
            badge="💻 TRAYECTORIA • +8 AÑOS"
            title="Desarrollador Experimentado"
            subtitle="De la curiosidad con Minecraft al dominio de arquitecturas modernas"
            description="Desde que me entró la curiosidad de cómo funcionaban los servidores de Minecraft y sus famosos plugins he ido expandiendo mi conocimiento. Domino Java a nivel avanzado y actualmente me enfoco en construir aplicaciones web de alto rendimiento y explorar nuevas tecnologías."
            highlights={[
              "Especialista en lógica concurrente y backend Java de alto rendimiento",
              "Desarrollo frontend reactivo con Next.js y ecosistema moderno",
              "Integración de WebSockets, APIs REST y bases de datos NoSQL",
            ]}
            imgSrc="/img/code.jpg"
            imgAlt="Código y Desarrollo"
            imgWidth={720}
            imgHeight={1280}
            glowColor="rgba(99, 102, 241, 0.25)"
          />

          <PhotoArticle
            imgToRight={true}
            badge="👋 QUIÉN SOY"
            title="Conóceme Más"
            subtitle="Sergio • 22 Años • Residiendo en Suiza 🇨🇭"
            description="Soy Sergio, tengo 22 años, soy español y resido en Suiza desde hace más de 13 años. Me apasiona resolver retos lógicos, crear herramientas prácticas y compartir lo que aprendo con la comunidad."
            highlights={[
              "Mentalidad 100% autodidacta y enfocada en soluciones reales",
              "Creación de contenido y tutoriales en el canal SergiohDev",
              "Gamer aficionado a Minecraft, GTA y juegos de estrategia",
            ]}
            imgSrc="/img/yo.png"
            imgAlt="Sergio"
            imgWidth={500}
            imgHeight={500}
            glowColor="rgba(217, 70, 239, 0.25)"
          >
          </PhotoArticle>
        </div>

        {/* Community & Discord CTA */}
        <ArticleAnimation>
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-linear-to-br from-indigo-950/30 via-purple-950/20 to-[#07090d] backdrop-blur-xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-2xl">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FaDiscord className="w-8 h-8" />
            </div>

            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black font-montserrat text-white tracking-tight">
                ¿Tienes una idea o quieres charlar?
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Únete a la comunidad en Discord para debatir de código, sugerir
                nuevas mini-apps o seguir los próximos lanzamientos.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="https://discord.gg/B6nxVFaZuq"
                target="_blank"
                rel="noopener noreferrer"
              >
                <PrimaryButton className="inline-flex items-center gap-2 px-7 py-3 font-semibold text-sm shadow-xl shadow-indigo-500/20">
                  <FaDiscord className="w-4 h-4" />
                  <span>Unirse a Discord</span>
                  <ExternalLink className="w-4 h-4 opacity-70" />
                </PrimaryButton>
              </Link>

              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/[0.05] hover:bg-white/[0.12] text-sm font-medium text-white transition-all"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Explorar proyectos</span>
              </Link>
            </div>
          </div>
        </ArticleAnimation>
      </main>
    </>
  );
}


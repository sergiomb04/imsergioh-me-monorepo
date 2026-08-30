"use client";

import { useState, useMemo } from "react";
import SubprojectArticle from "@/component/article/SubprojectArticle";
import GlobalHeroComponent, {
  HeroHighlight,
} from "@/component/hero/GlobalHeroComponent";
import ArticleAnimation from "@/component/animation/ArticleAnimation";
import {
  Sparkles,
  Layers,
  Code2,
  Cpu,
  Zap,
  Globe,
  Radio,
  ExternalLink,
  MessageSquare,
  Clock,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa6";

export default function SubprojectsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const projectsData = [
    {
      id: "livestate",
      category: "frameworks",
      redirect: "https://github.com/sergiomb04/LiveState",
      backgroundImgUrl: "/img/example/live-state.png",
      title: "LiveState Framework",
      subtitle: "Frontend Next.js (React) ⟷ Backend Java",
      tags: ["Java", "Next.js", "WebSockets", "Fullstack", "Real-time"],
      description:
        "Framework para crear experiencias interactivas en tiempo real sincronizando aplicaciones Next.js en el frontend con servidores Java en el backend mediante WebSockets.",
      buttonText: "Ver en GitHub",
      secondaryLink: "https://github.com/sergiomb04/LiveState",
      secondaryText: "Documentación & Repo",
      inProgress: false,
      glowColor: "rgba(16, 185, 129, 0.25)",
    },
    {
      id: "chat",
      category: "apps",
      redirect: "/projects/interactive-chat",
      backgroundImgUrl: "/img/example/chat.png",
      title: "Chat Interactivo en Tiempo Real",
      subtitle: "Mensajería instantánea global",
      tags: ["WebSockets", "Real-time", "Chat Global", "Next.js"],
      description:
        "Una sala de chat global a tiempo real donde cualquiera puede conectarse e interactuar instantáneamente con otros usuarios activos sin registros pesados.",
      buttonText: "Abrir Chat en vivo",
      inProgress: false,
      glowColor: "rgba(59, 130, 246, 0.25)",
    },
    {
      id: "blog",
      category: "frameworks",
      redirect:
        "https://blog.imsergioh.me/Herramienta-Blog-Gratuita/Introducci%C3%B3n-a-Articles-Web",
      backgroundImgUrl: "/img/example/blog.png",
      title: "Blog & Visualizador de Artículos",
      subtitle: "Vibe coding para documentos Markdown",
      tags: ["Markdown", "Artículos", "Vibe Coding", "Frontend"],
      description:
        "Proyecto vibe-codeado diseñado para alojar, estructurar y renderizar artículos y documentación Markdown de forma rápida, limpia y responsive.",
      buttonText: "Leer Artículos",
      inProgress: false,
      glowColor: "rgba(244, 63, 94, 0.25)",
    },
    {
      id: "counter",
      category: "apps",
      redirect: "/projects/counter",
      backgroundImgUrl: "/img/example/counter.png",
      title: "Contador Infinito",
      subtitle: "Mini-herramienta de estado interactivo",
      tags: ["React State", "Interactive", "Micro-Tool"],
      description:
        "Contador interactivo para sumar números infinitamente y poner a prueba la reactividad del frontend de manera simple y divertida.",
      buttonText: "Probar Contador",
      inProgress: false,
      glowColor: "rgba(245, 158, 11, 0.25)",
    },
  ];

  const categories = [
    { id: "all", label: "Todos los proyectos", count: projectsData.length },
    {
      id: "apps",
      label: "Web Apps & Demos",
      count: projectsData.filter((p) => p.category === "apps").length,
    },
    {
      id: "frameworks",
      label: "Frameworks & Herramientas",
      count: projectsData.filter((p) => p.category === "frameworks").length,
    },
  ];

  const filteredProjects = useMemo(() => {
    if (activeCategory === "all") return projectsData;
    return projectsData.filter((p) => p.category === activeCategory);
  }, [activeCategory, projectsData]);

  const stats = [
    {
      label: "DESPLIEGUES",
      value: `${projectsData.length} Activos`,
      icon: Radio,
      color: "text-emerald-400",
    },
    {
      label: "ENTORNO",
      value: "Playground",
      icon: Layers,
      color: "text-cyan-400",
    },
    {
      label: "STACK PRINCIPAL",
      value: "Java & Next.js",
      icon: Code2,
      color: "text-indigo-400",
    },
    {
      label: "EXPERIENCIA",
      value: "Interactiva",
      icon: Sparkles,
      color: "text-amber-400",
    }
  ];

  return (
    <div className="flex flex-col gap-10">
      <GlobalHeroComponent
        variant="projects"
        gradient="emerald"
        title={
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Entorno de Pruebas & Demos</span>
            </div>
            <span>
              DESPLIEGUES <HeroHighlight>ACTIVOS</HeroHighlight>
            </span>
          </div>
        }
        subtitle={
          <>
            Una colección de artefactos interactivos, mini-apps y experimentos
            listos para probar. Rompe cosas, testea la lógica y juega un rato. 🎮
          </>
        }
      />

      <div className="flex flex-col gap-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 w-full">
        {/* Quick Stats Grid */}
        <ArticleAnimation>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4 sm:p-5 transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/[0.06] hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      {stat.label}
                    </span>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-lg sm:text-2xl font-black font-montserrat text-white">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>
        </ArticleAnimation>

        {/* Category Filters Bar */}
        <ArticleAnimation>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${isActive
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10"
                      : "bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.08]"
                      }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${isActive
                        ? "bg-emerald-500/30 text-emerald-200"
                        : "bg-white/10 text-gray-400"
                        }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <span className="text-xs font-mono text-gray-400">
              Mostrando {filteredProjects.length} de {projectsData.length}{" "}
              despliegues
            </span>
          </div>
        </ArticleAnimation>

        {/* Projects List */}
        <div className="flex flex-col gap-8">
          {filteredProjects.map((project) => (
            <SubprojectArticle
              key={project.id}
              redirect={project.redirect}
              backgroundImgUrl={project.backgroundImgUrl}
              title={project.title}
              subtitle={project.subtitle}
              tags={project.tags}
              description={project.description}
              buttonText={project.buttonText}
              secondaryLink={project.secondaryLink}
              secondaryText={project.secondaryText}
              inProgress={project.inProgress}
              glowColor={project.glowColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


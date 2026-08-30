"use client";

import Link from "next/link";
import GlobalHeroComponent, {
  HeroHighlight,
} from "@/component/hero/GlobalHeroComponent";
import PrimaryButton from "@/component/button/PrimaryButton";
import { Rocket, User, Sparkles } from "lucide-react";
import { FaDiscord } from "react-icons/fa6";

export default function PageTitleComponent() {
  return (
    <div className="relative">
      <GlobalHeroComponent
        variant="home"
        gradient="home"
        title={
          <div className="flex flex-col items-center gap-4 sm:gap-6 mb-2 sm:mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md text-purple-300 text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-lg shadow-purple-500/10 animate-fade-in">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>Laboratorio & Portafolio Creativo</span>
            </div>
            <span className="leading-tight">
              ¡BIENVENIDO A <HeroHighlight>SERGIOHUB</HeroHighlight>!
            </span>
          </div>
        }
        subtitle={
          <div className="space-y-8 max-w-3xl mx-auto pt-2">
            <p className="text-gray-200 text-base sm:text-lg md:text-xl font-normal leading-relaxed">
              Explora artefactos interactivos, arquitecturas en tiempo real y
              soluciones de software creadas con pasión por el código. 🚀
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <PrimaryButton
                href="/projects"
                className="inline-flex items-center gap-2 px-7 py-3 font-semibold text-sm shadow-xl shadow-purple-500/10 hover:scale-105 transition-all"
              >
                <Rocket className="w-4 h-4" />
                <span>Explorar Proyectos</span>
              </PrimaryButton>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/[0.05] hover:bg-white/[0.12] backdrop-blur-md text-sm font-medium text-white transition-all hover:scale-105"
              >
                <User className="w-4 h-4 text-purple-300" />
                <span>Sobre Mí</span>
              </Link>

              <Link
                href="https://discord.gg/B6nxVFaZuq"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 backdrop-blur-md text-sm font-medium text-indigo-300 transition-all hover:scale-105"
              >
                <FaDiscord className="w-4 h-4" />
                <span>Discord</span>
              </Link>
            </div>
          </div>
        }
      />
    </div>
  );
}


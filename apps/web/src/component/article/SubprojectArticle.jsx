import ArticleAnimation from "@/component/animation/ArticleAnimation";
import Image from "next/image";
import PrimaryButton from "@/component/button/PrimaryButton";
import ProjectInProgress from "@/component/button/ProjectInProgress";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import Link from "next/link";

export default function ProjectCard({
  backgroundImgUrl,
  bgImgAlt = "Vista previa del proyecto",
  title,
  subtitle,
  tags = [],
  description,
  buttonText,
  redirect,
  secondaryLink,
  secondaryText = "Ver en GitHub",
  className = "",
  inProgress = false,
  glowColor = "rgba(16, 185, 129, 0.2)",
}) {
  const isExternal = /^https?:\/\//.test(redirect || "");
  const isGithubSecondary = secondaryLink && /github\.com/i.test(secondaryLink);

  return (
    <ArticleAnimation>
      <div
        className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/[0.06] via-white/[0.02] to-transparent backdrop-blur-xl transition-all duration-500 hover:border-white/25 hover:shadow-2xl hover:shadow-emerald-500/5 ${className}`}
      >
        {/* Glow ambient background spot */}
        <div
          className="absolute -top-12 -right-12 w-60 h-60 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
          style={{ backgroundColor: glowColor }}
        />

        <div className="flex flex-col lg:flex-row items-stretch">
          {/* Image / Thumbnail Container */}
          <div className="relative w-full lg:w-5/12 min-h-[220px] sm:min-h-[260px] overflow-hidden bg-black/40">
            {backgroundImgUrl && (
              <Image
                src={backgroundImgUrl}
                alt={bgImgAlt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                priority={false}
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t lg:bg-linear-to-r from-[#07090d]/90 via-[#07090d]/40 to-transparent" />
          </div>

          {/* Details & Actions Container */}
          <div className="relative z-10 flex flex-col justify-between flex-1 p-6 sm:p-8 lg:p-10">
            <div>
              {/* Tags bar */}
              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="group/tag inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-linear-to-r from-white/[0.08] to-white/[0.04] border border-white/15 text-zinc-100 backdrop-blur-md shadow-xs transition-all duration-200 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-200 hover:shadow-emerald-500/10 hover:-translate-y-0.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] group-hover/tag:scale-125 transition-transform" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Title & Subtitle */}
              <h3 className="text-2xl sm:text-3xl font-extrabold font-montserrat text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs sm:text-sm font-semibold text-emerald-400 mt-1">
                  {subtitle}
                </p>
              )}

              {/* Description */}
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mt-3 max-w-2xl">
                {description}
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-6 mt-4 border-t border-white/10">
              {inProgress ? (
                <ProjectInProgress />
              ) : (
                <>
                  {redirect && (
                    <PrimaryButton
                      href={redirect}
                      className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 shadow-lg shadow-white/5"
                    >
                      <span>
                        {buttonText
                          ? buttonText
                          : isExternal
                            ? "Abrir enlace"
                            : "Probar app"}
                      </span>
                      {isExternal ? (
                        <ExternalLink className="h-4 w-4 opacity-80" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 opacity-80" />
                      )}
                    </PrimaryButton>
                  )}

                  {secondaryLink && (
                    <Link
                      href={secondaryLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] hover:border-white/30 text-zinc-300 hover:text-white transition-all"
                    >
                      {isGithubSecondary && <FaGithub className="h-4 w-4" />}
                      <span>{secondaryText}</span>
                      <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ArticleAnimation>
  );
}

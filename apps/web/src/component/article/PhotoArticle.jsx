import Image from "next/image";
import ArticleAnimation from "@/component/animation/ArticleAnimation";
import { CheckCircle2 } from "lucide-react";

export default function PhotoArticle({
  className = "",
  title,
  subtitle,
  badge,
  highlights = [],
  description,
  imgSrc = "/img/mc1.png",
  imgAlt = "Artículo visual",
  imgHeight,
  imgWidth,
  imgToRight = false,
  glowColor = "rgba(99, 102, 241, 0.2)",
  children,
}) {
  const ImageCard = (
    <div className="w-full lg:w-[48%] flex justify-center items-center">
      <div className="group relative w-full h-72 sm:h-96 overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-white/[0.02] backdrop-blur-md transition-all duration-500 hover:border-white/25 hover:shadow-indigo-500/10">
        <Image
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          src={imgSrc}
          alt={imgAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#07090d]/90 via-[#07090d]/20 to-transparent pointer-events-none" />
        
        {imgAlt && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <span className="text-xs font-semibold text-white/90 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              {imgAlt}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const ContentCard = (
    <div className="w-full lg:w-[52%]">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/[0.06] via-white/[0.02] to-transparent backdrop-blur-xl p-6 sm:p-9 transition-all duration-300 hover:border-white/20 hover:shadow-2xl">
        {/* Glow ambient background spot */}
        <div
          className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: glowColor }}
        />

        {badge && (
          <div className="mb-4">
            <span className="inline-flex items-center text-xs font-mono font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {badge}
            </span>
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-montserrat text-white tracking-tight">
          {title}
        </h2>

        {subtitle && (
          <p className="text-sm sm:text-base font-semibold text-indigo-300 mt-1.5">
            {subtitle}
          </p>
        )}

        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mt-4">
          {description}
        </p>

        {highlights.length > 0 && (
          <div className="mt-6 space-y-2.5 pt-4 border-t border-white/10">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );

  return (
    <ArticleAnimation>
      <div
        className={`w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 ${className}`}
      >
        <div
          className={`flex flex-col lg:flex-row items-center gap-8 ${
            imgToRight ? "lg:flex-row-reverse" : ""
          }`}
        >
          {ImageCard}
          {ContentCard}
        </div>
      </div>
    </ArticleAnimation>
  );
}
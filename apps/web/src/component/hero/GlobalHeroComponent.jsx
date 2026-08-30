"use client";

import { createContext, useContext } from "react";
import { getHeroGradientPreset, getHeroTextGradient } from "@/component/hero/heroThemes";

const HeroContext = createContext({
  gradient: "section",
  preset: null,
});

export function useHeroTheme() {
  return useContext(HeroContext);
}

/**
 * Component to automatically highlight text with the current hero gradient
 */
export function HeroHighlight({
  children,
  gradient,
  className,
  ...props
}) {
  const context = useHeroTheme();
  const themeName = gradient || context.gradient;
  const gradientClass = getHeroTextGradient(themeName);

  return (
    <span
      className={mergeClasses(gradientClass, className)}
      {...props}
    >
      {children}
    </span>
  );
}

const HERO_VARIANTS = {
  home: {
    containerClassName:
      "flex flex-col align-middle justify-center w-full min-h-[22rem] sm:min-h-[26rem] md:min-h-[28rem] m-auto py-14 sm:py-18 md:py-20 relative isolate overflow-hidden",
    contentClassName:
      "relative z-10 text-center space-y-6 sm:space-y-8 w-[92%] sm:w-[88%] max-w-5xl mx-auto px-4",
    titleClassName:
      "text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-extrabold font-montserrat tracking-tight text-white",
    subtitleClassName:
      "text-gray-200 text-lg sm:text-xl md:text-2xl font-medium font-montserrat max-w-3xl mx-auto",
  },
  section: {
    containerClassName:
      "flex flex-col align-middle justify-center w-full min-h-[14rem] sm:min-h-[16rem] md:h-64 m-auto py-8 relative isolate overflow-hidden",
    contentClassName: "relative z-10 text-center space-y-3 w-[90%] sm:w-[85%] max-w-4xl mx-auto px-4",
    titleClassName:
      "text-3xl sm:text-4xl md:text-5xl font-extrabold font-montserrat tracking-tight text-white transition-all duration-300",
    subtitleClassName:
      "text-gray-200 text-base sm:text-lg md:text-xl font-semibold font-montserrat transition-all duration-300 max-w-2xl mx-auto",
  },
  projects: {
    containerClassName:
      "flex flex-col align-middle justify-center w-full min-h-[14rem] sm:min-h-[16rem] md:h-64 m-auto py-8 relative isolate overflow-hidden",
    contentClassName: "relative z-10 text-center space-y-3 w-[90%] sm:w-[85%] max-w-4xl mx-auto px-4",
    titleClassName:
      "text-3xl sm:text-4xl md:text-5xl font-extrabold font-montserrat tracking-tight text-white",
    subtitleClassName:
      "text-gray-200 text-base sm:text-lg md:text-xl font-medium font-montserrat max-w-2xl mx-auto",
  },
};

function mergeClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function GlobalHeroComponent({
  variant = "section",
  gradient,
  containerClassName,
  backgroundClassName,
  backgroundStyle,
  contentClassName,
  title,
  highlight,
  titleClassName,
  subtitle,
  subtitleClassName,
}) {
  const selectedVariant = HERO_VARIANTS[variant] || HERO_VARIANTS.section;
  const activeGradient = gradient || variant;
  const gradientPreset = getHeroGradientPreset(activeGradient);

  const finalStyle = backgroundStyle || {
    background: gradientPreset.background,
  };

  return (
    <HeroContext.Provider
      value={{ gradient: activeGradient, preset: gradientPreset }}
    >
      <div
        className={mergeClasses(
          selectedVariant.containerClassName,
          containerClassName
        )}
      >
        {/* Capa de gradiente ambiental suave */}
        <div
          className={mergeClasses(
            "absolute inset-0 pointer-events-none",
            backgroundClassName
          )}
          style={finalStyle}
          aria-hidden="true"
        />

        <div
          className={mergeClasses(
            selectedVariant.contentClassName,
            contentClassName
          )}
        >
          <h1
            className={mergeClasses(
              selectedVariant.titleClassName,
              titleClassName
            )}
          >
            {title}
            {highlight && (
              <>
                {" "}
                <HeroHighlight>{highlight}</HeroHighlight>
              </>
            )}
          </h1>
          {subtitle && (
            <h2
              className={mergeClasses(
                selectedVariant.subtitleClassName,
                subtitleClassName
              )}
            >
              {subtitle}
            </h2>
          )}
        </div>
      </div>
    </HeroContext.Provider>
  );
}

GlobalHeroComponent.Highlight = HeroHighlight;



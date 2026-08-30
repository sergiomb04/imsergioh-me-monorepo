/**
 * Centralized hero gradient themes and color configurations.
 * Allows easy configuration and addition of new gradient themes for hero headers.
 */

export const HERO_GRADIENT_PRESETS = {
  home: {
    name: "Home / SergioHub",
    background:
      "radial-gradient(ellipse 80% 70% at 50% 30%, rgba(217, 70, 239, 0.25) 0%, rgba(139, 92, 246, 0.18) 45%, rgba(59, 130, 246, 0.10) 70%, transparent 100%)",
    textGradientClassName:
      "text-transparent bg-clip-text bg-linear-to-r from-[#d946ef] via-[#8b5cf6] to-[#3b82f6]",
  },
  projects: {
    name: "Projects",
    background:
      "radial-gradient(ellipse 80% 70% at 50% 30%, rgba(245, 158, 11, 0.25) 0%, rgba(234, 179, 8, 0.18) 45%, rgba(217, 119, 6, 0.08) 70%, transparent 100%)",
    textGradientClassName:
      "text-transparent bg-clip-text bg-linear-to-r from-yellow-400 via-amber-400 to-amber-500",
  },
  about: {
    name: "About Me",
    background:
      "radial-gradient(ellipse 80% 70% at 50% 30%, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.18) 45%, rgba(59, 130, 246, 0.08) 70%, transparent 100%)",
    textGradientClassName:
      "text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-blue-400",
  },
  section: {
    name: "Section Default",
    background:
      "radial-gradient(ellipse 80% 70% at 50% 30%, rgba(139, 92, 246, 0.22) 0%, rgba(59, 130, 246, 0.14) 50%, transparent 100%)",
    textGradientClassName:
      "text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-indigo-400 to-blue-400",
  },
  cyan: {
    name: "Cyan Teal",
    background:
      "radial-gradient(ellipse 80% 70% at 50% 30%, rgba(6, 182, 212, 0.25) 0%, rgba(20, 184, 166, 0.18) 45%, rgba(59, 130, 246, 0.08) 70%, transparent 100%)",
    textGradientClassName:
      "text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-teal-400 to-blue-400",
  },
  emerald: {
    name: "Emerald Green",
    background:
      "radial-gradient(ellipse 80% 70% at 50% 30%, rgba(16, 185, 129, 0.25) 0%, rgba(34, 197, 94, 0.18) 45%, rgba(14, 165, 233, 0.08) 70%, transparent 100%)",
    textGradientClassName:
      "text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-teal-400 to-green-400",
  },
  rose: {
    name: "Rose Pink",
    background:
      "radial-gradient(ellipse 80% 70% at 50% 30%, rgba(244, 63, 94, 0.25) 0%, rgba(236, 72, 153, 0.18) 45%, rgba(168, 85, 247, 0.08) 70%, transparent 100%)",
    textGradientClassName:
      "text-transparent bg-clip-text bg-linear-to-r from-rose-400 via-pink-400 to-purple-400",
  },
};

/**
 * Helper to get text gradient class for a preset
 * @param {string} presetName
 * @returns {string}
 */
export function getHeroTextGradient(presetName) {
  const preset = getHeroGradientPreset(presetName);
  return preset?.textGradientClassName || "";
}

/**
 * Helper to get a preset safely with fallback
 * @param {string} presetName
 * @returns {typeof HERO_GRADIENT_PRESETS.home}
 */
export function getHeroGradientPreset(presetName) {
  return (
    HERO_GRADIENT_PRESETS[presetName] ||
    HERO_GRADIENT_PRESETS.section ||
    HERO_GRADIENT_PRESETS.home
  );
}

import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "@next/next/no-img-element": "warn",
      "import/no-anonymous-default-export": "warn",
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      ".idea/**",
      ".tasks/**",
      "*.tsbuildinfo",
    ],
  },
];

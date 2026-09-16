import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next. Se usa "**/" en vez de anclar a la
    // raíz porque los worktrees de tareas en background (`.claude/worktrees/*`)
    // generan su propio `.next` anidado, que si no se ignora también aquí queda
    // expuesto al lint de este proyecto.
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

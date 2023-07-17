import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";
import tsconfigPaths from "vite-tsconfig-paths";

declare const process: {
  cwd: () => string;
  env: Record<string, string>;
};

export default defineConfig(() => {
  return {
    plugins: [tsconfigPaths(), solidPlugin({ hot: false }), solidSvg()],
    clearScreen: false,
    server: {
      port: 2001,
      strictPort: true,
    },
    envPrefix: ["VITE_", "TAURI_"],
    build: {
      target:
        process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
      minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
      sourcemap: !!process.env.TAURI_DEBUG,
      rollupOptions: {
        input: {
          index: "./index.html",
          settings: "./settings.html",
        },
      },
    },
  };
});

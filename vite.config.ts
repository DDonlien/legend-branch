import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    {
      name: "material-css-modules",
      enforce: "pre",
      // Material's Expressive labs ship both native CSS modules and Lit's
      // compiled equivalent. Use the latter for Vite and older browsers.
      transform(code, id) {
        if (!id.includes("/@material/web/labs/gb/") || !id.split("?")[0].endsWith(".js")) return;
        return code.replace(/(from\s+['"][^'"]+)\.css(['"])\s+with\s*\{\s*type:\s*['"]css['"]\s*\}/g, "$1.cssresult.js$2");
      },
    },
    react(),
  ],
  optimizeDeps: { exclude: ["@material/web"] },
});

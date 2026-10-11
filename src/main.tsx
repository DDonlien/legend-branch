import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { PreferencesProvider } from "./Locale";
import "@fontsource-variable/roboto-flex";
import "@fontsource/material-symbols-rounded/400.css";
import "@material/web/labs/gb/styles/m3.css";
import "@material/web/typography/md-typescale-styles.css";
import { applyMaterialTheme } from "./theme";
import "./styles.css";

applyMaterialTheme(document.documentElement);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PreferencesProvider><App /></PreferencesProvider>
  </StrictMode>,
);

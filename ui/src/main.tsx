import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import App from "./App";
import { Baseline } from "./components/Baseline";
import theme from "./theme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Light or dark follows the system until someone picks one with the toggle in the top bar, which this browser remembers. */}
    <ThemeProvider theme={theme} defaultMode="system" noSsr>
      <Baseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);

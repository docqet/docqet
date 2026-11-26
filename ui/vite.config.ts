import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/*
 * The UI reads everything from the server's API, under /api/v1. While
 * developing, the dev server passes those requests on to a running server:
 * DOCKET_API, or else the one `make run` starts, on localhost:8080.
 */
const api = process.env.DOCKET_API ?? "http://localhost:8080";

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": api } },
  preview: { proxy: { "/api": api } },
  /* Relative, so the built UI works under whatever path the server serves it from. */
  base: "./",
});

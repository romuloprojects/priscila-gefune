// @lovable.dev/vite-tanstack-config already includes the core plugins used by the project.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: {
      entry: "server",
    },
  },

  vite: {
    server: {
      allowedHosts: ["priscila-gefune.facilities-ai.com.br"],
    },
  },
});

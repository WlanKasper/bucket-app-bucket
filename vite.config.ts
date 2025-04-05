import dotenv from "dotenv";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

dotenv.config();

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths({
      projects: ["tsconfig.json"],
    }),
  ],
  define: {
    "process.env": process.env,
  },
});

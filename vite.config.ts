import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
    plugins: [react(), TanStackRouterVite(), sentryVitePlugin({
        org: "yats-co",
        project: "trollycare-newsletter"
    })],

    resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},

    build: {
        sourcemap: true
    }
});
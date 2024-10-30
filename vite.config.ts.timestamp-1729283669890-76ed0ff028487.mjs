// vite.config.ts
import { sentryVitePlugin } from "file:///Users/jw/Desktop/repos/trollycare-newsletter/node_modules/.pnpm/@sentry+vite-plugin@2.21.1/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import path from "node:path";
import react from "file:///Users/jw/Desktop/repos/trollycare-newsletter/node_modules/.pnpm/@vitejs+plugin-react-swc@3.7.0_vite@5.3.3_@types+node@20.14.10_/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { defineConfig } from "file:///Users/jw/Desktop/repos/trollycare-newsletter/node_modules/.pnpm/vite@5.3.3_@types+node@20.14.10/node_modules/vite/dist/node/index.js";
import { TanStackRouterVite } from "file:///Users/jw/Desktop/repos/trollycare-newsletter/node_modules/.pnpm/@tanstack+router-plugin@1.45.0_vite@5.3.3_@types+node@20.14.10_/node_modules/@tanstack/router-plugin/dist/esm/vite.js";
var __vite_injected_original_dirname = "/Users/jw/Desktop/repos/trollycare-newsletter";
var vite_config_default = defineConfig({
  plugins: [react(), TanStackRouterVite(), sentryVitePlugin({
    org: "yats-co",
    project: "trollycare-newsletter"
  })],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    sourcemap: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvancvRGVza3RvcC9yZXBvcy90cm9sbHljYXJlLW5ld3NsZXR0ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9qdy9EZXNrdG9wL3JlcG9zL3Ryb2xseWNhcmUtbmV3c2xldHRlci92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvancvRGVza3RvcC9yZXBvcy90cm9sbHljYXJlLW5ld3NsZXR0ZXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBzZW50cnlWaXRlUGx1Z2luIH0gZnJvbSBcIkBzZW50cnkvdml0ZS1wbHVnaW5cIjtcbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgVGFuU3RhY2tSb3V0ZXJWaXRlIH0gZnJvbSBcIkB0YW5zdGFjay9yb3V0ZXItcGx1Z2luL3ZpdGVcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgVGFuU3RhY2tSb3V0ZXJWaXRlKCksIHNlbnRyeVZpdGVQbHVnaW4oe1xuICAgICAgICBvcmc6IFwieWF0cy1jb1wiLFxuICAgICAgICBwcm9qZWN0OiBcInRyb2xseWNhcmUtbmV3c2xldHRlclwiXG4gICAgfSldLFxuXG4gICAgcmVzb2x2ZToge1xuXHRcdGFsaWFzOiB7XG5cdFx0XHRcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcblx0XHR9LFxuXHR9LFxuXG4gICAgYnVpbGQ6IHtcbiAgICAgICAgc291cmNlbWFwOiB0cnVlXG4gICAgfVxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF5VCxTQUFTLHdCQUF3QjtBQUMxVixPQUFPLFVBQVU7QUFDakIsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsMEJBQTBCO0FBSm5DLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsbUJBQW1CLEdBQUcsaUJBQWlCO0FBQUEsSUFDdEQsS0FBSztBQUFBLElBQ0wsU0FBUztBQUFBLEVBQ2IsQ0FBQyxDQUFDO0FBQUEsRUFFRixTQUFTO0FBQUEsSUFDWCxPQUFPO0FBQUEsTUFDTixLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDckM7QUFBQSxFQUNEO0FBQUEsRUFFRyxPQUFPO0FBQUEsSUFDSCxXQUFXO0FBQUEsRUFDZjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==

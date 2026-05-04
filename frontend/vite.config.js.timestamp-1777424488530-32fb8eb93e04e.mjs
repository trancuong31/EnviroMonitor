// vite.config.js
import { defineConfig } from "file:///D:/webs/EnviroMonitor/EnviroMonitor/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///D:/webs/EnviroMonitor/EnviroMonitor/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///D:/webs/EnviroMonitor/EnviroMonitor/frontend/node_modules/@tailwindcss/vite/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "D:\\webs\\EnviroMonitor\\EnviroMonitor\\frontend";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@components": path.resolve(__vite_injected_original_dirname, "./src/components"),
      "@features": path.resolve(__vite_injected_original_dirname, "./src/features"),
      "@hooks": path.resolve(__vite_injected_original_dirname, "./src/hooks"),
      "@services": path.resolve(__vite_injected_original_dirname, "./src/services"),
      "@store": path.resolve(__vite_injected_original_dirname, "./src/store"),
      "@routes": path.resolve(__vite_injected_original_dirname, "./src/routes"),
      "@types": path.resolve(__vite_injected_original_dirname, "./src/types")
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8888",
        changeOrigin: true
      }
    }
  },
  preview: {
    host: "0.0.0.0",
    port: 5173
  },
  build: {
    outDir: "dist",
    sourcemap: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3ZWJzXFxcXEVudmlyb01vbml0b3JcXFxcRW52aXJvTW9uaXRvclxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcd2Vic1xcXFxFbnZpcm9Nb25pdG9yXFxcXEVudmlyb01vbml0b3JcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L3dlYnMvRW52aXJvTW9uaXRvci9FbnZpcm9Nb25pdG9yL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgICAgcmVhY3QoKSxcclxuICAgICAgICB0YWlsd2luZGNzcygpXHJcbiAgICBdLFxyXG5cclxuICAgIHJlc29sdmU6IHtcclxuXHJcbiAgICAgICAgYWxpYXM6IHtcclxuXHJcbiAgICAgICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXHJcbiAgICAgICAgICAgICdAY29tcG9uZW50cyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb21wb25lbnRzJyksXHJcbiAgICAgICAgICAgICdAZmVhdHVyZXMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvZmVhdHVyZXMnKSxcclxuICAgICAgICAgICAgJ0Bob29rcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9ob29rcycpLFxyXG4gICAgICAgICAgICAnQHNlcnZpY2VzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3NlcnZpY2VzJyksXHJcbiAgICAgICAgICAgICdAc3RvcmUnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvc3RvcmUnKSxcclxuICAgICAgICAgICAgJ0Byb3V0ZXMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvcm91dGVzJyksXHJcbiAgICAgICAgICAgICdAdHlwZXMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdHlwZXMnKSxcclxuXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNlcnZlcjoge1xyXG5cclxuICAgICAgICBob3N0OiAnMC4wLjAuMCcsXHJcblxyXG4gICAgICAgIHBvcnQ6IDUxNzMsXHJcblxyXG4gICAgICAgIHByb3h5OiB7XHJcblxyXG4gICAgICAgICAgICAnL2FwaSc6IHtcclxuXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0Ojg4ODgnLFxyXG5cclxuICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBwcmV2aWV3OiB7XHJcblxyXG4gICAgICAgIGhvc3Q6ICcwLjAuMC4wJyxcclxuXHJcbiAgICAgICAgcG9ydDogNTE3MyxcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGJ1aWxkOiB7XHJcblxyXG4gICAgICAgIG91dERpcjogJ2Rpc3QnLFxyXG5cclxuICAgICAgICBzb3VyY2VtYXA6IHRydWUsXHJcblxyXG4gICAgfSxcclxuXHJcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1UsU0FBUyxvQkFBb0I7QUFDN1YsT0FBTyxXQUFXO0FBQ2xCLE9BQU8saUJBQWlCO0FBQ3hCLE9BQU8sVUFBVTtBQUhqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUV4QixTQUFTO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsRUFDaEI7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUVMLE9BQU87QUFBQSxNQUVILEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUNwQyxlQUFlLEtBQUssUUFBUSxrQ0FBVyxrQkFBa0I7QUFBQSxNQUN6RCxhQUFhLEtBQUssUUFBUSxrQ0FBVyxnQkFBZ0I7QUFBQSxNQUNyRCxVQUFVLEtBQUssUUFBUSxrQ0FBVyxhQUFhO0FBQUEsTUFDL0MsYUFBYSxLQUFLLFFBQVEsa0NBQVcsZ0JBQWdCO0FBQUEsTUFDckQsVUFBVSxLQUFLLFFBQVEsa0NBQVcsYUFBYTtBQUFBLE1BQy9DLFdBQVcsS0FBSyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUNqRCxVQUFVLEtBQUssUUFBUSxrQ0FBVyxhQUFhO0FBQUEsSUFFbkQ7QUFBQSxFQUVKO0FBQUEsRUFFQSxRQUFRO0FBQUEsSUFFSixNQUFNO0FBQUEsSUFFTixNQUFNO0FBQUEsSUFFTixPQUFPO0FBQUEsTUFFSCxRQUFRO0FBQUEsUUFFSixRQUFRO0FBQUEsUUFFUixjQUFjO0FBQUEsTUFFbEI7QUFBQSxJQUVKO0FBQUEsRUFFSjtBQUFBLEVBRUEsU0FBUztBQUFBLElBRUwsTUFBTTtBQUFBLElBRU4sTUFBTTtBQUFBLEVBRVY7QUFBQSxFQUVBLE9BQU87QUFBQSxJQUVILFFBQVE7QUFBQSxJQUVSLFdBQVc7QUFBQSxFQUVmO0FBRUosQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K

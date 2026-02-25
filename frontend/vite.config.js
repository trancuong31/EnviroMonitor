import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({

    plugins: [
        react(),
        tailwindcss()
    ],

    resolve: {

        alias: {

            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@features': path.resolve(__dirname, './src/features'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@services': path.resolve(__dirname, './src/services'),
            '@store': path.resolve(__dirname, './src/store'),
            '@routes': path.resolve(__dirname, './src/routes'),
            '@types': path.resolve(__dirname, './src/types'),

        },

    },

    server: {

        host: '0.0.0.0',

        port: 5173,

        proxy: {

            '/api': {

                target: 'http://localhost:8888',

                changeOrigin: true,

            },

        },

    },

    preview: {

        host: '0.0.0.0',

        port: 5173,

    },

    build: {

        outDir: 'dist',

        sourcemap: true,

    },

});
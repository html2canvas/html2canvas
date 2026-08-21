import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import rehypePrism from 'rehype-prism-plus';

export default defineConfig({
    site: 'https://html2canvas.github.io',
    base: '/html2canvas',
    integrations: [react()],
    markdown: {
        rehypePlugins: [[rehypePrism, {ignoreMissing: true}]],
        shikiConfig: {
            theme: 'solarized-light'
        }
    },
    outDir: './dist-site',
    publicDir: './static'
});

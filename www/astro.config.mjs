import react from '@astrojs/react';
import {defineConfig} from 'astro/config';
import rehypePrism from 'rehype-prism-plus';

export default defineConfig({
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

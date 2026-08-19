import {marked} from 'marked';
import {createHighlighter} from 'shiki';

// Lazily initialized shiki highlighter (singleton)
let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

function getHighlighter() {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighter({
            themes: ['solarized-light'],
            langs: ['javascript', 'typescript', 'html', 'css', 'bash', 'json']
        });
    }
    return highlighterPromise;
}

// Map common language aliases
const LANG_ALIASES: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    sh: 'bash',
    shell: 'bash'
};

const SUPPORTED_LANGS = new Set(['javascript', 'typescript', 'html', 'css', 'bash', 'json']);

async function buildRenderer() {
    const highlighter = await getHighlighter();
    const renderer = new marked.Renderer();

    // marked passes (code: string, lang: string, escaped: boolean)
    (renderer as any).code = (code: string, lang: string | undefined) => {
        const text = typeof code === 'string' ? code : '';
        const rawLang = (lang ?? '').toLowerCase();
        const resolvedLang = LANG_ALIASES[rawLang] ?? rawLang;
        const finalLang = SUPPORTED_LANGS.has(resolvedLang) ? resolvedLang : 'html';

        try {
            return highlighter.codeToHtml(text, {
                lang: finalLang,
                theme: 'solarized-light'
            });
        } catch {
            // Fallback: plain pre/code block
            const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<pre class="language-${finalLang}"><code>${escaped}</code></pre>`;
        }
    };

    return renderer;
}

export async function parseMarkdown(content: string): Promise<string> {
    const renderer = await buildRenderer();
    marked.use({renderer});
    return marked.parse(content) as Promise<string>;
}

import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/visual',
    outputDir: './tmp/playwright-results',

    // Each fixture gets up to 30s to render via html2canvas
    timeout: 30_000,

    // Snapshot comparison settings
    expect: {
        toHaveScreenshot: {
            // Allow a small pixel difference to account for anti-aliasing
            maxDiffPixelRatio: 0.01,
        },
        toMatchSnapshot: {
            // Same tolerance for buffer-based comparisons
            maxDiffPixelRatio: 0.01,
        },
    },

    // Fail the build on any test.only left in source
    forbidOnly: !!process.env.CI,

    // Retry flaky tests once in CI
    retries: process.env.CI ? 1 : 0,

    // Run fixtures in parallel for speed
    fullyParallel: true,
    workers: process.env.CI ? 2 : undefined,

    // HTML reporter for interactive diff review
    reporter: process.env.CI ? 'github' : 'html',

    use: {
        // Fixed viewport matching the reftest dimensions (800×600)
        viewport: { width: 800, height: 600 },
        // Base URL for the Express test server
        baseURL: 'http://localhost:8080',
    },

    // Start the Express servers before running tests
    webServer: [
        {
            command: 'ts-node --project tests/tsconfig.json tests/server --port=8080 --cors=8081',
            port: 8080,
            reuseExistingServer: !process.env.CI,
        },
    ],

    projects: [
        {
            name: 'chromium',
            use: {
                browserName: 'chromium',
                // Disable GPU for consistent rendering in headless
                launchOptions: {
                    args: ['--no-sandbox', '--disable-gpu'],
                },
            },
        },
    ],
});

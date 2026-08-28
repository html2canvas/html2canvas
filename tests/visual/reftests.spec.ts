import { test, expect } from '@playwright/test';
import { sync } from 'glob';
import path from 'path';
import fs from 'fs';

// Scan all HTML fixtures under tests/reftests/
const reftestsDir = path.resolve(__dirname, '../reftests');
const fixtures = sync('**/*.html', { cwd: reftestsDir });

// Load ignore list (same format as the Karma test runner)
const ignoreFile = path.resolve(reftestsDir, 'ignore.txt');
const ignoredTests: Record<string, string[]> = {};
if (fs.existsSync(ignoreFile)) {
    const lines = fs
        .readFileSync(ignoreFile, 'utf-8')
        .split(/\r?\n/)
        .filter(l => l.length > 0);
    for (const line of lines) {
        const match = line.match(/^(\[(.+)\])?(.+)$/i);
        if (match) {
            // match[3] is the test path, match[2] is the optional comma-separated browser list
            ignoredTests[match[3]] = match[2] ? match[2].split(',') : [];
        }
    }
}

for (const fixture of fixtures) {
    // Skip files listed in ignore.txt (empty browser list = skip all)
    const testPath = `/tests/reftests/${fixture}`;
    if (ignoredTests[testPath] !== undefined) {
        const browsers = ignoredTests[testPath];
        // Empty array means ignore on all browsers
        if (browsers.length === 0) continue;
    }

    test(`reftest: ${fixture}`, async ({ page }) => {
        // Navigate to the fixture with reftest query params (same as Karma runner)
        await page.goto(`/tests/reftests/${fixture}?selenium&run=false&reftest`, {
            waitUntil: 'load',
        });

        // Wait for html2canvas and jQuery to be loaded by test.js
        await page.waitForFunction(
            () => {
                return typeof (window as any).html2canvas === 'function';
            },
            { timeout: 10_000 },
        );

        // Run html2canvas with the same options as the Karma test runner
        const pngBase64: string = await page.evaluate(async () => {
            const win = window as any;
            const targetElement = win.forceElement || document.documentElement;
            const options = {
                removeContainer: true,
                backgroundColor: '#ffffff',
                proxy: 'http://localhost:8081/proxy',
                windowWidth: 800,
                windowHeight: 600,
                ...(win.h2cOptions || {}),
            };
            const canvas: HTMLCanvasElement = await win.html2canvas(targetElement, options);

            // Verify the canvas is not tainted (same check as Karma runner)
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get 2d context');
            ctx.getImageData(0, 0, canvas.width, canvas.height);

            return canvas.toDataURL('image/png');
        });

        // Convert data URI to buffer and compare against baseline snapshot
        const base64Data = pngBase64.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Snapshot name uses the fixture path (slashes replaced by dashes)
        const snapshotName = fixture.replace(/\//g, '-').replace(/\.html$/, '') + '.png';
        expect(buffer).toMatchSnapshot(snapshotName);
    });
}

/// <reference path="./declarations.d.ts" />
import cors from 'cors';
import express from 'express';
import filenamifyUrl from 'filenamify-url';
import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import serveIndex from 'serve-index';
import {URL} from 'url';
import yargs from 'yargs';
import {ScreenshotRequest} from './types';

// Inline proxy middleware — replaces the html2canvas-proxy package.
// Fetches a remote URL (passed as ?url=) and returns its content as a base64 data URI.
const proxyMiddleware = (): express.Router => {
    const router = express.Router();
    router.get('/', cors(), (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const rawUrl = req.query.url;
        if (!rawUrl || typeof rawUrl !== 'string') {
            return next(new Error('No url specified'));
        }
        let parsed: URL;
        try {
            parsed = new URL(rawUrl);
        } catch {
            return next(new Error(`Invalid url specified: ${rawUrl}`));
        }
        if (!parsed.host) {
            return next(new Error(`Invalid url specified: ${rawUrl}`));
        }

        const transport = parsed.protocol === 'https:' ? https : http;
        transport
            .get(rawUrl, (upstream) => {
                const contentType = upstream.headers['content-type'] ?? 'application/octet-stream';
                const chunks: Uint8Array[] = [];
                upstream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
                upstream.on('end', () => {
                    const body = Buffer.concat(chunks as Uint8Array[]);
                    const responseType = req.query.responseType;
                    if (responseType === 'blob') {
                        res.set('Content-Type', contentType);
                        res.send(body);
                    } else {
                        res.send(`data:${contentType};base64,${body.toString('base64')}`);
                    }
                });
                upstream.on('error', next);
            })
            .on('error', next);
    });
    return router;
};

export const app = express();
// static files must be served before serveIndex so that actual files
// (node_modules, src, build, etc.) are returned with the correct MIME type
// rather than being intercepted by the directory listing middleware.
app.use('/', express.static(path.resolve(__dirname, '../')));
app.use('/', serveIndex(path.resolve(__dirname, '../'), {icons: true}));

export const corsApp = express();
corsApp.use('/proxy', proxyMiddleware());
corsApp.use('/cors', cors(), express.static(path.resolve(__dirname, '../')));
corsApp.use('/', express.static(path.resolve(__dirname, '.')));

export const screenshotApp = express();
screenshotApp.use(cors());
screenshotApp.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
    // IE9 doesn't set headers for cross-domain ajax requests
    if (typeof req.headers['content-type'] === 'undefined') {
        req.headers['content-type'] = 'application/json';
    }
    next();
});
screenshotApp.use(
    express.json({
        limit: '15mb',
        type: '*/*'
    })
);

const prefix = 'data:image/png;base64,';
const screenshotFolder = '../tmp/reftests';
const metadataFolder = '../tmp/reftests/metadata';

fs.mkdirSync(path.resolve(__dirname, screenshotFolder), {recursive: true});
fs.mkdirSync(path.resolve(__dirname, metadataFolder), {recursive: true});

const writeScreenshot = (buffer: Buffer, body: ScreenshotRequest) => {
    const filename = `${filenamifyUrl(body.test.replace(/^\/tests\/reftests\//, '').replace(/\.html$/, ''), {
        replacement: '-'
    })}!${[process.env.TARGET_BROWSER, body.platform.name, body.platform.version].join('-')}`;

    fs.writeFileSync(path.resolve(__dirname, screenshotFolder, `${filename}.png`), buffer as unknown as Uint8Array);
    return filename;
};

screenshotApp.post(
    '/screenshot',
    (req: express.Request<Record<string, unknown>, void, ScreenshotRequest>, res: express.Response) => {
        if (!req.body || !req.body.screenshot) {
            return res.sendStatus(400);
        }

        const buffer = Buffer.from(req.body.screenshot.substring(prefix.length), 'base64');
        const filename = writeScreenshot(buffer, req.body);
        fs.writeFileSync(
            path.resolve(__dirname, metadataFolder, `${filename}.json`),
            JSON.stringify({
                windowWidth: req.body.windowWidth,
                windowHeight: req.body.windowHeight,
                platform: req.body.platform,
                devicePixelRatio: req.body.devicePixelRatio,
                test: req.body.test,
                id: process.env.TARGET_BROWSER,
                screenshot: filename
            })
        );
        return res.sendStatus(200);
    }
);

screenshotApp.use((error: Error, _req: express.Request, _res: express.Response, next: express.NextFunction) => {
    console.error(error);
    next();
});

const args = yargs(process.argv.slice(2)).number(['port', 'cors', 'screenshot']).argv as {
    [x: string]: unknown;
    port: number | undefined;
    cors: number | undefined;
    screenshot: number | undefined;
};

if (args.port) {
    app.listen(args.port, () => {
        console.log(`Server running on port ${args.port}`);
    });
}

if (args.cors) {
    corsApp.listen(args.cors, () => {
        console.log(`CORS server running on port ${args.cors}`);
    });
}

if (args.screenshot) {
    screenshotApp.listen(args.screenshot, () => {
        console.log(`Screenshot server running on port ${args.screenshot}`);
    });
}

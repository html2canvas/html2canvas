// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {Promise as ES6Promise} from 'es6-promise';
import {default as platform} from 'platform';
import {ignoredTests, testList} from '../build/reftests';
import type {ScreenshotRequest} from './types';

if (typeof window.Promise === 'undefined') {
    Object.assign(window, {Promise: ES6Promise});
}

const uploadResults = (canvas: HTMLCanvasElement, url: string) => {
    return new Promise<void>((resolve: () => void, reject: (error: string) => void) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const xhr = 'withCredentials' in new XMLHttpRequest() ? new XMLHttpRequest() : new XDomainRequest();

        xhr.onload = () => {
            if (typeof xhr.status !== 'number' || xhr.status === 200) {
                resolve();
            } else {
                reject(`Failed to send screenshot with status ${xhr.status}`);
            }
        };
        xhr.onerror = reject;

        const request: ScreenshotRequest = {
            screenshot: canvas.toDataURL(),
            test: url,
            platform: {
                name: platform.name || '',
                version: platform.version || ''
            },
            devicePixelRatio: window.devicePixelRatio || 1,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight
        };

        xhr.open('POST', 'http://localhost:8000/screenshot', true);
        xhr.send(JSON.stringify(request));
    });
};

describe('Rendering Tests', () => {
    let testContainer: HTMLIFrameElement;

    beforeEach(() => {
        testContainer = document.createElement('iframe');
        const windowWidth = 800;
        const windowHeight = 600;
        testContainer.width = windowWidth.toString();
        testContainer.height = windowHeight.toString();
        testContainer.style.visibility = 'hidden';
        testContainer.style.position = 'fixed';
        testContainer.style.left = '10000px';
        document.body.appendChild(testContainer);
    });

    afterEach(() => {
        document.body.removeChild(testContainer);
    });

    testList
        .filter((test: string) => {
            return !Array.isArray(ignoredTests[test]) || ignoredTests[test].indexOf(platform.name || '') === -1;
        })
        .forEach((url: string) => {
            it(`Should render untainted canvas for ${url}`, (done) => {
                const hasHistoryApi =
                    typeof window.history !== 'undefined' && typeof window.history.replaceState !== 'undefined';

                testContainer.onload = async () => {
                    const contentWindow = testContainer.contentWindow;
                    if (!contentWindow) {
                        throw new Error('Window not found for iframe');
                    }

                    contentWindow.addEventListener('unhandledrejection', (event) => {
                        console.error(event.reason);
                        throw new Error(`unhandledrejection: ${JSON.stringify(event.reason)}`);
                    });

                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    const canvas: HTMLCanvasElement = await contentWindow.html2canvas(
                        (contentWindow as unknown as {forceElement: HTMLElement}).forceElement ||
                            contentWindow.document.documentElement,
                        {
                            removeContainer: true,
                            backgroundColor: '#ffffff',
                            proxy: 'http://localhost:8081/proxy',
                            ...((contentWindow as unknown as {h2cOptions: unknown}).h2cOptions || {})
                        }
                    );

                    try {
                        (canvas.getContext('2d') as CanvasRenderingContext2D).getImageData(
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        );
                    } catch (e) {
                        throw new Error('Canvas is tainted');
                    }

                    await uploadResults(canvas, url).catch(() => {
                        // screenshot server is optional (only needed for automated reftest comparison)
                    });
                    done();
                };

                testContainer.src = url + '?selenium&run=false&reftest&' + Math.random();
                if (hasHistoryApi) {
                    try {
                        history.replaceState(null, '', url);
                    } catch (e) {}
                }
            });
        });
});

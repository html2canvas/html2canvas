// Karma configuration
// Generated on Sat Aug 05 2017 23:42:26 GMT+0800 (Malay Peninsula Standard Time)

const path = require('path');
const listenAddress = 'localhost';
const port = 9876;

// Use Chromium bundled with puppeteer for local headless runs.
// puppeteer v20+ made executablePath() async; use @puppeteer/browsers
// computeExecutablePath() synchronously instead.
const { computeExecutablePath } = require('@puppeteer/browsers');
const { join } = require('path');
const { homedir } = require('os');
const fs = require('fs');

const puppeteerCacheDir = process.env['PUPPETEER_CACHE_DIR'] ?? join(homedir(), '.cache', 'puppeteer');

// Resolve the Chrome buildId synchronously, without requiring any ESM module.
// Strategy 1: parse the pinned version from puppeteer-core's revisions JS file (regex).
// Strategy 2: pick the most recently installed version from the cache dir.
function getChromeBuildId() {
    // revisions.js is ESM, so parse it with a regex instead of require().
    const revisionCandidates = [
        join(__dirname, 'node_modules/puppeteer/node_modules/puppeteer-core/lib/puppeteer/revisions.js'),
        join(__dirname, 'node_modules/puppeteer-core/lib/puppeteer/revisions.js'),
    ];
    for (const p of revisionCandidates) {
        if (fs.existsSync(p)) {
            try {
                const src = fs.readFileSync(p, 'utf8');
                const m = src.match(/chrome:\s*'([^']+)'/);
                if (m) {
                    return m[1];
                }
            } catch (_) {
                // continue to next candidate
            }
        }
    }
    const chromeCache = join(puppeteerCacheDir, 'chrome');
    if (fs.existsSync(chromeCache)) {
        const versions = fs
            .readdirSync(chromeCache)
            .filter(d => d.startsWith('linux-'))
            .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
        if (versions.length) {
            return versions[0].replace('linux-', '');
        }
    }
    throw new Error(
        'Could not determine Puppeteer Chrome buildId automatically. ' +
            'Set the CHROME_BIN environment variable manually.',
    );
}

process.env.CHROME_BIN = computeExecutablePath({
    cacheDir: puppeteerCacheDir,
    browser: 'chrome',
    buildId: getChromeBuildId(),
});

const log = require('karma/lib/logger').create('launcher:MobileSafari');

module.exports = function (config) {
    // https://github.com/actions/virtual-environments/blob/master/images/macos/macos-10.15-Readme.md
    const launchers = {
        Safari_IOS_15_0: {
            base: 'MobileSafari',
            name: 'iPhone 13',
            platform: 'iOS',
            sdk: '15.0',
        },
        Safari_IOS_15: {
            base: 'MobileSafari',
            name: 'iPhone 13',
            platform: 'iOS',
            sdk: '15.2',
        },
        Safari_IOS_16: {
            base: 'MobileSafari',
            name: 'iPhone 14',
            platform: 'iOS',
            sdk: '16.4',
        },
        Safari_IOS_17: {
            base: 'MobileSafari',
            name: 'iPhone 15',
            platform: 'iOS',
            sdk: '17.0',
        },
        Safari_Stable: {
            base: 'SafariNative',
        },
        Chrome_Stable: {
            base: 'ChromeHeadless',
            flags: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
        Firefox_Stable: {
            base: 'Firefox',
        },
    };

    const ciLauncher = launchers[process.env.TARGET_BROWSER];

    const customLaunchers = ciLauncher
        ? { target_browser: ciLauncher }
        : {
              // stable_chrome and stable_firefox require karma-chrome-launcher /
              // karma-firefox-launcher which are not installed locally.
              // Use ChromeHeadless (puppeteer Chromium) for local runs; CI selects
              // the right browser via TARGET_BROWSER.
              ChromeHeadless_Puppeteer: {
                  base: 'ChromeHeadless',
                  flags: ['--no-sandbox', '--disable-setuid-sandbox'],
              },
          };

    const injectTypedArrayPolyfills = function (files) {
        files.unshift({
            pattern: path.resolve(__dirname, './node_modules/js-polyfills/typedarray.js'),
            included: true,
            served: true,
            watched: false,
        });
    };

    injectTypedArrayPolyfills.$inject = ['config.files'];

    const MobileSafari = function (baseBrowserDecorator, args) {
        if (process.platform !== 'darwin') {
            log.error('This launcher only works in MacOS.');
            this._process.kill();
            return;
        }
        baseBrowserDecorator(this);
        this.on('start', url => {
            // lazy-load iOS simulator deps only when the launcher is actually used
            const simctl = require('node-simctl');
            const iosSimulator = require('appium-ios-simulator');
            simctl
                .getDevices(args.sdk, args.platform)
                .then(devices => {
                    const d = devices.find(d => {
                        return d.name === args.name;
                    });

                    if (!d) {
                        log.error(`No device found for sdk ${args.sdk} with name ${args.name}`);
                        log.info(`Available devices:`, devices);
                        this._process.kill();
                        return;
                    }

                    return iosSimulator
                        .getSimulator(d.udid)
                        .then(device => {
                            return simctl.bootDevice(d.udid).then(() => device);
                        })
                        .then(device => {
                            return device.waitForBoot(60 * 5 * 1000).then(() => {
                                return device.openUrl(url);
                            });
                        });
                })
                .catch(e => {
                    console.log('err,', e);
                });
        });
    };

    MobileSafari.prototype = {
        name: 'MobileSafari',
        DEFAULT_CMD: {
            darwin: '/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app/Contents/MacOS/Simulator',
        },
        ENV_CMD: null,
    };

    MobileSafari.$inject = ['baseBrowserDecorator', 'args'];

    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'build/testrunner.js',
            { pattern: './tests/**/*', watched: true, included: false, served: true },
            { pattern: './dist/**/*', watched: true, included: false, served: true },
            { pattern: './node_modules/**/*', watched: true, included: false, served: true },
        ],

        plugins: [
            'karma-*',
            {
                'launcher:MobileSafari': ['type', MobileSafari],
            },
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['dots', 'junit'],

        junitReporter: {
            outputDir: 'tmp/junit/',
        },

        // web server listen address,
        listenAddress,

        // web server port
        port,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: Object.keys(customLaunchers),

        customLaunchers,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: 5,

        proxies: {
            '/dist': `http://localhost:${port}/base/dist`,
            '/node_modules': `http://localhost:${port}/base/node_modules`,
            '/tests': `http://localhost:${port}/base/tests`,
            '/assets': `http://localhost:${port}/base/tests/assets`,
        },

        captureTimeout: 300000,

        browserDisconnectTimeout: 60000,

        browserNoActivityTimeout: 1200000,
    });
};

// Karma configuration
// Generated on Sat Aug 05 2017 23:42:26 GMT+0800 (Malay Peninsula Standard Time)

const path = require('path');
const simctl = require('node-simctl');
const iosSimulator = require('appium-ios-simulator');
const listenAddress = 'localhost';
const port = 9876;

// Use Chromium bundled with puppeteer for local headless runs
const {executablePath} = require('puppeteer');
process.env.CHROME_BIN = executablePath();

const log = require('karma/lib/logger').create('launcher:MobileSafari');

module.exports = function (config) {
    // https://github.com/actions/virtual-environments/blob/master/images/macos/macos-10.15-Readme.md
    const launchers = {
        Safari_IOS_9: {
            base: 'MobileSafari',
            name: 'iPhone 5s',
            platform: 'iOS',
            sdk: '9.0'
        },
        Safari_IOS_10: {
            base: 'MobileSafari',
            name: 'iPhone 5s',
            platform: 'iOS',
            sdk: '10.0'
        },
        Safari_IOS_12: {
            base: 'MobileSafari',
            name: 'iPhone 5s',
            platform: 'iOS',
            sdk: '12.4'
        },
        Safari_IOS_13: {
            base: 'MobileSafari',
            name: 'iPhone 8',
            platform: 'iOS',
            sdk: '13.7'
        },
        Safari_IOS_14: {
            base: 'MobileSafari',
            name: 'iPhone 8',
            platform: 'iOS',
            sdk: '14.4'
        },
        Safari_IOS_15_0: {
            base: 'MobileSafari',
            name: 'iPhone 13',
            platform: 'iOS',
            sdk: '15.0'
        },
        Safari_IOS_15: {
            base: 'MobileSafari',
            name: 'iPhone 13',
            platform: 'iOS',
            sdk: '15.2'
        },
        Safari_Stable: {
            base: 'SafariNative'
        },
        Chrome_Stable: {
            base: 'ChromeHeadless'
        },
        Firefox_Stable: {
            base: 'Firefox'
        }
    };

    const ciLauncher = launchers[process.env.TARGET_BROWSER];

    const customLaunchers = ciLauncher
        ? {target_browser: ciLauncher}
        : {
              // stable_chrome and stable_firefox require karma-chrome-launcher /
              // karma-firefox-launcher which are not installed locally.
              // Use ChromeHeadless (puppeteer Chromium) for local runs; CI selects
              // the right browser via TARGET_BROWSER.
              ChromeHeadless_Puppeteer: {
                  base: 'ChromeHeadless',
                  flags: ['--no-sandbox', '--disable-setuid-sandbox']
              }
          };

    const injectTypedArrayPolyfills = function (files) {
        files.unshift({
            pattern: path.resolve(__dirname, './node_modules/js-polyfills/typedarray.js'),
            included: true,
            served: true,
            watched: false
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
        this.on('start', (url) => {
            simctl
                .getDevices(args.sdk, args.platform)
                .then((devices) => {
                    const d = devices.find((d) => {
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
                        .then((device) => {
                            return simctl.bootDevice(d.udid).then(() => device);
                        })
                        .then((device) => {
                            return device.waitForBoot(60 * 5 * 1000).then(() => {
                                return device.openUrl(url);
                            });
                        });
                })
                .catch((e) => {
                    console.log('err,', e);
                });
        });
    };

    MobileSafari.prototype = {
        name: 'MobileSafari',
        DEFAULT_CMD: {
            darwin: '/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app/Contents/MacOS/Simulator'
        },
        ENV_CMD: null
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
            {pattern: './tests/**/*', watched: true, included: false, served: true},
            {pattern: './dist/**/*', watched: true, included: false, served: true},
            {pattern: './node_modules/**/*', watched: true, included: false, served: true}
        ],

        plugins: [
            'karma-*',
            {
                'launcher:MobileSafari': ['type', MobileSafari]
            }
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
            outputDir: 'tmp/junit/'
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
            '/assets': `http://localhost:${port}/base/tests/assets`
        },

        captureTimeout: 300000,

        browserDisconnectTimeout: 60000,

        browserNoActivityTimeout: 1200000
    });
};

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['src'],
    moduleNameMapper: {
        '^colorjs\\.io$': '<rootDir>/node_modules/colorjs.io/dist/color.cjs'
    },
    // colorjs.io is an ESM-only package; running with a single worker avoids
    // worker process crashes when the CJS shim is loaded in jest workers.
    maxWorkers: 1
};

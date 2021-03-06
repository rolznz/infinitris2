const webpackConfig = require('./webpack.config');

module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: ['spec/**/*.ts'],
        exclude: [],
        preprocessors: {
            'spec/**/*.ts': ['webpack']
        },
        webpack: {
            module: webpackConfig.module,
            resolve: webpackConfig.resolve,
            mode: webpackConfig.mode
        },
        reporters: ['spec'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ['PhantomJS'],
        autoWatch: process.argv[process.argv.length - 1] === "watch",
        singleRun: process.argv[process.argv.length - 1] !== "watch"
    });
};
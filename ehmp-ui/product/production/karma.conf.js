// Karma configuration
// Generated on Thu Jan 19 2017 14:40:55 GMT-0500 (EST)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine-jquery', 'jasmine', 'requirejs'],

        // list of files / patterns to load in the browser
        files: [
            'config.js',
            'test-main.js',
            {pattern: 'highcharts/highstock.src.js', included: false, served: true},
            {pattern: 'node_modules/jquery/jquery.js', included: false, served: true},
            {pattern: 'node_modules/lodash/index.js', included: false, served: true},
            {pattern: 'node_modules/backbone/backbone.js', included: false, served: true},
            {pattern: '_assets/libs/custom/hbs/handlebars.js', included: false, served: true},
            {pattern: '_assets/libs/custom/hbs/hbs.js', included: false, served: true},
            {pattern: 'moment/moment-2.11.2.min.js', included: false, served: true},
            {pattern: 'node_modules/backbone.marionette/lib/backbone.marionette.js', included: false, served: true},
            {pattern: 'node_modules/jasmine-jquery/lib/jasmine-jquery.js', included: false, served: true},
            {pattern: 'node_modules/async/dist/async.js', included: false, served: true},
            {pattern: '_assets/libs/custom/hbs/hbs/underscore.js', included: false, served: true},
            {pattern: '_assets/libs/custom/hbs/hbs/json2.js', included: false, served: true},
            {pattern: 'test/*.js', included: false, served: true},
            {pattern: 'app/applets/**/*.js', included: false, served: true},
            {pattern: 'app/applets/**/*.html', included: false, served: true},
            {pattern: 'app/resources/**/*.js', included: false, served: true}
        ],


        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'app/applets/**/*.js': ['coverage'],
            'app/resources/**/*.js': ['coverage'],
            'test/*.js': ['coverage']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],

        coverageReporter: {
            type: 'html',
            dir: 'coverage/'
        },

        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            'PhantomJS'
            // 'Chrome'
        ],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    })
}

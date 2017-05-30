// Karma configuration
// Generated on Tue Sep 27 2016 13:08:04 GMT-0400 (EDT)

module.exports = function(config) {

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [
      'jasmine',
      'requirejs'
    ],


    // list of files / patterns to load in the browser
    files: [
      {pattern: 'node_modules/esprima/dist/esprima.js', included: false},
      {pattern: '_assets/**/*.js', included: false},
      {pattern: 'main/**/*.js', included: false},
      {pattern: 'main/**/*.html', included: false},
      {pattern: 'index.html', included: false},
      {pattern: 'api/**/*.js', included: false},
      {pattern: 'test/unit/**/*.js', included: false},
      {pattern: 'requirePlugins.js', included: false},
      {pattern: 'requireUrlArgs.js', included: false},
      {pattern: 'manifest.json', included: false},
      {pattern: 'config.js', included: false},
      {pattern: 'test-main.js', included: true}
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.js': ['coverage']
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
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};

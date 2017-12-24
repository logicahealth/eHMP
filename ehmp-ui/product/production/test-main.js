var allTestFiles = [];
var TEST_REGEXP = /(app\/(applets|resources)).*(test\/unit).*\.js/i;
// var TEST_REGEXP = /.js$/;

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function (file) {
    if (TEST_REGEXP.test(file) && file !== '/base/test-main.js') {
        // Normalize paths to RequireJS module names.
        // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
        // then do not normalize the paths
        var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '');
        allTestFiles.push(normalizedTestModule)
    }
});


require.config({
    baseUrl: '/base'
});

require(['backbone', 'marionette', 'underscore', 'jquery', 'test/stubs'], function (b, m, _, $) {
    window.Backbone = b;
    window.Marionette = m;
    window._ = _;
    window.$ = $;
    require.config({
        deps: allTestFiles,
        'hbs': {
            'templateExtension': 'html',
            'helpers': false,
            'handlebarsPath': 'handlebars'
        },
        callback: window.__karma__.start
    });
});


define('main/ADK', ['test/stubs'], function() {return window.ADK });
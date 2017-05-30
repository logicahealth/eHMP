var _ = require('lodash');
// SCREENS from manifest
var screensFromManifest = require('./app/screens/ScreensManifest.js');
var screensToConcat = [];
screensFromManifest = _.get(screensFromManifest, 'screens');
screensToConcat = _.filter(screensFromManifest, function(screen) {
    return _.get(screen, 'concatenate') !== false;
});
screensToConcat = _.map(screensFromManifest, function(screen) {
    return 'min/screens/' + _.get(screen, 'fileName');
});
// APPLETS from manifest
var appletsFromManifest = require('./app/applets/appletsManifest.js');
var appletsToMinify = [];
appletsFromManifest = _.get(appletsFromManifest, 'applets');
appletsToMinify = _.filter(appletsFromManifest, function(applet) {
    return _.get(applet, 'concatenate') !== false;
});
appletsToMinify = _.map(appletsToMinify, function(applet) {
    return 'min/applets/' + _.get(applet, 'id') + '/applet';
});
// CONTEXTS from manifest
var contextsFromManifest = require('./app/contexts/ContextManifest.js');
var contextsToConcat = [];
contextsFromManifest = _.get(contextsFromManifest, 'contexts');
contextsToConcat = _.filter(contextsFromManifest, function(context) {
    return _.get(context, 'concatenate') !== false;
});
contextsToConcat = _.map(contextsToConcat, function(context) {
    return 'min/contexts/' + _.get(context, 'id') + '/contextAspect';
});
// RESOURCES from manifest
var resourcesFromManifest = require('./app/resources/resourceManifest.js');
var resourcesToConcat = [];
resourcesFromManifest = _.get(resourcesFromManifest, 'resources');
resourcesToConcat = _.filter(resourcesFromManifest, function(resource) {
    return _.get(resource, 'concatenate') !== false;
});
resourcesToConcat = _.map(resourcesToConcat, function(resource) {
    return 'min/resources/' + _.get(resource, 'id') + '/resources';
});
// Base config used for requirejs minify tasks, which should _.extend this
var minifyBaseConfig = {
    baseUrl: '',
    appDir: './app',
    mainConfigFile: "./config.js",
    allowSourceOverwrites: true,
    findNestedDependencies: true,
    generateSourceMaps: false,
    keepBuildDir: false,
    paths: {
        'main/ADK': 'empty:',
        'main/backgrid/customFilter': 'empty:',
        'underscore': 'empty:',
        'jquery': 'empty:',
        'jquery.inputmask': 'empty:',
        'async': 'empty:',
        'backbone': 'empty:',
        'marionette': 'empty:',
        'moment': 'empty:',
        'gridster': 'empty:',
        'crossfilter': 'empty:',
        'highcharts': 'empty:',
        'highcharts-more': 'empty:',
        'bootstrap-datepicker': 'empty:',
        'pattern-fill': 'empty:',
        'grouped_categories': 'empty:',
        'backgrid': 'empty:',
        'pdf': 'empty:',
        'typeahead': 'empty:',
        'jquery.scrollTo': 'empty:'
    },
    optimize: "uglify2",
    //we use compass for this
    optimizeCss: "none",
    //no license comments in our minified files due to source maps
    optimizeAllPluginResources: false,
    preserveLicenseComments: false,
    removeCombined: false,
    throwWhen: {
        optimize: true
    },
    //necessary since we 'use strict' our files
    useStrict: true,
    stubModules: [
        'backbone',
        'marionette',
        'underscore',
        'moment'
    ],
    fileExclusionRegExp: /\.$|build|node_modules\/grunt-contrib-requirejs/,
    "hbs": {
        "templateExtension": "html",
        "helpers": false,
        "handlebarsPath": "handlebars"
    },
    onModuleBundleComplete: function(data) {
        console.log('Concatenation of files into -> ' + data.name + ' COMPLETED');
    },
    done: function(done) {
        // FYI, in done callbacks, done() must be called in order to
        // allow for additional tasks to run after the one with done callback
        // ie. task with: ["requirejs:minifyDev", "another:task"]
        console.log('App minification COMPLETED successfully');
        done();
    }
};

module.exports = function(grunt) {
    'use strict';
    var config = {
        jshint: { // configure the task
            // lint your project's server code
            gruntfile: {
                src: [
                    'Gruntfile.js'
                ],
                directives: {
                    node: true
                },
                options: {}
            },
            server: { // could also specify 'client'
                src: [
                    'app/applets/**/*.js',
                    'app/resources/**/*.js',
                    'app/screens/**.js',
                    '!**/assets/**'
                ],
                directives: {
                    browser: true, // from example for client
                    node: true, // from example for server
                    globals: {
                        // 'jQuery' etc.
                    }
                },
                options: {
                    strict: true,
                    expr: true
                }
            }
        },
        jasmine: {
            app: {
                options: {
                    outfile: "_SpecRunner.html",
                    junit: {
                        path: "test/build/junit-reports"
                    },
                    specs: "app/applets/**/test/unit/**/*.js",
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfigFile: ['config.js']
                    }
                }
            }
        },
        compass: {
            dist: {
                options: {
                    sassDir: 'assets/sass',
                    cssDir: 'assets/css',
                    outputStyle: 'compressed',
                    force: true
                }
            }
        },
        concat: {
            dist: {
                src: ['assets/sass/variables.scss', 'app/applets/**/assets/sass/*.scss'],
                dest: 'assets/sass/applets.scss',
                nonull: true,
                stripBanners: true
            }
        },
        cssmin: {
            my_target: {
                files: [{
                    expand: true,
                    cwd: 'assets/css',
                    src: ['applets.css'],
                    dest: 'assets/css',
                }]
            }
        },
        postcss: {
            options: {
                processors: [
                    require('autoprefixer')({browsers: 'Safari >= 4'})
                ]
            },
            dist: {
                src: 'assets/css/applets.css',
                dest: 'assets/css/applets.css'
            }
        },
        /////////////////////////////////////////////////////////////////////////////////////
        // IMPORTANT: minifyBaseConfig gets extended with requirejs:minifyProd. Therefore, //
        // any modifications to minifyBaseConfig need to take minifyProd into account      //
        /////////////////////////////////////////////////////////////////////////////////////
        requirejs: {
            // TODO ? (if deemed necessary)
            // - use variable for "min" vs "app" cases to increase code re-use
            minifyDev: {
                options: _.extend({}, minifyBaseConfig, {
                    // add new files to concatenate here with ./min as target
                    modules: [{
                        name: './min/applets/applets.min.js',
                        exclude: ['hbs', 'handlebars'],
                        include: appletsToMinify,
                        out: './min/applets/applets.min.js',
                        create: true
                    }, {
                        name: './min/screens/screens.min.js',
                        exclude: [],
                        include: screensToConcat,
                        out: './min/screens/screens.min.js',
                        create: true
                    }, {
                        name: './min/contexts/contexts.min.js',
                        exclude: [],
                        include: contextsToConcat,
                        out: './min/contexts/contexts.min.js',
                        create: true
                    }, {
                        name: './min/resources/resources.min.js',
                        exclude: [],
                        include: resourcesToConcat,
                        out: './min/resources/resources.min.js',
                        create: true
                    }],
                    dir: './min'
                })
            },
            minifyProd: {
                options: _.extend({}, minifyBaseConfig, {
                    // add new files to concatenate here with ./app as target
                    modules: [{
                        name: './app/applets/applets.min.js',
                        exclude: ['hbs', 'handlebars'],
                        include: _.map(appletsToMinify, function(applet) {
                            return applet.replace('min/applets/', 'app/applets/');
                        }),
                        out: './app/applets/applets.min.js',
                        create: true
                    }, {
                        name: './app/screens/screens.min.js',
                        exclude: [],
                        include: _.map(screensToConcat, function(screen) {
                            return screen.replace('min/screens/', 'app/screens/');
                        }),
                        out: './app/screens/screens.min.js',
                        create: true
                    }, {
                        name: './app/contexts/contexts.min.js',
                        exclude: [],
                        include: _.map(contextsToConcat, function(context) {
                            return context.replace('min/contexts/', 'app/contexts/');
                        }),
                        out: './app/contexts/contexts.min.js',
                        create: true
                    }, {
                        name: './app/resources/resources.min.js',
                        exclude: [],
                        include: _.map(resourcesToConcat, function(resource) {
                            return resource.replace('min/resources/', 'app/resources/');
                        }),
                        out: './app/resources/resources.min.js',
                        create: true
                    }],
                    dir: './app',
                    keepBuildDir: 'true'
                })
            }
        }
    };

    grunt.initConfig(config);

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('build', ['jshint', 'concat', 'compass', 'cssmin']);
    grunt.registerTask('prodOptimize', ['build', 'requirejs:minifyProd']);
    grunt.registerTask('optimize', ['build', 'requirejs:minifyDev']);
    grunt.registerTask('test', ['jasmine:app']);

    grunt.task.registerTask('countApplets', 'Count applets in manifest/concatenated/directory', function() {
        var appletsManifest = grunt.file.read('app/applets/appletsManifest.js');

        var manifestApplets = appletsManifest.split('\n').filter(function(line) {
            return line.indexOf('id: ') > -1;
        }).map(function(line) {
            return line.replace(/id:\s*('|")(.*)('|"),*/g, '$2').trim();
        });

        grunt.log.writeln('applets in manifest: ' + manifestApplets.length);
        grunt.log.writeln('--------------------------------------------------');

        var concatenatedApplets = [];
        config.requirejs.minify.options.modules.forEach(function(module) {
            concatenatedApplets.push(module.name.replace(/.*applets\/(.+)\/applet/g, '$1'));
        });

        var duplicateManifestApplets = [];
        manifestApplets.sort().forEach(function(applet) {
            var concatenatedString;
            var duplicatedString = '';
            if (manifestApplets.lastIndexOf(applet) !== manifestApplets.indexOf(applet) && duplicateManifestApplets.indexOf(applet) === -1) {
                duplicateManifestApplets.push(applet);
                duplicatedString = '!!!DUPLICATE';
            }
            concatenatedString = concatenatedApplets.indexOf(applet) > -1 ? '+' : '-';
            grunt.log.writeln('\t' + concatenatedString + ' ' + applet + '\t' + duplicatedString);
        });

        var manifestAppletsNotConcatenated = manifestApplets.filter(function(applet) {
            return concatenatedApplets.indexOf(applet) === -1;
        });

        grunt.log.writeln('\napplets concatenated: ' + concatenatedApplets.length);
        grunt.log.writeln('applets in manifest, not concatenated: ' + manifestAppletsNotConcatenated.length);
        grunt.log.writeln('--------------------------------------------------');

        manifestAppletsNotConcatenated.forEach(function(applet) {
            grunt.log.writeln('\t- ' + applet);
        });

        var directoryApplets = [];

        grunt.file.expand('app/applets/*').forEach(function(path) {
            if (grunt.file.isDir(path) && path.split('app/applets/')[1].charAt(0) !== '_') {
                directoryApplets.push(path.split('app/applets/')[1]);
            }
        });

        grunt.log.writeln('\napplets in directory: ' + directoryApplets.length);

        var directoryAppletsNotInManifest = directoryApplets.filter(function(applet) {
            return manifestApplets.indexOf(applet) === -1;
        });

        grunt.log.writeln('applets in directory, not in manifest: ' + directoryAppletsNotInManifest.length);
        grunt.log.writeln('--------------------------------------------------');

        directoryAppletsNotInManifest.forEach(function(applet) {
            grunt.log.writeln('\t ' + applet);
        });
    });
};

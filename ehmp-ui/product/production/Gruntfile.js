var _ = require('lodash');

module.exports = function (grunt) {
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
                options: {
                }
            },
            server: {  // could also specify 'client'
                src: [
                    'app/applets/**/*.js',
                    'app/screens/**.js',
                    '!**/assets/**'
                ],
                directives: {
                    browser: true,  // from example for client
                    node: true,     // from example for server
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
                        requireConfigFile: ['config.js' ]
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
                src: ['assets/sass/variables.scss', 'app/applets/**/assets/sass/*.scss' ],
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
        //////////////////////////////////////////////////////////////////////////////////
        // IMPORTANT: requirejs:minify gets cloned and modified to requirejs:prodMinify //
        // Therefore, any modifications to minify need to take prodMinify into account  //
        //////////////////////////////////////////////////////////////////////////////////
        requirejs: {
            minify: {
                options: {
                    baseUrl: '',
                    appDir:'./app',
                    dir: './min',
                    mainConfigFile: "./config.js",
                    allowSourceOverwrites: true,
                    done: function(){
                        console.log('Minification completed successfully');
                    },
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
                    modules: [
                        { name: 'min/applets/activeMeds/applet' },
                        { name: 'min/applets/addApplets/applet' },
                        { name: 'min/applets/allergy_grid/applet' },
                        { name: 'min/applets/appointments/applet' },
                        { name: 'min/applets/ccd_grid/applet' },
                        { name: 'min/applets/cds_advice/applet' },
                        { name: 'min/applets/discharge_summary/applet' },
                        { name: 'min/applets/documents/applet' },
                        //{ name: 'min/applets/encounters/applet' },
                        { name: 'min/applets/immunizations/applet' },
                        { name: 'min/applets/lab_results_grid/applet' },
                        { name: 'min/applets/logon/applet' },
                        { name: 'min/applets/medication_review/applet' },
                        { name: 'min/applets/medication_review_v2/applet' },
                        { name: 'min/applets/newsfeed/applet' },
                        { name: 'min/applets/orders/applet' },
                        { name: 'min/applets/patient_search/applet' },
                        { name: 'min/applets/problems/applet' },
                        { name: 'min/applets/reports/applet' },
                        { name: 'min/applets/ssoLogon/applet' },
                        { name: 'min/applets/stackedGraph/applet' },
                        { name: 'min/applets/visit/applet' },
                        { name: 'min/applets/vista_health_summaries/applet' },
                        { name: 'min/applets/vitals/applet' },
                        { name: 'min/applets/vitalsEiE/applet' },
                        { name: 'min/applets/vitalsObservationList/applet' },
                        { name: 'min/applets/workspaceManager/applet' },
                        { name: 'min/applets/action/applet' },
                        { name: 'min/applets/activities/applet' },
                        { name: 'min/applets/esignature/applet'},
                        { name: 'min/applets/global_datepicker/applet' },
                        { name: 'min/applets/military_hist/applet' },
                        { name: 'min/applets/narrative_lab_results_grid/applet' },
                        { name: 'min/applets/notes/applet' },
                        { name: 'min/applets/notifications/applet' },
                        { name: 'min/applets/observations/applet' },
                        { name: 'min/applets/patient_sync_status/applet' },
                        { name: 'min/applets/search/applet' },
                        { name: 'min/applets/task_forms/applet' },
                        { name: 'min/applets/todo_list/applet' },
                        { name: 'min/applets/user_management/applet' },
                        { name: 'min/applets/workspace_context_navigation/applet' },
                        { name: 'min/applets/short_cuts/applet' },
                        { name: 'min/applets/tab_manager/applet' }
                    ],
                    onModuleBundleComplete: function(data) {
                        console.log('Module ' + data.name + ' created successfully!');
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
                    }
                }
            }
        }
    };

    config.requirejs.minify.options.modules.forEach(function(module) {
        module.exclude = ['hbs', 'handlebars'];
    });

    config.requirejs.prodMinify = {
        options: _.cloneDeep(config.requirejs.minify.options)
    };
    config.requirejs.prodMinify.options.dir = "./app";
    config.requirejs.prodMinify.options.keepBuildDir = "true";
    config.requirejs.prodMinify.options.modules.forEach(function(module) {
        module.name = module.name.replace('min/applets/', 'app/applets/');
    });

    grunt.initConfig(config);

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('build', ['jshint', 'concat', 'compass', 'cssmin']);
    grunt.registerTask('prodOptimize', ['build', 'requirejs:prodMinify']);
    grunt.registerTask('optimize', ['build', 'requirejs:minify']);
    grunt.registerTask('test', ['jasmine:app']);

    grunt.task.registerTask('countApplets', 'Count applets in manifest/concatenated/directory', function() {
        var appletsManifest = grunt.file.read('app/applets/appletsManifest.js');

        var manifestApplets = appletsManifest.split('\n').filter(function(line) {
            return line.indexOf('id: ') > -1;
        }).map(function(line) {
            return line.replace(/id:\s*('|")(.*)('|"),*/g, '$2').trim();
        });

        grunt.log.writeln('applets in manifest: '+manifestApplets.length);
        grunt.log.writeln('--------------------------------------------------');

        var concatenatedApplets = [];
        config.requirejs.minify.options.modules.forEach(function(module) {
            concatenatedApplets.push(module.name.replace(/.*applets\/(.+)\/applet/g, '$1'));
        });

        var duplicateManifestApplets = [];
        manifestApplets.sort().forEach(function(applet) {
            var concatenatedString;
            var duplicatedString = '';
            if (manifestApplets.lastIndexOf(applet) !== manifestApplets.indexOf(applet) && duplicateManifestApplets.indexOf(applet) === -1 ) {
                duplicateManifestApplets.push(applet);
                duplicatedString = '!!!DUPLICATE';
            }
            concatenatedString = concatenatedApplets.indexOf(applet) > -1 ? '+' : '-';
            grunt.log.writeln('\t'+concatenatedString+' '+applet+'\t'+duplicatedString);
        });

        var manifestAppletsNotConcatenated = manifestApplets.filter(function(applet) {
            return concatenatedApplets.indexOf(applet) === -1;
        });

        grunt.log.writeln('\napplets concatenated: '+concatenatedApplets.length);
        grunt.log.writeln('applets in manifest, not concatenated: '+manifestAppletsNotConcatenated.length);
        grunt.log.writeln('--------------------------------------------------');

        manifestAppletsNotConcatenated.forEach(function(applet) {
            grunt.log.writeln('\t- '+applet);
        });

        var directoryApplets = [];

        grunt.file.expand('app/applets/*').forEach(function(path) {
            if (grunt.file.isDir(path) && path.split('app/applets/')[1].charAt(0) !== '_') {
                directoryApplets.push(path.split('app/applets/')[1]);
            }
        });

        grunt.log.writeln('\napplets in directory: '+directoryApplets.length);

        var directoryAppletsNotInManifest = directoryApplets.filter(function(applet) {
            return manifestApplets.indexOf(applet) === -1;
        });

        grunt.log.writeln('applets in directory, not in manifest: '+directoryAppletsNotInManifest.length);
        grunt.log.writeln('--------------------------------------------------');

        directoryAppletsNotInManifest.forEach(function(applet) {
            grunt.log.writeln('\t '+applet);
        });
    });
};

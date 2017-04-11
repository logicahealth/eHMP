/*jslint node: true, nomen: true, unparam: true */
/*global jquery, _, $, ADK, Backbone, Backbone.Radio */
'use strict';
require(['requirePlugins'], function() {
    var CONFIG_MANIFEST = 'json!manifest.json!bust';
    require([
        CONFIG_MANIFEST,
    ], function(manifestJSON) {
        var appversion = manifestJSON.overall_version || 0;
        require(['requireUrlArgs'], function(requireUrlArgs) {
            requireUrlArgs.requireConfig(appversion);
            require.config({
                waitSeconds: "30",
                paths: {
                    "async": "_assets/libs/bower/async/async",
                    "backbone": "_assets/libs/bower/backbone/backbone",
                    "backbone.paginator": "_assets/libs/custom/backbone.paginator/backbone.paginator",
                    "backbone.radio": "_assets/libs/bower/backbone/backbone.radio/backbone.radio",
                    "sessionstorage": "_assets/libs/bower/backbone/backbone-sessionStorage/backbone.sessionStorage",
                    "backbone-sorted-collection": "_assets/libs/bower/backbone/backbone-sorted-collection/backbone-sorted-collection",
                    "backgrid-moment-cell": "_assets/libs/bower/backgrid/backgrid-moment-cell/backgrid-moment-cell.min",
                    "backgrid.filter": "_assets/libs/bower/backgrid/backgrid-filter/backgrid-filter.min",
                    "bootstrap-datepicker": "_assets/libs/bower/bootstrap/bootstrap-datepicker/bootstrap-datepicker",
                    "backbone.component": "_assets/libs/bower/backbone/backbone_component/backbone-component.min",
                    "crossfilter": "_assets/libs/bower/crossfilter/crossfilter.min",
                    "fastclick": "_assets/libs/bower/fastclick/fastclick",
                    "highcharts": "_assets/libs/bower/highstock-release/highstock.src",
                    "highcharts-more": "_assets/libs/bower/highstock-release/highcharts-more.src",
                    "pattern-fill": "_assets/libs/bower/pattern-fill/pattern-fill",
                    "grouped_categories": "_assets/libs/bower/grouped_categories/grouped-categories",
                    "jasmine": "_assets/libs/bower/jasmine/jasmine",
                    "jasmine-html": "_assets/libs/bower/jasmine/jasmine-html",
                    "jsondiffpatch": "_assets/libs/bower/jsondiffpatch/jsondiffpatch-full.min",
                    "jquery": "_assets/libs/bower/jquery/jquery.min",
                    "moment": "_assets/libs/bower/moment/moment.min",
                    "underscore": "_assets/libs/bower/lodash/lodash.min", // code requires lodash instead of backbone's underscore
                    "libphonenumber": "_assets/libs/bower/libphonenumberjs/libphonenumber",
                    "puppetForm": "_assets/libs/custom/puppetForm/puppetForm",
                    "handlebars": "_assets/libs/bower/handlebars/handlebars.min",

                    "jquery-ui/core": "_assets/libs/bower/jquery-ui/core",
                    "jquery-ui/mouse": "_assets/libs/bower/jquery-ui/mouse",
                    "jquery-ui/widget": "_assets/libs/bower/jquery-ui/widget",
                    "jquery-ui/draggable": "_assets/libs/bower/jquery-ui/draggable",

                    "mousewheel": "_assets/libs/custom/jScrollPane/jquery.mousewheel",
                    "mwheelIntent": "_assets/libs/custom/jScrollPane/mwheelIntent",
                    "jScrollPane": "_assets/libs/custom/jScrollPane/jquery.jscrollpane",

                    // Require Plugins
                    "text": "_assets/libs/bower/requirejs-text/text",
                    "json": "_assets/libs/bower/requirejs-plugins/json",
                    "css": "_assets/libs/bower/require-css/css",
                    "css-builder": "_assets/libs/bower/require-css/css-builder",
                    "normalize": "_assets/libs/bower/require-css/normalize",

                    // CSS
                    "vendor-css": "_assets/css/vendor",
                    "adk-css": "_assets/css/adk",

                    // involve vendor.scss changes
                    "backgrid": "_assets/libs/bower/backgrid/backgrid.min",
                    "bootstrap": "_assets/libs/bower/bootstrap/bootstrap.min",
                    "bootstrap-timepicker": "_assets/libs/custom/bootstrap/bootstrap-timepicker/bootstrap-timepicker",
                    "gridster": "_assets/libs/custom/gridster/jquery.gridster",
                    "nouislider": "_assets/libs/bower/nouislider/jquery.nouislider.all.min",
                    "bootstrap-notify": "_assets/libs/custom/bootstrap/remarkable-bootstrap-notify/bootstrap-notify",

                    "jds-filter": "_assets/libs/bower/jds-filter/jds-filter.min",
                    "queryString": "_assets/libs/bower/query-string/query-string",

                    // custom libraries (avoid doing this if possible)
                    "hbs": "_assets/libs/custom/hbs/hbs",
                    "bootstrap-tooltip": "_assets/libs/custom/bootstrap/tooltip/bootstrap.min",
                    "backbone.fetch-cache": "_assets/libs/custom/backbone-fetch-cache/backbone.fetch-cache.custom",
                    "backgrid.paginator": "_assets/libs/custom/backgrid/backgrid-paginator-master/backgrid-paginator-custom", // custom pagination
                    "modernizr": "_assets/libs/custom/modernizr/modernizr-2.6.2.min", // actually using custom in index.html
                    "jquery.inputmask": "_assets/libs/custom/jquery.inputmask/jquery.inputmask.bundle",
                    "ie-console-fix": "_assets/libs/custom/ie-console/ie-console-fix",
                    "datejs": "_assets/libs/bower/datejs/date.min",
                    "pdf": "_assets/libs/custom/pdfjs-dist/pdf.min",

                    // Theming

                    // Utilities
                    "jsHelpers": "_assets/js/helpers/helpers",
                    "parser": "core/utilities/parser",

                    // Plugins
                    "typeahead": "_assets/libs/custom/typeahead.js/typeahead.bundle",

                    "select2": "_assets/libs/custom/select2/select2.full",

                    "jasminejquery": "_assets/libs/bower/jasmine-jquery/jasmine-jquery",
                    "jquery.form": "_assets/libs/custom/jquery/plugins/jquery.form.min-20130616",
                    "jquery.formparams": "_assets/libs/custom/jquery/plugins/jquery.formparams",
                    "jquery-datatable": "_assets/libs/custom/jquery/jquery-datatable/jquery.dataTables.min",
                    "jquery-scroll": "_assets/libs/custom/jquery/jquery-scroll/jquery.scrollstart.scrollstop",
                    "jquery.scrollTo": "_assets/libs/bower/jquery.scrollTo/jquery.scrollTo",

                    "marionette": "_assets/libs/custom/marionette/backbone.marionette-2.4.3-custom.min",

                    // Browser detection
                    "bowser": "_assets/libs/bower/bowser/bowser.min",

                    "Init": "main/Init",
                    "ADKApp": "main/ADKApp",
                    "ADK": "main/ADK",
                    "ResourceDirectory": "main/ResourceDirectory",

                    // Test directory
                    "test": "test"
                },
                // Sets the configuration for your third party scripts that are not AMD compatible
                "shim": {
                    "jScrollPane": {
                        "deps": ["jquery", "mwheelIntent", "mousewheel"]
                    },
                    "mwheelIntent": {
                        "deps": ["jquery"]
                    },
                    "mousewheel": {
                        "deps": ["jquery"]
                    },
                    "jquery-datatable": {
                        "deps": ["jquery"]
                    },
                    "typeahead": {
                        "deps": ["jquery"]
                    },
                    "jquery-scroll": {
                        "deps": ["jquery"]
                    },
                    "highcharts": {
                        "deps": ["jquery"],
                        "exports": "Highcharts"
                    },
                    "highcharts-more": {
                        "deps": ["jquery", "highcharts"],
                        "exports": "HighchartsMore"
                    },
                    "pattern-fill": {
                        "deps": ["jquery", "highcharts"]
                    },
                    "grouped_categories": {
                        "deps": ["jquery", "highcharts"]
                    },
                    "backbone": {
                        "deps": ["underscore", "jquery"],
                        "exports": "Backbone"
                    },
                    "backbone.paginator": {
                        "deps": ["backgrid"]
                    },
                    "backbone.radio": {
                        "deps": ["underscore", "jquery", "backbone"],
                        "exports": "Backbone.Radio"
                    },
                    "marionette": {
                        "deps": ["underscore", "backbone", "jquery"],
                        "exports": "Marionette"
                    },
                    "jasmine": {
                        "exports": "jasmine"
                    },
                    "jasmine-html": {
                        "deps": ["jasmine"],
                        "exports": "jasmine"
                    },
                    "jasminejquery": {
                        "deps": ["jasmine"],
                        "exports": "jasminejquery"
                    },
                    "modernizr": {
                        "exports": "modernizr"
                    },
                    "sessionstorage": {
                        "deps": ["backbone", "underscore"]
                    },
                    "backgrid": {
                        "deps": ['backbone', 'jquery', 'underscore'],
                        "exports": "Backgrid"
                    },
                    "backgrid.filter": {
                        "deps": ['backgrid']
                    },
                    "backgrid.paginator": {
                        "deps": ['backgrid']
                    },
                    "backgrid-moment-cell": {
                        "deps": ['backgrid']
                    },
                    "jquery.inputmask": {
                        "deps": ["jquery"]
                    },
                    "bootstrap": {
                        "deps": ["jquery"]
                    },
                    "bootstrap-datepicker": {
                        "deps": ["jquery"]
                    },
                    "bootstrap-timepicker": {
                        "deps": ["jquery"]
                    },
                    "gridster": {
                        "deps": ["jquery"]
                    },
                    "puppetForm": {
                        "deps": ["marionette", "bootstrap"],
                        "exports": "PuppetForm"
                    },
                    "crossfilter": {
                        "deps": [],
                        "exports": "crossfilter"
                    },
                    "libphonenumber": {
                        "exports": "i18n.phonenumbers"
                    }
                },
                // hbs config - must duplicate in Gruntfile.js Require build
                "hbs": {
                    "templateExtension": "html",
                    "helpers": false,
                    "handlebarsPath": "handlebars"
                }
            });

            require([
                'handlebars',
                'main/Init',
                // css files from index
                'css!vendor-css',
                'css!adk-css',
                // other files from index
                '_assets/libs/custom/modernizr/modernizr.custom.min',
                '_assets/libs/custom/webtoolkit-base64/webtoolkit.base64',
                '_assets/libs/custom/webtoolkit-base64/ie-btoa-fix',
                // application files
                'ie-console-fix',
                'bootstrap',
                'bootstrap-datepicker',
                'bootstrap-timepicker',
                'gridster',
                'jScrollPane'
            ], function(Handlebars, Init) {
                window.Handlebars = Handlebars;
                require(['_assets/templates/helpers/_requireHelpers']);

                Init.beforeStart();
            });
        });
    });
});
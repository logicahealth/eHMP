var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function(file) {
    'use strict';
    if (TEST_REGEXP.test(file)) {
        // Normalize paths to RequireJS module names.
        // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
        // then do not normalize the paths
        var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '');
        if (/^test\//.test(normalizedTestModule)) {
            allTestFiles.push(normalizedTestModule);
        }
    }
});

require.config({baseUrl: '/base'});

require([
    'node_modules/esprima/dist/esprima',  // npm install esprima
    '_assets/libs/custom/require/plugins/text!config.js'
], function(esprima, config) {
    'use strict';

    var parsedConfig = parse.findConfig(config, esprima).config;
    // require.config()s merge, so this is redundant, but it's good to keep just in case
    parsedConfig.baseUrl = '/base';
    parsedConfig.deps = allTestFiles;
    parsedConfig.callback = window.__karma__.start;
    require.config(parsedConfig);
});

var parse = (function() {  // taken from r.js
    'use strict';

    //From an esprima example for traversing its ast.
    function traverse(object, visitor) {
        var key, child;

        if (!object) {
            return;
        }

        if (visitor.call(null, object) === false) {
            return false;
        }
        for (key in object) {
            if (object.hasOwnProperty(key)) {
                child = object[key];
                if (typeof child === 'object' && child !== null) {
                    if (traverse(child, visitor) === false) {
                        return false;
                    }
                }
            }
        }
    }

    var parse = {};
    parse.nodeToString = function(contents, node) {
        var range = node.range;
        return contents.substring(range[0], range[1]);
    };

    parse.hasRequire = function(node) {
        var callName,
            c = node && node.callee;

        if (node && node.type === 'CallExpression' && c) {
            if (c.type === 'Identifier' &&
                (c.name === 'require' ||
                c.name === 'requirejs')) {
                //A require/requirejs({}, ...) call
                callName = c.name;
            } else if (c.type === 'MemberExpression' &&
                c.object &&
                c.object.type === 'Identifier' &&
                (c.object.name === 'require' ||
                c.object.name === 'requirejs') &&
                c.property && c.property.name === 'config') {
                // require/requirejs.config({}) call
                callName = c.object.name + 'Config';
            }
        }

        return callName;
    };

    parse.getRequireObjectLiteral = function(node) {
        if (node.id && node.id.type === 'Identifier' &&
            (node.id.name === 'require' || node.id.name === 'requirejs') &&
            node.init && node.init.type === 'ObjectExpression') {
            return node.init;
        }
    };
    parse.getObjectLiteral = function(node) {
        if (node.type && node.type === 'ExpressionStatement' &&
            (node.expression && !node.arguments) &&
            (node.expression.type && node.expression.type === 'ObjectExpression') &&
            (node.expression.properties && node.expression.properties.length > 0) &&
            (node.expression.properties[0].type && node.expression.properties[0].type === 'Property')) {
            return node;
        }
    };
    parse.serializeRequireConfig = function(requireConfig) {
        var funcCounter = 0;
        var funcs = {};

        function isUnserializable(val) {
            var unserializables = [Function, RegExp];
            var typeTests = unserializables.map(function(unserializableType) {
                return val instanceof unserializableType;
            });
            return !!~typeTests.indexOf(true);  // jshint ignore:line
        }

        function generateFunctionId() {
            return '$template-jasmine-require_' + new Date().getTime() + '_' + (++funcCounter);
        }

        var jsonString = JSON.stringify(requireConfig, function(key, val) {
            var funcId;
            if (isUnserializable(val)) {
                funcId = generateFunctionId();
                funcs[funcId] = val;
                return funcId;
            }
            return val;
        }, 2);

        Object.keys(funcs).forEach(function(id) {
            jsonString = jsonString.replace('"' + id + '"', funcs[id].toString());
        });

        return jsonString;
    };
    parse.findConfig = function(fileContents, esprima) {
        var argPropName = 'arguments';

        /*jslint evil: true */
        var jsConfig, foundRange, foundConfig,
            astRoot = esprima.parse(fileContents, {
                range: true
            });

        traverse(astRoot, function(node) {
            var arg,
                requireType = parse.hasRequire(node);

            if (requireType && (requireType === 'require' ||
                requireType === 'requirejs' ||
                requireType === 'requireConfig' ||
                requireType === 'requirejsConfig')) {

                arg = node[argPropName] && node[argPropName][0];

                if (arg && arg.type === 'ObjectExpression') {
                    jsConfig = parse.nodeToString(fileContents, arg);
                    foundRange = arg.range;
                    return false;
                }
            } else {
                arg = parse.getRequireObjectLiteral(node);
                if (arg) {
                    jsConfig = parse.nodeToString(fileContents, arg);
                    foundRange = arg.range;
                    return false;
                } else {
                    arg = parse.getObjectLiteral(node);
                    if (arg) {
                        jsConfig = parse.nodeToString(fileContents, arg);
                        foundRange = arg.range;
                        return false;
                    }
                }
            }
        });

        if (jsConfig) {
            foundConfig = eval('(' + jsConfig + ')');
        }

        return {
            config: foundConfig,
            range: foundRange
        };
    };
    return parse;
})();

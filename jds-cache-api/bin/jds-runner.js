#!/usr/bin/env node
'use strict';
/* eslint-disable no-console */

module.exports.handleCli = handleCli;

const _ = require('lodash');
const path = require('path');
const async = require('async');
const bunyan = require('bunyan');
const bunyanFormat = require('bunyan-format');
const docopt = require('docopt');
const esprima = require('esprima');
const util = require('util');
const doctrine = require('doctrine');
const now = require('performance-now');

const name = path.basename(process.argv[1]);
const usage = `
Usage:
    ${name} allPatientApis      [options] [(--verbose | --short) --raw-logs]
    ${name} allOpDataApis       [options] [(--verbose | --short) --raw-logs]
    ${name} allCrossPatientApis [options] [(--verbose | --short) --raw-logs]
    ${name} <method>            [options] [(--verbose | --short) --raw-logs]
    ${name} <method> --parameters
    ${name} --methods
    ${name} -h | --help
    ${name} --version

Arguments:
    <method>            The method to invoke. See --methods.
    allPatientApis      Run all patient methods.
    allOpDataApis       Run all operational data methods.
    allCrossPatientApis Run all cross-patient methods.

Options:
    --pid=<pid>                     String.
    --icn=<icn>                     String.
    --domain=<domain>               String.
    --index=<index>                 String.
    --collection=<collection>       String.
    --count-name=<count-name>       String.
    --uid=<uid>                     String.
    --params=<params>               Object. Pass like --params='{"limit":5}'
    --template=<template>           String.
    --order=<order>                 String.
    --range=<range>                 String.
    --bail=<bail>                   String.
    --filter=<filter>               String.
    --start=<start>                 Number.
    --limit=<limit>                 Number.
    --start-id=<start-id>           String.
    --return-counts=<return-counts> Boolean.
    --all=<all>                     Boolean. Whether to count across patients.
    -v --verbose    Show the full contents of objects.
    -s --short      Show only the top level of objects.
    -r --raw-logs   Don't pretty-print output.
    --parameters    Show parameters for the chosen method.
    --methods       Show available methods and their parameters.
    -h --help       Show this help.
    --version       Show version.

If the method wants a non-String type, then the options above attempt to be
parsed as JSON.
Example: --params='{"limit":2}'  # JSON.parse('{"limit":2}') -> {limit: 2}
To pass a string surrounded by quote marks, ensure the quote marks
are properly escaped by the shell, like the output of echo '"hi"'
Example: --filter='"hi"'  # becomes "hi"

Environment:
    JDS_IP_ADDRESS
    JDS_TCP_PORT
    JDS_USERNAME    base64-encoded username
    JDS_PASSWORD    base64-encoded password
    JDS_NAMESPACE

Examples:
    ${name} --methods
    ${name} getPtDemographicsByIcn --parameters
    ${name} getPatientCountData --pid='SITE;3' --count-name=collection
    ${name} getPatientCountData --pid='SITE;3' --count-name=collection -v
    ${name} getAllPatientIndexData --index=patient --params='{"filter": "eq(sensitive,false)"}'
`;

if (require.main === module) {
    return main();
}
return; // Everything below must be in a function

/**
 * @return {*}
 */
function main() {
    process.on('uncaughtException', (error) => {
        console.trace('Uncaught Exception\n', error);
        process.exit(1);
    });
    require('../tests/integrationtests/_environment-setup');

    const args = docopt.docopt(usage, {version: '0.1.0'});

    let loggerOptions;
    if (args['--raw-logs']) {
        loggerOptions = {
            name: name,
            level: 'debug'
        };
    } else {
        loggerOptions = {
            name: name,
            level: 'debug',
            stream: bunyanFormat({
                outputMode: 'short',
                // color: false
            })
        };
    }
    global.logger = bunyan.createLogger(loggerOptions);

    // global.logger.info({args});

    const jdsConfig = {
        'ip_address': process.env.JDS_IP_ADDRESS,
        'tcp_port': parseInt(process.env.JDS_TCP_PORT, 10),
        'username': process.env.JDS_USERNAME,
        'password': process.env.JDS_PASSWORD,
        'namespace': process.env.JDS_NAMESPACE
    };

    const excludedMethods = [
        'constructor',
        'childInstance'
    ];

    const methodSuites = {
        allPatientApis: [
            'getPtDemographicsByPid',
            'getPtDemographicsByIcn',
            'getPatientIndexData',
            'getPatientDomainData',
            'getPatientCountData',
            'getPatientDataByPidAndUid'
        ],
        allOpDataApis: [
            'getOperationalDataByUid',
            'getOperationalIndexData',
            'getOperationalDataCount',
            'getOperationalDataCollection'
        ],
        allCrossPatientApis: [
            'getPatientDataByUid',
            'getAllPatientIndexData',
            'getAllPatientDomainData',
            'getAllPatientCountData'
        ]
    };

    const JdsClient = require('../src/jds-client');
    const jdsClientArguments = [global.logger, jdsConfig];

    const methodArgumentMap = {
        pid: args['--pid'],
        icn: args['--icn'],
        domain: args['--domain'],
        index: args['--index'],
        collection: args['--collection'],
        countName: args['--count-name'],
        uid: args['--uid'],
        all: args['--all'],
        params: args['--params'],
        template: args['--template'],
        order: args['--order'],
        range: args['--range'],
        bail: args['--bail'],
        filter: args['--filter'],
        start: args['--start'],
        limit: args['--limit'],
        startId: args['--start-id'],
        returnCounts: args['--return-counts']
    };

    return handleCli(args, JdsClient, jdsClientArguments, excludedMethods, methodSuites, methodArgumentMap);
}

/**
 * @param {object} args
 * @param {function} class_
 * @param {Array}classArguments
 * @param {Array<string>} excludedMethods
 * @param {object<string, Array<string>>} methodSuites
 * @param {object<string, string>} methodArgumentMap
 * @return {*}
 */
function handleCli(args, class_, classArguments, excludedMethods, methodSuites, methodArgumentMap) {
    const method = args['<method>'];
    global.verbose = args['--verbose'];
    global.short = args['--short'];

    for (const suite in methodSuites) {
        if (methodSuites.hasOwnProperty(suite)) {
            if (args[suite]) {
                return runMethodSuite(class_, classArguments, methodSuites[suite], methodArgumentMap);
            }
        }
    }

    if (method) {
        // Validate method
        if (method === 'constructor') {
            global.logger.error('Constructor can not be called directly');
            return process.exit(2);
        }
        if (_.includes(excludedMethods, method)) {
            global.logger.error('Method ' + method + ' is in this tool\'s blacklist');
            return process.exit(2);
        }
        if (!_.has(class_.prototype, method)) {
            global.logger.error('Method ' + method + ' does not exist.');
            // console.log(docopt.DocoptExit.usage);
            return process.exit(3);
        }
    }
    if (args['--parameters']) {
        const methodParameters = prettyPrintMethodParameters(class_, method);
        global.logger.info(methodParameters);
        const methodDestructuredOptions = getMethodDestructuredOptions(class_, method);
        _.each(methodDestructuredOptions, (property, name) => {
            global.logger.info('--%s options:\n%s', safeKebabCase(name), JSON.stringify(property, null, 2));
        });
        return;
    }
    if (args['--methods']) {
        global.logger.info(
            Object.getOwnPropertyNames(class_.prototype)
                .filter(i => !_.includes(excludedMethods, i))
                .map(method => {
                    return method + ': ' + prettyPrintMethodParameters(class_, method);
                })
                .join('\n')
        );
        // global.logger.info(_.functionsIn(class_));  // does not work with es6 methods...
        return;
    }

    return runMethod(class_, classArguments, method, methodArgumentMap);
}

/**
 * @param {function} class_
 * @param {Array} classArguments
 * @param {Array<string>} suite
 * @param {object<string, *>} methodArgumentMap
 */
function runMethodSuite(class_, classArguments, suite, methodArgumentMap) {
    const start = now();
    const methodsWithErrors = [];
    async.eachSeries(suite, (method, callback) => {
        runMethod(class_, classArguments, method, methodArgumentMap, (error) => {
            if (error) {
                methodsWithErrors.push(method);
            }
            return callback();
        });
    }, () => {
        const end = now();
        const elapsed = end - start;
        global.logger.debug({elapsed, start, end}, 'Suite complete. Time (ms)');
        if (!_.isEmpty(methodsWithErrors)) {
            global.logger.error({methodsWithErrors});
        }
    });
}

/**
 * @param {*} class_
 * @param {string} method
 * @return {string}
 */
function prettyPrintMethodParameters(class_, method) {
    let prettyPrintedMethodParameters = getMethodParameters(class_, method)
        .filter(i => i.name !== 'callback') // ignore the callback parameter

        .map(i => { // use-dashes-between-words
            return (i.optional ? '[--' : '--') + safeKebabCase(i.name) + '=' + i.type + (i.optional ? ']' : '');
        })

        .join(' ');
    _.each(getMethodDestructuredOptions(class_, method), (options, name) => {
        // add destructured parameters
        const destructuredParameterFlags = _.map(options, (propertyValue, propertyName) => {
            const property = safeKebabCase(propertyName);
            if (/\[\w+]/.test(JSON.stringify(propertyValue))) {
                return '[--' + property + '=' + stripBrackets(propertyValue) + ']';
            }
            return '--' + property + '=' + (_.isString(propertyValue) ? propertyValue : 'object');
        }).join(' ');
        prettyPrintedMethodParameters += ' (via --' + safeKebabCase(name) + ': ' + destructuredParameterFlags + ')';
    });
    const parametersAreBlank = /^\s*$/.test(prettyPrintedMethodParameters);
    if (parametersAreBlank) {
        return '(no parameters)';
    }
    return prettyPrintedMethodParameters;
}

/**
 * @param {function} class_
 * @param {Array} classArguments
 * @param {string} method
 * @param {object<string, *>} methodArgumentMap
 * @param {function(*)} [callback] Takes an error
 * @return {*}
 */
function runMethod(class_, classArguments, method, methodArgumentMap, callback = _.noop) {
    // strip missing arguments
    // if any arguments are undefined, check creation of methodArgumentMap.
    methodArgumentMap = _.pickBy(methodArgumentMap, value => !_.isNull(value));

    let start = now();
    let instance;
    try {
        instance = new class_(...classArguments);
    } catch (error) {
        global.logger.error(error);
        process.exit(1);
        return;
    }
    let end = now();
    let elapsed = end - start;
    global.logger.debug({elapsed, start, end}, `${class_.name} connection time (ms)`);

    if (!_.isFunction(instance[method])) {
        global.logger.info('Method ' + method + ' does not exist.');
        console.log(docopt.DocoptExit.usage);
        process.exit(3);
        return;
    }

    const inspectOptions = {
        depth: global.verbose ? null : global.short ? 1 : 3,
        maxArrayLength: global.verbose ? null : 10
    };

    const methodArguments = [];
    const methodParameters = getMethodParameters(class_, method);
    const availableDestructuredParams = getMethodDestructuredOptions(class_, method);
    const asynchronous = _.includes(_.map(methodParameters, 'name'), 'callback');

    let inheritedArguments = {};
    let requiredArgumentMissing = false;
    _.each(methodParameters, (parameterType) => {
        const parameter = parameterType.name;
        let argumentPushed = false;
        const parameterIsOptional = parameterType.optional;

        if (_.has(methodArgumentMap, parameter)) {
            let argument = methodArgumentMap[parameter];

            if (parameterType.type !== 'string') {
                try {
                    argument = JSON.parse(argument);
                    global.logger.debug('Parsing argument %s as JSON: %j is becoming %j',
                        parameter,
                        JSON.stringify(argument),
                        argument);
                } catch (error) {
                    // do nothing
                }
            }
            argumentPushed = true;
            methodArguments.push(argument);
        }
        if (parameter === 'callback') {
            argumentPushed = true;
            methodArguments.push((error, response, data) => {
                end = now();
                elapsed = end - start;
                global.logger.debug({elapsed, start, end}, 'Response received. Request time (ms)');
                // response.body has a stringified version of data, which just clutters the output
                if (!_.isEmpty(response)) {
                    delete response.body;
                }
                // Logging with util.inspect allows us to log to a specific depth
                global.logger.info(util.inspect({error, response, data}, inspectOptions));
                return callback();
            });
        }
        if (_.has(availableDestructuredParams, parameter)) {
            // Fill in params properties from other flags.
            const paramsArguments = argumentPushed ? _.last(methodArguments) : {};
            _.each(availableDestructuredParams[parameter], (value, paramPropertyName) => {
                if (_.has(methodArgumentMap, paramPropertyName)) {
                    let argument = methodArgumentMap[paramPropertyName];
                    if (!/^\[?string]?$/.test(value)) {
                        try {
                            argument = JSON.parse(argument);
                            global.logger.debug('Parsing argument %s as JSON: %j is becoming %j',
                                paramPropertyName,
                                JSON.stringify(argument),
                                argument);
                        } catch (error) {
                            // do nothing
                        }
                    }
                    if (_.has(paramsArguments, paramPropertyName)) {
                        global.logger.warn('--%s supplied %s, overriding with --%s',
                            parameter,
                            paramPropertyName,
                            safeKebabCase(paramPropertyName));
                    }
                    paramsArguments[paramPropertyName] = argument;
                    methodArgumentMap[parameter] = paramsArguments;
                    inheritedArguments[paramPropertyName] = true;
                }
            });
            if (!argumentPushed && !_.isEmpty(paramsArguments)) {
                argumentPushed = true;
                methodArguments.push(paramsArguments);
            }
        }
        if (!argumentPushed && parameterIsOptional) {
            global.logger.info('Skipping optional argument: ' + parameter);
        }
        if (!argumentPushed && !parameterIsOptional) {
            global.logger.error('Required argument missing: ' + parameter);
            requiredArgumentMissing = true;
        }
    });

    if (requiredArgumentMissing) {
        return callback(new Error('Required argument missing'));
    }

    const usedMethodArguments = _.without(_.keys(methodArgumentMap), ..._.keys(inheritedArguments));
    const availableMethodArguments = _.without(_.map(methodParameters, 'name'), 'callback');
    const extraArguments = _.difference(usedMethodArguments, availableMethodArguments);
    const missingArguments = _.difference(availableMethodArguments, usedMethodArguments);
    if (_.size(extraArguments) > 0) {
        global.logger.warn({extraArguments}, 'Extra arguments supplied and ignored');
    }
    if (_.size(missingArguments) > 0) {
        global.logger.info({missingArguments}, 'Arguments skipped');
    }

    // global.logger.info(methodParameters);
    global.logger.info('Calling ' + method + '(' + _.map(methodArguments, (argument) => {
        if (_.isFunction(argument)) {
            return 'callback';
        }
        return JSON.stringify(argument);
    }).join(', ') + ')');
    start = now();
    const synchronousResult = instance[method](...methodArguments);
    if (!asynchronous) {
        end = now();
        elapsed = end - start;
        global.logger.debug({elapsed, start, end}, 'Response received. Request time (ms)');
        global.logger.info(util.inspect(synchronousResult, inspectOptions));
        return callback();
    }
}

/**
 * Get the parameter names of a method as an array of strings.
 * If the parameter is a destructuring object, the name will be '<options>'.
 * If the parameter is a rest parameter, the name will be prepended with '...'.
 * If the parameter is optional, it will be surrounded with [square brackets].
 *
 * @param {*} class_ The class to get the method parameters of
 * @param {string} method
 * @return {Array<object>}
 */
function getMethodParameters(class_, method) {
    // Does not work with default parameters:
    // const methodParameters = class_[method]
    //     .toString()
    //     .match(/\(.*?\)/)[0]  // get (arg1, arg2)
    //     .slice(1, -1)  // remove parens
    //     .split(',')  // create array
    //     .map(Function.prototype.call, String.prototype.trim);  // strip whitespace

    const classFile = class_.toString();

    const classAst = esprima.parse(classFile, {attachComment: true});
    const classClassAst = classAst.body[0].body.body;
    // const classClassConstructorAst = _.find(classClassAst, {kind: 'constructor'});
    const classClassMethodAst = _.find(classClassAst, {key: {name: method}});
    let docAst = {};
    const leadingCommentExists = _.get(classClassMethodAst, 'leadingComments[0].value');
    if (leadingCommentExists) {
        docAst = doctrine.parse(_.last(classClassMethodAst.leadingComments).value, {
            unwrap: true, // Remove the /** * */ comment markings
            recoverable: true, // The tool should try to work even if the docs are bad
            sloppy: true // Detect optional parameters delimited by [] - is there another way?
        });
    }
    const parameterDocumentation = {};
    _.each(docAst.tags, (tag) => {
        let type = {};
        parameterDocumentation[tag.name] = type;
        if (tag.type.type === 'OptionalType') {
            type.optional = true;
            type.type = tag.type.expression.name;
        }
        if (tag.type.name) {
            type.type = tag.type.name;
        }
    });

    const classClassMethodParameters = _.map(classClassMethodAst.value.params, (param) => {
        if (param.name) {
            // regular parameter
            // function(a)
            return {
                name: param.name,
                type: _.get(parameterDocumentation[param.name], 'type'),
                optional: _.get(parameterDocumentation[param.name], 'optional', false)};
        }
        if (param.type === 'AssignmentPattern') { // default parameters
            if (param.left.type === 'Identifier') {
                // default value parameter
                // function(a = 'a')
                return {
                    name: param.left.name,
                    type: _.get(parameterDocumentation[param.left.name], 'type'),
                    optional: true};
            }
            if (param.left.type === 'ObjectPattern') {
                // default destructuring assignment parameter
                // function({a, b} = {})
                return {
                    name: '<options>',
                    type: 'object',
                    optional: true};
            }
            return {name: '{unknown}'};
        }
        if (param.type === 'ObjectPattern') {
            // required destructuring assignment parameter
            // function({a, b})
            return {
                name: '<options>',
                type: 'object',
                optional: false};
        }
        if (param.type === 'RestElement') {
            // function(...rest)
            const name = param.argument.name;
            return {
                name: name,
                type: _.get(parameterDocumentation[name], 'type'),
                optional: _.get(parameterDocumentation[name], 'optional', false),
                rest: true};
        }
        return {name: '{unknown}'};
    });
    return classClassMethodParameters;
}

/**
 * Extract the documented supported options of a 'params' object parameter from
 * the method's docblock.
 *
 * @param {*} class_ The class to get the method parameters of
 * @param {string} method
 * @return {object<string, string|object>} key: path, value: type, surrounded with [] if optional
 */
function getMethodDestructuredOptions(class_, method) {
    try {
        const classFile = class_.toString();
        const classAst = esprima.parse(classFile, {attachComment: true});
        const classClassAst = classAst.body[0].body.body;
        const classClassMethodAst = _.find(classClassAst, {key: {name: method}});
        const docAst = doctrine.parse(_.last(classClassMethodAst.leadingComments).value, {
            unwrap: true,
            recoverable: true,
            sloppy: true
        });
        const params = docAst.tags
            .filter(i => /^\w+\./.test(i.name))
            .map(i => {
                return ({
                    root: i.name.match(/^\w+/)[0],
                    path: i.name.replace(/^\w+\./, ''),
                    type: _.get(i, 'type.expression.name', i.type.name),
                    optional: i.type.type === 'OptionalType'
                });}
            )
            .reduce((accumulator, value) => {
                const pathType = accumulator[value.root] || {};
                _.set(pathType, value.path, value.optional ? '[' + value.type + ']' : value.type);
                accumulator[value.root] = pathType;
                return accumulator;
            }, {});
        return params;
    } catch (error) {
        return {};
    }
}

/**
 * Convert fooBarBaz to foo-bar-baz
 * @param {string} string
 * @return {string}
 */
function safeKebabCase(string) {
    // _.kebabCase wipes non-ascii characters like ... or []
    // string.replace(/[A-Z]/, '-$0') doesn't handle ...FooBar or FooBar
    return string.replace(/^[^a-zA-Z]*([A-Z])|([A-Z])/g, (m, p1, p2) => (p1 ? m : '-' + m).toLowerCase());
}

/**
 * Convert [foo] to foo
 * @param {string} string
 * @return {string}
 */
function stripBrackets(string) {
    return string.replace(/^\[|]$/g, '');
}

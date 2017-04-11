'use strict';

var _ = require('lodash');
var fs = require('fs');
var fspath = require('path');
var async = require('async');
var apiBlueprint = require('./api-blueprint');
var http = require('../../utils/http');

describe('API Blueprint resource registration', function() {
    var mountpoint;
    var markdownPath;

    beforeEach(function () {
        mountpoint = '/test/example';
        markdownPath = fspath.resolve(__dirname, '../../resources/_example/example-basic-resource.md');

        apiBlueprint._domains.local.resources.must.be.empty();
    });

    afterEach(function () {
        _.each(_.keys(apiBlueprint._domains), function(key) {
            if (key !== 'local') {
                delete apiBlueprint._domains[key];
            }
        });
        apiBlueprint._domains.local.resources.splice(0, apiBlueprint._domains.local.resources.length);
    });

    it('should register multiple resources with the same mountpoint', function() {
        apiBlueprint.registerResource(mountpoint, markdownPath, false);
        apiBlueprint.registerResource(mountpoint, markdownPath + '/more', false);
        apiBlueprint._domains.local.resources.length.must.equal(2);
    });

    it('should only register one resource once per mountpoint/markdownPath', function() {
        apiBlueprint.registerResource(mountpoint, markdownPath, false);
        apiBlueprint.registerResource(mountpoint, markdownPath, false);
        apiBlueprint._domains.local.resources.length.must.equal(1);
    });

    it('should sort two resources that start with the same mountpoint with the longer one first', function() {
        apiBlueprint.registerResource(mountpoint, markdownPath, false);
        apiBlueprint.registerResource(mountpoint + '/postfix', markdownPath + 'other', false);
        expect(apiBlueprint._domains.local.resources[0].mountpoint).to.equal(mountpoint + '/postfix');
        expect(apiBlueprint._domains.local.resources[1].mountpoint).to.equal(mountpoint);
    });

    // enable this test to check parsing; it's disabled because it takes a long time
    it.skip('should return JSON documentation for a registered resource', function(done) {
        this.timeout(5000);

        apiBlueprint.registerResource(mountpoint, markdownPath, false);

        var expected = require('./api-blueprint-spec-example-docs.json');
        apiBlueprint.jsonDocumentationForPath(mountpoint, function(error, jsonDocs) {
            expect(error).to.be.falsy();
            jsonDocs.must.eql(expected);
            done();
        });
    });

    // enable this test to check parsing; it's disabled because it takes a long time
    it.skip('should return JSON documentation for a registered resource with a path parameter', function(done) {
        this.timeout(5000);

        apiBlueprint.registerResource('/test/:pid/example', markdownPath, false);

        apiBlueprint.jsonDocumentationForPath('/test/9E7A;123/example', function(error, jsonDocs) {
            expect(error).to.be.falsy();
            expect(jsonDocs).to.be.an.object();
            done();
        });
    });

    // enable this test to check parsing; it's disabled because it takes a long time
    it.skip('should return JSON documentation given an inexact path', function(done) {
        apiBlueprint.registerResource(mountpoint, markdownPath, false);

        var expected = require('./api-blueprint-spec-example-docs.json');
        apiBlueprint.jsonDocumentationForPath('/prefix/test/example/suffix', function(error, jsonDocs) {
            expect(error).to.be.falsy();
            jsonDocs.must.eql(expected);
            done();
        });
    });

    // enable this test to check pre-parsing; it's disabled because it takes a long time
    it.skip('should cache and reuse pre-parsed JSON documentation', function(done) {
        this.timeout(5000);

        fs.unlink(apiBlueprint.preparsedJsonPath(markdownPath), function () {
            var parseStart = new Date();

            apiBlueprint.jsonDocumentationFromFile(markdownPath, mountpoint, function(error, jsonDocs) {
                expect(error).to.be.falsy();
                var parseEnd = new Date();

                fs.readFile(apiBlueprint.preparsedJsonPath(markdownPath), { encoding: 'utf8' }, function (error, preparsedJson) {
                    expect(error).to.be.falsy();
                    jsonDocs.must.eql(JSON.parse(preparsedJson));

                    apiBlueprint.jsonDocumentationFromFile(markdownPath, mountpoint, function (error, jsonDocs) {
                        var parseTime = parseEnd.getTime() - parseStart.getTime();
                        var readTime = new Date().getTime() - parseEnd.getTime();
                        expect(readTime).to.be.lt(parseTime / 2);
                        done();
                    });
                });
            });
        });
    });

    // enable this test to check pre-parsing; it's disabled because it takes a long time
    it.skip('should not use cached JSON documentation when the original markdown is updated', function(done) {
        this.timeout(5000);

        var tempMarkdownPath = fspath.resolve('./temp-markdown.md');
        var ws = fs.createWriteStream(tempMarkdownPath);
        ws.on('close', function () {

            apiBlueprint.jsonDocumentationFromFile(tempMarkdownPath, mountpoint, function(error) {
                expect(error).to.be.falsy();

                fs.stat(apiBlueprint.preparsedJsonPath(tempMarkdownPath), function (error, firstStats) {
                    expect(error).to.be.falsy();

                    // change the markdown, triggering a reparse
                    fs.appendFile(tempMarkdownPath, '\n\n', function (error) {
                        expect(error).to.be.falsy();

                        apiBlueprint.jsonDocumentationFromFile(tempMarkdownPath, mountpoint, function (error) {

                            fs.stat(apiBlueprint.preparsedJsonPath(tempMarkdownPath), function (error, lastStats) {
                                expect(error).to.be.falsy();
                                expect(lastStats.mtime.getTime()).to.be.gte(firstStats.mtime.getTime());
                                async.parallel([
                                    fs.unlink.bind(null, tempMarkdownPath),
                                    fs.unlink.bind(null, apiBlueprint.preparsedJsonPath(tempMarkdownPath))
                                ], function () {
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });

        fs.createReadStream(markdownPath).pipe(ws);
    });

    it('should register external resources with a prefix', function() {
        apiBlueprint.registerExternalUrlOnPrefix('http://some.url/path', '/external/');
        apiBlueprint.registerResource(mountpoint, 'http://some.url/path/my/markdown.md', false);
        expect(apiBlueprint._domains.external).to.exist();
        apiBlueprint._domains.external.resources.length.must.equal(1);
    });

    // enable this test to check parsing; it's disabled because it takes a long time
    it.skip('should return JSON documentation for an external registered resource', function(done) {
        this.timeout(5000);

        sinon.stub(http, 'get', function(options, callback) {
            var markdown = '# Group MyGroup\n\n' +
                '## Hello [' + mountpoint + ']';
            callback(null, null, markdown);
        });

        apiBlueprint.registerExternalUrlOnPrefix('http://some.url/path', '/external/');
        apiBlueprint.registerResource(mountpoint, 'http://some.url/path/my/markdown.md', false);

        apiBlueprint.jsonDocumentationForPath('/external' + mountpoint, function(error, jsonDocs) {
            expect(error).to.be.falsy();
            expect(jsonDocs).to.be.an.object();
            expect(jsonDocs.ast.resourceGroups[0].name).to.equal('MyGroup');
            expect(jsonDocs.ast.resourceGroups[0].resources[0].name).to.equal('Hello');
            expect(jsonDocs.ast.resourceGroups[0].resources[0].uriTemplate).to.equal('/test/example');
            done();
        });
    });
});

describe('API Blueprint matchAction', function() {

    var jsonDocs;

    beforeEach(function() {
        jsonDocs = undefined;
    });

    it('should succeed when there are no parameters', function() {
        stubAction('/some/url');
        var expected = expectAction('/some/url');

        var actual = apiBlueprint.matchAction(jsonDocs, '/some/url', 'GET');

        actual.must.eql(expected);
    });

    it('should succeed when there is a trailing slash and none is specified', function() {
        stubAction('/some/url');
        var expected = expectAction('/some/url');

        var actual = apiBlueprint.matchAction(jsonDocs, '/some/url/', 'GET');

        actual.must.eql(expected);
    });

    it('should succeed when there is no trailing slash but one is specified', function() {
        stubAction('/some/url/');
        var expected = expectAction('/some/url/');

        var actual = apiBlueprint.matchAction(jsonDocs, '/some/url', 'GET');

        actual.must.eql(expected);
    });

    it('should not set a paramType on parameters that aren\'t in the uriTemplate', function() {
        stubAction('/some/url', {name: 'q1'});
        var expected = expectAction('/some/url', {name: 'q1', paramType: undefined, explode: undefined});
        delete expected.actualParameters[0].paramType;
        delete expected.actualParameters[0].explode;

        var actual = apiBlueprint.matchAction(jsonDocs, '/some/url', 'GET');

        actual.must.eql(expected);
    });

    it('should set a query paramType', function() {
        stubAction('/some/url{?q1}', {name: 'q1'});
        var expected = expectAction('/some/url{?q1}', {name: 'q1'});

        var actual = apiBlueprint.matchAction(jsonDocs, '/some/url', 'GET');

        actual.must.eql(expected);
    });

    it('should set a path paramType', function() {
        stubAction('/some/url/{q1}', {name: 'q1'});
        var expected = expectAction('/some/url/{q1}', {name: 'q1', paramType: 'path', value: 'hello'});

        var actual = apiBlueprint.matchAction(jsonDocs, '/some/url/hello', 'GET');

        actual.must.eql(expected);
    });

    it('should support "explode" parameters', function() {
        stubAction('/some/url{?q1*}', {name: 'q1'});
        var expected = expectAction('/some/url{?q1*}', {name: 'q1', explode: true});

        var actual = apiBlueprint.matchAction(jsonDocs, '/some/url', 'GET');

        actual.must.eql(expected);
    });

    it('should return undefined when it couldn\'t match the URL', function() {
        stubAction('/some/url{?q1}', {name: 'q1'});
        var actual = apiBlueprint.matchAction(jsonDocs, '/other/url', 'GET');

        expect(actual).to.be.undefined();
    });

    it('should handle reserved path parameters', function() {
        stubAction('/some/url/{+r1}', {name: 'r1'});
        var expected = expectAction('/some/url/{+r1}', {name: 'r1', paramType: 'path', value: ''});

        var actual = apiBlueprint.matchAction(jsonDocs, '/some/url/', 'GET');

        actual.must.eql(expected);
    });

    it('should combine parameters from the resource and action', function() {
        stubResource('/some/url/{p1}', {name: 'p1'});
        stubAction('/some/url/{p1}{?q1}', {name: 'q1'});
        var expected = expectAction('/some/url/{p1}{?q1}', {name: 'p1', paramType: 'path', value: '123'}, {name: 'q1'});

        var actual = apiBlueprint.matchAction(jsonDocs, '/some/url/123', 'GET');

        actual.must.eql(expected);
    });

    it('should override parameters from the resource with those from the action', function() {
        stubResource('/some/url{?q1}', {name: 'q1'});
        stubAction('', {name: 'q1', type: 'number'});
        var expected = expectAction('/some/url{?q1}', {name: 'q1', type: 'number'});

        var actual = apiBlueprint.matchAction(jsonDocs, '/some/url', 'GET');

        actual.must.eql(expected);
    });

    it('should pick the right action based on method', function() {
        stubResource('/some/url');
        stubAction('/some/url{?q1}', {name: 'q1'});
        stubAction('').method = 'POST';

        var expected = expectAction('/some/url');

        var actual = apiBlueprint.matchAction(jsonDocs, '/some/url', 'POST');

        actual.must.eql(expected);
    });

    it('should pick the right action based on URI', function() {
        stubAction('/some/url/path');
        stubAction('/some/url{?q1}', {name: 'q1'});
        var expected = expectAction('/some/url{?q1}', {name: 'q1'});

        var actual = apiBlueprint.matchAction(jsonDocs, '/some/url', 'GET');

        actual.must.eql(expected);
    });


    function stubResource(uriTemplate) {
        var parameters = _.rest(arguments);
        initializeJsonDocs();

        var resource = _.last(_.last(jsonDocs.ast.resourceGroups).resources);
        resource.uriTemplate = uriTemplate;

        _.each(parameters, function(parameter) {
            resource.parameters.push(addParameterDefaults(parameter));
        });

        return resource;
    }

    function stubAction(uriTemplate) {
        var parameters = _.rest(arguments);
        initializeJsonDocs();

        var resource = _.last(_.last(jsonDocs.ast.resourceGroups).resources);
        var action = {
            method: 'GET',
            parameters: [],
            attributes: {
                uriTemplate: ''
            }
        };
        resource.actions.push(action);
        action.attributes.uriTemplate = uriTemplate;

        _.each(parameters, function(parameter) {
            action.parameters.push(addParameterDefaults(parameter));
        });

        return action;
    }

    function initializeJsonDocs() {
        jsonDocs = jsonDocs || {
            ast: {
                resourceGroups: [{
                    resources: [{
                        uriTemplate: '',
                        parameters: [],
                        actions: []
                    }]
                }]
            }
        };
        return jsonDocs;
    }

    function expectAction(uriTemplate) {
        var resourceGroup = _.last(jsonDocs.ast.resourceGroups);
        var resource = _.last(resourceGroup.resources);
        var action = _.extend({
            actualUriTemplate: uriTemplate,
            actualParameters: [],
            resource: resource,
            resourceGroup: resourceGroup
        }, _.last(resource.actions));

        expectParameters.apply(null, [action].concat(_.rest(arguments)));

        return action;
    }

    function expectParameters(action) {
        var parameters = _.map(_.rest(arguments), function(parameter) {
            return addParameterDefaults(parameter, {paramType: 'query', explode: false});
        });
        action.actualParameters = action.actualParameters.concat(parameters);
        return action;
    }

    function addParameterDefaults(parameter, otherProperties) {
        var defaultParameter = {
            type: 'string',
            required: true,
            default: '',
            example: '',
            values: []
        };
        parameter = _.merge(defaultParameter, otherProperties, parameter);
        parameter.values = _.map(parameter.values, function(value) {
            return _.isObject(value) ? value : {value: value};
        });
        return parameter;
    }

});

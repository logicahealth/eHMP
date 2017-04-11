'use strict';

var _ = require('lodash');
var dd = require('drilldown');
var mongo = require('mongoskin');
var appfactory = require('../../core/app-factory');
var cdsSpecUtil = require('../../resources/cds-spec-util/cds-spec-util');
var loadResources = require('../../utils/test-resources-loader');
var buildDescription = loadResources.buildDescription;
var enforcedResourcePermissions = require('./enforced-resource-permissions');

describe('To support PEP,', function() {

    var app = createApp();
    var resources = stubCDSThenLoadResources(app);

    _.each(resources, function(resourceConfigs, filePath) {
        _.each(resourceConfigs, function(resource) {
            var description = buildDescription(resource, resourceConfigs, filePath);

            describe(description, function() {

                it('should define requiredPermissions as an array', function() {
                    expect(resource.requiredPermissions).to.be.an.array();
                });

                it('should define the correct requiredPermissions', function() {
                    if (resource.title in enforcedResourcePermissions) {
                        var httpMethod = _.find(['get', 'post', 'put', 'delete'], function(httpMethod) {
                            return _.has(resource, httpMethod);
                        });
                        if (enforcedResourcePermissions[resource.title][httpMethod]) {
                            var permissionsMatch = _.isEmpty(_.xor(resource.requiredPermissions, enforcedResourcePermissions[resource.title][httpMethod]));
                            expect(permissionsMatch,
                                '\n\tgiven permissions:\t' + resource.requiredPermissions +
                                '\n\tenforced permissions:\t' + enforcedResourcePermissions[resource.title][httpMethod] +
                                '\n\n\tpermissions match?')
                            .to.be.true();
                        }
                    }
                });

                it('should define isPatientCentric as a boolean', function() {
                    expect(resource.isPatientCentric).to.be.a.boolean();
                });

            });
        });
    });
});

function createApp() {
    return {
        config: {
            cdsMongoServer: {
                host: 'foo',
                port: '42'
            },
            cdsInvocationServer: {
                host: 'bar',
                port: '47'
            }
        },
        logger: {
            trace: function() {},
            debug: function() {},
            info: function() {},
            warn: function() {},
            error: function() {}
        }
    };
}

// Why do all this? Because if you don't, the CDS unit tests fail after
// any of their getResourceConfig() method is called.
function stubCDSThenLoadResources(app) {
    var db = cdsSpecUtil.createMockDb({
        find: function(callback) {
            return {
                toArray: function(callback) {
                    callback(null, []);
                }
            };
        },
        insert: function(testJson, callback){
            var echo = [];
            testJson._id = 'mongodb12345678';
            echo.push(testJson);
            callback(null, echo); // can mock a response here...
        },
        update: function(query, update, options, callback){
            callback(null, []);
        },
        ensureIndex: function() {
            return;
        },
        remove: function() {
            return;
        }
    });

    var sandbox = sinon.sandbox.create();
    sandbox.stub(mongo, 'db').returns(db);
    var resources = loadResources(app);
    sandbox.restore();
    return resources;
}

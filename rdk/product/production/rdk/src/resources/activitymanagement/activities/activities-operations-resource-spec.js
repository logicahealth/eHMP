'use strict';
var activityOperationsResource = require('./activities-operations-resource');
var instances = require('./all-instances-resource');
var _ = require('lodash');
var rdk = require('../../../core/rdk');
var httpUtil = rdk.utils.http;
var activityDb = rdk.utils.jbpmDatabase;
var httpMocks = require('node-mocks-http');

describe('Activity Operations Resource', function() {
    var appConfig = {
        config: {
            jdsServer: {
                baseUrl: ''
            }
        }
    };

    function getLogger() {
        return {
            error: function() {

            },
            info: function() {

            },
            debug: function() {

            }
        };
    }

});

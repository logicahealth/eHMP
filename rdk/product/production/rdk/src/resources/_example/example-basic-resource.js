/*
The comments in this annotated file are intentionally verbose for the sake of explaining
what parts of the file mean. In all other files, please only write comments
explaining why something is done, not what something is or how something is
done. The what and how should be explained by variable names.
 */
'use strict';

var rdk = require('../../core/rdk');

// The following line has the jshint ignore comment because the unused app
// variable is passed in to demonstrate that the resource server passes it in.
// Please don't ignore jshint warnings in real code.
function getResourceConfig(app) {  // jshint ignore:line
    // app is available in case you need to build the resource config
    // in a way that depends on app. For example, you might want to get
    // a configuration option from app.config

    // These resource configurations make the following endpoints:
    // POST /<family-path>/test
    // GET /<family-path>/test

    // Use only one HTTP method per resource config object.
    return [{
        name: 'test',  // name of the resource (relative to its family name)
        path: '/test',  // path of the resource (relative to its family path)
        get: sampleGet,  // HTTP GET handler
        interceptors: {
            // Disabling default interceptors is not recommended unless you
            // have a good reason to.
            authentication: false,  // disable the authentication interceptor which is
            // enabled by default and generally a steady requirement
            jdsFilter: true  // enable the jdsFilter interceptor
        },  // incoming middleware
        requiredPermissions: [], //required to be an array of strings for authorization (pep) permissions policy
        isPatientCentric: true, //required to be a boolean for authorization (pep) patient policy
        subsystems: ['jds']  // external data sources that this resource depends on
    }, {
        name: 'test',  // name of the resource (relative to its family name)
        path: '/test',  // path of the resource (relative to its family path)
        post: samplePost,  // HTTP POST handler
        // put: samplePut,  // more than one HTTP method is not supported
        interceptors: {
            jdsFilter: true
        },  // incoming middleware,
        requiredPermissions: ['add-test-permission'], //required to be an array of strings for
        // authorization (pep) permissions policy
        isPatientCentric: true, //required to be a boolean for authorization (pep) patient policy
        subsystems: ['jds']  // external data sources that this resource depends on
    }];
}

function sampleGet(req, res) {
    req.logger.debug('sample resource GET called');

    var myQueryParam = req.query.myQueryParam;
    if(!myQueryParam) {
        req.logger.info('myQueryParam not provided');
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing myQueryParam parameter');
    }

    // default response status is 200
    return res.rdkSend({
        message: 'GET successful'
    });
}

function samplePost(req, res) {
    req.logger.warn('sample resource POST called');
    req.audit.logCategory = 'SAMPLE';

    var optionalParameter = req.body.myPostBodyParam;
    if(optionalParameter) {
        return res.status(200).rdkSend({
            message: optionalParameter
        });
    }
    return res.status(418).rdkSend({
        message: 'Example'
    });
}

module.exports.getResourceConfig = getResourceConfig;

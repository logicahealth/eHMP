'use strict';

//-------------------------------------------------------------------------------------------------
// This is a utility class that provides methods to extract or place content into the http header.
//
// Author: Les Westberg
//-------------------------------------------------------------------------------------------------

var _ = require('underscore');

//-------------------------------------------------------------------------------------------------
// This is the constructor for this class.
//
// log: The logger to be used when logging messages.
//-------------------------------------------------------------------------------------------------
function HttpHeaderUtil(log) {
    this.log = log;
}

//-------------------------------------------------------------------------------------------------
// Extract the referenceInfo data from the http header.
//
// req: The http request object that is given by express.
// returns: referenceInfo - The data that was extracted from the header.
//-------------------------------------------------------------------------------------------------
HttpHeaderUtil.prototype.extractReferenceInfo = function(req) {
    var self = this;
    var referenceInfo = {};

    // If request has nothing we are done.
    //------------------------------------
    if ((_.isEmpty(req)) || (_.isEmpty(req.headers))) {
        return referenceInfo;
    }

    _.each(req.headers, function(value, key) {
       if (key.toLowerCase() === 'x-request-id') {
            referenceInfo.requestId = value;
       } else if (key.toLowerCase() === 'x-session-id') {
           referenceInfo.sessionId = value;
       } else if (key.toLowerCase() === 'x-utility-type') {
           referenceInfo.utilityType = value;
       } else if (key.toLowerCase().indexOf('reference_') === 0) {
           referenceInfo[key.substring(10)] = value;
       }
    });

    self.log.debug('http-header-utils.extractReferenceInfo:  Extracted referenceInfo from the req.headers.  req.headers: %j; referenceInfo: %j', req.headers, referenceInfo);
    return referenceInfo;

};

//-------------------------------------------------------------------------------------------------
// Insert the referenceInfo data from header node of the options object.
//
// options: This is the options object that will be passed to "request" when calling a REST service.
// referenceInfo: The referenceInfo data that will be inserted into the http header.
// returns:  The options that was updated.  Note if options was initially null, it will create and
//           return a new one. If it existed, it will return the handle to the same one that has
//           been updated.
//-------------------------------------------------------------------------------------------------
HttpHeaderUtil.prototype.insertReferenceInfo = function(options, referenceInfo) {
    var self = this;

    // If we were not given a valid options - then create one.
    //---------------------------------------------------------
    options = (_.isObject(options)) ? options : {};
    if (_.isUndefined(options.headers)) {
        options.headers = {};
    }

    // If there is no referenceInfo then we have nothing to insert.  Get out of here...
    //----------------------------------------------------------------------------------
    if (_.isEmpty(referenceInfo)) {
        return options;
    }

    _.each(referenceInfo, function(value, key) {
        if (key === 'sessionId') {
            options.headers['x-session-id'] = value;
        } else if (key === 'requestId') {
            options.headers['x-request-id'] = value;
        } else if (key === 'utilityType'){
            options.headers['x-utility-type'] = value;
        } else {
            options.headers['reference_' + key] = value;
        }
    });

    self.log.debug('http-header-utils.insertReferenceInfo:  Inserted referenceInfo into options.headers.  referenceInfo: %j; options.headers: %j', referenceInfo, options.headers);
    return options;

};

module.exports = HttpHeaderUtil;
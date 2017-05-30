'use strict';

var docUtil = require(global.VX_UTILS + 'doc-utils');
var path = require('path');
var HttpHeaderUtils = require(global.VX_UTILS + 'http-header-utils');

function registerDocAPI(log, config, environment, app) {
    app.get('/documents', getDocument.bind(null, log, config));
}

function getDocument(log, config, request, response) {
    var httpHeaderUtil = new HttpHeaderUtils(log);
    var referenceInfo = httpHeaderUtil.extractReferenceInfo(request);
    var childLog = log.child(referenceInfo);
    var dir = request.param('dir');
    var file = request.param('file');
    if (!dir || !/[a-fA-F0-9]+/.test(dir)) {
        return response.status(400).send('Invalid directory parameter');
    }
    if (!file || !/[a-zA-Z0-9-]+\.[a-z]{3,4}/.test(file)) {
        return response.status(400).send('Invalid file parameter');
    }
    var rootPath = docUtil.getDocOutPath('', config); // specify the root dir
    var filePath = path.join(dir, file);

    response.sendFile(filePath, {
        dotfiles: 'deny',
        root: rootPath
    }, function(err) {
        if (err) {
            childLog.error('document-retrieval-endpoint.getDocument : Error:' + err);
            response.status(err.status).end();
        } else {
            childLog.info('document-retrieval-endpoint.getDocument : Sent:' + filePath);
        }
    });
}

module.exports = registerDocAPI;
module.exports._getDocument = getDocument;
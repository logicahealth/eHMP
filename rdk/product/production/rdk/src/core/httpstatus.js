'use strict';

var _ = require('lodash');

var status = {
    200: 'ok',
    201: 'created',
    202: 'accepted',
    204: 'no_content',
    301: 'moved_permanently',
    303: 'see_other',
    304: 'not_modified',
    307: 'temporary_redirect',
    308: 'permanent_redirect',
    400: 'bad_request',
    401: 'unauthorized',
    403: 'forbidden',
    404: 'not_found',
    406: 'not_acceptable',
    409: 'conflict',
    410: 'gone',
    412: 'precondition_failed',
    415: 'unsupported_media_type',
    500: 'internal_server_error',
    501: 'not_implemented',
    502: 'bad_gateway',
    503: 'service_unavailable'
};

_.each(status, function mapDescriptionToStatusCode(value, key, object) {
    object[value] = _.parseInt(key);
});

module.exports = status;

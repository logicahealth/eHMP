'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');

module.exports.getResourceConfig = function() {
    return [{
        name: 'operational-data-by-uid-getData',
        path: '',
        get: getData,
        description: {
            get: 'Returns operational data by uid'
        },
        interceptors: {
            synchronize: false
        },
        requiredPermissions: ['read-operational-data'],
        isPatientCentric: false,
        subsystems: ['jds', 'jdsSync', 'authorization']
    }];
};

function getData(req, res) {
    var logger = req.logger;
    var appConfig = req.app.config;
    var Uid = req.param('uid');
    var jdsResource = '/data';

    var jdsPath = jdsResource + '/' + Uid;
    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });

    rdk.utils.http.get(options,
        function(err, response, data) {
            if (err) {
                logger.warn({
                    getData: err
                }, 'Error calling the JDS endpoint');
                return res.rdkSend(err);
            }
            if (data.data && data.data.items) {
                //logger.debug({locationByUid: data.data.items});
                return res.rdkSend({
                            data: {
                                items: data.data.items
                            }
                        });
            }
            return res.rdkSend({
                        data: {
                            items: []
                            }
                    });
            }
        );
}

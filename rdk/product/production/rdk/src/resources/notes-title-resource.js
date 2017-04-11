/*jslint node: true */
'use strict';

var _ = require('lodash');
var rdk = require('../core/rdk');
var jdsFilter = require('jds-filter');
var querystring = require('querystring');
var async = require('async');

module.exports.getResourceConfig = function() {
    return [{
        name: 'notes-titles-getUserRecentTitles',
        path: '',
        get: getUserLastTitle,
        description: {
            get: 'Returns the three most recent note titles the user has saved'
        },
        interceptors: {
            synchronize: false
        },
        requiredPermissions: [],
        requiredASUActions: ['ENTRY'],
        isPatientCentric: false,
        subsystems: ['jds', 'jdsSync', 'authorization']
    }];
};

function getUserLastTitle(req, res) {
    req.logger.debug('user = ' + JSON.stringify(req.session.user));
    var user = req.session.user;
    var userUid = 'urn:va:user:' + user.site + ':' + user.duz[user.site];
    var jdsResource = '/vpr/all/index/document-author';
    var jdsQuery = {
        //order: 'lastUpdateTime desc',
        filter: jdsFilter.build([
            ['eq', 'authorUid', userUid],
            ['eq', 'documentClass', 'PROGRESS NOTES']
        ])
    };
    var jdsPath = jdsResource + '?' + querystring.stringify(jdsQuery);

    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });

    var pjdsQuery = {
        filter: jdsFilter.build([
            //['eq', 'authorUid', user.duz[user.site]],
            ['eq', 'authorUid', userUid],
            ['eq', 'siteHash', user.site]
        ])
    };
    var pjdsPath = '/notes/?' + querystring.stringify(pjdsQuery);

    var pjdsoptions = _.extend({}, req.app.config.jdsServer, {
        url: pjdsPath,
        logger: req.logger,
        json: true
    });

    async.parallel({
        jds: function(callback) {
            rdk.utils.http.get(options,
                function(err, response, data) {
                    if (err) {
                        return callback(err);
                    }

                    if (data.data && data.data.items) {
                        return callback(null, data.data.items);
                    }
                    return callback(null, []);
                }
            );
        },
        pjds: function(callback) {
            rdk.utils.http.get(pjdsoptions,
                function(err, response, data) {
                    if (err) {
                        return callback(err);
                    }
                    if (data.items) {
                        return callback(null, data.items);
                    }
                    return callback(null, []);
                }
            );
        }
    }, function(err, results) {
        if (err) {
            return res.rdkSend(err);
        }

        var recentTitles = [];
        var docArray = results.jds.concat(results.pjds);
        var documents = _.chain(docArray).sortBy('lastUpdateTime').reverse().value();

        for (var i = 0; i < documents.length && recentTitles.length < 3; i++) {
            var item = documents[i];
            var title = item.localTitle;
            var duplicate = _.find(recentTitles, function(recentTitle) {
                return recentTitle.documentDefUid === item.documentDefUid;
            });
            if (!duplicate) {
                recentTitles.push({
                    localTitle: item.localTitle,
                    documentDefUid: item.documentDefUid
                });
            }
        }

        return res.rdkSend({
            data: {
                items: recentTitles
            }
        });
    });
}

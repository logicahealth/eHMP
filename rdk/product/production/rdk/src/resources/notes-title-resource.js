'use strict';

var _ = require('lodash');
var rdk = require('../core/rdk');
var jdsFilter = require('jds-filter');
var querystring = require('querystring');
var async = require('async');
var clincialObjectsSubsystem = require('../subsystems/clinical-objects/clinical-objects-subsystem');
var clincialObjectsWrapperNote = require('../subsystems/clinical-objects/clinical-objects-wrapper-note');

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
        requiredPermissions: ['sign-note'],
        requiredASUActions: ['ENTRY'],
        isPatientCentric: false,
        subsystems: ['jds', 'jdsSync', 'authorization']
    }];
};

function getUserLastTitle(req, res) {
    var logger = req.logger;
    var appConfig = req.app.config;
    logger.debug({user: user}, 'user');
    var user = req.session.user;
    var userUid = 'urn:va:user:' + user.site + ':' + user.duz[user.site];
    var jdsResource = '/vpr/all/index/document-author?range=' +userUid;
    var jdsQuery = {
        filter: jdsFilter.build([
            ['eq', 'documentClass', 'PROGRESS NOTES'],
            ['not', ['exists', 'parentUid']]
        ])
    };
    var jdsPath = jdsResource + '&' + querystring.stringify(jdsQuery);

    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });

    var clinicalObjFilter = {
        'authorUid': userUid,
        'domain': 'ehmp-note',
        'subDomain': 'tiu',
        'ehmpState': 'draft'
    };

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
            clincialObjectsSubsystem.find(logger, appConfig, clinicalObjFilter, false, function(err, response) {
                logger.info('clinical object response', response);
                if (err) {
                    if (err[0].toLowerCase().indexOf('not found') > -1) {
                        return callback(null, []);
                    }
                    logger.warn({
                        clincialObjectsSubsystem: err
                    }, 'Error reading notes from pJDS');

                    logger.warn('Failed to read the notes from pJDS.');
                    return callback(err);
                }

                var items = response.items;

                if (!items) {
                    return callback(null, {
                        notes: []
                    });
                }

                var errorMessages = [];
                items = clincialObjectsWrapperNote.returnClinicialObjectData(errorMessages, items);

                if (!_.isEmpty(errorMessages) || !items) {
                    return callback(new Error(errorMessages.toString()));
                }

                return callback(null, items);
            });
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

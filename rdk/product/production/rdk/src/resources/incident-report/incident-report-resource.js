'use strict';

var uuid = require('node-uuid');
var yaml = require('js-yaml');
var _ = require('lodash');
var util = require('util');
var async = require('async');
var fs = require('fs');
var os = require('os');
var path = require('path');
var mkdirp = require('mkdirp');
var rdk = require('../../core/rdk');
var RdkError = rdk.utils.RdkError;

var EHMP_INCIDENT_ID_PREFIX = 'eHMP-IR-';

function getResourceConfig() {
    return [{
        name: 'incident-report',
        path: '',
        post: createIncidentReport,
        requiredPermissions: ['access-general-ehmp'],
        isPatientCentric: false,
        interceptors: {
            synchronize: false
        },
        subsystems: []
    }];
}

function createIncidentReport(req, res) {
    var incidentReportId = EHMP_INCIDENT_ID_PREFIX + uuid.v1();
    res.set('X-eHMP-Incident-Report-Id', incidentReportId);
    req.logger = req.logger.child({incidentReportId: incidentReportId});
    req.logger.debug('Incident id created');
    req.logger.trace({body: req.body});
    var pid = getPatientFromReport(req.body);

    async.parallel({
        metaStampStatus: function(callback) {
            return req.app.subsystems.jdsSync.getPatientStatusDetail(pid, req, function(err, metaStampStatus) {
                if (err) {
                    metaStampStatus = err;
                    req.logger.error(err);
                    req.logger.error('Unable to get patient status detail');
                }
                return callback(null, metaStampStatus);
            });
        },
        syncStatus: function(callback) {
            return req.app.subsystems.jdsSync.getPatientStatus(pid, req, function(err, syncStatus) {
                if (err) {
                    syncStatus = err;
                    req.logger.error(err);
                    req.logger.error('Unable to get patient status');
                }
                return callback(null, syncStatus);
            });
        }
    }, function(err, syncResults) {
        var incidentFileText = formatIncidentFile(req, incidentReportId, syncResults.metaStampStatus, syncResults.syncStatus, true);
        writeIncidentFile(req, incidentReportId, incidentFileText, function(err) {
            if (err) {
                var redactedIncidentFileText = formatIncidentFile(req, incidentReportId, syncResults.metaStampStatus, syncResults.syncStatus, false);
                req.logger.error({incidentText: true}, redactedIncidentFileText);
            }
            var emailConfigurationError = getEmailConfigurationError(req); // Not the most severe error; handle it later
            sendIncidentEmail(req, err, incidentReportId, function(emailSendRdkError) {
                var rdkError; // If there are multiple possible errors, send the most severe error.
                if (err) {
                    if (!(err instanceof RdkError)) {
                        rdkError = new RdkError({
                            code: 'rdk.500.1007',
                            error: err,
                            logger: req.logger
                        });
                    } else {
                        rdkError = err;
                    }
                    return res.status(rdkError.status).rdkSend(rdkError);
                }
                if (emailConfigurationError) {
                    return res.status(emailConfigurationError.status).rdkSend(emailConfigurationError);
                }
                if (emailSendRdkError) {
                    return res.status(emailSendRdkError.status).rdkSend(emailSendRdkError);
                }
                return res.status(200).rdkSend({
                    incidentReportId: incidentReportId
                });
            });
        });
    });
}

function getEmailConfigurationError(req) {
    var toConfigured = _.isString(_.get(req, 'app.config.incidents.notificationEmail.to'));
    var fromConfigured = _.isString(_.get(req, 'app.config.incidents.notificationEmail.from'));
    if (!toConfigured && !fromConfigured) {
        return new RdkError({
            code: 'rdk.500.1015',
            logger: req.logger
        });
    }
    if (!toConfigured) {
        return new RdkError({
            code: 'rdk.500.1018',
            logger: req.logger
        });
    }
    if (!fromConfigured) {
        return new RdkError({
            code: 'rdk.500.1019',
            logger: req.logger
        });
    }
}

function sendIncidentEmail(req, writeError, incidentReportId, callback) {
    var notificationEmailConfig = _.get(req, 'app.config.incidents.notificationEmail');
    var isoDate = parseDateFromUuidV1(incidentReportId.substring(EHMP_INCIDENT_ID_PREFIX.length)).toISOString();
    var subject = isoDate.substring(0, 'YYYY-MM-DD'.length) + ' ' + incidentReportId;
    var body = 'New incident report:\n';
    body += isoDate + ' ' + incidentReportId + '\n';
    body += 'Server hostname: ' + os.hostname() + '\n';
    body += 'Server pid: ' + process.pid + '\n';
    body += 'Server mounted directory: ' + _.get(req, 'app.config.incidents.rootDirectory') + '\n';
    if (writeError) {
        body += '\nWrite error. Incident written to resource server log file.\n';
        body += writeError.toString() + '\n';
        body += '\n';
    }
    req.app.subsystems.email.sendMail(_.extend({}, notificationEmailConfig, {
        subject: subject,
        text: body
    }), function(err, info) {
        if (err) {
            req.logger.error('Error sending incident email');
            req.logger.error(err);
        }
        if (!_.isEmpty(_.get(info, 'rejectedErrors'))) {
            req.logger.error({emailInfo: info});
            return callback(new RdkError({
                code: 'rdk.500.1016',
                logger: req.logger
            }));
        }
        if (info) {
            req.logger.info({emailInfo: info});
        }
        if (err) {
            return callback(new RdkError({
                code: 'rdk.500.1017',
                logger: req.logger
            }));
        }
        return callback();
    });
}

function writeIncidentFile(req, incidentReportId, incidentText, callback) {
    var myMkdirp = arguments[4] || mkdirp;  // for unit testing
    var rootDirectory = _.get(req, 'app.config.incidents.rootDirectory');
    if (!rootDirectory) {
        var rdkError = new RdkError({
            code: 'rdk.500.1008',
            error: 'incidents.rootDirectory must be configured for incident reports to be saved',
            logger: req.logger
        });
        req.logger.error({incidentText: true}, incidentText);
        return callback(rdkError);
    }
    var incidentDate = parseDateFromUuidV1(incidentReportId.substring(EHMP_INCIDENT_ID_PREFIX.length))
        .toISOString() // 2017-01-24T21:03:16.970Z
        .substring(0, 'YYYY-MM-DD'.length);
    var reportPath = path.join(rootDirectory, incidentDate);
    var reportFileName = incidentReportId + '.txt';
    var reportFilePath = path.join(reportPath, reportFileName);

    async.series([
        function ensurePathExists(callback) {
            return myMkdirp(reportPath, function(err) {
                if (err) {
                    var rdkError = new RdkError({
                        code: 'rdk.500.1009',
                        error: err,
                        logger: req.logger
                    });
                    req.logger.error({directory: reportPath}, 'Could not create incident directory');
                    return callback(rdkError);
                }
                return callback();
            });
        },
        function writeFileContents(callback) {
            return fs.writeFile(reportFilePath, incidentText, function(err) {
                if (err) {
                    var rdkError = new RdkError({
                        code: 'rdk.500.1010',
                        error: err,
                        logger: req.logger
                    });
                    req.logger.error({file: reportFilePath}, 'Could not save incident file');
                    return callback(rdkError);
                }
                return callback();
            });
        }
    ], function handler(err) {
        return callback(err);
    });
}

function getPatientFromReport(body) {
    return (
        _.get(body, 'pid') ||
        _.get(body, 'icn')
    );
}

function parseDateFromUuidV1(uuidV1) {
    // uuid v1 counts 100-nanosecond intervals from the adjustment date of the Gregorian calendar
    // date --date='Oct 15, 1582' -u +%s # gives seconds
    // -12219292800 * (1000000000 ns) / 100 = -122192928000000000
    var uuidV1Parts = uuidV1.split('-');
    //                       time_hi_and_version           time_mid         time_low
    var time100Ns = parseInt(uuidV1Parts[2].substring(1) + uuidV1Parts[1] + uuidV1Parts[0], 16);
    var epochTime100Ns = time100Ns - 122192928000000000;
    var epochTimeMs = epochTime100Ns / 10000;
    return new Date(epochTimeMs);
}

/**
 * Create the contents of an incident report text file (in yaml format)
 * Expects req.body to have passed validation from the incident resource
 * @param req
 * @param incidentReportId uuid v1, prefixed with "eHMP-IR-"
 * @param metaStampStatus
 * @param syncStatus
 * @param {boolean} includePhiAndPii
 * @returns {string}
 */
function formatIncidentFile(req, incidentReportId, metaStampStatus, syncStatus, includePhiAndPii) {
    // String concatenation is higher performance than array joining
    // Build yaml in parts to preserve item order
    var incidentText = '';
    incidentText += '--- # eHMP Incident Report\n';
    incidentText += '\n';
    incidentText += '########################\n';
    incidentText += 'Incident Report Context:\n';
    incidentText += '  Incident Report ID: ' + yaml.safeDump(incidentReportId);
    incidentText += '  Date Received: ' + yaml.safeDump(parseDateFromUuidV1(incidentReportId.substring(EHMP_INCIDENT_ID_PREFIX.length)));
    incidentText += '  User UID: ' + yaml.safeDump(_.get(req, 'session.user.uid'));
    incidentText += '  User First Name: ' + formatYamlValueAtIndentationLevel(_.get(req, 'session.user.firstname'), 1);
    incidentText += '  User Last Name: ' + formatYamlValueAtIndentationLevel(_.get(req, 'session.user.lastname'), 1);
    incidentText += '  Session ID: ' + yaml.safeDump(_.get(req, 'session.id'));
    incidentText += '  Incident Report Creation Request ID: ' + yaml.safeDump(req.id);
    incidentText += '  Patient ID: ' + formatYamlValueAtIndentationLevel(getPatientFromReport(req.body), 1);
    incidentText += '\n';
    incidentText += '#############\n';
    incidentText += 'User Comment:\n';
    incidentText += '  ' + formatYamlValueAtIndentationLevel(req.body.comment, 1);
    incidentText += '\n';
    incidentText += '########################\n';
    incidentText += 'Incident Report Summary:\n';
    _.each(req.body.incidents, function(incident, index) {
        incidentText += util.format('  %s: ', index + 1);
        incidentText += formatYamlValueAtIndentationLevel(util.format('%s %s', incident.errorTimestamp, incident.route || _.last(incident.routeHistory) || '(No route specified)'), 1);
    });
    if (_.isEmpty(req.body.incidents)) {
        incidentText += '  (No incident detail provided)';
    }
    if (!_.isEmpty(req.body.incidents)) {
        incidentText += '\n';
        incidentText += '#######################\n';
        incidentText += 'Incident Report Detail:\n';
    }
    _.each(req.body.incidents, function(incident, index) {
        incidentText += '\n';
        incidentText += util.format('  %s:\n', index + 1);
        incidentText += '    Error Timestamp: ' + formatYamlValueAtIndentationLevel(incident.errorTimestamp, 2);
        incidentText += '    Request ID: ' + formatYamlValueAtIndentationLevel(incident.requestId, 2);
        incidentText += '    Error Log ID: ' + formatYamlValueAtIndentationLevel(incident.errorLogId, 2);
        incidentText += '    Route: ' + formatYamlValueAtIndentationLevel(incident.route, 2);
        incidentText += formatHistoryAtIndentationLevel(incident.routeHistory, incident.routeHistoryTimes, 2);
        incidentText += '    Message:\n';
        incidentText += '      ' + formatYamlValueAtIndentationLevel(incident.message.split('\n'), 3);
        incidentText += '    Stack Trace:\n';
        incidentText += '      ' + formatYamlValueAtIndentationLevel(_.get(incident, 'trace', '').split('\n'), 3);
        incidentText += '    Simple Sync Status:  # (from the client, at the time of error)\n';
        incidentText += '      ' + formatJsonValueAtIndentationLevel(incident.simpleSyncStatus, 3);
        var extraIncidentItems = getExtraIncidentItems(includePhiAndPii);
        if (!_.isEmpty(extraIncidentItems)) {
            incidentText += '    ' + formatYamlValueAtIndentationLevel(extraIncidentItems, 3);
        }

        function getExtraIncidentItems(includePhiAndPii) {
            var omittedProperties = [
                'errorTimestamp',
                'requestId',
                'errorLogId',
                'route',
                'routeHistory',
                'routeHistoryTimes',
                'message',
                'trace',
                'simpleSyncStatus'
            ];
            if (!includePhiAndPii) {
                omittedProperties.push('detail'); // known to have PHI / PII
                omittedProperties.push('details'); // known to have PHI / PII
            }
            var extraIncidentItems = _.omit(incident, omittedProperties);
            return extraIncidentItems;
        }
    });

    incidentText += '\n';
    incidentText += '########\n';
    incidentText += 'Tracker:\n';
    incidentText += '  DUZ:\n';
    incidentText += '    ' + formatYamlValueAtIndentationLevel(_.get(req, 'body.tracker.duz'), 2);
    incidentText += '  Site: ' + formatYamlValueAtIndentationLevel(_.get(req, 'body.tracker.site'), 1);
    incidentText += '  Facility: ' + formatYamlValueAtIndentationLevel(_.get(req, 'body.tracker.facility'), 1);
    incidentText += '  Title: ' + formatYamlValueAtIndentationLevel(_.get(req, 'body.tracker.title'), 1);
    incidentText += '  Screen Name: ' + formatYamlValueAtIndentationLevel(_.get(req, 'body.tracker.screenName'), 1);
    incidentText += '  URL Hash: ' + formatYamlValueAtIndentationLevel(_.get(req, 'body.tracker.hash'), 1);
    incidentText += '  URL: ' + formatYamlValueAtIndentationLevel(_.get(req, 'body.tracker.url'), 1);
    incidentText += '  Hostname: ' + formatYamlValueAtIndentationLevel(_.get(req, 'body.tracker.hostname'), 1);
    incidentText += '  Browser appVersion: ' + formatYamlValueAtIndentationLevel(_.get(req, 'body.tracker.appVersion'), 1);
    incidentText += '  Platform: ' + formatYamlValueAtIndentationLevel(_.get(req, 'body.tracker.platform'), 1);
    incidentText += formatHistoryAtIndentationLevel(_.get(req, 'body.tracker.history'), _.get(req, 'body.tracker.historyTimes'), 1);
    var extraTrackerItems = getExtraTrackerItems();
    if (!_.isEmpty(extraTrackerItems)) {
        incidentText += '      ' + formatYamlValueAtIndentationLevel(extraTrackerItems, 3);
    }

    function getExtraTrackerItems() {
        var extraIncidentItems = _.omit(_.get(req, 'body.tracker'), [
            'duz',
            'site',
            'facility',
            'title',
            'screenName',
            'hash',
            'url',
            'hostname',
            'appVersion',
            'appCodeName', // useless - always Mozilla
            'appName', // useless - always Netscape
            'platform',
            'history',
            'historyTimes'
        ]);
        return extraIncidentItems;
    }
    incidentText += '\n';
    incidentText += '###################\n';
    incidentText += 'Simple Sync Status:  # (from the client, at the time of submission):\n';
    incidentText += '  ' + formatJsonValueAtIndentationLevel(req.body.simpleSyncStatus, 1);
    incidentText += '\n';
    incidentText += '##################\n';
    incidentText += 'Meta-Stamp Status:\n';
    incidentText += '  ' + formatJsonValueAtIndentationLevel(metaStampStatus, 1);
    incidentText += '\n';
    incidentText += '############\n';
    incidentText += 'Sync Status:\n';
    incidentText += '  ' + formatJsonValueAtIndentationLevel(syncStatus, 1);


    function formatHistoryAtIndentationLevel(historyArray, historyTimesArray, indentationLevel) {
        var defaultIndentationSize = 2;
        var combinedHistories = getCombinedHistories(historyArray, historyTimesArray);
        var historyText = '';
        var baseIndentation = getNSpaces(indentationLevel * defaultIndentationSize);
        var itemIndentation = getNSpaces((indentationLevel + 1) * defaultIndentationSize);
        if (_.isError(combinedHistories)) {
            if (_.isArray(historyArray)) {
                historyText += 'History:\n';
                historyText += itemIndentation + formatYamlValueAtIndentationLevel(historyArray, indentationLevel + 1);
            }
            if (_.isArray(historyTimesArray)) {
                historyText += 'History Times:\n';
                historyText += itemIndentation + formatYamlValueAtIndentationLevel(historyTimesArray, indentationLevel + 1);
            }
        } else {
            historyText += 'History:\n';
            historyText += itemIndentation + formatYamlValueAtIndentationLevel(combinedHistories, indentationLevel + 1);
        }
        var indentedHistoryText = historyText.replace(/^/, baseIndentation);
        var trimmedHistoryText = indentedHistoryText.trimRight();
        return trimmedHistoryText + '\n';
    }

    function getCombinedHistories(historyArray, historyTimesArray) {
        if (!historyArrayLengthsMatch()) {
            return new Error('history arrays do not match');
        }
        var histories = _.map(historyArray, function(locationItem, index) {
            var unixTimestamp = historyTimesArray[index];
            unixTimestamp = normalizeUnixTimestampToMilliseconds(unixTimestamp);
            var formattedDate;
            try {
                formattedDate = new Date(unixTimestamp).toISOString();
            } catch (ex) {
                // invalid date
                formattedDate = unixTimestamp;
            }
            var historyLine = util.format('%s %s',
                formattedDate,
                locationItem
            );
            return historyLine;
        }).sort();

        function historyArrayLengthsMatch() {
            return (
                _.isArray(historyArray) &&
                _.isArray(historyTimesArray) &&
                _.size(historyArray) === _.size(historyTimesArray)
            );
        }

        return histories;
    }

    return incidentText;
}

function normalizeUnixTimestampToMilliseconds(timestamp) {
    if (!_.isNumber(timestamp)) {
        return timestamp;
    }
    var timestampIsMilliseconds = timestamp / 1000000000000 > 1;
    if (timestampIsMilliseconds) {
        return timestamp;
    } else {  // timestamp is seconds
        return timestamp * 1000;
    }
}

function formatJsonValueAtIndentationLevel(value, indentationLevel) {
    if (_.isUndefined(value)) {
        return 'null\n';
    }
    var defaultIndentationSize = 2;
    var formattedJson = JSON.stringify(value, replaceErrors, defaultIndentationSize);
    var indentedJson = formattedJson.replace(/^/gm, getNSpaces(indentationLevel * defaultIndentationSize));
    var trimmedJson = indentedJson.trim();
    return trimmedJson + '\n';
}

function replaceErrors(key, value) {
    if (value instanceof Error && !(value instanceof RdkError)) {
        var error = {};
        _.each(Object.getOwnPropertyNames(value), function (key) {
            error[key] = value[key];
        });
        return error;
    }
    return value;
}

function formatYamlValueAtIndentationLevel(value, indentationLevel) {
    if (_.isUndefined(value)) {
        return 'null\n';
    }
    var defaultLineMaxWidth = 80;
    var defaultIndentationSize = 2;
    var wrappedYaml = yaml.safeDump(value, {lineWidth: defaultLineMaxWidth - (defaultIndentationSize * indentationLevel)});
    var indentedYaml = wrappedYaml.replace(/^/gm, getNSpaces(indentationLevel * defaultIndentationSize));
    var trimmedYaml = indentedYaml.trim();
    return trimmedYaml + '\n';
}

function getNSpaces(numberOfSpaces) {
    return new Array(numberOfSpaces + 1).join(' ');
}

module.exports.getResourceConfig = getResourceConfig;
module.exports._createIncidentReport = createIncidentReport;
module.exports._formatYamlValueAtIndentationLevel = formatYamlValueAtIndentationLevel;
module.exports._formatJsonValueAtIndentationLevel = formatJsonValueAtIndentationLevel;
module.exports._replaceErrors = replaceErrors;
module.exports._normalizeUnixTimestampToMilliseconds = normalizeUnixTimestampToMilliseconds;
module.exports._parseDateFromUuidV1 = parseDateFromUuidV1;
module.exports._getPatientFromReport = getPatientFromReport;
module.exports._writeIncidentFile = writeIncidentFile;
module.exports._sendIncidentEmail = sendIncidentEmail;
module.exports._isEmailConfigValid = getEmailConfigurationError;

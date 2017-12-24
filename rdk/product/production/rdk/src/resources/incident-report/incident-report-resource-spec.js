'use strict';

var _ = require('lodash');
var async = require('async');
var bunyan = require('bunyan');
var fs = require('fs');
var uuid = require('node-uuid');
var incidentReportResource = require('./incident-report-resource');
var rdk = require('../../core/rdk');
var os = require('os');
var RdkError = rdk.utils.RdkError;

describe('incident-report-resource', function() {
    beforeEach(function() {
        sinon.stub(os, 'platform').callsFake(function() {
            return 'linux';
        });
    });

    describe('getResourceConfig', function() {
        it('returns one object', function() {
            var resourceConfig = incidentReportResource.getResourceConfig();
            expect(resourceConfig).to.have.length(1);
            expect(resourceConfig[0].name).to.equal('incident-report');
        });
        it('has the expected permissions', function() {
            var resourceConfig = incidentReportResource.getResourceConfig();
            expect(resourceConfig).to.have.length(1);
            expect(resourceConfig[0].requiredPermissions).to.eql(['access-general-ehmp']);
        });

    });

    describe('writeIncidentFile', function() {
        it('returns an error when the incident directory is not configured', function(done) {
            var req = {};
            _.set(req, 'app.config', {});
            _.set(req, 'logger', sinon.stub(bunyan.createLogger({name: 'incident-report-resource'})));
            incidentReportResource._writeIncidentFile(req, null, null, function(err) {
                expect(err).to.be.an.error(RdkError);
                expect(err.error).to.match(/incidents.rootDirectory must be configured/);
                expect(err.message).to.match(/Server misconfiguration/);
                done();
            });
        });
        it('returns an error if the directory for the incident can not be created', function(done) {
            var req = {};
            _.set(req, 'app.config.incidents.rootDirectory', '/tmp/incidents');
            _.set(req, 'logger', sinon.stub(bunyan.createLogger({name: 'incident-report-resource'})));
            var incidentReportId = 'eHMP-IR-9c2784b0-e33b-11e6-9326-437f339a0e84'; // new Date(1485375584379); // 2017-01-25T20:19:44.379Z
            function myMkdirp(path, callback) {
                expect(path).to.equal('/tmp/incidents/2017-01-25');
                return callback(new Error('error making directory'));
            }

            sinon.stub(fs, 'readFile').callsFake(function(file, options, callback) {
                return callback(null, [
                    'proc /proc proc rw,relatime 0 0',
                    '/dev/mapper/VolGroup-lv_root / ext4 rw,seclabel,relatime,barrier=1,data=ordered 0 0',
                    '127.0.0.1:/var/log/rdk /tmp/incidents nfs4 rw,relatime,vers=4,rsize=65536,wsize=65536,namlen=255,hard,proto=tcp,port=PORT,timeo=600,retrans=2,sec=sys,clientaddr=127.0.0.1,minorversion=0,local_lock=none,addr=127.0.0.1 0 0'
                ].join('\n'));
            });

            incidentReportResource._writeIncidentFile(req, incidentReportId, 'incident text', function(err) {
                expect(req.logger.error.calledWith(sinon.match.object, 'Could not create incident directory')).to.be.true();
                expect(err).to.be.an.error(RdkError);
                expect(err.message).to.match(/directory permission error/);
                done();
            }, myMkdirp);
        });
        it('returns an error if the incident report file could not be written', function(done) {
            var req = {};
            _.set(req, 'app.config.incidents.rootDirectory', '/tmp/incidents');
            _.set(req, 'logger', sinon.stub(bunyan.createLogger({name: 'incident-report-resource'})));
            var incidentReportId = 'eHMP-IR-9c2784b0-e33b-11e6-9326-437f339a0e84'; // new Date(1485375584379); // 2017-01-25T20:19:44.379Z
            function myMkdirp(path, callback) {
                expect(path).to.equal('/tmp/incidents/2017-01-25');
                return callback();
            }

            sinon.stub(fs, 'readFile').callsFake(function(file, options, callback) {
                return callback(null, [
                    'proc /proc proc rw,relatime 0 0',
                    '/dev/mapper/VolGroup-lv_root / ext4 rw,seclabel,relatime,barrier=1,data=ordered 0 0',
                    '127.0.0.1:/var/log/rdk /tmp/incidents nfs4 rw,relatime,vers=4,rsize=65536,wsize=65536,namlen=255,hard,proto=tcp,port=0,timeo=600,retrans=2,sec=sys,clientaddr=127.0.0.1,minorversion=0,local_lock=none,addr=127.0.0.1 0 0'
                ].join('\n'));
            });

            sinon.stub(fs, 'writeFile').callsFake(function(path, contents, callback) {
                return callback(new Error('error writing file'));
            });

            incidentReportResource._writeIncidentFile(req, incidentReportId, 'incident text', function(err) {
                expect(req.logger.error.calledWith(sinon.match.object, 'Could not save incident file')).to.be.true();
                expect(err).to.be.an.error(RdkError);
                expect(err.message).to.match(/file permission error/);
                done();
            }, myMkdirp);
        });
        it('returns no error if the report was successfully written', function(done) {
            var req = {};
            _.set(req, 'app.config.incidents.rootDirectory', '/tmp/incidents');
            _.set(req, 'logger', sinon.stub(bunyan.createLogger({name: 'incident-report-resource'})));
            var incidentReportId = 'eHMP-IR-9c2784b0-e33b-11e6-9326-437f339a0e84'; // new Date(1485375584379); // 2017-01-25T20:19:44.379Z
            function myMkdirp(path, callback) {
                expect(path).to.equal('/tmp/incidents/2017-01-25');
                return callback();
            }

            sinon.stub(fs, 'readFile').callsFake(function(file, options, callback) {
                return callback(null, [
                    'proc /proc proc rw,relatime 0 0',
                    '/dev/mapper/VolGroup-lv_root / ext4 rw,seclabel,relatime,barrier=1,data=ordered 0 0',
                    '127.0.0.1:/var/log/rdk /tmp/incidents nfs4 rw,relatime,vers=4,rsize=65536,wsize=65536,namlen=255,hard,proto=tcp,port=PORT,timeo=600,retrans=2,sec=sys,clientaddr=127.0.0.1,minorversion=0,local_lock=none,addr=127.0.0.1 0 0'
                ].join('\n'));
            });

            sinon.stub(fs, 'writeFile').callsFake(function(path, contents, callback) {
                expect(path).to.equal('/tmp/incidents/2017-01-25/' + incidentReportId + '.txt');
                expect(contents).to.equal('incident text');
                return callback();
            });
            incidentReportResource._writeIncidentFile(req, incidentReportId, 'incident text', function(err) {
                expect(req.logger.error.called).to.be.false();
                expect(err).to.be.falsy();
                done();
            }, myMkdirp);
        });
    });

    describe('createIncidentReport', function() {
        var requestBody;
        beforeEach(function() {
            requestBody = {
                pid: 'SITE;3',
                incidents: [{
                    simpleSyncStatus: {},
                    errorTimestamp: '2017-01-18T18:04:40.229Z',
                    message: 'Example Log Line',
                    errorLogId: '',
                    requestId: 'cd229052-a3ea-49c4-b0e2-4de0e2863734'
                }],
                tracker: {
                    screenName: 'summary',
                    hash: '#/patient/summary',
                    hostname: 'IP         ',
                    url: 'https://IP         /#/patient/summary',
                    appCodeName: 'Mozilla',
                    appName: 'Netscape',
                    appVersion: '5.0 (Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET4.0C; .NET4.0E; rv:11.0) like Gecko',
                    platform: 'Win32',
                    facility: 'PANORAMA',
                    duz: {'SITE': '3'},
                    site: 'SITE',
                    title: 'Clinician',
                    pid: '',
                    icn: '',
                    history: ['/staff/provider-centric-view', '/patient/summary'],
                    historyTimes: [1484762636811, 1484762677444]
                }
            };
        });

        it('creates a child logger with the incident id', function(done) {
            var myUuid = 'eefcf960-e3de-11e6-82bd-bfc89d917fbf';
            sinon.stub(uuid, 'v1').callsFake(function() {
                return myUuid;
            });
            var req = {};
            _.set(req, 'body.incidents', []);
            _.set(req, 'logger.child', function(object) {
                expect(object).to.eql({incidentReportId: 'eHMP-IR-' + myUuid});
                return sinon.stub(bunyan.createLogger({name: 'incident-report-resource-spec'}));
            });
            _.set(req, 'app.subsystems.jdsSync.getPatientStatusDetail', function() {
                done();
            });
            _.set(req, 'app.subsystems.jdsSync.getPatientStatus', function() {
            });
            var res = {};
            res.set = function() {
            };
            incidentReportResource._createIncidentReport(req, res);
        });
        it('logs info when the patient status detail could not be fetched', function(done) {
            var myUuid = 'eefcf960-e3de-11e6-82bd-bfc89d917fbf';
            sinon.stub(uuid, 'v1').callsFake(function() {
                return myUuid;
            });
            var req = {};
            req.id = '543';
            _.set(req, 'logger.child', function(object) {
                expect(object).to.eql({incidentReportId: 'eHMP-IR-' + myUuid});
                var logger = sinon.stub(bunyan.createLogger({name: 'incident-report-resource-spec'}));
                return logger;
            });
            _.set(req, 'body.pid', 'SITE;1234');
            _.set(req, 'session.user', {
                uid: 'urn:va:user:SITE:1',
                firstname: 'JOHN',
                lastname: 'DOE'
            });
            _.set(req, 'session.id', '1234');
            _.set(req, 'body', requestBody);
            _.set(req, 'app.config.incidents.rootDirectory', '/tmp/foo');
            var fetchError = new Error('could not be fetched');
            _.set(req, 'app.subsystems.jdsSync.getPatientStatusDetail', function(pid, req, callback) {
                expect(pid).to.eql(req.body.pid);
                callback(fetchError);
            });
            _.set(req, 'app.subsystems.jdsSync.getPatientStatus', function(pid, req, callback) {
                return callback();
            });
            _.set(req, 'app.config.incidents.notificationEmail.to', 'root@localhost');
            _.set(req, 'app.config.incidents.notificationEmail.from', 'nobody@localhost');
            _.set(req, 'app.subsystems.email.sendMail', function(config, callback) {
                return callback();
            });
            sinon.stub(fs, 'writeFile').callsFake(function(path, contents, callback) {
                expect(contents).to.contain('"message": "could not be fetched"');
                return callback();
            });
            var res = {};
            res.status = function(code) {
                expect(code).to.eql(200);
                return this;
            };
            res.rdkSend = function(body) {
                done();
            };
            res.set = function() {
            };
            incidentReportResource._createIncidentReport(req, res);
        });
        it('logs info when the patient status could not be fetched', function(done) {
            var myUuid = 'eefcf960-e3de-11e6-82bd-bfc89d917fbf';
            sinon.stub(uuid, 'v1').callsFake(function() {
                return myUuid;
            });
            var req = {};
            req.id = '543';
            _.set(req, 'logger.child', function(object) {
                expect(object).to.eql({incidentReportId: 'eHMP-IR-' + myUuid});
                var logger = sinon.stub(bunyan.createLogger({name: 'incident-report-resource-spec'}));
                return logger;
            });
            _.set(req, 'body.pid', 'SITE;1234');
            _.set(req, 'session.user', {
                uid: 'urn:va:user:SITE:1',
                firstname: 'JOHN',
                lastname: 'DOE'
            });
            _.set(req, 'session.id', '1234');
            _.set(req, 'body', requestBody);
            _.set(req, 'app.config.incidents.rootDirectory', '/tmp/foo');
            var fetchError = new Error('could not be fetched');
            _.set(req, 'app.subsystems.jdsSync.getPatientStatus', function(pid, req, callback) {
                expect(pid).to.eql(req.body.pid);
                callback(fetchError);
            });
            _.set(req, 'app.subsystems.jdsSync.getPatientStatusDetail', function(pid, req, callback) {
                return callback();
            });
            _.set(req, 'app.config.incidents.notificationEmail.to', 'root@localhost');
            _.set(req, 'app.config.incidents.notificationEmail.from', 'nobody@localhost');
            _.set(req, 'app.subsystems.email.sendMail', function(config, callback) {
                return callback();
            });
            sinon.stub(fs, 'writeFile').callsFake(function(path, contents, callback) {
                expect(contents).to.contain('"message": "could not be fetched"');
                return callback();
            });
            var res = {};
            res.status = function(code) {
                expect(code).to.eql(200);
                return this;
            };
            res.rdkSend = function(body) {
                expect(body).to.eql({
                    incidentReportId: 'eHMP-IR-' + myUuid
                });
                done();
            };
            res.set = function() {
            };
            incidentReportResource._createIncidentReport(req, res);
        });
        it('logs an error when unable to write the incident file', function(done) {
            var myUuid = 'eefcf960-e3de-11e6-82bd-bfc89d917fbf';
            sinon.stub(uuid, 'v1').callsFake(function() {
                return myUuid;
            });
            var req = {};
            req.id = '543';
            _.set(req, 'logger.child', function(object) {
                expect(object).to.eql({incidentReportId: 'eHMP-IR-' + myUuid});
                var logger = sinon.stub(bunyan.createLogger({name: 'incident-report-resource-spec'}));
                return logger;
            });
            _.set(req, 'session.user', {
                uid: 'urn:va:user:SITE:1',
                firstname: 'JOHN',
                lastname: 'DOE'
            });
            _.set(req, 'session.id', '1234');
            _.set(req, 'body', requestBody);
            _.set(req, 'app.subsystems.jdsSync.getPatientStatusDetail', function(pid, req, callback) {
                expect(pid).to.eql(req.body.pid);
                return callback();
            });
            _.set(req, 'app.subsystems.jdsSync.getPatientStatus', function(pid, req, callback) {
                return callback();
            });
            _.set(req, 'app.config.incidents.rootDirectory', '/tmp/incidents');
            _.set(req, 'app.subsystems.email.sendMail', function(config, callback) {
                return callback();
            });
            sinon.stub(async, 'series').callsFake(function(tasks, handler) {
                expect(tasks).to.have.length(2);
                return tasks[1](function(err) {
                    expect(err).to.be.an.error(RdkError);
                    expect(err.logged).to.be.true();
                    return handler(err);
                });
            });
            sinon.stub(fs, 'writeFile').callsFake(function(path, contents, callback) {
                return callback('could not write');
            });
            var res = {};
            res.status = function(code) {
                expect(code).to.eql(500);
                return this;
            };
            res.rdkSend = function(body) {
                expect(req.logger.error.calledWithMatch({incidentText: true}, sinon.match.string)).to.be.true();
                expect(body).to.be.an.error();
                expect(req.logger.error.calledWith(body)).to.be.true();
                expect(body.code).to.eql('200.500.1010');
                done();
            };
            res.set = function() {
            };
            incidentReportResource._createIncidentReport(req, res);
        });
        it('logs a redacted version to the rdk log file when unable to write the incident file', function(done) {
            var myUuid = 'eefcf960-e3de-11e6-82bd-bfc89d917fbf';
            sinon.stub(uuid, 'v1').callsFake(function() {
                return myUuid;
            });
            var req = {};
            req.id = '543';
            _.set(req, 'logger.child', function(object) {
                expect(object).to.eql({incidentReportId: 'eHMP-IR-' + myUuid});
                var logger = sinon.stub(bunyan.createLogger({name: 'incident-report-resource-spec'}));
                return logger;
            });
            _.set(req, 'session.user', {
                uid: 'urn:va:user:SITE:1',
                firstname: 'JOHN',
                lastname: 'DOE'
            });
            _.set(req, 'session.id', '1234');
            requestBody.incidents[0].detail = {sensitiveA: true};
            requestBody.incidents[0].details = {sensitiveB: true};
            _.set(req, 'body', requestBody);
            _.set(req, 'app.subsystems.jdsSync.getPatientStatusDetail', function(pid, req, callback) {
                expect(pid).to.eql(req.body.pid);
                return callback();
            });
            _.set(req, 'app.subsystems.jdsSync.getPatientStatus', function(pid, req, callback) {
                return callback();
            });
            _.set(req, 'app.config.incidents.rootDirectory', '/tmp/incidents');
            _.set(req, 'app.subsystems.email.sendMail', function(config, callback) {
                return callback();
            });
            sinon.stub(async, 'series').callsFake(function(tasks, handler) {
                expect(tasks).to.have.length(2);
                return tasks[1](function(err) {
                    expect(err).to.be.an.error(RdkError);
                    expect(err.logged).to.be.true();
                    return handler(err);
                });
            });
            sinon.stub(fs, 'writeFile').callsFake(function(path, contents, callback) {
                expect(contents).to.match(/sensitiveA/);
                expect(contents).to.match(/sensitiveB/);
                return callback('could not write');
            });
            var res = {};
            res.status = function(code) {
                expect(code).to.eql(500);
                return this;
            };
            res.rdkSend = function(body) {
                expect(req.logger.error.calledWithMatch({incidentText: true}, sinon.match.string)).to.be.true();
                expect(req.logger.error.getCall(2).args[1]).to.match(/--- # eHMP Incident Report/);
                expect(req.logger.error.getCall(2).args[1]).not.to.match(/sensitiveA/);
                expect(req.logger.error.getCall(2).args[1]).not.to.match(/sensitiveB/);
                expect(body).to.be.an.error();
                expect(req.logger.error.calledWith(body)).to.be.true();
                expect(body.code).to.eql('200.500.1010');
                done();
            };
            res.set = function() {
            };
            incidentReportResource._createIncidentReport(req, res);
        });
        it('logs an error when email configuration is missing "to"', function(done) {
            var myUuid = 'eefcf960-e3de-11e6-82bd-bfc89d917fbf';
            sinon.stub(uuid, 'v1').callsFake(function() {
                return myUuid;
            });
            var req = {};
            req.id = '543';
            _.set(req, 'logger.child', function(object) {
                expect(object).to.eql({incidentReportId: 'eHMP-IR-' + myUuid});
                var logger = sinon.stub(bunyan.createLogger({name: 'incident-report-resource-spec'}));
                return logger;
            });
            _.set(req, 'session.user', {
                uid: 'urn:va:user:SITE:1',
                firstname: 'JOHN',
                lastname: 'DOE'
            });
            _.set(req, 'app.config.incidents.rootDirectory', '/tmp/foo');
            _.set(req, 'session.id', '1234');
            _.set(req, 'body', requestBody);
            _.set(req, 'app.subsystems.jdsSync.getPatientStatusDetail', function(pid, req, callback) {
                expect(pid).to.eql(req.body.pid);
                return callback();
            });
            _.set(req, 'app.subsystems.jdsSync.getPatientStatus', function(pid, req, callback) {
                expect(pid).to.eql(req.body.pid);
                return callback();
            });
            _.set(req, 'app.config.incidents.notificationEmail.from', 'nobody@localhost');
            _.set(req, 'app.subsystems.email.sendMail', function(config, callback) {
                return callback();
            });
            sinon.stub(async, 'series').callsFake(function(tasks, handler) {
                return handler();
            });
            var res = {};
            res.status = function(code) {
                expect(code).to.eql(500);
                return this;
            };
            res.rdkSend = function(body) {
                expect(body).to.be.an.error();
                expect(req.logger.error.calledWith(body)).to.be.true();
                expect(body.code).to.eql('200.500.1018');
                done();
            };
            res.set = function() {
            };
            incidentReportResource._createIncidentReport(req, res);
        });
        it('logs an error when email configuration is missing "from"', function(done) {
            var myUuid = 'eefcf960-e3de-11e6-82bd-bfc89d917fbf';
            sinon.stub(uuid, 'v1').callsFake(function() {
                return myUuid;
            });
            var req = {};
            req.id = '543';
            _.set(req, 'logger.child', function(object) {
                expect(object).to.eql({incidentReportId: 'eHMP-IR-' + myUuid});
                var logger = sinon.stub(bunyan.createLogger({name: 'incident-report-resource-spec'}));
                return logger;
            });
            _.set(req, 'session.user', {
                uid: 'urn:va:user:SITE:1',
                firstname: 'JOHN',
                lastname: 'DOE'
            });
            _.set(req, 'app.config.incidents.rootDirectory', '/tmp/foo');
            _.set(req, 'session.id', '1234');
            _.set(req, 'body', requestBody);
            _.set(req, 'app.subsystems.jdsSync.getPatientStatusDetail', function(pid, req, callback) {
                expect(pid).to.eql(req.body.pid);
                return callback();
            });
            _.set(req, 'app.subsystems.jdsSync.getPatientStatus', function(pid, req, callback) {
                expect(pid).to.eql(req.body.pid);
                return callback();
            });
            _.set(req, 'app.config.incidents.notificationEmail.to', 'nobody@localhost');
            _.set(req, 'app.subsystems.email.sendMail', function(config, callback) {
                return callback();
            });
            sinon.stub(async, 'series').callsFake(function(tasks, handler) {
                return handler();
            });
            var res = {};
            res.status = function(code) {
                expect(code).to.eql(500);
                return this;
            };
            res.rdkSend = function(body) {
                expect(body).to.be.an.error();
                expect(req.logger.error.calledWith(body)).to.be.true();
                expect(body.code).to.eql('200.500.1019');
                done();
            };
            res.set = function() {
            };
            incidentReportResource._createIncidentReport(req, res);
        });
        it('logs an error when email configuration is missing "to" and "from"', function(done) {
            var myUuid = 'eefcf960-e3de-11e6-82bd-bfc89d917fbf';
            sinon.stub(uuid, 'v1').callsFake(function() {
                return myUuid;
            });
            var req = {};
            req.id = '543';
            _.set(req, 'logger.child', function(object) {
                expect(object).to.eql({incidentReportId: 'eHMP-IR-' + myUuid});
                var logger = sinon.stub(bunyan.createLogger({name: 'incident-report-resource-spec'}));
                return logger;
            });
            _.set(req, 'session.user', {
                uid: 'urn:va:user:SITE:1',
                firstname: 'JOHN',
                lastname: 'DOE'
            });
            _.set(req, 'app.config.incidents.rootDirectory', '/tmp/foo');
            _.set(req, 'session.id', '1234');
            _.set(req, 'body', requestBody);
            _.set(req, 'app.subsystems.jdsSync.getPatientStatusDetail', function(pid, req, callback) {
                expect(pid).to.eql(req.body.pid);
                return callback();
            });
            _.set(req, 'app.subsystems.jdsSync.getPatientStatus', function(pid, req, callback) {
                expect(pid).to.eql(req.body.pid);
                return callback();
            });
            _.set(req, 'app.config.incidents.notificationEmail', {});
            _.set(req, 'app.subsystems.email.sendMail', function(config, callback) {
                return callback();
            });
            sinon.stub(async, 'series').callsFake(function(tasks, handler) {
                return handler();
            });
            var res = {};
            res.status = function(code) {
                expect(code).to.eql(500);
                return this;
            };
            res.rdkSend = function(body) {
                expect(body).to.be.an.error();
                expect(req.logger.error.calledWith(body)).to.be.true();
                expect(body.code).to.eql('200.500.1015');
                done();
            };
            res.set = function() {
            };
            incidentReportResource._createIncidentReport(req, res);
        });
        it('logs an error when notification recipient rejected the email', function(done) {
            var myUuid = 'eefcf960-e3de-11e6-82bd-bfc89d917fbf';
            sinon.stub(uuid, 'v1').callsFake(function() {
                return myUuid;
            });
            var req = {};
            req.id = '543';
            _.set(req, 'logger.child', function(object) {
                expect(object).to.eql({incidentReportId: 'eHMP-IR-' + myUuid});
                var logger = sinon.stub(bunyan.createLogger({name: 'incident-report-resource-spec'}));
                return logger;
            });
            _.set(req, 'session.user', {
                uid: 'urn:va:user:SITE:1',
                firstname: 'JOHN',
                lastname: 'DOE'
            });
            _.set(req, 'app.config.incidents.rootDirectory', '/tmp/foo');
            _.set(req, 'session.id', '1234');
            _.set(req, 'body', requestBody);
            _.set(req, 'app.subsystems.jdsSync.getPatientStatusDetail', function(pid, req, callback) {
                expect(pid).to.eql(req.body.pid);
                return callback();
            });
            _.set(req, 'app.subsystems.jdsSync.getPatientStatus', function(pid, req, callback) {
                expect(pid).to.eql(req.body.pid);
                return callback();
            });
            _.set(req, 'app.config.incidents.notificationEmail.to', 'root@localhost');
            _.set(req, 'app.config.incidents.notificationEmail.from', 'nobody@localhost');
            _.set(req, 'app.subsystems.email.sendMail', function(config, callback) {
                return callback(null, {
                    rejectedErrors: [
                        'foo'
                    ]
                });
            });
            sinon.stub(async, 'series').callsFake(function(tasks, handler) {
                return handler();
            });
            var res = {};
            res.status = function(code) {
                expect(code).to.eql(500);
                return this;
            };
            res.rdkSend = function(body) {
                expect(body).to.be.an.error();
                expect(req.logger.error.calledWith(body)).to.be.true();
                expect(body.code).to.eql('200.500.1016');
                done();
            };
            res.set = function() {
            };
            incidentReportResource._createIncidentReport(req, res);
        });
        it('logs an error when notification email send attempt failed', function(done) {
            var myUuid = 'eefcf960-e3de-11e6-82bd-bfc89d917fbf';
            sinon.stub(uuid, 'v1').callsFake(function() {
                return myUuid;
            });
            var req = {};
            req.id = '543';
            _.set(req, 'logger.child', function(object) {
                expect(object).to.eql({incidentReportId: 'eHMP-IR-' + myUuid});
                var logger = sinon.stub(bunyan.createLogger({name: 'incident-report-resource-spec'}));
                return logger;
            });
            _.set(req, 'session.user', {
                uid: 'urn:va:user:SITE:1',
                firstname: 'JOHN',
                lastname: 'DOE'
            });
            _.set(req, 'app.config.incidents.rootDirectory', '/tmp/foo');
            _.set(req, 'session.id', '1234');
            _.set(req, 'body', requestBody);
            _.set(req, 'app.subsystems.jdsSync.getPatientStatusDetail', function(pid, req, callback) {
                expect(pid).to.eql(req.body.pid);
                return callback();
            });
            _.set(req, 'app.subsystems.jdsSync.getPatientStatus', function(pid, req, callback) {
                expect(pid).to.eql(req.body.pid);
                return callback();
            });
            _.set(req, 'app.config.incidents.notificationEmail.to', 'root@localhost');
            _.set(req, 'app.config.incidents.notificationEmail.from', 'nobody@localhost');
            _.set(req, 'app.subsystems.email.sendMail', function(config, callback) {
                return callback(new Error('nodemailer error'));
            });
            sinon.stub(async, 'series').callsFake(function(tasks, handler) {
                return handler();
            });
            var res = {};
            res.status = function(code) {
                expect(code).to.eql(500);
                return this;
            };
            res.rdkSend = function(body) {
                expect(body).to.be.an.error();
                expect(req.logger.error.calledWith(body)).to.be.true();
                expect(body.code).to.eql('200.500.1017');
                done();
            };
            res.set = function() {
            };
            incidentReportResource._createIncidentReport(req, res);
        });
        it('responds with the incident id on success', function(done) {
            var myUuid = 'eefcf960-e3de-11e6-82bd-bfc89d917fbf';
            sinon.stub(uuid, 'v1').callsFake(function() {
                return myUuid;
            });
            var req = {};
            req.id = '543';
            _.set(req, 'logger.child', function(object) {
                expect(object).to.eql({incidentReportId: 'eHMP-IR-' + myUuid});
                var logger = sinon.stub(bunyan.createLogger({name: 'incident-report-resource-spec'}));
                return logger;
            });
            _.set(req, 'session.user', {
                uid: 'urn:va:user:SITE:1',
                firstname: 'JOHN',
                lastname: 'DOE'
            });
            _.set(req, 'app.config.incidents.rootDirectory', '/tmp/foo');
            _.set(req, 'session.id', '1234');
            _.set(req, 'body', requestBody);
            _.set(req, 'app.subsystems.jdsSync.getPatientStatusDetail', function(pid, req, callback) {
                expect(pid).to.eql(req.body.pid);
                return callback();
            });
            _.set(req, 'app.subsystems.jdsSync.getPatientStatus', function(pid, req, callback) {
                expect(pid).to.eql(req.body.pid);
                return callback();
            });
            _.set(req, 'app.config.incidents.notificationEmail.to', 'root@localhost');
            _.set(req, 'app.config.incidents.notificationEmail.from', 'nobody@localhost');
            _.set(req, 'app.subsystems.email.sendMail', function(config, callback) {
                return callback();
            });
            sinon.stub(async, 'series').callsFake(function(tasks, handler) {
                return handler();
            });
            var res = {};
            res.status = function(code) {
                expect(code).to.eql(200);
                return this;
            };
            res.rdkSend = function(body) {
                expect(body).to.eql({
                    incidentReportId: 'eHMP-IR-' + myUuid
                });
                done();
            };
            res.set = function() {
            };
            incidentReportResource._createIncidentReport(req, res);
        });
    });

    describe('parseDateFromUuidV1', function() {
        it('parses a date from a valid uuid v1', function() {
            var uuidv1A = 'eefcf960-e3de-11e6-82bd-bfc89d917fbf';
            var uuidv1B = '3d19b980-e3e9-11e6-82bd-bfc89d917fbf';
            var dateA = incidentReportResource._parseDateFromUuidV1(uuidv1A);
            var dateB = incidentReportResource._parseDateFromUuidV1(uuidv1B);
            expect(dateA.getTime()).to.eql(1485445731318);
            expect(dateB.getTime()).to.eql(1485450157336);
        });
    });

    describe('normalizeUnixTimestampToMilliseconds', function() {
        it('converts a second-based unix timestamp to a millisecond-based unix timestamp', function() {
            var input = 1485450339;
            var expected = 1485450339000;
            var actual = incidentReportResource._normalizeUnixTimestampToMilliseconds(input);
            expect(actual).to.equal(expected);
        });
        it('leaves a millisecond-based unix timestamp alone', function() {
            var input = 1485450505000;
            var actual = incidentReportResource._normalizeUnixTimestampToMilliseconds(input);
            expect(actual).to.equal(input);
        });
    });

    describe('replaceErrors', function() {
        it('ignores things that aren\'t Errors', function() {
            var notAnError = {};
            var handled = incidentReportResource._replaceErrors('key', notAnError);
            expect(handled).to.be(notAnError);
        });
        it('ignores RdkErrors', function() {
            var rdkError = new RdkError(new Error('test error'));
            var handled = incidentReportResource._replaceErrors('key', rdkError);
            expect(handled).to.be(rdkError);
        });
        it('converts Errors', function() {
            var error = new Error('test error');
            var handled = incidentReportResource._replaceErrors('key', error);
            expect(_.isObject(handled)).to.be(true);
            expect(_.keys(handled)).to.eql(['stack', 'message']);
            expect(handled.message).to.be('test error');
        });
    });

    describe('formatJsonValueAtIndentationLevel', function() {
        it('adds indentation to lines after the first line', function() {
            var json = {a: 'a', b: 'b'};
            var formattedJson = incidentReportResource._formatJsonValueAtIndentationLevel(json, 2);
            var lines = formattedJson.split('\n');
            var firstLine = lines.shift();
            expect(firstLine).to.equal('{'); // no indentation to first line
            var lastLine = lines.pop();
            expect(lastLine).to.equal(''); // final newline
            _.each(lines, function(line) {
                expect(line).to.match(/    .*/); // 2 spaces = 1 level of indentation
            });
        });
        it('does not indent one-line results', function() {
            var json = {};
            var formattedJson = incidentReportResource._formatJsonValueAtIndentationLevel(json, 2);
            var lines = formattedJson.split('\n');
            var firstLine = lines.shift();
            expect(firstLine).to.equal('{}'); // no indentation to first line
            var lastLine = lines.pop();
            expect(lastLine).to.equal(''); // final newline
        });
    });

    describe('formatYamlValueAtIndentationLevel', function() {
        it('adds indentation to lines after the first line', function() {
            var json = {a: 'a', b: 'b'};
            var formattedYaml = incidentReportResource._formatYamlValueAtIndentationLevel(json, 2);
            var lines = formattedYaml.split('\n');
            var firstLine = lines.shift();
            expect(firstLine).to.equal('a: a'); // no indentation to first line
            var lastLine = lines.pop();
            expect(lastLine).to.equal(''); // final newline
            _.each(lines, function(line) {
                expect(line).to.match(/    .*/); // 2 spaces = 1 level of indentation
            });
        });
        it('does not indent one-line results', function() {
            var json = 'my single line';
            var formattedYaml = incidentReportResource._formatYamlValueAtIndentationLevel(json, 2);
            var lines = formattedYaml.split('\n');
            var firstLine = lines.shift();
            expect(firstLine).to.equal('my single line'); // no indentation to first line
            var lastLine = lines.pop();
            expect(lastLine).to.equal(''); // final newline
        });
        it('wraps long input to the correct indentation level', function() {
            var json = 'my single line my single line my single line my single line my single line my single line my single line my single line';
            var formattedYaml = incidentReportResource._formatYamlValueAtIndentationLevel(json, 2);
            var lines = formattedYaml.split('\n');
            var firstLine = lines.shift();
            expect(firstLine).to.equal('>-'); // no indentation to first line
            var lastLine = lines.pop();
            expect(lastLine).to.equal(''); // final newline
            expect(lines).to.have.length(2);
            _.each(lines, function(line) {
                expect(line).to.match(/    .*/); // 2 spaces = 1 level of indentation
            });

        });
    });

    describe('getPatientFromReport', function() {
        it('uses body.pid if available', function() {
            var body = {};
            body.pid = '123';
            body.icn = '234';
            var patient = incidentReportResource._getPatientFromReport(body);
            expect(patient).to.equal(body.pid);
        });
        it('uses body.icn if body.pid is unavailable', function() {
            var body = {};
            body.icn = '234';
            var patient = incidentReportResource._getPatientFromReport(body);
            expect(patient).to.equal(body.icn);
        });
        it('returns undefined if no pid is available', function() {
            var body = {};
            var patient = incidentReportResource._getPatientFromReport(body);
            expect(patient).to.be.undefined();
        });
    });
});

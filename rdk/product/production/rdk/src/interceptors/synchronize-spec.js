'use strict';

var _ = require('lodash');
var moment = require('moment');
// var jdsSync = require('../subsystems/jds/jds-sync-subsystem');
var synchronize = require('./synchronize');


describe('synchronize.js', function() {
    describe('isPid()', function() {
        it('tests that a valid pid passes', function() {
            expect(synchronize._isPid('9E7A;3')).to.equal(true);
        });
        it('tests that an invalid pid fails', function() {
            expect(synchronize._isPid()).to.equal(false);
            expect(synchronize._isPid(null)).to.equal(false);
            expect(synchronize._isPid('')).to.equal(false);
            expect(synchronize._isPid('10108V420871')).to.equal(false);
            expect(synchronize._isPid('9E7A;')).to.equal(false);
            expect(synchronize._isPid(';3')).to.equal(false);
            expect(synchronize._isPid('DOD;1234')).to.equal(false);
        });
    });

    describe('isIcn()', function() {
        it('tests that a valid icn passes', function() {
            expect(synchronize._isIcn('10108V420871')).to.equal(true);
        });
        it('tests that an invalid icn fails', function() {
            expect(synchronize._isIcn()).to.equal(false);
            expect(synchronize._isIcn(null)).to.equal(false);
            expect(synchronize._isIcn('')).to.equal(false);
            expect(synchronize._isIcn('10108V')).to.equal(false);
            expect(synchronize._isIcn('V420871')).to.equal(false);
            expect(synchronize._isIcn('10108420871')).to.equal(false);
            expect(synchronize._isIcn('9E7A;3')).to.equal(false);
        });
    });

    describe('isEdipi()', function() {
        it('tests that a valid edipi passes', function() {
            expect(synchronize._isEdipi('DOD;1234')).to.equal(true);
        });
        it('tests that a invalid edipi fails', function() {
            expect(synchronize._isEdipi()).to.equal(false);
            expect(synchronize._isEdipi(null)).to.equal(false);
            expect(synchronize._isEdipi('')).to.equal(false);
            expect(synchronize._isEdipi('1234')).to.equal(false);
            expect(synchronize._isEdipi(';1234')).to.equal(false);
            expect(synchronize._isEdipi('DOD;')).to.equal(false);
            expect(synchronize._isEdipi('9E7A;3')).to.equal(false);
            expect(synchronize._isEdipi('10108420871')).to.equal(false);
        });
    });

    describe('getMySiteAsList()', function() {
        it('tests that an empty req returns empty array', function() {
            var req;

            req = {};
            expect(synchronize._getMySiteAsList(req)).to.eql([]);

            req.session = {};
            expect(synchronize._getMySiteAsList(req)).to.eql([]);

            req.session.user = {};
            expect(synchronize._getMySiteAsList(req)).to.eql([]);
        });
        it('tests that the user site in req is returned as a list', function() {
            var req = {
                session: {
                    user: {
                        site: '9E7A'
                    }
                }
            };

            expect(synchronize._getMySiteAsList(req)).to.eql(['9E7A']);
        });
    });

    describe('minMoment()', function() {
        var moment1 = moment().subtract(2, 'hour');
        var moment2 = moment().subtract(1, 'hour');
        var moment3 = moment();

        var date1 = moment1.toDate();
        var date2 = moment2.toDate();
        var date3 = moment3.toDate();

        var timestamp1 = moment1.valueOf();
        var timestamp2 = moment2.valueOf();
        var timestamp3 = moment3.valueOf();

        it('tests that empty and invalid values return undefined', function() {
            expect(synchronize._minMoment()).to.be.undefined();
            expect(synchronize._minMoment(null)).to.be.undefined();
            expect(synchronize._minMoment([undefined, null])).to.be.undefined();
            expect(synchronize._minMoment('test')).to.be.undefined();
            expect(synchronize._minMoment([])).to.be.undefined();
        });

        it('tests valid moment values return the earliest moment', function() {
            expect(synchronize._minMoment(moment1).isSame(moment1)).to.equal(true);
            expect(synchronize._minMoment([moment1, moment2, moment3]).isSame(moment1)).to.equal(true);
            expect(synchronize._minMoment([moment3, null, moment2]).isSame(moment2)).to.equal(true);
            expect(synchronize._minMoment(moment3).isSame(moment3)).to.equal(true);
        });

        it('tests valid Dates return the earliest moment', function() {
            expect(synchronize._minMoment([date1, date2, date3]).isSame(moment1)).to.equal(true);
            expect(synchronize._minMoment([date1, null, date3]).isSame(moment1)).to.equal(true);
        });

        it('tests valid timestamps return the earliest moment', function() {
            expect(synchronize._minMoment([timestamp1, timestamp2, timestamp3]).isSame(moment1)).to.equal(true);
            expect(synchronize._minMoment([timestamp1, null, timestamp3]).isSame(moment1)).to.equal(true);
        });

        it('tests valid mixed values return the earliest moment', function() {
            expect(synchronize._minMoment([timestamp1, date2, moment3]).isSame(moment1)).to.equal(true);
            expect(synchronize._minMoment([moment3, null, date2]).isSame(moment2)).to.equal(true);
            expect(synchronize._minMoment([moment1, date2, timestamp3]).isSame(moment1)).to.equal(true);
        });
    });

    describe('maxMoment()', function() {
        var moment1 = moment().subtract(2, 'hour');
        var moment2 = moment().subtract(1, 'hour');
        var moment3 = moment();

        var date1 = moment1.toDate();
        var date2 = moment2.toDate();
        var date3 = moment3.toDate();

        var timestamp1 = moment1.valueOf();
        var timestamp2 = moment2.valueOf();
        var timestamp3 = moment3.valueOf();

        it('tests that empty and invalid values return undefined', function() {
            expect(synchronize._maxMoment()).to.be.undefined();
            expect(synchronize._maxMoment(null)).to.be.undefined();
            expect(synchronize._maxMoment([undefined, null])).to.be.undefined();
            expect(synchronize._maxMoment('test')).to.be.undefined();
            expect(synchronize._maxMoment([])).to.be.undefined();
        });

        it('tests valid moment values return the latest moment', function() {
            expect(synchronize._maxMoment(moment1).isSame(moment1)).to.equal(true);
            expect(synchronize._maxMoment([moment1, moment2, moment3]).isSame(moment3)).to.equal(true);
            expect(synchronize._maxMoment([moment3, null, moment2]).isSame(moment3)).to.equal(true);
            expect(synchronize._maxMoment(moment3).isSame(moment3)).to.equal(true);
        });

        it('tests valid Dates return the latest moment', function() {
            expect(synchronize._maxMoment([date1, date2, date3]).isSame(moment3)).to.equal(true);
            expect(synchronize._maxMoment([date1, null, date3]).isSame(moment3)).to.equal(true);
        });

        it('tests valid timestamps return the latest moment', function() {
            expect(synchronize._maxMoment([timestamp1, timestamp2, timestamp3]).isSame(moment3)).to.equal(true);
            expect(synchronize._maxMoment([timestamp1, null, timestamp3]).isSame(moment3)).to.equal(true);
        });

        it('tests valid mixed values return the latest moment', function() {
            expect(synchronize._maxMoment([timestamp1, date2, moment3]).isSame(moment3)).to.equal(true);
            expect(synchronize._maxMoment([moment3, null, date2]).isSame(moment3)).to.equal(true);
            expect(synchronize._maxMoment([moment1, date2, timestamp3]).isSame(moment3)).to.equal(true);
        });
    });

    describe('isInterceptorDisabled()', function() {
        it('tests that anything except disabled flag set to true returns false ', function() {
            var config;
            expect(synchronize._isInterceptorDisabled(config)).to.equal(false);

            config = {};
            expect(synchronize._isInterceptorDisabled(config)).to.equal(false);

            config.interceptors = {};
            expect(synchronize._isInterceptorDisabled(config)).to.equal(false);

            config.interceptors.synchronize = {};
            expect(synchronize._isInterceptorDisabled(config)).to.equal(false);

            config.interceptors.synchronize.disabled = null;
            expect(synchronize._isInterceptorDisabled(config)).to.equal(false);

            config.interceptors.synchronize.disabled = 1;
            expect(synchronize._isInterceptorDisabled(config)).to.equal(false);

            config.interceptors.synchronize.disabled = false;
            expect(synchronize._isInterceptorDisabled(config)).to.equal(false);
        });

        it('tests that disabled flag set to true returns true', function() {
            var config = {
                interceptors: {
                    synchronize: {
                        disabled: true
                    }
                }
            };

            expect(synchronize._isInterceptorDisabled(config)).to.equal(true);
        });
    });

    describe('isSyncExistDelayAtTimeout()', function() {
        it('tests that timeout not exceeded returns false', function() {
            var startTime = moment().subtract(10, 'minute');
            var syncExistsWaitDelayMillis = 1000 * 60 * 60;
            var now = moment();

            expect(synchronize._isSyncExistsDelayAtTimeout(startTime, syncExistsWaitDelayMillis, now)).to.equal(false);
        });

        it('tests that timeout exceeded returns true', function() {
            var startTime = moment().subtract(1, 'day');
            var syncExistsWaitDelayMillis = 1000 * 60 * 60;
            var now = moment();

            expect(synchronize._isSyncExistsDelayAtTimeout(startTime, syncExistsWaitDelayMillis, now)).to.equal(true);
        });
    });

    describe('isSyncLastUpdateTimeoutExceeded()', function() {
        var inactivityTimeoutMillis = 1000 * 60 * 60 * 24;
        var now = Date.now();

        var incomplete_all_sites_1 = {
            icn: '',
            latestEnterpriseSyncRequestTimestamp: 1462820945431,
            latestJobTimestamp: 1462820945431,
            sites: {
                '9E7A': {
                    latestJobTimestamp: 1462820945431,
                    pid: '9E7A;3',
                    sourceStampTime: '',
                    syncCompleted: false
                }
            },
            syncCompleted: false
        };

        var incomplete_all_sites_2 = {
            icn: '10108V420871',
            latestEnterpriseSyncRequestTimestamp: 1462820952440,
            latestJobTimestamp: 1462820970870,
            latestSourceStampTime: 20160509150922,
            sites: {
                '9E7A': {
                    latestJobTimestamp: 1462820966830,
                    pid: '9E7A;3',
                    sourceStampTime: 20160509150922,
                    syncCompleted: false
                },
                C877: {
                    latestJobTimestamp: 1462820970870,
                    pid: 'C877;3',
                    sourceStampTime: 20160509150917,
                    syncCompleted: false
                },
                DOD: {
                    latestJobTimestamp: 1462820964909,
                    pid: 'DOD;0000000003',
                    sourceStampTime: 20160509150912,
                    syncCompleted: false
                },
                HDR: {
                    latestJobTimestamp: 1462820953744,
                    pid: 'HDR;10108V420871',
                    sourceStampTime: 20160509150912,
                    syncCompleted: true
                },
                VLER: {
                    latestJobTimestamp: 1462820952743,
                    pid: 'VLER;10108V420871',
                    sourceStampTime: 20160509150912,
                    syncCompleted: false
                }
            },
            syncCompleted: false
        };

        it('tests that inactivity timeouts return true', function() {
            expect(synchronize._isSyncLastUpdateTimeoutExceeded(incomplete_all_sites_1, inactivityTimeoutMillis, now)).to.equal(true);
            expect(synchronize._isSyncLastUpdateTimeoutExceeded(incomplete_all_sites_2, inactivityTimeoutMillis, now)).to.equal(true);
            // expect(synchronize._isSyncLastUpdateTimeoutExceeded(status, inactivityTimeoutMillis, now)).to.equal(true);
        });

        it('tests that inactivity period less than timeout returns false', function() {
            var non_timeout_1 = _.clone(incomplete_all_sites_1);
            non_timeout_1.latestJobTimestamp = moment(now).subtract(1, 'hour').valueOf();

            var non_timeout_2 = _.clone(incomplete_all_sites_2);
            non_timeout_2.latestJobTimestamp = moment(now).subtract(1, 'hour').format('YYYYMMDDHHmmss');

            expect(synchronize._isSyncLastUpdateTimeoutExceeded(non_timeout_1, inactivityTimeoutMillis, now)).to.equal(false);
            expect(synchronize._isSyncLastUpdateTimeoutExceeded(non_timeout_2, inactivityTimeoutMillis, now)).to.equal(false);
        });
    });

    describe('isOneSiteCompleted()', function() {
        var simpleSyncStatus = {
            data: {
                icn: '10108V420871',
                latestEnterpriseSyncRequestTimestamp: 1471616762518,
                latestJobTimestamp: 1471616762518,
                latestSourceStampTime: 20160819101156,
                sites: {
                    '9E7A': {
                        latestJobTimestamp: 1471616762518,
                        pid: '9E7A;3',
                        sourceStampTime: 20160817124027,
                        syncCompleted: true
                    },
                    C877: {
                        latestJobTimestamp: 1471616762518,
                        pid: 'C877;3',
                        sourceStampTime: 20160817124043,
                        syncCompleted: true
                    },
                    DOD: {
                        latestJobTimestamp: 1471616762518,
                        pid: 'DOD;0000000003',
                        sourceStampTime: 20160819101156,
                        syncCompleted: true
                    },
                    HDR: {
                        latestJobTimestamp: 1471616762518,
                        pid: 'HDR;10108V420871',
                        sourceStampTime: 20160819101156,
                        syncCompleted: true
                    },
                    VLER: {
                        latestJobTimestamp: 1471616762518,
                        pid: 'VLER;10108V420871',
                        sourceStampTime: 20160819101156,
                        syncCompleted: true
                    }
                },
                syncCompleted: true
            }
        };

        it('tests that all true values returns true', function() {
            simpleSyncStatus.data.syncCompleted = true;
            simpleSyncStatus.data.sites['9E7A'].syncCompleted = true;
            simpleSyncStatus.data.sites.C877.syncCompleted = true;
            simpleSyncStatus.data.sites.DOD.syncCompleted = true;
            simpleSyncStatus.data.sites.HDR.syncCompleted = true;
            simpleSyncStatus.data.sites.VLER.syncCompleted = true;

            expect(synchronize._isOneSiteCompleted(simpleSyncStatus)).to.equal(true);
        });

        it('tests that all true values except base level attribute returns true', function() {
            simpleSyncStatus.data.syncCompleted = false;
            simpleSyncStatus.data.sites['9E7A'].syncCompleted = true;
            simpleSyncStatus.data.sites.C877.syncCompleted = true;
            simpleSyncStatus.data.sites.DOD.syncCompleted = true;
            simpleSyncStatus.data.sites.HDR.syncCompleted = true;
            simpleSyncStatus.data.sites.VLER.syncCompleted = true;

            expect(synchronize._isOneSiteCompleted(simpleSyncStatus)).to.equal(true);
        });

        it('tests that single true value returns true', function() {
            simpleSyncStatus.data.syncCompleted = false;
            simpleSyncStatus.data.sites['9E7A'].syncCompleted = false;
            simpleSyncStatus.data.sites.C877.syncCompleted = true;
            simpleSyncStatus.data.sites.DOD.syncCompleted = true;
            simpleSyncStatus.data.sites.HDR.syncCompleted = true;
            simpleSyncStatus.data.sites.VLER.syncCompleted = true;

            expect(synchronize._isOneSiteCompleted(simpleSyncStatus)).to.equal(true);
        });

        it('tests that multiple true values returns true', function() {
            simpleSyncStatus.data.syncCompleted = false;
            simpleSyncStatus.data.sites['9E7A'].syncCompleted = true;
            simpleSyncStatus.data.sites.C877.syncCompleted = false;
            simpleSyncStatus.data.sites.DOD.syncCompleted = true;
            simpleSyncStatus.data.sites.HDR.syncCompleted = false;
            simpleSyncStatus.data.sites.VLER.syncCompleted = false;

            expect(synchronize._isOneSiteCompleted(simpleSyncStatus)).to.equal(true);
        });

        it('tests that all false values returns false', function() {
            simpleSyncStatus.data.syncCompleted = false;
            simpleSyncStatus.data.sites['9E7A'].syncCompleted = false;
            simpleSyncStatus.data.sites.C877.syncCompleted = false;
            simpleSyncStatus.data.sites.DOD.syncCompleted = false;
            simpleSyncStatus.data.sites.HDR.syncCompleted = false;
            simpleSyncStatus.data.sites.VLER.syncCompleted = false;

            expect(synchronize._isOneSiteCompleted(simpleSyncStatus)).to.equal(false);
        });

        it('tests that empty and null status returns false', function() {
            expect(synchronize._isOneSiteCompleted(null)).to.equal(false);
            expect(synchronize._isOneSiteCompleted({})).to.equal(false);
        });
    });

    describe('isEverySiteInError()', function() {
        var simpleSyncStatus = {
            data: {
                icn: '10108V420871',
                latestEnterpriseSyncRequestTimestamp: 1471616762518,
                latestJobTimestamp: 1471616762518,
                latestSourceStampTime: 20160819101156,
                sites: {
                    '9E7A': {
                        latestJobTimestamp: 1471616762518,
                        pid: '9E7A;3',
                        sourceStampTime: 20160817124027,
                        syncCompleted: false
                    },
                    C877: {
                        latestJobTimestamp: 1471616762518,
                        pid: 'C877;3',
                        sourceStampTime: 20160817124043,
                        syncCompleted: false
                    },
                    DOD: {
                        latestJobTimestamp: 1471616762518,
                        pid: 'DOD;0000000003',
                        sourceStampTime: 20160819101156,
                        syncCompleted: false
                    },
                    HDR: {
                        latestJobTimestamp: 1471616762518,
                        pid: 'HDR;10108V420871',
                        sourceStampTime: 20160819101156,
                        syncCompleted: false
                    },
                    VLER: {
                        latestJobTimestamp: 1471616762518,
                        pid: 'VLER;10108V420871',
                        sourceStampTime: 20160819101156,
                        syncCompleted: false
                    }
                },
                syncCompleted: false
            }
        };

        it('tests that no error values returns false', function() {
            delete simpleSyncStatus.data.hasError;
            delete simpleSyncStatus.data.sites['9E7A'].hasError;
            delete simpleSyncStatus.data.sites.C877.hasError;
            delete simpleSyncStatus.data.sites.DOD.hasError;
            delete simpleSyncStatus.data.sites.HDR.hasError;
            delete simpleSyncStatus.data.sites.VLER.hasError;

            expect(synchronize._isEverySiteInError(simpleSyncStatus)).to.equal(false);
        });

        it('tests that only overall error returns false', function() {
            simpleSyncStatus.data.hasError = true;
            delete simpleSyncStatus.data.sites['9E7A'].hasError;
            delete simpleSyncStatus.data.sites.C877.hasError;
            delete simpleSyncStatus.data.sites.DOD.hasError;
            delete simpleSyncStatus.data.sites.HDR.hasError;
            delete simpleSyncStatus.data.sites.VLER.hasError;

            expect(synchronize._isEverySiteInError(simpleSyncStatus)).to.equal(false);
        });

        it('tests that any false value returns false', function() {
            simpleSyncStatus.data.hasError = true;
            delete simpleSyncStatus.data.sites['9E7A'].hasError;
            simpleSyncStatus.data.sites.C877.hasError = true;
            simpleSyncStatus.data.sites.DOD.hasError = true;
            simpleSyncStatus.data.sites.HDR.hasError = true;
            simpleSyncStatus.data.sites.VLER.hasError = true;

            expect(synchronize._isEverySiteInError(simpleSyncStatus)).to.equal(false);
        });

        it('tests that all errors returns true', function() {
            simpleSyncStatus.data.hasError = true;
            simpleSyncStatus.data.sites['9E7A'].hasError = true;
            simpleSyncStatus.data.sites.C877.hasError = true;
            simpleSyncStatus.data.sites.DOD.hasError = true;
            simpleSyncStatus.data.sites.HDR.hasError = true;
            simpleSyncStatus.data.sites.VLER.hasError = true;

            expect(synchronize._isEverySiteInError(simpleSyncStatus)).to.equal(true);

            delete simpleSyncStatus.data.hasError;
            expect(synchronize._isEverySiteInError(simpleSyncStatus)).to.equal(true);
        });

        it('tests that empty and null status returns false', function() {
            expect(synchronize._isEverySiteInError(null)).to.equal(false);
            expect(synchronize._isEverySiteInError({})).to.equal(false);
            expect(synchronize._isEverySiteInError({ data: { sites: {}}})).to.equal(false);
        });
    });

    describe.skip('clearThenSyncPatient()', function() {
        it('', function() {});
    });

    describe.skip('syncPatient()', function() {
        it('', function() {});
    });

    describe.skip('waitForFullPatientSync()', function() {
        it('', function() {});
    });
});

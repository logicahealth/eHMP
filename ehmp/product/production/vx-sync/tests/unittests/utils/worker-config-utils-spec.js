'use strict';

require('../../../env-setup');
var _ = require('underscore');
var workerConfigUtil = require(global.VX_UTILS + 'worker-config-utils');
var val = require(global.VX_UTILS + 'object-utils').getProperty;

var initialConfig = {
    'configRefresh': 0,
    'rules': {
        'accept-all': {},
        'rapid-fire': {},
        'operational-data-sync': {
            'odsAttempts': 10,
            'odsDelay': 30
        },
        'expiration': {
            'default': 3600000,
            'dod': 3600000
        }
    },
    'vistaSites': {
        'SITE': {
            'name': 'panorama',
            'host': 'IP        ',
            'port': PORT,
            'accessCode': 'USER  ',
            'verifyCode': 'PW      ',
            'localIP': '127.0.0.1',
            'stationNumber': 500,
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 20000
        },
        'SITE': {
            'name': 'kodak',
            'host': 'IP        ',
            'port': PORT,
            'accessCode': 'USER  ',
            'verifyCode': 'PW      ',
            'localIP': '127.0.0.1',
            'stationNumber': 501,
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 20000
        }
    },
    'beanstalk': {
        'repoUniversal': {
            'priority': 10,
            'delay': 0,
            'ttr': 120,
            'timeout': 10,
            'initMillis': 1000,
            'maxMillis': 15000,
            'incMillis': 1000
        },
        'repoDefaults': {
            'host': '127.0.0.1',
            'port': 5000,
            'tubename': 'vxsync',
            'tubePrefix': 'vxs-',
            'jobTypeForTube': true
        },
        'jobTypes': {
            'job-type-1': {},
            'job-type-2': {}
        }
    },
    'hdr': {
        'hdrSites': {
            '1234': {
                'name': 'panorama',
                'host': 'IP        ',
                'port': PORT,
                'accessCode': 'USER  ',
                'verifyCode': 'PW      ',
                'localIP': '127.0.0.1',
                'stationNumber': 600,
                'localAddress': 'localhost',
                'connectTimeout': 3000,
                'sendTimeout': 20000
            },
            'CCCC': {
                'name': 'kodak',
                'host': 'IP        ',
                'port': PORT,
                'accessCode': 'USER  ',
                'verifyCode': 'PW      ',
                'localIP': '127.0.0.1',
                'stationNumber': 601,
                'localAddress': 'localhost',
                'connectTimeout': 3000,
                'sendTimeout': 20000
            }
        }
    },
    'jds': {
        'protocol': 'http',
        'host': 'IP        ',
        'port': '9082',
        'timeout': 300000
    },
    'pjds': {
        'protocol': 'http',
        'host': 'IP        ',
        'port': '9083',
        'timeout': 300001
    },
    'osync': {
        'beanstalk': {
            'repoUniversal': {
                'priority': 10,
                'delay': 0,
                'ttr': 120,
                'timeout': 10,
                'initMillis': 1000,
                'maxMillis': 15000,
                'incMillis': 1000
            },
            'repoDefaults': {
                'host': '127.0.0.1',
                'port': 5001,
                'tubename': 'osync',
                'tubePrefix': 'osync-',
                'jobTypeForTube': true
            },
            'jobTypes': {
                'job-type-1': {},
                'job-type-2': {},
            }
        },
    },
    'vxsyncEnvironments': {
        'vxsync-env-1': {
            'vxsync': {
                'beanstalk': {
                    'repoUniversal': {
                        'priority': 10,
                        'delay': 0,
                        'ttr': 120,
                        'timeout': 10,
                        'initMillis': 1000,
                        'maxMillis': 15000,
                        'incMillis': 1000
                    },
                    'repoDefaults': {
                        'host': '127.0.0.1',
                        'port': 5000,
                        'tubename': 'vxsync',
                        'tubePrefix': 'vxs-',
                        'jobTypeForTube': true
                    },
                    'jobTypes': {
                        'job-type-1': {},
                        'job-type-2': {}
                    }
                }
            },
            'osync': {
                'beanstalk': {
                    'repoUniversal': {
                        'priority': 10,
                        'delay': 0,
                        'ttr': 120,
                        'timeout': 10,
                        'initMillis': 1000,
                        'maxMillis': 15000,
                        'incMillis': 1000
                    },
                    'repoDefaults': {
                        'host': '127.0.0.1',
                        'port': 5001,
                        'tubename': 'osync',
                        'tubePrefix': 'osync-',
                        'jobTypeForTube': true
                    },
                    'jobTypes': {
                        'job-type-1': {},
                        'job-type-2': {}
                    }
                },
            }
        },
        'vxsync-env-2': {
            'vxsync': {
                'beanstalk': {
                    'repoUniversal': {
                        'priority': 10,
                        'delay': 0,
                        'ttr': 120,
                        'timeout': 10,
                        'initMillis': 1000,
                        'maxMillis': 15000,
                        'incMillis': 1000
                    },
                    'repoDefaults': {
                        'host': '127.0.0.2',
                        'port': 5432,
                        'tubename': 'vxsync',
                        'tubePrefix': 'vxs-',
                        'jobTypeForTube': true
                    },
                    'jobTypes': {
                        'job-type-1': {},
                        'job-type-2': {}
                    }
                }
            },
            'osync': {
                'beanstalk': {
                    'repoUniversal': {
                        'priority': 10,
                        'delay': 0,
                        'ttr': 120,
                        'timeout': 10,
                        'initMillis': 1000,
                        'maxMillis': 15000,
                        'incMillis': 1000
                    },
                    'repoDefaults': {
                        'host': '127.0.0.2',
                        'port': 6543,
                        'tubename': 'osync',
                        'tubePrefix': 'osync-',
                        'jobTypeForTube': true
                    },
                    'jobTypes': {
                        'job-type-1': {},
                        'job-type-2': {}
                    }
                },
            }
        }
    }
};



describe('worker-config-utils.js', function() {
    describe('createVistaSitesByStationCombined()', function() {
        it('test with both vista and HDR data', function() {
            var localConfig = JSON.parse(JSON.stringify(initialConfig));
            var resultConfig = workerConfigUtil.createVistaSitesByStationCombined(localConfig);
            expect(resultConfig).toBeTruthy();
            expect(resultConfig.vistaSitesByStationCombined).toBeTruthy();
            expect(_.size(resultConfig.vistaSitesByStationCombined)).toBe(4);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.vistaSites['SITE'].stationNumber)]).toBe(resultConfig.vistaSites['SITE']);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.vistaSites['SITE'].stationNumber)].siteHash).toBe('SITE');
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.vistaSites.SITE.stationNumber)]).toBe(resultConfig.vistaSites.SITE);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.vistaSites.SITE.stationNumber)].siteHash).toBe('SITE');
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.hdr.hdrSites['1234'].stationNumber)]).toBe(resultConfig.hdr.hdrSites['1234']);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.hdr.hdrSites['1234'].stationNumber)].siteHash).toBe('1234');
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.hdr.hdrSites.CCCC.stationNumber)]).toBe(resultConfig.hdr.hdrSites.CCCC);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.hdr.hdrSites.CCCC.stationNumber)].siteHash).toBe('CCCC');
        });
        it('test with vista and no HDR data', function() {
            var localConfig = JSON.parse(JSON.stringify(initialConfig));
            localConfig.hdr.hdrSites = {};
            var resultConfig = workerConfigUtil.createVistaSitesByStationCombined(localConfig);
            expect(resultConfig).toBeTruthy();
            expect(resultConfig.vistaSitesByStationCombined).toBeTruthy();
            expect(_.size(resultConfig.vistaSitesByStationCombined)).toBe(2);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.vistaSites['SITE'].stationNumber)]).toBe(resultConfig.vistaSites['SITE']);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.vistaSites.SITE.stationNumber)]).toBe(resultConfig.vistaSites.SITE);
        });
        it('test with no vista but with HDR data', function() {
            var localConfig = JSON.parse(JSON.stringify(initialConfig));
            localConfig.vistaSites = {};
            var resultConfig = workerConfigUtil.createVistaSitesByStationCombined(localConfig);
            expect(resultConfig).toBeTruthy();
            expect(resultConfig.vistaSitesByStationCombined).toBeTruthy();
            expect(_.size(resultConfig.vistaSitesByStationCombined)).toBe(2);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.hdr.hdrSites['1234'].stationNumber)]).toBe(resultConfig.hdr.hdrSites['1234']);
            expect(resultConfig.vistaSitesByStationCombined[String(resultConfig.hdr.hdrSites.CCCC.stationNumber)]).toBe(resultConfig.hdr.hdrSites.CCCC);
        });
        it('test with no vista and no HDR data', function() {
            var localConfig = JSON.parse(JSON.stringify(initialConfig));
            localConfig.vistaSites = {};
            localConfig.hdr = {};
            var resultConfig = workerConfigUtil.createVistaSitesByStationCombined(localConfig);
            expect(resultConfig).toBeTruthy();
            expect(resultConfig.vistaSitesByStationCombined).toBeTruthy();
            expect(_.size(resultConfig.vistaSitesByStationCombined)).toBe(0);
        });
    });

    describe('populateBeanstalkConfigs', function() {
        it('Handles null', function(){
            var config = null;
            workerConfigUtil.populateBeanstalkConfigs(config);

            expect(config).toBe(null);
        });
        it('Handles empty config', function(){
            var config = {};
            workerConfigUtil.populateBeanstalkConfigs(config);

            expect(config.beanstalk).not.toBeDefined();
        });
        it('Handles empty environment', function(){
            var config = {vxsyncEnvironments:{'vxsync-env-1':{}}};
            workerConfigUtil.populateBeanstalkConfigs(config);

            expect(_.isEmpty(val(config, 'vxsyncEnvironments', 'vxsync-env-1'))).toBe(true);
        });
         it('Handles empty environment with empty vxsync, osync', function(){
            var config = {vxsyncEnvironments:{'vxsync-env-1':{vxsync:{}, osync:{}}}};
            workerConfigUtil.populateBeanstalkConfigs(config);

            expect(_.isEmpty(val(config, 'vxsyncEnvironments', 'vxsync-env-1', 'vxsync'))).toBe(true);
            expect(_.isEmpty(val(config, 'vxsyncEnvironments', 'vxsync-env-1', 'osync'))).toBe(true);
        });
        it('Normal path: Fills in all beanstalk nodes', function(done) {
            var config = initialConfig;
            workerConfigUtil.populateBeanstalkConfigs(config);

            var mainRepoDefaults = val(config, 'beanstalk', 'repoDefaults');
            var mainRepoUniversal = val(config, 'beanstalk', 'repoUniversal');
            var mainRepoDefaultsOsync = val(config, 'osync', 'beanstalk', 'repoDefaults');
            var mainRepoUniversalOsync = val(config, 'osync', 'beanstalk', 'repoUniversal');
            var env1RepoDefaults = val(config, 'vxsyncEnvironments', 'vxsync-env-1', 'vxsync', 'beanstalk', 'repoDefaults');
            var env1RepoUniversal = val(config, 'vxsyncEnvironments', 'vxsync-env-1', 'vxsync', 'beanstalk', 'repoUniversal');
            var env1RepoDefaultsOsync = val(config, 'vxsyncEnvironments', 'vxsync-env-1', 'osync', 'beanstalk', 'repoDefaults');
            var env1RepoUniversalOsync = val(config, 'vxsyncEnvironments', 'vxsync-env-1', 'osync', 'beanstalk', 'repoUniversal');
            var env2RepoDefaults = val(config, 'vxsyncEnvironments', 'vxsync-env-2', 'vxsync', 'beanstalk', 'repoDefaults');
            var env2RepoUniversal = val(config, 'vxsyncEnvironments', 'vxsync-env-2', 'vxsync', 'beanstalk', 'repoUniversal');
            var env2RepoDefaultsOsync = val(config, 'vxsyncEnvironments', 'vxsync-env-2', 'osync', 'beanstalk', 'repoDefaults');
            var env2RepoUniversalOsync = val(config, 'vxsyncEnvironments', 'vxsync-env-2', 'osync', 'beanstalk', 'repoUniversal');

            var mainJobTypes = val(config, 'beanstalk', 'jobTypes');
            var mainOsyncJobTypes = val(config, 'osync', 'beanstalk', 'jobTypes');
            var env1jobTypes = val(config, 'vxsyncEnvironments', 'vxsync-env-1', 'vxsync', 'beanstalk', 'jobTypes');
            var env1jobTypesOsync = val(config, 'vxsyncEnvironments', 'vxsync-env-1', 'osync', 'beanstalk', 'jobTypes');
            var env2jobTypes = val(config, 'vxsyncEnvironments', 'vxsync-env-2', 'vxsync', 'beanstalk', 'jobTypes');
            var env2jobTypesOsync = val(config, 'vxsyncEnvironments', 'vxsync-env-2', 'osync', 'beanstalk', 'jobTypes');

            function getPopulatedJobType(jobTypeName, repoDefaults, repoUniversal) {
                var result = _.extend({}, repoDefaults, repoUniversal);
                result.tubename = repoDefaults.tubePrefix + jobTypeName;
                return result;
            }

            expect(val(mainJobTypes, 'job-type-1')).toEqual(jasmine.objectContaining(getPopulatedJobType('job-type-1', mainRepoDefaults, mainRepoUniversal)));
            expect(val(mainJobTypes, 'job-type-2')).toEqual(jasmine.objectContaining(getPopulatedJobType('job-type-2', mainRepoDefaults, mainRepoUniversal)));
            expect(val(mainOsyncJobTypes, 'job-type-1')).toEqual(jasmine.objectContaining(getPopulatedJobType('job-type-1', mainRepoDefaultsOsync, mainRepoUniversalOsync)));
            expect(val(mainOsyncJobTypes, 'job-type-2')).toEqual(jasmine.objectContaining(getPopulatedJobType('job-type-2', mainRepoDefaultsOsync, mainRepoUniversalOsync)));

            expect(val(env1jobTypes, 'job-type-1')).toEqual(jasmine.objectContaining(getPopulatedJobType('job-type-1', env1RepoDefaults, env1RepoUniversal)));
            expect(val(env1jobTypes, 'job-type-2')).toEqual(jasmine.objectContaining(getPopulatedJobType('job-type-2', env1RepoDefaults, env1RepoUniversal)));
            expect(val(env1jobTypesOsync, 'job-type-1')).toEqual(jasmine.objectContaining(getPopulatedJobType('job-type-1', env1RepoDefaultsOsync, env1RepoUniversalOsync)));
            expect(val(env1jobTypesOsync, 'job-type-2')).toEqual(jasmine.objectContaining(getPopulatedJobType('job-type-2', env1RepoDefaultsOsync, env1RepoUniversalOsync)));

            expect(val(env2jobTypes, 'job-type-1')).toEqual(jasmine.objectContaining(getPopulatedJobType('job-type-1', env2RepoDefaults, env2RepoUniversal)));
            expect(val(env2jobTypes, 'job-type-2')).toEqual(jasmine.objectContaining(getPopulatedJobType('job-type-2', env2RepoDefaults, env2RepoUniversal)));
            expect(val(env2jobTypesOsync, 'job-type-1')).toEqual(jasmine.objectContaining(getPopulatedJobType('job-type-1', env2RepoDefaultsOsync, env2RepoUniversalOsync)));
            expect(val(env2jobTypesOsync, 'job-type-2')).toEqual(jasmine.objectContaining(getPopulatedJobType('job-type-2', env2RepoDefaultsOsync, env2RepoUniversalOsync)));

            done();
        });
    });
});
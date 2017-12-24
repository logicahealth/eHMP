'use strict';

require('../env-setup');

var _ = require('underscore');
var _s = require('underscore.string');

var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');
var PublisherRouter = require(global.VX_JOBFRAMEWORK).PublisherRouter;
var JobStatusUpdater = require(global.VX_SUBSYSTEMS + 'jds/JobStatusUpdater');
var ErrorPublisher = require(global.VX_JOBFRAMEWORK).ErrorPublisher;
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
const PjdsClientHttp = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');
var PjdsClient = require('jds-cache-api').PjdsClient;
var solrSmartClient = require('solr-smart-client');
var Metrics = require(global.VX_UTILS + 'metrics');
var JobUtils = require(global.VX_UTILS + 'job-utils');
var TerminologyUtil = require(global.VX_SUBSYSTEMS + 'terminology/terminology-utils');
var MviClient = require(global.VX_SUBSYSTEMS + 'mvi/mvi-client');
var HdrClient = require(global.VX_SUBSYSTEMS + 'hdr/hdr-client');
var logUtil = require(global.VX_UTILS + 'log');
var yargs = require('yargs');
var VxSyncForeverAgent = require('http').Agent;
var queueConfig = require(global.VX_JOBFRAMEWORK).QueueConfig;
var Auditor = require(global.VX_UTILS + 'auditor');

var notEmpty = _.negate(_.isEmpty);

function buildEnvironment(logger, config) {
    var metricsLog = new Metrics(config);
    var jds = new JdsClient(logger, metricsLog, config);
    var pjdsHttp = new PjdsClientHttp(logger, metricsLog, config);
    var terminology = new TerminologyUtil(logger, metricsLog, config);
    var environment = {
        vistaClient: new VistaClient(logger, metricsLog, config, null),
        jobStatusUpdater: {},
        publisherRouter: {},
        errorPublisher: {},
        mvi: new MviClient(logger, metricsLog, config, jds),
        jds: jds,
        pjdsHttp: pjdsHttp,
        auditor: new Auditor(),
        metrics: metricsLog,
        terminologyUtils: terminology,
        solr: solrSmartClient.createClient(logger, config.solrClient, new VxSyncForeverAgent({keepAlive: true, maxSockets: config.handlerMaxSockets || 5})),
        hdrClient: new HdrClient(logger, metricsLog, config)
    };
    environment.jobStatusUpdater = new JobStatusUpdater(logger, config, environment.jds);
    environment.publisherRouter = new PublisherRouter(logger, config, metricsLog, environment.jobStatusUpdater);
    environment.errorPublisher = new ErrorPublisher(logger, config, JobUtils.errorRequestType());
    environment.errorPublisher.connect();

    return environment;
}

function buildOsyncEnvironment(logger, config) {
    var metricsLog = new Metrics(config.osync);
    var jds = new JdsClient(logger, metricsLog, config);
    var pjds = new PjdsClient(logger, metricsLog, config.pjds);

    var environment = {
        vistaClient: new VistaClient(logger, metricsLog, config.osync, null),
        jobStatusUpdater: {},
        publisherRouter: {},
        jds: jds,
        pjds: pjds,
        metrics: metricsLog,
        auditor: new Auditor()
    };

    environment.jobStatusUpdater = new JobStatusUpdater(logger, config.osync, environment.jds);
    environment.publisherRouter = new PublisherRouter(logger, config.osync, metricsLog, environment.jobStatusUpdater);

    environment.validPatientsLog = logUtil.get('valid_patients', logger);
    environment.resultsLog = logUtil.get('results', logger);

    return environment;
}

/*
logger: a bunyan-style logger
config: the worker-config configuration
*/
function parseErrorProcessorOptions(logger, config) {
    var argv = yargs
        .usage('Usage: $0 [options...]')
        .example('$0 --profile jmeadows', 'Run a processor with the "jmeadows" error profile. This will override a disabled setting in the configuration file.')
        .example('$0 --all-profiles', 'Run a processor for all of the error profiles (default behavior).')
        .describe('autostart <true|false>', 'If true, automatically starts the processor. Defaults to true.')
        .describe('ignore-invalid', 'If a non-existant or invalid profile is given, it should be ignored.')
        .describe('ignore-severity', 'Do not include the error level as part of the filter--return error regardless of error level.')
        .describe('help', 'This help text.')
        .alias('a', 'autostart')
        .alias('i', 'ignore-invalid')
        .alias('s', 'ignore-severity')
        .alias('h', 'help')
        .alias('?', 'help')
        .help('h')
        .argv;

    if (argv.help) {
        console.log(yargs.help());
        process.exit(0);
    }

    var allProfileList = _.keys(config['error-processing'].profiles);
    var profiles = removeDisabledProfiles(config, allProfileList);

    var ignoreInvalid = parseIgnoreInvalid(argv);
    var autostart = parseAutostart(logger, argv);

    if (!argv['all-profiles'] && argv.profile) {
        profiles = _.isArray(argv.profile) ? _.uniq(argv.profile) : [argv.profile];
    }

    var profilesNotFound = findInvalidErrorProfiles(allProfileList, profiles);
    if (checkInvalidErrorProfiles(ignoreInvalid, profilesNotFound)) {
        process.exit(1);
    }

    return {
        profiles: profiles,
        autostart: autostart
    };
}

function removeDisabledProfiles(config, allProfileList) {
    var profiles = config['error-processing'].profiles || {};

    return _.filter(allProfileList, function(name) {
        return profiles[name] ? profiles[name].enabled : false;
    });
}

function findInvalidErrorProfiles(allProfileList, profileList) {
    var optionsNotFound = [];
    _.each(profileList, function(count, name) {
        if (!_.has(allProfileList, name)) {
            optionsNotFound.push(name);
        }
    });

    return optionsNotFound;
}


function checkInvalidErrorProfiles(ignoreInvalid, profilesNotFound) {
    if (ignoreInvalid) {
        return false;
    }

    var hasInvalid = notEmpty(profilesNotFound);

    if (notEmpty(profilesNotFound)) {
        console.log('\nThe following profiles do not exist in the configuration file: ', profilesNotFound.join(', '));
    }

    if (hasInvalid) {
        console.log();
        console.log('Either remove the invalid values from the options, or run errorProcessorHost with the --ignore-invalid option');
        console.log();
    }

    return hasInvalid;
}

/*
logger: a bunyan-style logger
config: the worker-config configuration
*/
function parseSubscriberOptions(logger, config) {
    var argv = yargs
        .usage('Usage: $0 [options...]')
        .example('$0 --profile main:3', 'Run 3 instances of the "main" profile.')
        .example('$0 --profile main --profile secondary', 'Run 1 instance each of the "main" and "secondary" profile.')
        .example('$0 --profile main --profile secondary:3', 'Run 1 instance of the "main" profile and 3 instances of the "secondary" profile.')
        .describe('autostart <true|false>', 'If true, automatically starts the poller. Defaults to true.')
        .describe('all-job-types', 'If present, then one process will be created per job type. Any profile parameters will be ignored and any job-type parameters will be additional processes.')
        .describe('profile <profile-name>[:<count>]', 'A handler profile name and number of processes. If this parameter is not used, a value of "default" will be used, unless one or more job-types are given.')
        .describe('job-type <job-type>[:<count>]', 'A job type and number of processes. Note that each job-type will be run in its own process. ' +
            'If it also appears as part of a profile, it will not be run as part of that profile and will run instead as the separate process.')
        .describe('ignore-invalid', 'If a non-existant or invalid profile or job-type is given, it should be ignored.')
        .describe('config-override', 'Path to an alternate config file. Any values in this config will override the ones in the main worker-config. Used only for the record-update processes.')
        .describe('help', 'This help text.')
        .alias('a', 'autostart')
        .alias('i', 'ignore-invalid')
        .alias('h', 'help')
        .alias('?', 'help')
        .help('h')
        .argv;

    if (argv.help) {
        console.log(yargs.help());
        process.exit(0);
    }

    if (!argv['job-type'] && !argv.profile && !argv['all-job-types']) {
        console.log('You must provide one of more of the following options: "profile", "job-type", "all-job-types"');
        console.log(yargs.help());
        process.exit(1);
    }

    var ignoreInvalid = parseIgnoreInvalid(argv);
    var allJobTypes = parseAllJobTypes(argv);
    var profileMap = !allJobTypes ? parseParamList(argv.profile) : {};

    var allJobTypeList = allJobTypes ? _.keys(config.beanstalk.jobTypes) : [];
    var jobTypeMap = parseParamList(allJobTypeList.concat(argv['job-type'] || []));

    var autostart = parseAutostart(logger, argv);

    var profilesNotFound = findInvalidOptions(config.handlerProfiles.profileCollection, profileMap);
    var jobTypesNotFound = findInvalidOptions(config.beanstalk.jobTypes, jobTypeMap);

    if (checkInvalidOptions(ignoreInvalid, profilesNotFound, jobTypesNotFound)) {
        process.exit(1);
    }

    config = fillOutSpecialProfiles(config);

    stripRedundantJobTypesFromProfiles(config, profileMap, jobTypeMap);

    addJobTypeProfiles(config, profileMap, jobTypeMap);

    var processList = buildProcessList(config, profileMap);

    parseAndApplyConfigOverride(logger, argv, config);

    return {
        profile: argv.profile,
        processList: processList,
        autostart: autostart
    };
}

// Remove invalid profiles and build the processList
function buildProcessList(config, profiles) {
    var processList = _.map(profiles, function(count, profile) {
        return _.times(count, function() {
            return profile;
        });
    });

    return _.filter(_.flatten(processList), function(profile) {
        return notEmpty(config.handlerProfiles.profileCollection[profile]);
    });
}

// Add an entry to profileMap for each entry in jobTypeMap
function addJobTypeProfiles(config, profileMap, jobTypeMap) {
    _.each(jobTypeMap, function(count, jobType) {
        if (config.beanstalk.jobTypes[jobType]) {
            config.handlerProfiles.profileCollection[jobType] = [jobType];
            profileMap[jobType] = count;
        }
    });
}

// Remove jobTypes from profiles if those jobTypes are contained in the jobTypeMap
function stripRedundantJobTypesFromProfiles(config, profileMap, jobTypeMap) {
    _.each(profileMap, function(count, profile) {
        var strippedjobTypeMap = _.omit(config.handlerProfiles.profileCollection[profile], function(jobSettings, jobType) {
            return _.contains(_.keys(jobTypeMap), jobType);
        });

        config.handlerProfiles.profileCollection[profile] = strippedjobTypeMap;
    });
}

// Fill out profiles that have the string "all" instead of a list of jobTypes
function fillOutSpecialProfiles(config) {
    _.each(config.handlerProfiles.profileCollection, function(value, profile) {
        if (value === 'all') {
            config.handlerProfiles.profileCollection[profile] = _.keys(config.beanstalk.jobTypes);
        }
    });

    return config;
}

// Find invalid profile or type-type option values (i.e. any that aren't defined in the config)
function findInvalidOptions(configList, optionList) {
    var optionsNotFound = [];
    _.each(optionList, function(count, name) {
        if (!_.has(configList, name)) {
            optionsNotFound.push(name);
        }
    });

    return optionsNotFound;
}

function checkInvalidOptions(ignoreInvalid, profilesNotFound, jobTypesNotFound) {
    if (ignoreInvalid) {
        return false;
    }

    var hasInvalid = notEmpty(profilesNotFound) || notEmpty(jobTypesNotFound);

    if (notEmpty(profilesNotFound)) {
        console.log('\nThe following profiles do not exist in the configuration file: ', profilesNotFound.join(', '));
    }

    if (notEmpty(jobTypesNotFound)) {
        console.log('\nThe following job-types do not exist in the configuration file: ', jobTypesNotFound.join(', '));
    }

    if (hasInvalid) {
        console.log();
        console.log('Either remove the invalid values from the options, or run subscriberHost with the --ignore-invalid option');
        console.log();
    }

    return hasInvalid;
}


/*
This is to parse a list of parameters e.g.
--profile primary --profile primary --profile jmeadows,vler --profile storage:2,enrichment

This specific function takes a list and returns an object with each of the unique values
of the list as a key and with the value being the count of times that value appears in
the list.

So if the above command line example created this list:
['primary', 'primary', 'jmeadows,vler', 'storage:2,enrichment']

then the object returned would be:
{
    primary: 2,
    jmeadows: 1,
    vler: 1,
    storage: 2,
    enrichment: 1
}
*/
function parseParamList(list) {
    if (_.isEmpty(list)) {
        return {};
    }

    list = !_.isArray(list) ? [list] : list;

    var paramCounts = _.reduce(list, function(memo, paramValue) {
        totals(stringToArray(paramValue), memo);
        return memo;
    }, {});

    return paramCounts;
}

function stringToArray(value) {
    value = _.isUndefined(value) || _.isNull(value) ? '' : value;

    var array = [];

    var entries = _.without(_.map(value.split(','), function(item) {
        return item.trim();
    }), '');

    _.each(entries, function(item) {
        var entry = item.split(':');
        var name = entry[0];
        var num = entry[1] || 1;

        if (_.isEmpty(name)) {
            return;
        }

        _.times(num, function() {
            array.push(name);
        });
    });

    return array;
}

function totals(array, object) {
    object = object || {};

    return _.reduce(array, function(memo, name) {
        if (_.isEmpty(name)) {
            return memo;
        }

        var count = memo[name] || 0;
        memo[name] = count + 1;

        return memo;
    }, object);
}

function parsePollerOptions(logger) {
    var argv = yargs
        .usage('Usage: $0 [options...]')
        .demand(['site'])
        .describe('site <site>', 'The VistaId. This can appear multiple times and all values will be used. Can be a comma-delimited list.')
        .describe('autostart <true|false>', 'If true, automatically starts the poller. Defaults to true.')
        .string('site') // do not do the auto conversion of site value, always use string type.
        .alias('a', 'autostart')
        .alias('s', 'site')
        .alias('mm', 'multiplemode')
        .alias('h', 'help')
        .alias('?', 'help')
        .help('h')
        .argv;

    var sites = parseSites(argv);

    logger.info('Create pollers for sites: %s', sites);

    var multipleMode = parseMultipleMode(logger, argv);

    return {
        sites: sites,
        autostart: parseAutostart(logger, argv),
        multipleMode: multipleMode
    };
}

function parseSites(argv) {
    if (!argv) {
        return [];
    }

    var sites = argv.site;
    if (!_.isArray(sites)) {
        sites = [sites];
    }

    sites = _.flatten(_.map(sites, function(site) {
        return _.without(_.isString(site) || _.isNumber(site) ? _.invoke(String(site).split(','), 'trim') : [''], '');
    }));

    return sites;
}

function parseAllJobTypes(argv) {
    if (!argv) {
        return false;
    }

    return _s.toBoolean(argv['all-job-types']) || false;
}

function parseIgnoreInvalid(argv) {
    if (!argv) {
        return false;
    }

    return _s.toBoolean(argv['ignore-invalid']) || false;
}

function parseIgnoreSeverity(argv) {
    if (!argv) {
        return false;
    }

    return _s.toBoolean(argv['ignore-severity']) || false;
}

function parseAutostart(logger, argv) {
    if (!argv) {
        return true;
    }

    var autostart;
    if (_.isBoolean(argv.autostart)) {
        autostart = argv.autostart;
    } else {
        autostart = _s.toBoolean(argv.autostart || true);
    }
    logger.info('autostart is %s', autostart ? 'ON' : 'OFF');

    return autostart;
}

function parseMultipleMode(logger, argv) {
    if (!argv) {
        return false;
    }

    var multipleMode;
    if (_.isBoolean(argv.multiplemode)) {
        multipleMode = argv.multiplemode;
    } else {
        multipleMode = _s.toBoolean(argv.multiplemode);
    }

    logger.info('multipleMode is %s', multipleMode ? 'ON' : 'OFF');

    return multipleMode;
}

function parseAndApplyConfigOverride(logger, argv, config) {
    if (!argv || !argv['config-override']) {
        return;
    }

    var configOverridePath = argv['config-override'];
    var configOverride = null;

    if (configOverridePath) {
        logger.debug('poller-utils.parseAndApplyConfigOverride: config override path: %s', configOverridePath);
        try {
            configOverride = require(configOverridePath);
        } catch (e) {
            logger.error('poller-utils.parseAndApplyConfigOverride: Got path to a config override file that cannot be found.');
        }

        if (configOverride) {
            logger.debug('poller-utils.parseAndApplyConfigOverride: Loaded config override file. Applying to config.');

            if(configOverride.beanstalk){
                configOverride.beanstalk = queueConfig.createFullBeanstalkConfig(configOverride.beanstalk);
            }

            _.each(_.keys(config), function(key) {
                if (config[key] && configOverride[key]) {
                    config[key] = configOverride[key];
                }
            });

            config.configOverride = true;
        }
    }

    return argv['config-override'];
}

module.exports.buildEnvironment = buildEnvironment;
module.exports.buildOsyncEnvironment = buildOsyncEnvironment;
module.exports.parsePollerOptions = parsePollerOptions;
module.exports.parseSubscriberOptions = parseSubscriberOptions;
module.exports.parseErrorProcessorOptions = parseErrorProcessorOptions;
module.exports.parseParamList = parseParamList;
module.exports.checkInvalidOptions = checkInvalidOptions;
module.exports.findInvalidOptions = findInvalidOptions;
module.exports.stripRedundantJobTypesFromProfiles = stripRedundantJobTypesFromProfiles;
module.exports.parseAutostart = parseAutostart;
module.exports.parseSites = parseSites;
module.exports.parseAllJobTypes = parseAllJobTypes;
module.exports.parseIgnoreInvalid = parseIgnoreInvalid;
module.exports.parseMultipleMode = parseMultipleMode;
module.exports.parseSites = parseSites;

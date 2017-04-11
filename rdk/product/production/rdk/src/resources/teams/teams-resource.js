'use strict';
var rdk = require('../../core/rdk');
var teamOperations = require('./team-operations-resource');

function getResourceConfig() {
    return [{
        name: 'teams-list',
        path: 'list',
        get: teamOperations.getTeamList,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Get a list of teams',
        healthcheck: {
            dependencies: ['authorization', 'pjds']
        }
    }, {
        name: 'teams-getByTeamId',
        path: 'byid',
        get: teamOperations.getTeamById,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Get a team by ID',
        healthcheck: {
            dependencies: ['authorization', 'pjds']
        }
    }, {
        name: 'teams-byICN',
        path: 'byicn',
        get: teamOperations.getTeamsForPatient,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false,
        description: 'Get teams that a particular patient is assigned to',
        healthcheck: {
            dependencies: ['authorization', 'pjds']
        }
    }];
}

module.exports.getResourceConfig = getResourceConfig;

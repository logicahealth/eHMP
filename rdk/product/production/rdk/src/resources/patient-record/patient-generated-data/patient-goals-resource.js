'use strict';
var rdk = require('../../../core/rdk');


var getResourceConfig = function() {
    return [{
        name: 'patient-entered-goals',
        path: '',
        interceptors: {
            synchronize: true
        },
        requiredPermissions: [],
        isPatientCentric: true,
        get: getPatientGoalsData,
        subsystems: ['patientrecord', 'jds', 'solr', 'authorization']
    }];
};

function getPatientGoalsData(req, res, next) {

    var outJSON = [{
        'goal': 'Lose Weight',
        'currentProgress': 'active',
        'enteredDate': '05/11/2015',
        'endDate': '06/12/2015',
        'steps': '0/4',
        'nextDue': '06/03/2015',
        'type': 'Health'
    }, {
        'goal': 'Get a Raise',
        'currentProgress': 'active',
        'enteredDate': '05/12/2015',
        'endDate': '05/20/2015',
        'steps': '0/1',
        'nextDue': '05/02/2015',
        'type': 'Finance'
    }, {
        'goal': 'Concentration',
        'currentProgress': 'active',
        'enteredDate': '05/12/2015',
        'endDate': '05/29/2015',
        'steps': '0/1',
        'nextDue': '05/02/2015',
        'type': 'Work'
    }, {
        'goal': 'Vacation in Dubai',
        'currentProgress': 'active',
        'enteredDate': '06/12/2015',
        'endDate': '08/15/2015',
        'steps': '0/2',
        'nextDue': '07/12/2015',
        'type': 'Leisure'
    }, {
        'goal': 'Get Married',
        'currentProgress': 'complete',
        'enteredDate': '01/12/2015',
        'endDate': '03/20/2015',
        'steps': '3/3',
        //'nextDue':'06/06/2015',
        'type': 'Relationships'
    }, {
        'goal': 'Make more Friends',
        'currentProgress': 'active',
        'enteredDate': '01/01/2015',
        'endDate': '10/10/2015',
        'steps': '3/3',
        'nextDue':'06/06/2015',
        'type': 'Relationships'
    }, {
        'goal': 'Eat More Vegetables',
        'currentProgress': 'active',
        'enteredDate': '02/15/2015',
        'endDate': '07/07/2015',
        'steps': '2/4',
        'nextDue': '06/06/2015',
        'type': 'Health'
    }, {
        'goal': 'Less Junk Food',
        'currentProgress': 'active',
        'enteredDate': '03/01/2015',
        'endDate': '06/07/2015',
        'steps': '2/4',
        'nextDue': '06/06/2015',
        'type': 'Health'
    }];

    res.status(200).rdkSend(outJSON);
}

module.exports.getPatientGenatedData = getPatientGoalsData;
module.exports.getResourceConfig = getResourceConfig;

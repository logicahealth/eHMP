'use strict';

var inputValueProcedure = {
    'apiVersion': '1.0',
    'data': {
        'updated': 20150827095539,
        'totalItems': 1,
        'currentItemCount': 1,
        'items': [
            {
                'category': 'CP',
                'consultUid': 'urn:va:consult:SITE:100599:607',
                'dateTime': '20050204105121',
                'encounterUid': 'urn:va:visit:SITE:100599:3829',
                'facilityCode': '998',
                'facilityName': 'ABILENE (CAA)',
                'kind': 'Procedure',
                'lastUpdateTime': '20050204105121',
                'localId': '8;MDD(702,',
                'locationName': 'CARDIOLOGY',
                'locationUid': 'urn:va:location:SITE:195',
                'name': 'PULMONARY FUNCTION INTERPRET',
                'orderUid': 'urn:va:order:SITE:100599:15748',
                'pid': 'SITE;100599',
                'requested': 200502031344,
                'results': [
                    {
                        'localTitle': 'CP PULMONARY FUNCTION TEST',
                        'summary': 'ProcedureResult{uid=\'urn:va:document:SITE:100599:3266\'}',
                        'uid': 'urn:va:document:SITE:100599:3266'
                    },
                    {
                        'localTitle': 'CP PULMONARY FUNCTION TEST',
                        'summary': 'ProcedureResult{uid=\'urn:va:document:SITE:100599:3267\'}',
                        'uid': 'urn:va:document:SITE:100599:3267'
                    }
                ],
                'stampTime': '20050204105121',
                'statusName': 'COMPLETE',
                'summary': '',
                'uid': 'urn:va:procedure:SITE:100599:8;MDD(702,'
            }
        ]
    }
};


var inputValueEducations = {
    'apiVersion': '1.0',
    'data': {
        'updated': 20150617113333,
        'totalItems': 99,
        'currentItemCount': 2,
        'items': [{
            'encounterName': '0Apr 17, 2000',
            'encounterUid': 'urn:va:visit:SITE:100599:2056',
            'entered': 20000417,
            'facilityCode': 500,
            'facilityName': 'CAMP MASTER',
            'lastUpdateTime': 20000417000000,
            'localId': 42,
            'name': 'SMOKING CESSATION',
            'pid': 'SITE;100599',
            'stampTime': 20000417000000,
            'uid': 'urn:va:education:SITE:100599:42'
        }, {
            'encounterName': '0Apr 17, 2000',
            'encounterUid': 'urn:va:visit:SITE:100599:2056',
            'entered': 20000417,
            'facilityCode': 500,
            'facilityName': 'CAMP BEE',
            'lastUpdateTime': 20000417000000,
            'localId': 42,
            'name': 'SMOKING CESSATION',
            'pid': 'SITE;100599',
            'stampTime': 20000417000000,
            'uid': 'urn:va:education:SITE:100599:42',
            'summary': 'Some summary'
        }]
    }
};

module.exports.inputValueProcedure = inputValueProcedure;
module.exports.inputValueEducations = inputValueEducations;


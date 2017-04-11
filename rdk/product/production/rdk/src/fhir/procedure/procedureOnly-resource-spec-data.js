'use strict';
var inputValue = {
    'apiVersion': '1.0',
    'data': {
        'updated': 20150827095539,
        'totalItems': 1,
        'currentItemCount': 1,
        'items': [
            {
                'category': 'CP',
                'consultUid': 'urn:va:consult:9E7A:100599:607',
                'dateTime': '20050204105121',
                'encounterUid': 'urn:va:visit:9E7A:100599:3829',
                'facilityCode': '998',
                'facilityName': 'ABILENE (CAA)',
                'kind': 'Procedure',
                'lastUpdateTime': '20050204105121',
                'localId': '8;MDD(702,',
                'locationName': 'CARDIOLOGY',
                'locationUid': 'urn:va:location:9E7A:195',
                'name': 'PULMONARY FUNCTION INTERPRET',
                'orderUid': 'urn:va:order:9E7A:100599:15748',
                'pid': '9E7A;100599',
                'requested': 200502031344,
                'results': [
                    {
                        'localTitle': 'CP PULMONARY FUNCTION TEST',
                        'summary': 'ProcedureResult{uid=\'urn:va:document:9E7A:100599:3266\'}',
                        'uid': 'urn:va:document:9E7A:100599:3266'
                    },
                    {
                        'localTitle': 'CP PULMONARY FUNCTION TEST',
                        'summary': 'ProcedureResult{uid=\'urn:va:document:9E7A:100599:3267\'}',
                        'uid': 'urn:va:document:9E7A:100599:3267'
                    }
                ],
                'stampTime': '20050204105121',
                'statusName': 'COMPLETE',
                'summary': '',
                'uid': 'urn:va:procedure:9E7A:100599:8;MDD(702,'
            }
        ]
    }
};
module.exports.inputValue = inputValue;

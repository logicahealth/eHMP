# Group Encounter

## Encounter encounter Info [{{{path}}}]

### Get [GET {{{path}}}/info{?pid}{&dateTime}{&locationUid}]

Get encounter info for specific location and datetime

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + dateTime (string, required) - Datetime of location

    + locationUid (string, required) - Location uid


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "comment": "ssss",
                    "diagnoses": [],
                    "encounterType": "ssss",
                    "kind": "ssss",
                    "problems": [],
                    "procedures": [],
                    "providers": [],
                    "service": "ssss",
                    "typeDisplayName": "ssss",
                    "uid": "urn:va:document:9E7A:3:3"
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/encounter_info-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


# Group Pick List

## Services lookup [/services-fetch-list{?site}{&fields}]

DIRECT RPC CALL - Services lookup - calls ORQQPL SRVC SRCH with null and a 1

### Notes

ORQQPL SRVC SRCH

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "code": "1000",
                  "name": "AMBULATORY CARE"
                },
                {
                  "code": "1001",
                  "name": "ANESTHESIOLOGY"
                },
                {
                  "code": "11",
                  "name": "BLIND REHAB"
                },
                {
                  "code": "1003",
                  "name": "BLIND REHABILITATION"
                },
                {
                  "code": "1008",
                  "name": "DENTAL"
                },
                {
                  "code": "1018",
                  "name": "MEDICAL"
                },
                {
                  "code": "2",
                  "name": "MEDICINE"
                },
                {
                  "code": "9",
                  "name": "NEUROLOGY"
                },
                {
                  "code": "13",
                  "name": "PSYCHIATRY"
                },
                {
                  "code": "1032",
                  "name": "PSYCHOLOGY"
                },
                {
                  "code": "3",
                  "name": "SURGERY"
                },
                {
                  "code": "1041",
                  "name": "SURGICAL"
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/services-fetch-list-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)

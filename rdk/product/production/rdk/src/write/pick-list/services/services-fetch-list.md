# Group Pick List

## Services lookup [/services-fetch-list{?site}]

DIRECT RPC CALL - Services lookup - calls ORQQPL SRVC SRCH with null and a 1

### Notes

ORQQPL SRVC SRCH

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "ien": "1000",
                  "name": "AMBULATORY CARE"
                },
                {
                  "ien": "1001",
                  "name": "ANESTHESIOLOGY"
                },
                {
                  "ien": "11",
                  "name": "BLIND REHAB"
                },
                {
                  "ien": "1003",
                  "name": "BLIND REHABILITATION"
                },
                {
                  "ien": "1008",
                  "name": "DENTAL"
                },
                {
                  "ien": "1018",
                  "name": "MEDICAL"
                },
                {
                  "ien": "2",
                  "name": "MEDICINE"
                },
                {
                  "ien": "9",
                  "name": "NEUROLOGY"
                },
                {
                  "ien": "13",
                  "name": "PSYCHIATRY"
                },
                {
                  "ien": "1032",
                  "name": "PSYCHOLOGY"
                },
                {
                  "ien": "3",
                  "name": "SURGERY"
                },
                {
                  "ien": "1041",
                  "name": "SURGICAL"
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/services-fetch-list-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)

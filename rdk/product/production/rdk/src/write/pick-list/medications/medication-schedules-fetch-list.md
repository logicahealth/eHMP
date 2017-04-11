# Group Pick List

## Medication schedules [/medication-schedules{?site}{&fields}]

Outpatient medication schedules

### Notes

ORWDPS1 SCHALL

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "scheduleName": "3ID",
                  "outpatientExpansion": "",
                  "scheduleType": "C",
                  "administrationTime": "08-16-24"
                },
                {
                  "scheduleName": "3XW",
                  "outpatientExpansion": "",
                  "scheduleType": "C",
                  "administrationTime": "10"
                },
                {
                  "scheduleName": "5XD",
                  "outpatientExpansion": "",
                  "scheduleType": "C",
                  "administrationTime": "02-07-12-17-22"
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/medication-schedules-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



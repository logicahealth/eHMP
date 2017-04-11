# Group Patient

## Global timeline get Timeline [{{{path}}}{?pid}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)


### Get [GET]

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "inpatient": [],
                    "inpatientCount": 2,
                    "outpatient": [],
                    "outpatientCount": 2
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_global-timeline-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


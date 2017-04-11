# Group Patient

## Healthsummaries get [{{{path}}}]

### Sites Info From Patient Data [GET {{{path}}}/sites{?pid}{&fields}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

    + Body

            {
                "data": [],
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_health-summaries_sites-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

+ Response 404 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 2,
                        "message": "ssss"
                    }
                },
                "status": 404
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_health-summaries_sites-GET-404.jsonschema)

:[Response 500]({{{common}}}/responses/500.md)


### Report Content By Report ID [GET {{{path}}}/reports{?pid}{&id}{&site.code}{&fields}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + id (string, required) - report id

    :[site.code]({{{common}}}/parameters/site.code.md)

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "detail": "ssss",
                    "hsReport": "ssss",
                    "reportID": "ssss",
                    "totalLength": 2
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_health-summaries_reports-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

+ Response 500 (application/json)

    + Body

            {
                "data": {
                    "statuscode": 500,
                    "error": "Error Getting Report Content"
                },
                "status": 500
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_health-summaries_reports-GET-500.jsonschema)

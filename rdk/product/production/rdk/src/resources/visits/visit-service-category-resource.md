# Group Visit

## Visit service category [{{{path}}}]

### Get [GET {{{path}}}/serviceCategory{?locationIEN}{&patientStatus}{&fields}]

+ Parameters

    + locationIEN (string, required) - Location IEN

    + patientStatus (string, required) - Patient status

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "serviceCategory": "ssss"
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/visit_serviceCategory-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


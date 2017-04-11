# Group Patient

## Patient record labsbypanel [{{{path}}}{?pid}{&start}{&limit}{&filter}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    :[start]({{{common}}}/parameters/start.md)

    :[limit]({{{common}}}/parameters/limit.md)

    :[filter]({{{common}}}/parameters/filter.md)


### Get [GET]

Get lab orders for a panel

+ Response 200 (application/json)

    + Body

            {
                "apiVersion": "ssss",
                "data": {
                    "currentItemCount": 2,
                    "items": [],
                    "totalItems": 2,
                    "updated": 2
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_labs_by-panel-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


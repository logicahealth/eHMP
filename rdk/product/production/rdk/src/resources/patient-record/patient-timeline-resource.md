# Group Patient

## Patient record timeline [{{{path}}}{?pid}{&uid}{&start}{&limit}{&filter}{&order}{&fields}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    :[uid]({{{common}}}/parameters/uid.md)

    :[start]({{{common}}}/parameters/start.md)

    :[limit]({{{common}}}/parameters/limit.md)

    :[filter]({{{common}}}/parameters/filter.md)

    :[order]({{{common}}}/parameters/order.md)

    :[fields]({{{common}}}/parameters/fields.md)


### Get [GET]

Get timeline data for a patient

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "currentItemCount": 2,
                    "items": [],
                    "totalItems": 2
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_timeline-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


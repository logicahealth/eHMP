# Group Patient

## Patient record cwad [{{{path}}}{?pid}{&start}{&limit}{&range}{&filter}{&order}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    :[start]({{{common}}}/parameters/start.md)

    :[limit]({{{common}}}/parameters/limit.md)

    + range: `Advance Directive` (string, optional) - The JDS range query of the request.

    :[filter]({{{common}}}/parameters/filter.md)

    :[order]({{{common}}}/parameters/order.md)


### Get [GET]

Get crisis, warnings, allergies, and directives for a patient

+ Response 200 (application/json)

    + Body

            {
                "apiVersion": "ssss",
                "data": {
                    "currentItemCount": 2,
                    "items": [],
                    "itemsPerPage": 2,
                    "pageIndex": 2,
                    "startIndex": 2,
                    "totalItems": 2,
                    "totalPages": 2,
                    "updated": 2
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_cwad-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


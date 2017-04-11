# Group Patient

## Patient record labsbytype [{{{path}}}{?pid}{&type.name}{&date.start}{&date.end}{&start}{&limit}{&order}{&fields}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + type.name (string, required) - typeName attribute of the laboratories being selected. Results will always be returned sorted by descending observed date.

    :[date.start]({{{common}}}/parameters/date.start.md)

    :[date.end]({{{common}}}/parameters/date.end.md)

    :[start]({{{common}}}/parameters/start.md)

    :[limit]({{{common}}}/parameters/limit.md)

    :[order]({{{common}}}/parameters/order.md)

    :[fields]({{{common}}}/parameters/fields.md)


### Get [GET]

Get labs by type for a patient

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

            :[Schema]({{{common}}}/schemas/patient_record_labs_by-type-GET-200.jsonschema)

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
                "message": "Not found",
                "status": 404
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_labs_by-type-GET-404.jsonschema)

:[Response 500]({{{common}}}/responses/500.md)

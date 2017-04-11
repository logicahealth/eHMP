# Group Patient

## Patient record labsbyorder [{{{path}}}{?pid}{&uid}{&start}{&limit}{&order}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    :[uid]({{{common}}}/parameters/uid.md required:"required")

    :[start]({{{common}}}/parameters/start.md)

    :[limit]({{{common}}}/parameters/limit.md)

    :[order]({{{common}}}/parameters/order.md)


### Get [GET]

Get patient labs for an order

+ Response 200 (application/json)

    + Body

            {
                "currentItemCount": 2,
                "data": {
                    "items": []
                },
                "itemsPerPage": 2,
                "pageIndex": 2,
                "startIndex": 2,
                "status": 200,
                "totalItems": 2,
                "totalPages": 2
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_labs_by-order-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


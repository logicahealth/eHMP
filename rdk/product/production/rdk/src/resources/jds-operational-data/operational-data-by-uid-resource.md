# Group Operational data

## Returns operational data by uid [{{{path}}}{?uid}]

+ Parameters

    :[uid]({{{common}}}/parameters/uid.md required:"required")

### Get [GET]

Returns operational data by uid

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": []
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/operational-data-by-uid-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

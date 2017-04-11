# Group Problems

## Problems get Problems [{{{path}}}{?query}{&uncoded}{&limit}{&fields}]

+ Parameters

    + query (string, required) - the term used to used to search for problems


    :[limit]({{{common}}}/parameters/limit.md)

    :[fields]({{{common}}}/parameters/fields.md)


### Get [GET]

Returns array of problem items that match submitted search term

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": []
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/problems-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


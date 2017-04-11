# Group User

## User defined screens [{{{path}}}{?predefinedScreens}{&fields}]

+ Parameters

    + predefinedScreens (string, optional) - Comma-separated ID's of predefined screens to return data for.

    :[fields]({{{common}}}/parameters/fields.md)


### Get [GET]

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "_id": "ssss",
                    "userDefinedFilters": [],
                    "userDefinedGraphs": [],
                    "userDefinedScreens": [],
                    "userScreensConfig": {
                        "screens": []
                    }
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/user_screens-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


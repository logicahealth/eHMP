# Group eHMP Versions

## eHMP versions list [{{{path}}}]

### Get [GET {{{path}}}]

Get the list of eHMP versions

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "versions": [
                        {
                            "id": "1.2.0"
                        },
                        {
                            "id": "2.0.0"
                        }
                    ]
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/ehmp-versions-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


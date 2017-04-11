# Configuration Resources

## feature flag [{{{path}}}]

### GET [GET {{{path}}}/ehmp-config]

Get the current ehmp configuration as assigned during deployment

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "trackSolrStorage": false
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/ehmp-configuration-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

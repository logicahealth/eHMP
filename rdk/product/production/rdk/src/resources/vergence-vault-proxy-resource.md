# Group Vergencevaultproxy

## Vergencevaultproxy get [{{{path}}}]

### Icnforccow [POST {{{path}}}/getICNForCCOW]

Get an ICN given a site and DFN

+ Request JSON Message (application/json)

    + Body

            {
                "site": "ssss",
                "dfn": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "site",
                    "dfn"
                ],
                "properties": {
                    "site": {
                        "type": "string"
                    },
                    "dfn": {
                        "type": "string"
                    }
                }
            }

+ Response 200 (application/json)

    + Body

            {
                "pid": "9E7A;3",
                "site": "ssss"
            }

    + Schema

            :[Schema]({{{common}}}/schemas/vergencevaultproxy_getICNForCCOW-POST-200.jsonschema)

+ Response 400 (application/json)

    + Body

            {
                "data": [
                    "The required parameter \"pid\" is missing."
                ],
                "status": 400
            }

    + Schema

            :[Schema]({{{common}}}/schemas/vergencevaultproxy_getICNForCCOW-POST-400.jsonschema)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Site Info [GET {{{path}}}/getSiteInfo{?site}{&fields}]

Get information about a site

+ Parameters

    + site (string, required) - The site to return information about

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

    + Body

            {
                "Site": {
                    "accessCode": "ssss",
                    "division": "ssss",
                    "host": "ssss",
                    "infoButtonOid": "ssss",
                    "localAddress": "ssss",
                    "localIP": "ssss",
                    "name": "ssss",
                    "port": 2,
                    "production": true,
                    "verifyCode": "ssss"
                }
            }

    + Schema

            :[Schema]({{{common}}}/schemas/vergencevaultproxy_getSiteInfo-GET-200.jsonschema)

+ Response 400 (application/json)

    + Body

            {
                "data": [
                    "The required parameter \"pid\" is missing."
                ],
                "status": 400
            }

    + Schema

            :[Schema]({{{common}}}/schemas/vergencevaultproxy_getSiteInfo-GET-400.jsonschema)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


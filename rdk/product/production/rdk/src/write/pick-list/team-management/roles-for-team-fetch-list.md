# Group Pick List

## Roles for a Team [/roles-for-team{?site}{&teamID}]

Returns roles for a team -- note that this involves a call to pcmm instead of an RPC.

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + teamID (string, required) - Team ID to find roles for.

### GET

+ Response 200 (application/json)

    + Body

            {
                "data": [{
                    "roleID": "46n2",
                    "name": "Meynard"
                }, {
                    "roleID": "57bb3",
                    "name": "Freud"
                }],
                "status": 200
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "data": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "roleID": {
                                    "type": "string"
                                },
                                "name": {
                                    "type": "string"
                                }
                            },
                            "required": [
                                "roleID",
                                "name"
                            ]
                        }
                    },
                    "status": {
                        "type": "integer"
                    }
                },
                "required": [
                    "data",
                    "status"
                ]
            }

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

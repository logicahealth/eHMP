# Group Pick List

## Teams for User [/teams-for-user{?site}{&staffIEN}]

Searches for teams for a user -- note that this involves a call to pcmm instead of an RPC.

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + staffIEN (string, required) - IEN of user to find teams for.

### GET

+ Response 200 (application/json)

    + Body

            {
                "data": [{
                    "teamID": "The A team",
                    "teamName": "Baracus - ABB"
                }, {
                    "teamID": "Jurassic Team",
                    "teamName": "Cretaceous - CDD"
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
                                "teamID": {
                                    "type": "string"
                                },
                                "teamName": {
                                    "type": "string"
                                }
                            },
                            "required": [
                                "teamID",
                                "teamName"
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

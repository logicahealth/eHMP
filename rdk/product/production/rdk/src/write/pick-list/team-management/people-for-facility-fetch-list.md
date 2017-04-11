# Group Pick List

## People for a Facility [/people-for-facility{?site}{&facilityID}]

Get people at a facility -- note that this involves a call to JDS instead of an RPC.

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + facilityID (string, required) - ID of facility to find people for.

### GET

+ Response 200 (application/json)

    + Body

            {
                "data": [{
                    "personID": "ABCD;uno1",
                    "name": "lasties, firsties"
                }, {
                    "personID": "ABCD;dos2",
                    "name": "Do, John (Supreme Commander)"
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
                                "personID": {
                                    "type": "string"
                                },
                                "name": {
                                    "type": "string"
                                }
                            },
                            "required": [
                                "personID",
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

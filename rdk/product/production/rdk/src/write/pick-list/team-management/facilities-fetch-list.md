# Group Pick List

## Facilities [/facilities{?site}{&teamFocus}{&siteCode}]

Searches for facilities -- note that this involves a call to pcmm instead of an RPC.

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + teamFocus (string, optional) - Team focus name to filter by.

    + siteCode (string, optional) - Site code to filter by.

### GET

+ Response 200 (application/json)

    + Body

            {
                "data": [{
                    "facilityID": "station1",
                    "vistaName": "name1 (NMA)"
                }, {
                    "facilityID": "station2",
                    "vistaName": "name2 (NMB)"
                }, {
                    "facilityID": "station3",
                    "vistaName": "name3 (NMC) city3"
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
                                "facilityID": {
                                    "type": "string"
                                },
                                "vistaName": {
                                    "type": "string"
                                }
                            },
                            "required": [
                                "facilityID",
                                "vistaName"
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

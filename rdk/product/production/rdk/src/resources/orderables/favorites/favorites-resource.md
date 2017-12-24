# Group Orderables

## Favorites [{{{path}}}]

### POST [POST {{{path}}}{?id}{?type}{?domain}{?siteId}]

Create Favorites

+ Parameters

	+ id: `urn:va:ordersets:2` (string, optional) - id of the favorite
    + type: `orderset` (string, optional) - type of the favorite
    + domain (string, optional) - domain for orderable
        + Members
            + `lab` - Laboratory orderables
            + `rad` - Radiology orderables
    + siteId: `SITE` (string, optional) - siteId for orderable

+ Request JSON Message (application/json)

	+ Body

            {
                "id": "urn:va:ordersets:2",
                "type":"orderset",
                "siteId":"SITE",
                "userid": "urn:va:user:SITE:10000000270"
            }

	+ Schema

			:[Schema]({{{common}}}/schemas/favorites-POST-payload.jsonschema)

+ Request Query Paramters (application/json)

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": ["object", "string"],
                "properties": {},
                "allowAdditionalProperties": false
            }

+ Response 201 (application/json)

+ Response 400 (application/json)

        {
            "message": "Invalid Favorites object. Favorite must at least the following properties: name, type",
            "status": 400
        }

:[Response 500]({{{common}}}/responses/500.md)


### Get [GET {{{path}}}]

Get Favorites

+ Response 200 (application/json)

	+ Body

            {
                "statusCode": 200,
                "data": {
                    "items": [
                    {
                        "properties": {
                        "id": "urn:va:ordersets:2",
                        "type": "orderset",
                        "userid": "urn:va:user:SITE:10000000270"
                        },
                        "type": "orderset",
                        "uid": "urn:va:ordersets:2orderseturn:va:user:SITE:10000000270"
                    }
                    ]
                },
                "status": 200
            }

	+ Schema

			:[Schema]({{{common}}}/schemas/favorites-GET-200.jsonschema)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



### DELETE [DELETE {{{path}}}{?id}{?type}{?domain}{?siteId}]

Delete Favorites

+ Parameters

	+ id (string, optional) - id of the favorite
    + type (string, optional) - type of the favorite
    + domain (string, optional) - domain for orderable
    + siteId (string, optional) - siteId for orderable

+ Request JSON Message (application/json)

	+ Body

            {
                "id": "urn:va:ordersets:2",
                "type":"orderset",
                "siteId":"SITE",
                "userid": "urn:va:user:SITE:10000000270"
            }

	+ Schema

			:[Schema]({{{common}}}/schemas/favorites-POST-payload.jsonschema)

+ Request Query Paramters (application/json)

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": ["object", "string"],
                "properties": {},
                "allowAdditionalProperties": false
            }

+ Response 204

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)

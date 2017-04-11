# Group Example

## Example Writeback Resource [{{{path}}}]

See [our docs](https://ehmp.vistacore.us/documentation/#/rdk/documenting) for how to write [API Blueprint](https://github.com/apiaryio/api-blueprint/blob/master/API%20Blueprint%20Specification.md) documentation for the RDK.

### Add [POST]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

+ Request JSON Body (application/json)

    + Body

            {
                "name": "Bob"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": ["name"],
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "name of thing"
                    }
                }
            }

+ Response 200 (application/json)

    + Body

            {
                "message": "GET successful",
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Test [PUT {{{path}}}/{resourceId}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + resourceId (string, required) - Unique resource ID

+ Request (applicaton/json)

    + Body

            {
                "id": "123",
                "comment": "You can't name a planet Bob!"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": ["id", "comment"],
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "unique id of thing"
                    },
                    "comment": {
                        "type": "string",
                        "description": "new comment about thing with unique id = id"
                    }
                }
            }

+ Response 200 (application/json)

    + Body

            {
                "message": "My message",
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Test [GET {{{path}}}{?myQueryParam}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + myQueryParam (string, required) - Example query parameter

+ Response 200 (application/json)

    + Body

            {
                "data": {},
                "status": 200
            }

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

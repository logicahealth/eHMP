# Group Example

## Example [{{{path}}}]

See [our docs](https://ehmp.vistacore.us/documentation/#/rdk/documenting) for how to write [API Blueprint](https://github.com/apiaryio/api-blueprint/blob/master/API%20Blueprint%20Specification.md) documentation for the RDK.

### Test [GET {{{path}}}{?myQueryParam}]

Example resource

+ Parameters

	+ myQueryParam (string, required) - Example query parameter

+ Response 200 (application/json)

    + Body

            {
                "message": "GET successful",
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"myQueryParam")


### Test [POST]

Example resource

+ Request (applicaton/json)

	+ Body

			"My message"

+ Response 200 (application/json)

    + Body

            {
                "message": "My message",
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)

+ Response 418 (application/json)

    + Body

            {
                "message": "Example",
                "status": 418
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)

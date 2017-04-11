# Group Patient

## Consult Order [{{{path}}}]

### Signature [POST {{{path}}}/consult-sign]

Validate order signature.

+ Request JSON Message (application/json)

    + Body

            {
                "signature": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "signature"
                ],
                "properties": {
                    "signature": {
                        "type": "string",
                        "description": "Order Signature"
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


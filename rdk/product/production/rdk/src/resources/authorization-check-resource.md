# Group Authorize

## Authorize [{{{path}}}{?pid}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

### Get [GET]

Check whether a user is logged in and has permission to access a patient.

#### Notes

Requires the authentication and PEP interceptors to perform the access checks.

+ Response 200 (application/json)

    + Body

            {
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authorize-GET-200.jsonschema)

+ Response 307 (application/json)

    + Body

            {
                "message": "\r\n***RESTRICTED RECORD***\r\n* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * \r\n* This record is protected by the Privacy Act of 1974 and the Health    *\r\n* Insurance Portability and Accountability Act of 1996. If you elect    *\r\n* to proceed, you will be required to prove you have a need to know.    *\r\n* Accessing this patient is tracked, and your station Security Officer  *\r\n* will contact you for your justification.                              *\r\n* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *",
                "status": 307
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authorize-GET-error.jsonschema)

+ Response 308 (application/json)

    + Body

            {
                "message": "\r\n***RESTRICTED RECORD***\r\n* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * \r\n* This record is protected by the Privacy Act of 1974 and the Health    *\r\n* Insurance Portability and Accountability Act of 1996. If you elect    *\r\n* to proceed, you will be required to prove you have a need to know.    *\r\n* Accessing this patient is tracked, and your station Security Officer  *\r\n* will contact you for your justification.                              *\r\n* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *",
                "status": 308
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authorize-GET-error.jsonschema)

+ Response 403 (application/json)

    + Body

            {
                "message": "PEP: Unable to process request.",
                "status": 403
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authorize-GET-error.jsonschema)

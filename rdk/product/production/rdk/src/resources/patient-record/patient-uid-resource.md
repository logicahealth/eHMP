# Group Patient

## Uid [{{{path}}}{?pid}{&uid}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    :[uid]({{{common}}}/parameters/uid.md example:"urn:va:problem:SITE:3:747" required:"required")


### Get [GET]

Get patient uid

+ Response 200 (application/json)

    + Body

            {
                "apiVersion": "ssss",
                "data": {
                    "currentItemCount": 2,
                    "items": [],
                    "totalItems": 2,
                    "updated": 2
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_uid-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

+ Response 404 (application/json)

    + Body

            {
                "data": {
                    "apiVersion": "ssss",
                    "error": {
                        "code": 2,
                        "errors": [],
                        "message": "ssss",
                        "request": "ssss"
                    }
                },
                "status": 404
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_uid-GET-404.jsonschema)

:[Response 500]({{{common}}}/responses/500.md)

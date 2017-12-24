# Group Patient

## Patient record notes [{{{path}}}]


### Get [GET {{{path}}}{?pid}{&localPid}]

Get notes data for a patient

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + localPid (string, required) - local patient id

        Pattern: `^([a-zA-Z0-9]+);([a-zA-Z0-9]+)$|^([0-9]+)V([0-9]+)$`

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

+ Response 500 (application/json)

    + Body

            {
                "data":[
                    "Unable to reach pJDS"
                ],
                "status":500
            }

    + Schema

            :[schema]({{{common}}}/schemas/patient_record_notes-GET-500.jsonschema)


### Get Note UID [GET {{{path}}}/consultuid{?consultUid}]

Get note UID associated with a consult UID

+ Parameters

    + consultUid (string, required) - UID of the consult

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "noteClinicalObjectUid": "urn:va:ehmp-note:SITE;3:98a309a4-1b97-4b35-b66a-0d631cac6512"
                },
                "status": 200
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "data": {
                        "type": "object",
                        "properties": {
                            "noteClinicalObjectUid": {
                                "type": "string"
                            }
                        },
                        "required": [
                            "noteClinicalObjectUid"
                        ]
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

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

+ Response 500 (application/json)

    + Body

            {
                "data":[
                    "Unable to reach pJDS"
                ],
                "status":500
            }

    + Schema

            :[schema]({{{common}}}/schemas/patient_record_notes-GET-500.jsonschema)


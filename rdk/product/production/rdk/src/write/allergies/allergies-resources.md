# Group Writeback

## Allergies [{{{path}}}]

### Add [POST]

Add a new allergy for a patient to single Vista

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)


+ Request JSON Message (application/json)

    + Body

            {
                "IEN": "ssss",
                "allergyName": "ssss",
                "enteredBy": "ssss",
                "eventDateTime": "ssss",
                "historicalOrObserved": "o^OBSERVED",
                "name": "ssss",
                "natureOfReaction": "ssss",
                "observedDate": "ssss",
                "severity": "ssss",
                "symptoms": [],
                "comment": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "IEN",
                    "allergyName",
                    "enteredBy",
                    "eventDateTime",
                    "historicalOrObserved",
                    "name",
                    "natureOfReaction",
                    "observedDate",
                    "severity",
                    "symptoms"
                ],
                "properties": {
                    "IEN": {
                        "type": "string",
                        "description": "IEN for the specific allergy"
                    },
                    "allergyName": {
                        "type": "string",
                        "description": "allergy name (Vista format)"
                    },
                    "eventDateTime": {
                        "type": "string",
                        "description": ""
                    },
                    "historicalOrObserved": {
                        "type": "string",
                        "description": "",
                        "enum": [
                            "o^OBSERVED",
                            "h^HISTORICAL"
                        ]
                    },
                    "name": {
                        "type": "string",
                        "description": "name of allergy"
                    },
                    "natureOfReaction": {
                        "type": "string",
                        "description": ""
                    },
                    "observedDate": {
                        "type": "string",
                        "description": ""
                    },
                    "severity": {
                        "type": "string",
                        "description": "severity level"
                    },
                    "symptoms": {
                        "type": "array",
                        "description": "zero or more symptoms of allergy",
                        "items": {
                            "required": ["name", "IEN"],
                            "properties": {
                                    "name": {"type": "string", "description": "name of symptom"},
                                    "IEN": {"type": "string", "description": "unique id of symptom in a single Vista"},
                                    "dateTime": {"type": "string", "format": "date-time", "description": "date/time symptom noticed in yyyymmddHHMM format"},
                                    "symptomDate": {"type": "string", "format": "date", "description": "date symptom noticed in mm/dd/yyyy format"},
                                    "symptomTime": {"type": "string", "description": "time symptom noticed in \"hh\":mm a/p format"}
                            }
                        }
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Eie [PUT {{{path}}}/{resourceId}]

Update an existing patient allergy

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)


+ Request JSON Message (application/json)

    + Body

            {
                "localId": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "localId": {
                        "type": "string"
                    }
                },
                "required": [
                    "localId"
                ]
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


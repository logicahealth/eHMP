# Group Writeback

## Allergies [{{{path}}}]

### Add [POST]

Add a new allergy for a patient to single Vista

+ Parameters

    + pid (string, required) - patient id


+ Request JSON Message (application/json)

    + Body

            {
                "dfn": "ssss",
                "eventDateTime": "ssss",
                "allergyName": "ssss",
                "natureOfReaction": "ssss",
                "historicalOrObserved": "ssss",
                "comment": "ssss",
                "severity": "ssss",
                "name": "ssss",
                "IEN": "ssss",
                "location": "ssss",
                "observedDate": "ssss",
                "symptoms": []
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "dfn",
                    "eventDateTime",
                    "allergyName",
                    "natureOfReaction",
                    "historicalOrObserved"
                ],
                "properties": {
                    "dfn": {
                        "type": "string",
                        "description": ""
                    },
                    "eventDateTime": {
                        "type": "string",
                        "description": ""
                    },
                    "allergyName": {
                        "type": "string",
                        "description": ""
                    },
                    "natureOfReaction": {
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
                    "comment": {
                        "type": "string",
                        "description": ""
                    },
                    "severity": {
                        "type": "string",
                        "description": ""
                    },
                    "name": {
                        "type": "string",
                        "description": ""
                    },
                    "IEN": {
                        "type": "string",
                        "description": "unique id of allergy in a single Vista"
                    },
                    "location": {
                        "type": "string",
                        "description": ""
                    },
                    "observedDate": {
                        "type": "string",
                        "description": ""
                    },
                    "symptoms": {
                        "type": "array",
                        "description": "zero or more symptoms of allergy",
                        "items": {
                            "$ref": "Symptom"
                        }
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Eie [PUT]

Update an existing patient allergy

+ Parameters

    + pid (string, required) - patient id

    + resourceId (string, required) - allergy id


+ Request JSON Message (application/json)

    + Body

            {
                "dfn": "ssss",
                "eventDateTime": "ssss",
                "allergyName": "ssss",
                "enteredBy": "ssss",
                "natureOfReaction": "ssss",
                "historicalOrObserved": "ssss",
                "observedDate": "ssss",
                "severity": "ssss",
                "symptoms": []
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "dfn": {
                        "type": "string"
                    },
                    "eventDateTime": {
                        "type": "string"
                    },
                    "allergyName": {
                        "type": "string"
                    },
                    "enteredBy": {
                        "type": "string"
                    },
                    "natureOfReaction": {
                        "type": "string"
                    },
                    "historicalOrObserved": {
                        "type": "string",
                        "enum": [
                            "o^OBSERVED",
                            "h^HISTORICAL"
                        ]
                    },
                    "observedDate": {
                        "type": "string"
                    },
                    "severity": {
                        "type": "string"
                    },
                    "symptoms": {
                        "type": "array",
                        "items": {
                            "$ref": "UpdateAllergySymptom"
                        }
                    }
                },
                "required": [
                    "dfn",
                    "eventDateTime",
                    "allergyName",
                    "enteredBy",
                    "natureOfReaction",
                    "historicalOrObserved"
                ]
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


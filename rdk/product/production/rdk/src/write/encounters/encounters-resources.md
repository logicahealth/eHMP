# Group Patient

## Encounters [{{{path}}}]

### Encounters [POST]

Save encounter form information to VistA

+ Request JSON Message (application/json)

    + Body

            {
                "patientDFN": "ssss",
                "isInpatient": "1",
                "locationUid": "ssss",
                "encounterDateTime": "ssss",
                "primaryProviderIEN": "ssss",
                "isHistoricalVisit": "0"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "patientDFN",
                    "isInpatient",
                    "locationUid",
                    "encounterDateTime",
                    "primaryProviderIEN"
                ],
                "properties": {
                    "patientDFN": {
                        "type": "string",
                        "description": "patient DFN"
                    },
                    "isInpatient": {
                        "type": "string",
                        "description": "0 if patient is an outpatient, 1 if inpatient",
                        "enum": ["0", "1"]
                    },
                    "locationUid": {
                        "type": "string",
                        "description": "Uid of encounter location"
                    },
                    "encounterDateTime": {
                        "type": "string",
                        "description": "date/time of encounter"
                    },
                    "primaryProviderIEN": {
                        "type": "string",
                        "description": "IEN of primary provider on the encounter"
                    },
                    "isHistoricalVisit": {
                        "type": "string",
                        "description": "0 if encounter is not historical, 1 if encounter is historical",
                        "enum": ["0", "1"]
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


# Group Patient

## Encounters [{{{path}}}]

### Encounters [POST]

Save encounter form information to VistA

+ Parameters

    + pid (string, required) - patient id

    + patientDFN (string, required) - patient DFN

    + isInpatient (string, required) - 0 if patient is an outpatient, 1 if inpatient

    + locationIEN (string, required) - IEN of encounter location

    + encounterDateTime (string, required) - date/time of encounter

    + primaryProviderIEN (string, required) - IEN of primary provider on the encounter


+ Request JSON Message (application/json)

    + Body

            {
                "patientDFN": "ssss",
                "isInpatient": "ssss",
                "locationIEN": "ssss",
                "encounterDateTime": "ssss",
                "primaryProviderIEN", "ssss",
                "isHistoricalVisit", "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "patientDFN",
                    "isInpatient",
                    "locationIEN",
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
                        "description": "0 if patient is an outpatient, 1 if inpatient"
                    },
                    "locationIEN": {
                        "type": "string",
                        "description": "IEN of encounter location"
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
                        "description": "0 if encounter is not historical, 1 if encounter is historical"
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


# Group Writeback

## Immunizations [{{{path}}}]

### Add [POST]

Add a new immunization for a patient in a single Vista

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)


+ Request JSON Message (application/json)

    + Body

            {
                  "encounterInpatient":"ssss",
                  "encounterLocation":"ssss",
                  "location":"ssss",
                  "encounterServiceCategory":"ssss",
                  "encounterDateTime":"ssss",
                  "eventDateTime":"ssss",
                  "immunizationIEN":"ssss",
                  "encounterPatientDFN":"ssss",
                  "cvxCode":"ssss",
                  "immunizationNarrative":"ssss",
                  "informationSource":"ssss",
                  "authorUid":"ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                      "encounterInpatient",
                      "encounterLocation",
                      "location",
                      "encounterServiceCategory",
                      "encounterDateTime",
                      "eventDateTime",
                      "immunizationIEN",
                      "encounterPatientDFN",
                      "cvxCode",
                      "immunizationNarrative",
                      "informationSource",
                      "authorUid"
                ],
                "properties": {
                    "encounterInpatient": {
                        "type": "string",
                        "description": "inpatient or outpatient, 0 or 1"
                    },
                    "encounterLocation": {
                        "type": "string",
                        "description": "location for the encounter"
                    },
                    "location": {
                        "type": "string",
                        "description": "location"
                    },
                    "encounterServiceCategory": {
                        "type": "string",
                        "description": "service category for the encounter"
                    },
                    "encounterDateTime": {
                        "type": "string",
                        "description": "date and time for the encounter"
                    },
                    "eventDateTime": {
                        "type": "string",
                        "description": "date and time for the event"
                    },
                    "immunizationIEN": {
                        "type": "string",
                        "description": "IEN for the immunization"
                    },
                    "encounterPatientDFN": {
                        "type": "string",
                        "description": "patient DFN for the encounter"
                    },
                    "cvxCode": {
                        "type": "string",
                        "description": "cvxCode for the immunization"
                    },
                    "immunizationNarrative": {
                        "type": "string",
                        "description": "description for the immunization"
                    },
                    "informationSource": {
                        "type": "string",
                        "description": "information source for the immunization"
                    },
                    "authorUid": {
                        "type": "string",
                        "description": "author's UID"
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Set Entered In Error [PUT {{{path}}}/{resourceId}]

Mark an immunization as entered in error.

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + resourceId (string, required) - ID of the immunization

+ Request JSON Message (application/json)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

# Group Writeback

## Immunizations [{{{path}}}]

### Add [POST]

Add a new immunization for a patient in a single Vista

+ Parameters

    + pid (string, required) - patient id


+ Request JSON Message (application/json)

    + Body

            {
                  "encounterInpatient":"ssss",
                  "encounterLocation":"ssss",
                  "encounterServiceCategory":"ssss",
                  "encounterDateTime":"ssss",
                  "eventDateTime":"ssss",
                  "providerName":"ssss",
                  "encounterProviderIEN":"ssss",
                  "encounterPatientDFN":"ssss",
                  "immunizationIEN":"ssss",
                  "route":"ssss",
                  "dose":"ssss",
                  "cvxCode":"ssss",
                  "immunizationNarrative":"ssss",
                  "adminSite":"ssss",
                  "informationSource":"ssss",
                  "lotNumber":"ssss",
                  "manufacturer":"ssss",
                  "expirationDate":"ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                      "encounterInpatient",
                      "encounterLocation",
                      "encounterServiceCategory",
                      "encounterDateTime",
                      "eventDateTime",
                      "providerName",
                      "encounterProviderIEN",
                      "encounterPatientDFN",
                      "immunizationIEN",
                      "route",
                      "dose",
                      "cvxCode",
                      "immunizationNarrative",
                      "adminSite",
                      "informationSource",
                      "lotNumber",
                      "manufacturer",
                      "expirationDate"
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
                    "providerName": {
                        "type": "string",
                        "description": "name of the provider"
                    },
                    "encounterProviderIEN": {
                        "type": "string",
                        "description": "provider's IEN for the encounter"
                    },
                    "encounterPatientDFN": {
                        "type": "string",
                        "description": "patient DFN for the encounter"
                    },
                    "immunizationIEN": {
                        "type": "string",
                        "description": "IEN for the immunization"
                    },
                    "route": {
                        "type": "string",
                        "description": "route for the immunization"
                    },
                    "dose": {
                        "type": "string",
                        "description": "dose for the immunization"
                    },
                    "cvxCode": {
                        "type": "string",
                        "description": "cvxCode for the immunization"
                    },
                    "immunizationNarrative": {
                        "type": "string",
                        "description": "description for the immunization"
                    },
                    "adminSite": {
                        "type": "string",
                        "description": "site of administration for the immunization"
                    },
                    "informationSource": {
                        "type": "string",
                        "description": "information source for the immunization"
                    },
                    "lotNumber": {
                        "type": "string",
                        "description": "lot number for the immunization"
                    },
                    "manufacturer": {
                        "type": "string",
                        "description": "manufacturer for the immunization"
                    },
                    "expirationDate": {
                        "type": "string",
                        "description": "expiration date for the immunization"
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

    + pid (string, required) - patient id

    + resourceId (string, required) - ID of the immunization

+ Request JSON Message (application/json)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

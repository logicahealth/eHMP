# Group Writeback

## Problems [{{{path}}}]

### Problems [POST]

Save problem form information to VistA

+ Parameters

    + pid (string, required) - patient id


+ Request JSON Message (application/json)

    + Body

            {
                "patientIEN": "ssss",
                "patientName": "ssss",
                "dateLastModified" : "ssss",
                "dateOfOnset": "ssss",
                "dateRecorded": "ssss",
                "enteredBy": "ssss",
                "enteredByIEN": "ssss",
                "lexiconCode": "ssss",
                "problemName": "ssss",
                "problemText": "ssss",
                "providerIEN": "ssss",
                "recordingProvider": "ssss",
                "responsibleProvider": "ssss",
                "responsibleProviderIEN": "ssss",
                "service": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "patientIEN",
                    "patientName",
                    "dateLastModified",
                    "dateOfOnset",
                    "dateRecorded",
                    "enteredBy",
                    "enteredByIEN",
                    "problemName",
                    "problemText",
                    "providerIEN",
                    "recordingProvider",
                    "responsibleProvider",
                    "responsibleProviderIEN",
                    "service"
                ],
                "properties": {
                    "patientIEN": {
                        "type": "string",
                        "description": "patient IEN"
                    },
                    "patientName": {
                        "type": "string",
                        "description": "name of the patient"
                    },
                    "dateLastModified": {
                        "type": "string",
                        "description": "date last modified"
                    },
                    "dateOfOnset": {
                        "type": "string",
                        "description": "date/time of onset"
                    },
                    "dateRecorded": {
                        "type": "string",
                        "description": "date recorded"
                    },
                    "enteredBy": {
                        "type": "string",
                        "description": "entered by name"
                    },
                    "enteredByIEN": {
                        "type": "string",
                        "description": "entered by IEN"
                    },
                    "problemName": {
                        "type": "string",
                         "description": "name for the problem"
                    },
                    "problemText": {
                        "type": "string",
                        "description": "text for the problem"
                    },
                    "providerIEN": {
                        "type": "string",
                        "description": "provider IEN"
                    },
                    "recordingProvider" : {
                        "type": "string",
                        "description": "recording provider name"
                    },
                    "responsibleProvider" : {
                        "type": "string",
                        "description": "responsbile provider name"
                    },
                    "responsibleProviderIEN" : {
                        "type": "string",
                        "description": "responsible provider IEN"
                    },
                    "service" : {
                        "type": "string",
                        "description": "service type"
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

## Problems [{{{path}}}/:resourceId]

### Problems [PUT]

Update problem form information to VistA

+ Parameters

    + pid (string, required) - patient id


+ Request JSON Message (application/json)

    + Body

            {
                "problemIEN" : "sss",
                "dateLastModified": "ssss",
                "service" : "ssss",
                "problemName": "ssss",
                "problemText": "ssss",
                "dateOfOnset": "ssss",
                "status": "ssss",
                "responsibleProviderIEN": "ssss",
                "responsibleProvider": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "problemIEN",
                    "dateLastModified",
                    "service",
                    "problemName",
                    "problemText",
                    "dateOfOnset",
                    "status",
                    "responsibleProviderIEN",
                    "responsibleProvider"
                ],
                "properties": {
                    "problemIEN": {
                        "type": "string",
                        "description": "problem IEN"
                    },
                    "dateLastModified": {
                        "type": "string",
                        "description": "date last modified"
                    },
                    "service" : {
                        "type": "string",
                        "description": "service type"
                    },
                    "problemName": {
                        "type": "string",
                         "description": "name for the problem"
                    },
                    "problemText": {
                        "type": "string",
                        "description": "text for the problem"
                    },
                    "dateOfOnset": {
                        "type": "string",
                        "description": "date/time of onset"
                    },
                    "status": {
                        "type": "string",
                        "description": "problem status"
                    },
                    "responsibleProvider" : {
                        "type": "string",
                        "description": "responsbile provider name"
                    },
                    "responsibleProviderIEN" : {
                        "type": "string",
                        "description": "responsible provider IEN"
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

# Group Activities

## Activities [{{{path}}}]

### Availableactivities [GET {{{path}}}{?pagesize}{&siteCode}{&testIen}{&type}]

Get available activity definitions

+ Parameters

    + pagesize (number, optional) - Page Size

    + siteCode (string, optional) - VistA site identifier

    + testIen (string, optional) - lab test identifier, site-specific

    + type (enum[string], optional) - String-based lookup for non-site-specific activities. Currently supports only "note" value

        + Members
            + `note`


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Single Instance [GET {{{path}}}/singleInstance{?id}]

Get activity instances

+ Parameters

    + id (string) - ID of the instance

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Startactivity [POST {{{path}}}/start]

Start an activity workflow

+ Request JSON Message (application/json)

+ Response 200 (application/json)


### Abortactivity [POST {{{path}}}/abort]

Abort an activity

#### Notes

deploymentId requires format GroupId:ArtifactId:Version

+ Request JSON Message (application/json)

    + Body

            {
                "deploymentId": "ssss",
                "processInstanceId": 2
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "deploymentId",
                    "processInstanceId"
                ],
                "properties": {
                    "deploymentId": {
                        "type": "string"
                    },
                    "processInstanceId": {
                        "type": "integer"
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### StartActivityEvent [POST {{{path}}}/startactivityevent]

Start a new activity event

+ Request JSON Message (application/json)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

### Signal [POST {{{path}}}/signal]

Send signal to an activity or deployment

deploymentId requires format GroupId:ArtifactId:Version

+ Request JSON Message (application/json)

    + Body

            {
                "deploymentId": "org.kie.example:project1:1.0",
                "processInstanceId": 2,
                "parameter": {
                    "labResult": {
                        "objectType": "labResult",
                        "orderId": "1234",
                        "labTest": "Urinalysis",
                        "orderStatus": "Completed",
                        "resultDate": "03/23/2016",
                        "comment": "Results are final"
                    }
                }
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "deploymentId"
                ],
                "properties": {
                    "deploymentId": {
                        "type": "string"
                    },
                    "processInstanceId": {
                        "type": "integer"
                    },
                    "parameter": {
                        "type": "object"
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### CDS Results [POST {{{path}}}/cds-intent-service]

Gets results from CDS Results Service

deploymentId requires format GroupId:ArtifactId:Version

+ Request JSON Message (application/json)

    + Body

            {
                "context": {
                    "location": {
                        "entityType": "Location",
                        "id": "Location1",
                        "name": "Test Location"
                    },
                    "subject": {
                        "entityType": "Subject",
                        "id": "9E7A;140",
                        "name": "TestSubject"
                    },
                    "user": {
                        "entityType": "User",
                        "id": "Id1",
                        "name": "Tester"
                    }
                },
                "target": {
                    "intentsSet": [
                    "RheumatologyConsultScreen"
                    ],
                    "mode": "Normal",
                    "type": "Direct"
                }
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "context",
                    "target"
                ],
                "properties": {
                    "context": {
                        "type": "object"
                    },
                    "target": {
                        "type": "object"
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Activity Instance [POST {{{path}}}/activity-instance]

Post activity instance from jbpm by instance Id

deploymentId requires format GroupId:ArtifactId:Version

+ Request JSON Message (application/json)

    + Body

            {
                "deploymentId": "ssss",
                "processInstanceId": 2
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "deploymentId",
                    "processInstanceId"
                ],
                "properties": {
                    "deploymentId": {
                        "type": "string"
                    },
                    "processInstanceId": {
                        "type": "integer"
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Activity Instances Available [GET {{{path}}}/instances{&context}{&pid}{&createdByMe}{&intendedForMeAndMyTeams}{&startDate}{&endDate}{&mode}{&domain}{&showOnlyFlagged}]

Get activity instances

+ Parameters

    + context (string) - Either patient or staff

    :[pid]({{{common}}}/parameters/pid.md required:"optional")

        Required only with `patient` context.

    + mode (string, optional) - to query for instances that are 'open' or 'closed'. queries for both open and closed instances if set to undefined or 'all'
        + Default: `open`

    + createdByMe (boolean, optional) - to query for instances that are created by me
        + Default: `false`

    + intendedForMeAndMyTeams (boolean, optional) - to query for instances that are related to me or my teams
        + Default: `false`

    + startDate (string, optional) - designates the start of a date range for searches

    + endDate (string, optional) - designates the end of a date range for searches

    + domain (string, optional) - to query for instances that are in the specified domain 

    + showOnlyFlagged (boolean, optional) - Set to "true" to query for instances that are flagged.
        + Default: `false`





+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

# Group Tasks

## Tasks [{{{path}}}]

### Tasks [GET {{{path}}}{?fields}]

Get a list of tasks for the current provider

+ Parameters

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)


### Tasks [POST]

Get tasks with given context

+ Request JSON Message (application/json)

    + Body

            {
                "context": "ssss",
                "patientICN": "ssss",
                "status": "ssss",
                "priority": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "context"
                ],
                "properties": {
                    "context": {
                        "type": "string"
                    },
                    "patientICN": {
                        "type": "string"
                    },
                    "status": {
                        "type": "string"
                    },
                    "priority": {
                        "type": "string"
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Tasksbypatient [GET {{{path}}}/tasksbypatient{?patientid}{&patientname}{&priority}{&service}{&duedate}{&tasktype}{&role}{&team}{&initiator}{&todonote}{&taskreason}{&fields}]

Get tasks based on a set of passed parameters

+ Parameters

    + patientid (string, optional) - The patient identifier/ICN

    + patientname (string, optional) - The patient name

    + priority (string, optional) - The task priority

    + service (string, optional) - The service value of the task

    + duedate (string, optional) - The task due date

    + tasktype (string, optional) - The task type

    + role (string, optional) - The role of the task owner

    + team (string, optional) - The team of the task owner

    + initiator (string, optional) - The initiator of the task

    + todonote (string, optional) - The to do note of the task

    + taskreason (string, optional) - The reason for the task

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Changestate [POST {{{path}}}/changestate]

Update task state

+ Request JSON Message (application/json)

    + Body

            {
                "taskid": "ssss",
                "state": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "taskid",
                    "state"
                ],
                "properties": {
                    "taskid": {
                        "type": "string"
                    },
                    "state": {
                        "type": "string"
                    }
                }
            }


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Startprocess [POST {{{path}}}/startprocess]

Start process workflow

+ Request JSON Message (application/json)

+ Response 200 (application/json)


### Abortprocess [POST {{{path}}}/abortprocess]

Abort a process

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


### Getprocessdefinitions [GET {{{path}}}/getprocessdefinitions{?pagesize}{&fields}]

Get available process definitions

+ Parameters

    + pagesize (number, optional) - Page Size

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Getcurrenttask [POST {{{path}}}/getcurrenttask{?pagesize}{&fields}]

Get current tasks with given context

+ Request JSON Message (application/json)

    + Body

            {
                "processInstanceId": "nnnn",
                "patientICN": "ssss",
                "priority": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "processInstanceId"
                ],
                "properties": {
                    "processInstanceId": {
                        "type": "integer"
                    },
                    "patientICN": {
                        "type": "string"
                    },
                    "priority": {
                        "type": "string"
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Getactivitydefinitionsbyquery [GET {{{path}}}/getactivitydefinitionsbyquery{?siteCode}{&testIen}{&pagesize}{&fields}{&type}]

Get a list of activities that could be paired with a given action in ehmp

+ Parameters

    + siteCode (string, optional) - VistA site identifier

    + testIen (string, optional) - lab test identifier, site-specific

    + pagesize (number, optional) - Page Size

    + type (string, optional) - String-based lookup for non-site-specific activities. Currently supports only "note" value

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Gettask [GET {{{path}}}/gettask{?taskid}]

Get task details

+ Parameters

    + taskid (number, required) - task id

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### StartActivityEvent [POST {{{path}}}/startActivityEvent]

Start a new activity event

+ Request JSON Message (application/json)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

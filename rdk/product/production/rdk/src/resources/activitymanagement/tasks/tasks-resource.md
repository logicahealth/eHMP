# Group Tasks

## Tasks [{{{path}}}]

### Tasks [POST]

Get tasks with given context and assigned to certain parties
+ Request JSON Message (application/json)

    + Body

            {
                "context": "ssss",
                "subContext": "ssss",
                "pid": "9E7A;3",
                "status": "ssss",
                "priority": "ssss",
                "getNotifications": false,
                "startDate": "201605201509",
                "endDate": "201605222110"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "context",
                    "subContext"
                ],

                "properties": {
                    "context": {
                        "type": "string"
                    },
                    "subContext": {
                        "type": "string"
                    },
                    "pid": {
                        "type": "string",
                        "pattern": "^([a-zA-Z0-9]+);([a-zA-Z0-9]+)$|^([0-9]+)V([0-9]+)$"
                    },
                    "status": {
                        "type": "string"
                    },
                    "priority": {
                        "type": "string"
                    },
                    "getNotifications": {
                        "description": "Get associated notifications",
                        "type": "boolean"
                    },
                    "startDate": {
                        "description": "Start date range, format YYYYMMDDHHmm",
                        "type": "string",
                        "minLength": 12,
                        "maxLength": 12,
                        "pattern": "^[0-9]*$"
                    },
                    "endDate": {
                        "description": "End date range, format YYYYMMDDHHmm",
                        "type": "string",
                        "minLength": 12,
                        "maxLength": 12,
                        "pattern": "^[0-9]*$"
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Taskbyid [GET {{{path}}}/byid{?taskid}]

Get a single task by id

+ Parameters

    + taskid (number, required) - task id

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Changestate [POST {{{path}}}/update]

Update a given task state

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


### Getcurrenttask [POST {{{path}}}/current]

Get current tasks with given context

+ Request JSON Message (application/json)

    + Body

            {
                "processInstanceId": 23,
                "pid": "9E7A;3",
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
                    "pid": {
                        "type": "string",
                        "pattern": "^([a-zA-Z0-9]+);([a-zA-Z0-9]+)$|^([0-9]+)V([0-9]+)$"
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


### Gettask [GET {{{path}}}/task{?taskid}]

Returns all the details of task with given id, including: taskID, taskType (Human or System), and task state etc.

+ Parameters

    + taskid (number, required) - task id

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### GetOpenConsults [GET {{{path}}}/openconsults{?pid}]

Returns all the details of tasks of type open consult for a given user, including: taskID, taskType (Human or System), and task state etc.

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

        For the patient for whom we want open consults.

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


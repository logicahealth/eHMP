# Group User

## User defined filter [{{{path}}}]

### Get [GET {{{path}}}{?id}{&predefined}{&fields}]

+ Parameters

    + id (string, required) - workspace name

    + predefined (boolean, optional) - predefined screen flag

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

    + Body

            {
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/user_filter-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Post [POST]

+ Request JSON Message (application/json)

    + Body

            {
                "id": "9E7A;12345",
                "filter": "xxx",
                "instance-id": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "id": "Filter",
                "required": [
                    "id",
                    "filter",
                    "instance-id"
                ],
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "workspace name"
                    },
                    "filter": {
                        "type": "string",
                        "description": "string value of filter"
                    },
                    "instance-id": {
                        "type": "string",
                        "description": "Applet instance ID for which the filter applies"
                    }
                }
            }

+ Response 200 (application/json)

    + Body

            {
                "message": "Ok",
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/user_filter-POST-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Delete [DELETE]

+ Request JSON Message (application/json)

    + Body

            {
                "id": "9E7A;12345",
                "filter": "xxx",
                "instance-id": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "id": "Filter",
                "required": [
                    "id",
                    "filter",
                    "instance-id"
                ],
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "workspace name"
                    },
                    "filter": {
                        "type": "string",
                        "description": "string value of filter"
                    },
                    "instance-id": {
                        "type": "string",
                        "description": "Applet instance ID for which the filter applies"
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Put [PUT]

+ Request JSON Message (application/json)

    + Body

            {
                "fromId": "ssss",
                "toId": "ssss",
                "predefined": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "id": "Filter",
                "required": [
                    "fromId",
                    "toId"
                ],
                "properties": {
                    "fromId": {
                        "type": "string",
                        "description": "source workspace name"
                    },
                    "toId": {
                        "type": "string",
                        "description": "destination workspace name"
                    },
                    "predefined": {
                        "type": "string",
                        "description": "predefined screen flag (true or false)"
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### All [DELETE {{{path}}}/all]

+ Request JSON Message (application/json)

    + Body

            {
                "id": "9E7A;12345",
                "instanceId": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "id": "Filter",
                "required": [
                    "id",
                    "instanceId"
                ],
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "workspace name"
                    },
                    "instanceId": {
                        "type": "string",
                        "description": "Applet instance ID for which the filter applies"
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


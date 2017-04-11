# Group User

## Write user defined screens [{{{path}}}]

### Post [POST]

User defined screens JDS writeback resource

#### Notes

Posting an empty object will cause a delete operation

+ Request JSON Message (application/json)

    + Body

            {
                "screenType": "ssss",
                "param": {}
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "screenType",
                    "param"
                ],
                "properties": {
                    "screenType": {
                        "type": "string"
                    },
                    "param": {
                        "type": "object"
                    }
                }
            }

+ Response 200 (application/json)

    + Body

            {
                "message": "Success",
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/user_screens-POST-200.jsonschema)

+ Response 500 (application/json)

    + Body

            {
                "message": "Error",
                "status": 500
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)


### Copy [POST {{{path}}}/copy{?fromId}{&toId}{&predefined}]

User defined screens JDS writeback resource

#### Notes

Copy from one workspace to another

+ Parameters

    + fromId (string, required) - source workspace name

    + toId (string, required) - destination workspace name

    + predefined (string, optional) - destination workspace name


+ Request JSON Message (application/json)

+ Response 200 (application/json)

+ Response 500 (application/json)

    + Body

            {
                "message": "Error",
                "status": 500
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)


### Put [PUT {{{path}}}{?oldId}{&newId}]

User defined screens JDS writeback resource

#### Notes

Update workspace Id when workspace is renamed

+ Parameters

    + oldId (string, required) - source workspace name

    + newId (string, required) - destination workspace name


+ Request JSON Message (application/json)

+ Response 200 (application/json)

+ Response 500 (application/json)

    + Body

            {
                "message": "Error",
                "status": 500
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)


# Group User

## User defined stack [{{{path}}}]

### Get [GET {{{path}}}{?id}{&predefined}{&fields}]

Retrieve stacked graphs for a workspace

+ Parameters

    + id (string, required) - workspace name

    + predefined (boolean, optional) - predefined screen flag

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

:[Response 500]({{{common}}}/responses/500.md)


### Post [POST {{{path}}}]

Create a new stacked graph in a particular applet in a particular workspace

+ Request JSON Message (application/json)

    + id (string, required) - workspace name

    + graphType (string, required) - stacked graph type

    + typeName (string, required) - stacked graph data type for the supplied type of graph

    + instanceId (string, required) - stacked graph applet instance id

+ Response 200 (application/json)

:[Response 500]({{{common}}}/responses/500.md)


### Delete [DELETE {{{path}}}{?id}{&graphType}{&typeName}{&instanceId}]

Remove a stacked graph in a particular applet in a particular workspace

+ Parameters

    + id (string, required) - workspace name

    + graphType (string, required) - stacked graph type

    + typeName (string, required) - stacked graph data type for the supplied type of graph

    + instanceId (string, required) - stacked graph applet instance id


+ Response 200 (application/json)

:[Response 500]({{{common}}}/responses/500.md)


### All [DELETE {{{path}}}/all{?StackedGraph}]

+ Parameters

    + StackedGraph (user-stack-delete-all, optional)


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Put [PUT]

Update a stacked graph's order in a particular applet in a particular workspace

+ Request JSON Message (application/json)

    + Body

            {
                "id": "9E7A;12345",
                "instanceId": "ssss",
                "graphs": []
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string"
                    },
                    "instanceId": {
                        "type": "string"
                    },
                    "graphs": {
                        "type": "array",
                        "items": {
                            "$ref": "UpdateStackedGraphGraph"
                        }
                    }
                },
                "required": [
                    "id",
                    "instanceId",
                    "graphs"
                ]
            }

+ Response 200 (application/json)

:[Response 500]({{{common}}}/responses/500.md)

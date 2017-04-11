# Group Permissions

## Permissions [{{{path}}}]

### List [GET {{{path}}}/list{?fields}]

Used to get the eHMP Permission Sets from JDS.

+ Parameters

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

    + Body

            {
                "data": [{
                    "description": "",
                    "example": "",
                    "label": "Abort Task",
                    "note": "",
                    "status": "depricated",
                    "uid": "abort-task",
                    "value": "abort-task",
                    "version": "1.3.1"
                }, {
                    "description": "Ability to utilize the stacked graph applet to view patient information over time",
                    "example": "",
                    "label": "Access Stack Graph",
                    "note": "",
                    "status": "active",
                    "uid": "access-stack-graph",
                    "value": "access-stack-graph",
                    "version": "1.3.1"
                }],
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/permissions_list-GET-200.jsonschema)

:[Response 500]({{{common}}}/responses/500.md)

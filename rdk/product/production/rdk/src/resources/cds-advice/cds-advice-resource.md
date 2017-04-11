# Group Cds

## Cds advice [{{{path}}}]

### List [GET {{{path}}}/list{?pid}{&use}{&readStatus}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + use (string, required) - Rules invocation context

    + readStatus (string, optional) - Read status flag


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": []
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/cds_advice_list-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Detail [GET {{{path}}}/detail{?pid}{&id}{&use}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + id (string, required) - advice id

    + use (string, required) - Rules invocation context


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Set Read Status [PUT {{{path}}}/read-status{?pid}{&id}{&value}]

Sets the 'read' status of an assigned work product in the database.

+ Parameters

    + id (string, required) - Work product ID

    + value (string, required) - Read status of the work product


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


# Group Cds

## Cds advice [{{{path}}}]

### List [GET {{{path}}}/list{?pid}{&use}{&readStatus}{&fields}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + use (string, required) - Rules invocation context

    + readStatus (boolean, optional) - Read status flag

    :[fields]({{{common}}}/parameters/fields.md)


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


### Detail [GET {{{path}}}/detail{?pid}{&id}{&use}{&fields}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + id (string, required) - advice id

    + use (string, required) - Rules invocation context

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


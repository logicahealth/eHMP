# Group FHIR

## Composition [{{{path}}}]

### Get [GET {{{path}}}{?subject.identifier}{&type}{&start}{&_count}]

Converts a vpr document into a composition FHIR resource.

+ Parameters

    :[subject.identifier]({{{common}}}/parameters/subject.identifier.md)

    + type (string, optional) - type

    :[start]({{{common}}}/parameters/start.md)

    :[_count]({{{common}}}/parameters/count.md)


+ Response 200 (application/json)

+ Response 400 (application/json)

    + Body

            {
                "data": {
                    "errors": [
                        "The required parameter \"subject.identifier\" is missing."
                    ]
                },
                "status": 400
            }

    + Schema

            :[Schema]({{{common}}}/schemas/400.jsonschema)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Get [POST {{{path}}}/_search{?subject.identifier}{&type}{&start}{&_count}]

Converts a vpr document into a composition FHIR resource.

+ Parameters

    :[subject.identifier]({{{common}}}/parameters/subject.identifier.md)

    + type (string, optional) - type

    :[start]({{{common}}}/parameters/start.md)

    :[_count]({{{common}}}/parameters/count.md)


+ Response 200 (application/json)

+ Response 400 (application/json)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


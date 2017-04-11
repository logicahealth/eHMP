# Group FHIR

## Composition [{{{path}}}{?subject.identifier}{&type}{&start}{&limit}]

+ Parameters

    :[subject.identifier]({{{common}}}/parameters/subject.identifier.md)

    + type (string, optional) - type

    :[start]({{{common}}}/parameters/start.md)

    :[limit]({{{common}}}/parameters/limit.md)


### Fhir composition [GET]

Converts a vpr document into a composition FHIR resource.

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


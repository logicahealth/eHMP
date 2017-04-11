# Group FHIR

## Vitals observation [{{{path}}}]

### Fhir patient observation [GET {{{path}}}{?limit}{&code}{&date}{&fields}]

Converts a vpr 'vitals' resource into a FHIR 'observation' resource.

+ Parameters

    :[id]({{{common}}}/parameters/fhir.id.md)

    :[limit]({{{common}}}/parameters/limit.md)

    + code (string, optional) - Code and/or system of the observation type (e.g. http://loinc.org|8310-5)

    + date (string, optional) - Obtained date/time (e.g. date=>2015/01/15)

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


# Group FHIR

## Condition get Problems [{{{path}}}]

### Fhir patient condition [GET {{{path}}}{?limit}{&date-asserted}{&onset}{&fields}]

Converts a vpr 'Problem' resource into a FHIR 'Condition' resource.

+ Parameters

    :[id]({{{common}}}/parameters/fhir.id.md)

    :[limit]({{{common}}}/parameters/limit.md)

    + date-asserted (string, optional) - date-asserted date/time (e.g. date-asserted=>2015/01/15)

    + onset (string, optional) - onset date/time (e.g. onset=>2015/01/15)

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


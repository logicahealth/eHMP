# Group FHIR

## Condition - Problems [{{{path}}}]

### Get [GET {{{path}}}{?_count}{&date-asserted}{&onset}{&_sort}]

Converts a vpr 'Problem' resource into a FHIR 'Condition' resource.

+ Parameters

    :[id]({{{common}}}/parameters/fhir.id.md)

    :[_count]({{{common}}}/parameters/count.md)

    + `date-asserted`: `>2015/01/15` (string, optional) - date-asserted date/time

    + onset: `>2015/01/15` (string, optional) - onset date/time

    + _sort (string, optional) - Sort criteria. Ascending order by default.

        Pattern: `(asserter|code|date-asserted|onset|patient):(asc|desc)`

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Get [POST {{{path}}}/_search{?_count}{&date-asserted}{&onset}]

Converts a vpr 'Problem' resource into a FHIR 'Condition' resource.

+ Parameters

    :[id]({{{common}}}/parameters/fhir.id.md)

    :[_count]({{{common}}}/parameters/count.md)

    + `date-asserted`: `>2015/01/15` (string, optional) - date-asserted date/time

    + onset: `>2015/01/15` (string, optional) - onset date/time


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



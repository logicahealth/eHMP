# Group FHIR

## Observation [{{{path}}}]

### Get [GET {{{path}}}{?_count}{&code}{&date*}{&_tag}{&_sort}{&_sort:desc}{&_sort:asc}]

Converts a vpr 'vitals', 'history' resources into a FHIR 'observation' resource.

+ Parameters

    :[id]({{{common}}}/parameters/fhir.id.md)

    :[_count]({{{common}}}/parameters/count.md)

    + code (string, optional) - Code and/or system of the observation type, e.g. http://loinc.org|8310-5

    + date: `>2015/01/15` (string, optional) - Obtained date/time

    + _tag (string, optional) - To specify a specific subset, vital-signs

    + _sort (string, optional) - Sort criteria. Ascending order by default.

        + Members
            + `date`
            + `identifier`
            + `patient`
            + `performer`
            + `subject`
            + `value-quantity`

    + `_sort:desc` (string, optional) - Sort criteria. Ascending order by default.

        + Members
            + `date`
            + `identifier`
            + `patient`
            + `performer`
            + `subject`
            + `value-quantity`

    + `_sort:asc` (string, optional) - Sort criteria. Ascending order by default.

        + Members
            + `date`
            + `identifier`
            + `patient`
            + `performer`
            + `subject`
            + `value-quantity`

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Get [POST {{{path}}}/_search{?_count}{&code}{&date*}{_tag}]

Converts a vpr 'vitals', 'history' resources into a FHIR 'observation' resource.

+ Parameters

    :[id]({{{common}}}/parameters/fhir.id.md)

    :[_count]({{{common}}}/parameters/count.md)

    + code (string, optional) - Code and/or system of the observation type, e.g. http://loinc.org|8310-5

    + date: `>2015/01/15` (string, optional) - Obtained date/time

    + _tag (string, optional) - To specify a specific subset, vital-signs

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


# Group FHIR

## Diagnostic Report  [{{{path}}}]

### Get [GET {{{path}}}{?_count}{&service}{&domain}{&date}{&_sort}]

Converts 'laboratory' 'imaging' or 'accession' vpr resource into a FHIR diagnostic report.

+ Parameters

    :[id]({{{common}}}/parameters/fhir.id.md)

    :[_count]({{{common}}}/parameters/count.md)

    + service (string, optional) - Which diagnostic discipline/department created the report

    + domain (enum[string], optional) - domain

        + Members
            + `lab` - Laboratory
            + `rad` - Imaging
            + `ap` - Accession

    + date: `>2015/01/15` (string, optional) - Obtained date/time

    + _sort (string, optional) - Sort criteria. Ascending order by default.

        Pattern: `(date|identifier|issued|performer|result|service|specimen|status):(asc|desc)`

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Get [POST {{{path}}}/_search{?_count}{&service}{&domain}{&date}]

Converts 'laboratory' 'imaging' or 'accession' vpr resource into a FHIR diagnostic report.

+ Parameters

    :[id]({{{common}}}/parameters/fhir.id.md)

    :[_count]({{{common}}}/parameters/count.md)

    + service (string, optional) - Which diagnostic discipline/department created the report

    + domain (enum[string], optional) - domain

        + Members
            + `lab` - Laboratory
            + `rad` - Imaging
            + `ap` - Accession

    + date: `>2015/01/15` (string, optional) - Obtained date/time

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


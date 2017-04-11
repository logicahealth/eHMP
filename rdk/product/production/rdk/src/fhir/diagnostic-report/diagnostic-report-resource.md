# Group FHIR

## Diagnosticreport diagnosticreport [{{{path}}}]

### Fhir diagnosticreport [GET {{{path}}}{?limit}{&service}{&domain}{&date}{&fields}]

Converts 'laboratory' 'imaging' or 'accession' vpr resource into a FHIR diagnostic resport.

+ Parameters

    :[id]({{{common}}}/parameters/fhir.id.md)

    :[limit]({{{common}}}/parameters/limit.md)

    + service (string, optional) - Which diagnostic discipline/department created the report

    + domain (enum[string], optional) - domain

        + Members
            + `lab` - Laboratory
            + `rad` - Imaging
            + `ap` - Accession


    + date (string, optional) - Obtained date/time (e.g. date=>2015/01/15)

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


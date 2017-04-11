# Group Patient

## Patient record search by type [{{{path}}}]

### Patient record search by type {domain} [GET {{{path}}}/{domain}{?pid}{&type}{&date.start}{&date.end}{&start}{&limit}{&order}{&fields}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + domain (enum[string], required)

        + Members
            + `immunization`
            + `lab`
            + `vital`


    + type (string, required) - the selected type attribute — the typeName of lab/vital or name of immunization. Results will always be returned sorted by descending date.

    :[date.start]({{{common}}}/parameters/date.start.md)

    :[date.end]({{{common}}}/parameters/date.end.md)

    :[start]({{{common}}}/parameters/start.md)

    :[limit]({{{common}}}/parameters/limit.md)

    :[order]({{{common}}}/parameters/order.md)

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)
:[Response 404]({{{common}}}/responses/404.md)
:[Response 500]({{{common}}}/responses/500.md)


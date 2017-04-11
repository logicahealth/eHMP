# Group Patient

## Patient record [{{{path}}}]

### Patient record {domain} [GET {{{path}}}/domain/{domain}{?pid}{&uid}{&start}{&limit}{&filter}{&order}{&callType}{&vler_uid}]

Get record data of one domain for a patient

+ Parameters

    + domain (enum[string], required) - domain

        + Members
            + `accession`
            + `allergy`
            + `appointment`
            + `consult`
            + `cpt`
            + `document`
            + `document-view`
            + `education`
            + `exam`
            + `factor`
            + `image`
            + `immunization`
            + `lab`
            + `med`
            + `mh`
            + `newsfeed`
            + `obs`
            + `order`
            + `parent-documents`
            + `patient`
            + `pov`
            + `problem`
            + `procedure`
            + `ptf`
            + `rad`
            + `skin`
            + `surgery`
            + `treatment`
            + `visit`
            + `vital`
            + `vlerdocument`


    :[pid]({{{common}}}/parameters/pid.md)

    :[uid]({{{common}}}/parameters/uid.md)

    :[start]({{{common}}}/parameters/start.md)

    :[limit]({{{common}}}/parameters/limit.md)

    :[filter]({{{common}}}/parameters/filter.md)

    :[order]({{{common}}}/parameters/order.md)

    + callType (string, optional) - the type of vlerdocument call

        + Members
            + `coversheet`
            + `modal`
            + `vler_list`
            + `vler_modal`

    + vler_uid (string, optional) - VLER uid to filter only one item for modal


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


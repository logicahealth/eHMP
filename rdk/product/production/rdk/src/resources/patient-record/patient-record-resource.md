# Group Patient

## Patient record [{{{path}}}]

### Patient record {domain} [GET {{{path}}}/domain/{domain}{?pid}{&uid}{&start}{&limit}{&filter}{&order}{&range}{&filterList*}{&filterFields*}{&callType}{&vler_uid}]

Get record data of one domain for a patient.  
This resource can be accessed via POST and the `X-HTTP-Method-Override: GET` request header, supplying the documented query parameters as fields in the JSON body instead.

+ Parameters

    + domain (enum[string], required) - domain

        + Members
            + `accession`
            + `allergy`
            + `appointment`
            + `consult`
            + `cpt`
            + `demographics`
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
    
    :[range]({{{common}}}/parameters/range.md)
    
    + filterList (array, optional) - the text to search for in JDS 
     
    + filterFields (array, optional) - the fields from JDS to search against
    
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

# Group FHIR

## Referral Request [{{{path}}}]


### Get [GET {{{path}}}{?subject.identifier}{&start}{&_count}]

Converts a vpr 'consult' resource into a FHIR 'referralrequest' resource.

+ Parameters

    :[subject.identifier]({{{common}}}/parameters/subject.identifier.md)

    :[start]({{{common}}}/parameters/start.md)

    :[_count]({{{common}}}/parameters/count.md)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Get [POST {{{path}}}/_search{?subject.identifier}{&start}{&_count}]

Converts a vpr 'consult' resource into a FHIR 'referralrequest' resource.

+ Parameters

    :[subject.identifier]({{{common}}}/parameters/subject.identifier.md)

    :[start]({{{common}}}/parameters/start.md)

    :[_count]({{{common}}}/parameters/count.md)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


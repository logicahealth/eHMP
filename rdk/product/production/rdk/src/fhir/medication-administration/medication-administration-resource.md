# Group FHIR

## Medication Administration [{{{path}}}]


### Get [GET {{{path}}}{?subject.identifier}{&_count}]

Converts the vpr inpatient medication resource into a FHIR medicationAdministration resource.

+ Parameters

    :[subject.identifier]({{{common}}}/parameters/subject.identifier.md)

    :[_count]({{{common}}}/parameters/count.md)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Get [POST {{{path}}}/_search{?subject.identifier}{&_count}]

Converts the vpr inpatient medication resource into a FHIR medicationAdministration resource.

+ Parameters

    :[subject.identifier]({{{common}}}/parameters/subject.identifier.md)

    :[_count]({{{common}}}/parameters/count.md)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


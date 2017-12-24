# Group Locations

## Locations [{{{path}}}]

### Locations {type} search [GET {{{path}}}/{type}/patients{?uid}{&ref.id}{&date.start}{&date.end}{&filter}{&order}]

Get patients for a particular clinic/ward

+ Parameters

    + type (enum[string], required) - location type

        + Members
            + `wards`
            + `clinics`


    :[uid]({{{common}}}/parameters/uid.md required:"required" name:"Location" example:"urn:va:location:SITE:64")

    + ref.id (string, optional) - refId of ward|clinic field

    :[date.start]({{{common}}}/parameters/date.start.md)

    :[date.end]({{{common}}}/parameters/date.end.md)

    :[filter]({{{common}}}/parameters/filter.md)

    :[order]({{{common}}}/parameters/order.md)


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"uid")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


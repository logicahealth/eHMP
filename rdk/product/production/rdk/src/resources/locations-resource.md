# Group Locations

## Locations [{{{path}}}]

### Locations {type} [GET {{{path}}}/{type}{?name}{&facility.code}{&site.code}{&start}{&limit}{&order}{&fields}]

Get list of clinics or wards

+ Parameters

    + type (enum[string], required) - location type

        + Members
            + `wards`
            + `clinics`


    + name (string, optional) - Case-insensitive "starts-with" search on the "name" field

    + facility.code (string, optional) - Case sensitive exact match against the "facilityCode" field

    :[site.code]({{{common}}}/parameters/site.code.md)

    :[start]({{{common}}}/parameters/start.md)

    :[limit]({{{common}}}/parameters/limit.md)

    :[order]({{{common}}}/parameters/order.md)

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"type")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Locations {type} search [GET {{{path}}}/{type}/patients{?uid}{&ref.id}{&date.start}{&date.end}{&filter}{&order}{&fields}]

Get patients for a particular clinic/ward

+ Parameters

    + type (enum[string], required) - location type

        + Members
            + `wards`
            + `clinics`


    :[uid]({{{common}}}/parameters/uid.md required:"required" name:"Location" example:"urn:va:location:9E7A:64")

    + ref.id (string, optional) - refId of ward|clinic field

    :[date.start]({{{common}}}/parameters/date.start.md)

    :[date.end]({{{common}}}/parameters/date.end.md)

    :[filter]({{{common}}}/parameters/filter.md)

    :[order]({{{common}}}/parameters/order.md)

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"uid")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


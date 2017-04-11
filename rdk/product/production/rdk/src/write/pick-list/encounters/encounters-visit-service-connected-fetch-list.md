# Group Pick List

## Encounters visit service connected [/encounters-visit-service-connected{?site}{&dfn}{&visitDate}{&loc}{&fields}]

Returns indicator to allow button selection of Service Connected Related to Items.

### Notes

ORWPCE SCSEL

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + dfn (string, required) - The dfn

    :[visitDate]({{{common}}}/parameters/visitDate.md required:"required")

    + loc (string, required) - The loc

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



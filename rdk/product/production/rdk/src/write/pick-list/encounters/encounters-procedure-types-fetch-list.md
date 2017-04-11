# Group Pick List

## Encounters procedure types [/encounters-procedure-types{?site}{&ien}{&visitDate}]

Retrieve Procedure Types and Associated CPTCodes w/names

### Notes

ORWPCE PROC

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + ien: `195` (string, required) - The ien of the clinic for which to find procedure types

    :[visitDate]({{{common}}}/parameters/visitDate.md)

### GET

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



# Group Pick List

## Encounters procedures cpt modifier [/encounters-procedures-cpt-modifier{?site}{&cpt}{&visitDate}]

Retrieves CPT Modifiers for a CPTCode.

### Notes

ORWPCE CPTMODS

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + cpt: `99202` (string, required) - The CPT code you want to look up modifiers for

    :[visitDate]({{{common}}}/parameters/visitDate.md)

### GET

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



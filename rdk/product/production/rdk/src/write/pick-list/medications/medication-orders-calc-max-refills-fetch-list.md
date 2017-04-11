# Group Pick List

## Medication orders calc max refills [/medication-orders-calc-max-refills{?site}{&pid}{&drug}{&days}{&ordItem}{&discharge}]

DIRECT RPC CALL - Returns maximum refills allowed

### Notes

ORWDPS2 MAXREF

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    :[pid]({{{common}}}/parameters/pid.md)

    + drug (string, required) - The drug

    + days (string, required) - The days

    + ordItem (string, required) - The ordItem

    + discharge (boolean, required) - Boolean on whether to discharge

### GET

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



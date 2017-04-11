# Group Pick List

## Lab time valid immediate collect time [/lab-time-valid-immediate-collect-time{?site}{&time}]

DIRECT RPC CALL - Determines whether the supplied time is a valid lab immediate collect time.

### Notes

ORWDLR32 IC VALID

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + time (string, required) - Determines whether the supplied time is a valid lab immediate collect time.

### GET

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



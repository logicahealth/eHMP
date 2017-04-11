# Group Pick List

## Lab times available [/lab-times-available{?site}{&date}{&locationUid}]

DIRECT RPC CALL - a list of date/time available from the lab schedule

### Notes

ORWDLR32 GET LAB TIMES

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    :[date]({{{common}}}/parameters/date.md required:"required")

    + locationUid (string, required) - The locationUid

### GET

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



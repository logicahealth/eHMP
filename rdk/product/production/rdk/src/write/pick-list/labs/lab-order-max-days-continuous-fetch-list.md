# Group Pick List

## Lab order max days continuous [/lab-order-max-days-continuous{?site}{&location}{&schedule}]

Returns the maximum number of days for a continuous lab order.

### Notes

ORWDLR32 MAXDAYS

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + location: `11` (string, required) - The location of the lab order

    + schedule: `0` (string, required) - The schedule of the lab order

### GET

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



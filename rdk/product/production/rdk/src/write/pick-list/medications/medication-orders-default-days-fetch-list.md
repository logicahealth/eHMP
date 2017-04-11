# Group Pick List

## Medication orders default days [/medication-orders-default-days{?site}{&unitStr}{&schedStr}{&patientDFN}{&drug}{&oi}]

DIRECT RPC CALL - Returns med order days supply value

### Notes

ORWDPS1 DFLTSPLY

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + unitStr (string, required) - The unitStr

    + schedStr (string, required) - The schedStr

    + patientDFN (string, required) - The patient DFN

    + drug (string, required) - The drug

    + oi (number, required) - The oi

### GET

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



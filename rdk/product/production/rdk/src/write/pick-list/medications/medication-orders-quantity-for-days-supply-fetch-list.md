# Group Pick List

## Medication orders quantity for days supply [/medication-orders-quantity-for-days-supply{?site}{&daysSupply}{&unitsPerDose}{&schedule}{&duration}{&patientDFN}{&drug}{&fields}]

DIRECT RPC CALL - Returns med order quantity value for days supply

### Notes

ORWDPS2 DAY2QTY

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + daysSupply: `90` (number, required) - DAY PARAMETER = DAY’S SUPPLY

    + unitsPerDose: `2` (string, required) - UPD PARAMETER = DOSE

    + schedule: `Q6H PRN` (string, required) - SCH PARAMETER = SCHEDULE

    + duration: `~` (string, required) - DUR PARAMETER = DURATION, NO DURATION VALUE

    + patientDFN: `100615` (number, required) - PAT PARAMETER = PATIENT FILE #2 IEN

    + drug: `213` (string, required) - DRG PARAMETER = DRUG FILE #50 IEN

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



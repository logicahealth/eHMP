# Group Pick List

## Medication orders dispense drug message [/medication-orders-dispense-drug-message{?site}{&ien}{&fields}]

Return message text that is associated with a dispense drug.

### Notes

ORWDPS32 DRUGMSG

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + ien: `280` (string, required) - The ien of the drug you want the message for

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



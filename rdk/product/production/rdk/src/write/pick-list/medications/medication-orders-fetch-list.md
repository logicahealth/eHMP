# Group Pick List

## Medication orders [/medication-orders{?site}{&ien}{&first}{&last}]

Get list of available Med Orders

### Notes

ORWUL FVSUB

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + ien: `84` (string, required) - ien - You must call medication-list — ORWUL FV4DG — in order to retrieve the IEN for this parameter

    + first: `1` (string, required) - parameter for the first entry you want returned from the array returned

    + last: `100` (string, required) - parameter for the last entry you want returned from the array returned

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [{
                "ien": "",
                "name": ""
              }],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/medication-orders-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



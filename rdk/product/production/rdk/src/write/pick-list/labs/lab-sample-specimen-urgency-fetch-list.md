# Group Pick List

## Lab sample specimen urgency [/lab-sample-specimen-urgency{?site}{&labTestIEN}{&fields}]

lab sample, specimen, urgency.

### Notes

ORWDLR32 LOAD

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + labTestIEN: `291` (number, required) - the IEN to obtain the lab sample, specimen, and urgency for.

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "categoryName": "Test Name",
                  "default": {
                    "name": "Condom Catheter"
                  }
                },
                {
                  "categoryName": "Urgencies",
                  "values": [
                    {
                      "ien": "2",
                      "name": "ASAP",
                      "parent": "1"
                    },
                    {
                      "ien": "3",
                      "name": "PRE-OP",
                      "parent": "1"
                    }
                  ]
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/lab-sample-specimen-urgency-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



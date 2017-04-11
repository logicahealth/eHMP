# Group Pick List

## Medication defaults [/medication-defaults{?site}{&pharmacyType}{&outpid}{&locationIen}]

Outpatient medication priorities, display messages, refills, and pickup options

### Notes

ORWDPS1 ODSLCT

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + pharmacyType (enum[string], required) - Pharmacy Type (U = Unit Dose, F = IV Fluids, and O = Outpatient)

        + Members
            + `U` - Unit Dose
            + `F` - IV Fluids
            + `O` - Outpatient

    :[pid]({{{common}}}/parameters/pid.md required:"optional")

    + locationIen (string, optional) - Encounter Location

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "categoryName": "Priority",
                  "values": [
                    {
                      "ien": "2",
                      "name": "ASAP"
                    },
                    {
                      "ien": "9",
                      "name": "ROUTINE"
                    },
                    {
                      "ien": "1",
                      "name": "STAT"
                    }
                  ]
                },
                {
                  "categoryName": "DispMsg",
                  "default": {
                    "ien": "0"
                  }
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/medication-defaults-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



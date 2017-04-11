# Group Pick List

## Medication order defaults [/medication-order-defaults{?site}{&pharmacyType}{&ien}{&outpatientDfn}{&needPatientInstructions}{&pkiEnabled}{&fields}]

Outpatient medication dosages, dispense, route, schedule, guideline, message, DEA schedule.

### Notes

ORWDPS2 OISLCT

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + pharmacyType (enum[string], required) - Pharmacy Type

        + Members
            + `U` - Unit Dose
            + `F` - IV Fluids
            + `O` - Outpatient


    + ien (string, optional) - medication ien, from ORWUL FVSUB

    + outpatientDfn (string, optional) - Patient DFN

    + needPatientInstructions (boolean, optional) - boolean for whether you need patient instructions

    + pkiEnabled (boolean, optional) - boolean for whether pki is enabled on this server - You must call pki-enabled — ORWOR PKISITE — in order to retrieve the value for this parameter.

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "categoryName": "Medication",
                  "default": {
                    "orderableItemIen": "U",
                    "orderableItemName": ""
                  }
                },
                {
                  "categoryName": "Route",
                  "values": [
                    {
                      "routeIen": "1",
                      "routeName": "ORAL (BY MOUTH)",
                      "routeAbbrev": "PO",
                      "outpatientExpansion": "MOUTH",
                      "IV": false
                    },
                    {
                      "routeIen": "2",
                      "routeName": "SUBLINGUAL",
                      "routeAbbrev": "SL",
                      "outpatientExpansion": "UNDER THE TONGUE",
                      "IV": false
                    }
                  ]
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/medication-order-defaults-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



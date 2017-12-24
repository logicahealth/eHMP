# Group Pick List

## Lab order dialog def [/lab-order-dialog-def{?site}{&location}{&division}]

Gets Lab Order Dialog Definition

### Notes

ORWDLR32 DEF

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + location: `11` (string, required) - The location of the lab order

    + division: `500` (string, optional) - The division of the lab order

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "categoryName": "Default Urgency",
                  "values": [
                    {
                      "code": "9",
                      "name": "ROUTINE"
                    }
                  ],
                  "default": {
                    "code": "9",
                    "name": "ROUTINE"
                  }
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/lab-order-dialog-def-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



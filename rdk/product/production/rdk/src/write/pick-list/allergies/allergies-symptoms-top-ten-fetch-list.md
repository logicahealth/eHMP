# Group Pick List

## Allergies symptoms top ten [/allergies-symptoms-top-ten{?site}{&fields}]

Top 10 Symptoms for Allergies

### Notes

ORWDAL32 DEF

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "categoryName": "Allergy Types",
                  "values": [
                    {
                      "ien": "D",
                      "name": "Drug"
                    },
                    {
                      "ien": "F",
                      "name": "Food"
                    }
                  ]
                },
                {
                  "categoryName": "Nature of Reaction",
                  "values": [
                    {
                      "ien": "A",
                      "name": "Allergy"
                    },
                    {
                      "ien": "P",
                      "name": "Pharmacological"
                    }
                  ]
                }
               }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/allergies-symptoms-top-ten-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



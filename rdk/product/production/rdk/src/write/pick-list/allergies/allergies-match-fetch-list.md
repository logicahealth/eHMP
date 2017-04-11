# Group Pick List

## Allergies match [/allergies-match{?site}{&searchString}{&fields}]

DIRECT RPC CALL - Retrieves matching allergies based on the given search term.

### Notes

ORWDAL32 ALLERGY MATCH

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + searchString (string, required) - Given this text string, return a list of possible matches from several different sources.

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "source": "1",
                  "categoryName": "VA Allergies File",
                  "top": "TOP",
                  "plus": "+",
                  "allergens": [
                    {
                      "ien": "484",
                      "name": "PEANUT BUTTER",
                      "file": "GMRD(120.82,\"B\")",
                      "foodDrugOther": "DF",
                      "source": "1"
                    },
                    {
                      "ien": "106",
                      "name": "PEANUT OIL",
                      "file": "GMRD(120.82,\"B\")",
                      "foodDrugOther": "DF",
                      "source": "1"
                    }
                  ]
                }
                {
                  "source": "7",
                  "categoryName": "Drug Ingredients File",
                  "top": "TOP",
                  "plus": "+",
                  "allergens": [
                    {
                      "ien": "4048",
                      "name": "PEANUT",
                      "file": "PS(50.416,\"P\")",
                      "foodDrugOther": "D",
                      "source": "7"
                    }
                  ]
                },
                {
                  "source": "8",
                  "categoryName": "VA Drug Class File",
                  "top": "TOP",
                  "plus": "+"
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/allergies-match-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



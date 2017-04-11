# Group Pick List

## Encounters visit categories [/encounters-visit-categories{?site}{&ien}{&visitDate}{&fields}]

Retrieves Visit Category (Type) and associated CPT (procedure) Codes.

### Notes

ORWPCE VISIT

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + ien: `195` (string, required) - The ien of the clinic for which to find visit categories

    :[visitDate]({{{common}}}/parameters/visitDate.md)

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "categoryName": "AUDIOLOGY",
                  "cptCodes": [
                    {
                      "ien": "99456",
                      "name": "C&P F-T-F Visit"
                    },
                    {
                      "ien": "99456",
                      "name": "C&P Telehealth Visit"
                    }
                  ]
                },
                {
                  "categoryName": "SEPARATION HEALTH ASSESSMENT (SHA)",
                  "cptCodes": [
                    {
                      "ien": "99456",
                      "name": "Face to Face SHA Exam"
                    }
                  ]
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/encounters-visit-categories-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



# Group Pick List

## Encounters diagnosis codes for clinic [/encounters-diagnosis-codes-for-clinic{?site}{&clinic}{&fields}]

Retrieve list of Diagnostic Codes for a clinic location.

### Notes

ORWPCE DIAG

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + clinic: `195` (string, required) - The clinic to get diagnostic code for

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "source": "",
                  "categoryName": "ACOUSTIC NERVE INJURIES",
                  "values": [
                    {
                      "icdCode": "S04.62XA",
                      "name": "Injury of acoustic nerve, left side, initial encounter",
                      "description": "INJURY OF ACOUSTIC NERVE, LEFT SIDE, INITIAL ENCOUNTER"
                    },
                    {
                      "icdCode": "S04.62XS",
                      "name": "Injury of acoustic nerve, left side, sequela",
                      "description": "INJURY OF ACOUSTIC NERVE, LEFT SIDE, SEQUELA"
                    }
                  ]
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/encounters-diagnosis-codes-for-clinic-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



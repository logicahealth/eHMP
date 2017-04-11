# Group Pick List

## Immunization types [/immunization-types{?site}]

Returns a list of active immunizations.

### Notes

ORWPCE GET IMMUNIZATION TYPE

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "ien": "1143",
                  "name": "ADENOVIRUS TYPES 4 AND 7"
                },
                {
                  "ien": "41",
                  "name": "ANTHRAX"
                },
                {
                  "ien": "1801",
                  "name": "AS03 ADJUVANT"
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/immunization-types-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



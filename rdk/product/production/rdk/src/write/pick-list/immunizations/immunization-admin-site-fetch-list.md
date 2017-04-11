# Group Pick List

## Immunization admin site [/immunization-admin-site{?site}{&filter}{&date}{&fields}]

Returns entries from the IMM ADMINISTRATION SITE (BODY) file (920.3).

### Notes

PXVIMM ADMIN SITE

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    :[filter]({{{common}}}/parameters/immunization-filter.md)

    :[date]({{{common}}}/parameters/date.md)

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "ien": "2",
                  "name": "LEFT DELTOID",
                  "hl7Code": "LD",
                  "status": "1"
                },
                {
                  "ien": "3",
                  "name": "LEFT GLUTEOUS MEDIUS",
                  "hl7Code": "LG",
                  "status": "1"
                },
                {
                  "ien": "4",
                  "name": "LEFT LOWER FOREARM",
                  "hl7Code": "LLFA",
                  "status": "1"
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/immunization-admin-site-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



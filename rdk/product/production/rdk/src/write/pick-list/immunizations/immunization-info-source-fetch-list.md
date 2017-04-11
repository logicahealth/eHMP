# Group Pick List

## Immunization info source [/immunization-info-source{?site}{&filter}{&date}]

Returns entries from the IMMUNIZATION INFO SOURCE file (920.1).

### Notes

PXVIMM INFO SOURCE

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    :[filter]({{{common}}}/parameters/immunization-filter.md)

    :[date]({{{common}}}/parameters/date.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "ien": "7",
                  "name": "Historical information -from birth certificate",
                  "hl7Code": "06",
                  "status": "1"
                },
                {
                  "ien": "3",
                  "name": "Historical information -from other provider",
                  "hl7Code": "02",
                  "status": "1"
                },
                {
                  "ien": "6",
                  "name": "Historical information -from other registry",
                  "hl7Code": "05",
                  "status": "1"
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/immunization-info-source-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



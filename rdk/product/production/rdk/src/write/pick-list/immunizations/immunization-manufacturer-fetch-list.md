# Group Pick List

## Immunization manufacturer [/immunization-manufacturer{?site}{&filter}{&date}]

Returns information from the IMM MANUFACTURER file (#9999999.04).

### Notes

PXVIMM IMM MAN

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
                  "record": "1 OF 3",
                  "ien": "1",
                  "name": "ABBOTT LABORATORIES",
                  "mvx": "AB",
                  "inactiveFlag": "ACTIVE",
                  "cdcNotes": "includes Ross Products Division, Solvay",
                  "status": "ACTIVE"
                },
                {
                  "record": "2 OF 3",
                  "ien": "2",
                  "name": "ACAMBIS, INC",
                  "mvx": "ACA",
                  "inactiveFlag": "INACTIVE",
                  "cdcNotes": "acquired by sanofi in sept 2008",
                  "status": "ACTIVE"
                },
                {
                  "record": "3 OF 3",
                  "ien": "3",
                  "name": "ADAMS LABORATORIES, INC.",
                  "mvx": "AD",
                  "inactiveFlag": "ACTIVE",
                  "cdcNotes": "",
                  "status": "ACTIVE"
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/immunization-manufacturer-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



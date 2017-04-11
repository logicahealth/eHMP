# Group Pick List

## New persons [/new-persons{?site}{&date}{&fields}]

Large Pick List - Populates Available Providers pick list and default.

### Notes

ORWU NEWPERS

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    :[date]({{{common}}}/parameters/date.md)

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "code": "11272",
                  "name": "Access,New"
                },
                {
                  "code": "11656",
                  "name": "Amie,Vaco"
                },
                {
                  "code": "10000000246",
                  "name": "Analyst,Pat",
                  "title": "- COMPUTER SPECIALIST"
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/new-persons-GET-200.jsonschema)

:[Response 202]({{{common}}}/responses/pick-list-202.md name:"new-persons")

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


## New persons - Direct [/new-persons-direct{?site}{&searchString}{&newPersonsType}{&dateTime}{&fields}]

Calls the RPC 'ORWU NEWPERS' once and parses out the data to retrieve a list of 44 results at a time.

### Notes

ORWU NEWPERS

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + searchString (string, required) - Used when an RPC call requires a minimum of 3 characters in order to return data

        This is not a filter - it is a search string.  For example, searching for RAD may return RADIACARE;
        however, searching for DIA will not return RADIACARE.  Also, the search term may not always be the
        first 3 characters.  For example, DIA will also return "CONTRAST MEDIA <DIAGNOSTIC DYES>".

    + newPersonsType (string, optional)

    + dateTime (string, optional) - The date/time in YYYYMMDDHHMMSS format. HHMMSS is 0 by default.

        Pattern: `^\d{4}(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?$`

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

    + Body

            {
                "data": [
                    {
                        "code": "11272",
                        "name": "Access,New"
                    },
                    {
                        "code": "11656",
                        "name": "Amie,Vaco"
                    },
                    {
                        "code": "10000000246",
                        "name": "Analyst,Pat",
                        "title": "- COMPUTER SPECIALIST"
                    },
                    {
                        "code": "10000000266",
                        "name": "Analyst,Poonam",
                        "title": "- COMPUTER SPECIALIST"
                    },
                    {
                        "code": "10000000229",
                        "name": "Anesthesiologist,One",
                        "title": "- ANESTHESIOLOGIST"
                    }
                ],
                "status": 200
            }        

    + Schema

            :[schema]({{{common}}}/schemas/new-persons-direct-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



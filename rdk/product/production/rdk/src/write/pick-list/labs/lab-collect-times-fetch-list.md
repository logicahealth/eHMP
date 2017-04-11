# Group Pick List

## Lab collect times [/lab-collect-times{?site}{&fields}]

Returns help text showing lab immediate collect times for the user's division.

### Notes

ORWDLR32 IMMED COLLECT

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "text0": "                      NO COLLECTION ON HOLIDAYS "
                },
                {
                  "text1": "MON Collection Between:       06:00  and  23:00"
                },
                {
                  "text2": "TUE Collection Between:       06:00  and  23:00"
                },
                {
                  "text3": "WED Collection Between:       06:00  and  23:00"
                },
                {
                  "text4": "THU Collection Between:       06:00  and  23:00"
                },
                {
                  "text5": "FRI Collection Between:       06:00  and  23:00"
                },
                {
                  "text6": "Laboratory Service requires at least 5 minutes to collect this order."
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/lab-collect-times-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



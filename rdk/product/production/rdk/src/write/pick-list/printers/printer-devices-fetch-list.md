# Group Pick List

## Printer devices [/printer-devices{?site}]

List of printer devices

### Notes

ORWU DEVICE

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "ienName": "123;ABC",
                  "displayName": "ABC",
                  "location": "Local file system",
                  "rMar": "",
                  "pLen": "",
                  "ien": "123",
                  "name": "ABC"
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/printer-devices-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



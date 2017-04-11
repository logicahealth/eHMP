# Group Pick List

## Immunization vaccine info statement [/immunization-vaccine-info-statement{?site}{&filter}{&date}{&fields}]

This RPC returns information from the VACCINE INFORMATION STATEMENT file (#920).

### Notes

PXVIMM VIS

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
                  "record": "1 OF 3",
                  "ien": "1",
                  "name": "ADENOVIRUS VIS",
                  "editionDate": "JUL 14, 2011",
                  "editionStatus": "HISTORIC",
                  "language": "ENGLISH",
                  "visText": "",
                  "twoDBarCode": "253088698300001111110714",
                  "visUrl": "",
                  "status": "ACTIVE"
                },
                {
                  "record": "2 OF 3",
                  "ien": "35",
                  "name": "ADENOVIRUS VIS",
                  "editionDate": "JUN 11, 2014",
                  "editionStatus": "CURRENT",
                  "language": "ENGLISH",
                  "visText": "",
                  "twoDBarCode": "253088698300001111140611",
                  "visUrl": "",
                  "status": "ACTIVE"
                },
                {
                  "record": "3 OF 3",
                  "ien": "2",
                  "name": "ANTHRAX VIS",
                  "editionDate": "MAR 10, 2010",
                  "editionStatus": "CURRENT",
                  "language": "ENGLISH",
                  "visText": "",
                  "twoDBarCode": "253088698300002811100310",
                  "visUrl": "",
                  "status": "ACTIVE"
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/immunization-vaccine-info-statement-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



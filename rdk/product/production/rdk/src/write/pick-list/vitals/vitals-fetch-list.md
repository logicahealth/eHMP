# Group Pick List

## Vitals [/vitals{?site}]

Get list of vitals qualifiers/categories

### Notes

GMV VITALS/CAT/QUAL

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "ien": "1",
                  "name": "BLOOD PRESSURE",
                  "abbreviation": "BP",
                  "pceAbbreviation": "BP",
                  "abnormalSystolicHigh": "210",
                  "abnormalDiastolicHigh": "110",
                  "abnormalSystolicLow": "100",
                  "abnormalDiastolicLow": "60",
                  "categories": [
                    {
                      "ien": "1",
                      "categoryName": "LOCATION",
                      "qualifiers": [
                        {
                          "ien": "1",
                          "name": "R ARM",
                          "synonym": "RA"
                        },
                        {
                          "ien": "2",
                          "name": "L ARM",
                          "synonym": "LA"
                        }
                      ]
                    }
                  ]
                },
                {
                  "ien": "2",
                  "name": "TEMPERATURE",
                  "abbreviation": "T",
                  "pceAbbreviation": "TMP",
                  "abnormalHigh": "102",
                  "abnormalLow": "95",
                  "categories": [
                    {
                      "ien": "1",
                      "categoryName": "LOCATION",
                      "qualifiers": [
                        {
                          "ien": "5",
                          "name": "AXILLARY",
                          "synonym": "Ax"
                        }
                      ]
                    }
                  ]
                },
                {
                  "ien": "22",
                  "name": "PAIN",
                  "abbreviation": "PN",
                  "pceAbbreviation": "PN"
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/vitals-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


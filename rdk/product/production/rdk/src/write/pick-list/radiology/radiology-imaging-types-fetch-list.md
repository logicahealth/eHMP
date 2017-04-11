# Group Pick List

## Radiology imaging types [/radiology-imaging-types{?site}{&fields}]

Radiology Imaging Types

### Notes

ORWDRA32 IMTYPSEL

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "ien": "6",
                  "typeOfImaging": "ANGIO/NEURO/INTERVENTIONAL",
                  "abbreviation": "ANI",
                  "ienDisplayGroup": "37"
                },
                {
                  "ien": "5",
                  "typeOfImaging": "CT SCAN",
                  "abbreviation": "CT",
                  "ienDisplayGroup": "35"
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/radiology-imaging-types-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



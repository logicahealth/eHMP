# Group Pick List

## Allergies symptoms [/allergies-symptoms{?site}]

Large Pick List - Retrieves data for symptoms pick list

### Notes

ORWDAL32 SYMPTOMS

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "ien": "476",
                  "synonym": "A FIB-FLUTTER\t<ATRIAL FIBRILLATION-FLUTTER>",
                  "name": "ATRIAL FIBRILLATION-FLUTTER"
                },
                {
                  "ien": "237",
                  "synonym": "ABDOMINAL BLOATING",
                  "name": "ABDOMINAL BLOATING"
                },
                {
                  "ien": "236",
                  "synonym": "ABDOMINAL CRAMPS",
                  "name": "ABDOMINAL CRAMPS"
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/allergies-symptoms-GET-200.jsonschema)

:[Response 202]({{{common}}}/responses/pick-list-202.md name:"allergies-symptoms")

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



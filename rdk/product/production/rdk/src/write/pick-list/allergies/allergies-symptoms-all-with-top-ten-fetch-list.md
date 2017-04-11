# Group Pick List

## Allergies symptoms all with top ten [/allergies-symptoms-all-with-top-ten{?site}]

Large Pick List - Combines the data for allergies-symptoms and allergies-symptoms-top-ten into one JSON

### Notes

ORWDAL32 DEF and ORWDAL32 SYMPTOMS

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": {
                "topTen": [
                  {
                    "categoryName": "Allergy Types",
                    "values": [
                      {
                        "ien": "D",
                        "name": "Drug"
                      },
                      {
                        "ien": "F",
                        "name": "Food"
                      }
                    ]
                  }
                ],
                "allSymptoms": [
                  {
                    "ien": "476",
                    "synonym": "A FIB-FLUTTER\t<ATRIAL FIBRILLATION-FLUTTER>",
                    "name": "ATRIAL FIBRILLATION-FLUTTER"
                  },
                  {
                    "ien": "237",
                    "synonym": "ABDOMINAL BLOATING",
                    "name": "ABDOMINAL BLOATING"
                  }
                ]
              },
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/allergies-symptoms-all-with-top-ten-GET-200.jsonschema)

:[Response 202]({{{common}}}/responses/pick-list-202.md name:"allergies-symptoms-all-with-top-ten")

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



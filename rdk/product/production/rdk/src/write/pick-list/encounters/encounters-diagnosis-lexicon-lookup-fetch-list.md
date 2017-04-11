# Group Pick List

## Encounters diagnosis lexicon lookup [/encounters-diagnosis-lexicon-lookup{?site}{&searchString}]

DIRECT RPC CALL - Diagnosis Lexicon Lookup - calls orwpce4-lex-lookup with a value of ICD

### Notes

ORWPCE4 LEX

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + searchString (string, required) - A string that is the closest match to the index you want to start returning data from

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "lexIen": "7339465",
                  "prefText": "Healthy diet",
                  "codeSys": "SNOMED CT",
                  "conceptId": "226234005",
                  "version": "",
                  "code": "",
                  "desigId": "339901012"
                },
                {
                  "lexIen": "7178327",
                  "prefText": "Good neonatal condition at birth",
                  "codeSys": "SNOMED CT",
                  "conceptId": "102500002",
                  "version": "",
                  "code": "",
                  "desigId": "250615014"
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/encounters-diagnosis-lexicon-lookup-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



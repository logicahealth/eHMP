# Group Pick List

## Problems lexicon extended lookup [/problems-lexicon-extended-lookup{?site}{&searchString}{&date}{&synonym}{&limit}]

DIRECT RPC CALL - Problems Lexicon Lookup - calls orqqpl4-lex-lookup with a value of CLF

### Notes

ORQQPL4 LEX

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + searchString (string, required) - A string that is the closest match to the index you want to start returning data from

    :[date]({{{common}}}/parameters/date.md)
    
    + synonym (string, optional) - If not supplied will default to zero, which means exclude synonyms
    
    + limit (string, optional) - If not supplied will default to zero, which means return all records found

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "lexIen": "7379569",
                  "prefText": "Broken skin",
                  "code": "R69.",
                  "codeIen": "521774",
                  "codeSys": "SNOMED CT",
                  "conceptId": "247442005",
                  "desigId": "369501012",
                  "version": "ICD-10-CM"
                },
                {
                  "lexIen": "7382195",
                  "prefText": "Hymen broken",
                  "code": "R69.",
                  "codeIen": "521774",
                  "codeSys": "SNOMED CT",
                  "conceptId": "248851007",
                  "desigId": "371395012",
                  "version": "ICD-10-CM"
                },
                "records found",
                "2 matches found"
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/problems-lexicon-extended-lookup-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



# Group Pick List

## Encounters procedures lexicon lookup [/encounters-procedures-lexicon-lookup{?site}{&searchString}]

DIRECT RPC CALL - Procedures Lexicon Lookup - calls orwpce4-lex-lookup with a value of CHP

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
                  "lexIen": "297178",
                  "prefText": "Fasciectomy involving the Palm (only)",
                  "codeSys": "CPT-4",
                  "conceptId": "26121",
                  "version": "",
                  "code": ""
                },
                {
                  "lexIen": "297708",
                  "prefText": "Partial Fasciectomy for the Excision of Plantar Fascia",
                  "codeSys": "CPT-4",
                  "conceptId": "28060",
                  "version": "",
                  "code": ""
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/encounters-procedures-lexicon-lookup-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



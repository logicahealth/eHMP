# Group Pick List

## Progress notes ICD 10 codes [/progress-notes-titles-icd-10{?site}{&searchString}{&fields}]

Large Pick List - Returns a list of ICD 10 Codes

### Notes

ORWLEX GETFREQ

ORWLEX GETI10DX

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + searchString (string, required) - Given this text string, return a list of possible matches.

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

    + Body

            {
              "data": [
                {
                  "preferredText": "War Operations involving Explosion of Improvised Explosive Device [Ied], Military Personnel, Initial Encounter",
                  "icdCodingSystem": "ICD-10-CM",
                  "icdCode": "Y36.230A",
                  "diagnosisIen": "567653",
                  "ien": "5061625"
                }
              ],
              "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/progress-notes-titles-icd-10-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



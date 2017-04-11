# Group Pick List

## Progress notes titles, ASU filtered [/progress-notes-titles-asu-filtered{?docStatus}{&actionNames}{&roleNames}]

Large Pick List - Returns a list of Note Titles

### Notes

HMP TIU LONG LIST OF TITLES

+ Parameters

    + docStatus: `COMPLETED` (string, required) 

    + actionNames: `VIEW,EDIT RECORD,PRINT RECORD` (string, required) 

    + roleNames: `AUTHOR/DICTATOR,EXPECTED SIGNER,EXPECTED COSIGNER,ATTENDING PHYSICIAN` (string, optional) 

### GET

+ Response 200 (application/json)

    + Body

            {
                "data": [{
                    "ien": "1295",
                    "name": "ACROMEGALY    <C&P ACROMEGALY>"
                }, {
                    "ien": "40",
                    "name": "ADDICTION    <ASI-ADDICTION SEVERITY INDEX>"
                }, {
                    "ien": "33",
                    "name": "ADHC    <ADHC SOCIAL WORK>"
                }, {
                    "ien": "33",
                    "name": "ADHC SOCIAL WORK"
                }, {
                    "ien": "1348",
                    "name": "ADHESIONS    <C&P STOMACH, DUODENUM, AND PERITONEAL ADHESIONS>"
                }],
                "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/progress-notes-titles-GET-200.jsonschema)

:[Response 202]({{{common}}}/responses/pick-list-202.md name:"progress-notes-titles")

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



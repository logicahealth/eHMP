# Group Pick List

## Progress notes titles flags [/progress-notes-titles-flags{?site}{&ien}]

Returns the flags for a Progress Note Title

### Notes

'TIU IS THIS A SURGERY?', 'TIU ONE VISIT NOTE?', 'TIU ISPRF', and 'TIU IS THIS A CONSULT?'

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + ien: `1354` (number, required) - The progress note title ien.

### GET

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "isSurgeryNote": false,
                    "isOneVisitNote": false,
                    "isPrfNote": true,
                    "isConsultNote": false
                },
                "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/progress-notes-titles-flags-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



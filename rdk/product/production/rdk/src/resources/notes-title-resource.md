# Group Notes

## Notes titles get User Recent Titles [{{{path}}}{?fields}]

+ Parameters

    :[fields]({{{common}}}/parameters/fields.md)


### Get [GET]

Returns the three most recent note titles the user has saved

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": []
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/notes_recent-titles-GET-200.jsonschema)


# Group Authorize

## Authorize authorize [{{{path}}}]

### Get [GET]

Check for a user session

#### Notes

Requires the authentication interceptor to run in order to add the user to the session for returning that data.

+ Response 200 (application/json)

    + Body

            {
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authorize-GET-200.jsonschema)


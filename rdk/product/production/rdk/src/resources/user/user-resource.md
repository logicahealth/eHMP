# Group User

## User service user [{{{path}}}]

### Info [GET {{{path}}}/info{?fields}]

Get the current user session

+ Parameters

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "disabled": true,
                    "divisionSelect": true,
                    "duz": {
                        "9E7A": "ssss"
                    },
                    "facility": "ssss",
                    "firstname": "ssss",
                    "lastname": "ssss",
                    "pcmm": [],
                    "permissions": [],
                    "provider": true,
                    "requiresReset": true,
                    "section": "ssss",
                    "site": "ssss",
                    "title": "ssss"
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/user_info-GET-200.jsonschema)


### List [GET {{{path}}}/list{?user.filter}{&show.inactive}{&start}{&limit}{&fields}]

Get the list of users from JDS with eHMP roles

+ Parameters

    + user.filter (UserFilter, required) - User filter parameters in JSON format

    + show.inactive (boolean, optional) - Whether to show inactive users

    + start (start, optional) - Starting index for returned search results

    + limit (limit, optional) - The limit for the number of returned search results

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

    + Body

            {
                "data": [],
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/user_list-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Ehmp User Context [PUT {{{path}}}/set-recent-patients{?viewedPatientContext}{&clear}]

Set the eHMP UI context of a given user

+ Parameters

    + viewedPatientContext (viewedPatientContext, required) - Viewed Patient Context parameters in JSON format

    + clear (boolean, optional) - Clear User Context


+ Response 200 (application/json)

    + Body

            {
                "data": [],
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/user_set-recent-patients-PUT-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Get User Context [GET {{{path}}}/get-recent-patients]

Get the eHMP UI context of the current user

+ Response 200 (application/json)

    + Body

            {
                "data": [],
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/user_get-recent-patients-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


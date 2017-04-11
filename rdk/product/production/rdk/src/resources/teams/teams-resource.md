# Group Teams

## Teams [{{{path}}}]

### List [GET {{{path}}}/list{?facility}]

Get a list of teams

+ Parameters

    + facility (string, optional) - The facility to get teams for. Defaults to the logged in users selected site.


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": []
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/teams_list-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Delete By Team Id [DELETE {{{path}}}/byid{?facility}{&teamId}]

Delete a team by ID

+ Parameters

    + facility (string, optional) - The facility to get teams for. Defaults to the logged in users selected site.

    + teamId (string, required) - The ID of the team to delete


+ Response 200 (application/json)

    + Body

            {
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/teams_byid-DELETE-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Get By Team Id [GET {{{path}}}/byid{?facility}{&teamId}]

Get a team by ID

+ Parameters

    + facility (string, optional) - The facility to get teams for. Defaults to the logged in users selected site.

    + teamId (string, required) - The ID of the team to retrieve


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "active": true,
                    "createdByIEN": "ssss",
                    "createdDateTime": 2,
                    "modifiedByIEN": "ssss",
                    "modifiedDateTime": 2,
                    "patients": [],
                    "position": [],
                    "teamDescription": "ssss",
                    "teamDisplayName": "ssss",
                    "teamFocus": 2,
                    "teamId": 501,
                    "teamType": 2
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/teams_byid-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### By IC N [GET {{{path}}}/byicn{?facility}{&icn}]

Get teams that a particular patient is assigned to

+ Parameters

    + facility (string, optional) - The facility to get teams for. Defaults to the logged in users selected site.

    + icn (string, required) - The patient ICN for which to retrieve teams


+ Response 200 (application/json)

    + Body

            {
                "data": [],
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/teams_byicn-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### By User [GET {{{path}}}/byuser{?facility}{&siteUser}]

Get teams and positions for logged in user

+ Parameters

    + facility (string, optional) - The facility to get teams for. Defaults to the logged in users selected site.

    + siteUser (string, optional) - The user to get positions for at the selected site/facility. Defauls to the currently logged in user. Expects "facility;accesCode" format.


+ Response 200 (application/json)

    + Body

            {
                "data": [],
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/teams_byuser-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Add [POST {{{path}}}/add{?facility}]

Add a team

+ Parameters

    + facility (string, optional) - The facility to get teams for. Defaults to the logged in users selected site.


+ Request JSON Message (application/json)

    + Body

            {
                "team": {
                    "active": true,
                    "createdByIEN": "ssss",
                    "createdDateTime": 2,
                    "modifiedByIEN": "ssss",
                    "modifiedDateTime": 2,
                    "patients": [],
                    "position": [],
                    "teamDescription": "ssss",
                    "teamDisplayName": "ssss",
                    "teamFocus": 2,
                    "teamId": 501,
                    "teamType": 2
                }
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "team":
                    :[team]({{{common}}}/schemas/team.jsonschema)
                },
                "required": [
                    "team"
                ]
            }

+ Response 200 (application/json)

    + Body

            {
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/teams_add-POST-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Add Facilities [POST {{{path}}}/addfacilities]

Add a list of facilities containing teams

+ Request JSON Message (application/json)

    + Body

            {
                "facilities": [{
                    "teams": [{
                        "teamId": 501,
                        "teamDisplayName": "My Team"
                    }]
                }]
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "facilities": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "teams": {
                                    "type": "array",
                                    "items":
                                    :[team]({{{common}}}/schemas/team.jsonschema)
                                }
                            },
                            "required": ["teams"]
                        }
                    }
                },
                "required": [
                    "facilities"
                ]
            }

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "0": {
                        "teams": [
                            {
                                "teamId": 501,
                                "teamDisplayName": "My Team"
                            }
                        ]
                    }
                },
                "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/teams_addfacilities-POST-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


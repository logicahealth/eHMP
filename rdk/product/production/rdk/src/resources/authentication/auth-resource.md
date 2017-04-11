# Group Authentication

## Authentication [{{{path}}}]

### Authenticate [POST]

Login to create a user session

#### Notes

Requires the authentication interceptor to run in order to add the user to the session for returning that data.

+ Request JSON Message (application/json)

    + Body

            {
                "accessCode": "PW    ",
                "verifyCode": "PW    !!",
                "site": "9E7A"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "accessCode",
                    "verifyCode",
                    "site"
                ],
                "properties": {
                    "accessCode": {
                        "type": "string"
                    },
                    "verifyCode": {
                        "type": "string"
                    },
                    "site": {
                        "type": "string"
                    }
                }
            }

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "disabled": false,
                    "divisionSelect": false,
                    "duz": {
                        "9E7A": "10000000270"
                    },
                    "facility": "PANORAMA",
                    "firstname": "PANORAMA",
                    "lastname": "USER",
                    "permissions": [
                        "read-patient-record",
                        "read-active-medication"
                    ],
                    "pcmm": [{
                        "service": [
                            "HOME TELEHEALTH",
                            "HOSPITAL MEDICINE",
                            "IMAGING",
                            "INFECTIOUS DISEASE"
                        ],
                        "team": [
                            "TEAM1",
                        ],
                        "roles": [
                            "NURSE (RN)",
                        ]
                    }],
                    "requiresReset": false,
                    "section": "Medicine",
                    "site": "9E7A",
                    "title": "Clinician",
                    "provider": true
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authentication-200.jsonschema)

+ Response 401 (application/json)

    + Body

            {
                "error": "No DUZ returned from login request",
                "message": "Not a valid ACCESS CODE/VERIFY CODE pair.",
                "status": 401
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authentication-401.jsonschema)


### Refresh Token [GET {{{path}}}{?fields}]

Refreshes the current user session

#### Notes

Expects a session to already occur or it returns a blank object.

+ Parameters

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "disabled": false,
                    "divisionSelect": false,
                    "duz": {
                        "9E7A": "10000000270"
                    },
                    "facility": "PANORAMA",
                    "firstname": "PANORAMA",
                    "lastname": "USER",
                    "permissions": [
                        "read-patient-record",
                        "read-active-medication"
                    ],
                    "pcmm": [{
                        "service": [
                            "HOME TELEHEALTH",
                            "HOSPITAL MEDICINE",
                            "IMAGING",
                            "INFECTIOUS DISEASE"
                        ],
                        "team": [
                            "TEAM1",
                        ],
                        "roles": [
                            "NURSE (RN)",
                        ]
                    }],
                    "requiresReset": false,
                    "section": "Medicine",
                    "site": "9E7A",
                    "title": "Clinician",
                    "provider": true
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authentication-200.jsonschema)

+ Response 401 (application/json)

    + Body

            {
                "status": 401
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authentication-status.jsonschema)


### Destroy Session [DELETE]

Destroys the current user session

#### Notes

Expects a session to exist else it returns nothing.

+ Response 200 (application/json)

    + Body

            {
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authentication-status.jsonschema)

+ Response 401 (application/json)

    + Body

            {
                "message": "No session to destroy",
                "status": 401
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)


### List VistA Instances [GET {{{path}}}/list{?fields}]

Return the list of vistas available

#### Notes

Is a readonly resource that returns an array.

+ Parameters

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": [
                        {
                            "name": "KODAK",
                            "division": "500",
                            "siteCode": "C877"
                        },
                        {
                            "name": "PANORAMA",
                            "division": "500",
                            "siteCode": "9E7A"
                        }
                    ]
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authentication_list-GET-200.jsonschema)

### System Authenticate [POST {{{path}}}/systems]

Login to create a system session

The Authorization header will be the name of the system asking for access

#### Notes

Requires the system-authentication interceptor to run in order to add the system user to the session for returning data.

+ Request JSON Message (application/json)

    + Headers

            Authorization: CDS

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "name": "CDS",
                    "permissions": [
                        "read-patient-record",
                        "read-active-medication"
                    ],
                    "permissionSets": ["read-access"],
                    "expires": ""
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authentication_systems-200.jsonschema)

+ Response 401 (application/json)

    + Body

            {
                "error": "No DUZ returned from login request",
                "message": "Not a valid ACCESS CODE/VERIFY CODE pair.",
                "status": 401
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authentication-401.jsonschema)

### System Authenticate [GET {{{path}}}/systems]

Request to refresh the expiration on a system session

#### Notes

Requires the system-authentication interceptor to run in order to add the system user to the session for returning data.


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "name": "CDS",
                    "permissions": [
                        "read-patient-record",
                        "read-active-medication"
                    ],
                    "permissionSets": ["read-access"],
                    "expires": "2015-12-18T13:59:00.834Z"
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authentication_systems-200.jsonschema)

+ Response 401 (application/json)

    + Body

            {
                "status": 401
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authentication-status.jsonschema)

### System Authenticate [DELETE {{{path}}}/systems]

Request to delete the system session

+ Response 200 (application/json)

    + Body

            {
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authentication-status.jsonschema)

+ Response 401 (application/json)

    + Body

            {
                "status": 401
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authentication-status.jsonschema)


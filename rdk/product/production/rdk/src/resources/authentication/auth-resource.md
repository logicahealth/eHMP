# Group Authentication

## Authentication [{{{path}}}]

### Authenticate [POST]

Login to create a user session

#### Notes

Requires the authentication interceptor to run in order to add the user to the session for returning that data.

+ Request JSON Message (application/json)

    + Body

            {
                "accessCode": "pu1234",
                "verifyCode": "pu1234!!",
                "site": "9E7A",
                "division": "500"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "accessCode",
                    "verifyCode",
                    "site",
                    "division"
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
                    },
                    "division": {
                        "type": "string"
                    }
                }
            }

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "uid": "urn:va:user:9E7A:10000000270",
                    "disabled": false,
                    "divisionSelect": false,
                    "duz": {
                        "9E7A": "10000000270"
                    },
                    "expires": "2016-09-20T17:42:25.654Z",
                    "facility": "PANORAMA",
                    "firstname": "PANORAMA",
                    "lastname": "USER",
                    "preferences": {
                        "defaultScreen": {}
                    },
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
                            "TEAM1"
                        ],
                        "roles": [
                            "NURSE (RN)"
                        ]
                    }],
                    "requiresReset": false,
                    "section": "Medicine",
                    "sessionLength": 900000,
                    "site": "9E7A",
                    "division": "500",
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


### Refresh Token [GET {{{path}}}]

Refreshes the current user session

#### Notes

Expects a session to already occur or it returns a blank object.

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "uid": "urn:va:user:9E7A:10000000270",
                    "disabled": false,
                    "divisionSelect": false,
                    "duz": {
                        "9E7A": "10000000270"
                    },
                    "expires": "2016-09-20T17:42:25.654Z",
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
                            "TEAM1"
                        ],
                        "roles": [
                            "NURSE (RN)"
                        ]
                    }],
                    "requiresReset": false,
                    "section": "Medicine",
                    "sessionLength": 900000,
                    "site": "9E7A",
                    "division": "500",
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


### List VistA Instances [GET {{{path}}}/list]

Return the list of vistas available

#### Notes

Is a readonly resource that returns an array.

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": [
                        {
                            "name": "KODAK",
                            "division": "507",
                            "production": false,
                            "siteCode": "C877"
                        },
                        {
                            "name": "PANORAMA",
                            "division": "500",
                            "production": false,
                            "siteCode": "9E7A"
                        }
                    ]
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authentication_list-GET-200.jsonschema)

### Internal System Authenticate [POST {{{path}}}/systems/internal]

Login to create an internal system session

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

### Internal System Authenticate [GET {{{path}}}/systems/internal]

Request to refresh the expiration on an internal system session

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

### Internal System Authenticate [DELETE {{{path}}}/systems/internal]

Request to delete the internal system session

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


### External System Authenticate [POST {{{path}}}/systems/external]

Login to create an external system session

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

### External System Authenticate [GET {{{path}}}/systems/external]

Request to refresh the expiration on an external system session

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

### External System Authenticate [DELETE {{{path}}}/systems/external]

Request to delete the external system session

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


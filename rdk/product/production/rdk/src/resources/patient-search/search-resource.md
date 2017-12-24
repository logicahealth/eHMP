# Group Patient search

## Search [{{{path}}}]

### Global search [POST {{{path}}}/global{?name.last}{&name.first}{&ssn}{&date.birth}]

#### Notes

Parameters may be provided as query parameters or in the request body. The `name.last` parameter is required to be in one of those locations. One other parameter (`name.first`, `ssn` or `date.birth`) is also required.

+ Parameters

    + name.last (string, optional) - patient last name

        Pattern: `^[- ,A-Za-z']+$`

    + name.first (string, optional) - patient first name

        Pattern: `^[- ,A-Za-z']+$`

    + ssn (string, optional) - patient full social security number

        Pattern: `^(\d{3})-?(\d{2})-?(\d{4})$`

    + date.birth (string, optional) - patient date of birth in mm/dd/yyyy format

        Pattern: `^(\d{1,2})/(\d{1,2})/(\d{4})$`


+ Request JSON Message (application/json)

    + Body

            {
                "name.last": "Eight",
                "name.first": "Patient"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "name.last": {
                        "type": "string",
                        "pattern": "^[- ,A-Za-z']+$"
                    },
                    "name.first": {
                        "type": "string",
                        "pattern": "^[- ,A-Za-z']+$"
                    },
                    "ssn": {
                        "type": "string",
                        "pattern": "^(\\d{3})-?(\\d{2})-?(\\d{4})$"
                    },
                    "date.birth": {
                        "type": "string",
                        "pattern": "^(\\d{1,2})/(\\d{1,2})/(\\d{4})$"
                    }
                },
                "allowAdditionalProperties": false,
                "oneOf": [
                    { "required": ["name.last", "name.first"] },
                    { "required": ["name.last", "ssn"] },
                    { "required": ["name.last", "date.birth"] }
                ]
            }

+ Request Query Paramters (application/json)

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": ["object", "string"],
                "properties": {},
                "allowAdditionalProperties": false
            }

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": []
                },
                "msg": "ssss",
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient-search_global-POST-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Mvi patient sync [POST {{{path}}}/]

+ Request JSON Message (application/json)

    + Body

            {
                "pid": "SITE;12345",
                "demographics": {
                    "familyName": "ssss",
                    "fullName": "ssss",
                    "displayName": "ssss",
                    "givenName": "ssss",
                    "genderName": "ssss",
                    "genderCode": "ssss",
                    "ssn": "123-45-6789",
                    "dob": "ssss"
                }
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "pid",
                    "demographics"
                ],
                "properties": {
                    "pid": {
                        "type": "string",
                        "description": "patient's mvi id",
                        "pattern": "^([a-zA-Z0-9]+);([a-zA-Z0-9]+)$|^([0-9]+)V([0-9]+)$"
                    },
                    "demographics": {
                        "type": "object",
                        "properties": {
                            "familyName": {
                                "type": "string",
                                "description": "patient's last name"
                            },
                            "fullName": {
                                "type": "string",
                                "description": "patient's full name in first middle last order"
                            },
                            "displayName": {
                                "type": "string",
                                "description": "patient's full name in last,first middle order"
                            },
                            "givenName": {
                                "type": "string",
                                "description": "patient's first and middle names"
                            },
                            "genderName": {
                                "type": "string",
                                "description": "gender of patient"
                            },
                            "genderCode": {
                                "type": "string",
                                "description": "gender code of patient"
                            },
                            "ssn": {
                                "type": "string",
                                "description": "patient's full ssn"
                            },
                            "dob": {
                                "type": "string",
                                "description": "date of birth in yyyymmdd format"
                            }
                        }
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Mvi patient sync status [GET {{{path}}}/{?pid}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Default search [GET {{{path}}}/cprs]

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": []
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient-search_cprs-GET-200.jsonschema)


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)

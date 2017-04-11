# Group Writeback

## Vitals [{{{path}}}]

### Add [POST]

Add one or more new vitals for a patient in a single Vista

+ Parameters

    + pid (string, required) - patient id


+ Request JSON Message (application/json)

    + Body

            {
                "dateTime": "ssss",
                "dfn":"sss",
                "enterdByIEN": "ssss",
                "locationUid":"sss",
                "vitals": []
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "dateTime",
                    "dfn",
                    "enterdByIEN",
                    "vitals",
                    "locationUid"
                ],
                "properties": {
                    "dateTime": {
                        "type": "string",
                        "description": "date/time vitals entered in yyyymmddHHMM format"
                    },
                    "dfn": {
                        "type": "string",
                        "description": "patient dfn"
                    },
                    "locationUid": {
                        "type": "string",
                        "description": "UID of clinic location where vitals where taken"
                    },
                    "enterdByIEN": {
                        "type": "string",
                        "description": "IEN of person who entered the vital"
                    },
                    "vitals": {
                        "type": "array",
                        "description": "one or more vitals",
                        "items": {
                            "type": "object",
                            "required": ["fileIEN", "reading"],
                            "properties": {
                                "fileIEN": {
                                    "type": "string",
                                    "description": "vital type"
                                },
                                "reading": {
                                    "type": "string",
                                    "description": "vital value"
                                },
                                "qualifiers": {
                                    "type": "array",
                                    "description": "zero or more qualifier IENs",
                                    "items": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Update [PUT {{{path}}}/{resourceId}]

mark an existing patient vital as entered in error

+ Parameters

    + pid (string, required) - patient id

    + resourceId (string, required) - vital id


+ Request JSON Message (application/json)

    + Body

            {
                "reasonNumber": "ssss",
                "ien": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "reasonNumber",
                    "ien"
                ],
                "properties": {
                    "reasonNumber": {
                        "type": "string",
                        "description": "Numeric index to an error index"
                    },
                    "ien": {
                        "type": "string",
                        "description": "Comma separated list of vital IENS"
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


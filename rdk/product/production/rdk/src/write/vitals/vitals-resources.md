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
                "localIEN": "ssss",
                "enterdByIEN": "ssss",
                "vitals": []
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "dateTime",
                    "enterdByIEN",
                    "localIEN",
                    "vitals"
                ],
                "properties": {
                    "dateTime": {
                        "type": "string",
                        "description": "date/time vitals entered in yyyymmddHHMM format"
                    },
                    "localIEN": {
                        "type": "string",
                        "description": "IEN of clinic location where vitals where taken"
                    },
                    "enterdByIEN": {
                        "type": "string",
                        "description": "IEN of person who entered the vital"
                    },
                    "vitals": {
                        "type": "array",
                        "description": "one or more vitals",
                        "items": {
                            "$ref": "Vital"
                        }
                    }
                }
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Update [PUT]

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


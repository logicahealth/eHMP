# Group Writeback

## Write back sign order sign [{{{path}}}]

### Post [POST {{{path}}}/sign]

Signs an order

+ Request JSON Message (application/json)

    + Body

            {
                "param": {
                    "signatureCode": "ssss",
                    "patientIEN": "ssss",
                    "locationIEN": "ssss",
                    "orders": {}
                }
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "param": {
                        "type": "object",
                        "properties": {
                            "signatureCode": {
                                "type": "string"
                            },
                            "patientIEN": {
                                "type": "string"
                            },
                            "locationIEN": {
                                "type": "string"
                            },
                            "orders": {
                                "type": "object"
                            }
                        },
                        "required": [
                            "signatureCode",
                            "patientIEN",
                            "locationIEN",
                            "orders"
                        ]
                    }
                },
                "required": [
                    "param"
                ]
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


# Group Asu

## Asu evaluate [{{{path}}}]

### Post [POST {{{path}}}/evaluate]

+ Request JSON Message (application/json)

    + Body

            {
                "userClassUids": [],
                "docDefUid": "ssss",
                "docStatus": "ssss",
                "roleNames": []
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "userClassUids": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "docDefUid": {
                        "type": "string"
                    },
                    "docStatus": {
                        "type": "string",
                        "enum": [
                            "AMENDED",
                            "COMPLETED",
                            "DELETED",
                            "PURGED",
                            "RETRACTED",
                            "UNCOSIGNED",
                            "UNDICTATED",
                            "UNRELEASED",
                            "UNSIGNED",
                            "UNTRANSCRIBED",
                            "UNVERIFIED"
                        ]
                    },
                    "roleNames": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "enum": [
                                "ADDITIONAL SIGNER",
                                "ATTENDING PHYSICIAN",
                                "AUTHOR/DICTATOR",
                                "COMPLETER",
                                "COSIGNER",
                                "ENTERER",
                                "EXPECTED COSIGNER",
                                "EXPECTED SIGNER",
                                "INTERPRETER",
                                "SIGNER",
                                "SURROGATE",
                                "TRANSCRIBER"
                            ]
                        }
                    }
                },
                "required": [
                    "userClassUids",
                    "docDefUid",
                    "docStatus",
                    "roleNames"
                ]
            }

+ Response 200 (application/json)

    + Body

            {
                "isAuthorized": "ssss"
            }

    + Schema

            :[Schema]({{{common}}}/schemas/asu_evaluate-POST-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


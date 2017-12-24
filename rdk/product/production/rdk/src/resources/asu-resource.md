# Group Asu

## Asu evaluate [{{{path}}}]

### Post [POST {{{path}}}/evaluate]

+ Request JSON Message (application/json)

    + Body

            {
                "userClassUids": [],
                "docDefUid": "ssss",
                "docStatus": "COMPLETED",
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


### Post [POST {{{path}}}/evaluate-with-action-names]

+ Request JSON Message (application/json)

    + Body

            {
                "data": {
                    "items": [{
                        "author": "VEHU,ONE",
                        "authorDisplayName": "Vehu,One",
                        "authorUid": "urn:va:user:SITE:20001",
                        "clinicians": [{
                            "displayName": "Vehu,One",
                            "name": "VEHU,ONE",
                            "role": "AU",
                            "summary": "DocumentClinician{uid='urn:va:user:SITE:20001'}",
                            "uid": "urn:va:user:SITE:20001"
                        }],
                        "documentDefUid": "urn:va:doc-def:SITE:8",
                        "status": "COMPLETED",
                        "uid": "urn:va:document:SITE:3:11605"
                    }]
                },
                "actionNames": ["VIEW", "EDIT RECORD", "AMENDMENT"],
                "userdetails": {
                    "site": "SITE",
                    "duz": {
                        "SITE": "10000000270"
                    }
                }
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "data": {
                        "type": "object",
                        "properties": {
                            "items": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "author": {
                                            "type": "string"
                                        },
                                        "authorDisplayName": {
                                            "type": "string"
                                        },
                                        "authorUid": {
                                            "type": "string"
                                        },
                                        "clinicians": {
                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "displayName": {
                                                        "type": "string"
                                                    },
                                                    "name": {
                                                        "type": "string"
                                                    },
                                                    "role": {
                                                        "type": "string"
                                                    },
                                                    "summary": {
                                                        "type": "string"
                                                    },
                                                    "uid": {
                                                        "type": "string"
                                                    }
                                                },
                                                "required": [
                                                    "role",
                                                    "uid"
                                                ]
                                            }
                                        },
                                        "documentDefUid": {
                                            "type": "string"
                                        },
                                        "status": {
                                            "type": "string"
                                        },
                                        "uid": {
                                            "type": "string"
                                        }
                                    },
                                    "required": [
                                        "documentDefUid",
                                        "status"
                                    ]
                                }
                            }
                        },
                        "required": [
                            "items"
                        ]
                    },
                    "actionNames": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "userdetails": {
                        "type": "object",
                        "properties": {
                            "site": {
                                "type": "string"
                            },
                            "duz": {
                                "type": "object",
                                "properties": {
                                    "SITE": {
                                        "type": "string"
                                    }
                                },
                                "required": [
                                    "SITE"
                                ]
                            }
                        },
                        "required": [
                            "site",
                            "duz"
                        ]
                    }
                },
                "required": [
                    "data",
                    "actionNames"
                ]
            }

+ Response 200 (application/json)

    + Body

            [{
                "actionName": "VIEW",
                "hasPermission": true
            }, {
                "actionName": "EDIT RECORD",
                "hasPermission": false
            }]

    + Schema

            :[Schema]({{{common}}}/schemas/asu_evaluate-with-action-names-POST-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

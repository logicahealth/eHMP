# Group Cds

## Intent [{{{path}}}]

+ Model (application/json)

    + Body

            {
            "description":"Neurosurgery Consult Intent",
            "invocations":[
                {
                    "dataFormat":"application/json+fhir",
                    "dataQueries":[
                        "patient/##SUBJECT.ID##",
                        "patient/##SUBJECT.ID##/observation?code=8302-2,29463-7"
                    ],
                    "prerequisites":[
                        {
                        "display":"BMI",
                        "coding":{
                            "system":"http://snomed.org",
                            "code":"60621009",
                            "display":"BMI - Body Mass Index"
                        },
                        "remediation":{
                            "action":"",
                            "domain":"Vitals",
                            "coding":{
                                "system":"http://snomed.org",
                                "code":"60621009",
                                "display":"BMI"
                            }
                        }
                        }
                    ],
                    "crsResolverRequired":false,
                    "engineName":"OpenCDS",
                    "rules":[
                        {
                        "properties":{
                            "version":"1.0.0",
                            "businessId":"neurosurgeryConsult",
                            "scopingEntityId":"com.cognitive"
                        }
                        }
                    ]
                }
            ],
            "name":"NeurosurgeryConsult",
            "scope":"BuiltIn"
            }


    + Schema

            {
                "properties": {
                    "description": {
                        "type": "string"
                    },
                    "invocations": {
                        "items": {
                            "properties": {
                                "crsResolverRequired": {
                                    "type": "boolean"
                                },
                                "dataFormat": {
                                    "default": "application/json+fhir",
                                    "type": "string"
                                },
                                "dataQueries": {
                                    "items": {
                                        "type": "string"
                                    },
                                    "type": "array"
                                },
                                "engineName": {
                                    "type": "string"
                                },
                                "prerequisites": {
                                    "items": {
                                        "properties": {
                                            "coding": {
                                                "properties": {
                                                    "code": {
                                                        "type": "string"
                                                    },
                                                    "display": {
                                                        "type": "string"
                                                    },
                                                    "system": {
                                                        "type": "string"
                                                    }
                                                },
                                                "required": [
                                                    "code",
                                                    "display",
                                                    "system"
                                                ],
                                                "type": "object"
                                            },
                                            "display": {
                                                "type": "string"
                                            },
                                            "remediation": {
                                                "properties": {
                                                    "action": {
                                                        "type": "string"
                                                    },
                                                    "coding": {
                                                        "properties": {
                                                            "code": {
                                                                "type": "string"
                                                            },
                                                            "display": {
                                                                "type": "string"
                                                            },
                                                            "system": {
                                                                "type": "string"
                                                            }
                                                        },
                                                        "required": [
                                                            "code",
                                                            "display",
                                                            "system"
                                                        ],
                                                        "type": "object"
                                                    },
                                                    "domain": {
                                                        "type": "string"
                                                    }
                                                },
                                                "required": [
                                                    "action",
                                                    "domain",
                                                    "coding"
                                                ],
                                                "type": "object"
                                            },
                                            "remediationQuery": {
                                                "type": "string"
                                            },
                                            "valueSetQuery": {
                                                "type": "string"
                                            }
                                        },
                                        "required": [
                                            "remediation",
                                            "coding",
                                            "display"
                                        ],
                                        "type": "object"
                                    },
                                    "type": "array"
                                },
                                "rules": {
                                    "items": {
                                        "properties": {
                                            "properties": {
                                                "properties": {
                                                    "businessId": {
                                                        "type": "string"
                                                    },
                                                    "scopingEntityId": {
                                                        "type": "string"
                                                    },
                                                    "version": {
                                                        "type": "string"
                                                    }
                                                },
                                                "required": [
                                                    "businessId",
                                                    "scopingEntityId",
                                                    "version"
                                                ],
                                                "type": "object"
                                            }
                                        },
                                        "required": [
                                            "properties"
                                        ],
                                        "type": "object"
                                    },
                                    "type": "array"
                                }
                            },
                            "required": [
                                "dataFormat",
                                "dataQueries",
                                "engineName"
                            ],
                            "type": "object"
                        },
                        "type": "array"
                    },
                    "name": {
                        "type": "string"
                    },
                    "scope": {
                        "default": "BuiltIn",
                        "type": "string"
                    },
                    "scopeId": {
                        "type": "string"
                    }
                },
                "required": [
                    "name",
                    "scope"
                ],
                "type": "object"
            }

### Get [GET {{{path}}}/registry{?name}{&scope}{&scopeId}]

Get an intent

+ Parameters

    + name (string, optional) - name of intent

    + scope (string, optional) - scope of intent

    + scopeId (string, optional) - scopeId of intent


+ Response 200

    [Intent][]

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

+ Response 503 (application/json)

    + Body

            {
                "message": "CDS persistence store is unavailable.",
                "status": 503
            }

    + Schema

            {
                "properties": {
                    "message": {
                        "type": "string"
                    },
                    "status": {
                        "type": "integer"
                    }
                },
                "type": "object"
            }

### Post [POST {{{path}}}/registry]

Create an intent

+ Request

    [Intent][]

+ Response 200

    [Intent][]

:[Response 400]({{{common}}}/responses/400.md)

+ Response 409 (application/json)

    + Body

            {
                "message": "An intent with that name/scope/scopeId combination exists.  Status, can not be created",
                "status": 409
            }

    + Schema

            {
                "properties": {
                    "message": {
                        "type": "string"
                    },
                    "status": {
                        "type": "integer"
                    }
                },
                "type": "object"
            }

:[Response 500]({{{common}}}/responses/500.md)

+ Response 503 (application/json)

    + Body

            {
                "message": "CDS persistence store is unavailable.",
                "status": 503
            }

    + Schema

            {
                "properties": {
                    "message": {
                        "type": "string"
                    },
                    "status": {
                        "type": "integer"
                    }
                },
                "type": "object"
            }

### Put [PUT {{{path}}}/registry{?name}{&scope}{&scopeId}]

Update an intent

+ Parameters

    + name (string, required) - name of intent

    + scope (string, required) - scope of intent

    + scopeId (string, optional) - scopeId of intent


+ Request
    [Intent][]

+ Response 200 (application/json)

    + Body

            {
                "ok": 1,
                "nModified": 1,
                "n": 1
            }

    + Schema

            {
                "properties": {
                    "n": {
                        "type": "integer"
                    },
                    "nModified": {
                        "type": "integer"
                    },
                    "ok": {
                        "type": "integer"
                    }
                },
                "type": "object"
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

+ Response 503 (application/json)

    + Body

            {
                "message": "CDS persistence store is unavailable.",
                "status": 503
            }

    + Schema

            {
                "properties": {
                    "message": {
                        "type": "string"
                    },
                    "status": {
                        "type": "integer"
                    }
                },
                "type": "object"
            }


### Delete [DELETE {{{path}}}/registry{?name}{&scope}{&scopeId}]

Delete an intent

+ Parameters

    + name (string, optional) - name of intent

    + scope (string, optional) - scope of intent

    + scopeId (string, optional) - scopeId of intent


+ Response 200 (application/json)

    + Body

            {
                "ok": 1,
                "n": 1
            }

    + Schema

            {
                "properties": {
                    "n": {
                        "type": "integer"
                    },
                    "ok": {
                        "type": "integer"
                    }
                },
                "type": "object"
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

+ Response 503 (application/json)

    + Body

            {
                "message": "CDS persistence store is unavailable.",
                "status": 503
            }

    + Schema

            {
                "properties": {
                    "message": {
                        "type": "string"
                    },
                    "status": {
                        "type": "integer"
                    }
                },
                "type": "object"
            }

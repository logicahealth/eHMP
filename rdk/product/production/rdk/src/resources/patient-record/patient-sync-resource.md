# Group Sync

## Synchronization [{{{path}}}]

### Load [GET {{{path}}}/load{?pid}{&forcedSite}{&prioritySite}{&immediate}]

Synchronize a patient's data

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + forcedSite (string, optional) - A comma-separated list of sites to force to be synchronized, or "true" to force all sites

    + prioritySite (string, optional) - When this site has finished synchronizing, return the results even if a full synchronization has not completed. Ignored if forcedSite is provided.

    + immediate (boolean, optional) - Whether to return immediately, before the sync has completed. Ignored if prioritySite is provided.

+ Response 200 (application/json)

+ Response 201 (application/json)

    + Schema

            :[Schema]({{{common}}}/schemas/sync_load-GET-201.jsonschema)

+ Response 400 (application/json)

    + Body

            {
                "data": [
                    "The required parameter \"pid\" is missing."
                ],
                "status": 400
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_load-GET-400.jsonschema)

+ Response 404 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 2,
                        "message": "ssss"
                    }
                },
                "status": 404
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_load-GET-404.jsonschema)


### Demographics Load [POST {{{path}}}/demographics-load]

Synchronize a patient's data by demographics

+ Request JSON Message (application/json)

    + Body

            {
                "edipi": "4325678",
                "demographics": {
                    "givenNames": "PATIENT",
                    "familyName": "DODONLY"
                }
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "demographics"
                ],
                "properties": {
                    "demographics": {
                        "type": "object",
                        "properties": {
                            "dob": {
                                "type": "string"
                            },
                            "givenNames": {
                                "type": "string"
                            },
                            "familyName": {
                                "type": "string"
                            },
                            "ssn": {
                                "type": "string"
                            }
                        }
                    },
                    "edipi": {
                        "type": "string",
                        "pattern": "^\\d+$"
                    },
                    "icn": {
                        "type": "string",
                        "pattern": "^([0-9]+)V([0-9]+)$"
                    }
                }
            }

+ Response 201 (application/json)

    + Body

            {
                "data": {
                    "jobStatus": [],
                    "jpid": "ssss",
                    "syncStatus": {
                        "completedStamp": {
                            "icn": "ssss",
                            "sourceMetaStamp": {}
                        }
                    }
                },
                "status": 201
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_status-GET-200.jsonschema)

+ Response 400 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 500,
                        "message": "A dod pid is invalid, please use an edipi or icn."
                    }
                },
                "status": 400
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_status-GET-400.jsonschema)

+ Response 404 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 2,
                        "message": "ssss"
                    }
                },
                "status": 404
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_status-GET-404.jsonschema)

+ Response 500 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 2,
                        "message": "ssss"
                    }
                },
                "status": 500
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_status-GET-500.jsonschema)


### Clear [GET {{{path}}}/clear{?pid}]

Clear the patient's synchronized data

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "code": 2,
                    "message": "ssss"
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_clear-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

+ Response 404 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 2,
                        "message": "ssss"
                    }
                },
                "status": 404
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_clear-GET-404.jsonschema)


### Status [GET {{{path}}}/status{?pid}]

Return the synchronization status for the patient as returned by JDS

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "jobStatus": [],
                    "jpid": "ssss",
                    "syncStatus": {
                        "completedStamp": {
                            "icn": "ssss",
                            "sourceMetaStamp": {}
                        }
                    }
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_status-GET-200.jsonschema)

+ Response 400 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 500,
                        "message": "The required parameter \"pid\" is missing."
                    }
                },
                "status": 400
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_status-GET-400.jsonschema)

+ Response 404 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 2,
                        "message": "ssss"
                    }
                },
                "status": 404
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_status-GET-404.jsonschema)

+ Response 500 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 2,
                        "message": "ssss"
                    }
                },
                "status": 500
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_status-GET-500.jsonschema)


### Datastatus [GET {{{path}}}/data-status{?pid}]

Return the synchronization status for the patient, processed to be simpler to digest

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "DOD": {
                        "completedStamp": 2,
                        "isSyncCompleted": true
                    },
                    "HDR": {
                        "completedStamp": 2,
                        "isSyncCompleted": true
                    },
                    "VISTA": {},
                    "VLER": {
                        "completedStamp": 2,
                        "isSyncCompleted": true
                    },
                    "allSites": true
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_data-status-GET-200.jsonschema)

+ Response 400 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 500,
                        "message": "The required parameter \"pid\" is missing."
                    }
                },
                "status": 400
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_data-status-GET-400.jsonschema)

+ Response 404 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 2,
                        "message": "ssss"
                    }
                },
                "status": 404
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_data-status-GET-404.jsonschema)

+ Response 500 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 2,
                        "message": "ssss"
                    }
                },
                "status": 500
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_data-status-GET-500.jsonschema)


### Sync Status Detail [GET {{{path}}}/status-detail{?pid}]

Return a detailed synchronization status for the patient

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "completedStamp": {
                        "icn": "ssss",
                        "sourceMetaStamp": {
                            "9E7A": {
                                "domainMetaStamp": {},
                                "localId": 2,
                                "pid": "9E7A;3",
                                "stampTime": 2,
                                "syncCompleted": true
                            }
                        }
                    },
                    "inProgress": {
                        "icn": "ssss",
                        "sourceMetaStamp": {}
                    }
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_status-detail-GET-200.jsonschema)

+ Response 400 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 500,
                        "message": "The required parameter \"pid\" is missing."
                    }
                },
                "status": 400
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_status-detail-GET-400.jsonschema)

+ Response 404 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 2,
                        "message": "ssss"
                    }
                },
                "status": 404
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_status-detail-GET-404.jsonschema)

+ Response 500 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 2,
                        "message": "ssss"
                    }
                },
                "status": 500
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_status-detail-GET-500.jsonschema)


### Operationalstatus [GET {{{path}}}/operational-status]

Return the operational status of the logged-in user's site

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "completedStamp": {
                        "sourceMetaStamp": {}
                    }
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_operational-status-GET-200.jsonschema)

+ Response 404 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 2,
                        "message": "ssss"
                    }
                },
                "status": 404
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_data-status-GET-404.jsonschema)

+ Response 500 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 2,
                        "message": "ssss"
                    }
                },
                "status": 500
            }

    + Schema

            :[Schema]({{{common}}}/schemas/sync_data-status-GET-500.jsonschema)

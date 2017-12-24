# Group Incident Report

## Incident Report [{{{path}}}]

### Create Incident Report [POST]

Create an incident report

+ Request (applicaton/json)

    + Body

            {
                "pid": "SITE;3",
                "icn": "",
                "comment": "",
                "simpleSyncStatus": {},
                "incidents": [
                    {
                        "simpleSyncStatus": {},
                        "errorTimestamp": "2017-01-18T18:04:40.229Z",
                        "message": "",
                        "trace": "",
                        "errorLogId": "",
                        "requestId": "cd229052-a3ea-49c4-b0e2-4de0e2863734",
                        "route": "",
                        "routeHistory": [
                            "/staff/provider-centric-view",
                            "/patient/summary"
                        ],
                        "routeHistoryTimes": [
                            1484762636811,
                            1484762677444
                        ]
                    }
                ],
                "tracker": {
                    "screenName": "summary",
                    "hash": "#/patient/summary",
                    "hostname": "IP         ",
                    "url": "https://IP         /#/patient/summary",
                    "appCodeName": "Mozilla",
                    "appName": "Netscape",
                    "appVersion": "5.0 (Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET4.0C; .NET4.0E; rv:11.0) like Gecko",
                    "platform": "Win32",
                    "facility": "PANORAMA",
                    "duz": {
                        "SITE": "3"
                    },
                    "site": "SITE",
                    "title": "Clinician",
                    "history": [
                        "/staff/provider-centric-view",
                        "/patient/summary"
                    ],
                    "historyTimes": [
                        1484762636811,
                        1484762677444
                    ]
                }
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "pid": {
                      "type": "string"
                    },
                    "icn": {
                      "type": "string"
                    },
                    "comment": {
                      "type": "string"
                    },
                    "simpleSyncStatus": {
                      "type": "object",
                      "properties": {}
                    },
                    "incidents": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "simpleSyncStatus": {
                                    "type": "object",
                                    "properties": {}
                                },
                                "errorTimestamp": {
                                    "type": "string",
                                    "pattern": "^\\d{4}-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d(?:\\.\\d+)Z$"
                                },
                                "message": {
                                    "type": "string"
                                },
                                "trace": {
                                    "type": "string"
                                },
                                "errorLogId": {
                                    "type": "string"
                                },
                                "requestId": {
                                    "type": "string"
                                },
                                "route": {
                                    "type": "string"
                                },
                                "routeHistory": {
                                    "type": "array",
                                    "items": {
                                        "type": "string"
                                    }
                                },
                                "routeHistoryTimes": {
                                    "type": "array",
                                    "items": {
                                        "type": "integer"
                                    }
                                }
                            },
                            "required": [
                                "errorTimestamp",
                                "message"
                            ]
                        }
                    },
                    "tracker": {
                        "type": "object",
                        "properties": {
                            "screenName": {
                                "type": "string"
                            },
                            "hash": {
                                "type": "string"
                            },
                            "hostname": {
                                "type": "string"
                            },
                            "url": {
                                "type": "string"
                            },
                            "appCodeName": {
                                "type": "string"
                            },
                            "appName": {
                                "type": "string"
                            },
                            "appVersion": {
                                "type": "string"
                            },
                            "platform": {
                                "type": "string"
                            },
                            "facility": {
                                "type": "string"
                            },
                            "duz": {
                                "type": "object"
                            },
                            "site": {
                                "type": "string"
                            },
                            "title": {
                                "type": "string"
                            },
                            "history": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            },
                            "historyTimes": {
                                "type": "array",
                                "items": {
                                    "type": "integer"
                                }
                            }
                        }
                    }
                }
            }



+ Response 200 (application/json)

    + Body

            {
                "incidentReportId": "eHMP-IR-b178c7d0-d9cb-11e6-ae0d-f990add101be",
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/incident-report-POST-200.jsonschema)

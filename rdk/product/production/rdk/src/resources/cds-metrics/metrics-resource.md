# Group Cds

## Cds metrics cds metrics [{{{path}}}]

### Get [GET {{{path}}}/metrics{?metricId}{&startPeriod}{&endPeriod}{&granularity}{&origin*}{&invocationType*}]

Get Metrics

#### Notes

Returns a list of metric data points. Points will contain a sequence of values over time which can be turned into a chart.

+ Parameters

    + metricId (string, required) - metricId of metric

    + startPeriod (number, required) - startPeriod the begining range of when a queried metric is captured; Unix time in milliseconds

    + endPeriod (number, optional) - endPeriod the end range of when a queried metric is captured; Unix time in milliseconds

    + granularity (number, optional) - granularity the length of time in milliseconds in which metrics are aggregated

    + origin (string, optional) - Used to filter by using the name of the source from where a metric originated

    + invocationType (enum[string], optional) - describes how a metric is generated

        Id of a Post

        + Members
            + `Direct`
            + `Background`


+ Response 200 (application/json)

	+ Body

            {
                "status": 200,
                "data": [
                    {
                        "datetime": 1431633600000,
                        "count": 19,
                        "min": 0.0,
                        "max": 0.0,
                        "sum": 0.0
                    }
                ]
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "object",
              "properties": {
                "status": {
                  "type": "integer"
                },
                "data": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "count": {
                        "description": "Count value",
                        "type": "integer"
                      },
                      "min": {
                        "description": "Minimum value",
                        "type": "integer"
                      },
                      "max": {
                        "description": "Maximum value",
                        "type": "integer"
                      },
                      "sum": {
                        "description": "Sum of values",
                        "type": "integer"
                      },
                      "datetime": {
                        "description": "unix datetime number",
                        "type": "integer"
                      },
                      "isoDate": {
                        "description": "iso date",
                        "type": "string"
                      }
                    }
                  }
                }
              },
              "required": [
                "status",
                "data"
              ]
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)


### Get Dashboards [GET {{{path}}}/dashboards/{userIdParam}]

Dashboard resource

#### Notes

Gets a list of dashboards that were saved by an associated user. A dashboard is an object which contains settings for charts which can be displayed visually. This list will only contain dashboard metadata, and will not store chart details. This is useful for populating a selection list of dashboards.

+ Parameters

    + userIdParam (string, required) - user id for whom we are showing dashboards.

+ Response 200 (application/json)

	+ Body

            {
                "status": 200,
                "data": {
                    "_id": "5554c5f4e17664dc31573ae9",
                    "userId": "testuser",
                    "name": "New Dashboard",
                    "description": "This is a dashboard example",
                    "dashboardSettings": {
                        "startPeriod": 0,
                        "endPeriod": 0,
                        "periodSelected": false,
                        "granularitySelected": false
                    }
                }
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "object",
              "properties": {
                "status": {
                  "type": "integer"
                },
                "data": {
                  "type": "object",
                  "properties": {
                    "_id": {
                      "type": "string"
                    },
                    "userId": {
                      "type": "string"
                    },
                    "name": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    },
                    "dashboardSettings": {
                      "type": "object",
                      "properties": {
                        "startPeriod": {
                          "type": "integer"
                        },
                        "endPeriod": {
                          "type": "integer"
                        },
                        "periodSelected": {
                          "type": "boolean"
                        },
                        "granularitySelected": {
                          "type": "boolean"
                        }
                      }
                    }
                  }
                }
              },
              "required": [
                "status",
                "data"
              ]
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Post Dashboard [POST {{{path}}}/dashboard]

Dashboard resource

#### Notes

Creates a new dashboard.  Once a dashboard is created, it can be updated to have charts assigned to it.

+ Request JSON Message (application/json)

    + Body

            {
                "userId": "testuser",
                "name": "Dashboard Test",
                "description": "This is a test for dashboards",
                "configuration": null,
                "category": null,
                "dashboardSettings": {
                    "startPeriod": 0,
                    "endPeriod": 0,
                    "periodSelected": false,
                    "granularitySelected": true,
                    "period": null,
                    "granularity": "M15",
                    "endDate": null,
                    "hours": null,
                    "minutes": null,
                    "amPm": null
                },
                "charts": []
            }

+ Response 200 (application/json)

	+ Body

            {
              "status": 201,
              "data": [
                {
                  "userId": "testuser",
                  "name": "Dashboard Test",
                  "description": "This is a test for dashboards",
                  "configuration": null,
                  "category": null,
                  "dashboardSettings": {
                    "startPeriod": 0,
                    "endPeriod": 0,
                    "periodSelected": false,
                    "granularitySelected": true,
                    "period": null,
                    "granularity": "M15",
                    "endDate": null,
                    "hours": null,
                    "minutes": null,
                    "amPm": null
                  },
                  "charts": [],
                  "_id": "56ce41225290e47766dfffa8"
                }
              ]
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "object",
              "properties": {
                "status": {
                  "type": "integer"
                },
                "data": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "userId": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "description": {
                        "type": "string"
                      },
                      "configuration": {
                        "type": "null"
                      },
                      "category": {
                        "type": "null"
                      },
                      "dashboardSettings": {
                        "type": "object",
                        "properties": {
                          "startPeriod": {
                            "type": "integer"
                          },
                          "endPeriod": {
                            "type": "integer"
                          },
                          "periodSelected": {
                            "type": "boolean"
                          },
                          "granularitySelected": {
                            "type": "boolean"
                          },
                          "period": {
                            "type": "null"
                          },
                          "granularity": {
                            "type": "string"
                          },
                          "endDate": {
                            "type": "null"
                          },
                          "hours": {
                            "type": "null"
                          },
                          "minutes": {
                            "type": "null"
                          },
                          "amPm": {
                            "type": "null"
                          }
                        }
                      },
                      "charts": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "title": {
                              "type": "string"
                            },
                            "period": {
                              "type": "string"
                            },
                            "startPeriod": {
                              "type": "integer"
                            },
                            "endPeriod": {
                              "type": "integer"
                            },
                            "granularity": {
                              "type": "string"
                            },
                            "metricGroupId": {
                              "type": "string"
                            },
                            "selectedMetaDefinitions": {
                              "type": "array",
                              "items": {
                                "type": "object",
                                "properties": {
                                  "name": {
                                    "type": "string"
                                  },
                                  "methodName": {
                                    "type": "string"
                                  },
                                  "definitionId": {
                                    "type": "string"
                                  }
                                }
                              }
                            },
                            "chartType": {
                              "type": "string"
                            },
                            "liveUpdates": {
                              "type": "boolean"
                            },
                            "hours": {
                              "type": "string"
                            },
                            "minutes": {
                              "type": "string"
                            },
                            "amPm": {
                              "type": "string"
                            }
                          }
                        }
                      },
                      "_id": {
                        "type": "string"
                      }
                    }
                  }
                }
              },
              "required": [
                "status",
                "data"
              ]
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Get Dashboard [GET {{{path}}}/dashboard/{dashboardId}]

Dashboard resource

#### Notes

Gets a dashboard

+ Parameters

    + dashboardId (string, required) - dashboardId of dashboard

+ Response 200 (application/json)

	+ Body

            {
                "status": 200,
                "data": [{
                        "_id": "5554c5f4e17664dc31573ae9",
                        "userId": "testuser",
                        "name": "New Dashboard",
                        "description": "This is a dashboard example",
                        "dashboardSettings": {
                            "startPeriod": 1431534434120,
                            "endPeriod": 1431620834120,
                            "periodSelected": true,
                            "granularitySelected": true,
                            "period": "D1",
                            "granularity": "H8",
                            "hours": "1",
                            "minutes": "00",
                            "amPm": "AM"
                        },
                        "charts": [
                        {
                            "title": "Session Count Chart",
                            "period": "D1",
                            "startPeriod": 1431534434113,
                            "endPeriod": 1431620834113,
                            "granularity": "H8",
                            "metricGroupId": "SessionCount",
                            "selectedMetaDefinitions": [
                            {
                                "name": "SessionCount",
                                "methodName": "avg",
                                "definitionId": "1"
                            },
                            {
                                "name": "SessionCount",
                                "methodName": "count",
                                "definitionId": "1"
                            }
                            ],
                            "chartType": "COMBO",
                            "liveUpdates": false,
                            "hours": "1",
                            "minutes": "00",
                            "amPm": "AM"
                        }
                    ]
                }]
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "object",
              "properties": {
                "status": {
                  "type": "integer"
                },
                "data": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "_id": {
                        "type": "string"
                      },
                      "userId": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "description": {
                        "type": "string"
                      },
                      "dashboardSettings": {
                        "type": "object",
                        "properties": {
                          "startPeriod": {
                            "type": "integer"
                          },
                          "endPeriod": {
                            "type": "integer"
                          },
                          "periodSelected": {
                            "type": "boolean"
                          },
                          "granularitySelected": {
                            "type": "boolean"
                          },
                          "period": {
                            "type": "string"
                          },
                          "granularity": {
                            "type": "string"
                          },
                          "hours": {
                            "type": "string"
                          },
                          "minutes": {
                            "type": "string"
                          },
                          "amPm": {
                            "type": "string"
                          }
                        }
                      },
                      "charts": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "title": {
                              "type": "string"
                            },
                            "period": {
                              "type": "string"
                            },
                            "startPeriod": {
                              "type": "integer"
                            },
                            "endPeriod": {
                              "type": "integer"
                            },
                            "granularity": {
                              "type": "string"
                            },
                            "metricGroupId": {
                              "type": "string"
                            },
                            "selectedMetaDefinitions": {
                              "type": "array",
                              "items": {
                                "type": "object",
                                "properties": {
                                  "name": {
                                    "type": "string"
                                  },
                                  "methodName": {
                                    "type": "string"
                                  },
                                  "definitionId": {
                                    "type": "string"
                                  }
                                }
                              }
                            },
                            "chartType": {
                              "type": "string"
                            },
                            "liveUpdates": {
                              "type": "boolean"
                            },
                            "hours": {
                              "type": "string"
                            },
                            "minutes": {
                              "type": "string"
                            },
                            "amPm": {
                              "type": "string"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              "required": [
                "status",
                "data"
              ]
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Put Dashboard [PUT {{{path}}}/dashboard/{dashboardId}]

Dashboard resource

#### Notes

Updates a dashboard

+ Parameters

    + dashboardId (string, required) - dashboardId of dashboard

+ Request JSON Message (application/json)

    + Body

            {
               "_id": "558c5e79a34794af517be688",
               "userId": "testuser",
               "name": "Update Dashboard Test",
               "description": "This is a test for updating dashboards",
               "configuration":null,
               "category":null,
               "dashboardSettings": {
                  "startPeriod":0,
                  "endPeriod":0,
                  "periodSelected":false,
                  "granularitySelected":true,
                  "period":null,
                  "granularity": "M15",
                  "endDate":null,
                  "hours":null,
                  "minutes":null,
                  "amPm":null
               },
               "charts": [

               ]
            }

+ Response 200 (application/json)

	+ Body

            {
                "data": {
                    "result": "1"
                },
                "status": 200
            }

    + Schema

            {
               "$schema": "http://json-schema.org/draft-04/schema#",
               "type": "object",
               "properties": {
                  "data": {
                     "type": "object",
                     "properties": {
                        "result": {
                           "type": "string"
                        }
                     },
                     "required": [
                        "result"
                     ]
                  },
                  "status": {
                     "type": "integer"
                  }
               },
               "required": [
                  "data",
                  "status"
               ]
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Delete Dashboard [DELETE {{{path}}}/dashboard/{dashboardId}]

Dashboard resource

#### Notes

Delete a dashboard

+ Parameters

    + dashboardId (string, required) - dashboardId of dashboard

+ Response 200 (application/json)

	+ Body

            {
                "data": {
                    "result": "1"
                },
                "status": 200
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "object",
              "properties": {
                "data": {
                  "type": "object",
                  "properties": {
                    "result": {
                      "type": "string"
                    }
                  },
                  "required": [
                    "result"
                  ]
                },
                "status": {
                  "type": "integer"
                }
              },
              "required": [
                "data",
                "status"
              ]
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Get Groups [GET {{{path}}}/groups]

Metrics groups resource

#### Notes

Gets metrics groups

+ Response 200 (application/json)

	+ Body

            {
                "status": 200,
                "data": [{
                    "_id": "54d46c139bb12bc802bb92cc",
                    "name": "All Metrics",
                    "description": "A list of all metric definitions currently available",
                    "metricList": [
                        "SessionCount",
                        "Execution_Begin",
                        "Invocation_Begin",
                        "Summary_Total"
                    ]
                }]
            }

    + Schema

            {
               "$schema": "http://json-schema.org/draft-04/schema#",
               "type": "object",
               "properties": {
                  "status": {
                     "type": "integer"
                  },
                  "data": {
                     "type": "array",
                     "items": {
                        "type": "object",
                        "properties": {
                           "_id": {
                              "type": "string"
                           },
                           "name": {
                              "type": "string"
                           },
                           "description": {
                              "type": "string"
                           },
                           "metricList": {
                              "type": "array",
                              "items": {
                                 "type": "string"
                              }
                           }
                        }
                     }
                  }
               },
               "required": [
                  "status",
                  "data"
               ]
            }

:[Response 500]({{{common}}}/responses/500.md)


### Post Group [POST {{{path}}}/groups]

Groups resource

#### Notes

Creates a metrics group

+ Request JSON Message (application/json)

    + Body

            {
               "name": "Metrics Test",
               "description": "Create Group Test",
               "metricList": [
                  "SessionCount",
                  "Execution_Begin",
                  "Execution_End",
                  "Invocation_Begin",
                  "Summary_HandlingResults",
                  "Summary_TotalResults"
               ]
            }

+ Response 201 (application/json)

	+ Body

            {
                "status": 201,
                "data": [{
                    "name": "test Metrics group",
                    "description": "This group contains test metrics",
                    "metricList": [
                        "SessionCount",
                        "Execution_Begin",
                        "Invocation_Begin",
                        "Summary_Total"
                    ],
                    "_id": "556763204ecbd1dcf18df798"
                }]
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "object",
              "properties": {
                "status": {
                  "type": "integer"
                },
                "data": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "name": {
                        "type": "string"
                      },
                      "description": {
                        "type": "string"
                      },
                      "metricList": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
                      },
                      "_id": {
                        "type": "string"
                      }
                    }
                  }
                }
              },
              "required": [
                "status",
                "data"
              ]
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Put Group [PUT {{{path}}}/groups]

Metrics groups resource

#### Notes

Updates a metrics group

+ Response 501 (application/json)

    + Body

            {
                "error": "Method not implemented",
                "status": 501
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "object",
              "properties": {
                "error": {
                  "type": "string"
                },
                "status": {
                  "type": "integer"
                }
              },
              "required": [
                "error",
                "status"
              ]
            }


### Delete Group [DELETE {{{path}}}/groups/{metricGroupId}]

Groups resource

#### Notes

Delete a metric group

+ Parameters

    + metricGroupId (string, required) - metricGroupId of metric group

+ Response 200 (application/json)

	+ Body

            {
                "data": {
                    "result": "1"
                },
                "status": 200
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "object",
              "properties": {
                "data": {
                  "type": "object",
                  "properties": {
                    "result": {
                      "type": "string"
                    }
                  },
                  "required": [
                    "result"
                  ]
                },
                "status": {
                  "type": "integer"
                }
              },
              "required": [
                "data",
                "status"
              ]
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Get Definitions [GET {{{path}}}/definitions]

Metrics resource

#### Notes

Gets metric definitions

+ Response 200 (application/json)

	+ Body

            {
                "status": 200,
                "data": [{
                    "_id": "8",
                    "name": "Summary_Total",
                    "description": "Summary, total timings report.",
                    "unitOfMeasure": "Count",
                    "updateInterval": 15000,
                    "aggregation": [
                        "count",
                        "min",
                        "max",
                        "avg",
                        "sum"
                    ],
                    "origins": [
                        "EngineOne",
                        "SystemB"
                    ],
                    "invocationTypes": [
                        "Direct",
                        "Background"
                    ],
                    "type": "invoke",
                    "event": "summary",
                    "property": "timings.total",
                    "collection": "metrics"
                }]
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "object",
              "properties": {
                "status": {
                  "type": "integer"
                },
                "data": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "_id": {
                        "type": "string"
                      },
                      "name": {
                        "type": "string"
                      },
                      "description": {
                        "type": "string"
                      },
                      "unitOfMeasure": {
                        "type": "string"
                      },
                      "updateInterval": {
                        "type": "integer"
                      },
                      "origins": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
                      },
                      "invocationTypes": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
                      },
                      "property": {
                        "type": "string"
                      },
                      "aggregation": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
                      },
                      "collection": {
                        "type": "string"
                      }
                    }
                  }
                }
              },
              "required": [
                "status",
                "data"
              ]
            }



:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Post Definitions [POST {{{path}}}/definitions]

Dashboard resource

#### Notes

Creates a new definition.

+ Request JSON Message (application/json)

    + Body

            {
               "name": "CreateDefinitionTest",
               "description": "Summary, handlingResults timings report.",
               "unitOfMeasure": "Count",
               "updateInterval": "15000",
               "origins": [

               ],
               "invocationTypes": [
                  "Direct",
                  "Background"
               ],
               "type": "invoke",
               "event": "summary",
               "property": "totalResults",
               "aggregation": [
                  "count",
                  "min",
                  "max",
                  "avg",
                  "sum"
               ],
               "collection": "metrics"
            }

+ Response 201 (application/json)

	+ Body

            {
                "data": {
                    "result": "1"
                },
                "status": 201
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "object",
              "properties": {
                "data": {
                  "type": "object",
                  "properties": {
                    "result": {
                      "type": "string"
                    }
                  },
                  "required": [
                    "result"
                  ]
                },
                "status": {
                  "type": "integer"
                }
              },
              "required": [
                "data",
                "status"
              ]
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Delete Definition [DELETE {{{path}}}/definitions/{definitionId}]

Dashboard resource

#### Notes

Deletes a new definition.

+ Response 200 (application/json)

	+ Body

            {
                "data": {
                    "result": "1"
                },
                "status": 200
            }

    + Schema

            {
              "$schema": "http://json-schema.org/draft-04/schema#",
              "type": "object",
              "properties": {
                "data": {
                  "type": "object",
                  "properties": {
                    "result": {
                      "type": "string"
                    }
                  },
                  "required": [
                    "result"
                  ]
                },
                "status": {
                  "type": "integer"
                }
              },
              "required": [
                "data",
                "status"
              ]
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


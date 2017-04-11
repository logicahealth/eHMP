# Group User

## User defined stack [{{{path}}}]

### Get [GET {{{path}}}{?id}{&predefined}]

Retrieve stacked graphs for a workspace

+ Parameters

    + id (string, required) - workspace name

    + predefined (boolean, optional) - predefined screen flag


+ Response 200 (application/json)

    + Body

            {
              "status": 200
            }

:[Response 500]({{{common}}}/responses/500.md)


### Post [POST {{{path}}}]

Create a new stacked graph in a particular applet in a particular workspace

+ Request JSON Message (application/json)

    + Body

            {
                "id": "0D4S;98712378133_TestWorkspace1_stacked",
                "graphType": "vitals",
                "typeName": "bloodpressure",
                "instanceId": "instance-1"
            }

    + Schema

            :[Schema]({{{common}}}/schemas/user-stack-POST.jsonschema)

+ Response 200 (application/json)

    + Body

            {
              "data": {
                "_id": "9E7A;10000000270_UserScreensConfig",
                "userDefinedFilters": [
                  {
                    "applets": [
                      {
                        "filters": [
                          "card"
                        ],
                        "instanceId": "applet-1"
                      }
                    ],
                    "id": "user-defined-workspace-2"
                  }
                ],
                "userDefinedGraphs": [
                  {
                    "applets": [
                      {
                        "graphs": [
                          {
                            "graphType": "Vitals",
                            "typeName": "Weight"
                          },
                          {
                            "graphType": "Vitals",
                            "typeName": "Height"
                          },
                          {
                            "graphType": "Vitals",
                            "typeName": "Blood Pressure Systolic"
                          }
                        ],
                        "instanceId": "applet-1"
                      }
                    ],
                    "id": "stacked-graphs"
                  }
                ],
                "userDefinedScreens": [
                  {
                    "appLeft": "patientInfo",
                    "appletHeader": "navigation",
                    "applets": [
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": "8",
                        "dataMaxSizeY": "12",
                        "dataMinSizeX": "4",
                        "dataMinSizeY": "4",
                        "dataRow": "1",
                        "dataSizeX": "8",
                        "dataSizeY": "12",
                        "filterName": "",
                        "id": "vista_health_summaries",
                        "instanceId": "applet-1",
                        "maximizeScreen": "vista-health-summaries-full",
                        "permissions": [
                          "read-vista-health-summary"
                        ],
                        "region": "applet-1",
                        "showInUDWSelection": true,
                        "title": "VistA Health Summaries",
                        "viewType": "summary"
                      }
                    ],
                    "contentRegionLayout": "gridster",
                    "id": "user-defined-workspace-1",
                    "userDefinedScreen": true
                  },
                  {
                    "appLeft": "patientInfo",
                    "appletHeader": "navigation",
                    "applets": [
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": 8,
                        "dataMaxSizeY": 12,
                        "dataMinSizeX": 4,
                        "dataMinSizeY": 4,
                        "dataRow": "1",
                        "dataSizeX": "4",
                        "dataSizeY": "4",
                        "id": "orders",
                        "instanceId": "applet-1",
                        "maximizeScreen": "orders-full",
                        "permissions": [
                          "read-order"
                        ],
                        "region": "applet-1",
                        "showInUDWSelection": true,
                        "title": "Orders",
                        "viewType": "summary"
                      },
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": 12,
                        "dataMaxSizeY": 12,
                        "dataMinSizeX": 8,
                        "dataMinSizeY": 4,
                        "dataRow": "5",
                        "dataSizeX": "8",
                        "dataSizeY": "6",
                        "id": "orders",
                        "instanceId": "applet-2",
                        "maximizeScreen": "orders-full",
                        "permissions": [
                          "read-order"
                        ],
                        "region": "applet-2",
                        "showInUDWSelection": true,
                        "title": "Orders",
                        "viewType": "expanded"
                      }
                    ],
                    "contentRegionLayout": "gridster",
                    "id": "orders",
                    "userDefinedScreen": true
                  },
                  {
                    "appLeft": "patientInfo",
                    "appletHeader": "navigation",
                    "applets": [
                      {
                        "context": [
                          "patient",
                          "staff"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": 8,
                        "dataMaxSizeY": 12,
                        "dataMinSizeX": 4,
                        "dataMinSizeY": 4,
                        "dataRow": "1",
                        "dataSizeX": "4",
                        "dataSizeY": "4",
                        "filterName": "",
                        "id": "activities",
                        "instanceId": "applet-1",
                        "maximizeScreen": "activities-patient-full",
                        "region": "applet-1",
                        "showInUDWSelection": true,
                        "title": "Activities",
                        "viewType": "summary"
                      },
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "5",
                        "dataMaxSizeX": 8,
                        "dataMaxSizeY": 12,
                        "dataMinSizeX": 4,
                        "dataMinSizeY": 4,
                        "dataRow": "1",
                        "dataSizeX": "4",
                        "dataSizeY": "4",
                        "id": "appointments",
                        "instanceId": "applet-2",
                        "maximizeScreen": "appointments-full",
                        "permissions": [
                          "read-encounter"
                        ],
                        "region": "applet-2",
                        "showInUDWSelection": true,
                        "title": "Appointments & Visits",
                        "viewType": "summary"
                      }
                    ],
                    "contentRegionLayout": "gridster",
                    "id": "user-defined-workspace-2",
                    "userDefinedScreen": true
                  },
                  {
                    "appLeft": "patientInfo",
                    "appletHeader": "navigation",
                    "applets": [
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": "12",
                        "dataMaxSizeY": "12",
                        "dataMinSizeX": "8",
                        "dataMinSizeY": "4",
                        "dataRow": "1",
                        "dataSizeX": "12",
                        "dataSizeY": "10",
                        "filterName": "",
                        "id": "stackedGraph",
                        "instanceId": "applet-1",
                        "permissions": [
                          "access-stack-graph"
                        ],
                        "region": "applet-1",
                        "showInUDWSelection": true,
                        "title": "Stacked Graphs",
                        "viewType": "expanded"
                      }
                    ],
                    "contentRegionLayout": "gridster",
                    "id": "stacked-graphs",
                    "userDefinedScreen": true
                  }
                ],
                "userScreensConfig": {
                  "screens": [
                    {
                      "description": "",
                      "id": "cover-sheet",
                      "predefined": true,
                      "routeName": "cover-sheet",
                      "screenId": 1,
                      "title": "Coversheet"
                    },
                    {
                      "description": "",
                      "id": "news-feed",
                      "predefined": true,
                      "routeName": "news-feed",
                      "screenId": 2,
                      "title": "Timeline"
                    },
                    {
                      "description": "",
                      "id": "overview",
                      "predefined": true,
                      "routeName": "overview",
                      "screenId": 3,
                      "title": "Overview"
                    },
                    {
                      "description": "",
                      "id": "medication-review",
                      "predefined": true,
                      "routeName": "medication-review",
                      "screenId": 4,
                      "title": "Meds Review"
                    },
                    {
                      "description": "",
                      "id": "documents-list",
                      "predefined": true,
                      "routeName": "documents-list",
                      "screenId": 5,
                      "title": "Documents"
                    },
                    {
                      "author": "PANORAMA USER",
                      "defaultScreen": false,
                      "fileName": "NewUserScreen",
                      "hasCustomize": false,
                      "id": "user-defined-workspace-1",
                      "predefined": false,
                      "routeName": "user-defined-workspace-1",
                      "screenId": 65191,
                      "title": "User Defined Workspace 1"
                    },
                    {
                      "author": "PANORAMA USER",
                      "defaultScreen": false,
                      "hasCustomize": false,
                      "id": "orders",
                      "predefined": false,
                      "routeName": "orders",
                      "screenId": 9698,
                      "title": "Orders"
                    },
                    {
                      "author": "PANORAMA USER",
                      "defaultScreen": false,
                      "fileName": "NewUserScreen",
                      "hasCustomize": false,
                      "id": "user-defined-workspace-2",
                      "predefined": false,
                      "routeName": "user-defined-workspace-2",
                      "screenId": 192370,
                      "title": "User Defined Workspace 2"
                    },
                    {
                      "author": "PANORAMA USER",
                      "defaultScreen": false,
                      "hasCustomize": false,
                      "id": "stacked-graphs",
                      "predefined": false,
                      "routeName": "stacked-graphs",
                      "screenId": 241962,
                      "title": "Stacked Graphs"
                    },
                    {
                      "description": "",
                      "id": "notifications-full",
                      "predefined": true,
                      "routeName": "notifications-full",
                      "screenId": 11,
                      "title": "Notifications"
                    },
                    {
                      "description": "",
                      "id": "provider-centric-view",
                      "predefined": true,
                      "routeName": "provider-centric-view",
                      "screenId": 12,
                      "title": "My Workspace"
                    }
                  ]
                }
              },
              "status": 200
            }

:[Response 500]({{{common}}}/responses/500.md)


### Delete [DELETE {{{path}}}{?id}{&graphType}{&typeName}{&instanceId}]

Remove a stacked graph in a particular applet in a particular workspace

+ Parameters

    + id (string, required) - workspace name

    + graphType (string, required) - stacked graph type

    + typeName (string, required) - stacked graph data type for the supplied type of graph

    + instanceId (string, required) - stacked graph applet instance id


+ Response 200 (application/json)

    + Body

            {
              "data": {
                "_id": "9E7A;10000000270_UserScreensConfig",
                "userDefinedFilters": [
                  {
                    "applets": [
                      {
                        "filters": [
                          "card"
                        ],
                        "instanceId": "applet-1"
                      }
                    ],
                    "id": "user-defined-workspace-2"
                  }
                ],
                "userDefinedGraphs": [
                  {
                    "applets": [
                      {
                        "graphs": [
                          {
                            "graphType": "Vitals",
                            "typeName": "Blood Pressure Systolic"
                          },
                          {
                            "graphType": "Vitals",
                            "typeName": "Height"
                          }
                        ],
                        "instanceId": "applet-1"
                      }
                    ],
                    "id": "stacked-graphs"
                  }
                ],
                "userDefinedScreens": [
                  {
                    "appLeft": "patientInfo",
                    "appletHeader": "navigation",
                    "applets": [
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": "8",
                        "dataMaxSizeY": "12",
                        "dataMinSizeX": "4",
                        "dataMinSizeY": "4",
                        "dataRow": "1",
                        "dataSizeX": "8",
                        "dataSizeY": "12",
                        "filterName": "",
                        "id": "vista_health_summaries",
                        "instanceId": "applet-1",
                        "maximizeScreen": "vista-health-summaries-full",
                        "permissions": [
                          "read-vista-health-summary"
                        ],
                        "region": "applet-1",
                        "showInUDWSelection": true,
                        "title": "VistA Health Summaries",
                        "viewType": "summary"
                      }
                    ],
                    "contentRegionLayout": "gridster",
                    "id": "user-defined-workspace-1",
                    "userDefinedScreen": true
                  },
                  {
                    "appLeft": "patientInfo",
                    "appletHeader": "navigation",
                    "applets": [
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": 8,
                        "dataMaxSizeY": 12,
                        "dataMinSizeX": 4,
                        "dataMinSizeY": 4,
                        "dataRow": "1",
                        "dataSizeX": "4",
                        "dataSizeY": "4",
                        "id": "orders",
                        "instanceId": "applet-1",
                        "maximizeScreen": "orders-full",
                        "permissions": [
                          "read-order"
                        ],
                        "region": "applet-1",
                        "showInUDWSelection": true,
                        "title": "Orders",
                        "viewType": "summary"
                      },
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": 12,
                        "dataMaxSizeY": 12,
                        "dataMinSizeX": 8,
                        "dataMinSizeY": 4,
                        "dataRow": "5",
                        "dataSizeX": "8",
                        "dataSizeY": "6",
                        "id": "orders",
                        "instanceId": "applet-2",
                        "maximizeScreen": "orders-full",
                        "permissions": [
                          "read-order"
                        ],
                        "region": "applet-2",
                        "showInUDWSelection": true,
                        "title": "Orders",
                        "viewType": "expanded"
                      }
                    ],
                    "contentRegionLayout": "gridster",
                    "id": "orders",
                    "userDefinedScreen": true
                  },
                  {
                    "appLeft": "patientInfo",
                    "appletHeader": "navigation",
                    "applets": [
                      {
                        "context": [
                          "patient",
                          "staff"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": 8,
                        "dataMaxSizeY": 12,
                        "dataMinSizeX": 4,
                        "dataMinSizeY": 4,
                        "dataRow": "1",
                        "dataSizeX": "4",
                        "dataSizeY": "4",
                        "filterName": "",
                        "id": "activities",
                        "instanceId": "applet-1",
                        "maximizeScreen": "activities-patient-full",
                        "region": "applet-1",
                        "showInUDWSelection": true,
                        "title": "Activities",
                        "viewType": "summary"
                      },
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "5",
                        "dataMaxSizeX": 8,
                        "dataMaxSizeY": 12,
                        "dataMinSizeX": 4,
                        "dataMinSizeY": 4,
                        "dataRow": "1",
                        "dataSizeX": "4",
                        "dataSizeY": "4",
                        "id": "appointments",
                        "instanceId": "applet-2",
                        "maximizeScreen": "appointments-full",
                        "permissions": [
                          "read-encounter"
                        ],
                        "region": "applet-2",
                        "showInUDWSelection": true,
                        "title": "Appointments & Visits",
                        "viewType": "summary"
                      }
                    ],
                    "contentRegionLayout": "gridster",
                    "id": "user-defined-workspace-2",
                    "userDefinedScreen": true
                  },
                  {
                    "appLeft": "patientInfo",
                    "appletHeader": "navigation",
                    "applets": [
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": "12",
                        "dataMaxSizeY": "12",
                        "dataMinSizeX": "8",
                        "dataMinSizeY": "4",
                        "dataRow": "1",
                        "dataSizeX": "12",
                        "dataSizeY": "10",
                        "filterName": "",
                        "id": "stackedGraph",
                        "instanceId": "applet-1",
                        "permissions": [
                          "access-stack-graph"
                        ],
                        "region": "applet-1",
                        "showInUDWSelection": true,
                        "title": "Stacked Graphs",
                        "viewType": "expanded"
                      }
                    ],
                    "contentRegionLayout": "gridster",
                    "id": "stacked-graphs",
                    "userDefinedScreen": true
                  }
                ],
                "userScreensConfig": {
                  "screens": [
                    {
                      "description": "",
                      "id": "cover-sheet",
                      "predefined": true,
                      "routeName": "cover-sheet",
                      "screenId": 1,
                      "title": "Coversheet"
                    },
                    {
                      "description": "",
                      "id": "news-feed",
                      "predefined": true,
                      "routeName": "news-feed",
                      "screenId": 2,
                      "title": "Timeline"
                    },
                    {
                      "description": "",
                      "id": "overview",
                      "predefined": true,
                      "routeName": "overview",
                      "screenId": 3,
                      "title": "Overview"
                    },
                    {
                      "description": "",
                      "id": "medication-review",
                      "predefined": true,
                      "routeName": "medication-review",
                      "screenId": 4,
                      "title": "Meds Review"
                    },
                    {
                      "description": "",
                      "id": "documents-list",
                      "predefined": true,
                      "routeName": "documents-list",
                      "screenId": 5,
                      "title": "Documents"
                    },
                    {
                      "author": "PANORAMA USER",
                      "defaultScreen": false,
                      "fileName": "NewUserScreen",
                      "hasCustomize": false,
                      "id": "user-defined-workspace-1",
                      "predefined": false,
                      "routeName": "user-defined-workspace-1",
                      "screenId": 65191,
                      "title": "User Defined Workspace 1"
                    },
                    {
                      "author": "PANORAMA USER",
                      "defaultScreen": false,
                      "hasCustomize": false,
                      "id": "orders",
                      "predefined": false,
                      "routeName": "orders",
                      "screenId": 9698,
                      "title": "Orders"
                    },
                    {
                      "author": "PANORAMA USER",
                      "defaultScreen": false,
                      "fileName": "NewUserScreen",
                      "hasCustomize": false,
                      "id": "user-defined-workspace-2",
                      "predefined": false,
                      "routeName": "user-defined-workspace-2",
                      "screenId": 192370,
                      "title": "User Defined Workspace 2"
                    },
                    {
                      "author": "PANORAMA USER",
                      "defaultScreen": false,
                      "hasCustomize": false,
                      "id": "stacked-graphs",
                      "predefined": false,
                      "routeName": "stacked-graphs",
                      "screenId": 241962,
                      "title": "Stacked Graphs"
                    },
                    {
                      "description": "",
                      "id": "notifications-full",
                      "predefined": true,
                      "routeName": "notifications-full",
                      "screenId": 11,
                      "title": "Notifications"
                    },
                    {
                      "description": "",
                      "id": "provider-centric-view",
                      "predefined": true,
                      "routeName": "provider-centric-view",
                      "screenId": 12,
                      "title": "My Workspace"
                    }
                  ]
                }
              },
              "status": 200
            }

:[Response 500]({{{common}}}/responses/500.md)


### Delete All [DELETE {{{path}}}/all{?StackedGraph}]

+ Parameters

    + StackedGraph (user-stack-delete-all, optional)


+ Response 200 (application/json)

    + Body

            {
              "data": {
                "_id": "9E7A;10000000270_UserScreensConfig",
                "userDefinedFilters": [
                  {
                    "applets": [
                      {
                        "filters": [
                          "card"
                        ],
                        "instanceId": "applet-1"
                      }
                    ],
                    "id": "user-defined-workspace-2"
                  }
                ],
                "userDefinedGraphs": [],
                "userDefinedScreens": [
                  {
                    "appLeft": "patientInfo",
                    "appletHeader": "navigation",
                    "applets": [
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": "8",
                        "dataMaxSizeY": "12",
                        "dataMinSizeX": "4",
                        "dataMinSizeY": "4",
                        "dataRow": "1",
                        "dataSizeX": "8",
                        "dataSizeY": "12",
                        "filterName": "",
                        "id": "vista_health_summaries",
                        "instanceId": "applet-1",
                        "maximizeScreen": "vista-health-summaries-full",
                        "permissions": [
                          "read-vista-health-summary"
                        ],
                        "region": "applet-1",
                        "showInUDWSelection": true,
                        "title": "VistA Health Summaries",
                        "viewType": "summary"
                      }
                    ],
                    "contentRegionLayout": "gridster",
                    "id": "user-defined-workspace-1",
                    "userDefinedScreen": true
                  },
                  {
                    "appLeft": "patientInfo",
                    "appletHeader": "navigation",
                    "applets": [
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": 8,
                        "dataMaxSizeY": 12,
                        "dataMinSizeX": 4,
                        "dataMinSizeY": 4,
                        "dataRow": "1",
                        "dataSizeX": "4",
                        "dataSizeY": "4",
                        "id": "orders",
                        "instanceId": "applet-1",
                        "maximizeScreen": "orders-full",
                        "permissions": [
                          "read-order"
                        ],
                        "region": "applet-1",
                        "showInUDWSelection": true,
                        "title": "Orders",
                        "viewType": "summary"
                      },
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": 12,
                        "dataMaxSizeY": 12,
                        "dataMinSizeX": 8,
                        "dataMinSizeY": 4,
                        "dataRow": "5",
                        "dataSizeX": "8",
                        "dataSizeY": "6",
                        "id": "orders",
                        "instanceId": "applet-2",
                        "maximizeScreen": "orders-full",
                        "permissions": [
                          "read-order"
                        ],
                        "region": "applet-2",
                        "showInUDWSelection": true,
                        "title": "Orders",
                        "viewType": "expanded"
                      }
                    ],
                    "contentRegionLayout": "gridster",
                    "id": "orders",
                    "userDefinedScreen": true
                  },
                  {
                    "appLeft": "patientInfo",
                    "appletHeader": "navigation",
                    "applets": [
                      {
                        "context": [
                          "patient",
                          "staff"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": 8,
                        "dataMaxSizeY": 12,
                        "dataMinSizeX": 4,
                        "dataMinSizeY": 4,
                        "dataRow": "1",
                        "dataSizeX": "4",
                        "dataSizeY": "4",
                        "filterName": "",
                        "id": "activities",
                        "instanceId": "applet-1",
                        "maximizeScreen": "activities-patient-full",
                        "region": "applet-1",
                        "showInUDWSelection": true,
                        "title": "Activities",
                        "viewType": "summary"
                      },
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "5",
                        "dataMaxSizeX": 8,
                        "dataMaxSizeY": 12,
                        "dataMinSizeX": 4,
                        "dataMinSizeY": 4,
                        "dataRow": "1",
                        "dataSizeX": "4",
                        "dataSizeY": "4",
                        "id": "appointments",
                        "instanceId": "applet-2",
                        "maximizeScreen": "appointments-full",
                        "permissions": [
                          "read-encounter"
                        ],
                        "region": "applet-2",
                        "showInUDWSelection": true,
                        "title": "Appointments & Visits",
                        "viewType": "summary"
                      }
                    ],
                    "contentRegionLayout": "gridster",
                    "id": "user-defined-workspace-2",
                    "userDefinedScreen": true
                  },
                  {
                    "appLeft": "patientInfo",
                    "appletHeader": "navigation",
                    "applets": [
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": "12",
                        "dataMaxSizeY": "12",
                        "dataMinSizeX": "8",
                        "dataMinSizeY": "4",
                        "dataRow": "1",
                        "dataSizeX": "12",
                        "dataSizeY": "10",
                        "filterName": "",
                        "id": "stackedGraph",
                        "instanceId": "applet-1",
                        "permissions": [
                          "access-stack-graph"
                        ],
                        "region": "applet-1",
                        "showInUDWSelection": true,
                        "title": "Stacked Graphs",
                        "viewType": "expanded"
                      }
                    ],
                    "contentRegionLayout": "gridster",
                    "id": "stacked-graphs",
                    "userDefinedScreen": true
                  }
                ],
                "userScreensConfig": {
                  "screens": [
                    {
                      "description": "",
                      "id": "cover-sheet",
                      "predefined": true,
                      "routeName": "cover-sheet",
                      "screenId": 1,
                      "title": "Coversheet"
                    },
                    {
                      "description": "",
                      "id": "news-feed",
                      "predefined": true,
                      "routeName": "news-feed",
                      "screenId": 2,
                      "title": "Timeline"
                    },
                    {
                      "description": "",
                      "id": "overview",
                      "predefined": true,
                      "routeName": "overview",
                      "screenId": 3,
                      "title": "Overview"
                    },
                    {
                      "description": "",
                      "id": "medication-review",
                      "predefined": true,
                      "routeName": "medication-review",
                      "screenId": 4,
                      "title": "Meds Review"
                    },
                    {
                      "description": "",
                      "id": "documents-list",
                      "predefined": true,
                      "routeName": "documents-list",
                      "screenId": 5,
                      "title": "Documents"
                    },
                    {
                      "author": "PANORAMA USER",
                      "defaultScreen": false,
                      "fileName": "NewUserScreen",
                      "hasCustomize": false,
                      "id": "user-defined-workspace-1",
                      "predefined": false,
                      "routeName": "user-defined-workspace-1",
                      "screenId": 65191,
                      "title": "User Defined Workspace 1"
                    },
                    {
                      "author": "PANORAMA USER",
                      "defaultScreen": false,
                      "hasCustomize": false,
                      "id": "orders",
                      "predefined": false,
                      "routeName": "orders",
                      "screenId": 9698,
                      "title": "Orders"
                    },
                    {
                      "author": "PANORAMA USER",
                      "defaultScreen": false,
                      "fileName": "NewUserScreen",
                      "hasCustomize": false,
                      "id": "user-defined-workspace-2",
                      "predefined": false,
                      "routeName": "user-defined-workspace-2",
                      "screenId": 192370,
                      "title": "User Defined Workspace 2"
                    },
                    {
                      "author": "PANORAMA USER",
                      "defaultScreen": false,
                      "hasCustomize": false,
                      "id": "stacked-graphs",
                      "predefined": false,
                      "routeName": "stacked-graphs",
                      "screenId": 241962,
                      "title": "Stacked Graphs"
                    },
                    {
                      "description": "",
                      "id": "notifications-full",
                      "predefined": true,
                      "routeName": "notifications-full",
                      "screenId": 11,
                      "title": "Notifications"
                    },
                    {
                      "description": "",
                      "id": "provider-centric-view",
                      "predefined": true,
                      "routeName": "provider-centric-view",
                      "screenId": 12,
                      "title": "My Workspace"
                    }
                  ]
                }
              },
              "status": 200
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Put [PUT]

Update a stacked graph's order in a particular applet in a particular workspace

+ Request JSON Message (application/json)

    + Body

            {
                "id": "9E7A;12345",
                "instanceId": "ssss",
                "graphs": []
            }

    + Schema

            :[Schema]({{{common}}}/schemas/user-stack-PUT-request.jsonschema)

+ Response 200 (application/json)

    + Body

            {
              "data": {
                "_id": "9E7A;10000000270_UserScreensConfig",
                "userDefinedFilters": [
                  {
                    "applets": [
                      {
                        "filters": [
                          "card"
                        ],
                        "instanceId": "applet-1"
                      }
                    ],
                    "id": "user-defined-workspace-2"
                  }
                ],
                "userDefinedGraphs": [
                  {
                    "applets": [
                      {
                        "graphs": [
                          {
                            "graphType": "Vitals",
                            "typeName": "Blood Pressure Systolic"
                          },
                          {
                            "graphType": "Vitals",
                            "typeName": "Weight"
                          },
                          {
                            "graphType": "Vitals",
                            "typeName": "Height"
                          }
                        ],
                        "instanceId": "applet-1"
                      }
                    ],
                    "id": "stacked-graphs"
                  }
                ],
                "userDefinedScreens": [
                  {
                    "appLeft": "patientInfo",
                    "appletHeader": "navigation",
                    "applets": [
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": "8",
                        "dataMaxSizeY": "12",
                        "dataMinSizeX": "4",
                        "dataMinSizeY": "4",
                        "dataRow": "1",
                        "dataSizeX": "8",
                        "dataSizeY": "12",
                        "filterName": "",
                        "id": "vista_health_summaries",
                        "instanceId": "applet-1",
                        "maximizeScreen": "vista-health-summaries-full",
                        "permissions": [
                          "read-vista-health-summary"
                        ],
                        "region": "applet-1",
                        "showInUDWSelection": true,
                        "title": "VistA Health Summaries",
                        "viewType": "summary"
                      }
                    ],
                    "contentRegionLayout": "gridster",
                    "id": "user-defined-workspace-1",
                    "userDefinedScreen": true
                  },
                  {
                    "appLeft": "patientInfo",
                    "appletHeader": "navigation",
                    "applets": [
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": 8,
                        "dataMaxSizeY": 12,
                        "dataMinSizeX": 4,
                        "dataMinSizeY": 4,
                        "dataRow": "1",
                        "dataSizeX": "4",
                        "dataSizeY": "4",
                        "id": "orders",
                        "instanceId": "applet-1",
                        "maximizeScreen": "orders-full",
                        "permissions": [
                          "read-order"
                        ],
                        "region": "applet-1",
                        "showInUDWSelection": true,
                        "title": "Orders",
                        "viewType": "summary"
                      },
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": 12,
                        "dataMaxSizeY": 12,
                        "dataMinSizeX": 8,
                        "dataMinSizeY": 4,
                        "dataRow": "5",
                        "dataSizeX": "8",
                        "dataSizeY": "6",
                        "id": "orders",
                        "instanceId": "applet-2",
                        "maximizeScreen": "orders-full",
                        "permissions": [
                          "read-order"
                        ],
                        "region": "applet-2",
                        "showInUDWSelection": true,
                        "title": "Orders",
                        "viewType": "expanded"
                      }
                    ],
                    "contentRegionLayout": "gridster",
                    "id": "orders",
                    "userDefinedScreen": true
                  },
                  {
                    "appLeft": "patientInfo",
                    "appletHeader": "navigation",
                    "applets": [
                      {
                        "context": [
                          "patient",
                          "staff"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": 8,
                        "dataMaxSizeY": 12,
                        "dataMinSizeX": 4,
                        "dataMinSizeY": 4,
                        "dataRow": "1",
                        "dataSizeX": "4",
                        "dataSizeY": "4",
                        "filterName": "",
                        "id": "activities",
                        "instanceId": "applet-1",
                        "maximizeScreen": "activities-patient-full",
                        "region": "applet-1",
                        "showInUDWSelection": true,
                        "title": "Activities",
                        "viewType": "summary"
                      },
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "5",
                        "dataMaxSizeX": 8,
                        "dataMaxSizeY": 12,
                        "dataMinSizeX": 4,
                        "dataMinSizeY": 4,
                        "dataRow": "1",
                        "dataSizeX": "4",
                        "dataSizeY": "4",
                        "id": "appointments",
                        "instanceId": "applet-2",
                        "maximizeScreen": "appointments-full",
                        "permissions": [
                          "read-encounter"
                        ],
                        "region": "applet-2",
                        "showInUDWSelection": true,
                        "title": "Appointments & Visits",
                        "viewType": "summary"
                      }
                    ],
                    "contentRegionLayout": "gridster",
                    "id": "user-defined-workspace-2",
                    "userDefinedScreen": true
                  },
                  {
                    "appLeft": "patientInfo",
                    "appletHeader": "navigation",
                    "applets": [
                      {
                        "context": [
                          "patient"
                        ],
                        "dataCol": "1",
                        "dataMaxSizeX": "12",
                        "dataMaxSizeY": "12",
                        "dataMinSizeX": "8",
                        "dataMinSizeY": "4",
                        "dataRow": "1",
                        "dataSizeX": "12",
                        "dataSizeY": "10",
                        "filterName": "",
                        "id": "stackedGraph",
                        "instanceId": "applet-1",
                        "permissions": [
                          "access-stack-graph"
                        ],
                        "region": "applet-1",
                        "showInUDWSelection": true,
                        "title": "Stacked Graphs",
                        "viewType": "expanded"
                      }
                    ],
                    "contentRegionLayout": "gridster",
                    "id": "stacked-graphs",
                    "userDefinedScreen": true
                  }
                ],
                "userScreensConfig": {
                  "screens": [
                    {
                      "description": "",
                      "id": "cover-sheet",
                      "predefined": true,
                      "routeName": "cover-sheet",
                      "screenId": 1,
                      "title": "Coversheet"
                    },
                    {
                      "description": "",
                      "id": "news-feed",
                      "predefined": true,
                      "routeName": "news-feed",
                      "screenId": 2,
                      "title": "Timeline"
                    },
                    {
                      "description": "",
                      "id": "overview",
                      "predefined": true,
                      "routeName": "overview",
                      "screenId": 3,
                      "title": "Overview"
                    },
                    {
                      "description": "",
                      "id": "medication-review",
                      "predefined": true,
                      "routeName": "medication-review",
                      "screenId": 4,
                      "title": "Meds Review"
                    },
                    {
                      "description": "",
                      "id": "documents-list",
                      "predefined": true,
                      "routeName": "documents-list",
                      "screenId": 5,
                      "title": "Documents"
                    },
                    {
                      "author": "PANORAMA USER",
                      "defaultScreen": false,
                      "fileName": "NewUserScreen",
                      "hasCustomize": false,
                      "id": "user-defined-workspace-1",
                      "predefined": false,
                      "routeName": "user-defined-workspace-1",
                      "screenId": 65191,
                      "title": "User Defined Workspace 1"
                    },
                    {
                      "author": "PANORAMA USER",
                      "defaultScreen": false,
                      "hasCustomize": false,
                      "id": "orders",
                      "predefined": false,
                      "routeName": "orders",
                      "screenId": 9698,
                      "title": "Orders"
                    },
                    {
                      "author": "PANORAMA USER",
                      "defaultScreen": false,
                      "fileName": "NewUserScreen",
                      "hasCustomize": false,
                      "id": "user-defined-workspace-2",
                      "predefined": false,
                      "routeName": "user-defined-workspace-2",
                      "screenId": 192370,
                      "title": "User Defined Workspace 2"
                    },
                    {
                      "author": "PANORAMA USER",
                      "defaultScreen": false,
                      "hasCustomize": false,
                      "id": "stacked-graphs",
                      "predefined": false,
                      "routeName": "stacked-graphs",
                      "screenId": 241962,
                      "title": "Stacked Graphs"
                    },
                    {
                      "description": "",
                      "id": "notifications-full",
                      "predefined": true,
                      "routeName": "notifications-full",
                      "screenId": 11,
                      "title": "Notifications"
                    },
                    {
                      "description": "",
                      "id": "provider-centric-view",
                      "predefined": true,
                      "routeName": "provider-centric-view",
                      "screenId": 12,
                      "title": "My Workspace"
                    }
                  ]
                }
              },
              "status": 200
            }

:[Response 500]({{{common}}}/responses/500.md)

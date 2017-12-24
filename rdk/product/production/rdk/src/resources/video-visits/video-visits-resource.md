# Group Video-Visits

## Video-Visits [{{{path}}}]

### Video-Visits [GET {{{path}}}{?pid}{&date.start}{&date.end}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    :[date.start]({{{common}}}/parameters/date.start.md)

    :[date.end]({{{common}}}/parameters/date.end.md)

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": []
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
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {}
                      }
                    }
                  }
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

### Video-Visits [POST {{{path}}}]

Create video visit appoinement with given json
+ Request JSON Message (application/json)

    + Body

            {
                "id":"testidjson",
                "duration": 30,
                "dateTime": "2017-01-31T18:15:00.000",
                "schedulingRequestType": "NEXT_AVAILABLE_APPT",
                "type": "REGULAR",
                "bookingNotes": "testing",
                "desiredDate": "2017-01-31T18:15:00.000",
                "instructionsTitle" : "this is a test",
                "instruction":"this is a test of instruction",
                "isInstructionsOther":false,
                "appointmentKind":"ADHOC",
                "sourceSystem":"VideoVisitService",
                "patients": {
                    "patient": [{
                        "id": {
                            "assigningAuthority":"ICN",
                            "uniqueId":"1111"
                        },
                        "name": {
                            "firstName": "testing",
                            "lastName": "unit",
                            "middleInitial": null
                        },
                        "contactInformation": {
                            "mobile": "1234567890",
                            "preferredEmail": "test@xyz.com",
                            "timeZone": "40"
                        },
                        "location": {
                            "type": "NonVA",
                            "facility": {
                                "name": "facility_1",
                                "siteCode": "12345",
                                "timeZone": "40"
                            },
                            "clinic": {
                                "ien": "clinic1",
                                "name": "Test"
                            }
                        },
                        "virtualMeetingRoom": {
                            "conference":"conference",
                            "pin":"12345",
                            "url":"http://test.com"
                        }
                    }]
                },
                "providers": {
                    "provider": [{
                        "name": {
                            "firstName": "testing",
                            "lastName": "unit",
                            "middleInitial": null
                        },
                        "id": {
                            "assigningAuthority": "ICN",
                            "uniqueId": "111111111"
                        },
                        "contactInformation": {
                            "mobile": "1234567890",
                            "preferredEmail": "test@xyz.com",
                            "timeZone": "40"
                        },
                        "location": {
                            "type": "VA",
                            "facility": {
                                "name": "facility_1",
                                "siteCode": "12345",
                                "timeZone": "40"
                            },
                            "clinic": {
                                "ien": "clinic1",
                                "name": "Test"
                            }
                        },
                        "virtualMeetingRoom": {
                            "conference":"conference",
                            "pin":"4321",
                            "url":"http://test.com"
                        }
                    }]
                }
            }

    + Schema

            {
                "type":"object",
                "$schema": "http://json-schema.org/draft-04/schema#",
                "properties":{
                    "appointmentKind": {
                        "type":[ "string", "null" ]
                    },
                    "bookingNotes": {
                        "type":[ "string", "null" ]
                    },
                    "dateTime": {
                        "type":[ "string", "null" ]
                    },
                    "desiredDate": {
                        "type":[ "string", "null" ]
                    },
                    "duration": {
                        "type":"number"
                    },
                    "id": {
                        "type":[ "string", "null" ]
                    },
                    "instruction": {
                        "type":[ "string", "null" ]
                    },
                    "instructionsTitle": {
                        "type":[ "string", "null" ]
                    },
                    "isInstructionsOther": {
                        "type":"boolean"
                    },
                    "patients": {
                        "type":"object",
                        "properties":{
                            "patient": {
                                "type":"array",
                                "items":
                                    {
                                        "type":"object",
                                        "properties":{
                                            "contactInformation": {
                                                "type":"object",
                                                "properties":{
                                                    "mobile": {
                                                        "type":[ "string", "null" ]
                                                    },
                                                    "preferredEmail": {
                                                        "type":[ "string", "null" ]
                                                    },
                                                    "timeZone": {
                                                        "type":[ "string", "null" ]
                                                    }
                                                }
                                            },
                                            "id": {
                                                "type":"object",
                                                "properties":{
                                                    "assigningAuthority": {
                                                        "type":[ "string", "null" ]
                                                    },
                                                    "uniqueId": {
                                                        "type":[ "string", "null" ]
                                                    }
                                                }
                                            },
                                            "location": {
                                                "type":"object",
                                                "properties":{
                                                    "clinic": {
                                                        "type":"object",
                                                        "properties":{
                                                            "ien": {
                                                                "type":[ "string", "null" ]
                                                            },
                                                            "name": {
                                                                "type":[ "string", "null" ]
                                                            }
                                                        }
                                                    },
                                                    "facility": {
                                                        "type":"object",
                                                        "properties":{
                                                            "name": {
                                                                "type":[ "string", "null" ]
                                                            },
                                                            "siteCode": {
                                                                "type":[ "string", "null" ]
                                                            },
                                                            "timeZone": {
                                                                "type":[ "string", "null" ]
                                                            }
                                                        }
                                                    },
                                                    "type": {
                                                        "type":[ "string", "null" ]
                                                    }
                                                }
                                            },
                                            "name": {
                                                "type":"object",
                                                "properties":{
                                                    "firstName": {
                                                        "type":[ "string", "null" ]
                                                    },
                                                    "lastName": {
                                                        "type":[ "string", "null" ]
                                                    },
                                                    "middleInitial": {
                                                        "type":[ "string", "null" ]
                                                    }
                                                }
                                            },
                                            "virtualMeetingRoom": {
                                                "type":"object",
                                                "properties":{
                                                    "conference": {
                                                        "type":[ "string", "null" ]
                                                    },
                                                    "pin": {
                                                        "type":[ "string", "null" ]
                                                    },
                                                    "url": {
                                                        "type":[ "string", "null" ]
                                                    }
                                                }
                                            }
                                        }
                                    }


                            }
                        }
                    },
                    "providers": {
                        "type":"object",
                        "properties":{
                            "provider": {
                                "type":"array",
                                "items":
                                    {
                                        "type":"object",
                                        "properties":{
                                            "contactInformation": {
                                                "type":"object",
                                                "properties":{
                                                    "mobile": {
                                                        "type":[ "string", "null" ]
                                                    },
                                                    "preferredEmail": {
                                                        "type":[ "string", "null" ]
                                                    },
                                                    "timeZone": {
                                                        "type":[ "string", "null" ]
                                                    }
                                                }
                                            },
                                            "id": {
                                                "type":"object",
                                                "properties":{
                                                    "assigningAuthority": {
                                                        "type":[ "string", "null" ]
                                                    },
                                                    "uniqueId": {
                                                        "type":[ "string", "null" ]
                                                    }
                                                }
                                            },
                                            "location": {
                                                "type":"object",
                                                "properties":{
                                                    "clinic": {
                                                        "type":"object",
                                                        "properties":{
                                                            "ien": {
                                                                "type":[ "string", "null" ]
                                                            },
                                                            "name": {
                                                                "type":[ "string", "null" ]
                                                            }
                                                        }
                                                    },
                                                    "facility": {
                                                        "type":"object",
                                                        "properties":{
                                                            "name": {
                                                                "type":[ "string", "null" ]
                                                            },
                                                            "siteCode": {
                                                                "type":[ "string", "null" ]
                                                            },
                                                            "timeZone": {
                                                                "type":[ "string", "null" ]
                                                            }
                                                        }
                                                    },
                                                    "type": {
                                                        "type":[ "string", "null" ]
                                                    }
                                                }
                                            },
                                            "name": {
                                                "type":"object",
                                                "properties":{
                                                    "firstName": {
                                                        "type":[ "string", "null" ]
                                                    },
                                                    "lastName": {
                                                        "type":[ "string", "null" ]
                                                    },
                                                    "middleInitial": {
                                                        "type":[ "string", "null" ]
                                                    }
                                                }
                                            },
                                            "virtualMeetingRoom": {
                                                "type":"object",
                                                "properties":{
                                                    "conference": {
                                                        "type":[ "string", "null" ]
                                                    },
                                                    "pin": {
                                                        "type":[ "string", "null" ]
                                                    },
                                                    "url": {
                                                        "type":[ "string", "null" ]
                                                    }
                                                }
                                            }
                                        }
                                    }

                            }
                        }
                    },
                    "schedulingRequestType": {
                        "type":[ "string", "null" ]
                    },
                    "sourceSystem": {
                        "type":[ "string", "null" ]
                    },
                    "type": {
                        "type":[ "string", "null" ]
                    }
                }
            }


+ Response 200 (application/json)
    + Body

            {
              "data": {
                "items": [
                  {
                    "id": "testidjson",
                    "writeResults": {
                      "writeResult": [
                        {
                          "personId": "1111",
                          "name": {
                            "firstName": "testing",
                            "lastName": "unit",
                            "middleInitial": null
                          },
                          "facilityCode": "12345",
                          "facilityName": "facility_1",
                          "clinicIEN": "clinic1",
                          "clinicName": "Test",
                          "dateTime": "2017-01-30T17:00:00.000",
                          "vistaStatus": "BOOKED",
                          "reason": "VVS will not attempt to write any appointment record to a VistA system"
                        }
                      ]
                    }
                  }
                ]
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
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type":[ "string", "null" ]
                          },
                          "writeResults": {
                            "type": "object",
                            "properties": {
                              "writeResult": {
                                "type": "array",
                                "items": {
                                  "type": "object",
                                  "properties": {
                                    "personId": {
                                      "type":[ "string", "null" ]
                                    },
                                    "name": {
                                      "type": "object",
                                      "properties": {
                                        "firstName": {
                                          "type":[ "string", "null" ]
                                        },
                                        "lastName": {
                                          "type":[ "string", "null" ]
                                        },
                                        "middleInitial": {"type": [ "string", "null" ]}
                                      }
                                    },
                                    "facilityCode": {
                                      "type":[ "string", "null" ]
                                    },
                                    "facilityName": {
                                      "type":[ "string", "null" ]
                                    },
                                    "clinicIEN": {
                                      "type":[ "string", "null" ]
                                    },
                                    "clinicName": {
                                      "type":[ "string", "null" ]
                                    },
                                    "dateTime": {
                                      "type":[ "string", "null" ]
                                    },
                                    "vistaStatus": {
                                      "type":[ "string", "null" ]
                                    },
                                    "reason": {
                                      "type":[ "string", "null" ]
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
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

### Provider-Contact-info [GET {{{path}}}/provider/contact{?facilityCode}{&ien}]

+ Parameters

    + facilityCode (string, optional) - facility code
    + ien (number, optional) - ien

+ Response 200 (application/json)

    + Body
  
            {
                "data": {
                    "items": [{
                        "_id": "",
                        "providerId": {
                            "uniqueId": "",
                            "sourceSystem": ""
                        },
                        "email": "",
                        "phone": "",
                        "createdDate": "",
                        "lastModifiedDate": ""
                    }]
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
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                            "_id": {
                                "type":[ "string", "null" ]
                            },
                            "providerId": {
                                "type": "object",
                                 "properties": {
                                    "uniqueId": {
                                        "type":[ "string", "null" ]
                                    },
                                    "sourceSystem": {
                                        "type":[ "string", "null" ]
                                    }
                                }
                            },
                            "email": {
                                "type":[ "string", "null" ]
                            },
                            "phone": {
                                "type":[ "string", "null" ]
                            },
                            "createdDate": {
                                "type":[ "string", "null" ]
                            },
                            "lastModifiedDate": {
                                "type":[ "string", "null" ]
                            }
                        }
                      }
                    }
                  }
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

### Provider-Contact-info [POST {{{path}}}/provider/contact{?facilityCode}{&ien}]

Create providers contact with given json

+ Parameters

    + facilityCode (string, optional) - facility code
    + ien (number, optional) - ien

+ Request JSON Message (application/json)

    + Body

            {
                "email":"",
                "phone":""

            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "email": {
                        "type":[ "string", "null" ]
                    },
                    "phone": {
                        "type":[ "string", "null" ]
                    }
                }
            }

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": [{
                        "_id": "",
                        "providerId": {
                            "uniqueId": "",
                            "sourceSystem": ""
                        },
                        "email": "",
                        "phone": "",
                        "createdDate": "",
                        "lastModifiedDate": ""
                    }]
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
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                            "_id": {
                                "type":[ "string", "null" ]
                            },
                            "providerId": {
                                "type": "object",
                                 "properties": {
                                    "uniqueId": {
                                        "type":[ "string", "null" ]
                                    },
                                    "sourceSystem": {
                                        "type":[ "string", "null" ]
                                    }
                                }
                            },
                            "email": {
                                "type":[ "string", "null" ]
                            },
                            "phone": {
                                "type":[ "string", "null" ]
                            },
                            "createdDate": {
                                "type":[ "string", "null" ]
                            },
                            "lastModifiedDate": {
                                "type":[ "string", "null" ]
                            }
                        }
                      }
                    }
                  }
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

### Provider-Contact-info [PUT {{{path}}}/provider/contact{?facilityCode}{&ien}]

Updates providers contact with given json

+ Parameters

    + facilityCode (string, optional) - facility code
    + ien (number, optional) - ien

+ Request JSON Message (application/json)

    + Body

            {
                "email":"",
                "phone":""

            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "email": {
                        "type":[ "string", "null" ]
                    },
                    "phone": {
                        "type":[ "string", "null" ]
                    }
                }
            }

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": [{
                        "_id": "",
                        "providerId": {
                            "uniqueId": "",
                            "sourceSystem": ""
                        },
                        "email": "",
                        "phone": "",
                        "createdDate": "",
                        "lastModifiedDate": ""
                    }]
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
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                            "_id": {
                                "type":[ "string", "null" ]
                            },
                            "providerId": {
                                "type": "object",
                                 "properties": {
                                    "uniqueId": {
                                        "type":[ "string", "null" ]
                                    },
                                    "sourceSystem": {
                                        "type":[ "string", "null" ]
                                    }
                                }
                            },
                            "email": {
                                "type":[ "string", "null" ]
                            },
                            "phone": {
                                "type":[ "string", "null" ]
                            },
                            "createdDate": {
                                "type":[ "string", "null" ]
                            },
                            "lastModifiedDate": {
                                "type":[ "string", "null" ]
                            }
                        }
                      }
                    }
                  }
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

### Provider-Contact-info [DELETE {{{path}}}/provider/contact{?facilityCode}{&ien}]

+ Parameters
    + facilityCode (string, optional) - facility code
    + ien (number, optional) - ien

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Facility-Timezone-info [GET {{{path}}}/facility/timezone{?facilityCode}]

+ Parameters

    + facilityCode (string, optional) - facility code

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": [{
                        "facilityCode": "1",
                        "timezone": "EST",
                        "timeZoneName": "America/New_York"
                    }]
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
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                            "facilityCode": {
                                "type":[ "string", "null" ]
                            },                        
                            "timezone": {
                                "type":[ "string", "null" ]
                            },                        
                            "timeZoneName": {
                                "type":[ "string", "null" ]
                            }                        
                        }
                      }
                    }
                  }
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

### Instructions-list [GET {{{path}}}/instructions]

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": [{
                        "title": "test",
                        "instruction": "test"
                    }]
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
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type":[ "string", "null" ]
                            },
                            "instruction": {
                                "type":[ "string", "null" ]
                            }
                        }
                      }
                    }
                  }
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

### Patient-Demographics [GET {{{path}}}/patient/demographics{?pid}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

+ Response 200 (application/json)

    + Body
  
            {
                "data": {
                    "items": [{
                    }]
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
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                        }
                      }
                    }
                  }
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

### Patient-Demographics [POST {{{path}}}/patient/demographics{?pid}]

+ Request JSON Message (application/json)

    + Body

            {
                "pid": "SITE;1"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "pid": {
                        "type": "string",
                        "pattern": "^([a-zA-Z0-9]+);([a-zA-Z0-9]+)$|^([0-9]+)V([0-9]+)$"
                    }
                }
            }



+ Response 200 (application/json)

    + Body
  
            {
                "data": {
                    "items": [{
                    }]
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
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                        }
                      }
                    }
                  }
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

### Patient-Demographics [PUT {{{path}}}/patient/demographics{?pid}]

+ Request JSON Message (application/json)

    + Body

            {
                "pid": "SITE;1",
                "_id": "589ba51b9932cedb116b3264"

            }
    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "pid": {
                        "type": "string",
                        "pattern": "^([a-zA-Z0-9]+);([a-zA-Z0-9]+)$|^([0-9]+)V([0-9]+)$"
                    },
                    "_id": {
                        "type": "string"
                    }
                }
            }



+ Response 200 (application/json)

    + Body
  
            {
                "data": {
                    "items": [{
                    }]
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
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                        }
                      }
                    }
                  }
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

### Patient-Emergency-Contact [GET {{{path}}}/patient/emergencycontact{?pid}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": [{
                    }]
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
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                        }
                      }
                    }
                  }
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

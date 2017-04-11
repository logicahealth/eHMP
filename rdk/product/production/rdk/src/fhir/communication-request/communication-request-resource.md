# Group FHIR

## Communicationrequest [{{{path}}}]

### Add Communication Request [POST]

Add a new communication request for one or more recipients. The message is queued for each recipient in the CommunicationRequest.

+ Request JSON Message (application/json)

    + Body

            {
                "resourceType": "CommunicationRequest",
                "identifier": [{
                    "value": "a435"
                }],
                "category": {
                    "coding": [{
                        "code": "ehmp/msg/category/clinical"
                    }]
                },
                "priority": {
                    "coding": [{
                        "code": "ehmp/msg/priority/high"
                    }]
                },
                "status": "received",
                "recipient": [{
                    "reference": "9E7A;10000000270"
                }, {
                    "reference": "9E7A;10000000272"
                }],
                "payload": [{
                    "contentReference": {
                        "reference": "patient/9E7A;10045/lab/123"
                    },
                    "contentString": "Text content to be communicated"
                }],
                "subject": {
                    "reference": "patient/9E7A;253"
                }
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "payload",
                    "recipient"
                ],
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "Unique resource id for this request."
                    },
                    "resourceType": {
                        "type": "string",
                        "description": "Should always be CommunicationRequest."
                    },
                    "identifier": {
                        "description": "Unique business id for this request.",
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "value": {
                                    "type": "string",
                                    "description": "The value that is unique"
                                },
                                "system": {
                                    "type": "string",
                                    "description": "The namespace for the identifier"
                                }
                            }
                        }
                    },
                    "category": {
                        "description": "The type of message to be sent such as alert, notification, reminder, instruction, etc.",
                        "type": "object",
                        "properties": {
                            "coding": {
                                "type": "array",
                                "description": "Code defined by a terminology system",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "code": {
                                            "type": "string",
                                            "enum": [
                                                "ehmp/msg/category/clinical",
                                                "ehmp/msg/category/administrative",
                                                "ehmp/msg/category/operational"
                                            ]
                                        }
                                    }
                                }
                            },
                            "text": {
                                "type": "string",
                                "description": "Plain text representation of the concept"
                            }
                        }
                    },
                    "sender": {
                        "description": "The entity (e.g., person, organization, clinical information system, or device) which is to be the source of the communication.",
                        "type": "object",
                        "properties": {
                            "reference": {
                                "type": "string",
                                "description": "Relative, internal or absolute URL reference"
                            },
                            "display": {
                                "type": "string",
                                "description": "Text alternative for the resource"
                            }
                        }
                    },
                    "recipient": {
                        "description": "The entity (e.g., person, organization, clinical information system, or device) which is the intended target of the communication.",
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "reference": {
                                    "type": "string",
                                    "description": "Relative, internal or absolute URL reference"
                                },
                                "display": {
                                    "type": "string",
                                    "description": "Text alternative for the resource"
                                }
                            }
                        }
                    },
                    "payload": {
                        "description": "Text (contentString) or resource (contentReference) to be communicated to the recipient.",
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "contentString": {
                                    "type": "string",
                                    "description": "Text content to be communicated"
                                },
                                "contentReference": {
                                    "type": "object",
                                    "properties": {
                                        "reference": {
                                            "type": "string",
                                            "description": "Relative, internal or absolute URL reference"
                                        },
                                        "display": {
                                            "type": "string",
                                            "description": "Text alternative for the resource"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "medium": {
                        "description": "The communication medium to be used, e.g., email, fax.",
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "coding": {
                                    "type": "array",
                                    "description": "Code defined by a terminology system",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "code": {
                                                "type": "string",
                                                "enum": [
                                                    "ehmp/msg/medium/ui/todo",
                                                    "ehmp/msg/medium/ui/inline",
                                                    "ehmp/msg/medium/ui/overlay",
                                                    "ehmp/msg/medium/ui/dialog",
                                                    "ehmp/msg/medium/email",
                                                    "ehmp/msg/medium/sms",
                                                    "ehmp/msg/medium/secure"
                                                ]
                                            }
                                        }
                                    }
                                },
                                "text": {
                                    "type": "string",
                                    "description": "Plain text representation of the concept"
                                }
                            }
                        }
                    },
                    "status": {
                        "type": "string",
                        "description": "The status of the proposal or order.",
                        "enum": [
                            "proposed",
                            "planned",
                            "requested",
                            "received",
                            "accepted",
                            "in-progress",
                            "completed",
                            "suspended",
                            "rejected",
                            "failed"
                        ]
                    },
                    "reason": {
                        "description": "The reason or justification for the communication request.",
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "coding": {
                                    "type": "array",
                                    "description": "Code defined by a terminology system",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "code": {
                                                "type": "string",
                                                "enum": [
                                                    "ehmp/msg/reason/information",
                                                    "ehmp/msg/reason/decision",
                                                    "ehmp/msg/reason/review",
                                                    "ehmp/msg/reason/update/[message_id]",
                                                    "ehmp/msg/reason/advice",
                                                    "ehmp/msg/reason/task",
                                                    "ehmp/msg/reason/exception"
                                                ]
                                            }
                                        }
                                    }
                                },
                                "text": {
                                    "type": "string",
                                    "description": "Plain text representation of the concept"
                                }
                            }
                        }
                    },
                    "subject": {
                        "description": "The patient who is the focus of this communication request.",
                        "type": "object",
                        "properties": {
                            "reference": {
                                "type": "string",
                                "description": "Relative, internal or absolute URL reference"
                            },
                            "display": {
                                "type": "string",
                                "description": "Text alternative for the resource"
                            }
                        }
                    },
                    "priority": {
                        "description": "Characterizes how quickly the proposed act must be initiated. Includes concepts such as stat, urgent, routine.",
                        "type": "object",
                        "properties": {
                            "coding": {
                                "type": "array",
                                "description": "Code defined by a terminology system",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "code": {
                                            "type": "string",
                                            "enum": [
                                                "ehmp/msg/priority/high",
                                                "ehmp/msg/priority/medium",
                                                "ehmp/msg/priority/low",
                                                "ehmp/msg/priority/warning",
                                                "ehmp/msg/priority/alert",
                                                "ehmp/msg/priority/alarm"
                                            ]
                                        }
                                    }
                                }
                            },
                            "text": {
                                "type": "string",
                                "description": "Plain text representation of the concept"
                            }
                        }
                    },
                    "requester": {
                        "description": "The responsible person who authorizes this order, e.g., physician.",
                        "type": "object",
                        "properties": {
                            "reference": {
                                "type": "string",
                                "description": "Relative, internal or absolute URL reference"
                            },
                            "display": {
                                "type": "string",
                                "description": "Text alternative for the resource"
                            }
                        }
                    },
                    "encounter": {
                        "description": "The encounter within which the communication request was created.",
                        "type": "object",
                        "properties": {
                            "reference": {
                                "type": "string",
                                "description": "Relative, internal or absolute URL reference"
                            },
                            "display": {
                                "type": "string",
                                "description": "Text alternative for the resource"
                            }
                        }
                    },
                    "scheduledDateTime": {
                        "description": "The time when this communication is to occur.",
                        "type": "string",
                        "pattern": "-?[0-9]{4}(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?"
                    },
                    "requestedOn": {
                        "description": "The time when the request was made.",
                        "type": "string",
                        "pattern": "-?[0-9]{4}(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?"
                    }
                }
            }

:[Response 400]({{{common}}}/responses/400.md)

+ Response 202 (application/json)

+ Response 422 (application/json)

    + Body

            {
                "message": "Unprocessible Entity.",
                "status": 422
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)


### Get All Communication Requests [GET {{{path}}}/{recipientId}{?identifier}{&category}{&priority}{&status}{&fields}{&count}{&subject}]

Get all communication requests for a single recipient. Optional filters supported.

+ Parameters

    + recipientId (string, required) - recipient id

    + identifier (string, optional) - Business identifier id used to find a communication request. If provided then all other parameters are ignored.

    + category (string, optional) - Filter returned communication request by the provided category. Can be combined with priority and status.

    + priority (string, optional) - Filter returned communication request by the provided priority. Can be combined with category and status.

    + status (string, optional) - Filter returned communication request by the provided status. Can be combined with category and priority.

    + count (string, optional) - Filter returned number of communication requests; count=true must be provided. Can be combined with all filters.

    + subject (string, optional) - Filter returned communication requests by subject. Can be combined with all filters.

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)


### Get Communication Request [GET {{{path}}}/{recipientId}/{id}{?fields}]

Get a single communication request for a specific recipient.

+ Parameters

    + recipientId (string, required) - recipient id

    + id (string, required) - resource id for a communication request

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)
+ Response 404 (application/json)

    + Body

            {
                "message": "Communication request not found",
                "status": 404
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)


### Delete All Communication Requests [DELETE {{{path}}}/{recipientId}]

Delete all communication request for a single recipient.

+ Parameters

    + recipientId (string, required) - recipient id


+ Response 204 (application/json)


### Delete Communication Request [DELETE {{{path}}}/{recipientId}/{id}]

Delete a single communication request for a specific recipient.

+ Parameters

    + recipientId (string, required) - recipient id

    + id (string, required) - resource id for a communication request


+ Response 204 (application/json)

### Update Communication Request [PUT {{{path}}}/{recipientId}/{id}]

Update a communication request by merging between the existing request and the payload (the new payload takes priority)

+ Parameters

    + recipientId (string, required) - recipient id

    + id (string, required) - resource id for a communication request

+ Request JSON Message (application/json)

    + Body

            {
                "resourceType": "CommunicationRequest",
                "identifier": {
                    "value": "a435"
                },
                "category": {
                    "coding": [{
                        "code": "ehmp/msg/category/clinical"
                    }]
                },
                "priority": {
                    "coding": [{
                        "code": "ehmp/msg/priority/high"
                    }]
                },
                "status": "open",
                "payload": [{
                    "contentReference": {
                        "reference": "patient/9E7A;10045/lab/123"
                    }
                }]
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "Unique resource id for this request."
                    },
                    "resourceType": {
                        "type": "string",
                        "description": "Should always be CommunicationRequest."
                    },
                    "identifier": {
                        "description": "Unique business id for this request.",
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "value": {
                                    "type": "string",
                                    "description": "The value that is unique"
                                },
                                "system": {
                                    "type": "string",
                                    "description": "The namespace for the identifier"
                                }
                            }
                        }
                    },
                    "category": {
                        "description": "The type of message to be sent such as alert, notification, reminder, instruction, etc.",
                        "type": "object",
                        "properties": {
                            "coding": {
                                "type": "array",
                                "description": "Code defined by a terminology system",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "code": {
                                            "type": "string",
                                            "enum": [
                                                "ehmp/msg/category/clinical",
                                                "ehmp/msg/category/administrative",
                                                "ehmp/msg/category/operational"
                                            ]
                                        }
                                    }
                                }
                            },
                            "text": {
                                "type": "string",
                                "description": "Plain text representation of the concept"
                            }
                        }
                    },
                    "sender": {
                        "description": "The entity (e.g., person, organization, clinical information system, or device) which is to be the source of the communication.",
                        "type": "object",
                        "properties": {
                            "reference": {
                                "type": "string",
                                "description": "Relative, internal or absolute URL reference"
                            },
                            "display": {
                                "type": "string",
                                "description": "Text alternative for the resource"
                            }
                        }
                    },
                    "recipient": {
                        "description": "The entity (e.g., person, organization, clinical information system, or device) which is the intended target of the communication.",
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "reference": {
                                    "type": "string",
                                    "description": "Relative, internal or absolute URL reference"
                                },
                                "display": {
                                    "type": "string",
                                    "description": "Text alternative for the resource"
                                }
                            }
                        }
                    },
                    "payload": {
                        "description": "Text (contentString) or resource (contentReference) to be communicated to the recipient.",
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "contentString": {
                                    "type": "string",
                                    "description": ""
                                },
                                "contentReference": {
                                    "type": "object",
                                    "properties": {
                                        "reference": {
                                            "type": "string",
                                            "description": "Relative, internal or absolute URL reference"
                                        },
                                        "display": {
                                            "type": "string",
                                            "description": "Text alternative for the resource"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "medium": {
                        "description": "The communication medium to be used, e.g., email, fax.",
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "coding": {
                                    "type": "array",
                                    "description": "Code defined by a terminology system",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "code": {
                                                "type": "string",
                                                "enum": [
                                                    "ehmp/msg/medium/ui/todo",
                                                    "ehmp/msg/medium/ui/inline",
                                                    "ehmp/msg/medium/ui/overlay",
                                                    "ehmp/msg/medium/ui/dialog",
                                                    "ehmp/msg/medium/email",
                                                    "ehmp/msg/medium/sms",
                                                    "ehmp/msg/medium/secure"
                                                ]
                                            }
                                        }
                                    }
                                },
                                "text": {
                                    "type": "string",
                                    "description": "Plain text representation of the concept"
                                }
                            }
                        }
                    },
                    "status": {
                        "type": "string",
                        "description": "The status of the proposal or order.",
                        "enum": [
                            "proposed",
                            "planned",
                            "requested",
                            "received",
                            "accepted",
                            "in-progress",
                            "completed",
                            "suspended",
                            "rejected",
                            "failed"
                        ]
                    },
                    "reason": {
                        "description": "The reason or justification for the communication request.",
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "coding": {
                                    "type": "array",
                                    "description": "Code defined by a terminology system",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "code": {
                                                "type": "string",
                                                "enum": [
                                                    "ehmp/msg/reason/information",
                                                    "ehmp/msg/reason/decision",
                                                    "ehmp/msg/reason/review",
                                                    "ehmp/msg/reason/update/[message_id]",
                                                    "ehmp/msg/reason/advice",
                                                    "ehmp/msg/reason/task",
                                                    "ehmp/msg/reason/exception"
                                                ]
                                            }
                                        }
                                    }
                                },
                                "text": {
                                    "type": "string",
                                    "description": "Plain text representation of the concept"
                                }
                            }
                        }
                    },
                    "subject": {
                        "description": "The patient who is the focus of this communication request.",
                        "type": "object",
                        "properties": {
                            "reference": {
                                "type": "string",
                                "description": "Relative, internal or absolute URL reference"
                            },
                            "display": {
                                "type": "string",
                                "description": "Text alternative for the resource"
                            }
                        }
                    },
                    "priority": {
                        "description": "Characterizes how quickly the proposed act must be initiated. Includes concepts such as stat, urgent, routine.",
                        "type": "object",
                        "properties": {
                            "coding": {
                                "type": "array",
                                "description": "Code defined by a terminology system",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "code": {
                                            "type": "string",
                                            "enum": [
                                                "ehmp/msg/priority/high",
                                                "ehmp/msg/priority/medium",
                                                "ehmp/msg/priority/low",
                                                "ehmp/msg/priority/warning",
                                                "ehmp/msg/priority/alert",
                                                "ehmp/msg/priority/alarm"
                                            ]
                                        }
                                    }
                                }
                            },
                            "text": {
                                "type": "string",
                                "description": "Plain text representation of the concept"
                            }
                        }
                    },
                    "requester": {
                        "description": "The responsible person who authorizes this order, e.g., physician.",
                        "type": "object",
                        "properties": {
                            "reference": {
                                "type": "string",
                                "description": "Relative, internal or absolute URL reference"
                            },
                            "display": {
                                "type": "string",
                                "description": "Text alternative for the resource"
                            }
                        }
                    },
                    "encounter": {
                        "description": "The encounter within which the communication request was created.",
                        "type": "object",
                        "properties": {
                            "reference": {
                                "type": "string",
                                "description": "Relative, internal or absolute URL reference"
                            },
                            "display": {
                                "type": "string",
                                "description": "Text alternative for the resource"
                            }
                        }
                    },
                    "scheduledDateTime": {
                        "description": "The time when this communication is to occur.",
                        "type": "string",
                        "pattern": "-?[0-9]{4}(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?"
                    },
                    "requestedOn": {
                        "description": "The time when the request was made.",
                        "type": "string",
                        "pattern": "-?[0-9]{4}(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?"
                    }
                }
            }

+ Response 200 (application/json)

+ Response 422 (application/json)

    + Body

            {
                "message": "Unprocessible Entity.",
                "status": 422
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)

+ Response 404 (application/json)

    + Body

            {
                "message": "Communication request not found",
                "status": 404
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)


### Set status for Communication Request [PUT {{{path}}}/setstatus/{status}/{recipientId}/{id}]

Set status for a Communication Request

+ Parameters

    + recipientId (string, required) - recipient id

    + id (string, required) - resource id for a communication request

    + status (string, required) - new status to be set. Valid values: ['read','completed'] or any FHIR status values

:[Response 400]({{{common}}}/responses/400.md)

+ Response 200 (application/json)

+ Response 422 (application/json)

    + Body

            {
                "message": "Unprocessible Entity.",
                "status": 422
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)

+ Response 404 (application/json)

    + Body

            {
                "message": "Communication request not found",
                "status": 404
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)

### Add a long polling watch for incoming Communication Requests [GET {{{path}}}/watch/add/{recipientId}]

Opens a long polling request which is served when a recipient's queue receives a new Communication Request

+ Parameters

    + recipientId (string, required) - recipient id

+ Response 200 (application/json)

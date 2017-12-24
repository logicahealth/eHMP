# Group FHIR

## Communication [{{{path}}}]

### Communications [GET {{{path}}}{?requester.userId}{&requester.ehmpAppVersion}{&*category}{&status.system}{&status.code}{&overridePreferences}]

Retrieves system wide message specified site administrators and maintainers

+ Parameters 

    + requester.userId (string, required) 
   
    + requester.ehmpAppVersion: `2.0.123` (string, required) The version application used to make the request.
    
    + category: `http://ehmp.DNS   /messageCategories/announcements-promotions` (string, required) Uri, A Uniform Resource Identifier Reference
        
    + status: `http://hl7.org/fhir/ValueSet/communication-status/complete` (string, optional) Uri, A Uniform Resource Identifier Reference
        + Default: `http://hl7.org/fhir/ValueSet/communication-status/complete`
        
    + overridePreferences (boolean, optional) - If set to true, return messages even if user preferences dictate not return message
        + Default: `false`
       
+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

+ Response 503 (application/json)

    + Body

            {
                "message": " Service Unavailable.",
                "status": 503
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)

### Communication Message Attachment [GET {{{path}}}/{identifier}/attachment/{attachment}]

Retrieves attachments delivered with communication messages

+ Parameters

    + identifier (string, required)
    + attachment (string, required) 

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

+ Response 503 (application/json)

    + Body

            {
                "message": " Service Unavailable.",
                "status": 503
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)

### User Message Preferences [POST  {{{path}}}/preferences]

Updates user the preferences on what kind of messages they wish to receive

+ Request JSON Message (application/json)

    + Body
    
            {
                "category": {
                    "code": "Alert",
                    "system": "http://ehmp.DNS   /messagetypes"
                },
                "enabled": false,
                "userId": "urn:va:user:SITE:10000000270"
            }
    
    + Schema
    
            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "category": {
                        "type": "object",
                        "required": [
                            "code",
                            "system"
                        ],
                        "properties": {
                            "code": {
                                "type": "string"
                            },
                            "system": {
                                "type": "string"
                            }
                        }
                    },
                    "enabled": {
                        "type": "boolean"
                    },
                    "userId": {
                        "type": "string"
                    }
                },
                "required": [
                    "category",
                    "enabled",
                    "userId"
                ]
            }
            
+ Response 200 (application/json)

    + Body

            {
                "status": 200
            }

    + Schema
    
            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "status": {
                        "type": "number"
                    }
                }
            }
       
:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


+ Response 503 (application/json)

    + Body

            {
                "message": " Service Unavailable.",
                "status": 503
            }

    + Schema

            :[Schema]({{{common}}}/schemas/message.jsonschema)

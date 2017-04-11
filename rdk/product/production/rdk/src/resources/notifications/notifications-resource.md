# Group Notifications

## Notifications list [{{{path}}}]

### Notifications for patient [GET {{{path}}}/{patient}/{patientId}/{list}{?userId}{&resolutionState}{&recipientFilter}]

Get the list of notifications for the given patient id

+ Parameters

    + patientId (string, required) - patient id

    + userId (string, optional) - user id

    + resolutionState (string, optional) - resolution state

    + recipientFilter (string, optional) - recipient filter

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Notifications for staff [GET {{{path}}}/{staff}/{userId}/{list}{?resolutionState}{&recipientFilter}]

Get the list of notifications for the given user id

+ Parameters

    + userId (string, required) - user id

    + resolutionState (string, optional) - resolution state

    + recipientFilter (string, optional) - recipient filter

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Notifications for staff growler list [GET {{{path}}}/{staff}/{userId}/{growler}]

Get the list of notifications for the growler

+ Parameters

    + userId (string, required) - user id

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Notifications for staff indicator [GET {{{path}}}/{staff}/{userId}/{indicator}/{list}]

Gets the list for global notification list based on the given user id

+ Parameters

    + userId (string, required) - user id

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Notifications for staff indicator [GET {{{path}}}/{staff}/{userId}/{indicator}/{summary}]

Gets the count for global notification list based on the given user id

+ Parameters

    + userId (string, required) - user id

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Notification post [POST {{{path}}}]

+ Request JSON Message (application/json)

    + Body

			{
			    "recipients": [{
			        "recipient": {
			            "userId": "10000000270"
			        },
			        "salience": 1
			    }, {
			        "recipient": {
			            "userId": "10000000272"
			        },
			        "salience": 2
			    }],
			    "producer": {
			        "description": "workflow: lab order management"
			    },
			    "referenceId": "task123",
			    "patientId": "9E7A;253",
			    "message": {
			        "subject": "Order lab",
			        "body": "Finish ordering your lab"
			    },
			    "resolution": "producer",
			    "navigation": {
			        "channel": "labOE",
			        "event": "entry:show",
			        "parameter": "123"
			    },
			    "associatedItems": [],
			    "expiration": null
			}

    + Schema

    		:[Schema]({{{common}}}/schemas/notifications-POST-200.jsonschema)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Update By Notification Id [POST {{{path}}}/{id}/{notificationId}/{resolved}]

Resolve a notification by notification Id

+ Parameters

    + notificationId (string, required) - notification Id

+ Request JSON Message (application/json)

	+ Body

			{
			    "userId": "10000000270"
			}

	+ Schema

			    {
				    "$schema": "http://json-schema.org/draft-04/schema#",
				    "type": "object",
				    "properties": {
				        "userId": {
				            "type": "string"
				        }
				    }
				}

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Update Notifications by Reference Id [POST {{{path}}}/{reference-id}/{referenceId}/{resolved}]

Resolve a notification by reference Id

+ Parameters

    + referenceId (string, required) - reference Id

+ Request JSON Message (application/json)

    + Body

			{
		    	"userId": "10000000270"
			}
    + Schema

    		{
			    "$schema": "http://json-schema.org/draft-04/schema#",
			    "type": "object",
			    "properties": {
			        "userId": {
			            "type": "string"
			        }
			    }
			}


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Notifications by reference id [GET {{{path}}}/{reference-id}/{referenceId}/{list}]

Get the list of notifications for the given reference id

+ Parameters

    + referenceId (string, required) - reference id

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

# Group Orderables

## QuickOrder [{{{path}}}]

### POST [POST {{{path}}}]

Create Quick Order

+ Request JSON Message (application/json)

	+ Body

            {
                "name": "Hypertensive Patient",
                "scope": "site",
                "orderable": "uid:va:orderable:aaaaa",
                "formData": {
                    "button1": "Hello",
                    "listBox": ["med 1", "med 2"]
                },
                "active": true
            }

	+ Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "name": {
                        "description": "Name of the Quick Order",
                        "type": "string"
                    },
                    "scope": {
                        "description": "Visibility scope of the quick order",
                        "enum": ["individual", "site", "enterprise"]
                    },
                    "type": {
                        "description": "The type of this object, orderset, quickorder, favorite; always 'quickorder'",
                        "enum": ["favorite", "quickorder", "orderable"]
                    },
                    "active": {
                        "description": "Whether the QuickOrder is active. Inactive QuickOrder will not show up in Orderable service queries.",
                        "type": "boolean"
                    },
                    "site": {
                        "description": "Site this QuickOrder belongs to. This is null for 'enterprise' scope.",
                        "type": "string"
                    },
                    "createdBy": {
                        "description": "User id of creator of the QuickOrder",
                        "type": "string"
                    },
                    "active": {
                        "description": "Whether the QuickOrder is active. Inactive QuickOrder will not show up in Orderable service queries.",
                        "type": "boolean"
                    },
                    "timestamp": {
                        "description": "a time stamp of when last updated",
                        "type": "integer"
                    },
                    "orderable": {
                        "description": "The uuid of the Orderable",
                        "type": "string"
                    },
                    "formData": {
                        "description": "Name value pairs for form objects",
                        "type": "object"
                    }
                },
                "required": [
                    "name",
                    "orderable",
                    "formData"
                ]
            }

+ Response 201 (application/json)

	+ Body

            {
                "uid": "54333f74970fas45d15aaa6f",
                "name": "Hypertensive Patient",
                "scope": "site",
                "orderable": "uid:va:orderable:aaaaa",
                "formData": {
                    "button1": "Hello",
                    "listBox": ["med 1", "med 2"]
                },
                "siteId": "9E7A",
                "createdBy": "urn:va:user:9E7A:10000000238",
                "active": true
            }

	+ Schema

			:[Schema]({{{common}}}/schemas/quick-order-POST-201.jsonschema)

+ Response 400 (application/json)

        {
            "message": "Invalid QuickOrder object. QuickOrder must at least the following properties: name, orderable, formData",
            "status": 400
        }

:[Response 500]({{{common}}}/responses/500.md)


### Update [PUT {{{path}}}/{uid}]

Update Quick Order

+ Parameters

	+ uid: `urn:va:quickorder:1` - Id of the Quick Order

+ Request JSON Message (application/json)

	+ Body

            {
                "name": "Hypertensive Patient",
                "scope": "site",
                "orderable": "uid:va:orderable:aaaaa",
                "uid": "urn:va:quickorder:1",
                "formData": {
                    "button1": "Hello",
                    "listBox": ["med 1", "med 2"]
                },
                "active": true
            }

	+ Schema

			:[Schema]({{{common}}}/schemas/quick-order-POST-201.jsonschema)

+ Response 201

    + Body

            {
                "data": {
                    "name": "Hypertensive Patient",
                    "scope": "site",
                    "orderable": "uid:va:orderable:aaaaa",
                    "uid": "urn:va:quickorder:1",
                    "formData": {
                        "button1": "Hello",
                        "listBox": [
                            "med 1",
                            "med 2"
                        ]
                    },
                    "active": true,
                    "type": "quickorder",
                    "timestamp": "2016-02-18T20:04:53.135Z",
                    "siteId": "9E7A",
                    "createdBy": "urn:va:user:9E7A:10000000270"
                },
                "status": 201
            }

    + Schema

            :[schema]({{{common}}}/schemas/quickorder_%3Auid-PUT-201.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Delete [DELETE {{{path}}}/{uid}]

Delete Quick Order

+ Parameters

	+ uid: `urn:va:quickorder:1` - Id of the Quick Order

+ Response 204 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Search [GET {{{path}}}{?name}]

Search Quick Order by name

+ Parameters

	+ name: `Hypertensive Patient` (string, optional) - Name of the Quick Order to search for

+ Response 200 (application/json)

	+ Body

            {
                "data": {
                    "items": [
                        {
                            "uid": "54333f74970fas45d15aaa6f",
                            "name": "Hypertensive Patient",
                            "scope": "individual",
                            "siteId": "9E7A",
                            "createdBy": "urn:va:user:9E7A:10000000238",
                            "active": true
                        }
                    ]
                }
            }

	+ Schema

			:[Schema]({{{common}}}/schemas/quick-order-search-GET-200.jsonschema)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Get [GET {{{path}}}/{uid}]

Get Quick Order

+ Parameters

	+ uid: `urn:va:quickorder:1` - Id of the Quick Order

+ Response 200 (application/json)

	+ Body

            {
                "data": {
                    "uid": "54333f74970fas45d15aaa6f",
                    "name": "Hypertensive Patient",
                    "scope": "individual",
                    "orderable": "uid:va:orderable:aaaaa",
                    "formData": {
                        "button1": "Hello",
                        "listBox": ["med 1", "med 2"]
                    },
                    "siteId": "9E7A",
                    "createdBy": "urn:va:user:9E7A:10000000238",
                    "active": true
                }
            }

	+ Schema

			:[Schema]({{{common}}}/schemas/quick-order-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

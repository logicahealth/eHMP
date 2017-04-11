# Group Orderables

## OrderSet [{{{path}}}]

### POST [POST {{{path}}}]

Create Order Set

+ Request JSON Message (application/json)

	+ Body

            {
                "name": "Hypertensive Patient",
                "scope": "individual",
                "orderList": [
                    {
                        "uid": "507f191e810c19729de860ea",
                        "type": "quickorder",
                        "siteId": "9E7A",
                        "createdBy": "urn:va:user:9E7A:10000000270",
                        "name": "HCTZ 50mg PO QD",
                        "scope": "individual",
                        "active": true
                    },
                    {
                        "uid": "512",
                        "type": "orderable",
                        "domain": "lab",
                        "siteId": "9E7A",
                        "createdBy": "urn:va:user:9E7A:10000000270",
                        "name": "Lisinopril 5mg PO QD",
                        "scope": "individual",
                        "active": true
                    }
                ],
                "active": true
            }

	+ Schema

			:[Schema]({{{common}}}/schemas/order-set-POST-payload.jsonschema)

+ Response 201 (application/json)

	+ Body

            {
                "uid": "54333f74970fas45d15aaa6f",
                "name": "Hypertensive Patient",
                "scope": "individual",
                "orderList": [
                    {
                        "uid": "507f191e810c19729de860ea",
                        "type": "quickorder",
                        "siteId": "9E7A",
                        "createdBy": "urn:va:user:9E7A:10000000270",
                        "name": "HCTZ 50mg PO QD",
                        "scope": "individual",
                        "active": true
                    },
                    {
                        "uid": "512",
                        "type": "orderable",
                        "domain": "lab",
                        "siteId": "9E7A",
                        "createdBy": "urn:va:user:9E7A:10000000270",
                        "name": "Lisinopril 5mg PO QD",
                        "scope": "individual",
                        "active": true
                    }
                ],
                "siteId": "9E7A",
                "createdBy": "urn:va:user:9E7A:10000000270",
                "active": true
            }

	+ Schema

			:[Schema]({{{common}}}/schemas/order-set-POST-201.jsonschema)

+ Response 400 (application/json)

        {
            "message": "Invalid OrderSet object. OrderSet must at least the following properties: name, orderList",
            "status": 400
        }

:[Response 500]({{{common}}}/responses/500.md)


### Update [PUT {{{path}}}/{uid}]

Update Order Set

+ Parameters

	+ uid: `urn:va:ordersets:1` (string, required) - Id of the Order Set

+ Request JSON Message (application/json)

	+ Body

            {
                "name": "Hypertensive Patient",
                "scope": "individual",
                "uid": "urn:va:ordersets:1",
                "orderList": [
                    {
                        "uid": "507f191e810c19729de860ea",
                        "type": "quickorder",
                        "siteId": "9E7A",
                        "createdBy": "urn:va:user:9E7A:10000000270",
                        "name": "HCTZ 50mg PO QD",
                        "scope": "individual",
                        "active": true
                    },
                    {
                        "uid": "512",
                        "type": "orderable",
                        "domain": "lab",
                        "siteId": "9E7A",
                        "createdBy": "urn:va:user:9E7A:10000000270",
                        "name": "Lisinopril 5mg PO QD",
                        "scope": "individual",
                        "active": true
                    }
                ],
                "active": true
            }

	+ Schema

			:[Schema]({{{common}}}/schemas/order-set-POST-payload.jsonschema)

+ Response 201 (application/json)

	+ Body

            {
                "data": {
                    "name": "Hypertensive Patient",
                    "scope": "individual",
                    "uid": "urn:va:ordersets:1",
                    "orderList": [
                        {
                            "uid": "507f191e810c19729de860ea",
                            "type": "quickorder",
                            "siteId": "9E7A",
                            "createdBy": "urn:va:user:9E7A:10000000270",
                            "name": "HCTZ 50mg PO QD",
                            "scope": "individual",
                            "active": true
                        },
                        {
                            "uid": "512",
                            "type": "orderable",
                            "domain": "lab",
                            "siteId": "9E7A",
                            "createdBy": "urn:va:user:9E7A:10000000270",
                            "name": "Lisinopril 5mg PO QD",
                            "scope": "individual",
                            "active": true
                        }
                    ],
                    "active": true,
                    "siteId": "9E7A",
                    "createdBy": "urn:va:user:9E7A:10000000270"
                },
                "status": 201
            }

	+ Schema

			:[Schema]({{{common}}}/schemas/order-set-POST-201.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)


### Delete [DELETE {{{path}}}/{uid}]

Delete Order Set

+ Parameters

	+ uid: `urn:va:ordersets:1` (string, required) - Id of the Order Set

+ Response 204

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)


### Search [GET {{{path}}}{?name}]

Search Order Set by name

+ Parameters

	+ name (string, optional) - Name of the Order Set to search for

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
                            "createdBy": "urn:va:user:9E7A:10000000270",
                            "active": true
                        }
                    ]
                }
            }

	+ Schema

			:[Schema]({{{common}}}/schemas/order-set-search-200.jsonschema)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Get [GET {{{path}}}/{uid}]

Get Order Set

+ Parameters

	+ uid: `urn:va:ordersets:1` (string, required) - Id of the Order Set

+ Response 200 (application/json)

	+ Body

            {
                "data": {
                    "uid": "urn:va:ordersets:1",
                    "name": "Hypertensive Patient",
                    "scope": "individual",
                    "orderList": [
                        {
                            "uid": "507f191e810c19729de860ea",
                            "type": "quickorder",
                            "siteId": "9E7A",
                            "createdBy": "urn:va:user:9E7A:10000000270",
                            "name": "HCTZ 50mg PO QD",
                            "scope": "individual",
                            "active": true
                        },
                        {
                            "uid": "512",
                            "type": "orderable",
                            "domain": "lab",
                            "siteId": "9E7A",
                            "createdBy": "urn:va:user:9E7A:10000000270",
                            "name": "Lisinopril 5mg PO QD",
                            "scope": "individual",
                            "active": true
                        }
                    ],
                    "siteId": "9E7A",
                    "createdBy": "urn:va:user:9E7A:10000000270",
                    "active": true
                }
            }

	+ Schema

			:[Schema]({{{common}}}/schemas/order-set-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

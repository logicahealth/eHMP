# Group Orderables

## EnterpriseOrderable [{{{path}}}]

### Post [POST {{{path}}}]

Create EnterpriseOrderable

+ Request JSON Message (application/json)

	+ Body

            {
                "name": "Physical Therapy Consult",
                "state": "active",
                "facility-enterprise": "",
                "type": "ehmp-enterprise-orderable",
                "domain": "ehmp-activity",
                "subDomain": "consult",
                "data": {
                    "activity": {
                        "deploymentId": "VistaCore:Order",
                        "processDefinitionId": "Order:Consult"
                    },
                    "prerequisites": {
                        "cdsIntent": "name on a cds intent to be executed",
                        "questions": [
                            {"question": "What?"},
                            {"question": "When?"}
                            ]
                    },
                    "data": {
                    }
                }
            }

	+ Schema

            :[Schema]({{{common}}}/schemas/enterprise-orderable-POST-payload.jsonschema)

+ Response 201 (application/json)

	+ Body

            {
               "data":{
                  "name":"Physical Therapy Consult Tested",
                  "state":"active",
                  "facility-enterprise":"",
                  "type":"ehmp-enterprise-orderable",
                  "domain":"ehmp-activity",
                  "subDomain":"consult",
                  "data":{
                     "activity":{
                        "deploymentId":"VistaCore:Order",
                        "processDefinitionId":"Order:Consult"
                     },
                     "prerequisites":{
                        "cdsIntent":"name on a cds intent to be executed",
                        "questions":[
                            {"question": "What?"},
                            {"question": "When?"}
                        ]
                     },
                     "data":{

                     }
                  },
                  "active":true,
                  "timestamp":"2016-03-03T07:19:20.004Z",
                  "createdBy":"urn:va:user:SITE:10000000270",
                  "uid":"urn:va:entordrbls:10"
               },
               "status":201
            }

	+ Schema

            :[Schema]({{{common}}}/schemas/enterprise-orderable-POST-201.jsonschema)

+ Response 400 (application/json)

            {
                "message": "Could not create EnterpriseOrderable.",
                "status": 400
            }

:[Response 500]({{{common}}}/responses/500.md)


### Update [PUT {{{path}}}/{uid}]

Update EnterpriseOrderable - NOTE: the uid on the path must match the uid in the message body.

+ Parameters

	+ uid: `urn:va:entordrbls:1` - Id of the EnterpriseOrderable

+ Request JSON Message (application/json)

	+ Body

            {
               "name":"Update Physical Therapy Consult Test",
               "uid":"urn:va:entordrbls:1",
               "state":"active",
               "facility-enterprise":"",
               "type":"ehmp-enterprise-orderable",
               "domain":"ehmp-activity",
               "subDomain":"consult",
               "data":{
                  "activity":{
                     "deploymentId":"VistaCore:Order",
                     "processDefinitionId":"Order:Consult"
                  },
                  "prerequisites":{
                     "cdsIntent":"name on a cds intent to be executed",
                     "questions":[
                            {"question": "What?"},
                            {"question": "When?"}
                     ]
                  },
                  "codes":[
                     {
                        "code":"2601-3",
                        "system":"urn:oid:2.16.840.1.113883.6.1",
                        "display":"Magnesium [Moles/volume] in Serum or Plasma"
                     }
                  ],
                  "data":{

                  }
               },
               "timestamp":"2016-02-29T18:50:42.318Z",
               "createdBy":"urn:va:user:SITE:10000000270"
            }

	+ Schema

            :[Schema]({{{common}}}/schemas/enterprise-orderable-PUT-payload.jsonschema)

+ Response 200

    + Body

            {
               "data":{
                  "name":"Update Physical Therapy Consult Test",
                  "uid":"urn:va:entordrbls:1",
                  "state":"active",
                  "facility-enterprise":"",
                  "type":"ehmp-enterprise-orderable",
                  "domain":"ehmp-activity",
                  "subDomain":"consult",
                  "data":{
                     "activity":{
                        "deploymentId":"VistaCore:Order",
                        "processDefinitionId":"Order:Consult"
                     },
                     "prerequisites":{
                        "cdsIntent":"name on a cds intent to be executed",
                        "questions":[
                            {"question": "What?"},
                            {"question": "When?"}
                        ]
                     },
                     "codes":[
                        {
                           "code":"2601-3",
                           "system":"urn:oid:2.16.840.1.113883.6.1",
                           "display":"Magnesium [Moles/volume] in Serum or Plasma"
                        }
                     ],
                     "data":{

                     }
                  },
                  "timestamp":"2016-03-02T22:19:34.496Z",
                  "createdBy":"urn:va:user:SITE:10000000270"
               },
               "status":200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/enterprise-orderable-PUT-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Delete [DELETE {{{path}}}/{uid}]

Delete EnterpriseOrderable

+ Parameters

	+ uid: `urn:va:entordrbls:1` - Id of the EnterpriseOrderable

+ Response 204 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Search [GET {{{path}}}{?name}{&domain}{&subdomain}]

Search EnterpriseOrderable by name

+ Parameters

	+ name: `Hypertensive Patient` (string, optional) - Name of the EnterpriseOrderable to search
	+ domain: `ehmp-activity` (string, optional) - Name of the domain of the EnterpriseOrderable
	+ subdomain: `consult` (string, optional) - Name of the subdomain of the EnterpriseOrderable

+ Response 200 (application/json)

	+ Body

            {
                "data": {
                    "items": [{
                        "uid": "urn:va:enterpriseorderable:2",
                        "name": "Name of this enterprise orderable 2",
                        "state": "active",
                        "facility-enterprise": "",
                        "type": "ehmp-enterprise-orderable",
                        "domain": "ehmp-activity",
                        "subDomain": "consult",
                        "data": {
                            "activity": {
                                "deploymentId": "VistaCore:Order",
                                "processDefinitionId": "Order:Consult"
                            },
                            "data": {}
                        }
                    }, {
                        "uid": "urn:va:enterpriseorderable:4",
                        "name": "Name of this enterprise orderable 4",
                        "state": "active",
                        "facility-enterprise": "",
                        "type": "ehmp-enterprise-orderable",
                        "domain": "ehmp-activity",
                        "subDomain": "consult",
                        "data": {
                            "activity": {
                                "deploymentId": "VistaCore:Order",
                                "processDefinitionId": "Order:Consult"
                            },
                            "prerequisites": {},
                            "data": {}
                        }
                    }]
                },
                "status": 200
            }

	+ Schema

            :[Schema]({{{common}}}/schemas/enterprise-orderable-search-GET-200.jsonschema)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Get [GET {{{path}}}/{uid}]

Get EnterpriseOrderable

+ Parameters

	+ uid: `urn:va:entordrbls:1` - Id of the EnterpriseOrderable

+ Response 200 (application/json)

	+ Body

            {
               "data":{
                  "active":true,
                  "createdBy":"urn:va:user:SITE:10000000270",
                  "data":{
                     "activity":{
                        "deploymentId":"VistaCore:Order",
                        "processDefinitionId":"Order:Consult"
                     },
                     "prerequisites":{
                        "cdsIntent":"name on a cds intent to be executed",
                        "questions":[
                            {"question": "What?"},
                            {"question": "When?"}
                        ]
                     }
                  },
                  "domain":"ehmp-activity",
                  "facility-enterprise":"",
                  "name":"Physical Therapy Consult",
                  "state":"active",
                  "subDomain":"consult",
                  "timestamp":"2016-03-02T16:57:53.260Z",
                  "type":"ehmp-enterprise-orderable",
                  "uid":"urn:va:entordrbls:1"
               },
               "status":200
            }

	+ Schema

            :[Schema]({{{common}}}/schemas/enterprise-orderable-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

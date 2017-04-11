# Group Orderables

## Orderables [{{{path}}}]

### Orderables Search [GET {{{path}}}{?searchString}]

Search Orderables

+ Parameters

	+ searchString (string, optional)

		Search string


+ Response 200 (application/json)

	+ Body

			{
			  "data": [
			    {
			      "uid": "1255",
			      "type": "vista-orderable",
			      "domain": "ehmp-order",
			      "subDomain": "labratory",
			      "facility-enterprise": "9E7A",
			      "state": "active",
			      "name": "BB CBC-TEST"
			    },
			    {
			      "uid": "210",
			      "type": "vista-orderable",
			      "domain": "ehmp-order",
			      "subDomain": "labratory",
			      "facility-enterprise": "9E7A",
			      "state": "active",
			      "name": "CBC"
			    },
			    {
			      "active": true,
			      "createdBy": "urn:va:user:9E7A:10000000270",
			      "data": {
			        "activity": {
			          "deploymentId": "VistaCore:Order",
			          "processDefinitionId": "Order:Consult"
			        },
			        "codes": [
			          {
			            "code": "2601-3",
			            "display": "Magnesium [Moles/volume] in Serum or Plasma",
			            "system": "urn:oid:2.16.840.1.113883.6.1"
			          }
			        ],
			        "prerequisites": {
			          "cdsIntent": "name on a cds intent to be executed",
			          "questions": [
			            "Q1",
			            "Q2"
			          ]
			        }
			      },
			      "domain": "ehmp-activity",
			      "facility-enterprise": "",
			      "name": "Physical Therapy Consult CBC",
			      "state": "active",
			      "subDomain": "consult",
			      "timestamp": "2016-03-10T22:13:23.105Z",
			      "type": "entr",
			      "uid": "urn:va:entordrbls:2"
			    }
			  ],
			  "status": 200
			}

	+ Schema

			{
			  "$schema": "http://json-schema.org/draft-04/schema#",
			  "type": "object",
			  "properties": {
			    "data": {
			      "type": "array",
			      "items": [
			        {
			          "type": "object",
			          "properties": {
			            "uid": {
			              "type": "string"
			            },
			            "type": {
			              "type": "string"
			            },
			            "domain": {
			              "type": "string"
			            },
			            "subDomain": {
			              "type": "string"
			            },
			            "facility-enterprise": {
			              "type": "string"
			            },
			            "state": {
			              "type": "string"
			            },
			            "name": {
			              "type": "string"
			            }
			          },
			          "required": [
			            "uid",
			            "type",
			            "domain",
			            "subDomain",
			            "name"
			          ]
			        }
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

:[Response 500]({{{common}}}/responses/500.md)
# Group Order

## All Orders [{{{path}}}]

### All Orders [GET {{{path}}}/all-orders{?pid}{&filter}]

Retrieve VistA orders and eHMP orders.

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    :[filter]({{{common}}}/parameters/filter.md)

+ Response 200 (application/json)

	+ Body

		    {
			  "data": {
		    	"items": [
		     		{
				        "clinicians": [
				          {
				            "name": "PROVIDER,FIVE",
				            "role": "S",
				            "signedDateTime": 20150326165800,
				            "uid": "urn:va:user:C877:988"
				          }
				        ],
				        "content": "ELECTROCARDIOGRAM CARDIOLOGY Proc Bedside\r\n<DISCONTINUED BY SERVICE>\r\n",
				        "displayGroup": "PROC",
				        "entered": "20150326165800",
				        "facilityCode": "998",
				        "facilityName": "ABILENE (CAA)",
				        "kind": "Consult",
				        "lastUpdateTime": "20150326165900",
				        "localId": "38434",
				        "locationName": "7A GEN MED",
				        "locationUid": "urn:va:location:C877:158",
				        "name": "ELECTROCARDIOGRAM",
				        "oiCode": "urn:va:oi:111",
				        "oiName": "ELECTROCARDIOGRAM",
				        "oiPackageRef": "12;99PRC",
				        "pid": "C877;3",
				        "providerDisplayName": "Provider,Five",
				        "providerName": "PROVIDER,FIVE",
				        "providerUid": "urn:va:user:C877:988",
				        "results": [
				          {
				            "uid": "urn:va:consult:C877:3:646"
				          }
				        ],
				        "service": "GMRC",
				        "stampTime": "20150326165900",
				        "start": "20150326165800",
				        "statusCode": "urn:va:order-status:dc",
				        "statusName": "DISCONTINUED",
				        "statusVuid": "urn:va:vuid:4500704",
				        "stop": "20150326165900",
				        "summary": "ELECTROCARDIOGRAM CARDIOLOGY Proc Bedside\r\n<DISCONTINUED BY SERVICE>\r\n",
				        "uid": "urn:va:order:C877:3:38434"
			      	},
			      	{
		        		"authorUid": "urn:va:user:9E7A:10000000274",
				        "creationDateTime": "20160519144736+0000",
				        "data": {
				          "activity": {
				            "deploymentId": "VistaCore:Order",
				            "processDefinitionId": "Order:Consult",
				            "processInstanceId": "21"
				          },
				          "clinicalNote": "",
				          "formRecord": {
				            "_labelsForSelectedValues": {
				              "condition": "Diabetes Mellitus Type II or unspecified",
				              "consultName": "Physical Therapy Consult",
				              "location": "PANORAMA (PAN) COLVILLE, WA"
				            },
				            "condition": "Diabetes Mellitus Type II or unspecified",
				            "consultName": "Physical Therapy Consult",
				            "deploymentId": "VistaCore:Order:2.0.0.55",
				            "earliestDate": "05/19/2016",
				            "facility": "9E7A",
				            "icn": "9E7A;3",
				            "latestDate": "06/18/2016",
				            "location": "500",
				            "objectType": "consultOrder",
				            "orderingProviderId": "9E7A;10000000274",
				            "pid": "9E7A;3",
				            "processDefId": "Order.Consult",
				            "requestComment": "NONE",
				            "requestQuestion": "NONE",
				            "specialty": "Physical Therapy Consult",
				            "urgency": "9"
				          },
				          "instructions": null,
				          "prerequisites": {
				            "cdsObject": {
				              "data": {
				                "activity": {
				                  "deploymentId": "VistaCore:Order",
				                  "processDefinitionId": "Order:Consult"
				                },
				                "codes": [
				                  {
				                    "code": "444831000124102",
				                    "display": "Referral for physical therapy ",
				                    "system": "urn:oid:2.16.840.1.113883.6.96"
				                  }
				                ],
				                "teamFocus": {
				                  "code": 81,
				                  "name": "Physical Therapy"
				                }
				              },
				              "domain": "ehmp-activity",
				              "facility-enterprise": "enterprise",
				              "name": "Physical Therapy Consult",
				              "state": "active",
				              "subDomain": "consult",
				              "type": "ehmp-enterprise-orderable",
				              "uid": "urn:va:entordrbls:1"
				            }
				          },
				          "teamFocus": {
				            "code": 75,
				            "name": "Rheumatology"
				          }
				        },
				        "displayName": "Physical Therapy Consult - 9",
				        "domain": "ehmp-activity",
				        "ehmpState": "active",
				        "patientUid": "urn:va:patient:9E7A:3:3",
				        "referenceId": "",
				        "subDomain": "consult",
				        "uid": "urn:va:ehmp-activity:9E7A:3:48be5657-ac47-4483-83ea-df51e47a6821",
				        "visit": {
				          "dateTime": "20140814130730",
				          "location": "urn:va:location:9E7A:158"
				        },
				        "displayGroup": "eHMP CSLT",
				        "facilityMoniker": "500",
				        "providerDisplayName": "urn:va:user:9E7A:10000000274",
				        "summary": "Diabetes Mellitus Type II or unspecified",
				        "kind": "consult",
				        "entered": "20160519144736+0000",
				        "start": "05/19/2016",
				        "stop": "06/18/2016"
			      	}
			    ]
			  },
			  "status": 200
			}

    + Schema

    		:[Schema]({{{common}}}/schemas/orders-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

# Group Orders

## Orders Writeback API [{{{path}}}]

This API provides orders writeback resources.

### Create [POST {{{path}}}/lab]

Create a new order in the VistA.  Request JSON body contains all the user inputs.  Additional fields are required based on the user's order selection.

+ Parameters

	+ pid (string, required) - patient ID

+ Request JSON Body (application/json)

    + Body

            {
            	"dfn": "100615",
            	"provider": "10000000238",
            	"location": "285",
            	"orderDialog": "LR OTHER LAB TESTS",
            	"displayGroup": "5",
            	"quickOrderDialog": "2",
            	"inputList": [{
            		"inputKey": "4",
            		"inputValue": "548"
            	}, {
            		"inputKey": "126",
            		"inputValue": "7"
            	}, {
            		"inputKey": "127",
            		"inputValue": "73"
            	}, {
            		"inputKey": "180",
            		"inputValue": "9"
            	}, {
            		"inputKey": "28",
            		"inputValue": "SP"
            	}, {
            		"inputKey": "6",
            		"inputValue": "TODAY"
            	}, {
            		"inputKey": "29",
            		"inputValue": "28"
            	}],
            	"commentList": [{
            		"comment": "~For Test: PTT"
            	}, {
            		"comment": "~ANTICOAGULANT: foo"
            	}],
            	"kind": "Laboratory"
            }

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "status": 200,
                    "data": "{\"content\":\"AMIKACIN BLOOD   SERUM SP\\r\\n~For Test: AMIKACIN ~Dose is expected to be at &UNKNOWN level. additional comment *UNSIGNED*\\r\\n\",\"displayGroup\":\"CH\",\"entered\":201602111850,\"facilityCode\":500,\"facilityName\":\"CAMP MASTER\",\"lastUpdateTime\":20160211185053,\"localId\":39208,\"locationName\":\"DIABETIC\",\"locationUid\":\"urn:va:location:9E7A:285\",\"name\":\"AMIKACIN\",\"oiCode\":\"urn:va:oi:1191\",\"oiName\":\"AMIKACIN\",\"oiPackageRef\":\"1302;99LRT\",\"providerName\":\"EHMP,UATFOUR\",\"providerUid\":\"urn:va:user:9E7A:10000000238\",\"service\":\"LR\",\"stampTime\":20160211185053,\"start\":\"\",\"statusCode\":\"urn:va:order-status:unr\",\"statusName\":\"UNRELEASED\",\"statusVuid\":\"urn:va:vuid:4501124\",\"stop\":\"\",\"uid\":\"urn:va:order:9E7A:100615:39208\"}"
                },
                "status": 200
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)

### Detail [GET {{{path}}}/detail-lab/:resourceId]

Order detail is retrieved from VistA.

+ Parameters

	+ pid (string, required) - patient ID

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "status": 200,
                    "data": "AMIKACIN BLOOD   SERUM LC\r\n~For Test: AMIKACIN ~Dose is expected to be at &UNKNOWN level. additional\r\ncomment *UNSIGNED*\r\n   \r\nActivity:\r\n02/11/2016 18:50  New Order entered by XIU,MARGARET\r\n     Order Text:        AMIKACIN BLOOD   SERUM LC\r\n                        ~For Test: AMIKACIN ~Dose is expected to be at &UNKNOWN level. additional\r\n                        comment\r\n     Nature of Order:   ELECTRONICALLY ENTERED\r\n     Ordered by:        EHMP,UATFOUR (Physician)\r\n     Signature:         NOT SIGNED\r\n   \r\nCurrent Data:\r\nTreating Specialty:           \r\nOrdering Location:            DIABETIC\r\nStart Date/Time:              \r\nStop Date/Time:               \r\nCurrent Status:               UNRELEASED\r\n  Orders that have not been released to the service for action.\r\nOrder #39208\r\n   \r\nOrder:\r\nLab Test:                     AMIKACIN \r\nCollected By:                 Lab blood team \r\nCollection Sample:            BLOOD  \r\nSpecimen:                     SERUM \r\nCollection Date/Time:         TODAY \r\nUrgency:                      ROUTINE \r\nComments:                     \r\n  ~For Test: AMIKACIN\r\n  ~Dose is expected to be at &UNKNOWN level.\r\n  additional comment\r\nHow often:                    ONE TIME \r\n   \r\nOrder Checks:\r\nHIGH:       Duplicate order: AMIKACIN BLOOD   SERUM SP  [UNRELEASED]\r\n"
                },
                "status": 200
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)


### Sign Details [POST {{{path}}}/sign-details-lab]

Retrieve sign order detail from the VistA.  First, check to see order is still signable.  Next, fetch order details and order checks.

+ Parameters

	+ pid (string, required) - patient ID

+ Request JSON Body (application/json)

    + Body

            {
                "dfn": "100716",
                "provider": "10000000271",
                "orderIds": [
                "39028;1"
                ]
            }


+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "data": [
                    {
                        "orderId": "39028;1",
                        "detail": "CREATININE BLOOD   SERUM SP\r\n   \r\nActivity:\r\n10/01/2015 10:44  New Order entered by PROGRAMMER,ONE (COMPUTER SPECIA)\r\n     Order Text:        CREATININE BLOOD   SERUM SP\r\n     Nature of Order:   ELECTRONICALLY ENTERED\r\n     Ordered by:        PROGRAMMER,ONE (COMPUTER SPECIA)\r\n     Signature:         NOT REQUIRED DUE TO SERVICE CANCEL/LAPSE\r\n   \r\nCurrent Data:\r\nCurrent Primary Provider:     PROVIDER,EHMP\r\nCurrent Attending Physician:  GUPTA,POONAM\r\nTreating Specialty:           \r\nOrdering Location:            GENERAL MEDICINE\r\nStart Date/Time:              \r\nStop Date/Time:               \r\nCurrent Status:               LAPSED\r\n  Orders that remain pending beyond their start date, by a site \r\n  defined number of days; unreleased orders that meet this same \r\n  criteria will be removed from the system.\r\nOrder #39028\r\n   \r\nOrder:\r\nLab Test:                     CREATININE \r\nCollected By:                 Send patient to lab \r\nCollection Sample:            BLOOD  \r\nSpecimen:                     SERUM \r\nCollection Date/Time:         TODAY \r\nUrgency:                      ROUTINE \r\n   \r\n",
                        "hash": "975bfeb2655a73f118465a06f826c4b5"
                    }
                ]
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)


### Discontinue Details [POST {{{path}}}/discontinue-details-lab]

Retrieve discontinue order detail from the VistA.  First, check to see order is still discontinuable.  Next, fetch order details.

+ Parameters

	+ pid (string, required) - patient ID

+ Request JSON Body (application/json)

    + Body

            {
                "dfn": "100716",
                "provider": "10000000271",
                "orderIds": [
                "39028;1"
                ]
            }

+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "data": [
                    {
                        "orderId": "39028;1",
                        "detail": "CREATININE BLOOD   SERUM SP\r\n   \r\nActivity:\r\n10/01/2015 10:44  New Order entered by PROGRAMMER,ONE (COMPUTER SPECIA)\r\n     Order Text:        CREATININE BLOOD   SERUM SP\r\n     Nature of Order:   ELECTRONICALLY ENTERED\r\n     Ordered by:        PROGRAMMER,ONE (COMPUTER SPECIA)\r\n     Signature:         NOT REQUIRED DUE TO SERVICE CANCEL/LAPSE\r\n   \r\nCurrent Data:\r\nCurrent Primary Provider:     PROVIDER,EHMP\r\nCurrent Attending Physician:  GUPTA,POONAM\r\nTreating Specialty:           \r\nOrdering Location:            GENERAL MEDICINE\r\nStart Date/Time:              \r\nStop Date/Time:               \r\nCurrent Status:               LAPSED\r\n  Orders that remain pending beyond their start date, by a site \r\n  defined number of days; unreleased orders that meet this same \r\n  criteria will be removed from the system.\r\nOrder #39028\r\n   \r\nOrder:\r\nLab Test:                     CREATININE \r\nCollected By:                 Send patient to lab \r\nCollection Sample:            BLOOD  \r\nSpecimen:                     SERUM \r\nCollection Date/Time:         TODAY \r\nUrgency:                      ROUTINE \r\n   \r\n",
                        "hash": "975bfeb2655a73f118465a06f826c4b5"
                    }
                ]
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)


### Discontinue [DELETE {{{path}}}/discontinue-lab]

Discontinue order from the VistA.  First, lock patient.  Second, lock orders.  Third, fetch each order detail and compare hash.  Fourth, discontinue orders.  Fifth, unlock orders.  Last, unlock patient.

+ Parameters

	+ pid (string, required) - patient ID

+ Request JSON Body (application/json)

    + Body

            {
            	"dfn": "100716",
            	"provider": "10000000271",
            	"location": "129",
            	"kind": "Laboratory",
            	"orderList": [{
            		"orderId": "39028;1",
            		"hash": "975bfeb2655a73f118465a06f826c4b5"
            	}]
            }

+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "data": {
                    "39028;1": true
                }
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)


### Sign [POST {{{path}}}/sign-lab]

Sing order in the VistA.  First, validate signature.  Second, lock patient.  Third, lock orders.  Third, fetch each order detail and compare hash.  Fourth, save order check.  Fifth, sign orders.  Sixth, unlock order.  Last, unlock patient.

+ Parameters

	+ pid (string, required) - patient ID

+ Request JSON Body (application/json)

    + Body

            {
            	"kind": "Laboratory",
            	"provider": "10000000271",
            	"dfn": "100615",
            	"location": "285",
            	"eSig": "PW    !!",
            	"orderList": [{
            		"orderId": "39209;1",
            		"orderDetailHash": "2443ff804e510680ab1fae863cb01ae9"
            	}],
            	"overrideReason": "override reason"
            }

+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "data": [
                    {
                        "orderId": "39209;1",
                        "success": true
                    }
                ]
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)


### Save Draft [POST {{{path}}}/save-draft-lab]

Save Draft order to pJDS.  Use this resource to create/update draft order.

+ Parameters

	+ pid (string, required) - patient ID

+ Request JSON Body (application/json)

    + Body

            {
                "patientUid": "9E7A;100716",
                "authorUid": "Something",
                "domain": "order",
                "ehmpState": "draft",
                "subDomain": "laboratory",
                "visit": {
                    "location": "Ren",
                    "serviceCategory": "I'm not blank",
                    "dateTime": "asdfadsfasdf"
                },
                "data": {
                    "updated": "201601010111",
                    "totalItems": "1",
                    "currentItemCount": "1",
                    "items": [{
                        "field1": "field2"
                    }]
                }
            }

+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "data": {
                    "statusCode": 201,
                    "headers": {
                        "date": "Fri, 12 Feb 2016 22:28:31 GMT",
                        "location": "http://IP             /clinicobj/urn:va:ehmp:9E7A;100716:54a050c5-86e4-44df-a184-ac9d1fb52f7a",
                        "content-type": "application/json",
                        "content-length": "0"
                    },
                    "request": {
                        "uri": {
                            "protocol": "http:",
                            "slashes": true,
                            "auth": null,
                            "host": "IP             ",
                            "port": "9080",
                            "hostname": "IP        ",
                            "hash": null,
                            "search": null,
                            "query": null,
                            "pathname": "/clinicobj",
                            "path": "/clinicobj",
                            "href": "http://IP             /clinicobj"
                        },
                        "method": "POST",
                        "headers": {
                            "accept": "application/json",
                            "content-type": "application/json",
                            "content-length": 374
                        }
                    }
                }
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)

### Find Draft [POST {{{path}}}/find-draft]

Find Draft orders from pJDS.  Use this resource to find a list of draft orders.

+ Parameters

    + pid (string, required) - patient ID

+ Request JSON Body (application/json)

    + Body

            {
                "patientUid": "9E7A;100600",
                "authorUid": "Something10"
            }

+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "data": {
                    "items": [{
                        "authorUid": "Something10",
                        "creationDateTime": "20160219193105+0000",
                        "data": {
                            "currentItemCount": "1",
                            "items": [
                                {
                                 "field1": "field2"
                                }
                            ],
                            "totalItems": "1",
                            "updated": "201601010111"
                        },
                        "domain": "order",
                        "ehmpState": "draft",
                        "patientUid": "9E7A;100600",
                        "subDomain": "laboratory",
                        "uid": "urn:va:ehmp-order:9E7A;100600:b3b57db4-0dd4-4aeb-ab8b-9f9b1ae8ea94",
                        "visit": {
                            "dateTime": "asdfadsfasdf",
                            "location": "Ren",
                            "serviceCategory": "I'm not blank"
                        }
                    }]
                }
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)

### Read Draft [GET {{{path}}}/read-draft/:resourceId]

Read a Draft order from pJDS, based on a clinical object UID.

+ Parameters

    + pid (string, required) - patient ID
	+ resourceId (string, required) - Draft order clinical object UID

+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "data": {
                    "items": [{
                        "authorUid": "Something10",
                        "creationDateTime": "20160219193105+0000",
                        "data": {
                            // Draft order attributes
                        },
                        "domain": "order | activity",
                        "ehmpState": "draft",
                        "patientUid": "9E7A;100600",
                        "subDomain": "laboratory | consult | request",
                        "uid": "<<resourceId parameter value>>",
                        "visit": {
                            "dateTime": "asdfadsfasdf",
                            "location": "Ren",
                            "serviceCategory": "I'm not blank"
                        }
                    }]
                }
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)

# Group Orders Lab Support Data

## Orders Lab Support Data API [{{{path}}}{?site}{&type}{&location}{&dateSelected}{&timestamp}]

Orders Lab Support Data API handles pick-list gaps.  This resource handles all the lab order RPC calls needed by UI that are not handled by pick-list.

+ Parameters

	+ site (string, required) - site hash

	+ type (enum[string], required) - name of lab support data

        + Members
            + `lab-default-immediate-collect-time` - Return default immediate collect time for the user's division.
            + `lab-collect-times` - Return a list of lab collect times for a date and location.
            + `lab-valid-immediate-collect-time` - Determine whether the supplied time is a valid lab immediate collect time.
            + `lab-future-lab-collects` - Return the number of days in the future to allow Lab Collects.
            + `discontinue-reason` - Return a list of valid discontinuation reasons.
            + `lab-specimens` - Return a list of valid lab specimens.
            + `lab-current-time` - Return the lab current time.

    + location (string, optional) - location ID, required when `type` is `lab-collect-times` or `lab-future-lab-collects`.

    + dateSelected (string, optional) - selected date, required when `type` is `lab-collect-times`.

    + timestamp (string, optional) - selected timestamp, required when `type` is `lab-valid-immediate-collect-time`.

### Retrieve Lab Support Data [GET]

Retrieve lab order support data from VistA.  Based on the input type, different RPC is invoked.  Additional parameter(s) is(are) required for different input type.  Parsed RPC response is returned.

+ Request Lab Collect Times

    + Parameters

        + type: `lab-collect-times`

        + location (required)

        + dateSelected (required)

+ Response 200 (application/json)

    + Body

            {
                "data": [
                    "0930",
                    "1100",
                    "1230",
                    "1300",
                    "1530",
                    "1545",
                    "1600",
                    "1730"
                ],
                "status": 200
            }

+ Request Lab Collect Times

    + Parameters

        + type: `lab-default-immediate-collect-time`

+ Response 200 (application/json)

    + Body

            {
                "data": [
                    {
                        "defaultImmediateCollectTime": "20160212174600"
                    }
                ],
                "status": 200
            }

+ Request Discontinue Reasons

    + Parameters

        + type: `discontinue-reason`

+ Response 200 (application/json)

    + Body

            {
                "data": [
                    {
                        "label": "Duplicate Order",
                        "value": "7"
                    },
                    {
                        "label": "Entered in error",
                        "value": "16"
                    },
                    {
                        "label": "Per Policy",
                        "value": "17"
                    },
                    {
                        "label": "Requesting Physician Cancelled",
                        "value": "14"
                    }
                ],
                "status": 200
            }

+ Request Future Lab Collects

    + Parameters

        + type: `lab-future-lab-collects`

        + location (required)

+ Response 200 (application/json)

    + Body

            {
                "data": [
                    "7"
                ],
                "status": 200
            }

+ Request Lab Valid Immediate Collect Time

    + Parameters

        + type: `lab-valid-immediate-collect-time`

        + timestamp (required)

+ Response 200 (application/json)

    + Body

            {
                "data": [
                    {
                        "isValid": "0",
                        "validationMessage": "SERVICE NOT OFFERED ON SAT"
                    }
                ],
                "status": 200
            }

+ Request Lab Specimens

    + Parameters

        + type: `lab-specimens`

+ Response 200 (application/json)

    + Body

            {
                "data": [
                    {
                        "id": "76",
                        "name": "PERITONEAL FLUID"
                    },
                    {
                        "id": "70",
                        "name": "BLOOD"
                    },
                    {
                        "id": "124",
                        "name": "BRONCHIAL WASHING CYTOLOGIC MATERIAL"
                    }
                ]
            }

+ Request Lab Current Time

    + Parameters

        + type: `lab-current-time`

+ Response 200 (application/json)

    + Body

            {
                "data": [
                    {
                        "currentTime": "20150702194000"
                    }
                ]
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)
# Group Orders Lab Support Data

## Orders Lab Support Data API [{{{path}}}]

Orders Lab Support Data API handles pick-list gaps.  This resource handles all the lab order RPC calls needed by UI that are not handled by pick-list.  

### Retrieve Lab Support Data [GET {{{path}}}]

Retrieve lab order support data from VistA.  Based on the input type, different RPC is invoked.  Parsed RPC response is returned.

+ Parameters

	+ type (string, required) - name of lab support data
	
	+ site (string, required) - site hash

Additional parameter(s) is(are) required for different input type.  

#### lab collect times

"Returns a list of lab collect times for a date and location." (from RPC description)

+ Additional Parameters

    + dateSelected (string, required) - selected date
    
    + location (string, required) - location ID
    
    
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

#### lab default immediate collect time

"Returns default immediate collect time for the user's division." (from RPC description)

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

#### lab discontinue reason

"RPC to return a list of valid discontinuation reasons." (from RPC description)
    
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

#### lab future lab collects

"Returns the number of days in the future to allow Lab Collects." (from RPC description)

+ Additional Parameters
    
    + location (string, required) - location ID
    
    
+ Response 200 (application/json)

    + Body

            {
                "data": [
                    "7"
                ],
                "status": 200
            }

#### lab valid immediate collect time

"Determines whether the supplied time is a valid lab immediate collect time." (from RPC description)  If valid, 1 is returned.  Otherwise, 0 is returned.

+ Additional Parameters

    + timestamp (string, required) - selected timestamp
    
    
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

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)


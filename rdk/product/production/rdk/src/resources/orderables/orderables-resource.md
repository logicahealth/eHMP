# Group Orderables

## Orderables [{{{path}}}]

### Orderables Search [GET {{{path}}}{?criteria}{&domains}]

Search Orderables

+ Parameters

	+ criteria (string, optional)

		Search criteria

	+ domains (enum[string], optional)

        List of domains to search. If empty, it searches all domains.

        + Members
            + `lab` - Laboratory orderables
            + `rad` - Radiology orderables

+ Response 200 (application/json)

	+ Body

            {
                "data": {
                    "items": [
                    {
                        "ien": "204",
                        "synonym": "BICARBONATE (SBC)",
                        "name": "BICARBONATE (SBC)",
                        "type": "lab"
                    }
                    ]
                },
                "status": 200
            }

+ Response 400 (application/json)

        {
            "message": "Unsupported domain. Supported domains are lab, rad.",
            "status": 400
        }

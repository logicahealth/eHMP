+ Response 202 (application/json)

    + Body

            {
                "message": "Pick list (:[name](name || "")) is now loading.  See Retry-After seconds (in the header) for the length of time to wait.",
                "status": 202
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "title": "Schema for 202 response from pick-list resources",
                "description": "",
                "type": "object",
                "required": [
                    "message",
                    "status"
                ],
                "properties": {
                    "message": {
                        "type": "string"
                    },
                    "status": {
                        "type": "integer",
                        "minimum": 202,
                        "maximum": 202
                    }
                }
            }

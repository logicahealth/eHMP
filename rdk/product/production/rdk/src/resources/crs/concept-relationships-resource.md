# Group CRS

## Concept Relationships [{{{path}}}]

### Concept Relationships [GET {{{path}}}{?target.domains}{&concept.domain}{&concept.id}]

Get the ids of concepts that are related to a given starting concept.

+ Parameters

	+ concept.id (string, required) - the id of the starting concept. Ex: 59621000 for hypertension

    + concept.domain (string, required) - the domain of the starting concept. Ex: Problem for hypertension

    + target.domains (string, required) - a comma-delimited string of domains to check for related concepts. Ex: Medication, Laboratory, Vital

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": [
                                {
                                    "domain": "Medication",
                                    "ids": [
                                        "866514",
                                        "855332",
                                        "313782",
                                        "197316",
                                        "199083",
                                        "577776",
                                        "197943",
                                        "861007"
                                    ]
                                },
                                {
                                    "domain": "Laboratory",
                                    "ids": [
                                        "2823-3",
                                        "2345-7",
                                        "2093-3",
                                        "2947-0",
                                        "33037-3"
                                    ]
                                },
                                {
                                    "domain": "Vital",
                                    "ids": [
                                        "72514-3",
                                        "59408-5",
                                        "9279-1",
                                        "8867-4",
                                        "55284-4"
                                    ]
                                }
                            ]
                },
                "status": 200
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "data": {
                        "type": "object",
                        "properties": {
                            "items": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "domain": {
                                            "type": "string"
                                        },
                                        "ids": {
                                            "type": "array",
                                            "items": {
                                                "type": "string"
                                            }
                                        }
                                    },
                                    "required": [
                                        "domain",
                                        "ids"
                                    ]
                                }
                            }
                        },
                        "required": [
                            "items"
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

:[Response 400]({{{common}}}/responses/400.md name:"conceptId")
:[Response 404]({{{common}}}/responses/404.md)
:[Response 500]({{{common}}}/responses/500.md)

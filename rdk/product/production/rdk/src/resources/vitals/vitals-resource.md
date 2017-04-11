# Group Vitals

## Vitals [{{{path}}}]

### Closest reading [GET {{{path}}}/closest{?pid}{&ts}{&type}{&flag}]

Get the observation date/time and reading of the record closest to the date/time for the patient and vital type

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + ts (string, optional) - root date of where search will take place, in YYYYMMDDHHMMSS format where HHMMSS is "000000" by default, used in conjunction with the flag parameter

    + type (string, required) - the vital type abbreviation

    + flag (enum[string], optional) - indicates if the search should look before or after the date/time specified in the GMVDT value where 1 indicates before, 2 indicates after and 0 inidicates either direction

        + Members
            + `0` - Search either direction
            + `1` - Search before the `ts`
            + `2` - Search after the `ts`



+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Qualifier information [GET {{{path}}}/qualifiers{?param}]

Get qualifier information for selected vital types

#### Notes

Returns all qualifier information for the vital types selected. If no types are selected, then all qualifiers are returned.

+ Parameters

    + param (string, required) - a comma delimited list of vital abbreviations; example: types=WT,HT,T for weight, height, temperature. Leaving this parameter off will return all vital qualifiers


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": []
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/vitals_qualifiers-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### All vitals [GET {{{path}}}/all{?pid}{&date.start}{&date.end}]

List all vitals/measurements data for a given date/time span

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    :[date.start]({{{common}}}/parameters/date.start.md required:"required")

    :[date.end]({{{common}}}/parameters/date.end.md required:"required")


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Vitals Rule [POST {{{path}}}/vitals-rule]

Validate the difference between previous and current vital measurements

+ Request JSON Message (application/json)

    + Body

            {
                "pid": "9E7A;3",
                "bloodpressure": {
                    "value": "ssss"
                },
                "temperature": {
                    "value": "ssss",
                    "units": "ssss"
                },
                "respiration": {
                    "value": "ssss",
                    "units": "ssss"
                },
                "pain": {
                    "value": "ssss"
                },
                "pulse": {
                    "value": "ssss",
                    "units": "ssss"
                },
                "circumferencegirth": {
                    "value": "ssss",
                    "units": "ssss"
                },
                "pulseoximetry": {
                    "value": "ssss",
                    "units": "ssss"
                },
                "weight": {
                    "value": "ssss",
                    "units": "ssss"
                },
                "height": {
                    "value": "ssss",
                    "units": "ssss"
                }
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "pid": {
                        "type": "string",
                        "pattern": "^([a-zA-Z0-9]+);([a-zA-Z0-9]+)$|^([0-9]+)V([0-9]+)$"
                    },
                    "bloodpressure": {
                        "type": "object",
                        "properties": {
                            "value": {
                                "type": "string"
                            }
                        },
                        "required": [
                            "value"
                        ]
                    },
                    "temperature": {
                        "type": "object",
                        "properties": {
                            "value": {
                                "type": ["number", "string"]
                            },
                            "units": {
                                "type": "string"
                            }
                        },
                        "required": [
                            "value",
                            "units"
                        ]
                    },
                    "respiration": {
                        "type": "object",
                        "properties": {
                            "value": {
                                "type": ["number", "string"]
                            },
                            "units": {
                                "type": "string"
                            }
                        },
                        "required": [
                            "value",
                            "units"
                        ]
                    },
                    "pain": {
                        "type": "object",
                        "properties": {
                            "value": {
                                "type": ["number", "string"]
                            }
                        },
                        "required": [
                            "value"
                        ]
                    },
                    "pulse": {
                        "type": "object",
                        "properties": {
                            "value": {
                                "type": ["number", "string"]
                            },
                            "units": {
                                "type": "string"
                            }
                        },
                        "required": [
                            "value",
                            "units"
                        ]
                    },
                    "circumferencegirth": {
                        "type": "object",
                        "properties": {
                            "value": {
                                "type": ["number", "string"]
                            },
                            "units": {
                                "type": "string"
                            }
                        },
                        "required": [
                            "value",
                            "units"
                        ]
                    },
                    "pulseoximetry": {
                        "type": "object",
                        "properties": {
                            "value": {
                                "type": ["number", "string"]
                            },
                            "units": {
                                "type": "string"
                            }
                        },
                        "required": [
                            "value",
                            "units"
                        ]
                    },
                    "weight": {
                        "type": "object",
                        "properties": {
                            "value": {
                                "type": ["number", "string"]
                            },
                            "units": {
                                "type": "string"
                            }
                        },
                        "required": [
                            "value",
                            "units"
                        ]
                    },
                    "height": {
                        "type": "object",
                        "properties": {
                            "value": {
                                "type": ["number", "string"]
                            },
                            "units": {
                                "type": "string"
                            }
                        },
                        "required": [
                            "value",
                            "units"
                        ]
                    }
                },
                "required": [
                    "pid"
                ]
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

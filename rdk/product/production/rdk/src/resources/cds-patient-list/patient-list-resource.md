# Group Cds

## Cds patient list cds [{{{path}}}]

### Criteria get [GET {{{path}}}/criteria{?id}{&name}]

+ Parameters

    + id (string, optional) -  id

    + name (string, optional) - name of definition


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Criteria post [POST {{{path}}}/criteria]

+ Request JSON Message (application/json)

    + Body

            {
                "_id": "ssss",
                "name": "ssss",
                "accessor": "ssss",
                "datatype": "ssss",
                "piece": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "_id": {
                        "type": "string"
                    },
                    "name": {
                        "type": "string"
                    },
                    "accessor": {
                        "type": "string"
                    },
                    "datatype": {
                        "type": "string"
                    },
                    "piece": {
                        "type": "string"
                    }
                },
                "required": [
                    "name",
                    "accessor"
                ]
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Criteria delete [DELETE {{{path}}}/criteria{?id}{&name}]

+ Parameters

    + id (string, optional) -  id

    + name (string, optional) - name of Criteria


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Definition get [GET {{{path}}}/definition{?id}{&name}]

+ Parameters

    + id (string, optional) -  id

    + name (string, optional) - name of definition


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Definition post [POST {{{path}}}/definition]

+ Request JSON Message (application/json)

    + Body

            {
                "_id": "ssss",
                "name": "ssss",
                "description": "ssss",
                "expression": "ssss",
                "scope": "private",
                "owner": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "_id": {
                        "type": "string"
                    },
                    "name": {
                        "type": "string"
                    },
                    "description": {
                        "type": "string"
                    },
                    "expression": {
                        "type": "string"
                    },
                    "scope": {
                        "type": "string",
                        "enum": [
                            "private",
                            "site",
                            "enterprise"
                        ]
                    },
                    "owner": {
                        "type": "string"
                    }
                },
                "required": [
                    "name",
                    "expression"
                ]
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Definition delete [DELETE {{{path}}}/definition{?id}{&name}]

+ Parameters

    + id (string, optional) -  id

    + name (string, optional) - name of definition


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Definition copy [POST {{{path}}}/definition/copy{?id}{&name}{&newname}]

+ Parameters

    + id (string, optional) -  id

    + name (string, optional) - name of definition

    + newname (string, required) - name of new definition


+ Request JSON Message (application/json)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Patientlist get [GET {{{path}}}/list{?id}{&name}]

+ Parameters

    + id (string, optional) -  id

    + name (string, optional) - name of Patientlist


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Patientlist post [POST {{{path}}}/list]

+ Request JSON Message (application/json)

    + Body

            {
                "name": "ssss",
                "definition": {
                    "_id": "ssss",
                    "name": "ssss",
                    "description": "ssss",
                    "expression": "ssss",
                    "scope": "site",
                    "owner": "ssss"
                },
                "patients": [],
                "scope": "private",
                "owner": "ssss",
                "_id": "ssss"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "definition": {
                        "type": "object",
                        "properties": {
                            "_id": {
                                "type": "string"
                            },
                            "name": {
                                "type": "string"
                            },
                            "description": {
                                "type": "string"
                            },
                            "expression": {
                                "type": "string"
                            },
                            "scope": {
                                "type": "string",
                                "enum": [
                                    "private",
                                    "site",
                                    "enterprise"
                                ]
                            },
                            "owner": {
                                "type": "string"
                            }
                        },
                        "required": [
                            "name",
                            "expression"
                        ]
                    },
                    "patients": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "scope": {
                        "type": "string",
                        "enum": [
                            "private",
                            "site",
                            "enterprise"
                        ]
                    },
                    "owner": {
                        "type": "string"
                    },
                    "_id": {
                        "type": "string"
                    }
                },
                "required": [
                    "name",
                    "definition"
                ]
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Patientlist delete [DELETE {{{path}}}/list{?id}{&name}]

+ Parameters

    + id (string, optional) -  id

    + name (string, optional) - name of Patientlist


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Patientlist add [POST {{{path}}}/list/patients{?id}{&name}{&pid}]

+ Parameters

    + id (string, optional) -  id

    + name (string, optional) - name of Patientlist

    :[pid]({{{common}}}/parameters/pid.md)


+ Request JSON Message (application/json)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Patientlist remove [DELETE {{{path}}}/list/patients{?id}{&name}{&pid}]

+ Parameters

    + id (string, optional) -  id

    + name (string, optional) - name of Patientlist

    :[pid]({{{common}}}/parameters/pid.md)


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Patientlist status [GET {{{path}}}/list/status{?type}{&value}]

+ Parameters

    + type (string, required) -  type of patient id

    + value (string, required) - patient id

        Pattern: `^([0-9]+)$|^([a-zA-Z0-9]+);([a-zA-Z0-9]+)$|^([0-9]+)V([0-9]+)$`


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Patientlist copy [POST {{{path}}}/list/copy{?id}{&name}{&newname}]

+ Parameters

    + id (string, optional) -  id

    + name (string, optional) - name of existing Patientlist

    + newname (string, required) - name of new Patientlist


+ Request JSON Message (application/json)

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


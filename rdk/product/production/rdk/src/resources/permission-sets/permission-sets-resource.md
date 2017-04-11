# Group Permission Sets

## Permission Sets [{{{path}}}]

### Edit [PUT {{{path}}}/edit{?user}{&permissionSets}{&additionalPermissions}]

Replaces a permission set in the list of permission sets for an ehmp user with a new permission set

#### Notes

Parameters may be provided as query parameters or in the request body.

+ Parameters

    + user (string, optional) - user info JSON object with `uid`, `lname` and `fname` members

    + permissionSets (string, optional) - list of permission sets

    + additionalPermissions (string, optional) - list of additional discrete permissions


+ Request JSON Message (application/json)

    + Body

            {
                "user": {
                    "uid": "urn:va:user:C877:10000000270"
                },
                "permissionSets": ["student", "surgeon"]
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "user",
                    "permissionSets"
                ],
                "properties": {
                    "user": {
                        "type": "object",
                        "required": [
                            "uid"
                        ],
                        "properties": {
                            "uid": {
                                "type": "string"
                            },
                            "fname": {
                                "type": "string"
                            },
                            "lname": {
                                "type": "string"
                            }
                        }
                    },
                    "permissionSets": {
                        "type": "array",
                        "uniqueItems": true,
                        "items": {
                            "type": "string"
                        }
                    }
                }
            }

+ Request Query Paramters (application/json)

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": ["object", "string"],
                "properties": {},
                "allowAdditionalProperties": false
            }


+ Response 201 (application/json)

    + Body

            {
                "data": {
                    "modifiedBy": "urn:va:user:C877:10000000270",
                    "modifiedOn": "2015-08-19T19:31:41Z",
                    "val": [
                        "student",
                        "surgeon"
                    ]
                },
                "status": 201,
                "statusCode": 201
            }

    + Schema

            :[Schema]({{{common}}}/schemas/permissionSets_edit-PUT-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)


### Get User Permission Sets [GET {{{path}}}/getUserPermissionSets{?uid}]

+ Parameters

    :[uid]({{{common}}}/parameters/uid.md example:"urn:va:user:C877:10000000270" required:"required")


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "modifiedBy": "urn:va:user:C877:10000000270",
                    "modifiedOn": "2015-08-19T19:31:41Z",
                    "val": [
                        "read-access",
                        "standard-doctor"
                    ]
                },
                "status": 200,
                "statusCode": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/permissionSets_getUserPermissionSets-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### List [GET {{{path}}}/list]

Used to get the eHMP Permission Sets from JDS.

+ Response 200 (application/json)

    + Body

            {
                "data": [
                    {
                        "label": "Access Control Coordinator",
                        "val": "acc",
                        "permissions": [
                            "access-stack-graph",
                            "add-user-permission-set",
                            "edit-user-permission-set",
                            "read-active-medication",
                            "read-admin-screen",
                            "read-allergy",
                            "read-clinical-reminder",
                            "read-community-health-summary",
                            "read-condition-problem",
                            "read-document",
                            "read-encounter",
                            "read-immunization",
                            "read-medication-review",
                            "read-order",
                            "read-patient-history",
                            "read-patient-record",
                            "read-task",
                            "read-user-permission-set",
                            "read-vista-health-summary",
                            "read-vital",
                            "remove-user-permission-set"
                        ]
                    },
                    {
                        "label": "Read Access",
                        "val": "read-access",
                        "permissions": [
                            "read-active-medication",
                            "read-allergy",
                            "read-clinical-reminder",
                            "read-community-health-summary",
                            "read-document",
                            "read-encounter",
                            "read-immunization",
                            "read-medication-review",
                            "read-order",
                            "read-patient-history",
                            "read-condition-problem",
                            "read-patient-record",
                            "access-stack-graph",
                            "read-task",
                            "read-vital",
                            "read-vista-health-summary",
                            "read-stack-graph",
                            "read-timeline"
                        ]
                    }
                ],
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/permissionSets_list-GET-200.jsonschema)

:[Response 500]({{{common}}}/responses/500.md)

### Edit [PUT {{{path}}}/multi-user-edit{?users}{&permissionSets}{&additionalPermissions}{&mode}]

Replaces permission sets and additional discrete permissions in the list of permission sets for a list of ehmp users with new permission sets and additional discrete permissions

#### Notes

Parameters may be provided as query parameters or in the request body.

+ Parameters

    + users (string, required) - array of user info JSON objects with `uid`, `lname` and `fname` members

    + permissionSets (string, required) - list of permission sets

    + additionalPermissions (string, required) - list of additional discrete permissions

    + mode (enum[string], required) - multi user edit mode 

        + Members
            + `add`
            + `remove`
            + `clone`

+ Request JSON Message (application/json)

    + Body

            {
                "users": [{
                    "uid": "urn:va:user:C877:10000000270"
                }],
                "permissionSets": ["student", "surgeon"],
                "additionalPermissions": [],
                "mode": "add"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": [
                    "users",
                    "permissionSets",
                    "additionalPermissions",
                    "mode"
                ],
                "properties": {
                    "users": {
                        "type": "array",
                        "uniqueItems": true,
                        "items": {
                            "type": "object",
                            "required": [
                                "uid"
                            ],
                            "properties": {
                                "uid": {
                                    "type": "string"
                                },
                                "fname": {
                                    "type": "string"
                                },
                                "lname": {
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "permissionSets": {
                        "type": "array",
                        "uniqueItems": true,
                        "items": {
                            "type": "string"
                        }
                    },
                    "additionalPermissions": {
                        "type": "array",
                        "uniqueItems": true,
                        "items": {
                            "type": "string"
                        }
                    },
                    "mode": {
                        "type": "string",
                        "enum": ["add", "remove", "clone"]
                    }
                }
            }

+ Request Query Paramters (application/json)

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": ["object", "string"],
                "properties": {},
                "allowAdditionalProperties": false
            }


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "editedUsers": [],
                    "failedOnEditUsers": []
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/permissionSets_multi-user-edit-PUT-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

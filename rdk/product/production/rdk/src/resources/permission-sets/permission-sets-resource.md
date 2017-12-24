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
                    "uid": "urn:va:user:SITE:10000000270"
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
                    "modifiedBy": "urn:va:user:SITE:10000000270",
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

    :[uid]({{{common}}}/parameters/uid.md example:"urn:va:user:SITE:10000000270" required:"required")


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "modifiedBy": "urn:va:user:SITE:10000000270",
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
                    "uid": "urn:va:user:SITE:10000000270"
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

### Features Category List [GET {{{path}}}/features-list]

Used to get the feature category permissions.

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": [
                        {
                            "uid": "active-medications",
                            "description": "Active medications feature category",
                            "label": "Active Medications",
                            "permissions": [
                                "add-active-medication",
                                "discontinue-active-medication",
                                "edit-active-medication",
                                "read-active-medication"
                            ],
                            "status": "active"
                        },
                        {
                            "uid": "vitals",
                            "description": "Vitals feature category",
                            "label": "Vitals",
                            "permissions": [
                                "add-vital",
                                "eie-vital",
                                "read-vital"
                            ],
                            "status": "active"
                        }
                    ]
                },
                "statusCode": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/permissionSets_features-list-GET-200.jsonschema)

:[Response 500]({{{common}}}/responses/500.md)

### Add [POST {{{path}}}]

Adds a new permission set to the pJDS repository

#### Notes

Parameters are provided in the request body.

+ Request JSON Message (application/json)

    + Body

            {
                "label": "Vitals",
                "status": "active",
                "version": "1.7.3",
                "description": "This is a vitals permission set",
                "sub-sets": ["Category One"],
                "permissions": ["read-vitals", "add-vitals"],
                "note": "Test note here",
                "example": "Some unnecessary example",
                "nationalAccess": false
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "additionalProperties": false,
                "definitions": {},
                "properties": {
                    "description": {
                        "id": "/properties/description",
                        "type": "string"
                    },
                    "example": {
                        "id": "/properties/example",
                        "type": "string"
                    },
                    "label": {
                        "id": "/properties/label",
                        "type": "string"
                    },
                    "nationalAccess": {
                        "id": "/properties/nationalAccess",
                        "type": "boolean"
                    },
                    "note": {
                        "id": "/properties/note",
                        "type": "string"
                    },
                    "permissions": {
                        "id": "/properties/permissions",
                        "items": {
                            "id": "/properties/permissions/items",
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "status": {
                        "id": "/properties/status",
                        "type": "string"
                    },
                    "sub-sets": {
                        "id": "/properties/sub-sets",
                        "items": {
                            "id": "/properties/sub-sets/items",
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "version": {
                        "id": "/properties/version",
                        "type": "string"
                    }
                },
                "required": [
                    "status",
                    "label",
                    "sub-sets",
                    "description",
                    "version",
                    "permissions"
                ],
                "type": "object"
            }

+ Response 201 (application/json)

    + Body

            {
                "uid": "urn:va:permset:1234"
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Update [PUT {{{path}}}/update]

Updates/edits a permission set

#### Notes

Parameters are provided in the request body.

+ Request JSON Message (application/json)

    + Body

            {
                "uid": "urn:va:permset:1234",
                "label": "Vitals",
                "status": "active",
                "version": "1.7.3",
                "description": "This is a vitals permission set",
                "sub-sets": ["Category One"],
                "removePermissions": ["read-conditions"],
                "addPermissions": ["add-vital", "read-vital"],
                "notes": "Test note here",
                "example": "Some unnecessary example",
                "nationalAccess": false
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "definitions": {},
                "properties": {
                    "addPermissions": {
                        "id": "/properties/addPermissions",
                        "items": {
                            "id": "/properties/addPermissions/items",
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "description": {
                        "id": "/properties/description",
                        "type": "string"
                    },
                    "example": {
                        "id": "/properties/example",
                        "type": "string"
                    },
                    "version": {
                        "id": "/properties/version",
                        "type": "string"
                    },
                    "label": {
                        "id": "/properties/label",
                        "type": "string"
                    },
                    "nationalAccess": {
                        "id": "/properties/nationalAccess",
                        "type": "boolean"
                    },
                    "note": {
                        "id": "/properties/note",
                        "type": "string"
                    },
                    "removePermissions": {
                        "id": "/properties/removePermissions",
                        "items": {
                            "id": "/properties/removePermissions/items",
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "status": {
                        "id": "/properties/status",
                        "type": "string"
                    },
                    "sub-sets": {
                        "id": "/properties/sub-sets",
                        "items": {
                            "id": "/properties/sub-sets/items",
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "uid": {
                        "id": "/properties/uid",
                        "type": "string"
                    }
                },
                "required": [
                    "uid",
                    "label",
                    "sub-sets",
                    "status",
                    "version",
                    "description"
                ],
                "type": "object"
            }

+ Response 200 (application/json)

    + Body

            {
              "status": 200
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Deprecate [PUT {{{path}}}/deprecate]

Deprecates a permission set

#### Notes

Parameters are provided in the request body.

+ Request JSON Message (application/json)

    + Body

            {
                "uid": "urn:va:permset:1234",
                "deprecate": true,
                "deprecatedVersion": "1.7.3"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "definitions": {},
                "properties": {
                    "deprecate": {
                        "id": "/properties/deprecate",
                        "type": "boolean"
                    },
                    "deprecatedVersion": {
                        "id": "/properties/deprecatedVersion",
                        "type": "string"
                    },
                    "uid": {
                        "id": "/properties/uid",
                        "type": "string"
                    }
                },
                "required": [
                    "uid",
                    "deprecate",
                    "deprecatedVersion"
                ],
                "type": "object"
            }

+ Response 200 (application/json)

    + Body

            {
              "status": 200
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Bulk add/remove permission on sets [PUT {{{path}}}/edit-permissions]

Performs a bulk edit to add/remove a single permission from multiple sets

#### Notes

Parameters are provided in the request body.

+ Request JSON Message (application/json)

    + Body

            {
                "permission": "urn:va:permset:1234",
                "addSets": ["urn:va:permset:1234", "urn:va:permset:4321"],
                "removeSets": ["urn:va:permset:1111", "urn:va:permset:2222"]
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "definitions": {},
                "properties": {
                    "addSets": {
                        "id": "/properties/addSets",
                        "items": {
                            "id": "/properties/addSets/items",
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "permission": {
                        "id": "/properties/permission",
                        "type": "string"
                    },
                    "removeSets": {
                        "id": "/properties/removeSets",
                        "items": {
                            "id": "/properties/removeSets/items",
                            "type": "string"
                        },
                        "type": "array"
                    }
                },
                "required": [
                    "permission"
                ],
                "type": "object"
            }

+ Response 200 (application/json)

    + Body

            {
              "status": 200
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Get permission sets categories [GET {{{path}}}/categories]

Returns the collection of the available permission sets categories

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": [
                        {
                            "label": "Read",
                            "value": "Read"
                        },
                        {
                            "label": "Clinician",
                            "value": "Clinician"
                        },
                        {
                            "label": "Nurse",
                            "value": "Nurse"
                        },
                        {
                            "label": "Clerk",
                            "value": "Clerk"
                        },
                        {
                            "label": "Medical Operator",
                            "value": "Medical Operator"
                        },
                        {
                            "label": "Administrative",
                            "value": "Administrative"
                        }
                    ]
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/permissionSets_categories-list-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

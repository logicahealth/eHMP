# Group Clinical Objects

## Clinical Objects Writeback API [{{{path}}}]

Clinical Objects are used to store enterprise clinical data such as Draft Orders, Consult Orders, Complex Notes, and in the future other data types (Typically data not currently supported by VistA or where VistA data models fall short of the VA Enterprise requirements).

The clinical object model would be used as the standardized data model for storing the Enterprise Clinical Data. Examples of this are:
* Draft lab/rad orders
* Relate VistA-centric orders to activities
* Related note objects to clinical data (such as orders)
* Activity/consult orders

This API provides a generic REST-ful interface to the pJDS-based Clinical Objects subsystem.

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

### Find [POST {{{path}}}/find-clinical-object{?loadReference}]

Find clinical objects.

+ Parameters

    + loadReference (boolean, optional) - Whether to load the referenced data for the clinical objects
        + Default: `false`.

+ Request JSON Query (application/json)

    + Body

            {
                "domain": "ehmp-order",
                "subDomain": "laboratory"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "patientUid": {
                        "type": "string",
                        "description": "Unique patient identifier"
                    },
                    "authorUid": {
                        "type": "string",
                        "description": "Object creator identifier"
                    },
                    "domain": {
                        "type": "string",
                        "description": "Resource domain that the clinical object represents (e.g. 'order', 'note')",
                        "enum": ["ehmp-observation", "ehmp-order", "ehmp-note", "ehmp-activity"]
                    },
                    "subDomain": {
                        "type": "string",
                        "description": "Resource subdomain of the clinical object data (e.g. for 'order', subdomain could be 'laboratory', 'radiology', etc.)",
                        "enum": ["immunization", "laboratory", "consult", "tiu", "addendum", "noteObject", "request", "labResult"]
                    },
                    "referenceId": {
                        "type": "string",
                        "description": "JDS URN identifier"
                    },
                    "ehmpState": {
                        "type": "string",
                        "description": "State of the clinical object, e.g. 'active'",
                        "enum": ["draft", "active", "deleted"]
                    },
                    "visit": {
                        "type": "object",
                        "description": "Visit context information",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "Visit location"
                            },
                            "serviceCategory": {
                                "type": "string",
                                "description": "Type of visit"
                            },
                            "dateTime": {
                                "type": "string",
                                "description": "Date/Time of visit"
                            }
                        }
                    }
                },
                "minProperties": 1
            }

+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "data": {
                    "items": [{
                        "uid": "urn:va:ehmp-order:9E7A:3:de305d54-75b4-431b-adb2-eb6b9e546014",
                        "patientUid": "urn:va:patient:9E7A:3:3",
                        "authorUid": "urn:va:user:9E7A:123",
                        "domain": "ehmp-order",
                        "subDomain": "laboratory",
                        "visit" :
                        {
                        "location": "urn:va:location:9E7A:1",
                        "serviceCategory": "PSB",
                        "dateTime": "20160101120000"
                        },
                        "referenceId": "",
                        "data": {
                            "labTestText": "Gas Panel - Arterial Cord",
                            "labCollSamp": "999",
                            "location": "32",
                            "specimen": "8759",
                        }
                    }]
                }
            }

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### List [GET {{{path}}}/get-clinical-object-list{?uid*}{&loadReference}]

List clinical objects.

+ Parameters

    + uid (string, optional) - The UID of one or more clinical objects (may repeat)
    + loadReference (boolean, optional) - Whether to load the referenced data for the clinical objects
        + Default: `false`

+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "data": {
                    "items": [{
                        "uid": "urn:va:ehmp-order:9E7A:3:de305d54-75b4-431b-adb2-eb6b9e546014",
                        "patientUid": "urn:va:patient:9E7A:3:3",
                        "authorUid": "urn:va:user:9E7A:123",
                        "domain": "ehmp-order",
                        "subDomain": "laboratory",
                        "visit" :
                        {
                        "location": "urn:va:location:9E7A:1",
                        "serviceCategory": "PSB",
                        "dateTime": "20160101120000"
                        },
                        "referenceId": "",
                        "data": {
                            "labTestText": "Gas Panel - Arterial Cord",
                            "labCollSamp": "999",
                            "location": "32",
                            "specimen": "8759",
                        }
                    }]
                }
            }

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Create [POST {{{path}}}]

Create a Clinical Object. The service will perform server-side validation of the required fields and return a **500** error if validation fails.  The following fields are considered mandatory:
* patientUid
* authorUid
* domain (Note: 'domain' **must** be present **and** be a registered domain)
* subDomain (Note: 'subDomain' **must** be present **and** be a registered subdomain)
* visit

+ Request JSON Body (application/json)

    + Body

            {
                "patientUid": "urn:va:patient:9E7A:3:3",
                "authorUid": "urn:va:user:9E7A:123",
                "domain": "ehmp-order",
                "subDomain": "laboratory",
                "visit":
                {
                   "location": "urn:va:location:9E7A:1",
                   "serviceCategory": "PSB",
                   "dateTime": "20160101120000"
                },
                "referenceId": "",
                "data": {
                    "labTestText": "Gas Panel - Arterial Cord",
                    "labCollSamp": "999",
                    "location": "32",
                    "specimen": "8759"
                }
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": ["patientUid", "authorUid", "domain", "subDomain", "visit"],
                "properties": {
                    "patientUid": {
                        "type": "string",
                        "description": "Unique patient identifier"
                    },
                    "authorUid": {
                        "type": "string",
                        "description": "Object creator identifier"
                    },
                    "domain": {
                        "type": "string",
                        "description": "Resource domain that the clinical object represents (e.g. 'order', 'note')",
                        "enum": ["ehmp-observation", "ehmp-order", "ehmp-note", "ehmp-activity"]
                    },
                    "subDomain": {
                        "type": "string",
                        "description": "Resource subdomain of the clinical object data (e.g. for 'order', subdomain could be 'laboratory', 'radiology', etc.)",
                        "enum": ["immunization", "laboratory", "consult", "tiu", "addendum", "noteObject", "request", "labResult"]
                    },
                    "visit": {
                        "type": "object",
                        "description": "Visit context information",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "Visit location"
                            },
                            "serviceCategory": {
                                "type": "string",
                                "description": "Type of visit"
                            },
                            "dateTime": {
                                "type": "string",
                                "description": "Date/Time of visit"
                            }
                        }
                    },
                    "referenceId": {
                        "type": "string",
                        "description": "Optional JDS URN identifier"
                    },
                    "ehmpState": {
                        "type": "string",
                        "description": "State of the clinical object, e.g. 'active'",
                        "enum": ["draft", "active", "deleted"]
                    },
                    "data": {
                        "type": "object",
                        "description": "Clinical object domain/sub-domain specific payload and content"
                    }
                }
            }

+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "data": {
                    "uid": "urn:va:ehmp-order:9E7A:3:de305d54-75b4-431b-adb2-eb6b9e546014",
                    "patientUid": "urn:va:patient:9E7A:3:3",
                    "authorUid": "urn:va:user:9E7A:123",
                    "domain": "ehmp-order",
                    "subDomain": "laboratory",
                    "visit" :
                    {
                       "location": "urn:va:location:9E7A:1",
                       "serviceCategory": "PSB",
                       "dateTime": "20160101120000"
                    },
                    "referenceId": "",
                    "data": {
                        "labTestText": "Gas Panel - Arterial Cord",
                        "labCollSamp": "999",
                        "location": "32",
                        "specimen": "8759"
                    }
                }
            }

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Retrieve [GET {{{path}}}/:resourceId{?loadReference}]

Retrieve a Clinical Object.

+ Parameters

    + resourceId (string, required) - The unique identifier of the Clinical Object of interest, returned by the 'CREATE' feature

    + loadReference (boolean, optional) - Whether to load the referenced data for the clinical object
        + Default: `false`

+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "data": {
                    "uid": "urn:va:ehmp-order:9E7A:3:de305d54-75b4-431b-adb2-eb6b9e546014",
                    "patientUid": "urn:va:patient:9E7A:3:3",
                    "authorUid": "urn:va:user:9E7A:123",
                    "domain": "ehmp-order",
                    "subDomain": "laboratory",
                    "visit" :
                    {
                       "location": "urn:va:location:9E7A:1",
                       "serviceCategory": "PSB",
                       "dateTime": "20160101120000"
                    },
                    "referenceId": "",
                    "data": {
                        "labTestText": "Gas Panel - Arterial Cord",
                        "labCollSamp": "999",
                        "location": "32",
                        "specimen": "8759"
                    }
                }
            }


:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Update [PUT {{{path}}}/:resourceId]

Update a Clinical Object. The service will perform server-side validation of the required fields and return a **500** error if validation fails.  The following fields are considered mandatory:
* patientUid
* authorUid
* domain (Note: 'domain' **must** be present **and** be a registered domain)
* subDomain (Note: 'subDomain' **must** be present **and** be a registered subdomain)
* visit

+ Parameters

    + resourceId (string, required) - The 'uid' attribute of the Clinical Object of interest, returned by the 'CREATE' feature

+ Request JSON Body (application/json)

    + Body

            {
                "uid": "urn:va:ehmp-order:9E7A:3:de305d54-75b4-431b-adb2-eb6b9e546014",
                "patientUid": "urn:va:patient:9E7A:3:3",
                "authorUid": "urn:va:user:9E7A:123",
                "domain": "ehmp-order",
                "subDomain": "laboratory",
                "visit" :
                {
                    "location": "urn:va:location:9E7A:1",
                    "serviceCategory": "PSB",
                    "dateTime": "20160101120000"
                },
                "referenceId": "",
                "data": {
                    "labTestText": "Gas Panel - Arterial Cord",
                    "labCollSamp": "999",
                    "location": "32",
                    "specimen": "8759"
                }
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "required": ["uid", "patientUid", "authorUid", "domain", "subDomain", "visit"],
                "properties": {
                    "patientUid": {
                        "type": "string",
                        "description": "Unique patient identifier"
                    },
                    "authorUid": {
                        "type": "string",
                        "description": "Object creator identifier"
                    },
                    "domain": {
                        "type": "string",
                        "description": "Resource domain that the clinical object represents (e.g. 'order', 'note')",
                        "enum": ["ehmp-observation", "ehmp-order", "ehmp-note", "ehmp-activity"]
                    },
                    "subDomain": {
                        "type": "string",
                        "description": "Resource subdomain of the clinical object data (e.g. for 'order', subdomain could be 'laboratory', 'radiology', etc.)",
                        "enum": ["immunization", "laboratory", "consult", "tiu", "addendum", "noteObject", "request", "labResult"]
                    },
                    "visit": {
                        "type": "object",
                        "description": "Visit context information",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "Visit location"
                            },
                            "serviceCategory": {
                                "type": "string",
                                "description": "Type of visit"
                            },
                            "dateTime": {
                                "type": "string",
                                "description": "Date/Time of visit"
                            }
                        }
                    },
                    "referenceId": {
                        "type": "string",
                        "description": "Optional JDS URN identifier"
                    },
                    "ehmpState": {
                        "type": "string",
                        "description": "State of the clinical object, e.g. 'active'",
                        "enum": ["draft", "active", "deleted"]
                    },
                    "data": {
                        "type": "object",
                        "description": "Clinical object domain/sub-domain specific payload and content"
                    }
                }
            }

+ Response 200 (application/json)

    + Body

            {
                "status": 200,
                "data": {
                    "uid": "urn:va:ehmp-order:9E7A:3:de305d54-75b4-431b-adb2-eb6b9e546014",
                    "patientUid": "urn:va:patient:9E7A:3:3",
                    "authorUid": "urn:va:user:9E7A:123",
                    "domain": "ehmp-order",
                    "subDomain": "laboratory",
                    "visit" :
                    {
                        "location": "urn:va:location:9E7A:1",
                        "serviceCategory": "PSB",
                        "dateTime": "20160101120000"
                    },
                    "referenceId": "",
                    "data": {
                        "labTestText": "Gas Panel - Arterial Cord",
                        "labCollSamp": "999",
                        "location": "32",
                        "specimen": "8759"
                    }
                }
            }

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



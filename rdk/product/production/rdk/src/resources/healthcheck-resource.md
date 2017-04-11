# Group Health Check

## Health Check [{{{path}}}]

Check the status of the RDK server and its dependencies.

### Quick Healthy Check [GET {{{path}}}/healthy]

Return whether the RDK server is healthy.

+ Response 200 (application/json)

    + Body

            {
                "message": "true",
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/healthcheck_healthy-GET-200.jsonschema)


### Detailed Health Check [GET {{{path}}}/detail{?fields}]

Return details about the health of the RDK server and its dependencies.

+ Parameters

    :[fields]({{{common}}}/parameters/fields.md)

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "jds": {
                        "healthy": true,
                        "type": "subsystem",
                        "check": true
                    },
                    "jdsSync": {
                        "healthy": true,
                        "type": "subsystem",
                        "check": true
                    },
                    "patientrecord": {
                        "healthy": true,
                        "type": "subsystem",
                        "check": true
                    },
                    "asu": {
                        "healthy": true,
                        "type": "subsystem"
                    },
                    "authorization": {
                        "healthy": true,
                        "type": "subsystem",
                        "check": true
                    },
                    "user-service-userlist": {
                        "healthy": true,
                        "type": "resource"
                    },
                    "synchronization-load": {
                        "healthy": true,
                        "type": "resource",
                        "subsystems": {
                            "patientrecord": true,
                            "jdsSync": true
                        }
                    },
                    "isHealthy": true
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/healthcheck_detail-GET-200.jsonschema)


### Detailed Health Check Without Updating [GET {{{path}}}/noupdate{?fields}]

Return details about the health of the RDK server and its dependencies without re-querying the health—instead, the most recent status is returned.

+ Parameters

    :[fields]({{{common}}}/parameters/fields.md)

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "jds": {
                        "healthy": true,
                        "type": "subsystem",
                        "check": true
                    },
                    "jdsSync": {
                        "healthy": true,
                        "type": "subsystem",
                        "check": true
                    },
                    "patientrecord": {
                        "healthy": true,
                        "type": "subsystem",
                        "check": true
                    },
                    "asu": {
                        "healthy": true,
                        "type": "subsystem"
                    },
                    "authorization": {
                        "healthy": true,
                        "type": "subsystem",
                        "check": true
                    },
                    "user-service-userlist": {
                        "healthy": true,
                        "type": "resource"
                    },
                    "synchronization-load": {
                        "healthy": true,
                        "type": "resource",
                        "subsystems": {
                            "patientrecord": true,
                            "jdsSync": true
                        }
                    },
                    "isHealthy": true
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/healthcheck_detail-GET-200.jsonschema)


### Detailed Health Check HTML Report [GET {{{path}}}/detail/html]

Return details about the health of the RDK server and its dependencies in HTML format.

+ Response 200 (text/html)


### Systems with Health Checks [GET {{{path}}}/checks{?fields}]

Return the systems and dependencies of the RDK server that can be checked for health.

+ Parameters

    :[fields]({{{common}}}/parameters/fields.md)

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "jds": {
                        "name": "jds",
                        "type": "subsystem",
                        "interval": 100000
                    },
                    "jdsSync": {
                        "name": "jdsSync",
                        "type": "subsystem",
                        "interval": 100000
                    },
                    "patientrecord": {
                        "name": "patientrecord",
                        "type": "subsystem",
                        "interval": 100000
                    },
                    "authorization": {
                        "name": "authorization",
                        "type": "subsystem",
                        "interval": 5000
                    },
                    "user-service-userlist": {
                        "name": "user-service-userlist",
                        "type": "resource"
                    },
                    "synchronization-load": {
                        "name": "synchronization-load",
                        "type": "resource",
                        "subsystems": ["patientrecord", "jdsSync"]
                    }
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/healthcheck_checks-GET-200.jsonschema)

# Group Patient

## Patient record [{{{path}}}]

### Patient record {domain} [GET {{{path}}}/domain/{domain}{?pid}{&uid}{&start}{&limit}{&filter}{&order}{&range}{&filterList}{&filterFields}{&callType}{&vler_uid}]

Get record data of one domain for a patient

+ Parameters

    + domain (enum[string], required) - domain

        + Members
            + `accession`
            + `allergy`
            + `appointment`
            + `consult`
            + `cpt`
            + `document`
            + `document-view`
            + `education`
            + `exam`
            + `factor`
            + `image`
            + `immunization`
            + `lab`
            + `med`
            + `mh`
            + `newsfeed`
            + `obs`
            + `order`
            + `parent-documents`
            + `patient`
            + `pov`
            + `problem`
            + `procedure`
            + `ptf`
            + `rad`
            + `skin`
            + `surgery`
            + `treatment`
            + `visit`
            + `vital`
            + `vlerdocument`


    :[pid]({{{common}}}/parameters/pid.md)

    :[uid]({{{common}}}/parameters/uid.md)

    :[start]({{{common}}}/parameters/start.md)

    :[limit]({{{common}}}/parameters/limit.md)

    :[filter]({{{common}}}/parameters/filter.md)

    :[order]({{{common}}}/parameters/order.md)
    
    :[range]({{{common}}}/parameters/range.md)
    
    + filterList (array, optional) - the text to search for in JDS 
     
    + filterFields (array, optional) - the fields from JDS to search against
    
    + callType (string, optional) - the type of vlerdocument call

        + Members
            + `coversheet`
            + `modal`
            + `vler_list`
            + `vler_modal`

    + vler_uid (string, optional) - VLER uid to filter only one item for modal


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

### Patient record {domain} [POST {{{path}}}/domain/{domain}{?pid}]

Get record data of one domain for a patient. Same results as the GET resources, but the request's query parameters are now body parameters.

+ Parameters

    + domain (enum[string], required) - domain

        + Members
            + `accession`
            + `allergy`
            + `appointment`
            + `consult`
            + `cpt`
            + `document`
            + `document-view`
            + `education`
            + `exam`
            + `factor`
            + `image`
            + `immunization`
            + `lab`
            + `med`
            + `mh`
            + `newsfeed`
            + `obs`
            + `order`
            + `parent-documents`
            + `patient`
            + `pov`
            + `problem`
            + `procedure`
            + `ptf`
            + `rad`
            + `skin`
            + `surgery`
            + `treatment`
            + `visit`
            + `vital`
            + `vlerdocument`

+ Request JSON message (application/json)

    + Body

            {
                "pid": "9E7A;3",
                "uid": "urn:va:document:9E7A:3:123",
                "start": 0,
                "limit": 10,
                "order": "kind ASC",
                "callType": "coversheet",
                "filter": "eq(foo,bar)",
                "range": "19901231..20151231",
                "filterList": ["active", "complete"],
                "filterFields": ["status", "codes", "statusDisplayName"]
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "filter": {
                        "type": "string"
                    },
                    "pid": {
                        "type": "string",
                        "pattern": "^([a-zA-Z0-9]+);([a-zA-Z0-9]+)$|^([0-9]+)V([0-9]+)$"
                    },
                    "uid": {
                        "type": "string",
                        "pattern": "^([^?/\",()=:]+:[^?/\",()=:]+:[^?/\",()=:]+(:[^?/\",()=:]+)+)$"
                    },
                    "start": {
                        "type": "integer"
                    },
                    "limit": {
                        "type": "integer"
                    },
                    "order": {
                        "type": "string",
                        "pattern": "(asc|ASC|desc|DESC)"
                    },
                    "range": {
                        "type": "string"
                    },
                    "filterList": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "fitlerFields": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "callType": {
                        "type": "string",
                        "enum": [
                            "coversheet",
                            "modal",
                            "vler_list",
                            "vler_modal"
                        ]
                    },
                    "vler_uid": {
                        "type": "string"
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


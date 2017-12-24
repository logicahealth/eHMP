# Group Patient

## Patient record search [{{{path}}}]

### Text [GET {{{path}}}/text{?pid}{&query}{&types*}{&start}{&limit}{&returnSynonyms}]

Perform a text search on records for a patient

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + query (string, required) - text to search

    + types (enum[string], optional) - domains to search

        + Members
            + `default`
            + `med`
            + `order`
            + `document`
            + `vital`
            + `result`
            + `lab`
            + `problem`
            + `ehmp-activity`
            + `vlerdocument`

    :[start]({{{common}}}/parameters/start.md)

    :[limit]({{{common}}}/parameters/limit.md)
    
    + returnSynonyms (boolean, optional) - true/false whether synonyms should be returned as part of result

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "altQuery": "ssss",
                    "corrections": [],
                    "elapsed": 2,
                    "facets": {
                        "T-1m": 2,
                        "T-1y": 2,
                        "T-24h": 2,
                        "T-2y": 2,
                        "T-3m": 2,
                        "T-72h": 2,
                        "T-7d": 2,
                        "all": 2,
                        "domain:procedure": 2,
                        "domain:vital": 2
                    },
                    "filters": {},
                    "foundItemsTotal": 2,
                    "items": [],
                    "mode": "ssss",
                    "original": "ssss",
                    "query": "ssss",
                    "unfilteredTotal": 2
                },
                "method": "ssss",
                "params": {
                    "limit": 10,
                    "pid": "SITE;3",
                    "pidJoinedList": "ssss",
                    "query": "ssss",
                    "start": 2,
                    "types": "ssss"
                },
                "status": 200,
                "success": true
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_search_text-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Suggest [GET {{{path}}}/suggest{?pid}{&query}]

Get text search suggestions

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + query (string, required) - text to search

        Pattern: `.{3,}`



+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "currentItemCount": 2,
                    "items": [],
                    "itemsPerPage": 2,
                    "startIndex": 2,
                    "totalItems": 2
                },
                "id": "SITE;12345",
                "status": 200,
                "success": true
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_search_suggest-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

+ Response 404 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 2,
                        "message": "ssss"
                    }
                },
                "status": 404
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_search_suggest-GET-404.jsonschema)

:[Response 500]({{{common}}}/responses/500.md)


### Detail trend [GET {{{path}}}/detail/trend{?pid}{&uid}]

Get text search result detail where the items in a group are data points that should be graphed

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    :[uid]({{{common}}}/parameters/uid.md example:"urn:va:med:SITE:8:35739" required:"required")


+ Response 200 (application/json)

    + Body

            {
                "apiVersion": "ssss",
                "data": {
                    "currentItemCount": 2,
                    "items": [],
                    "totalItems": 2,
                    "updated": 2
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_search_detail_trend-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Detail document [GET {{{path}}}/detail/document{?pid}{&query}{&group.field}{&group.value}]

Get text search result detail where the items in a group are text documents

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + query (string, required) - text to search

    + group.field (string, required)

    + group.value (string, required)


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": {
                        "highlights": {},
                        "results": []
                    }
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_search_detail_document-GET-200.jsonschema)

+ Response 400 (application/json)

    + Body

            {
                "data": {
                    "error": {
                        "code": 500,
                        "message": "The required parameter \"pid\" is missing."
                    }
                },
                "status": 400
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_search_detail_document-GET-400.jsonschema)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


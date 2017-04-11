# Group Patient search

## Patient search [{{{path}}}]

### Full name [GET {{{path}}}/full-name{?name.full}{&start}{&limit}{&order}{&rows.max}]

Search for a patient by full name

+ Parameters

    + name.full (string, required) - name of patient

        Pattern: `^([^<>%$"@!~#%&*()?\/;:]*)$`


    :[start]({{{common}}}/parameters/start.md)

    :[limit]({{{common}}}/parameters/limit.md)

    :[order]({{{common}}}/parameters/order.md)

    + rows.max (number, optional) - error if returned item count exceeds this


+ Response 200 (application/json)

    + Body

            {
                "apiVersion": "ssss",
                "data": {
                    "currentItemCount": 2,
                    "items": [],
                    "itemsPerPage": 2,
                    "pageIndex": 2,
                    "startIndex": 2,
                    "totalItems": 2,
                    "totalPages": 2,
                    "updated": 2
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient-search_full-name-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)
:[Response 404]({{{common}}}/responses/404.md)
:[Response 500]({{{common}}}/responses/500.md)


### Last5 [GET {{{path}}}/last5{?last5}{&start}{&limit}{&order}]

Search for a patient by last5: first letter of last name + last 4 digits of SSN

+ Parameters

    + last5 (string, required) - first letter of last name + last 4 digits of SSN

        Pattern: `^[a-zA-Z]\d{4}$`


    + start (number, optional) - start showing results from this 0-based index

    + limit (number, optional) - show this many results

    + order (string, optional) - Field to sort by and order

        Pattern: `^\w+ (asc|desc)$`



+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "currentItemCount": 2,
                    "items": [],
                    "totalItems": 2,
                    "updated": 2
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient-search_last5-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Pid [GET {{{path}}}/pid{?pid}]

Search for a patient by pid

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)


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

            :[Schema]({{{common}}}/schemas/patient-search_pid-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Last Workspace [GET {{{path}}}/last-workspace{?pid}]

Search for a patient's last workspace

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)


+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


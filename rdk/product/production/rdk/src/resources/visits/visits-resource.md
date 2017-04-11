# Group Visits

## Visits [{{{path}}}]

### Providers [GET {{{path}}}/providers{?facility.code}{&facility.name}{&order}{&fields}]

+ Parameters

    + facility.code (string, required) - facility code

    + facility.name (string, optional) - facility name

    :[order]({{{common}}}/parameters/order.md)

    :[fields]({{{common}}}/parameters/fields.md)


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

            :[Schema]({{{common}}}/schemas/visits_providers-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Locations [GET {{{path}}}/locations{?facility.code}{&provider.name}{&limit}{&order}{&fields}]

+ Parameters

    + facility.code (string, required) - facility code

    + provider.name (string, optional) - provider name

    :[limit]({{{common}}}/parameters/limit.md)

    :[order]({{{common}}}/parameters/order.md)

    :[fields]({{{common}}}/parameters/fields.md)


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

            :[Schema]({{{common}}}/schemas/visits_locations-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Appointments [GET {{{path}}}/appointments{?pid}{&date.start}{&date.end}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    :[date.start]({{{common}}}/parameters/date.start.md)

    :[date.end]({{{common}}}/parameters/date.end.md)


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

            :[Schema]({{{common}}}/schemas/visits_appointments-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Admissions [GET {{{path}}}/admissions{?pid}{&limit}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    :[limit]({{{common}}}/parameters/limit.md)


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

            :[Schema]({{{common}}}/schemas/visits_admissions-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


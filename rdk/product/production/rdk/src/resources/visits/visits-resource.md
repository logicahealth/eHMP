# Group Visits

## Visits [{{{path}}}]

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


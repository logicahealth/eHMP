# Group Immunizations

## Immunization crud [{{{path}}}]

### Immunization Types [GET {{{path}}}/immunization-types]

List immunization types

+ Response 200 (application/json)

    + Body

            {
                "data": [],
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/immunizations_immunization-types-GET-200.jsonschema)


### Lot Numbers [GET {{{path}}}/lot-numbers{?uri}]

List lot numbers for an immunization type

+ Parameters

    + uri (string, required) - The URI value of the immunization type


+ Response 200 (application/json)

    + Body

            {
                "data": [],
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/immunizations_lot-numbers-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Anatomical Locations [GET {{{path}}}/anatomical-locations]

List anatomical locations for immunizations

+ Response 200 (application/json)

    + Body

            {
                "data": [],
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/immunizations_anatomical-locations-GET-200.jsonschema)


### Manufacturers [GET {{{path}}}/manufacturers]

List manufacturers for immunizations

+ Response 200 (application/json)

    + Body

            {
                "data": [],
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/immunizations_manufacturers-GET-200.jsonschema)


### Information Sources [GET {{{path}}}/information-sources]

List information sources for immunizations

+ Response 200 (application/json)

    + Body

            {
                "data": [],
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/immunizations_information-sources-GET-200.jsonschema)


### Route Of Administration [GET {{{path}}}/route-of-administration]

List administration routes for immunizations

+ Response 200 (application/json)

    + Body

            {
                "data": [],
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/immunizations_route-of-administration-GET-200.jsonschema)


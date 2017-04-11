# Group Facility

## Facility [{{{path}}}]

### List VistA Instances [GET {{{path}}}/list]

Return the list of vistas available

#### Notes

Is a readonly resource that returns an array.

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "items": [
                        {
                            "name": "KODAK",
                            "division": "500",
                            "siteCode": "C877"
                        },
                        {
                            "name": "PANORAMA",
                            "division": "500",
                            "siteCode": "9E7A"
                        }
                    ]
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/authentication_list-GET-200.jsonschema)
# Group Pick List

## Wards lookup [/wards-fetch-list{?site}]

Returns a list of ward locations.

### Notes

ORQPT WARDS

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

### GET

+ Response 200 (application/json)

    + Body

            {
                "data": [
                    {
                      "displayName": "2-Intermed",
                      "name": "2-INTERMED",
                      "uid": "urn:va:location:9E7A:w12"
                    },
                    {
                      "displayName": "3 North Gastro",
                      "name": "3 NORTH GASTRO",
                      "uid": "urn:va:location:9E7A:w7"
                    },
                    {
                      "displayName": "3 North Gu",
                      "name": "3 NORTH GU",
                      "uid": "urn:va:location:9E7A:w6"
                    },
                    {
                      "displayName": "3 North Surg",
                      "name": "3 NORTH SURG",
                      "uid": "urn:va:location:9E7A:w5"
                    },
                    {
                      "displayName": "3E North",
                      "name": "3E NORTH",
                      "uid": "urn:va:location:9E7A:w33"
                    }
                ],
                "status": 200
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)



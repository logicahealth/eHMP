# Group Pick List

## Clinics NEWLOC lookup [/clinics-newloc-fetch-list{?site}]

Returns a list of clinic locations.

### Notes

ORWU1 NEWLOC

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

### GET

+ Response 200 (application/json)

    + Body

            {
                "data": [
                    {
                      "displayName": "Audiology",
                      "name": "AUDIOLOGY",
                      "uid": "urn:va:location:SITE:64"
                    },
                    {
                      "displayName": "Cardiology",
                      "name": "CARDIOLOGY",
                      "uid": "urn:va:location:SITE:195"
                    },
                    {
                      "displayName": "Comp and Pen",
                      "name": "COMP AND PEN",
                      "uid": "urn:va:location:SITE:137"
                    },
                    {
                      "displayName": "Cwt Clinic",
                      "name": "CWT CLINIC",
                      "uid": "urn:va:location:SITE:246"
                    },
                    {
                      "displayName": "Dental",
                      "name": "DENTAL",
                      "uid": "urn:va:location:SITE:228"
                    }
                ],
                "status": 200
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)


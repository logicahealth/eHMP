# Group Pick List

## Clinics lookup [/clinics-fetch-list{?site}]

DIRECT RPC CALL - Clinics lookup - calls ORWU CLINLOC

### Notes

ORWU CLINLOC

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
                        "uid": "urn:va:location:9E7A:64"
                    },
                    {
                        "displayName": "Cardiology",
                        "name": "CARDIOLOGY",
                        "uid": "urn:va:location:9E7A:195"
                    },
                    {
                        "displayName": "Comp and Pen",
                        "name": "COMP AND PEN",
                        "uid": "urn:va:location:9E7A:137"
                    },
                    {
                        "displayName": "Cwt Clinic",
                        "name": "CWT CLINIC",
                        "uid": "urn:va:location:9E7A:246"
                    },
                    {
                        "displayName": "Dental",
                        "name": "DENTAL",
                        "uid": "urn:va:location:9E7A:228"
                    },
                    {
                        "displayName": "Dermatology",
                        "name": "DERMATOLOGY",
                        "uid": "urn:va:location:9E7A:62"
                    },
                    {
                        "displayName": "Diabetic",
                        "name": "DIABETIC",
                        "uid": "urn:va:location:9E7A:285"
                    },
                    {
                        "displayName": "Diabetic Teleret Reader Local",
                        "name": "DIABETIC TELERET READER LOCAL",
                        "uid": "urn:va:location:9E7A:191"
                    },
                    {
                        "displayName": "TESTCLINIC001",
                        "name": "TESTCLINIC001",
                        "uid": "urn:va:location:9E7A:441"
                    }
                ],
                "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/clinics-fetch-list-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)



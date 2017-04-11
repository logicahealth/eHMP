# Group Pick List

## Clinics lookup [/clinics-fetch-list{?site}{&fields}]

DIRECT RPC CALL - Clinics lookup - calls ORWU CLINLOC

### Notes

ORWU CLINLOC

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    :[fields]({{{common}}}/parameters/fields.md)

### GET

+ Response 200 (application/json)

    + Body

            {
                "data": [
                    {
                        "ien": "64",
                        "name": "AUDIOLOGY"
                    },
                    {
                        "ien": "195",
                        "name": "CARDIOLOGY"
                    },
                    {
                        "ien": "137",
                        "name": "COMP AND PEN"
                    },
                    {
                        "ien": "246",
                        "name": "CWT CLINIC"
                    },
                    {
                        "ien": "228",
                        "name": "DENTAL"
                    },
                    {
                        "ien": "62",
                        "name": "DERMATOLOGY"
                    },
                    {
                        "ien": "285",
                        "name": "DIABETIC"
                    },
                    {
                        "ien": "191",
                        "name": "DIABETIC TELERET READER LOCAL"
                    },
                    {
                        "ien": "193",
                        "name": "DIABETIC TELERET READER REMOTE"
                    },
                    {
                        "ien": "190",
                        "name": "DIABETIC TELERETINAL IMAGER"
                    },
                    {
                        "ien": "426",
                        "name": "EMERGENCY ROOM"
                    },
                    {
                        "ien": "133",
                        "name": "EMPLOYEE HEALTH"
                    },
                    {
                        "ien": "422",
                        "name": "ENDOCRINE"
                    },
                    {
                        "ien": "23",
                        "name": "GENERAL MEDICINE"
                    },
                    {
                        "ien": "298",
                        "name": "GENERAL SURGERY"
                    },
                    {
                        "ien": "935",
                        "name": "GYNECOLOGIST CLINIC"
                    },
                    {
                        "ien": "229",
                        "name": "HEMATOLOGY"
                    },
                    {
                        "ien": "128",
                        "name": "MAMMOGRAM"
                    },
                    {
                        "ien": "17",
                        "name": "MENTAL HEALTH"
                    },
                    {
                        "ien": "438",
                        "name": "MENTAL HEALTH GROUP THERAPY"
                    },
                    {
                        "ien": "26",
                        "name": "MENTAL HYGIENE-OPC"
                    },
                    {
                        "ien": "430",
                        "name": "NEUROLOGY"
                    },
                    {
                        "ien": "432",
                        "name": "NEUROSURGERY"
                    },
                    {
                        "ien": "114",
                        "name": "NUCLEAR MEDICINE"
                    },
                    {
                        "ien": "234",
                        "name": "OBSERVATION"
                    },
                    {
                        "ien": "437",
                        "name": "OPHTHALMOLOGY"
                    },
                    {
                        "ien": "433",
                        "name": "PHYSICAL THERAPY"
                    },
                    {
                        "ien": "127",
                        "name": "PLASTIC SURGERY"
                    },
                    {
                        "ien": "233",
                        "name": "PODIATRY"
                    },
                    {
                        "ien": "32",
                        "name": "PRIMARY CARE"
                    },
                    {
                        "ien": "435",
                        "name": "PRIMARY CARE TELEPHONE"
                    },
                    {
                        "ien": "427",
                        "name": "REHAB MEDICINE"
                    },
                    {
                        "ien": "31",
                        "name": "SOCIAL WORK"
                    },
                    {
                        "ien": "431",
                        "name": "SPEECH PATHOLOGY"
                    },
                    {
                        "ien": "239",
                        "name": "SURGICAL CLINIC"
                    },
                    {
                        "ien": "441",
                        "name": "TESTCLINIC001"
                    },
                    {
                        "ien": "442",
                        "name": "TESTCLINIC002"
                    },
                    {
                        "ien": "443",
                        "name": "TESTCLINIC003"
                    },
                    {
                        "ien": "444",
                        "name": "TESTCLINIC004"
                    },
                    {
                        "ien": "445",
                        "name": "TESTCLINIC005"
                    },
                    {
                        "ien": "446",
                        "name": "TESTCLINIC006"
                    },
                    {
                        "ien": "447",
                        "name": "TESTCLINIC007"
                    },
                    {
                        "ien": "448",
                        "name": "TESTCLINIC008"
                    },
                    {
                        "ien": "449",
                        "name": "TESTCLINIC009"
                    }
                ],
                "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/clinics-fetch-list-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)



# Group Patient

## Patient Metadata [{{{path}}}/{?pid}]

+ Parameters

    + pid (string, required) - the patient's pid


### GET

#### Notes

This resource returns a 202 response when the patient exists but no metadata has been saved for the patient.

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "modifiedBy": "urn:va:user:9E7A:10000000270",
                    "modifiedOn": "2015-12-19T23:00:33.488Z",
                    "val": {
                        "this": "that"
                    }
                },
                "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/patient_record_metadata_-200.jsonschema)

+ Response 202 (application/json)

    + Body

            {
                "status": 202
            }

    + Schema

            :[schema]({{{common}}}/schemas/patient_record_metadata_-GET-202.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)
:[Response 500]({{{common}}}/responses/500.md)


### PUT

+ Request JSON Body (application/json)

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "modifiedBy": "urn:va:user:9E7A:10000000270",
                    "modifiedOn": "2015-12-19T23:00:33.488Z",
                    "val": {
                        "this": "that"
                    }
                },
                "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/patient_record_metadata_-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)
:[Response 404]({{{common}}}/responses/404.md)
:[Response 500]({{{common}}}/responses/500.md)


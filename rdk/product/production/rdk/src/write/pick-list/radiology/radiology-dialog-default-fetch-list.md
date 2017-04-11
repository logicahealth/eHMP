# Group Pick List

## Radiology dialog default [/radiology-dialog-default{?site}{&patientDFN}{&imagingType}{&anEventDiv}]

DIRECT RPC CALL - Loads dialog data (lists & defaults) for a radiology order.

### Notes

ORWDRA32 DEF

+ Parameters

    :[site]({{{common}}}/parameters/site.md)

    + patientDFN: `100022` (number, required) - The patient's DFN

    + imagingType: `35` (number, required) - he imaging type

    + anEventDiv (string, optional) - An Event Div

### GET

+ Response 200 (application/json)

    + Body

            {
                "data": [
                    {
                        "categoryName": "ShortList"
                    },
                    {
                        "categoryName": "Common Procedures",
                        "values": [
                            {
                                "ien": "2772",
                                "name": "CT ABDOMEN W&W/O CONT",
                                "requiresRadiologistApproval": true
                            },
                            {
                                "ien": "2771",
                                "name": "CT ABDOMEN W/CONT",
                                "requiresRadiologistApproval": false
                            }
                        ]
                    }
                ],
                "status": 200
            }

    + Schema

            :[schema]({{{common}}}/schemas/radiology-dialog-default-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md name:"site")

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



# Group Patient

## Patient record complexnote-html [{{{path}}}/html{?pid}{&uid}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    :[uid]({{{common}}}/parameters/uid.md example:"urn:va:document:DOD:0000000003:1000000648" required:"required")


### Get DoD Complex Note, HTML [GET]

Get the DoD complex note represented in HTML for a given document on a patient

+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "complexNote": "ssss"
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_complex-note_html-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)

## Patient record complexnote-pdf [{{{path}}}/pdf{?pid}{&uid}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    :[uid]({{{common}}}/parameters/uid.md example:"urn:va:document:DOD:0000000003:1000000648" required:"required")


### Get DoD Complex Note, PDF [GET]

Get the DoD complex note represented as a PDF for a given document on a patient

+ Response 200 (application/pdf)


:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



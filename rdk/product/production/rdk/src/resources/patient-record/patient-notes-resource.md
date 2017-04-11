# Group Patient

## Patient record notes [{{{path}}}{?pid}{&localPid}{&fields}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + localPid (string, required) - local patient id

        Pattern: `^([a-zA-Z0-9]+);([a-zA-Z0-9]+)$|^([0-9]+)V([0-9]+)$`


    :[fields]({{{common}}}/parameters/fields.md)


### Get [GET]

Get notes data for a patient

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

+ Response 500 (application/json)

    + Body

            {
                "data":[
                    "Unable to reach pJDS"
                ],
                "status":500
            }

    + Schema

            :[schema]({{{common}}}/schemas/patient_record_notes-GET-500.jsonschema)


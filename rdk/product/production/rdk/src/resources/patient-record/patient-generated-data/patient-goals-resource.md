# Group Patient

## Patient entered goals [{{{path}}}{?subject.identifier}{&type}{&start}{&limit}{&fields}]

+ Parameters

    :[subject.identifier]({{{common}}}/parameters/subject.identifier.md)

    + type (string, optional) - all documents if not present. Discharge summary notes if equals to '34745-0'. For all others use '34765-8'

    :[start]({{{common}}}/parameters/start.md)

    :[limit]({{{common}}}/parameters/limit.md)

    :[fields]({{{common}}}/parameters/fields.md)


### Patient generated [GET]

+ Response 200 (application/json)

    + Body

            {
                "data": [],
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_patient-entered-goals-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


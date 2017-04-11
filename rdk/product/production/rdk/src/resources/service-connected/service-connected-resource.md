# Group Patient

## Patient service connected s [{{{path}}}]

### Ervice Connected [GET {{{path}}}/serviceconnectedrateddisabilities{?pid}{&fields}]

Populates service connection & rated disabilities for a patient

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "disability": "ssss",
                    "scPercent": "ssss",
                    "serviceConnected": "ssss"
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_service-connected_serviceconnectedrateddisabilities-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### C Button Selection [GET {{{path}}}/serviceconnectedserviceexposurelist{?pid}{&fields}]

Indicates whether corresponding form fields should be enabled.

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    :[fields]({{{common}}}/parameters/fields.md)


+ Response 200 (application/json)

    + Body

            {
                "data": {
                    "exposure": []
                },
                "status": 200
            }

    + Schema

            :[Schema]({{{common}}}/schemas/patient_record_service-connected_serviceconnectedserviceexposurelist-GET-200.jsonschema)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


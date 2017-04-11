# Group Patient

## Patient record note objects [{{{path}}}{?pid}{&visitLocation}{&visitDateTime}{&visitServiceCategory}]

+ Parameters

    :[pid]({{{common}}}/parameters/pid.md)

    + visitLocation (string, required) - visit location of the note objects

        Pattern: `^urn:va:location:([a-zA-Z0-9]+):([a-zA-Z]?)([0-9]+)$`

    + visitDateTime (string, required) - visit date/time of the note objects in YYYYMMDDHHmmss

        Pattern: \d{14}

    + visitServiceCategory (string, required) - visit service category of the note objects

        Pattern: (E|A|X|T|I|D)


### Get [GET]

Get note object data for an author and visit context

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


# Group Numeric Lab Results

## Numeric Lab Results API [{{{path}}}]

This API provides numeric lab results resources.  

### Save Note Object [POST {{{path}}}/save-note-object]

First, find Clinical Object in pJDS.  If not found, create new Clinical Object.  Lastly, create a note object in pJDS.

+ Request JSON Body (application/json)

    + Body

            {
                "referenceId": "urn:va:lab:9E7A:8:CH;6859185.83987;381",
                "patientUid": "urn:va:patient:9E7A:100615:100615",
                "authorUid": "urn:va:user:9E7A:10000000238",
                "visit": {
            	    "location": "urn:va:location:9E7A:285",
                    "serviceCategory": "PSB",
                    "dateTime": "20160102123040"
                },
                "data": {
                    "madlib": null,
            	    "annotation": "bar",
            	    "problemRelationship": "urn:va:problem:9E7A:100615:183"
                }
            }
    

+ Response 200 (application/json)

    + Body

            {
              "data": {
                "status": 200,
                "data": "http://IP             /clinicobj/urn:va:ehmp-note:9E7A:100615:67f4ce62-8f0f-4c89-9ec0-4ad83a3645ef"
              },
              "status": 200
            }

:[Response 400]({{{common}}}/responses/400.md)

:[Response 500]({{{common}}}/responses/500.md)


# Group Patient

## Notes [{{{path}}}]

### Add [POST]

Add a new unsigned note for a patient to single VistA

+ Request JSON Message (application/json)

    + Body

            {
                "_labelsForSelectedValues": {},
                "app": "ehmp",
                "author": "PROVIDER,EIGHT",
                "authorDisplayName": "Provider,Eight",
                "authorUid": "urn:va:user:9E7A:991",
                "derivReferenceDate": "02/03/2016",
                "derivReferenceTime": "11:16",
                "documentClass": "PROGRESS NOTES",
                "documentDefUid": "urn:va:doc-def:9E7A:8",
                "documentDefUidUnique": "urn:va:doc-def:9E7A:8---ADVANCE_DIRECTIVE---all",
                "documentTypeName": "Progress Note",
                "encounterDateTime": "",
                "encounterDisplayName": "7A GEN MED",
                "encounterName": "7A GEN MED",
                "entered": "20160204094153",
                "formUid": "0",
                "isInterdisciplinary": "false",
                "lastSavedDisplayTime": null,
                "lastSavedTime": "20160204094153",
                "lastUpdateTime": "20160204094153",
                "localId": null,
                "localTitle": "ADVANCE DIRECTIVE",
                "nationalTitle": {
                    "name": "",
                    "vuid": ""
                },
                "patientBirthDate": "19350407",
                "patientIcn": "10108V420871",
                "patientName": "Eight,Patient",
                "patientStatus": "INPATIENT",
                "pid": "9E7A;3",
                "processInstanceId": "354",
                "referenceDateTime": "201602031116",
                "signedDateTime": null,
                "signer": null,
                "signerDisplayName": null,
                "signerUid": null,
                "siteHash": "9E7A",
                "status": "UNSIGNED",
                "statusDisplayName": "Unsigned",
                "summary": "",
                "text": [{
                    "author": "PROVIDER,EIGHT",
                    "authorDisplayName": "PROVIDER,EIGHT",
                    "authorUid": "urn:va:user:9E7A:991",
                    "content": "ggfsfafdfaf",
                    "dateTime": "2016-02-04T09:41:53-05:00",
                    "signer": null,
                    "signerDisplayName": null,
                    "signerUid": null,
                    "status": "UNSIGNED"
                }],
                "uid": "5f4defc0-ca91-11e5-9db3-c3cbc38cef9f",
                "updated": "2016-02-03T11:15:42-05:00",
                "value": true,
                "id": "5f4defc0-ca91-11e5-9db3-c3cbc38cef9f",
                "itemUniqueID": "5f4defc0-ca91-11e5-9db3-c3cbc38cef9f_undefined",
                "displayGroup": "unsigned",
                "derivBody": "gg",
                "deriv_isEditForm": true
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "_labelsForSelectedValues": {
                        "type": "object"
                    },
                    "app": {
                        "type": "string",
                        "description": "Either be 'ehmp' or 'vista'. Used to determine the origin of the unsigned note"
                    },
                    "authorDisplayName": {
                        "type": "string",
                        "description": "The formatted name of the note author name"
                    },
                    "authorUid": {
                        "type": "string",
                        "description": "The unique identifier for the author"
                    },
                    "derivReferenceDate": {
                        "type": "string",
                        "description": "User entered date of note"
                    },
                    "derivReferenceTime": {
                        "type": "string",
                        "description": "User entered time of note"
                    },
                    "documentClass": {
                        "type": "string",
                        "description": "The document class of the note"
                    },
                    "documentDefUid": {
                        "type": "string",
                        "description": "Note title UID"
                    },
                    "documentDefUidUnique": {
                        "type": "string",
                        "description": "Note title unique UID"
                    },
                    "documentTypeName": {
                        "type": "string",
                        "description": "Document class type name"
                    },
                    "encounterDateTime": {
                        "type": "string",
                        "description": "Visit date and time in YYYYMMDDHHmm"
                    },
                    "encounterDisplayName": {
                        "type": "string",
                        "description": "Visit display name"
                    },
                    "encounterName": {
                        "type": "string",
                        "description": "Visit name"
                    },
                    "entered": {
                        "type": "string",
                        "description": "Note creation date"
                    },
                    "formUid": {
                        "type": "string",
                        "description": "Used for e-signature form"
                    },
                    "isInterdisciplinary": {
                        "type": "string",
                        "description": "Boolean to determine if the note is interdisciplinary"
                    },
                    "lastSavedDisplayTime": {
                        "type": "string",
                        "description": "Last saved timestamp in display format"
                    },
                    "lastSavedTime": {
                        "type": "string",
                        "description": "Last saved timestamp in YYYYMMDDHHmmss"
                    },
                    "lastUpdateTime": {
                        "type": "string",
                        "description": "Timestamp from VxSync"
                    },
                    "localId": {
                        "type": "string",
                        "description": "Note IEN from VistA"
                    },
                    "localTitle": {
                        "type": "string",
                        "description": "Note title display name"
                    },
                    "nationalTitle": {
                        "type": "object"
                    },
                    "patientBirthDate": {
                        "type": "string",
                        "description": "Birth date of patient used for Note Task in Activity Management"
                    },
                    "patientIcn": {
                        "type": "string",
                        "description": "Patient ICN identifier"
                    },
                    "patientName": {
                        "type": "string",
                        "description": "Name of the patient"
                    },
                    "patientStatus": {
                        "type": "string",
                        "description": "Denotes if the patient is inpatient or outpatient"
                    },
                    "pid": {
                        "type": "string",
                        "description": "Patient PID identifier"
                    },
                    "processInstanceId": {
                        "type": "string",
                        "description": "Process identifier for Activity Management"
                    },
                    "referenceDateTime": {
                        "type": "string",
                        "description": "Date and time of the note in the format of YYYYMMDDHHmm"
                    },
                    "signedDateTime": {
                        "type": "string",
                        "description": "Date and time of when the note was signed"
                    },
                    "signer": {
                        "type": "string",
                        "description": "Name of the signer of the note"
                    },
                    "signerDisplayName": {
                        "type": "string",
                        "description": "Display name of the signer of the note"
                    },
                    "signerUid": {
                        "type": "string",
                        "description": "Identifier of the signer of the note"
                    },
                    "siteHash": {
                        "type": "string",
                        "description": "Site identifier"
                    },
                    "status": {
                        "type": "string",
                        "description": "Status of the note: UNSIGNED,SIGNED,UNTRANSCRIBED,UNCOSIGNED"
                    },
                    "statusDisplayName": {
                        "type": "string",
                        "description": "Status in display format"
                    },
                    "summary": {
                        "type": "string"
                    },
                    "text": {
                        "type": "array",
                        "description": "Zero or more note text information"
                    },
                    "uid": {
                        "type": "string",
                        "description": "Unique identifier of the note"
                    },
                    "updated": {
                        "type": "string",
                        "description": "Last modified timestamp"
                    },
                    "value": {
                        "type": "boolean",
                        "description": "Boolean to determine if the note is active or not"
                    },
                    "id": {
                        "type": "string",
                        "description": "Unique identifier of the note"
                    },
                    "itemUniqueID": {
                        "type": "string",
                        "description": "Unique identifier of the note plus the displayGroup"
                    },
                    "displayGroup": {
                        "type": "string",
                        "description": "The display group for the note to determine which section the note should be displayed"
                    },
                    "derivBody": {
                        "type": "string",
                        "description": "Copy of the note body text to be used with the form component"
                    },
                    "deriv_isEditForm": {
                        "type": "boolean",
                        "description": "Determines if the note came from an edit form versus a new note form"
                    },
                "required": [
                    "_labelsForSelectedValues",
                    "app",
                    "author",
                    "authorDisplayName",
                    "authorUid",
                    "derivReferenceDate",
                    "derivReferenceTime",
                    "documentClass",
                    "documentDefUid",
                    "documentDefUidUnique",
                    "documentTypeName",
                    "encounterDateTime",
                    "encounterDisplayName",
                    "encounterName",
                    "entered",
                    "formUid",
                    "isInterdisciplinary",
                    "lastSavedTime",
                    "lastUpdateTime",
                    "localTitle",
                    "patientBirthDate",
                    "patientIcn",
                    "patientName",
                    "patientStatus",
                    "pid",
                    "processInstanceId",
                    "referenceDateTime",
                    "siteHash",
                    "status",
                    "statusDisplayName",
                    "text",
                    "uid",
                    "updated",
                    "value",
                    "id",
                    "itemUniqueID",
                    "displayGroup",
                    "derivBody",
                    "deriv_isEditForm"
                ]
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


## Notes [{{{path}}}/:uid]

### Update [PUT]

Update an existing patient unsigned note

+ Request JSON Message (application/json)

    + Body

            {
                "_labelsForSelectedValues": {},
                "app": "ehmp",
                "author": "PROVIDER,EIGHT",
                "authorDisplayName": "Provider,Eight",
                "authorUid": "urn:va:user:9E7A:991",
                "derivReferenceDate": "02/03/2016",
                "derivReferenceTime": "11:16",
                "documentClass": "PROGRESS NOTES",
                "documentDefUid": "urn:va:doc-def:9E7A:8",
                "documentDefUidUnique": "urn:va:doc-def:9E7A:8---ADVANCE_DIRECTIVE---all",
                "documentTypeName": "Progress Note",
                "encounterDateTime": "",
                "encounterDisplayName": "7A GEN MED",
                "encounterName": "7A GEN MED",
                "entered": "20160204094153",
                "formUid": "0",
                "isInterdisciplinary": "false",
                "lastSavedDisplayTime": null,
                "lastSavedTime": "20160204094153",
                "lastUpdateTime": "20160204094153",
                "localId": null,
                "localTitle": "ADVANCE DIRECTIVE",
                "nationalTitle": {
                    "name": "",
                    "vuid": ""
                },
                "patientBirthDate": "19350407",
                "patientIcn": "10108V420871",
                "patientName": "Eight,Patient",
                "patientStatus": "INPATIENT",
                "pid": "9E7A;3",
                "processInstanceId": "354",
                "referenceDateTime": "201602031116",
                "signedDateTime": null,
                "signer": null,
                "signerDisplayName": null,
                "signerUid": null,
                "siteHash": "9E7A",
                "status": "UNSIGNED",
                "statusDisplayName": "Unsigned",
                "summary": "",
                "text": [{
                    "author": "PROVIDER,EIGHT",
                    "authorDisplayName": "PROVIDER,EIGHT",
                    "authorUid": "urn:va:user:9E7A:991",
                    "content": "ggfsfafdfaf",
                    "dateTime": "2016-02-04T09:41:53-05:00",
                    "signer": null,
                    "signerDisplayName": null,
                    "signerUid": null,
                    "status": "UNSIGNED"
                }],
                "uid": "5f4defc0-ca91-11e5-9db3-c3cbc38cef9f",
                "updated": "2016-02-03T11:15:42-05:00",
                "value": true,
                "id": "5f4defc0-ca91-11e5-9db3-c3cbc38cef9f",
                "itemUniqueID": "5f4defc0-ca91-11e5-9db3-c3cbc38cef9f_undefined",
                "displayGroup": "unsigned",
                "derivBody": "gg",
                "deriv_isEditForm": true
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "_labelsForSelectedValues": {
                        "type": "object"
                    },
                    "app": {
                        "type": "string",
                        "description": "Either be 'ehmp' or 'vista'. Used to determine the origin of the unsigned note"
                    },
                    "authorDisplayName": {
                        "type": "string",
                        "description": "The formatted name of the note author name"
                    },
                    "authorUid": {
                        "type": "string",
                        "description": "The unique identifier for the author"
                    },
                    "derivReferenceDate": {
                        "type": "string",
                        "description": "User entered date of note"
                    },
                    "derivReferenceTime": {
                        "type": "string",
                        "description": "User entered time of note"
                    },
                    "documentClass": {
                        "type": "string",
                        "description": "The document class of the note"
                    },
                    "documentDefUid": {
                        "type": "string",
                        "description": "Note title UID"
                    },
                    "documentDefUidUnique": {
                        "type": "string",
                        "description": "Note title unique UID"
                    },
                    "documentTypeName": {
                        "type": "string",
                        "description": "Document class type name"
                    },
                    "encounterDateTime": {
                        "type": "string",
                        "description": "Visit date and time in YYYYMMDDHHmm"
                    },
                    "encounterDisplayName": {
                        "type": "string",
                        "description": "Visit display name"
                    },
                    "encounterName": {
                        "type": "string",
                        "description": "Visit name"
                    },
                    "entered": {
                        "type": "string",
                        "description": "Note creation date"
                    },
                    "formUid": {
                        "type": "string",
                        "description": "Used for e-signature form"
                    },
                    "isInterdisciplinary": {
                        "type": "string",
                        "description": "Boolean to determine if the note is interdisciplinary"
                    },
                    "lastSavedDisplayTime": {
                        "type": "string",
                        "description": "Last saved timestamp in display format"
                    },
                    "lastSavedTime": {
                        "type": "string",
                        "description": "Last saved timestamp in YYYYMMDDHHmmss"
                    },
                    "lastUpdateTime": {
                        "type": "string",
                        "description": "Timestamp from VxSync"
                    },
                    "localId": {
                        "type": "string",
                        "description": "Note IEN from VistA"
                    },
                    "localTitle": {
                        "type": "string",
                        "description": "Note title display name"
                    },
                    "nationalTitle": {
                        "type": "object"
                    },
                    "patientBirthDate": {
                        "type": "string",
                        "description": "Birth date of patient used for Note Task in Activity Management"
                    },
                    "patientIcn": {
                        "type": "string",
                        "description": "Patient ICN identifier"
                    },
                    "patientName": {
                        "type": "string",
                        "description": "Name of the patient"
                    },
                    "patientStatus": {
                        "type": "string",
                        "description": "Denotes if the patient is inpatient or outpatient"
                    },
                    "pid": {
                        "type": "string",
                        "description": "Patient PID identifier"
                    },
                    "processInstanceId": {
                        "type": "string",
                        "description": "Process identifier for Activity Management"
                    },
                    "referenceDateTime": {
                        "type": "string",
                        "description": "Date and time of the note in the format of YYYYMMDDHHmm"
                    },
                    "signedDateTime": {
                        "type": "string",
                        "description": "Date and time of when the note was signed"
                    },
                    "signer": {
                        "type": "string",
                        "description": "Name of the signer of the note"
                    },
                    "signerDisplayName": {
                        "type": "string",
                        "description": "Display name of the signer of the note"
                    },
                    "signerUid": {
                        "type": "string",
                        "description": "Identifier of the signer of the note"
                    },
                    "siteHash": {
                        "type": "string",
                        "description": "Site identifier"
                    },
                    "status": {
                        "type": "string",
                        "description": "Status of the note: UNSIGNED,SIGNED,UNTRANSCRIBED,UNCOSIGNED"
                    },
                    "statusDisplayName": {
                        "type": "string",
                        "description": "Status in display format"
                    },
                    "summary": {
                        "type": "string"
                    },
                    "text": {
                        "type": "array",
                        "description": "Zero or more note text information"
                    },
                    "uid": {
                        "type": "string",
                        "description": "Unique identifier of the note"
                    },
                    "updated": {
                        "type": "string",
                        "description": "Last modified timestamp"
                    },
                    "value": {
                        "type": "boolean",
                        "description": "Boolean to determine if the note is active or not"
                    },
                    "id": {
                        "type": "string",
                        "description": "Unique identifier of the note"
                    },
                    "itemUniqueID": {
                        "type": "string",
                        "description": "Unique identifier of the note plus the displayGroup"
                    },
                    "displayGroup": {
                        "type": "string",
                        "description": "The display group for the note to determine which section the note should be displayed"
                    },
                    "derivBody": {
                        "type": "string",
                        "description": "Copy of the note body text to be used with the form component"
                    },
                    "deriv_isEditForm": {
                        "type": "boolean",
                        "description": "Determines if the note came from an edit form versus a new note form"
                    },
                "required": [
                    "_labelsForSelectedValues",
                    "app",
                    "author",
                    "authorDisplayName",
                    "authorUid",
                    "derivReferenceDate",
                    "derivReferenceTime",
                    "documentClass",
                    "documentDefUid",
                    "documentDefUidUnique",
                    "documentTypeName",
                    "encounterDateTime",
                    "encounterDisplayName",
                    "encounterName",
                    "entered",
                    "formUid",
                    "isInterdisciplinary",
                    "lastSavedTime",
                    "lastUpdateTime",
                    "localTitle",
                    "patientBirthDate",
                    "patientIcn",
                    "patientName",
                    "patientStatus",
                    "pid",
                    "processInstanceId",
                    "referenceDateTime",
                    "siteHash",
                    "status",
                    "statusDisplayName",
                    "text",
                    "uid",
                    "updated",
                    "value",
                    "id",
                    "itemUniqueID",
                    "displayGroup",
                    "derivBody",
                    "deriv_isEditForm"
                ]
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


### Delete [DELETE]

Delete an existing patient unsigned note

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)



## Notes [{{{path}}}/sign]

### Sign [POST]

Add a new unsigned note for a patient to single VistA

+ Request JSON Message (application/json)

    + Body

            {
              "itemChecklist": [
                {
                  "_labelsForSelectedValues": {},
                  "app": "ehmp",
                  "author": "PROVIDER,EIGHT",
                  "authorDisplayName": "Provider,Eight",
                  "authorUid": "urn:va:user:9E7A:991",
                  "derivReferenceDate": "02/04/2016",
                  "derivReferenceTime": "13:24",
                  "documentClass": "PROGRESS NOTES",
                  "documentDefUid": "urn:va:doc-def:9E7A:8",
                  "documentDefUidUnique": "urn:va:doc-def:9E7A:8---ADVANCE_DIRECTIVE---all",
                  "documentTypeName": "Progress Note",
                  "encounterDateTime": "",
                  "encounterDisplayName": "Audiology",
                  "encounterName": "Audiology",
                  "encounterServiceCategory": "I",
                  "entered": "20160204132529",
                  "formUid": "0",
                  "isInterdisciplinary": "false",
                  "lastSavedDisplayTime": "Today at 1:25 PM",
                  "lastSavedTime": "20160204132529",
                  "lastUpdateTime": "20160204132529",
                  "localId": "9721a820-cb6c-11e5-bb8f-ff6009f25f2e",
                  "localTitle": "ADVANCE DIRECTIVE",
                  "nationalTitle": {
                    "name": "",
                    "vuid": ""
                  },
                  "patientBirthDate": "19350407",
                  "patientIcn": "10108V420871",
                  "patientName": "Eight,Patient",
                  "patientStatus": "INPATIENT",
                  "pid": "3",
                  "processInstanceId": "379",
                  "referenceDateTime": "201602041324",
                  "signedDateTime": null,
                  "signer": null,
                  "signerDisplayName": null,
                  "signerUid": null,
                  "siteHash": "9E7A",
                  "status": "UNSIGNED",
                  "statusDisplayName": "Unsigned",
                  "summary": "",
                  "text": [
                    {
                      "author": "PROVIDER,EIGHT",
                      "authorDisplayName": "PROVIDER,EIGHT",
                      "authorUid": "urn:va:user:9E7A:991",
                      "content": "test ",
                      "dateTime": "2016-02-04T13:25:29-05:00",
                      "signer": null,
                      "signerDisplayName": null,
                      "signerUid": null,
                      "status": "UNSIGNED"
                    }
                  ],
                  "uid": "9721a820-cb6c-11e5-bb8f-ff6009f25f2e",
                  "updated": "2016-02-04T13:25:32-05:00",
                  "value": true,
                  "id": "9721a820-cb6c-11e5-bb8f-ff6009f25f2e",
                  "itemUniqueID": "9721a820-cb6c-11e5-bb8f-ff6009f25f2e_undefined",
                  "displayGroup": "unsigned",
                  "derivBody": "test ",
                  "deriv_isEditForm": true,
                  "asuPermissions": [
                    "VIEW",
                    "SIGNATURE",
                    "EDIT RECORD",
                    "DELETE RECORD",
                    "CHANGE TITLE"
                  ],
                  "label": "9721a820-cb6c-11e5-bb8f-ff6009f25f2e",
                  "name": "9721a820-cb6c-11e5-bb8f-ff6009f25f2e",
                  "disabled": true
                }
              ],
              "name": "",
              "signatureCode": "",
              "connectionPercent": "",
              "ratedDisabilities": "None Stated",
              "signItems": [
                {
                  "_labelsForSelectedValues": {},
                  "app": "ehmp",
                  "author": "PROVIDER,EIGHT",
                  "authorDisplayName": "Provider,Eight",
                  "authorUid": "urn:va:user:9E7A:991",
                  "derivReferenceDate": "02/04/2016",
                  "derivReferenceTime": "13:24",
                  "documentClass": "PROGRESS NOTES",
                  "documentDefUid": "urn:va:doc-def:9E7A:8",
                  "documentDefUidUnique": "urn:va:doc-def:9E7A:8---ADVANCE_DIRECTIVE---all",
                  "documentTypeName": "Progress Note",
                  "encounterDateTime": "",
                  "encounterDisplayName": "Audiology",
                  "encounterName": "Audiology",
                  "encounterServiceCategory": "I",
                  "entered": "20160204132529",
                  "formUid": "0",
                  "isInterdisciplinary": "false",
                  "lastSavedDisplayTime": "Today at 1:25 PM",
                  "lastSavedTime": "20160204132529",
                  "lastUpdateTime": "20160204132529",
                  "localId": "9721a820-cb6c-11e5-bb8f-ff6009f25f2e",
                  "localTitle": "ADVANCE DIRECTIVE",
                  "nationalTitle": {
                    "name": "",
                    "vuid": ""
                  },
                  "patientBirthDate": "19350407",
                  "patientIcn": "10108V420871",
                  "patientName": "Eight,Patient",
                  "patientStatus": "INPATIENT",
                  "pid": "3",
                  "processInstanceId": "379",
                  "referenceDateTime": "201602041324",
                  "signedDateTime": null,
                  "signer": null,
                  "signerDisplayName": null,
                  "signerUid": null,
                  "siteHash": "9E7A",
                  "status": "UNSIGNED",
                  "statusDisplayName": "Unsigned",
                  "summary": "",
                  "text": [
                    {
                      "author": "PROVIDER,EIGHT",
                      "authorDisplayName": "PROVIDER,EIGHT",
                      "authorUid": "urn:va:user:9E7A:991",
                      "content": "test ",
                      "dateTime": "2016-02-04T13:25:29-05:00",
                      "signer": null,
                      "signerDisplayName": null,
                      "signerUid": null,
                      "status": "UNSIGNED"
                    }
                  ],
                  "uid": "9721a820-cb6c-11e5-bb8f-ff6009f25f2e",
                  "updated": "2016-02-04T13:25:32-05:00",
                  "value": true,
                  "id": "9721a820-cb6c-11e5-bb8f-ff6009f25f2e",
                  "itemUniqueID": "9721a820-cb6c-11e5-bb8f-ff6009f25f2e_undefined",
                  "displayGroup": "unsigned",
                  "derivBody": "test ",
                  "deriv_isEditForm": true,
                  "asuPermissions": [
                    "VIEW",
                    "SIGNATURE",
                    "EDIT RECORD",
                    "DELETE RECORD",
                    "CHANGE TITLE"
                  ],
                  "label": "9721a820-cb6c-11e5-bb8f-ff6009f25f2e",
                  "name": "9721a820-cb6c-11e5-bb8f-ff6009f25f2e",
                  "disabled": true
                }
              ],
              "_labelsForSelectedValues": {},
              "checklistCount": 1
            }

    + Schema

              "signItems": [

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "type": "object",
                "properties": {
                    "itemChecklist": {
                        "type": "array",
                        "description": "List of notes that can be signed"
                    },
                    "name": {
                        "type": "string",
                        "description": ""
                    },
                    "signatureCode": {
                        "type": "string",
                        "description": "The eSignature code of the signer"
                    },
                    "connectionPercent": {
                        "type": "string",
                        "description": ""
                    },
                    "ratedDisabilities": {
                        "type": "string",
                        "description": ""
                    },
                    "signItems": {
                        "type": "array",
                        "description": "List of notes to be signed"
                    },
                    "_labelsForSelectedValues": {
                        "type": "object",
                        "description": ""
                    },
                    "checklistCount": {
                        "type": "string",
                        "description": "Count of items to be signed"
                    }
                },
                "required": [
                    "itemChecklist",
                    "name",
                    "signatureCode",
                    "connectionPercent",
                    "ratedDisabilities",
                    "signItems",
                    "_labelsForSelectedValues",
                    "checklistCount"
                ]
            }

+ Response 200 (application/json)

:[Response 400]({{{common}}}/responses/400.md)

:[Response 404]({{{common}}}/responses/404.md)

:[Response 500]({{{common}}}/responses/500.md)


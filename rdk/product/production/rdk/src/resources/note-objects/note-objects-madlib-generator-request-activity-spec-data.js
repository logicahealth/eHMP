'use strict';

//------------------------------------------------------------------------
// REF:  https://wiki.vistacore.us/pages/viewpage.action?pageId=15207298
// A Clinical Object request that is directed at another person
//------------------------------------------------------------------------
var raDraft = {

};

var raPending = {
};

//------------------------------------------------------------------------
// REF:  https://wiki.vistacore.us/display/VACORE/Request+Activity+-+Clinical+Object+Storage+Structure
// An active Clinical Object request that is directed at another person
//------------------------------------------------------------------------
var raActive =
{
    "uid" : "urn:va:ehmp-activity:9E7A:3:e06c8148-80f0-47c0-907a-3bb739ac2808",
    "patientUid" : "urn:va:patient:9E7A:3:3",
    "authorUid" : "urn:va:user:9E7A:10000000270",
    "domain" : "ehmp-activity",
    "subDomain" : "request",
    "visit" : {
        "locationUid" : "urn:va:location:9E7A:38",
        "serviceCategory" : "PSB",
        "dateTime" : 20160101080000
    },
    "ehmpState" : "active",
    "displayName" : "Request Activity",
    "referenceId" : "", // For Request Activity this will be empty string since
                        // their is not a corresponding Vista/JDS record.,
    "data" : {
        "activity" : {
            "deploymentId" : "VistaCore:Order",
            "processDefinitionId" : "Order:Request",
            "processInstanceId" : 123,
            "state" : "complete:request completed",
            "initiator" : "urn:va:patient:9E7A:3",
            "timeStamp" : "20160420000000",
            "urgency" : "Urgent", // Latest Urgency for this activity
            "assignTo" : "My Teams", // Latest Assigned to
            "routingCode" : "" // Latest Routing code for this activity
        },
        "signals" : [ // No signals currently
        ],
        "requests" : [
                { // First Request (multiple requests are allowed)
                    "taskInstanceId" : 200, // <task instance id>,
                    "urgencyId" : "10", // 0-10
                    "urgency" : "Urgent",
                    "earliestDate" : "20160329000000",
                    "latestDate" : "20160420000000",
                    "title" : "Post procedure follow-up 200",
                    "assignTo" : "My Teams", // Me, Person, My Teams, Any Team
                    "route" : {
                        "facility" : "500",
                        "person" : "", // Would be blank in this case since it
                                        // is a team
                        "team" : {
                            "code" : "501",
                            "name" : "Primary Care Team A 3rd Floor"
                        },
                        "teamFocus" : {
                            "code" : "201",
                            "name" : "Primary Care"
                        },
                        "teamCareType" : {
                            "code" : "301",
                            "name" : "Primary Care"
                        },
                        "patientsAssignment" : true, // Boolean
                        "assignedRoles" : [ {
                            "code" : "403", // role 1 Code and Name
                            "name" : "Physician"
                        } ],
                        "routingCode" : "[TF: Primary Care(104)/TR:Nurse Practitioner (93)]"
                    },
                    "request" : "This is my request",
                    "submittedByUid" : "urn:va:user:9E7A:10000000270",
                    "submittedByName" : "Panorama,User",
                    "submittedTimeStamp" : "20160420000000",
                    "visit" : {
                        "locationUid" : "urn:va:location:9E7A:38",
                        "serviceCategory" : "PSB",
                        "dateTime" : 20160101080000
                    }
                },
                { // Second Request
                    "taskInstanceId" : 202, // <task instance id>,
                    "urgencyId" : "10", // 0-10
                    "urgency" : "Urgent",
                    "earliestDate" : "20160329000000",
                    "latestDate" : "20160420000000",
                    "title" : "Post procedure follow-up 202",
                    "assignTo" : "Me", // Me, Person, My Teams, Any Team
                    "route" : {
                        "facility" : "500",
                        "person" : "", // Would be blank in this case since it
                                        // is a team
                        "team" : {
                            "code" : "501",
                            "name" : "Primary Care Team A 3rd Floor"
                        },
                        "teamFocus" : {
                            "code" : "201",
                            "name" : "Primary Care"
                        },
                        "teamCareType" : {
                            "code" : "301",
                            "name" : "Primary Care"
                        },
                        "patientsAssignment" : true, // Boolean
                        "assignedRoles" : [ {
                            "code" : "403", // role 1 Code and Name
                            "name" : "Physician"
                        } ],
                        "routingCode" : "[TF: Primary Care(104)/TR:Nurse Practitioner (93)]"
                    },
                    "request" : "This is my request",
                    "submittedByUid" : "urn:va:user:9E7A:10000000270",
                    "submittedByName" : "Panorama,User",
                    "submittedTimeStamp" : "20160509000000",
                    "visit" : {
                        "locationUid" : "urn:va:location:9E7A:38",
                        "serviceCategory" : "PSB",
                        "dateTime" : 20160101080000
                    }
                } ],
        "responses" : [
                {
                    "taskInstanceId" : 201,
                    "action" : "reassign", // Reassign, Decline, Return for
                                            // Clarification, Mark as Complete
                    "comment" : "My Comment for 201 - 20160421066000",
                    "request" : "",
                    "assignTo" : "My Teams", // Person, My Teams, Any Team
                    "route" : {
                        "facility" : "500",
                        "person" : "", // Would be blank in this case since it
                                        // is a team
                        "team" : {
                            "code" : "501",
                            "name" : "Primary Care Team A 3rd Floor"
                        },
                        "teamFocus" : {
                            "code" : "201",
                            "name" : "Primary Care"
                        },
                        "teamCareType" : {
                            "code" : "301",
                            "name" : "Primary Care"
                        },
                        "patientsAssignment" : true, // Boolean
                        "assignedRoles" : [ {
                            "code" : "403", // role 1 Code and Name
                            "name" : "Physician"
                        }, {
                            "code" : 410,
                            "name" : "Nurse Practitioner"
                        } // ,
                        //                     {
                        //                         "code": 411,
                        //                         "name": "Registered Nurse"
                        //                     },
                        //                     {
                        //                         "code": 412,
                        //                         "name": "Licensed Practical
                        // Nurse"
                        //                     }
                        ],
                        "routingCode" : "[TF: Primary Care(104)/TR:Nurse Practitioner (93)]"
                    },
                    "submittedByUid" : "urn:va:user:9E7A:10000000270",
                    "submittedByName" : "Panorama,User",
                    "submittedTimeStamp" : "20160421066000",
                    "visit" : {
                        "locationUid" : "urn:va:location:9E7A:38",
                        "serviceCategory" : "PSB",
                        "dateTime" : 20160091080000
                    }
                },
                {
                    "taskInstanceId" : 202,
                    "action" : "clarification",  // Reassign,
                                                            // Decline, Return
                                                            // Return for Clarification,
                                                            // Mark as Complete
                    "comment" : "My Comment for 202 - 20160421000000",
                    "request" : "",
                    "assignTo" : "Any Team",    // Person, My Teams, Any Team
                    "route" : {
                        "facility" : "500",
                        "person" : "", // Would be blank in this case since it
                                        // is a team
                        "team" : {
                            "code" : "501",
                            "name" : "Primary Care Team A 3rd Floor"
                        },
                        "teamFocus" : {
                            "code" : "201",
                            "name" : "Primary Care"
                        },
                        "teamCareType" : {
                            "code" : "301",
                            "name" : "Primary Care"
                        },
                        "patientsAssignment" : false, // Boolean
                        "assignedRoles" : [ {
                            "code" : "403", // role 1 Code and Name
                            "name" : "Physician"
                        }, {
                            "code" : 410,
                            "name" : "Nurse Practitioner"
                        }
                        ],
                        "routingCode" : "[TF: Primary Care(104)/TR:Nurse Practitioner (93)]"
                    },
                    "submittedByUid" : "urn:va:user:9E7A:10000000270",
                    "submittedByName" : "Panorama,User",
                    "submittedTimeStamp" : "20160421008000",
                    "visit" : {
                        "locationUid" : "urn:va:location:9E7A:38",
                        "serviceCategory" : "PSB",
                        "dateTime" : 20160100000000
                    }
                },
                {
                    "taskInstanceId" : 203,
                    "action" : "decline", // Reassign, Decline, Return for
                                            // Clarification, Mark as Complete
                    "comment" : "My Comment for 203",
                    "request" : "",
                    "assignTo" : "Person",
                    "route" : {
                        "facility" : "500",
                        "person" : "", // Would be blank in this case since it
                                        // is a team
                        "team" : {
                            "code" : "501",
                            "name" : "Primary Care Team A 3rd Floor"
                        },
                        "teamFocus" : {
                            "code" : "201",
                            "name" : "Primary Care"
                        },
                        "teamCareType" : {
                            "code" : "301",
                            "name" : "Primary Care"
                        },
                        "patientsAssignment" : true, // Boolean
                        "assignedRoles" : [ {
                            "code" : "403", // role 1 Code and Name
                            "name" : "Physician"
                        } ],
                        "routingCode" : "[TF: Primary Care(104)/TR:Nurse Practitioner (93)]"
                    },
                    "submittedByUid" : "urn:va:user:9E7A:10000000270",
                    "submittedByName" : "Panorama,User",
                    "submittedTimeStamp" : "20160510000000",
                    "visit" : {
                        "locationUid" : "urn:va:location:9E7A:38",
                        "serviceCategory" : "PSB",
                        "dateTime" : 20160101080000
                    }
                } ]
    }
};


var raActiveWithMissingDataForDefault =
{
    "uid" : "urn:va:ehmp-activity:9E7A:3:e06c8148-80f0-47c0-907a-3bb739ac2808",
    "patientUid" : "urn:va:patient:9E7A:3:3",
    "authorUid" : "urn:va:user:9E7A:10000000270",
    "domain" : "ehmp-activity",
    "subDomain" : "request",
    "visit" : {
        "locationUid" : "urn:va:location:9E7A:38",
        "serviceCategory" : "PSB",
        "dateTime" : 20160101080000
    },
    "ehmpState" : "active",
    "displayName" : "Request Activity",
    "referenceId" : "", // For Request Activity this will be empty string since
                        // their is not a corresponding Vista/JDS record.,
    "data" : {
        "activity" : {
            "deploymentId" : "VistaCore:Order",
            "processDefinitionId" : "Order:Request",
            "processInstanceId" : 123,
            "state" : "complete:request completed",
            "initiator" : "urn:va:patient:9E7A:3",
            "timeStamp" : "20160420000000",
            "urgency" : "Urgent", // Latest Urgency for this activity
            "assignTo" : "My Teams", // Latest Assigned to
            "routingCode" : "" // Latest Routing code for this activity
        },
        "signals" : [ // No signals currently
        ],
        "requests" : [
                { // First Request (multiple requests are allowed)
                    "taskInstanceId" : 200, // <task instance id>,
                    "urgencyId" : "10", // 0-10
                    "urgency" : "Urgent",
                    "earliestDate" : "20160329000000",
                    "latestDate" : "20160420000000",
                    "title" : "Post procedure follow-up 200",
                    "assignTo" : "My Teams", // Me, Person, My Teams, Any Team
                    "route" : {
                        "facility" : "500",
                        "person" : "", // Would be blank in this case since it
                                        // is a team
                        "team" : {
                            "code" : "501",
                            "name" : "Primary Care Team A 3rd Floor"
                        },
                        "teamFocus" : {
                            "code" : "201",
                            "name" : "Primary Care"
                        },
                        "teamCareType" : {
                            "code" : "301",
                            "name" : "Primary Care"
                        },
                        "patientsAssignment" : true, // Boolean
                        "assignedRoles" : [ {
                            "code" : "403", // role 1 Code and Name
                            "name" : "Physician"
                        } ],
                        "routingCode" : "[TF: Primary Care(104)/TR:Nurse Practitioner (93)]"
                    },
                    "request" : "",  // <----- SHOULD RESULT IN NULL ON MADLIB
                    "submittedByUid" : "urn:va:user:9E7A:10000000270",
                    "submittedByName" : "Panorama,User",
                    "submittedTimeStamp" : "20160420000000",
                    "visit" : {
                        "locationUid" : "urn:va:location:9E7A:38",
                        "serviceCategory" : "PSB",
                        "dateTime" : 20160101080000
                    }
                },
                { // Second Request
                    "taskInstanceId" : 202, // <task instance id>,
                    "urgencyId" : "10", // 0-10
                    "urgency" : "Urgent",
                    "earliestDate" : "20160329000000",
                    "latestDate" : "20160420000000",
                    "title" : "Post procedure follow-up 202",
                    "assignTo" : "Me", // Me, Person, My Teams, Any Team
                    "route" : {
                        "facility" : "500",
                        "person" : "", // Would be blank in this case since it
                                        // is a team
                        "team" : {
                            "code" : "501",
                            "name" : "Primary Care Team A 3rd Floor"
                        },
                        "teamFocus" : {
                            "code" : "201",
                            "name" : "Primary Care"
                        },
                        "teamCareType" : {
                            "code" : "301",
                            "name" : "Primary Care"
                        },
                        "patientsAssignment" : true, // Boolean
                        "assignedRoles" : [{
                            "code" : "403", // role 1 Code and Name
                            "name" : "Physician"
                        }],
                        "routingCode" : "[TF: Primary Care(104)/TR:Nurse Practitioner (93)]"
                    },
                    "request" : "This is my request",
                    "submittedByUid" : "urn:va:user:9E7A:10000000270",
                    "submittedByName" : "Panorama,User",
                    "submittedTimeStamp" : "20160509000000",
                    "visit" : {
                        "locationUid" : "urn:va:location:9E7A:38",
                        "serviceCategory" : "PSB",
                        "dateTime" : 20160101080000
                    }
                } ],
        "responses" : [
                {
                    "taskInstanceId" : 201,
                    "action" : "reassign", // Reassign, Decline, Return for
                                            // Clarification, Mark as Complete
                    "comment" : "My Comment for 201 - 20160421066000",
                    "request" : "",
                    "assignTo" : "My Teams", // Person, My Teams, Any Team
                    "route" : {
                        "facility" : "500",
                        "person" : "", // Would be blank in this case since it
                                        // is a team
                        "team" : {
                            "code" : "501",
                            "name" : "Primary Care Team A 3rd Floor"
                        },
                        "teamFocus" : {
                            "code" : "201",
                            "name" : "Primary Care"
                        },
                        "teamCareType" : {
                            "code" : "301",
                            "name" : "Primary Care"
                        },
                        "patientsAssignment" : true, // Boolean
                        "assignedRoles" : [
                            {
                                "code" : "403", // role 1 Code and Name
                                "name" : "Physician"
                            },
                            {
                                "code" : 410,
                                "name" : "Nurse Practitioner"
                            }
                        ],
                        "routingCode" : "[TF: Primary Care(104)/TR:Nurse Practitioner (93)]"
                    },
                    "submittedByUid" : "urn:va:user:9E7A:10000000270",
                    "submittedByName" : "Panorama,User",
                    "submittedTimeStamp" : "20160421066000",
                    "visit" : {
                        "locationUid" : "urn:va:location:9E7A:38",
                        "serviceCategory" : "PSB",
                        "dateTime" : 20160091080000
                    }
                },
                {
                    "taskInstanceId" : 202,
                    "action" : "clarification",
                    "comment" : null, //<----- SHOULD RESULT IN NULL ON MADLIB
                    "request" : "",
                    "assignTo" : "Any Team",    // Person, My Teams, Any Team
                    "route" : {
                        "facility" : "500",
                        "person" : "", // Would be blank in this case since it
                                        // is a team
                        "team" : {
                            "code" : "501",
                            "name" : "Primary Care Team A 3rd Floor"
                        },
                        "teamFocus" : {
                            "code" : "201",
                            "name" : "Primary Care"
                        },
                        "teamCareType" : {
                            "code" : "301",
                            "name" : "Primary Care"
                        },
                        "patientsAssignment" : false, // Boolean
                                "assignedRoles" : [{
                                 "code": 411,
                                 "name": "Registered Nurse"
                            },
                            {
                                "code": 412,
                                "name": "Licensed Practical Nurse"
                            }
                         ],
                         "routingCode" : "[TF: Primary Care(104)/TR:Nurse Practitioner (93)]"
                    },
                    "submittedByUid" : "urn:va:user:9E7A:10000000270",
                    "submittedByName" : "Panorama,User",
                    "submittedTimeStamp" : "20160421008000",
                    "visit" : {
                        "locationUid" : "urn:va:location:9E7A:38",
                        "serviceCategory" : "PSB",
                        "dateTime" : 20160100000000
                    }
                },
                {
                    "taskInstanceId" : 203,
                    "action" : "decline",
                    "comment" : "",  //<------- SHOULD RESULT IN NULL ON MADLIB
                    "request" : "",
                    "assignTo" : "Person",
                    "route" : {
                        "facility" : "500",
                        "person" : "",
                        "team" : {
                            "code" : "501",
                            "name" : "Primary Care Team A 3rd Floor"
                        },
                        "teamFocus" : {
                            "code" : "201",
                            "name" : "Primary Care"
                        },
                        "teamCareType" : {
                            "code" : "301",
                            "name" : "Primary Care"
                        },
                        "patientsAssignment" : true, // Boolean
                        "assignedRoles" : [ {
                                "code" : "403", // role 1 Code and Name
                                "name" : "Physician"
                            }
                        ],
                        "routingCode" : "[TF: Primary Care(104)/TR:Nurse Practitioner (93)]"
                    },
                    "submittedByUid" : "urn:va:user:9E7A:10000000270",
                    "submittedByName" : "Panorama,User",
                    "submittedTimeStamp" : "20160425000000",
                    "visit" : {
                        "locationUid" : "urn:va:location:9E7A:38",
                        "serviceCategory" : "PSB",
                        "dateTime" : 20160101080000
                    }
                } ]
    }
};

var noteTemplate = {
        "uid": "urn:va:ehmp-activity:9E7A:3:e06c8148-80f0-47c0-907a-3bb739ac2808",
        "patientUid": "urn:va:patient:9E7A:3:3",
        "authorUid": "urn:va:user:9E7A:10000000270",
        "domain": "ehmp-activity",
        "subDomain": "request",
        "visit" :
        {
           "locationUid": "urn:va:location:9E7A:38",
           "serviceCategory": "PSB",
           "dateTime": 20160101080000
        },
        "ehmpState": "active",
        "displayName": "Request Activity",
        "referenceId": "", 
        "data": {
            "sourceUid": "",
            "madlib": "",
            "problemRelationship": "",
            "annotation":""
        },
        "createdDateTime": "20160501180000"
    };

module.exports.data = {
    draftData: raDraft,
    pendingData: raPending,
    activeRequest: raActive,
    activeRequestWithMissingDataDefault: raActiveWithMissingDataForDefault,
    noteTemplate: noteTemplate

};

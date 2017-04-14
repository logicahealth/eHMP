VPRJTERR ;KRM/CJE -- Unit Tests for GET/PUT/DELETE Error Data
 ;;1.0;JSON DATA STORE;;Jan 27, 2015
 ;
 ; Endpoints tested
 ;POST/PUT error/set/this SET^VPRJERR
 ;GET error/get/{id} GET^VPRJERR
 ;GET error/length/this LEN^VPRJERR
 ;DELETE error/destroy/{id} DEL^VPRJERR
 ;GET error/destroy/{id} DEL^VPRJERR
 ;DELETE error/clear/this CLR^VPRJERR
 ;GET error/clear/this CLR^VPRJERRSET
 ;
STARTUP  ; Run once before all tests
 K ^VPRJERR
 S HTTPREQ("store")="error"
 Q
SHUTDOWN ; Run once after all tests
 K ^VPRJERR
 K HTTPREQ
 Q
ASSERT(EXPECT,ACTUAL,MSG) ; for convenience
 D EQ^VPRJT(EXPECT,ACTUAL,$G(MSG))
 Q
 ;
MOCKDATA(RESULT,JOBID,TIMESTAMP,TYPE,ERROR) ; Mock data for test use
 N OBJECT,JSON,ERR
 ; Sample JSON
 ;{"21797","eff780ca-70d9-4e4f-9984-fcd0f8ac2946",{"pid","9E7A;3"},"21797","error","1432037853138","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A"}
 ;
 S OBJECT("jobId")=JOBID
 S OBJECT("jpid")="eff780ca-70d9-4e4f-9984-fcd0f8ac2946"
 S OBJECT("patientIdentifier","type")="pid"
 S OBJECT("patientIdentifier","value")="9E7A;3"
 S OBJECT("rootJobId")="21797"
 S OBJECT("status")="error"
 S OBJECT("timestamp")=TIMESTAMP
 S OBJECT("type")=TYPE
 S OBJECT("error")=ERROR
 D ENCODE^VPRJSON("OBJECT","JSON","ERR")
 M RESULT=JSON
 Q
 ;
SETJSON ;; @TEST Put/Post data happy path
 N RETURN,BODY,ARG,HTTPERR,ERR,OBJECT,JSON,ERRNUM,ERRMSG
 ;
 ; Generate Mock Data to be sent to endpoint to store
 D MOCKDATA(.JSON,"21797","1432037853138","jmeadows-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 ;
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ;
 ; Send data to the URL
 S RETURN=$$SET^VPRJERR(.ARG,.JSON)
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 404 error should not occur")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 220 reason code should not occur")
 D ASSERT(21797,$G(^VPRJERR(1,"jobId")),"JobId not stored")
 D ASSERT(1432037853138,$G(^VPRJERR(1,"timestamp")),"timestamp not stored")
 D ASSERT(1,$G(^VPRJERR(1,"id")),"generated id not stored")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
SETJSONERR ;; @TEST Error code is set if JSON is mangled in PUT/POST
 N RETURN,BODY,ARG,HTTPERR,ERR,ERRNUM,ERRMSG,ERRPRE,RESULT
 ; Create bad JSON
 D MOCKDATA(.BODY,"21797","1432037853138","jmeadows-sync-request","Unable to communicate with primary VistA")
 S BODY(3)=BODY(3)_":"
 ; Send it to the URL
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D ASSERT(1,$G(^VPRJERR(0)),"More data exists in Error storage and it should not")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(202,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 202 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
DELIDERR ;; @TEST Error code is set if no Id
 N ARG,ARGS,BODY,DATA,ERR,ERRNUM,ERRMSG,ERRPRE,HTTPERR,OBJECT,RESULT,RETURN
 ; Ensure that VPRJERR is cleaned up
 K ^VPRJERR
 ; Try with a non existant _id
 D DEL^VPRJERR(.DATA,.ARGS)
 D ASSERT(0,$D(^VPRJERR("0")),"Data exists in Store Error and it should not")
 D ASSERT(0,$D(DATA),"No DATA should be returned")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(111,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 111 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup vars
 K DATA,OBJECT,ERR,ARGS
 ; Try with a blank _id
 S ARGS("_id")=""
 D DEL^VPRJERR(.DATA,.ARGS)
 D ASSERT(0,$D(^VPRJERR("0")),"Data exists in Store Error and it should not")
 D ASSERT(0,$D(DATA),"No DATA should be returned")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(111,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 111 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
DEL ;; @TEST Delete Store Data
 N RETURN,BODY,ARG,DATA,ARGS,OBJECT,ERR,HTTPERR
 ; Create Store Data
 D MOCKDATA(.BODY,"21797","1432037853138","jmeadows-sync-request","Unable to communicate with primary VistA")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 ; Populate ID that is undefined in Error Store
 D ASSERT(10,$D(^VPRJERR(1)),"Data in Error Store does not exist and it should")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT(1,$G(^VPRJERR(1,"id")),"The id field was not stored correctly")
 D ASSERT("1432037853138",$G(^VPRJERR(1,"timestamp")),"The timestamp field was not stored correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K BODY,RETURN,ARG
 ; Now delete it
 S ARGS("id")=1
 D DEL^VPRJERR(.DATA,.ARGS)
 D:$D(DATA) DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(0,$D(^VPRJERR(1)),"Store Data exists and it should not")
 D ASSERT("{}",$G(DATA),"DATA returned from a DELETE call (should not happen)")
 ;
 K ^||TMP("HTTPERR",$J)
 Q
LEN ;; @TEST Get number of Store Data
 N ARG,ARGS,BODY,DATA,ERR,ERRNUM,ERRMSG,ERRPRE,HTTPERR,ID,OBJECT,RESULT,RETURN
 D CLR^VPRJERR
 ; Create Store Data
 D MOCKDATA(.BODY,"21797","1432037853138","jmeadows-sync-request","Unable to communicate with primary VistA")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D ASSERT(10,$D(^VPRJERR(1)),"A Data in Error Store does not exist and it should")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT(1,$G(^VPRJERR(1,"id")),"The id field was not stored correctly")
 D ASSERT("1432037853138",$G(^VPRJERR(1,"timestamp")),"The timestamp field was not stored correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K BODY,RETURN,ARG
 ; Now get length
 D LEN^VPRJERR(.DATA,.ARGS)
 D:$D(DATA) DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J)),"An HTTP Error Occured")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(1,$G(OBJECT("length")),"The total number of objects doesn't match - 1")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K OBJECT,DATA,ERR,ARGS
 ; Create Store Data
 D MOCKDATA(.BODY,"21797","1432037853139","jmeadows-sync-request","Unable to communicate with primary VistA")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D ASSERT(10,$D(^VPRJERR(2)),"A Data in Error Store does not exist and it should")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT(2,$G(^VPRJERR(2,"id")),"The id field was not stored correctly")
 D ASSERT("1432037853139",$G(^VPRJERR(2,"timestamp")),"The timestamp field was not stored correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K BODY,RETURN,ARG
 ; Now get length
 D LEN^VPRJERR(.DATA,.ARGS)
 D:$D(DATA) DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J)),"An HTTP Error Occured")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(2,$G(OBJECT("length")),"The total number of objects doesn't match - 2")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup ^VPRJERR
 K ^VPRJERR
 Q 
GETIDERR ;; @TEST Error code is not set if no Id
 N ARG,ARGS,BODY,DATA,ERR,ERRNUM,ERRMSG,ERRPRE,HTTPERR,ID,OBJECT,RESULT,RETURN
 ; Try with a non existant id attribute
 D GET^VPRJERR(.DATA,.ARGS)
 D ASSERT(1,$D(DATA),"DATA should be returned")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J)),"An HTTP error should not have occured")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K DATA,OBJECT,ARGS
 ; Try with a null id
 S ARGS("id")=""
 D GET^VPRJERR(.DATA,.ARGS)
 D ASSERT(1,$D(DATA),"DATA should be returned")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J)),"An HTTP error should not have occured")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
GET ;; @TEST Get Store Data
 N ARG,ARGS,BODY,DATA,ERR,HTTPERR,ID,OBJECT,RESULT,RETURN
 ; Create Store Data
 D MOCKDATA(.BODY,"21797","1432037853140","jmeadows-sync-request","Unable to communicate with primary VistA")
 ;
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Send it to the URL
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 ;
 D ASSERT(10,$D(^VPRJERR(1)),"Data in Error Store does not exist and it should")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT(21797,$G(^VPRJERR(1,"jobId")),"The jobId field was not stored correctly")
 D ASSERT(1432037853140,$G(^VPRJERR(1,"timestamp")),"The timestamp field was not stored correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K RETURN,ARG,BODY
 ; Get the data we stored
 S ARGS("id")=1
 D GET^VPRJERR(.DATA,.ARGS)
 D:$D(DATA) DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(10,$D(^VPRJERR(1)),"Data in Error Store does not exist and it should")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT(21797,$G(OBJECT("items",1,"jobId")),"returned data for the wrong id")
 D ASSERT(1432037853140,$G(OBJECT("items",1,"timestamp")),"returned data for timestamp didn't match")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K DATA,ARGS,OBJECT,ERR,BODY
 ; Create Store Data update
 D MOCKDATA(.BODY,"21797","1432037853141","jmeadows-sync-request","Unable to communicate with primary VistA")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D ASSERT(10,$D(^VPRJERR(2)),"Data in Error Store does not exist and it should")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT(2,$G(^VPRJERR(2,"id")),"The id field was not stored correctly")
 D ASSERT(1432037853141,$G(^VPRJERR(2,"timestamp")),"The timestamp field was not stored correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K ARG,BODY,RETURN
 ; Get the data we stored update
 S ARGS("id")=2
 D GET^VPRJERR(.DATA,.ARGS)
 D:$D(DATA) DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(10,$D(^VPRJERR(2)),"Data in Error Store does not exist and it should")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT(21797,$G(OBJECT("items",1,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853141,$G(OBJECT("items",1,"timestamp")),"returned data for timestamp didn't match")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K DATA,ARGS,OBJECT,ERR
 ; Create second Store Data
 D MOCKDATA(.BODY,"21797","1432037853141","hdr-sync-request","Unable to communicate with primary VistA")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D ASSERT(10,$D(^VPRJERR(3)),"Data in Error Store does not exist and it should")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT(21797,$G(^VPRJERR(3,"jobId")),"The id field was not stored correctly")
 D ASSERT(1432037853141,$G(^VPRJERR(3,"timestamp")),"The timestamp field was not stored correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K ARG,BODY,RETURN
 ; Get second Store Data
 S ARGS("id")=3
 D GET^VPRJERR(.DATA,.ARGS)
 D:$D(DATA) DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(10,$D(^VPRJERR(3)),"Store Data does not exists and it should")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT(21797,$G(OBJECT("items",1,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853141,$G(OBJECT("items",1,"timestamp")),"returned data for timestamp didn't match")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; leave these around so they can be killed in the next test
 Q
GETFLTR ;; @TEST Get objects by filter
 N ARG,ARGS,BODY,DATA,ERR,HTTPERR,ID,OBJECT,RESULT,RETURN
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K ARG,BODY,RETURN,OBJECT
 ; Get using filter. there should be two results
 S ARGS("filter")="eq(""timestamp"",""1432037853141"")"
 D GET^VPRJERR(.DATA,.ARGS)
 D:$D(DATA) DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT(21797,$G(OBJECT("items",1,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853141,$G(OBJECT("items",1,"timestamp")),"returned data for timestamp didn't match")
 D ASSERT(21797,$G(OBJECT("items",2,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853141,$G(OBJECT("items",2,"timestamp")),"returned data for timestamp didn't match")
 D ASSERT("",$G(OBJECT("items",3,"jobId")),"more objects returned than there should be")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K ARG,BODY,RETURN,OBJECT
 ; Get using filter. there should be two results
 S ARGS("filter")="eq(""type"",""hdr-sync-request"")"
 D GET^VPRJERR(.DATA,.ARGS)
 D:$D(DATA) DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT(21797,$G(OBJECT("items",1,"jobId")),"returned data for the wrong jobId")
 D ASSERT("hdr-sync-request",$G(OBJECT("items",1,"type")),"returned data for timestamp didn't match")
 D ASSERT("",$G(OBJECT("items",2,"jobId")),"more objects returned than there should be")
 Q
 ;
GETLIMIT ;; @TEST Get objects with limit, start, and startid
 N ARG,ARGS,BODY,DATA,ERR,HTTPERR,ID,OBJECT,RESULT,RETURN
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Empty error store
 K ^VPRJERR
 ;
 ; Add errors to the error store to test limit, start, and startid
 D MOCKDATA(.BODY,"21795","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21805","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21806","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21796","1432037853131","enterprise-sync-request","Unable to communicate with Primary VistA instance C877")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21797","1432037853132","vler-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21798","1432037853133","vler-sync-request","Unable to communicate with Primary VistA instance C877")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21807","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21808","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21809","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21810","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21799","1432037853134","jmeadows-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21811","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21812","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21813","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21800","1432037853135","jmeadows-sync-request","Unable to communicate with Primary VistA instance C877")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21814","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21801","1432037853136","hdr-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21815","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21816","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21817","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21818","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21819","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21802","1432037853137","hdr-sync-request","Unable to communicate with Primary VistA instance C877")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21820","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21803","1432037853138","store-record","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21821","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21822","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21823","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21824","1432037853130","enterprise-sync-request","Unable to communicate with Primary VistA instance 9E7A")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 D MOCKDATA(.BODY,"21804","1432037853139","store-record","Unable to communicate with Primary VistA instance C877")
 S RETURN=$$SET^VPRJERR(.ARG,.BODY)
 ;
 ; Delete errors out of error store to properly test startid, start, and limit
 S ARGS("id")=2
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=3
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=7
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=8
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=9
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=10
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=12
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=13
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=14
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=16
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=18
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=19
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=20
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=21
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=22
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=24
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=26
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=27
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=28
 D DEL^VPRJERR(.DATA,.ARGS)
 S ARGS("id")=29
 D DEL^VPRJERR(.DATA,.ARGS)
 ;
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K ARG,ARGS,BODY,DATA,RETURN,OBJECT
 ; Get using limit
 S ARGS("limit")=5
 D GET^VPRJERR(.DATA,.ARGS)
 D:$D(DATA) DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT(21795,$G(OBJECT("items",1,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853130,$G(OBJECT("items",1,"timestamp")),"returned data for timestamp didn't match")
 D ASSERT("enterprise-sync-request",$G(OBJECT("items",1,"type")),"returned data for timestamp didn't match")
 D ASSERT(1,$G(OBJECT("items",1,"id")),"returned data for the wrong id")
 D ASSERT(21796,$G(OBJECT("items",2,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853131,$G(OBJECT("items",2,"timestamp")),"returned data for timestamp didn't match")
 D ASSERT("enterprise-sync-request",$G(OBJECT("items",2,"type")),"returned data for timestamp didn't match")
 D ASSERT(4,$G(OBJECT("items",2,"id")),"returned data for the wrong id")
 D ASSERT(21797,$G(OBJECT("items",3,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853132,$G(OBJECT("items",3,"timestamp")),"returned data for timestamp didn't match")
 D ASSERT("vler-sync-request",$G(OBJECT("items",3,"type")),"returned data for timestamp didn't match")
 D ASSERT(5,$G(OBJECT("items",3,"id")),"returned data for the wrong id")
 D ASSERT(21798,$G(OBJECT("items",4,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853133,$G(OBJECT("items",4,"timestamp")),"returned data for timestamp didn't match")
 D ASSERT("vler-sync-request",$G(OBJECT("items",4,"type")),"returned data for timestamp didn't match")
 D ASSERT(6,$G(OBJECT("items",4,"id")),"returned data for the wrong id")
 D ASSERT(21799,$G(OBJECT("items",5,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853134,$G(OBJECT("items",5,"timestamp")),"returned data for timestamp didn't match")
 D ASSERT("jmeadows-sync-request",$G(OBJECT("items",5,"type")),"returned data for timestamp didn't match")
 D ASSERT(11,$G(OBJECT("items",5,"id")),"returned data for the wrong id")
 D ASSERT("",$G(OBJECT("items",6,"jobId")),"more objects returned than there should be")
 D ASSERT("",$G(OBJECT("items",6,"timestamp")),"more objects returned than there should be")
 D ASSERT("",$G(OBJECT("items",6,"type")),"more objects returned than there should be")
 D ASSERT("",$G(OBJECT("items",6,"id")),"more objects returned than there should be")
 ;
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K ARG,BODY,RETURN,OBJECT
 ; Get using start and limit
 S ARGS("start")=3
 S ARGS("limit")=3
 D GET^VPRJERR(.DATA,.ARGS)
 D:$D(DATA) DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT(21797,$G(OBJECT("items",1,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853132,$G(OBJECT("items",1,"timestamp")),"returned data for timestamp didn't match")
 D ASSERT("vler-sync-request",$G(OBJECT("items",1,"type")),"returned data for timestamp didn't match")
 D ASSERT(5,$G(OBJECT("items",1,"id")),"returned data for the wrong id")
 D ASSERT(21798,$G(OBJECT("items",2,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853133,$G(OBJECT("items",2,"timestamp")),"returned data for timestamp didn't match")
 D ASSERT("vler-sync-request",$G(OBJECT("items",2,"type")),"returned data for timestamp didn't match")
 D ASSERT(6,$G(OBJECT("items",2,"id")),"returned data for the wrong id")
 D ASSERT(21799,$G(OBJECT("items",3,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853134,$G(OBJECT("items",3,"timestamp")),"returned data for timestamp didn't match")
 D ASSERT("jmeadows-sync-request",$G(OBJECT("items",3,"type")),"returned data for timestamp didn't match")
 D ASSERT(11,$G(OBJECT("items",3,"id")),"returned data for the wrong id")
 D ASSERT("",$G(OBJECT("items",4,"jobId")),"more objects returned than there should be")
 D ASSERT("",$G(OBJECT("items",4,"timestamp")),"more objects returned than there should be")
 D ASSERT("",$G(OBJECT("items",4,"type")),"more objects returned than there should be")
 D ASSERT("",$G(OBJECT("items",4,"id")),"more objects returned than there should be")
 ;
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K ARG,BODY,RETURN,OBJECT
 ; Get using startid, start, and limit
 S ARGS("startid")=15
 S ARGS("start")=2
 S ARGS("limit")=2
 D GET^VPRJERR(.DATA,.ARGS)
 D:$D(DATA) DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT(21801,$G(OBJECT("items",1,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853136,$G(OBJECT("items",1,"timestamp")),"returned data for timestamp didn't match")
 D ASSERT("hdr-sync-request",$G(OBJECT("items",1,"type")),"returned data for timestamp didn't match")
 D ASSERT(17,$G(OBJECT("items",1,"id")),"returned data for the wrong id")
 D ASSERT(21802,$G(OBJECT("items",2,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853137,$G(OBJECT("items",2,"timestamp")),"returned data for timestamp didn't match")
 D ASSERT("hdr-sync-request",$G(OBJECT("items",2,"type")),"returned data for timestamp didn't match")
 D ASSERT(23,$G(OBJECT("items",2,"id")),"returned data for the wrong id")
 D ASSERT("",$G(OBJECT("items",3,"jobId")),"more objects returned than there should be")
 D ASSERT("",$G(OBJECT("items",3,"timestamp")),"more objects returned than there should be")
 D ASSERT("",$G(OBJECT("items",3,"type")),"more objects returned than there should be")
 D ASSERT("",$G(OBJECT("items",3,"id")),"more objects returned than there should be")
 ;
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K ARG,BODY,RETURN,OBJECT
 ; Get using startid, start, limit, and filter
 S ARGS("startid")=4
 S ARGS("start")=2
 S ARGS("limit")=4
 S ARGS("filter")="or(eq(type,vler-sync-request),eq(type,store-record))"
 D GET^VPRJERR(.DATA,.ARGS)
 D:$D(DATA) DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT(21797,$G(OBJECT("items",1,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853132,$G(OBJECT("items",1,"timestamp")),"returned data for timestamp didn't match")
 D ASSERT("vler-sync-request",$G(OBJECT("items",1,"type")),"returned data for timestamp didn't match")
 D ASSERT(5,$G(OBJECT("items",1,"id")),"returned data for the wrong id")
 D ASSERT(21798,$G(OBJECT("items",2,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853133,$G(OBJECT("items",2,"timestamp")),"returned data for timestamp didn't match")
 D ASSERT("vler-sync-request",$G(OBJECT("items",2,"type")),"returned data for timestamp didn't match")
 D ASSERT(6,$G(OBJECT("items",2,"id")),"returned data for the wrong id")
 D ASSERT(21803,$G(OBJECT("items",3,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853138,$G(OBJECT("items",3,"timestamp")),"returned data for timestamp didn't match")
 D ASSERT("store-record",$G(OBJECT("items",3,"type")),"returned data for timestamp didn't match")
 D ASSERT(25,$G(OBJECT("items",3,"id")),"returned data for the wrong id")
 D ASSERT(21804,$G(OBJECT("items",4,"jobId")),"returned data for the wrong jobId")
 D ASSERT(1432037853139,$G(OBJECT("items",4,"timestamp")),"returned data for timestamp didn't match")
 D ASSERT("store-record",$G(OBJECT("items",4,"type")),"returned data for timestamp didn't match")
 D ASSERT(30,$G(OBJECT("items",4,"id")),"returned data for the wrong id")
 D ASSERT("",$G(OBJECT("items",5,"jobId")),"more objects returned than there should be")
 D ASSERT("",$G(OBJECT("items",5,"timestamp")),"more objects returned than there should be")
 D ASSERT("",$G(OBJECT("items",5,"type")),"more objects returned than there should be")
 D ASSERT("",$G(OBJECT("items",5,"id")),"more objects returned than there should be")
 Q
 ;
CLR ;; @TEST Clear ALL Store Data
 N ARG,ARGS,BODY,DATA,ERR,ERRNUM,ERRMSG,ERRPRE,HTTPERR,OBJECT,RESULT,RETURN
 D CLR^VPRJERR(.DATA,.ARGS)
 D:$D(DATA) DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(0,$D(^VPRJERR("2")),"Data exists in Store Error and it should not")
 D ASSERT("{}",$G(DATA),"DATA returned from a DELETE call (should not happen)")
 D ASSERT(10,$D(^VPRJERR),"Global not cleared")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;

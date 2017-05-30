VPRJTGDS ;KRM/CJE -- Unit Tests for CRUD operations for Generic Data Stores
 ;;1.0;JSON DATA STORE;;Jan 27, 2015
 ;
 ; Endpoints tested
 ; GET <store>/{uid} GET^VPRJGDS
 ; PUT <store/{uid} SET^VPRJGDS
 ; DELETE <store>/{uid} DEL^VPRJGDS
 ; GET <store> INFO^VPRJGDS
 ; POST <store> SET^VPRJGDS
 ; POST <store>/index CINDEX^VPRJGDS
 ; GET <store>/index/{indexName} INDEX^VPRJGDS
 ; POST <store>/template CTEMPLATE^VPRJGDS
 ; GET <store>/index/{indexName}/{template} INDEX^VPRJGDS
 ; DELETE <store> CLR^VPRJGDS
 Q
STARTUP  ; Run once before all tests
 ; ensure that we have a store for the unit tests
 N HTTPREQ,HTTPERR
 D ADDSTORE^VPRJCONFIG("ut")
 K ^||TMP("HTTPERR",$J)
 Q
SHUTDOWN ; Run once after all tests
 ; DELETE database test will remove the store from the database and route map
 K HTTPREQ
 K ^VPRMETA("collection","ut"),^VPRMETA("index","gdsutest"),^VPRMETA("index","gdsutest2"),^VPRMETA("index","gdsutest3")
 Q
TEARDOWN ; Run after each test
 K ^||TMP($J)
 K ^||TMP("HTTPERR",$J)
 Q
ASSERT(EXPECT,ACTUAL,MSG) ; for convenience
 D EQ^VPRJT(EXPECT,ACTUAL,$G(MSG))
 Q
 ;
SAMPLEDATA(ROLES,UID) ; Setup Session Data JSON for set
 ; special case to remove uid attribute from JSON
 Q:$G(UID)="null" "{""createDate"": {""date"": ""20000101120000000""},""lastLogin"": {""date"": ""20130526050000000""},""roles"": ["_ROLES_"]}"
 Q "{""createDate"": {""date"": ""20000101120000000""},""lastLogin"": {""date"": ""20130526050000000""},""roles"": ["_ROLES_"],""uid"": """_UID_"""}"
 ;
SAMPLEINDEX(NAME,FIELDS,SORT,TYPE) ; Setup Index data JSON for Create Index
 Q:$G(NAME)="null" "{""fields"": """_FIELDS_""",""sort"": """_SORT_""",""type"": """_TYPE_"""}"
 Q:$G(FIELDS)="null" "{""indexName"": """_NAME_""",""sort"": """_SORT_""",""type"": """_TYPE_"""}"
 Q:$G(SORT)="null" "{""indexName"": """_NAME_""",""fields"": """_FIELDS_""",""type"": """_TYPE_"""}"
 Q:$G(TYPE)="null" "{""indexName"": """_NAME_""",""fields"": """_FIELDS_""",""sort"": """_SORT_"""}"
 Q "{""indexName"": """_NAME_""",""fields"": """_FIELDS_""",""sort"": """_SORT_""",""type"": """_TYPE_"""}"
 ;
 ; Setup Template data JSON for Create Template
SAMPLETEMPLATE(NAME,DIRECTIVES,FIELDS)
 Q:$G(NAME)="null" "{""fields"": """_FIELDS_""",""directives"": """_DIRECTIVES_"""}"
 Q:$G(FIELDS)="null" "{""name"": """_NAME_""",""directives"": """_DIRECTIVES_"""}"
 Q:$G(DIRECTIVES)="null" "{""name"": """_NAME_""",""fields"": """_FIELDS_"""}"
 Q "{""name"": """_NAME_""",""fields"": """_FIELDS_""",""directives"": """_DIRECTIVES_"""}"
 ;
 ; Begin Test Suite
 ;
SETNOSTORE ;; @TEST Error code is set if no store in HTTPREQ
 N RETURN,BODY,ARG,HTTPERR
 ; Create sample JSON
 S BODY(1)=$$SAMPLEDATA("""ehmp-proxy""","urn:va:user:9E7A:10000000265")
 ; Send it to the URL
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRJUT("urn:va:user:9E7A:10000000265")),"Data stored when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(253,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 253 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
SETNOGLOBAL ;; @TEST Error code is set if no global is in VPRCONFIG
 N RETURN,BODY,ARG,HTTPERR,GLOBALSAVE
 ; Create sample JSON
 S BODY(1)=$$SAMPLEDATA("""ehmp-proxy""","urn:va:user:9E7A:10000000265")
 ; Kill off the global area for the test
 S GLOBALSAVE=^VPRCONFIG("store","ut","global")
 K ^VPRCONFIG("store","ut","global")
 ; Send it to the URL
 S HTTPREQ("store")="ut"
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRCONFIG("store","ut","global")),"VPRCONFIG global storage area exists and it shouldn't")
 D ASSERT(0,$D(^VPRJUT("urn:va:user:9E7A:10000000265")),"Data stored when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(253,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 253 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Restore the global area for the rest of the tests
 S ^VPRCONFIG("store","ut","global")=GLOBALSAVE
 Q
 ;
SETNOJSON ;; @TEST Error code is set if no JSON in body
 N RETURN,BODY,ARG,HTTPERR,GLOBALSAVE
 ; Send it to the URL
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRJUT),"Data stored when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(255,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 255 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
SETJSONERR ;; @TEST Error code is set if JSON is mangled in PUT/POST
 N RETURN,BODY,ARG,HTTPERR
 ; Create bad JSON
 S BODY(1)=$$SAMPLEDATA("""ehmp-proxy""","urn:va:user:9E7A:10000000265")
 S BODY(1)=BODY(1)_":"
 ; Send it to the URL
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRJUT("urn:va:user:9E7A:10000000265")),"Data stored when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(202,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 202 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
SETNOUID ;; @TEST POST with no UID
 N RETURN,BODY,ARG,HTTPERR
 ; Try with an empty string for the uid field
 S BODY(1)=$$SAMPLEDATA("""ehmp-proxy""","")
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT(10,$D(^VPRJUT("urn:va:ut:"_$G(^VPRJUT(0)))),"Data NOT stored when it should be")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:"_$G(^VPRJUT(0)),$G(^VPRJUT("urn:va:ut:"_$G(^VPRJUT(0)),"uid")),"The uid field was not stored correctly")
 D ASSERT("20130526050000000",$G(^VPRJUT("urn:va:ut:"_$G(^VPRJUT(0)),"lastLogin","date")),"The lastLogin.date attribute was not stored correctly")
 D ASSERT($G(RETURN),"/ut/"_"urn:va:ut:"_$G(^VPRJUT(0)),"The UID wasn't returned")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K BODY,RETURN,ARG
 ; Try with a non existent uid field
 ; "null" is a magic string to the SAMPLEDATA generator to prevent the uid field from even being passed
 S BODY(1)=$$SAMPLEDATA("""ehmp-proxy""","null")
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT(10,$D(^VPRJUT("urn:va:ut:"_$G(^VPRJUT(0)))),"Data NOT stored when it should be")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:"_$G(^VPRJUT(0)),$G(^VPRJUT("urn:va:ut:"_$G(^VPRJUT(0)),"uid")),"The uid field was not stored correctly")
 D ASSERT("20130526050000000",$G(^VPRJUT("urn:va:ut:"_$G(^VPRJUT(0)),"lastLogin","date")),"The lastLogin.date attribute was not stored correctly")
 D ASSERT($G(RETURN),"/ut/"_"urn:va:ut:"_$G(^VPRJUT(0)),"The UID wasn't returned")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
SET1 ;; @TEST PUT with UID
 N RETURN,BODY,ARG,HTTPERR
 S BODY(1)=$$SAMPLEDATA("""ehmp-proxy""","urn:va:ut:23")
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT(10,$D(^VPRJUT("urn:va:ut:23")),"Data NOT stored when it should be")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:23",$G(^VPRJUT("urn:va:ut:23","uid")),"The uid field was not stored correctly")
 D ASSERT("20130526050000000",$G(^VPRJUT("urn:va:ut:23","lastLogin","date")),"The lastLogin.date attribute was not stored correctly")
 D ASSERT($G(RETURN),"/ut/"_"urn:va:ut:23","The UID wasn't returned")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
SET2 ;; @TEST PUTing 2 items with UID
 N RETURN,BODY,ARG,HTTPERR
 S BODY(1)=$$SAMPLEDATA("""ehmp-proxy""","urn:va:ut:23")
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT(10,$D(^VPRJUT("urn:va:ut:23")),"Data NOT stored when it should be")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:23",$G(^VPRJUT("urn:va:ut:23","uid")),"The uid field was not stored correctly")
 D ASSERT("20130526050000000",$G(^VPRJUT("urn:va:ut:23","lastLogin","date")),"The lastLogin.date attribute was not stored correctly")
 D ASSERT("ehmp-proxy",$G(^VPRJUT("urn:va:ut:23","roles",1)),"The roles array (1) was not stored correctly")
 D ASSERT($G(RETURN),"/ut/"_"urn:va:ut:23","The UID wasn't returned")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K RETURN,BODY,ARG
 ; Update the record
 S BODY(1)=$$SAMPLEDATA("""ehmp-proxy"",""ehmp-test""","urn:va:ut:23")
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT(10,$D(^VPRJUT("urn:va:ut:23")),"Data NOT stored when it should be")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:23",$G(^VPRJUT("urn:va:ut:23","uid")),"The uid field was not stored correctly")
 D ASSERT("20130526050000000",$G(^VPRJUT("urn:va:ut:23","lastLogin","date")),"The lastLogin.date attribute was not stored correctly")
 D ASSERT("ehmp-proxy",$G(^VPRJUT("urn:va:ut:23","roles",1)),"The roles array (1) was not stored correctly")
 D ASSERT("ehmp-test",$G(^VPRJUT("urn:va:ut:23","roles",2)),"The roles array (2) was not stored correctly")
 D ASSERT($G(RETURN),"/ut/"_"urn:va:ut:23","The UID wasn't returned")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K RETURN,BODY,ARG
 ; Add a second one
 S BODY(1)=$$SAMPLEDATA("""ehmp-proxy"",""ehmp-test""","urn:va:ut:5")
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT(10,$D(^VPRJUT("urn:va:ut:5")),"Data NOT stored when it should be")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:5",$G(^VPRJUT("urn:va:ut:5","uid")),"The uid field was not stored correctly")
 D ASSERT("20130526050000000",$G(^VPRJUT("urn:va:ut:5","lastLogin","date")),"The lastLogin.date attribute was not stored correctly")
 D ASSERT("ehmp-proxy",$G(^VPRJUT("urn:va:ut:5","roles",1)),"The roles array (1) was not stored correctly")
 D ASSERT("ehmp-test",$G(^VPRJUT("urn:va:ut:5","roles",2)),"The roles array (2) was not stored correctly")
 D ASSERT($G(RETURN),"/ut/"_"urn:va:ut:5","The UID wasn't returned")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
SETCOLLISION ;; cause a collision and ensure everything works as intended
 Q
 ;
 ;
DELNOSTORE ;; @TEST Error code is set if no store in HTTPREQ
 N DATA,OBJECT,ERR,ARGS,HTTPERR
 ; Send it to the URL
 K HTTPREQ("store")
 D DEL^VPRJGDS(.DATA,.ARGS)
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(253,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 253 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
DELNOGLOBAL ;; @TEST Error code is set if no global is in VPRCONFIG
 N DATA,OBJECT,ERR,ARGS,HTTPERR,GLOBALSAVE
 ; Kill off the global area for the test
 S GLOBALSAVE=^VPRCONFIG("store","ut","global")
 K ^VPRCONFIG("store","ut","global")
 ; Send it to the URL
 S HTTPREQ("store")="ut"
 D DEL^VPRJGDS(.DATA,.ARGS)
 D ASSERT(0,$D(^VPRCONFIG("store","ut","global")),"VPRCONFIG global storage area exists and it shouldn't")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(253,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 253 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Restore the global area for the rest of the tests
 S ^VPRCONFIG("store","ut","global")=GLOBALSAVE
 Q
 ;
DELIDERR ;; @TEST Error code is set if no uid
 N DATA,OBJECT,ERR,ARGS,HTTPERR
 ; Try with a non existent uid
 D DEL^VPRJGDS(.DATA,.ARGS)
 D ASSERT(0,$D(DATA),"No DATA should be returned")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(111,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 111 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup vars
 K DATA,OBJECT,ERR,ARGS
 ; Try with a blank uid
 S ARGS("uid")=""
 D DEL^VPRJGDS(.DATA,.ARGS)
 D ASSERT(0,$D(DATA),"No DATA should be returned")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(111,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 111 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
DEL ;; @TEST Delete Data
 N RETURN,BODY,ARG,DATA,ARGS,OBJECT,ERR,HTTPERR
 ; delete it
 S ARGS("uid")="urn:va:ut:23"
 D DEL^VPRJGDS(.DATA,.ARGS)
 D DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(0,$D(^VPRJUT("urn:va:ut:23")),"Data exists and it should not")
 D ASSERT(0,$D(^VPRJUTJ("JSON","urn:va:ut:23")),"Data exists and it should not")
 D ASSERT("{""ok"": true}",$G(DATA),"DATA returned from a DELETE call (should not happen)")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
 ;
INFONOSTORE ;; @TEST Error code is set if no store in HTTPREQ
 N DATA,OBJECT,ERR,ARGS,HTTPERR
 ; Send it to the URL
 K HTTPREQ("store")
 D INFO^VPRJGDS(.DATA,.ARGS)
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(253,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 253 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
INFONOGLOBAL ;; @TEST Error code is set if no global is in VPRCONFIG
 N DATA,OBJECT,ERR,ARGS,HTTPERR,GLOBALSAVE
 ; Kill off the global area for the test
 S GLOBALSAVE=^VPRCONFIG("store","ut","global")
 K ^VPRCONFIG("store","ut","global")
 ; Send it to the URL
 S HTTPREQ("store")="ut"
 D INFO^VPRJGDS(.DATA,.ARGS)
 D ASSERT(0,$D(^VPRCONFIG("store","ut","global")),"VPRCONFIG global storage area exists and it shouldn't")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(253,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 253 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Restore the global area for the rest of the tests
 S ^VPRCONFIG("store","ut","global")=GLOBALSAVE
 Q
 ;
INFO ;; @TEST Get database information
 N RETURN,BODY,ARG,DATA,ARGS,OBJECT,ERR,HTTPERR,COUNT
 ; GET the database info
 D INFO^VPRJGDS(.DATA,.ARGS)
 D DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J)),"An HTTP Error Occured")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 ; only test the info that is supported
 D ASSERT("ut",$G(OBJECT("db_name")),"The db_name doesn't match")
 D ASSERT(1,$G(OBJECT("disk_format_version")),"The disk_format_version doesn't match")
 D ASSERT(1,$D(OBJECT("doc_count")),"The doc_count doesn't match")
 ; save off the count so we can prove it works
 S COUNT=$G(OBJECT("doc_count"))
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K OBJECT,DATA,ERR,ARGS
 ; Create more data to test count
 S BODY(1)=$$SAMPLEDATA("""ehmp-proxy""","")
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT(10,$D(^VPRJUT("urn:va:ut:"_$G(^VPRJUT(0)))),"Data NOT stored when it should be")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:"_$G(^VPRJUT(0)),$G(^VPRJUT("urn:va:ut:"_$G(^VPRJUT(0)),"uid")),"The uid field was not stored correctly")
 D ASSERT("20130526050000000",$G(^VPRJUT("urn:va:ut:"_$G(^VPRJUT(0)),"lastLogin","date")),"The lastLogin.date attribute was not stored correctly")
 D ASSERT($G(RETURN),"/ut/"_"urn:va:ut:"_$G(^VPRJUT(0)),"The UID wasn't returned")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K BODY,RETURN,ARG
 ; Now get the database info, we only have to test count
 D INFO^VPRJGDS(.DATA,.ARGS)
 D DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J)),"An HTTP Error Occured")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 ; ensure the count is one more than last time
 D ASSERT(COUNT+1,$G(OBJECT("doc_count")),"The doc_count doesn't match")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
 ;
GETNOSTORE ;; @TEST Error code is set if no store in HTTPREQ
 N DATA,OBJECT,ERR,ARGS,HTTPERR
 ; Send it to the URL
 K HTTPREQ("store")
 D GET^VPRJGDS(.DATA,.ARGS)
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(253,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 253 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
GETNOGLOBAL ;; @TEST Error code is set if no global is in VPRCONFIG
 N DATA,OBJECT,ERR,ARGS,HTTPERR,GLOBALSAVE
 ; Kill off the global area for the test
 S GLOBALSAVE=^VPRCONFIG("store","ut","global")
 K ^VPRCONFIG("store","ut","global")
 ; Send it to the URL
 S HTTPREQ("store")="ut"
 D GET^VPRJGDS(.DATA,.ARGS)
 D ASSERT(0,$D(^VPRCONFIG("store","ut","global")),"VPRCONFIG global storage area exists and it shouldn't")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(253,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 253 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Restore the global area for the rest of the tests
 S ^VPRCONFIG("store","ut","global")=GLOBALSAVE
 Q
 ;
GETNOID ;; @TEST Data is returned if no uid passed
 N DATA,ARGS,OBJECT,HTTPERR
 ; Try with a non existent uid attribute
 D GET^VPRJGDS(.DATA,.ARGS)
 D:$G(DATA)'="" DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(1,$D(DATA),"DATA should be returned")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:7",$G(OBJECT("items",4,"uid")),"The uid field was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K DATA,OBJECT,ARGS,ERR
 ; Try with a null uid
 S ARGS("uid")=""
 D GET^VPRJGDS(.DATA,.ARGS)
 D:$G(DATA)'="" DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(1,$D(DATA),"DATA should be returned")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:7",$G(OBJECT("items",4,"uid")),"The uid field was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
GETUIDUNK ;; @TEST Error code if uid doesn't exist
 N DATA,ARGS,OBJECT,HTTPERR
 ; Try with a non existent uid attribute
 S ARGS("uid")="urn:va:ut:1337"
 D GET^VPRJGDS(.DATA,.ARGS)
 D ASSERT(0,$D(DATA),"No DATA should be returned")
 D ASSERT(404,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 404 error should have occured")
 D ASSERT(229,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 229 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
GET ;; @TEST Get Single object
 N RETURN,ARG,BODY,DATA,ARGS,OBJECT,ERR,HTTPERR
 ; Get the data we've stored so far
 S ARGS("uid")="urn:va:ut:7"
 D GET^VPRJGDS(.DATA,.ARGS)
 D:$G(DATA)'="" DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(10,$D(^VPRJUT("urn:va:ut:7")),"Data does not exist and it should")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:7",$G(OBJECT("uid")),"The uid field was not returned correctly")
 D ASSERT("20130526050000000",$G(OBJECT("lastLogin","date")),"The lastLogin.date attribute was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K DATA,ARGS,OBJECT,ERR
 ; Get another object
 S ARGS("uid")="urn:va:ut:5"
 D GET^VPRJGDS(.DATA,.ARGS)
 D:$G(DATA)'="" DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(10,$D(^VPRJUT("urn:va:ut:5")),"Data does not exist and it should")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:5",$G(OBJECT("uid")),"The uid field was not returned correctly")
 D ASSERT("20130526050000000",$G(OBJECT("lastLogin","date")),"The lastLogin.date attribute was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("roles",1)),"The roles array (1) was not returned correctly")
 D ASSERT("ehmp-test",$G(OBJECT("roles",2)),"The roles array (2) was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
UPDATE ;; @TEST Update a record
 N RETURN,BODY,ARG,HTTPERR
 ; Store a record with more data first
 S BODY(1)=$$SAMPLEDATA("""ehmp-proxy"",""ehmp-test""","urn:va:ut:99")
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT(10,$D(^VPRJUT("urn:va:ut:99")),"Data NOT stored when it should be")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:99",$G(^VPRJUT("urn:va:ut:99","uid")),"The uid field was not stored correctly")
 D ASSERT("ehmp-proxy",$G(^VPRJUT("urn:va:ut:99","roles","1")),"The first role attribute in the array was not stored correctly")
 D ASSERT("ehmp-test",$G(^VPRJUT("urn:va:ut:99","roles","2")),"The second role attribute in the array was not stored correctly")
 D ASSERT($G(RETURN),"/ut/"_"urn:va:ut:99","The UID wasn't returned")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K RETURN,BODY,ARG,HTTPERR
 ; Store a record with less data
 S BODY(1)=$$SAMPLEDATA("""ehmp-test""","urn:va:ut:99")
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT(10,$D(^VPRJUT("urn:va:ut:99")),"Data NOT stored when it should be")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:99",$G(^VPRJUT("urn:va:ut:99","uid")),"The uid field was not stored correctly")
 D ASSERT("ehmp-test",$G(^VPRJUT("urn:va:ut:99","roles","1")),"The first role attribute in the array was not stored correctly")
 D ASSERT("",$G(^VPRJUT("urn:va:ut:99","roles","2")),"The second role attribute in the array was not stored correctly")
 D ASSERT($G(RETURN),"/ut/"_"urn:va:ut:99","The UID wasn't returned")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
GETFILTER ;; @TEST Get object with filter
 N RETURN,ARG,BODY,DATA,ARGS,OBJECT,ERR,HTTPERR
 ; Get with eq filter an exact match
 S ARGS("filter")="eq(""uid"",""urn:va:ut:7"")"
 D GET^VPRJGDS(.DATA,.ARGS)
 D:$G(DATA)'="" DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:7",$G(OBJECT("items",1,"uid")),"The uid field was not returned correctly")
 D ASSERT("20130526050000000",$G(OBJECT("items",1,"lastLogin","date")),"The lastLogin.date attribute was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K DATA,ARGS,OBJECT,ERR
 ; Get with eq filter a value in an array
 S ARGS("filter")="eq(""roles[]"",""ehmp-proxy"")"
 D GET^VPRJGDS(.DATA,.ARGS)
 D:$G(DATA)'="" DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:1",$G(OBJECT("items",1,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",1,"roles",1)),"The roles array (1) was not returned correctly")
 D ASSERT("urn:va:ut:2",$G(OBJECT("items",2,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",2,"roles",1)),"The roles array (1) was not returned correctly")
 D ASSERT("urn:va:ut:5",$G(OBJECT("items",3,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",3,"roles",1)),"The roles array (1) was not returned correctly")
 D ASSERT("ehmp-test",$G(OBJECT("items",3,"roles",2)),"The roles array (2) was not returned correctly")
 D ASSERT("urn:va:ut:7",$G(OBJECT("items",4,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",4,"roles",1)),"The roles array (1) was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K DATA,ARGS,OBJECT,ERR
 ; Get with eq filter a value in an array (two matches)
 S ARGS("filter")="eq(""roles[]"",""ehmp-test"")"
 D GET^VPRJGDS(.DATA,.ARGS)
 D:$G(DATA)'="" DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:5",$G(OBJECT("items",1,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",1,"roles",1)),"The roles array (1) was not returned correctly")
 D ASSERT("ehmp-test",$G(OBJECT("items",1,"roles",2)),"The roles array (2) was not returned correctly")
 D ASSERT("urn:va:ut:99",$G(OBJECT("items",2,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-test",$G(OBJECT("items",2,"roles",1)),"The roles array (2) was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K DATA,ARGS,OBJECT,ERR
 ; Get with complex filter (only one match)
 ; This is an implicit and
 S ARGS("filter")="eq(""roles[]"",""ehmp-test""),eq(""uid"",""urn:va:ut:99"")"
 D GET^VPRJGDS(.DATA,.ARGS)
 D:$G(DATA)'="" DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:99",$G(OBJECT("items",1,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-test",$G(OBJECT("items",1,"roles",1)),"The roles array (2) was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K DATA,ARGS,OBJECT,ERR
 ; Get with complex filter (multiple matches)
 ; This is an implicit and
 S ARGS("filter")="or(eq(""roles[]"",""ehmp-proxy""),eq(""uid"",""urn:va:ut:99""))"
 D GET^VPRJGDS(.DATA,.ARGS)
 D:$G(DATA)'="" DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:1",$G(OBJECT("items",1,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",1,"roles",1)),"The roles array (2) was not returned correctly")
 D ASSERT("urn:va:ut:2",$G(OBJECT("items",2,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",2,"roles",1)),"The roles array (2) was not returned correctly")
 D ASSERT("urn:va:ut:5",$G(OBJECT("items",3,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",3,"roles",1)),"The roles array (2) was not returned correctly")
 D ASSERT("urn:va:ut:7",$G(OBJECT("items",4,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",4,"roles",1)),"The roles array (2) was not returned correctly")
 D ASSERT("urn:va:ut:99",$G(OBJECT("items",5,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-test",$G(OBJECT("items",5,"roles",1)),"The roles array (2) was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
 ;
CINDEXNOSTORE ;; @TEST Create Index - Error code is set if no store in HTTPREQ
 N RETURN,BODY,ARG,HTTPERR
 K HTTPREQ
 ; Create sample JSON
 S BODY(1)=$$SAMPLEINDEX("gdsutest","roles[]","roles asc","attr")
 ; Send it to the URL
 S RETURN=$$CINDEX^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRJUTX("attr","gdsutest")),"Index created when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(253,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 253 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 S HTTPREQ("store")="ut"
 Q
 ;
CINDEXNOGLOBAL ;; @TEST Error code is set if no global is in VPRCONFIG
 N RETURN,BODY,ARG,HTTPERR,GLOBALSAVE
 ; Create sample JSON
 S BODY(1)=$$SAMPLEINDEX("gdsutest","roles[]","roles asc","attr")
 ; Kill off the global area for the test
 S GLOBALSAVE=^VPRCONFIG("store","ut","global")
 K ^VPRCONFIG("store","ut","global")
 ; Send it to the URL
 S HTTPREQ("store")="ut"
 S RETURN=$$CINDEX^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRCONFIG("store","ut","global")),"VPRCONFIG global storage area exists and it shouldn't")
 D ASSERT(0,$D(^VPRJUTX("attr","gdsutest")),"Index created when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(253,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 253 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Restore the global area for the rest of the tests
 S ^VPRCONFIG("store","ut","global")=GLOBALSAVE
 Q
 ;
CINDEXNOJSON ;; @TEST Error code is set if no JSON in body
 N RETURN,BODY,ARG,HTTPERR,GLOBALSAVE
 ; Send it to the URL
 S RETURN=$$CINDEX^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRJUTX("attr","gdsutest")),"Index created when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(255,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 255 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
CINDEXJSONERR ;; @TEST Error code is set if JSON is mangled in PUT/POST
 N RETURN,BODY,ARG,HTTPERR
 ; Create bad JSON
 S BODY(1)=$$SAMPLEINDEX("gdsutest","roles[]","roles asc","attr")
 S BODY(1)=BODY(1)_":"
 ; Send it to the URL
 S RETURN=$$CINDEX^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRJUTX("attr","gdsutest")),"Index created when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(202,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 202 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
CINDEXMFIELDS ;; @TEST POST without required fields
 N RETURN,BODY,ARG,HTTPERR
 ; Try with an empty string for the name
 S BODY(1)=$$SAMPLEINDEX("","roles[]","roles asc","attr")
 S RETURN=$$CINDEX^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRJUTX("attr","gdsutest")),"Index created when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should have occured")
 D ASSERT(273,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 273 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K BODY,RETURN,ARG
 ;
 ; Try with an empty string for the fields
 S BODY(1)=$$SAMPLEINDEX("gdsutest","","roles asc","attr")
 S RETURN=$$CINDEX^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRJUTX("attr","gdsutest")),"Index created when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should have occured")
 D ASSERT(273,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 273 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K BODY,RETURN,ARG
 ;
 ; Try with an empty string for the sort
 S BODY(1)=$$SAMPLEINDEX("gdsutest","roles[]","","attr")
 S RETURN=$$CINDEX^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRJUTX("attr","gdsutest")),"Index created when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should have occured")
 D ASSERT(273,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 273 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K BODY,RETURN,ARG
  ;
 ; Try with an empty string for the type
 S BODY(1)=$$SAMPLEINDEX("gdsutest","roles[]","roles asc","")
 S RETURN=$$CINDEX^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRJUTX("attr","gdsutest")),"Index created when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should have occured")
 D ASSERT(273,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 273 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K BODY,RETURN,ARG
 ;
 ; Try with an empty string for all
 S BODY(1)=$$SAMPLEINDEX("","","","")
 S RETURN=$$CINDEX^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRJUTX("attr","gdsutest")),"Index created when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should have occured")
 D ASSERT(273,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 273 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K BODY,RETURN,ARG
 ;
 ; Try with a non existent name
 ; "null" is a magic string to the SAMPLEINDEX generator to prevent the field from even being passed
 S BODY(1)=$$SAMPLEINDEX("null","roles[]","roles asc","attr")
 S RETURN=$$CINDEX^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRJUTX("attr","gdsutest")),"Index created when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should have occured")
 D ASSERT(273,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 273 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ;
 ; Try with a non existent fields
 ; "null" is a magic string to the SAMPLEINDEX generator to prevent the field from even being passed
 S BODY(1)=$$SAMPLEINDEX("gdsutest","null","roles asc","attr")
 S RETURN=$$CINDEX^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRJUTX("attr","gdsutest")),"Index created when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should have occured")
 D ASSERT(273,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 273 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ;
 ; Try with a non existent sort
 ; "null" is a magic string to the SAMPLEINDEX generator to prevent the field from even being passed
 S BODY(1)=$$SAMPLEINDEX("gdsutest","roles[]","null","attr")
 S RETURN=$$CINDEX^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRJUTX("attr","gdsutest")),"Index created when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should have occured")
 D ASSERT(273,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 273 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ;
 ; Try with a non existent type
 ; "null" is a magic string to the SAMPLEINDEX generator to prevent the field from even being passed
 S BODY(1)=$$SAMPLEINDEX("gdsutest","roles[]","roles asc","null")
 S RETURN=$$CINDEX^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRJUTX("attr","gdsutest")),"Index created when it shouldn't be")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should have occured")
 D ASSERT(273,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 273 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
CINDEX1 ;; @TEST Create 1 index (happy path)
 N RETURN,BODY,ARG,HTTPERR
 S BODY(1)=$$SAMPLEINDEX("gdsutest","roles[]","roles asc","attr")
 S RETURN=$$CINDEX^VPRJGDS(.ARG,.BODY)
 D ASSERT(11,$D(^VPRJUTX("attr","gdsutest")),"Index NOT created when it should be")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT(1,$D(^VPRJUTX("attr","gdsutest","ehmp-proxy ","urn:va:ut:1","roles#1")),"The first role type is not as expected")
 D ASSERT(1,$D(^VPRJUTX("attr","gdsutest","ehmp-test ","urn:va:ut:5","roles#2")),"The second role type is not as expected")
 D ASSERT(10,$D(^VPRCONFIG("store","ut","index","gdsutest")),"Index Not stored in VPRJCONFIG")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
CINDEX2 ;; @TEST Creating 2 (additional) indexes
 N RETURN,BODY,ARG,HTTPERR
 S BODY(1)=$$SAMPLEINDEX("gdsutest2","lastLogin.date","date asc","attr")
 S RETURN=$$CINDEX^VPRJGDS(.ARG,.BODY)
 D ASSERT(11,$D(^VPRJUTX("attr","gdsutest2")),"Index NOT created when it should be")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT(1,$D(^VPRJUTX("attr","gdsutest2","20130526050000000 ","urn:va:ut:1",1)),"The first lastLogin.date index is not as expected")
 D ASSERT(1,$D(^VPRJUTX("attr","gdsutest2","20130526050000000 ","urn:va:ut:2",1)),"The second lastLogin.date index is not as expected")
 D ASSERT(10,$D(^VPRCONFIG("store","ut","index","gdsutest2")),"Index Not stored in VPRJCONFIG")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K RETURN,BODY,ARG
 ; Update the record
 S BODY(1)=$$SAMPLEINDEX("gdsutest3","createDate.date","date asc","attr")
 S RETURN=$$CINDEX^VPRJGDS(.ARG,.BODY)
 D ASSERT(11,$D(^VPRJUTX("attr","gdsutest3")),"Index NOT created when it should be")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT(1,$D(^VPRJUTX("attr","gdsutest3","20000101120000000 ","urn:va:ut:1",1)),"The first createDate.date index is not as expected")
 D ASSERT(1,$D(^VPRJUTX("attr","gdsutest3","20000101120000000 ","urn:va:ut:2",1)),"The second createDate.date index is not as expected")
 D ASSERT(10,$D(^VPRCONFIG("store","ut","index","gdsutest3")),"Index Not stored in VPRJCONFIG")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
 ;
INDEXNOSTORE ;; @TEST Error code is set if no store in HTTPREQ
 N DATA,OBJECT,ERR,ARGS,HTTPERR
 ; Send it to the URL
 K HTTPREQ("store")
 D INDEX^VPRJGDS(.DATA,.ARGS)
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(253,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 253 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
INDEXNOGLOBAL ;; @TEST Error code is set if no global is in VPRCONFIG
 N DATA,OBJECT,ERR,ARGS,HTTPERR,GLOBALSAVE
 ; Kill off the global area for the test
 S GLOBALSAVE=^VPRCONFIG("store","ut","global")
 K ^VPRCONFIG("store","ut","global")
 ; Send it to the URL
 S HTTPREQ("store")="ut"
 D INDEX^VPRJGDS(.DATA,.ARGS)
 D ASSERT(0,$D(^VPRCONFIG("store","ut","global")),"VPRCONFIG global storage area exists and it shouldn't")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(253,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 253 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Restore the global area for the rest of the tests
 S ^VPRCONFIG("store","ut","global")=GLOBALSAVE
 Q
 ;
INDEXNOINDEX ;; @TEST Error code is set if no index specified
 N DATA,OBJECT,ERR,ARGS,HTTPERR,GLOBALSAVE
 ; Try with non-existent indexName
 ; Send it to the URL
 D INDEX^VPRJGDS(.DATA,.ARGS)
 D ASSERT(0,$D(DATA),"DATA returned and there shouldn't be any")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(102,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 102 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Try with null indexName
 ; Send it to the URL
 S ARGS("indexName")=""
 D INDEX^VPRJGDS(.DATA,.ARGS)
 D ASSERT(0,$D(DATA),"DATA returned and there shouldn't be any")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(102,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 102 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
INDEX ;; @TEST Get via Index
 N RETURN,ARG,BODY,DATA,ARGS,OBJECT,ERR,HTTPERR
 N START,LIMIT,SIZE,PREAMBLE,RSP
 ; Setup paging info for PAGE^VPRJRUT
 S HTTPREQ("paging")=$G(HTTPARGS("start"),0)_":"_$G(HTTPARGS("limit"),999999)
 S START=$P(HTTPREQ("paging"),":"),LIMIT=$P(HTTPREQ("paging"),":",2)
 ;
 ; Get the data we've stored so far
 S ARGS("indexName")="gdsutest"
 D INDEX^VPRJGDS(.RSP,.ARGS)
 D PAGE^VPRJRUT(.RSP,START,LIMIT,.SIZE,.PREAMBLE)
 ; Emulate RESPOND^VPRJRSP to get a real JSON response
 S DATA(0)=PREAMBLE
 F I=START:1:(START+LIMIT-1) Q:'$D(@RSP@($J,I))  D
 . I I>START S DATA(I)="," ; separate items with a comma
 . S J="" F  S J=$O(@RSP@($J,I,J)) Q:'J  S DATA(I)=$G(DATA(I))_@RSP@($J,I,J)
 S DATA(I)="]}"
 D:$D(DATA) DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(10,$D(OBJECT("items")),"Data does not exist and it should")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:1",$G(OBJECT("items",1,"uid")),"The uid field was not returned correctly")
 D ASSERT("urn:va:ut:2",$G(OBJECT("items",2,"uid")),"The uid field was not returned correctly")
 D ASSERT("urn:va:ut:99",$G(OBJECT("items",5,"uid")),"The uid field was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K DATA,ARGS,OBJECT,ERR,RSP
 ; Get another object
 S ARGS("indexName")="gdsutest2"
 D INDEX^VPRJGDS(.RSP,.ARGS)
 D PAGE^VPRJRUT(.RSP,START,LIMIT,.SIZE,.PREAMBLE)
 ; Emulate RESPOND^VPRJRSP to get a real JSON response
 S DATA(0)=PREAMBLE
 F I=START:1:(START+LIMIT-1) Q:'$D(@RSP@($J,I))  D
 . I I>START S DATA(I)="," ; separate items with a comma
 . S J="" F  S J=$O(@RSP@($J,I,J)) Q:'J  S DATA(I)=$G(DATA(I))_@RSP@($J,I,J)
 S DATA(I)="]}"
 D:$D(DATA) DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(10,$D(OBJECT("items")),"Data does not exist and it should")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:1",$G(OBJECT("items",1,"uid")),"The uid field was not returned correctly")
 D ASSERT("urn:va:ut:2",$G(OBJECT("items",2,"uid")),"The uid field was not returned correctly")
 D ASSERT("urn:va:ut:99",$G(OBJECT("items",5,"uid")),"The uid field was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
DELETEITEMINDEX ;; @TEST deleted item isn't in Index
 N RETURN,ARG,BODY,DATA,ARGS,OBJECT,ERR,HTTPERR
 N START,LIMIT,SIZE,PREAMBLE,RSP
 ; Setup paging info for PAGE^VPRJRUT
 S HTTPREQ("paging")=$G(HTTPARGS("start"),0)_":"_$G(HTTPARGS("limit"),999999)
 S START=$P(HTTPREQ("paging"),":"),LIMIT=$P(HTTPREQ("paging"),":",2)
 ;
 ; delete an object
 S ARGS("uid")="urn:va:ut:99"
 D DEL^VPRJGDS(.DATA,.ARGS)
 K ARGS
 ; Get the data we've stored so far
 S ARGS("indexName")="gdsutest"
 D INDEX^VPRJGDS(.RSP,.ARGS)
 D PAGE^VPRJRUT(.RSP,START,LIMIT,.SIZE,.PREAMBLE)
 ; Emulate RESPOND^VPRJRSP to get a real JSON response
 S DATA(0)=PREAMBLE
 F I=START:1:(START+LIMIT-1) Q:'$D(@RSP@($J,I))  D
 . I I>START S DATA(I)="," ; separate items with a comma
 . S J="" F  S J=$O(@RSP@($J,I,J)) Q:'J  S DATA(I)=$G(DATA(I))_@RSP@($J,I,J)
 S DATA(I)="]}"
 D:$D(DATA) DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(10,$D(OBJECT("items")),"Data does not exist and it should")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:1",$G(OBJECT("items",1,"uid")),"The uid field was not returned correctly")
 D ASSERT("urn:va:ut:2",$G(OBJECT("items",2,"uid")),"The uid field was not returned correctly")
 D ASSERT("",$G(OBJECT("items",5,"uid")),"Object 99 exists and shouldn't")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K BODY,RETURN,ARG
 ; RE-add uid urn:va:ut:99
 S BODY(1)=$$SAMPLEDATA("""ehmp-test""","urn:va:ut:99")
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 Q
 ;
INDEXFILTER ;; @TEST Get index with filter
 N RETURN,ARG,BODY,DATA,ARGS,OBJECT,ERR,HTTPERR,I,J
 N START,LIMIT,SIZE,PREAMBLE,RSP
 ; Setup paging info for PAGE^VPRJRUT
 S HTTPREQ("paging")=$G(HTTPARGS("start"),0)_":"_$G(HTTPARGS("limit"),999999)
 S START=$P(HTTPREQ("paging"),":"),LIMIT=$P(HTTPREQ("paging"),":",2)
 K ^||TMP($J)
 ;
 ; Get Index with eq filter for an exact match
 S ARGS("indexName")="gdsutest"
 S ARGS("filter")="eq(""uid"",""urn:va:ut:7"")"
 D INDEX^VPRJGDS(.RSP,.ARGS)
 D PAGE^VPRJRUT(.RSP,START,LIMIT,.SIZE,.PREAMBLE)
 ; Emulate RESPOND^VPRJRSP to get a real JSON response
 S DATA(0)=PREAMBLE
 F I=START:1:(START+LIMIT-1) Q:'$D(@RSP@($J,I))  D
 . I I>START S DATA(I)="," ; separate items with a comma
 . S J="" F  S J=$O(@RSP@($J,I,J)) Q:'J  S DATA(I)=$G(DATA(I))_@RSP@($J,I,J)
 S DATA(I)="]}"
 D:$D(DATA)'="" DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:7",$G(OBJECT("items",1,"uid")),"The uid field was not returned correctly")
 D ASSERT("20130526050000000",$G(OBJECT("items",1,"lastLogin","date")),"The lastLogin.date attribute was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K ^||TMP($J)
 ; Cleanup Vars
 K DATA,ARGS,OBJECT,ERR,I,J,RSP
 ; Get Index with eq filter a value in an array
 S ARGS("indexName")="gdsutest"
 S ARGS("filter")="eq(""roles[]"",""ehmp-proxy"")"
 D INDEX^VPRJGDS(.RSP,.ARGS)
 D PAGE^VPRJRUT(.RSP,START,LIMIT,.SIZE,.PREAMBLE)
 ; Emulate RESPOND^VPRJRSP to get a real JSON response
 S DATA(0)=PREAMBLE
 F I=START:1:(START+LIMIT-1) Q:'$D(@RSP@($J,I))  D
 . I I>START S DATA(I)="," ; separate items with a comma
 . S J="" F  S J=$O(@RSP@($J,I,J)) Q:'J  S DATA(I)=$G(DATA(I))_@RSP@($J,I,J)
 S DATA(I)="]}"
 D:$D(DATA)'="" DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:1",$G(OBJECT("items",1,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",1,"roles",1)),"The roles array (1) was not returned correctly")
 D ASSERT("urn:va:ut:2",$G(OBJECT("items",2,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",2,"roles",1)),"The roles array (1) was not returned correctly")
 D ASSERT("urn:va:ut:5",$G(OBJECT("items",3,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",3,"roles",1)),"The roles array (1) was not returned correctly")
 D ASSERT("ehmp-test",$G(OBJECT("items",3,"roles",2)),"The roles array (2) was not returned correctly")
 D ASSERT("urn:va:ut:7",$G(OBJECT("items",4,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",4,"roles",1)),"The roles array (1) was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K ^||TMP($J)
 ; Cleanup Vars
 K DATA,ARGS,OBJECT,ERR,I,J,RSP
 ; Get with eq filter a value in an array (two matches)
 S ARGS("indexName")="gdsutest"
 S ARGS("filter")="eq(""roles[]"",""ehmp-test"")"
 D INDEX^VPRJGDS(.RSP,.ARGS)
 D PAGE^VPRJRUT(.RSP,START,LIMIT,.SIZE,.PREAMBLE)
 ; Emulate RESPOND^VPRJRSP to get a real JSON response
 S DATA(0)=PREAMBLE
 F I=START:1:(START+LIMIT-1) Q:'$D(@RSP@($J,I))  D
 . I I>START S DATA(I)="," ; separate items with a comma
 . S J="" F  S J=$O(@RSP@($J,I,J)) Q:'J  S DATA(I)=$G(DATA(I))_@RSP@($J,I,J)
 S DATA(I)="]}"
 D:$D(DATA)'="" DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:5",$G(OBJECT("items",1,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",1,"roles",1)),"The roles array (1) was not returned correctly")
 D ASSERT("ehmp-test",$G(OBJECT("items",1,"roles",2)),"The roles array (2) was not returned correctly")
 D ASSERT("urn:va:ut:99",$G(OBJECT("items",2,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-test",$G(OBJECT("items",2,"roles",1)),"The roles array (2) was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K ^||TMP($J)
 ; Cleanup Vars
 K DATA,ARGS,OBJECT,ERR,I,J,RSP
 ; Get with complex filter (only one match)
 ; This is an implicit and
 S ARGS("indexName")="gdsutest"
 S ARGS("filter")="eq(""roles[]"",""ehmp-test""),eq(""uid"",""urn:va:ut:99"")"
 D INDEX^VPRJGDS(.RSP,.ARGS)
 D PAGE^VPRJRUT(.RSP,START,LIMIT,.SIZE,.PREAMBLE)
 ; Emulate RESPOND^VPRJRSP to get a real JSON response
 S DATA(0)=PREAMBLE
 F I=START:1:(START+LIMIT-1) Q:'$D(@RSP@($J,I))  D
 . I I>START S DATA(I)="," ; separate items with a comma
 . S J="" F  S J=$O(@RSP@($J,I,J)) Q:'J  S DATA(I)=$G(DATA(I))_@RSP@($J,I,J)
 S DATA(I)="]}"
 D:$D(DATA)'="" DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:99",$G(OBJECT("items",1,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-test",$G(OBJECT("items",1,"roles",1)),"The roles array (2) was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K ^||TMP($J)
 ; Cleanup Vars
 K DATA,ARGS,OBJECT,ERR,I,J,RSP
 ; Get with complex filter (multiple matches)
 ; This is an implicit and
 S ARGS("indexName")="gdsutest"
 S ARGS("filter")="or(eq(""roles[]"",""ehmp-proxy""),eq(""uid"",""urn:va:ut:99""))"
 D INDEX^VPRJGDS(.RSP,.ARGS)
 D PAGE^VPRJRUT(.RSP,START,LIMIT,.SIZE,.PREAMBLE)
 ; Emulate RESPOND^VPRJRSP to get a real JSON response
 S DATA(0)=PREAMBLE
 F I=START:1:(START+LIMIT-1) Q:'$D(@RSP@($J,I))  D
 . I I>START S DATA(I)="," ; separate items with a comma
 . S J="" F  S J=$O(@RSP@($J,I,J)) Q:'J  S DATA(I)=$G(DATA(I))_@RSP@($J,I,J)
 S DATA(I)="]}"
 D:$D(DATA)'="" DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:1",$G(OBJECT("items",1,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",1,"roles",1)),"The roles array (2) was not returned correctly")
 D ASSERT("urn:va:ut:2",$G(OBJECT("items",2,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",2,"roles",1)),"The roles array (2) was not returned correctly")
 D ASSERT("urn:va:ut:5",$G(OBJECT("items",3,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",3,"roles",1)),"The roles array (2) was not returned correctly")
 D ASSERT("urn:va:ut:7",$G(OBJECT("items",4,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",4,"roles",1)),"The roles array (2) was not returned correctly")
 D ASSERT("urn:va:ut:99",$G(OBJECT("items",5,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-test",$G(OBJECT("items",5,"roles",1)),"The roles array (2) was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K ^||TMP($J)
 Q
 ;
INDEXRANGEFILTER ;; @TEST Get index with range and filter
 N RETURN,ARG,BODY,DATA,ARGS,OBJECT,ERR,HTTPERR,I,J
 N START,LIMIT,SIZE,PREAMBLE,RSP
 ; Setup paging info for PAGE^VPRJRUT
 S HTTPREQ("paging")=$G(HTTPARGS("start"),0)_":"_$G(HTTPARGS("limit"),999999)
 S START=$P(HTTPREQ("paging"),":"),LIMIT=$P(HTTPREQ("paging"),":",2)
 K ^||TMP($J)
 ;
 ; Get the data we've stored so far by range
 S ARGS("indexName")="gdsutest"
 S ARGS("range")="ehmp-test"
 D INDEX^VPRJGDS(.RSP,.ARGS)
 D PAGE^VPRJRUT(.RSP,START,LIMIT,.SIZE,.PREAMBLE)
 ; Emulate RESPOND^VPRJRSP to get a real JSON response
 S DATA(0)=PREAMBLE
 F I=START:1:(START+LIMIT-1) Q:'$D(@RSP@($J,I))  D
 . I I>START S DATA(I)="," ; separate items with a comma
 . S J="" F  S J=$O(@RSP@($J,I,J)) Q:'J  S DATA(I)=$G(DATA(I))_@RSP@($J,I,J)
 S DATA(I)="]}"
 D:$D(DATA)'="" DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(10,$D(OBJECT("items")),"Data does not exist and it should")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:5",$G(OBJECT("items",1,"uid")),"The uid field was not returned correctly")
 D ASSERT("urn:va:ut:99",$G(OBJECT("items",2,"uid")),"The uid field was not returned correctly")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K ^||TMP($J)
 ; Cleanup Vars
 K DATA,ARGS,OBJECT,ERR,I,J,RSP
 ;
 ; Get the data we've stored so far by range - no results
 S ARGS("indexName")="gdsutest"
 S ARGS("range")="z"
 D INDEX^VPRJGDS(.RSP,.ARGS)
 D PAGE^VPRJRUT(.RSP,START,LIMIT,.SIZE,.PREAMBLE)
 ; Emulate RESPOND^VPRJRSP to get a real JSON response
 S DATA(0)=PREAMBLE
 F I=START:1:(START+LIMIT-1) Q:'$D(@RSP@($J,I))  D
 . I I>START S DATA(I)="," ; separate items with a comma
 . S J="" F  S J=$O(@RSP@($J,I,J)) Q:'J  S DATA(I)=$G(DATA(I))_@RSP@($J,I,J)
 S DATA(I)="]}"
 ;D:$D(DATA)'="" DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(0,$D(@RSP@("data")),"Data does not exist and it should")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K ^||TMP($J)
 ; Cleanup Vars
 K DATA,ARGS,OBJECT,ERR,I,J,RSP
 ;
 ; Get with complex filter (multiple matches)
 ; This is an implicit and
 S ARGS("indexName")="gdsutest"
 S ARGS("filter")="or(eq(""roles[]"",""ehmp-proxy""),eq(""uid"",""urn:va:ut:99""))"
 S ARGS("range")="ehmp-proxy"
 D INDEX^VPRJGDS(.RSP,.ARGS)
 D PAGE^VPRJRUT(.RSP,START,LIMIT,.SIZE,.PREAMBLE)
 ; Emulate RESPOND^VPRJRSP to get a real JSON response
 S DATA(0)=PREAMBLE
 F I=START:1:(START+LIMIT-1) Q:'$D(@RSP@($J,I))  D
 . I I>START S DATA(I)="," ; separate items with a comma
 . S J="" F  S J=$O(@RSP@($J,I,J)) Q:'J  S DATA(I)=$G(DATA(I))_@RSP@($J,I,J)
 S DATA(I)="]}"
 D:$D(DATA)'="" DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:1",$G(OBJECT("items",1,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",1,"roles",1)),"The roles array (2) was not returned correctly")
 D ASSERT("urn:va:ut:2",$G(OBJECT("items",2,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",2,"roles",1)),"The roles array (2) was not returned correctly")
 D ASSERT("urn:va:ut:5",$G(OBJECT("items",3,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",3,"roles",1)),"The roles array (2) was not returned correctly")
 D ASSERT("urn:va:ut:7",$G(OBJECT("items",4,"uid")),"The uid field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",4,"roles",1)),"The roles array (2) was not returned correctly")
 D ASSERT(0,$D(OBJECT("items",5)),"More results returned than expected")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K ^||TMP($J)
 Q
 ;
PATCH1 ;; @TEST PATCH existing document
 N RETURN,BODY,ARG,HTTPERR
 S BODY(1)="{""lastLogin"": {""date"":""20160615120000000""}}"
 S ARG("uid")="urn:va:ut:23"
 S HTTPREQ("method")="PATCH"
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT(10,$D(^VPRJUT("urn:va:ut:23")),"Data NOT stored when it should be")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT("urn:va:ut:23",$G(^VPRJUT("urn:va:ut:23","uid")),"The uid field was not stored correctly")
 D ASSERT("20160615120000000",$G(^VPRJUT("urn:va:ut:23","lastLogin","date")),"The lastLogin.date attribute was not stored correctly")
 D ASSERT($G(RETURN),"/ut/"_"urn:va:ut:23","The UID wasn't returned")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K HTTPREQ("method")
 K BODY,RETURN,ARG
 ; Reset data back to what it was
 S BODY(1)="{""lastLogin"": {""date"":""20130526050000000""}}"
 S ARG("uid")="urn:va:ut:23"
 S HTTPREQ("method")="PATCH"
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K HTTPREQ("method")
 Q
 ;
PATCH2 ;; @TEST PATCH new document
 N RETURN,BODY,ARG,HTTPERR,UID
 S BODY(1)="{""lastLogin"": {""date"":""20160615120000000""}}"
 S HTTPREQ("method")="PATCH"
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 S UID="urn:va:ut:"_$G(^VPRJUT(0))
 D ASSERT(10,$D(^VPRJUT(UID)),"Data NOT stored when it should be")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT(UID,$G(^VPRJUT(UID,"uid")),"The uid field was not stored correctly")
 D ASSERT("20160615120000000",$G(^VPRJUT(UID,"lastLogin","date")),"The lastLogin.date attribute was not stored correctly")
 D ASSERT($G(RETURN),"/ut/"_UID,"The UID wasn't returned")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K HTTPREQ("method")
 Q
 ;
PATCH3 ;; @TEST PATCH new document
 N RETURN,BODY,ARG,HTTPERR
 S BODY(1)="{""lastLogin"": {""date"":""20160615120000000""},""uid"":99999}"
 S HTTPREQ("method")="PATCH"
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT(10,$D(^VPRJUT(99999)),"Data NOT stored when it should be")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT(99999,$G(^VPRJUT(99999,"uid")),"The uid field was not stored correctly")
 D ASSERT("20160615120000000",$G(^VPRJUT(99999,"lastLogin","date")),"The lastLogin.date attribute was not stored correctly")
 D ASSERT($G(RETURN),"/ut/"_99999,"The UID wasn't returned")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K HTTPREQ("method")
 Q
 ;
CTEMPLATENOSTORE ;; @TEST Create TEMPLATE - Error code is set if no store in HTTPREQ
 N RETURN,BODY,ARG,HTTPERR
 K HTTPREQ
 ; Create sample JSON
 S BODY(1)=$$SAMPLETEMPLATE("gdsutest","include, applyOnSave","roles")
 ; Send it to the URL
 S RETURN=$$CTEMPLATE^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRMETA("template","gdsutest")),"Template Not stored in VPRMETA")
 D ASSERT(0,$D(^VPRCONFIG("store","ut","template","gdsutest")),"Template Not stored in VPRJCONFIG")
 D ASSERT(0,$D(^VPRJUTJ("TEMPLATE")),"Templates applied to existing data")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(253,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 253 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 S HTTPREQ("store")="ut"
 Q
 ;
CTEMPLATENOGLOBAL ;; @TEST Error code is set if no global is in VPRCONFIG
 N RETURN,BODY,ARG,HTTPERR,GLOBALSAVE
 ; Create sample JSON
 S BODY(1)=$$SAMPLETEMPLATE("gdsutest","include, applyOnSave","roles")
 ; Kill off the global area for the test
 S GLOBALSAVE=^VPRCONFIG("store","ut","global")
 K ^VPRCONFIG("store","ut","global")
 ; Send it to the URL
 S HTTPREQ("store")="ut"
 S RETURN=$$CTEMPLATE^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRCONFIG("store","ut","global")),"VPRCONFIG global storage area exists and it shouldn't")
 D ASSERT(0,$D(^VPRMETA("template","gdsutest")),"Template Not stored in VPRMETA")
 D ASSERT(0,$D(^VPRCONFIG("store","ut","template","gdsutest")),"Template Not stored in VPRJCONFIG")
 D ASSERT(0,$D(^VPRJUTJ("TEMPLATE")),"Templates applied to existing data")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(253,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 253 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Restore the global area for the rest of the tests
 S ^VPRCONFIG("store","ut","global")=GLOBALSAVE
 Q
 ;
CTEMPLATENOJSON ;; @TEST Error code is set if no JSON in body
 N RETURN,BODY,ARG,HTTPERR,GLOBALSAVE
 ; Send it to the URL
 S RETURN=$$CTEMPLATE^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRMETA("template","gdsutest")),"Template Not stored in VPRMETA")
 D ASSERT(0,$D(^VPRCONFIG("store","ut","template","gdsutest")),"Template Not stored in VPRJCONFIG")
 D ASSERT(0,$D(^VPRJUTJ("TEMPLATE")),"Templates applied to existing data")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(255,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 255 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
CTEMPLATEJSONERR ;; @TEST Error code is set if JSON is mangled in PUT/POST
 N RETURN,BODY,ARG,HTTPERR
 ; Create bad JSON
 S BODY(1)=$$SAMPLETEMPLATE("gdsutest","include, applyOnSave","roles")
 S BODY(1)=BODY(1)_":"
 ; Send it to the URL
 S RETURN=$$CTEMPLATE^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRMETA("template","gdsutest")),"Template Not stored in VPRMETA")
 D ASSERT(0,$D(^VPRCONFIG("store","ut","template","gdsutest")),"Template Not stored in VPRJCONFIG")
 D ASSERT(0,$D(^VPRJUTJ("TEMPLATE")),"Templates applied to existing data")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 error should have occured")
 D ASSERT(202,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 202 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
CTEMPLATEMFIELDS ;; @TEST POST without required fields
 N RETURN,BODY,ARG,HTTPERR
 ; Try with an empty string for the name
 S BODY(1)=$$SAMPLETEMPLATE("","include, applyOnSave","roles")
 S RETURN=$$CTEMPLATE^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRMETA("template","gdsutest")),"Template Not stored in VPRMETA")
 D ASSERT(0,$D(^VPRCONFIG("store","ut","template","gdsutest")),"Template Not stored in VPRJCONFIG")
 D ASSERT(0,$D(^VPRJUTJ("TEMPLATE")),"Templates applied to existing data")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should have occured")
 D ASSERT(273,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 273 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K BODY,RETURN,ARG
 ;
 ; Try with an empty string for the directives
 S BODY(1)=$$SAMPLETEMPLATE("gdsutest","","roles")
 S RETURN=$$CTEMPLATE^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRMETA("template","gdsutest")),"Template Not stored in VPRMETA")
 D ASSERT(0,$D(^VPRCONFIG("store","ut","template","gdsutest")),"Template Not stored in VPRJCONFIG")
 D ASSERT(0,$D(^VPRJUTJ("TEMPLATE")),"Templates applied to existing data")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should have occured")
 D ASSERT(273,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 273 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K BODY,RETURN,ARG
 ;
 ; Try with an empty string for the fields
 S BODY(1)=$$SAMPLETEMPLATE("gdsutest","include, applyOnSave","")
 S RETURN=$$CTEMPLATE^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRMETA("template","gdsutest")),"Template Not stored in VPRMETA")
 D ASSERT(0,$D(^VPRCONFIG("store","ut","template","gdsutest")),"Template Not stored in VPRJCONFIG")
 D ASSERT(0,$D(^VPRJUTJ("TEMPLATE")),"Templates applied to existing data")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should have occured")
 D ASSERT(273,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 273 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K BODY,RETURN,ARG
 ;
 ; Try with an empty string for all
 S BODY(1)=$$SAMPLETEMPLATE("","","")
 S RETURN=$$CTEMPLATE^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRMETA("template","gdsutest")),"Template Not stored in VPRMETA")
 D ASSERT(0,$D(^VPRCONFIG("store","ut","template","gdsutest")),"Template Not stored in VPRJCONFIG")
 D ASSERT(0,$D(^VPRJUTJ("TEMPLATE")),"Templates applied to existing data")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should have occured")
 D ASSERT(273,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 273 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K BODY,RETURN,ARG
 ;
 ; Try with a non existent name
 ; "null" is a magic string to the SAMPLETEMPLATE generator to prevent the field from even being passed
 S BODY(1)=$$SAMPLETEMPLATE("null","include, applyOnSave","roles")
 S RETURN=$$CTEMPLATE^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRMETA("template","gdsutest")),"Template Not stored in VPRMETA")
 D ASSERT(0,$D(^VPRCONFIG("store","ut","template","gdsutest")),"Template Not stored in VPRJCONFIG")
 D ASSERT(0,$D(^VPRJUTJ("TEMPLATE")),"Templates applied to existing data")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should have occured")
 D ASSERT(273,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 273 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ;
 ; Try with a non existent directives
 ; "null" is a magic string to the SAMPLETEMPLATE generator to prevent the field from even being passed
 S BODY(1)=$$SAMPLETEMPLATE("gdsutest","null","roles")
 S RETURN=$$CTEMPLATE^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRMETA("template","gdsutest")),"Template Not stored in VPRMETA")
 D ASSERT(0,$D(^VPRCONFIG("store","ut","template","gdsutest")),"Template Not stored in VPRJCONFIG")
 D ASSERT(0,$D(^VPRJUTJ("TEMPLATE")),"Templates applied to existing data")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should have occured")
 D ASSERT(273,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 273 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ;
 ; Try with a non existent fields
 ; "null" is a magic string to the SAMPLETEMPLATE generator to prevent the field from even being passed
 S BODY(1)=$$SAMPLETEMPLATE("gdsutest","include, applyOnSave","null")
 S RETURN=$$CTEMPLATE^VPRJGDS(.ARG,.BODY)
 D ASSERT(0,$D(^VPRMETA("template","gdsutest")),"Template Not stored in VPRMETA")
 D ASSERT(0,$D(^VPRCONFIG("store","ut","template","gdsutest")),"Template Not stored in VPRJCONFIG")
 D ASSERT(0,$D(^VPRJUTJ("TEMPLATE")),"Templates applied to existing data")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should have occured")
 D ASSERT(273,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 273 reason code should have occurred")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
CTEMPLATE1 ;; @TEST Create 1 template (happy path)
 N RETURN,BODY,ARG,HTTPERR
 S BODY(1)=$$SAMPLETEMPLATE("gdsutest","include, applyOnSave","roles[]")
 S RETURN=$$CTEMPLATE^VPRJGDS(.ARG,.BODY)
 D ASSERT(10,$D(^VPRMETA("template","gdsutest")),"Template Not stored in VPRMETA")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT(10,$D(^VPRJUTJ("TEMPLATE","urn:va:ut:1","gdsutest")),"The gdsutest template is not applied as expected")
 D ASSERT(10,$D(^VPRJUTJ("TEMPLATE","urn:va:ut:5","gdsutest")),"The gdsutest template is not applied as expected")
 D ASSERT(10,$D(^VPRCONFIG("store","ut","template","gdsutest")),"Template Not stored in VPRJCONFIG")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
CTEMPLATE2 ;; @TEST Creating 2 (additional) templates
 N RETURN,BODY,ARG,HTTPERR
 S BODY(1)=$$SAMPLETEMPLATE("gdsutest2","include, applyOnSave","createDate.date")
 S RETURN=$$CTEMPLATE^VPRJGDS(.ARG,.BODY)
 D ASSERT(10,$D(^VPRMETA("template","gdsutest2")),"Template Not stored in VPRMETA")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT(10,$D(^VPRJUTJ("TEMPLATE","urn:va:ut:1","gdsutest2")),"The gdsutest2 template is not applied as expected")
 D ASSERT(10,$D(^VPRJUTJ("TEMPLATE","urn:va:ut:2","gdsutest2")),"The gdsutest2 template is not applied as expected")
 D ASSERT(10,$D(^VPRCONFIG("store","ut","template","gdsutest2")),"Template Not stored in VPRJCONFIG")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 ; Cleanup Vars
 K RETURN,BODY,ARG
 ; Update the record
 S BODY(1)=$$SAMPLETEMPLATE("gdsutest3","include, applyOnSave","roles[], createDate.date")
 S RETURN=$$CTEMPLATE^VPRJGDS(.ARG,.BODY)
 D ASSERT(10,$D(^VPRMETA("template","gdsutest3")),"Template Not stored in VPRMETA")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP error should NOT have occured")
 D ASSERT(10,$D(^VPRJUTJ("TEMPLATE","urn:va:ut:1","gdsutest3")),"The gdsutest3 template is not applied as expected")
 D ASSERT(10,$D(^VPRJUTJ("TEMPLATE","urn:va:ut:2","gdsutest3")),"The gdsutest3 template is not applied as expected")
 D ASSERT(10,$D(^VPRCONFIG("store","ut","template","gdsutest3")),"Template Not stored in VPRJCONFIG")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
GTEMPLATEINDEX ;; @TEST Retrieve data using previously built templates using an index
 N RETURN,ARG,BODY,DATA,ARGS,OBJECT,ERR,HTTPERR,I,J
 N START,LIMIT,SIZE,PREAMBLE,RSP
 ; Setup paging info for PAGE^VPRJRUT
 S HTTPREQ("paging")=$G(HTTPARGS("start"),0)_":"_$G(HTTPARGS("limit"),999999)
 S START=$P(HTTPREQ("paging"),":"),LIMIT=$P(HTTPREQ("paging"),":",2)
 K ^||TMP($J)
 ;
 ; Get Index with eq filter for an exact match
 S ARGS("indexName")="gdsutest"
 S ARGS("template")="gdsutest"
 D INDEX^VPRJGDS(.RSP,.ARGS)
 D PAGE^VPRJRUT(.RSP,START,LIMIT,.SIZE,.PREAMBLE)
 ; Emulate RESPOND^VPRJRSP to get a real JSON response
 S DATA(0)=PREAMBLE
 F I=START:1:(START+LIMIT-1) Q:'$D(@RSP@($J,I))  D
 . I I>START S DATA(I)="," ; separate items with a comma
 . S J="" F  S J=$O(@RSP@($J,I,J)) Q:'J  S DATA(I)=$G(DATA(I))_@RSP@($J,I,J)
 S DATA(I)="]}"
 D:$D(DATA)'="" DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",1,"roles",1)),"The roles field was not returned correctly")
 ;
 ;
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K ^||TMP($J)
 ; Cleanup Vars
 K DATA,ARGS,OBJECT,ERR,I,J,RSP
 ; Get Index with eq filter a value in an array
 S ARGS("indexName")="gdsutest"
 S ARGS("template")="gdsutest2"
 S ARGS("filter")="eq(""uid"",""urn:va:ut:2"")"
 D INDEX^VPRJGDS(.RSP,.ARGS)
 D PAGE^VPRJRUT(.RSP,START,LIMIT,.SIZE,.PREAMBLE)
 ; Emulate RESPOND^VPRJRSP to get a real JSON response
 S DATA(0)=PREAMBLE
 F I=START:1:(START+LIMIT-1) Q:'$D(@RSP@($J,I))  D
 . I I>START S DATA(I)="," ; separate items with a comma
 . S J="" F  S J=$O(@RSP@($J,I,J)) Q:'J  S DATA(I)=$G(DATA(I))_@RSP@($J,I,J)
 S DATA(I)="]}"
 D:$D(DATA)'="" DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("20000101120000000",$G(OBJECT("items",1,"createDate","date")),"The createDate.date field was not returned correctly")
 D ASSERT("",$G(OBJECT("items",1,"roles",1)),"The roles field was returned and it shouldn't")
 ;
 ;
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K ^||TMP($J)
 ; Cleanup Vars
 K DATA,ARGS,OBJECT,ERR,I,J,RSP
 ; Get the data we've stored so far by range
 S ARGS("indexName")="gdsutest"
 S ARGS("range")="ehmp-test"
 S ARGS("template")="gdsutest3"
 D INDEX^VPRJGDS(.RSP,.ARGS)
 D PAGE^VPRJRUT(.RSP,START,LIMIT,.SIZE,.PREAMBLE)
 ; Emulate RESPOND^VPRJRSP to get a real JSON response
 S DATA(0)=PREAMBLE
 F I=START:1:(START+LIMIT-1) Q:'$D(@RSP@($J,I))  D
 . I I>START S DATA(I)="," ; separate items with a comma
 . S J="" F  S J=$O(@RSP@($J,I,J)) Q:'J  S DATA(I)=$G(DATA(I))_@RSP@($J,I,J)
 S DATA(I)="]}"
 D:$D(DATA)'="" DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT(10,$D(OBJECT("items")),"Data does not exist and it should")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("20000101120000000",$G(OBJECT("items",1,"createDate","date")),"The createDate.date field was not returned correctly")
 D ASSERT("ehmp-proxy",$G(OBJECT("items",1,"roles",1)),"The roles field was not returned correctly")
 D ASSERT("20000101120000000",$G(OBJECT("items",2,"createDate","date")),"The createDate.date field was not returned correctly")
 D ASSERT("ehmp-test",$G(OBJECT("items",2,"roles",1)),"The roles field was not returned correctly")
 ;
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 K ^||TMP($J)
 Q
 ;
 ;
CLR ;; @TEST Clear ALL Generic Data Store data and route map
 N RETURN,BODY,ARG,DATA,ARGS,OBJECT,ERR,HTTPERR,URLMAPNUM
 D CLR^VPRJGDS(.DATA,.ARGS)
 D DECODE^VPRJSON("DATA","OBJECT","ERR")
 D ASSERT("{""ok"": true}",$G(DATA),"Invalid DATA returned from a DELETE call")
 ; Ensure global is cleared
 D ASSERT(0,$D(^VPRJUT),"Data exists and it should not")
 D ASSERT(0,$D(^VPRJUTJ),"JSON Data exists and it should not")
 D ASSERT(0,$D(^VPRJUTX),"Index Data exists and it should not")
 ; Ensure route map index doesn't contain data
 D ASSERT(0,$D(^VPRCONFIG("urlmap","index",HTTPREQ("store"))),"Route map still has entries for this data store and it should not")
 D ASSERT(0,$D(^VPRCONFIG("urlmap","index",HTTPREQ("store"))),"Route map still has entries for this data store and it should not")
 ; Ensure route map doesn't contain data
 S URLMAPNUM=""
 F  S URLMAPNUM=$O(^VPRCONFIG("urlmap",URLMAPNUM)) Q:URLMAPNUM=""  Q:URLMAPNUM'=+URLMAPNUM  D
 . I ^VPRCONFIG("urlmap",URLMAPNUM,"store")=HTTPREQ("store") D
 . . D ASSERT(0,$D(^VPRCONFIG("urlmap",URLMAPNUM,"store")),"Route map still has entries for this data store and it should not")
 ; Cleanup HTTPERR
 K ^||TMP("HTTPERR",$J)
 Q
 ;
 ;
RDKSESSION ;; @TEST Realistic RDK session store test
 N HTTPREQ,HTTPERR
 ; Create Store
 D ADDSTORE^VPRJCONFIG("utses")
 K ^||TMP("HTTPERR",$J)
 ; Add sample session
 N RETURN,BODY,ARG,HTTPREQ,DATA,ERR
 S HTTPREQ("store")="utses"
 S BODY(1)="{""uid"":""ZOUjqD3uh48eOuMrB4meSlCzcFV9IWv-"",""expires"":""2016-06-09T19:02:09.395Z"",""session"":{""cookie"":{""expires"":""2016-06-09T19:02:09.395Z"",""httpOnly"":true,""originalMaxAge"":899998,""path"":""/""},""csrf"":{""secret"":""v06210J1hu2MYpqUwg0IeJwZ""},""jwt"":{""secret"":""zTAhkVWhJ4DHC13_0lNSAyW5""},""user"":{""accessCode"":""REDACTED"",""consumerType"":""user"",""corsTabs"":""true"",""dgRecordAccess"":""false"",""dgSecurityOfficer"":""false"",""dgSensitiveAccess"":""false"",""disabled"":false,""division"":""500"",""divisionSelect"":false,""duz"":{""9E7A"":""10000000270""},""eHMPUIContext"":[{""lastAccessed"":""20160609103852321"",""patientId"":{""type"":""pid"",""value"":""9E7A;100022""},""patientIdentifier"":""pid:9E7A;100022"",""workspaceContext"":{""contextId"":""patient"",""workspaceId"":""overview""}},{""lastAccessed"":""20160609115349599"",""patientId"":{""type"":""pid"",""value"":""9E7A;3""},""patientIdentifier"":""pid:9E7A;3"",""workspaceContext"":{""contextId"":""patient"",""workspaceId"":""overview""}}],""expires"":""2016-06-09T19:02:09.395Z"",""facility"":""PANORAMA"",""firstname"":""PANORAMA"",""infoButtonOid"":""1.3.6.1.4.1.3768"",""lastname"":""USER"",""password"":""REDACTED"",""pcmm"":[{""roles"":[""NURSE (RN)"",""NURSE PRACTITIONER"",""OIF OEF CLINICAL CASE MANAGER"",""PHYSICIAN-ATTENDING"",""PHYSICIAN-PRIMARY CARE"",""RN CARE COORDINATOR"",""SOCIAL WORKER""],""service"":[""HOME TELEHEALTH"",""HOSPITAL MEDICINE"",""IMAGING"",""INFECTIOUS DISEASE""],""team"":[""TEAM1"",""TEAM2"",""TEAM3""]}],""permissionSets"":[""read-access"",""standard-doctor""],""permissions"":[""read-active-medication"",""read-allergy"",""read-clinical-reminder"",""read-community-health-summary"",""read-document"",""read-encounter"",""read-immunization"",""read-medication-review"",""read-order"",""read-patient-history"",""read-condition-problem"",""read-patient-record"",""access-stack-graph"",""read-task"",""read-vital"",""read-vista-health-summary"",""read-stack-graph"",""read-timeline"",""add-active-medication"",""add-allergy"",""add-condition-problem"",""add-consult-order"",""add-encounter"",""add-immunization"",""add-lab-order"",""add-med-order"",""add-non-va-medication"",""add-note"",""add-note-addendum"",""add-patient-history"",""add-radiology-order"",""add-task"",""add-vital"",""cancel-task"",""complete-consult-order"",""cosign-lab-order"",""cosign-med-order"",""cosign-note"",""cosign-radiology-order"",""delete-note"",""discontinue-active-medication"",""discontinue-consult-order"",""discontinue-lab-order"",""discontinue-med-order"",""discontinue-radiology-order"",""edit-active-medication"",""edit-allergy"",""edit-condition-problem"",""edit-consult-order"",""edit-encounter-form"",""edit-lab-order"",""edit-med-order"",""edit-non-va-medication"",""edit-note"",""edit-note-addendum"",""edit-patient-history"",""edit-radiology-order"",""edit-task"",""eie-allergy"",""eie-immunization"",""eie-patient-history"",""eie-vital"",""release-lab-order"",""release-med-order"",""release-radiology-order"",""remove-condition-problem"",""schedule-consult-order"",""sign-consult-order"",""sign-lab-order"",""sign-med-order"",""sign-note"",""sign-note-addendum"",""sign-radiology-order"",""triage-consult-order"",""abort-task"",""edit-encounter"",""eie-encounter"",""edit-immunization"",""edit-vital""],""provider"":true,""requiresReset"":false,""rptTabs"":""false"",""section"":""Medicine"",""sessionLength"":900000,""site"":""9E7A"",""ssn"":666441233,""title"":""Clinician"",""uid"":""urn:va:user:9E7A:10000000270"",""username"":""PW         "",""verifyCode"":""REDACTED"",""vistaKeys"":[""GMRA-SUPERVISOR"",""GMRC101"",""GMV MANAGER"",""ORES"",""PROVIDER"",""PSB CPRS MED BUTTON""],""vistaUserClass"":[{""role"":""USER"",""uid"":""urn:va:asu-class:9E7A:561""}]}}}"
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT(10,$D(^VPRJUTSES("ZOUjqD3uh48eOuMrB4meSlCzcFV9IWv-")),"Data NOT stored when it should be")
 ; Patch the expires date/times
 K BODY,ARG,RETURN
 S BODY(1)="{""expires"": ""2016-06-15T16:19:00.000Z"",""session"": {""cookie"": {""expires"":""2016-06-15T16:19:00.000Z""},""user"": {""expires"":""2016-06-15T16:19:00.000Z""}}}"
 D DECODE^VPRJSON("BODY","OBJECT","ERR")
 S HTTPREQ("method")="PATCH"
 S ARG("uid")="ZOUjqD3uh48eOuMrB4meSlCzcFV9IWv-"
 S RETURN=$$SET^VPRJGDS(.ARG,.BODY)
 D ASSERT("2016-06-15T16:19:00.000Z",$G(^VPRJUTSES("ZOUjqD3uh48eOuMrB4meSlCzcFV9IWv-","expires")),"object.expires not stored correctly")
 D ASSERT("2016-06-15T16:19:00.000Z",$G(^VPRJUTSES("ZOUjqD3uh48eOuMrB4meSlCzcFV9IWv-","session","cookie","expires")),"object.session.cookie.expires not stored correctly")
 D ASSERT("2016-06-15T16:19:00.000Z",$G(^VPRJUTSES("ZOUjqD3uh48eOuMrB4meSlCzcFV9IWv-","session","user","expires")),"object.session.user.expires not stored correctly")
 K BODY,ARG,RETURN,DATA,ERR,HTTPREQ("method")
 ; retrieve the object
 S ARG("uid")="ZOUjqD3uh48eOuMrB4meSlCzcFV9IWv-"
 D GET^VPRJGDS(.DATA,.ARG)
 D:$G(DATA)'="" DECODE^VPRJSON(DATA,"OBJECT","ERR")
 D ASSERT(10,$D(^VPRJUTSES("ZOUjqD3uh48eOuMrB4meSlCzcFV9IWv-")),"Data does not exist and it should")
 D ASSERT(0,$D(ERR),"A JSON Decode Error Occured")
 D ASSERT(0,$D(^||TMP("HTTPERR",$J,1,"error")),"An HTTP error should NOT have occured")
 D ASSERT("ZOUjqD3uh48eOuMrB4meSlCzcFV9IWv-",$G(OBJECT("uid")),"The uid field was not returned correctly")
 D ASSERT("2016-06-15T16:19:00.000Z",$G(OBJECT("expires")),"object.expires not stored correctly")
 D ASSERT("2016-06-15T16:19:00.000Z",$G(OBJECT("session","cookie","expires")),"object.session.cookie.expires not stored correctly")
 D ASSERT("2016-06-15T16:19:00.000Z",$G(OBJECT("session","user","expires")),"object.session.user.expires not stored correctly")
 K BODY,ARG,RETURN,DATA,ERR,HTTPREQ("method")
 ; delete an object
 S ARGS("uid")="ZOUjqD3uh48eOuMrB4meSlCzcFV9IWv-"
 D DEL^VPRJGDS(.DATA,.ARGS)
 D ASSERT(0,$D(^VPRJUTSES("ZOUjqD3uh48eOuMrB4meSlCzcFV9IWv-")),"Session still exists and shouldn't")
 K ARGS,DATA
 ; Kill the data stores
 D CLR
 Q

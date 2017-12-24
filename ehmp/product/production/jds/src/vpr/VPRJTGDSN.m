VPRJTGDSN ;V4W/DLW -- Unit tests for generic data store wrapper code for pjdsClient using cache.node
 ;
STARTUP  ; Run once before all tests
 QUIT
 ;
SHUTDOWN ; Run once after all tests
 QUIT
 ;
SETUP    ; Run before each test
 K ^||TMP
 QUIT
 ;
TEARDOWN ; Run after each test
 K ^||TMP
 QUIT
 ;
ASSERT(EXPECT,ACTUAL,MSG) ; convenience
 D EQ^VPRJT(EXPECT,ACTUAL,$G(MSG))
 QUIT
 ;
 ;
CREATEDBMISSINGSTORE ;; @TEST create new data store with empty store name
 N ERROR,RESULT,STORE,UUID
 S STORE=""
 ;
 S RESULT=$$CREATEDB^VPRJGDSN(STORE)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Store name too long or not specified",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(252,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
CREATEDBLONGSTORE ;; @TEST create new data store with a store name that is too long
 N ERROR,RESULT,STORE,UUID
 S STORE="testdatastore"
 ;
 S RESULT=$$CREATEDB^VPRJGDSN(STORE)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Store name too long or not specified",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(252,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
CREATEDBBADSTORE ;; @TEST create new data store with a bad store name
 N ERROR,RESULT,STORE,UUID
 S STORE="test+store"
 ;
 S RESULT=$$CREATEDB^VPRJGDSN(STORE)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Store name too long or not specified",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(252,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
CREATEDB ;; @TEST create new data store successfully
 N ERROR,RESULT,STORE,UUID
 S STORE="teststore"
 ;
 S RESULT=$$CREATEDB^VPRJGDSN(STORE)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(0,ERROR)
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT("",$G(^TMP(UUID,$J)))
 ;
 ; cleanup ^TMP
 K ^TMP(UUID,$J)
 ;
 QUIT
 ;
GETINFOMISSINGSTORE ;; @TEST get store info with empty store name
 N ERROR,RESULT,STORE,UUID
 S STORE=""
 ;
 S RESULT=$$INFO^VPRJGDSN(STORE)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("JDS isn't setup correctly, run VPRJCONFIG",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(253,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
GETINFO ;; @TEST get store info successfully
 N ERROR,RESULT,STORE,UUID
 S STORE="teststore"
 ;
 S RESULT=$$INFO^VPRJGDSN(STORE)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(0,ERROR)
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT("{""committed_update_seq"":0,""compact_running"":false,""data_size"":0,""db_name"":""teststore"",",$G(^TMP(UUID,$J,1)))
 D ASSERT("""disk_format_version"":1,""disk_size"":0,""doc_count"":0,""doc_del_count"":0,""instance_start_time"":0,",$G(^TMP(UUID,$J,2)))
 D ASSERT("""purge_seq"":0,""update_seq"":0}",$G(^TMP(UUID,$J,3)))
 ;
 ; cleanup ^TMP
 K ^TMP(UUID,$J)
 ;
 QUIT
 ;
SETDATAMISSINGSTORE ;; @TEST add data to store with empty store name
 N ERROR,PATCH,NODEUUID,RESULT,STORE,UID,UUID
 S STORE=""
 S UID="urn:va:teststore:1"
 S PATCH="false"
 S NODEUUID="1s4a817b-93ff-4e7f-8af4-0de4a2498329"
 ;
 S ^TMP("BODY",NODEUUID,$J,"data",1)="{""authorUid"":""urn:va:user:SITE:3"",""displayName"":""Rheumatology"",""domain"":""test-data"",""ehmpState"":""active""}"
 ;
 S RESULT=$$SET^VPRJGDSN(STORE,UID,PATCH,NODEUUID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("JDS isn't setup correctly, run VPRJCONFIG",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(253,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
SETDATAWITHUID ;; @TEST add data to store passing uid successfully
 N ERROR,PATCH,NODEUUID,RESULT,STORE,UID,UUID
 S STORE="teststore"
 S UID="urn:va:teststore:1"
 S PATCH="false"
 S NODEUUID="1s4a817b-93ff-4e7f-8af4-0de4a2498329"
 ;
 S ^TMP("BODY",NODEUUID,$J,"data",1)="{""authorUid"":""urn:va:user:SITE:3"",""displayName"":""Rheumatology"",""domain"":""test-data"",""ehmpState"":""active""}"
 ;
 S RESULT=$$SET^VPRJGDSN(STORE,UID,PATCH,NODEUUID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(0,ERROR)
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT("",$G(^TMP(UUID,$J)))
 ;
 ; cleanup ^TMP
 K ^TMP(UUID,$J)
 ;
 QUIT
 ;
SETDATAWITHOUTUID ;; @TEST add data to store without passing uid successfully
 N ERROR,PATCH,NODEUUID,RESULT,STORE,UID,UUID
 S STORE="teststore"
 S UID=""
 S PATCH="false"
 S NODEUUID="1s4a817b-93ff-4e7f-8af4-0de4a2498330"
 ;
 S ^TMP("BODY",NODEUUID,$J,"data",1)="{""authorUid"":""urn:va:user:SITE:5"",""displayName"":""Consult"",""domain"":""test-data"",""ehmpState"":""passive""}"
 ;
 S RESULT=$$SET^VPRJGDSN(STORE,UID,PATCH,NODEUUID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(0,ERROR)
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT("",$G(^TMP(UUID,$J)))
 ;
 ; cleanup ^TMP
 K ^TMP(UUID,$J)
 ;
 QUIT
 ;
GETDATAMISSINGSTORE ;; @TEST get store data with empty store name
 N ERROR,RESULT,STORE,UID,UUID
 S STORE=""
 S UID="urn:va:teststore:1"
 ;
 S RESULT=$$GET^VPRJGDSN(STORE,UID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("JDS isn't setup correctly, run VPRJCONFIG",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(253,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
GETDATAWITHUID ;; @TEST get store data with a uid successfully
 N ERROR,RESULT,STORE,UID,UUID
 S STORE="teststore"
 S UID="urn:va:teststore:1"
 ;
 S RESULT=$$GET^VPRJGDSN(STORE,UID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(0,ERROR)
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT("{""authorUid"":""urn:va:user:SITE:3"",""displayName"":""Rheumatology"",""domain"":""test-data"",""ehmpState"":""active""}",$G(^TMP(UUID,$J,1)))
 ;
 ; cleanup ^TMP
 K ^TMP(UUID,$J)
 ;
 QUIT
 ;
GETDATAWITHOUTUID ;; @TEST get store data without a uid successfully
 N ERROR,RESULT,STORE,UID,UUID
 S STORE="teststore"
 S UID=""
 ;
 S RESULT=$$GET^VPRJGDSN(STORE,UID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(0,ERROR)
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT("{""authorUid"":""urn:va:user:SITE:3"",""displayName"":""Rheumatology"",""domain"":""test-data"",""ehmpState"":""active""}",$G(^TMP(UUID,$J,0,1)))
 D ASSERT("{""authorUid"":""urn:va:user:SITE:5"",""displayName"":""Consult"",""domain"":""test-data"",""ehmpState"":""passive"",",$G(^TMP(UUID,$J,1,1)))
 D ASSERT("""uid"":""urn:va:teststore:2""}",$G(^TMP(UUID,$J,1,2)))
 D ASSERT("]}",$G(^TMP(UUID,$J,"POSTAMBLE")))
 D ASSERT("{""items"":[",$G(^TMP(UUID,$J,"PREAMBLE")))
 D ASSERT(200,$G(^TMP(UUID,$J,"STATUS")))
 ;
 ; cleanup ^TMP
 K ^TMP(UUID,$J)
 ;
 QUIT
 ;
CREATEINDEXMISSINGSTORE ;; @TEST add index to store with empty store name
 N ERROR,NODEUUID,RESULT,STORE,UUID
 S STORE=""
 S NODEUUID="1s4a817b-93ff-4e7f-8af4-0de4a2498329"
 ;
 S ^TMP("BODY",NODEUUID,$J,"data",1)="{""indexName"":""testindex"",""fields"":""authorUid"",""sort"":""desc"",""type"":""attr""}"
 ;
 S RESULT=$$CINDEX^VPRJGDSN(STORE,NODEUUID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("JDS isn't setup correctly, run VPRJCONFIG",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(253,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
CREATEINDEXMISSINGNAME ;; @TEST add index to store with missing index name
 N ERROR,NODEUUID,RESULT,STORE,UUID
 S STORE="teststore"
 S NODEUUID="1s4a817b-93ff-4e7f-8af4-0de4a2498329"
 ;
 S ^TMP("BODY",NODEUUID,$J,"data",1)="{""fields"":""authorUid"",""sort"":""desc"",""type"":""attr""}"
 ;
 S RESULT=$$CINDEX^VPRJGDSN(STORE,NODEUUID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("required field missing",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"domain")))
 D ASSERT("Unknown error",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(273,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
CREATEINDEXMISSINGFIELDS ;; @TEST add index to store with missing fields
 N ERROR,NODEUUID,RESULT,STORE,UUID
 S STORE="teststore"
 S NODEUUID="1s4a817b-93ff-4e7f-8af4-0de4a2498329"
 ;
 S ^TMP("BODY",NODEUUID,$J,"data",1)="{""indexName"":""testindex"",""sort"":""desc"",""type"":""attr""}"
 ;
 S RESULT=$$CINDEX^VPRJGDSN(STORE,NODEUUID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("required field missing",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"domain")))
 D ASSERT("Unknown error",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(273,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
CREATEINDEXMISSINGSORT ;; @TEST add index to store with missing sort
 N ERROR,NODEUUID,RESULT,STORE,UUID
 S STORE="teststore"
 S NODEUUID="1s4a817b-93ff-4e7f-8af4-0de4a2498329"
 ;
 S ^TMP("BODY",NODEUUID,$J,"data",1)="{""indexName"":""testindex"",""fields"":""authorUid"",""type"":""attr""}"
 ;
 S RESULT=$$CINDEX^VPRJGDSN(STORE,NODEUUID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("required field missing",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"domain")))
 D ASSERT("Unknown error",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(273,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
CREATEINDEXMISSINGTYPE ;; @TEST add index to store with missing type
 N ERROR,NODEUUID,RESULT,STORE,UUID
 S STORE="teststore"
 S NODEUUID="1s4a817b-93ff-4e7f-8af4-0de4a2498329"
 ;
 S ^TMP("BODY",NODEUUID,$J,"data",1)="{""indexName"":""testindex"",""fields"":""authorUid"",""sort"":""desc""}"
 ;
 S RESULT=$$CINDEX^VPRJGDSN(STORE,NODEUUID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("required field missing",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"domain")))
 D ASSERT("Unknown error",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(273,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
CREATEINDEX ;; @TEST add index to store successfully
 N ERROR,NODEUUID,RESULT,STORE,UUID
 S STORE="teststore"
 S NODEUUID="1s4a817b-93ff-4e7f-8af4-0de4a2498329"
 ;
 S ^TMP("BODY",NODEUUID,$J,"data",1)="{""indexName"":""testindex"",""fields"":""authorUid"",""sort"":""desc"",""type"":""attr""}"
 ;
 S RESULT=$$CINDEX^VPRJGDSN(STORE,NODEUUID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(0,ERROR)
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT("",$G(^TMP(UUID,$J)))
 ;
 ; cleanup ^TMP
 K ^TMP(UUID,$J)
 ;
 QUIT
 ;
CREATEINDEXDUPLICATE ;; @TEST add index to store when one already exists
 N ERROR,NODEUUID,RESULT,STORE,UUID
 S STORE="teststore"
 S NODEUUID="1s4a817b-93ff-4e7f-8af4-0de4a2498329"
 ;
 S ^TMP("BODY",NODEUUID,$J,"data",1)="{""indexName"":""testindex"",""fields"":""authorUid"",""sort"":""desc"",""type"":""attr""}"
 ;
 S RESULT=$$CINDEX^VPRJGDSN(STORE,NODEUUID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("index name: testindex",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"domain")))
 D ASSERT("Duplicate index found",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(271,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
GETINDEXMISSINGSTORE ;; @TEST get index data with empty store name
 N ERROR,INDEX,RESULT,STORE,UUID
 S STORE=""
 S INDEX="testindex"
 ;
 S RESULT=$$INDEX^VPRJGDSN(STORE,INDEX)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("JDS isn't setup correctly, run VPRJCONFIG",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(253,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
GETINDEXMISSINGINDEX ;; @TEST get index data with empty index name
 N ERROR,INDEX,RESULT,STORE,UUID
 S STORE="teststore"
 S INDEX=""
 ;
 S RESULT=$$INDEX^VPRJGDSN(STORE,INDEX)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Invalid index name",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(102,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
GETINDEX ;; @TEST get index data successfully
 N ERROR,INDEX,RESULT,STORE,UUID
 S STORE="teststore"
 S INDEX="testindex"
 ;
 S RESULT=$$INDEX^VPRJGDSN(STORE,INDEX)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(0,ERROR)
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT("{""authorUid"":""urn:va:user:SITE:3"",""displayName"":""Rheumatology"",""domain"":""test-data"",""ehmpState"":",$G(^TMP(UUID,$J,0,1)))
 D ASSERT("""active"",""uid"":""urn:va:teststore:1""}",$G(^TMP(UUID,$J,0,2)))
 D ASSERT("{""authorUid"":""urn:va:user:SITE:5"",""displayName"":""Consult"",""domain"":""test-data"",""ehmpState"":""passive"",",$G(^TMP(UUID,$J,1,1)))
 D ASSERT("""uid"":""urn:va:teststore:2""}",$G(^TMP(UUID,$J,1,2)))
 D ASSERT("]}",$G(^TMP(UUID,$J,"POSTAMBLE")))
 D ASSERT("{""items"":[",$G(^TMP(UUID,$J,"PREAMBLE")))
 D ASSERT(200,$G(^TMP(UUID,$J,"STATUS")))
 ;
 ; cleanup ^TMP
 K ^TMP(UUID,$J)
 ;
 QUIT
 ;
DELETEDATAMISSINGSTORE ;; @TEST remove data item with empty store name
 N DELETEALL,ERROR,STORE,RESULT,UID,UUID
 S STORE=""
 S UID="urn:va:teststore:1"
 S DELETEALL="false"
 ;
 S RESULT=$$DEL^VPRJGDSN(STORE,UID,DELETEALL)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("JDS isn't setup correctly, run VPRJCONFIG",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(253,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
DELETEDATAITEM ;; @TEST remove a data item successfully
 N DELETEALL,ERROR,STORE,RESULT,UID,UUID
 S STORE="teststore"
 S UID="urn:va:teststore:1"
 S DELETEALL="false"
 ;
 S RESULT=$$DEL^VPRJGDSN(STORE,UID,DELETEALL)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(0,ERROR)
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT("{""ok"": true}",$G(^TMP(UUID,$J)))
 ;
 ; cleanup ^TMP
 K ^TMP(UUID,$J)
 ;
 QUIT
 ;
DELETEALLDATAFALSE ;; @TEST remove all data items with empty uid and deleteall set to false
 N DELETEALL,ERROR,STORE,RESULT,UID,UUID
 S STORE="teststore"
 S UID=""
 S DELETEALL="false"
 ;
 S RESULT=$$DEL^VPRJGDSN(STORE,UID,DELETEALL)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("uid is blank",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"domain")))
 D ASSERT("Unrecognized parameter",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(111,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
DELETEALLDATATRUE ;; @TEST remove all data items with empty uid and deleteall set to true successfully
 N DELETEALL,ERROR,STORE,RESULT,UID,UUID
 S STORE="teststore"
 S UID=""
 S DELETEALL="true"
 ;
 S RESULT=$$DEL^VPRJGDSN(STORE,UID,DELETEALL)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(0,ERROR)
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT("{""ok"": true}",$G(^TMP(UUID,$J)))
 ;
 ; cleanup ^TMP
 K ^TMP(UUID,$J)
 ;
 QUIT
 ;
CLEARDBMISSINGSTORE ;; @TEST remove store and all its data with empty store name
 N ERROR,STORE,RESULT,UUID
 S STORE=""
 ;
 S RESULT=$$CLR^VPRJGDSN(STORE)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("JDS isn't setup correctly, run VPRJCONFIG",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(253,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup ^TMP
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
CLEARDB ;; @TEST remove store and all its data successfully
 N ERROR,STORE,RESULT,UUID
 S STORE="teststore"
 ;
 S RESULT=$$CLR^VPRJGDSN(STORE)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT("{""ok"": true}",$G(^TMP(UUID,$J)))
 ;
 ; cleanup ^TMP
 K ^TMP(UUID,$J)
 ;
 QUIT
 ;

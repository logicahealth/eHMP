VPRJTDRN ;AFS/MBS -- Unit tests for operational data wrapper code for jdsClient using cache.node
 ;
STARTUP  ; Run once before all tests
 N I,TAGS
 F I=1:1:6 S TAGS(I)="TEST"_I_"^VPRJTD01"
 D ODSBLD^VPRJTX(.TAGS)
 QUIT
 ;
SHUTDOWN ; Run once after all tests
 D ODSCLR^VPRJTX
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
ASSERT(EXPECT,ACTUAL) ; convenience
 D EQ^VPRJT(EXPECT,ACTUAL)
 QUIT
 ;
 ;
GETDATAMISSINGUID ;; @TEST get operational data with missing uid
 N ERROR,UID,RESULT,UUID
 S UID=""
 ;
 S RESULT=$$GETOBJ^VPRJDRN(UID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(404,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Bad key",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(104,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Not Found",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
GETDATABADUID ;; @TEST get operational data with bad uid
 N ERROR,UID,RESULT,UUID
 ; clear data
 D SHUTDOWN
 ;
 S UID="urn:va:test:3"
 ;
 S RESULT=$$GETOBJ^VPRJDRN(UID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(404,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("UID:"_UID,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"domain")))
 D ASSERT("Bad key",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(104,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Not Found",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 ; cleanup
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
GETDATABYUID ;; @TEST get operational data by uid
 N ERROR,UID,RESULT,UUID
 ; retore data
 D STARTUP
 ;
 S UID="urn:va:test:3"
 ;
 S RESULT=$$GETOBJ^VPRJDRN(UID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,"PREAMBLE")))
 D ASSERT(1,$D(^TMP(UUID,$J,"POSTAMBLE")))
 D ASSERT(1,$D(^TMP(UUID,$J,"STATUS")))
 ;
 ; cleanup
 K ^TMP(UUID,$J)
 ;
 QUIT
 ;
GETINDEXMISSINGINDEX ;; @TEST get operational data from index with missing index name
 N ERROR,INDEX,RESULT,UUID
 S INDEX=""
 ;
 S RESULT=$$INDEX^VPRJDRN(INDEX)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing name of index",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(101,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 ;
 ; cleanup
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
GETINDEX ;; @TEST get operational data from index
 N ERROR,INDEX,RESULT,UUID
 S INDEX="test-name"
 ;
 S RESULT=$$INDEX^VPRJDRN(INDEX)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,1,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,2,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,3,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,4,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,5,1)))
 D ASSERT(0,$D(^TMP(UUID,$J,6,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,"PREAMBLE")))
 D ASSERT(1,$D(^TMP(UUID,$J,"POSTAMBLE")))
 D ASSERT(1,$D(^TMP(UUID,$J,"STATUS")))
 ;
 ; cleanup
 K ^TMP(UUID,$J)
 ;
 QUIT
 ;
GETCOUNTMISSINGCOUNT ;; @TEST get operational data count with missing count name
 N ERROR,COUNT,RESULT,UUID
 S COUNT=""
 ;
 S RESULT=$$COUNT^VPRJDRN(COUNT)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing name of index",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(101,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 ;
 ; cleanup
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
GETCOUNT ;; @TEST get operational data count
 N ERROR,COUNT,RESULT,UUID
 S COUNT="collection"
 ;
 S RESULT=$$COUNT^VPRJDRN(COUNT)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT(1,$D(^TMP(UUID,$J,1)))
 D ASSERT(0,$D(^TMP(UUID,$J,2)))
 ;
 ; cleanup
 K ^TMP(UUID,$J)
 ;
 QUIT
 ;
GETALLCOUNTMISSINGCOUNT ;; @TEST get operational data all count with missing count name
 N ERROR,COUNT,ALL,RESULT,UUID
 S COUNT="",ALL="true"
 ;
 S RESULT=$$COUNT^VPRJDRN(COUNT,ALL)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing name of index",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(101,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 ;
 ; cleanup
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
GETALLCOUNT ;; @TEST get operational data all count
 N ERROR,COUNT,ALL,RESULT,UUID
 S COUNT="collection",ALL="true"
 ;
 S RESULT=$$COUNT^VPRJDRN(COUNT,ALL)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT(1,$D(^TMP(UUID,$J,1)))
 D ASSERT(0,$D(^TMP(UUID,$J,2)))
 ;
 ; cleanup
 K ^TMP(UUID,$J)
 ;
 QUIT
 ;
FINDMISSINGCOLL ;; @TEST operational data find with missing collection
 N ERROR,INDEX,RESULT,UUID
 S INDEX=""
 ;
 S RESULT=$$INDEX^VPRJDRN(INDEX)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing name of index",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(101,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 ;
 ; cleanup
 K ^TMP("HTTPERR",UUID,$J)
 ;
 QUIT
 ;
FIND ;; @TEST get operational data find
 N ERROR,INDEX,RESULT,UUID
 S INDEX="test-name"
 ;
 S RESULT=$$INDEX^VPRJDRN(INDEX)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,1,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,2,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,3,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,4,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,5,1)))
 D ASSERT(0,$D(^TMP(UUID,$J,6,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,"PREAMBLE")))
 D ASSERT(1,$D(^TMP(UUID,$J,"POSTAMBLE")))
 D ASSERT(1,$D(^TMP(UUID,$J,"STATUS")))
 ;
 ; cleanup
 K ^TMP(UUID,$J)
 ;
 QUIT
 ;

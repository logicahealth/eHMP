VPRJTPRN ;V4W/DLW -- Unit tests for individual patient data wrapper code for jdsClient using cache.node
 ;
STARTUP  ; Run once before all tests
 D BLDPT^VPRJTX
 QUIT
 ;
SHUTDOWN ; Run once after all tests
 D CLRPT^VPRJTX
 QUIT
 ;
SETUP    ; Run before each test
 K ^||TMP
 QUIT
 ;
TEARDOWN ; Run after each test
 K ^||TMP
 K ^TMP
 QUIT
 ;
ASSERT(EXPECT,ACTUAL,MSG) ; convenience
 D EQ^VPRJT(EXPECT,ACTUAL,$G(MSG))
 QUIT
 ;
 ;
GETPTMISSINGPID ;; @TEST get patient demographics data with missing pid
 N ERROR,PID,RESULT,UUID
 S PID=""
 ;
 S RESULT=$$GETPT^VPRJPRN(PID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(404,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing patient identifiers",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(211,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Not Found",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETPTPIDNOSYNC ;; @TEST get patient demographics data from missing patient
 N ERROR,PID,RESULT,UUID
 ; clear patient
 D SHUTDOWN
 ;
 S PID="93EF;-7"
 ;
 S RESULT=$$GETPT^VPRJPRN(PID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Identifier 93EF;-7",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"domain")))
 D ASSERT("Patient Demographics not on File",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(225,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETPTBYPID ;; @TEST get patient demographic data by pid
 N ERROR,PID,RESULT,UUID
 ; add patient
 D STARTUP
 ;
 S PID="93EF;-7"
 ;
 S RESULT=$$GETPT^VPRJPRN(PID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,2)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,3)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,4)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,5)))
 D ASSERT(0,$D(^TMP(UUID,$J,0,6)))
 D ASSERT(1,$D(^TMP(UUID,$J,"PREAMBLE")))
 D ASSERT(1,$D(^TMP(UUID,$J,"POSTAMBLE")))
 D ASSERT(1,$D(^TMP(UUID,$J,"STATUS")))
 ;
 QUIT
 ;
GETPTMISSINGICN ;; @TEST get patient demographics data with missing pid
 N ERROR,ICN,PID,RESULT,UUID
 ;
 S PID=$$ADDPT^VPRJTX("HDRDEMOG7^VPRJTP01")
 ;
 S ICN=""
 ;
 S RESULT=$$GETPT^VPRJPRN(ICN)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(404,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing patient identifiers",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(211,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Not Found",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETPTICNNOSYNC ;; @TEST get patient demographics data from missing patient
 N ERROR,ICN,RESULT,UUID
 ; clear patient
 D SHUTDOWN
 ;
 S ICN="-777V123777"
 ;
 S RESULT=$$GETPT^VPRJPRN(ICN)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Identifier -777V123777",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"domain")))
 D ASSERT("JPID Not Found",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(224,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETPTBYICN ;; @TEST get patient demographic data by pid
 N ERROR,ICN,PID,RESULT,UUID
 ; add patient
 D STARTUP
 S PID=$$ADDPT^VPRJTX("HDRDEMOG7^VPRJTP01")
 ;
 S ICN="-777V123777"
 ;
 S RESULT=$$GETPT^VPRJPRN(ICN)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(0,ERROR)
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,2)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,3)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,4)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,5)))
 D ASSERT(0,$D(^TMP(UUID,$J,0,6)))
 D ASSERT(1,$D(^TMP(UUID,$J,"PREAMBLE")))
 D ASSERT(1,$D(^TMP(UUID,$J,"POSTAMBLE")))
 D ASSERT(1,$D(^TMP(UUID,$J,"STATUS")))
 ;
 QUIT
 ;
GETINDEXMISSINGPID ;; @TEST get patient index data with missing pid
 N ERROR,INDEX,PID,RESULT,UUID
 ;
 S PID=$$ADDPT^VPRJTX("EHMPDOCS1^VPRJTP01")
 S PID=""
 S INDEX="consult"
 ;
 S RESULT=$$INDEX^VPRJPRN(PID,INDEX)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing PID",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(226,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETINDEXMISSINGINDEX ;; @TEST get patient index data with missing index name
 N ERROR,INDEX,PID,RESULT,UUID
 ;
 S PID="93EF;-7"
 S INDEX=""
 ;
 S RESULT=$$INDEX^VPRJPRN(PID,INDEX)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing name of index",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(101,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETINDEXNOSYNC ;; @TEST get patient index data from missing patient
 N ERROR,INDEX,PID,RESULT,UUID
 ; clear patient
 D SHUTDOWN
 ;
 S PID="93EF;-7"
 S INDEX="consult"
 ;
 S RESULT=$$INDEX^VPRJPRN(PID,INDEX)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(404,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing patient identifiers",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(211,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Not Found",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETINDEX ;; @TEST get patient index data
 N ERROR,INDEX,PID,RESULT,UUID
 ; add patient
 D STARTUP
 ;
 S PID=$$ADDPT^VPRJTX("EHMPDOCS1^VPRJTP01")
 S INDEX="consult"
 ;
 S RESULT=$$INDEX^VPRJPRN(PID,INDEX)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,2)))
 D ASSERT(0,$D(^TMP(UUID,$J,0,3)))
 D ASSERT(1,$D(^TMP(UUID,$J,"PREAMBLE")))
 D ASSERT(1,$D(^TMP(UUID,$J,"POSTAMBLE")))
 D ASSERT(1,$D(^TMP(UUID,$J,"STATUS")))
 ;
 QUIT
 ;
GETALLINDEXMISSINGINDEX ;; @TEST get all patient index data with missing index name
 N ERROR,INDEX,RESULT,UUID
 ;
 S INDEX=""
 ;
 S RESULT=$$ALLINDEX^VPRJPRN(INDEX)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing name of index",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(101,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETALLINDEX ;; @TEST get all patient index data
 N ERROR,INDEX,PID1,PID2,PID3,RESULT,UUID
 ; add patient
 D STARTUP
 ;
 S PID1=$$ADDPT^VPRJTX("DEMOG7^VPRJTP01")  ; Make sure it's really there
 S PID2=$$ADDPT^VPRJTX("DEMOG8^VPRJTP01")
 S PID3=$$ADDPT^VPRJTX("DEMOG9^VPRJTP01")
 ;
 S INDEX="patient"
 ;
 S RESULT=$$ALLINDEX^VPRJPRN(INDEX)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(10,$D(^TMP(UUID)),"expected data, none returned")
 D ASSERT(3,$O(^TMP(UUID,$J,"A"),-1)+1,"incorrect number of items") ; +1 because the array is 0-indexed A skips PREAMBLE, POSTAMBLE, and STATUS
 D ASSERT("""urn:va:patient:93EF:-9:-9""}",$G(^TMP(UUID,$J,2,7)),"unexpected last item")
 D ASSERT("{""addresses"":[{""city"":""Any Town"",""postalCode"":""99998-0071"",""stateProvince"":""WEST VIRGINIAN""}],",$G(^TMP(UUID,$J,0,1)),"unexpected first item")
 D ASSERT(1,$D(^TMP(UUID,$J,"PREAMBLE")),"PREAMBLE not defined")
 D ASSERT(1,$D(^TMP(UUID,$J,"POSTAMBLE")),"POSTAMBLE not defined")
 D ASSERT(1,$D(^TMP(UUID,$J,"STATUS")),"STATUS not defined")
 ;
 QUIT
 ;
GETFINDMISSINGPID ;; @TEST get patient domain data with missing pid
 N DOMAIN,ERROR,PID,RESULT,UUID
 ;
 S PID=""
 S DOMAIN="patient"
 ;
 S RESULT=$$FIND^VPRJPRN(PID,DOMAIN)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing PID",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(226,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETFINDMISSINGDOMAIN ;; @TEST get patient domain data with missing domain name
 N DOMAIN,ERROR,PID,RESULT,UUID
 ;
 S PID="93EF;-7"
 S DOMAIN=""
 ;
 S RESULT=$$FIND^VPRJPRN(PID,DOMAIN)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing collection name",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(215,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETFINDNOSYNC ;; @TEST get patient domain data from missing patient
 N DOMAIN,ERROR,PID,RESULT,UUID
 ; clear patient
 D SHUTDOWN
 ;
 S PID="93EF;-7"
 S DOMAIN="patient"
 ;
 S RESULT=$$FIND^VPRJPRN(PID,DOMAIN)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(404,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing patient identifiers",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(211,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Not Found",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETFIND ;; @TEST get patient domain data
 N DOMAIN,ERROR,PID,RESULT,UUID
 ; add patient
 D STARTUP
 ;
 S PID="93EF;-7"
 S DOMAIN="patient"
 ;
 S RESULT=$$FIND^VPRJPRN(PID,DOMAIN)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,2)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,3)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,4)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,5)))
 D ASSERT(0,$D(^TMP(UUID,$J,0,6)))
 D ASSERT(1,$D(^TMP(UUID,$J,"PREAMBLE")))
 D ASSERT(1,$D(^TMP(UUID,$J,"POSTAMBLE")))
 D ASSERT(1,$D(^TMP(UUID,$J,"STATUS")))
 ;
 QUIT
 ;
GETALLFINDMISSINGDOMAIN ;; @TEST get all patient domain data with missing domain name
 N DOMAIN,ERROR,FILTER,RESULT,UUID
 ;
 S FILTER=""
 S DOMAIN=""
 ;
 S RESULT=$$ALLFIND^VPRJPRN(DOMAIN,,,,FILTER)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing collection name",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(215,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETALLFINDMISSINGFILTER ;; @TEST get all patient domain data with missing domain name
 N DOMAIN,ERROR,FILTER,RESULT,UUID
 ;
 S FILTER=""
 S DOMAIN="patient"
 ;
 S RESULT=$$ALLFIND^VPRJPRN(DOMAIN,,,,FILTER)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Filter required",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(112,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETALLFIND ;; @TEST get patient domain data
 N DOMAIN,ERROR,FILTER,PID1,PID2,PID3,RESULT,UUID
 ; add patient
 D STARTUP
 ;
 S PID1=$$ADDPT^VPRJTX("DEMOG7^VPRJTP01")  ; Make sure it's really there
 S PID2=$$ADDPT^VPRJTX("DEMOG8^VPRJTP01")
 S PID3=$$ADDPT^VPRJTX("DEMOG9^VPRJTP01")
 ;
 S FILTER="exists(uid)"
 S DOMAIN="patient"
 ;
 S RESULT=$$ALLFIND^VPRJPRN(DOMAIN,,,,FILTER)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(10,$D(^TMP(UUID)),"expected data, none returned")
 D ASSERT(3,$O(^TMP(UUID,$J,"A"),-1)+1,"incorrect number of items") ; +1 because the array is 0-indexed A skips PREAMBLE, POSTAMBLE, and STATUS
 D ASSERT("""urn:va:patient:93EF:-9:-9""}",$G(^TMP(UUID,$J,2,7)),"unexpected last item")
 D ASSERT("{""addresses"":[{""city"":""Any Town"",""postalCode"":""99998-0071"",""stateProvince"":""WEST VIRGINIAN""}],",$G(^TMP(UUID,$J,0,1)),"unexpected first item")
 D ASSERT(1,$D(^TMP(UUID,$J,"PREAMBLE")),"PREAMBLE not defined")
 D ASSERT(1,$D(^TMP(UUID,$J,"POSTAMBLE")),"POSTAMBLE not defined")
 D ASSERT(1,$D(^TMP(UUID,$J,"STATUS")),"STATUS not defined")
 ;
 QUIT
 ;
GETCOUNTMISSINGPID ;; @TEST get patient count data with missing pid
 N CNTNAME,ERROR,PID,RESULT,UUID
 ;
 S PID=""
 S CNTNAME="collection"
 ;
 S RESULT=$$COUNT^VPRJPRN(PID,CNTNAME)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing PID",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(226,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETCOUNTMISSINGDOMAIN ;; @TEST get patient count data with missing count name
 N CNTNAME,ERROR,PID,RESULT,UUID
 ;
 S PID="93EF;-7"
 S CNTNAME=""
 ;
 S RESULT=$$COUNT^VPRJPRN(PID,CNTNAME)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing name of index",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(101,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETCOUNTNOSYNC ;; @TEST get patient count data from missing patient
 N CNTNAME,ERROR,PID,RESULT,UUID
 ; clear patient
 D SHUTDOWN
 ;
 S PID="93EF;-7"
 S CNTNAME="collection"
 ;
 S RESULT=$$COUNT^VPRJPRN(PID,CNTNAME)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(404,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing patient identifiers",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(211,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Not Found",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETCOUNT ;; @TEST get patient count data
 N CNTNAME,ERROR,PID,RESULT,UUID
 ; add patient
 D STARTUP
 ;
 S PID="93EF;-7"
 S CNTNAME="collection"
 ;
 S RESULT=$$COUNT^VPRJPRN(PID,CNTNAME)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT(1,$D(^TMP(UUID,$J,1)))
 D ASSERT(0,$D(^TMP(UUID,$J,2)))
 ;
 QUIT
 ;
GETALLCOUNTMISSINGCOLLECTION ;; @TEST get all count data with missing collection
 N CNTNAME,ERROR,RESULT,UUID
 ;
 S CNTNAME=""
 ;
 S RESULT=$$ALLCOUNT^VPRJPRN(CNTNAME)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing name of index",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(101,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETALLCOUNT ;; @TEST get all count data
 N CNTNAME,ERROR,PID1,PID2,PID3,RESULT,UUID
 ;
 ; clean up dirty global for consistent runs
 K ^VPRPTX("count")
 ;
 ; add patient
 D STARTUP
 ;
 S PID1=$$ADDPT^VPRJTX("DEMOG7^VPRJTP01")  ; Make sure it's really there
 S PID2=$$ADDPT^VPRJTX("DEMOG8^VPRJTP01")
 S PID3=$$ADDPT^VPRJTX("DEMOG9^VPRJTP01")
 ;
 S CNTNAME="collection"
 ;
 S RESULT=$$ALLCOUNT^VPRJPRN(CNTNAME)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(10,$D(^TMP(UUID)),"expected data to be returned")
 D ASSERT(1,$G(^TMP(UUID,$J,1))["{""topic"":""patient"",""count"":2}","expected 2 patient items")
 D ASSERT(200,$G(^TMP(UUID,$J,"STATUS")),"expected 200 status")
 ;
 QUIT
 ;
GETOBJMISSINGPID ;; @TEST get patient data item with missing pid
 N ERROR,PID,RESULT,UID,UUID
 ;
 S PID=""
 S UID="urn:va:patient:93EF:-7:-7"
 ;
 S RESULT=$$GETOBJ^VPRJPRN(PID,UID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing PID",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(226,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETOBJMISSINGUID ;; @TEST get patient data item with missing uid
 N ERROR,PID,RESULT,UID,UUID
 ;
 S PID="93EF;-7"
 S UID=""
 ;
 S RESULT=$$GETOBJ^VPRJPRN(PID,UID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing UID",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(207,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETOBJNOSYNC ;; @TEST get patient data item from missing patient
 N ERROR,PID,RESULT,UID,UUID
 ; clear patient
 D SHUTDOWN
 ;
 S PID="93EF;-7"
 S UID="urn:va:patient:93EF:-7:-7"
 ;
 S RESULT=$$GETOBJ^VPRJPRN(PID,UID)
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
 QUIT
 ;
GETOBJECT ;; @TEST get patient data item
 N ERROR,PID,RESULT,UID,UUID
 ; add patient
 D STARTUP
 ;
 S PID="93EF;-7"
 S UID="urn:va:patient:93EF:-7:-7"
 ;
 S RESULT=$$GETOBJ^VPRJPRN(PID,UID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(10,$D(^TMP(UUID)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,1)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,2)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,3)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,4)))
 D ASSERT(1,$D(^TMP(UUID,$J,0,5)))
 D ASSERT(0,$D(^TMP(UUID,$J,0,6)))
 D ASSERT(1,$D(^TMP(UUID,$J,"PREAMBLE")))
 D ASSERT(1,$D(^TMP(UUID,$J,"POSTAMBLE")))
 D ASSERT(1,$D(^TMP(UUID,$J,"STATUS")))
 ;
 QUIT
 ;
GETUIDMISSINGUID ;; @TEST get patient data item with missing uid
 N ERROR,RESULT,UID,UUID
 ;
 S UID=""
 ;
 S RESULT=$$GETUID^VPRJPRN(UID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(400,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Missing UID",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(207,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Bad Request",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETUIDNOSYNC ;; @TEST get patient data item from missing patient
 N ERROR,RESULT,UID,UUID
 ; clear patient
 D SHUTDOWN
 ;
 S UID="urn:va:patient:93EF:-7:-7"
 ;
 S RESULT=$$GETUID^VPRJPRN(UID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(1,ERROR)
 D ASSERT(10,$D(^TMP("HTTPERR",UUID,$J)))
 D ASSERT(404,$G(^TMP("HTTPERR",UUID,$J,1,"error","code")))
 D ASSERT("Unable to determine patient",$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"message")))
 D ASSERT(203,$G(^TMP("HTTPERR",UUID,$J,1,"error","errors",1,"reason")))
 D ASSERT("Not Found",$G(^TMP("HTTPERR",UUID,$J,1,"error","message")))
 ;
 QUIT
 ;
GETUID ;; @TEST get patient data item
 N ERROR,PID,RESULT,UID,UUID
 ; add patient
 D STARTUP
 ;
 S PID="93EF;-7"
 S UID="urn:va:patient:93EF:-7:-7"
 ;
 S RESULT=$$GETUID^VPRJPRN(UID)
 S ERROR=$P(RESULT,":")
 S UUID=$P(RESULT,":",2)
 ;
 D ASSERT(10,$D(^TMP(UUID)),"expected data, none returned")
 D ASSERT(5,$O(^TMP(UUID,$J,0,"A"),-1),"incorrect number of items")
 D ASSERT(1,$D(^TMP(UUID,$J,"PREAMBLE")),"PREAMBLE not defined")
 D ASSERT(1,$D(^TMP(UUID,$J,"POSTAMBLE")),"POSTAMBLE not defined")
 D ASSERT(1,$D(^TMP(UUID,$J,"STATUS")),"STATUS not defined")
 D ASSERT(0,$D(^TMP("HTTPERR",UUID,$J)))
 ;
 QUIT
 ;

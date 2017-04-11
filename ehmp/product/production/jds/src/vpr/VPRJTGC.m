VPRJTGC ;KRM/CJE -- Test Garbage Collection operations
 ; No entry from top
 Q
 ;
 ; Endpoints tested
 ; GET tasks/gc/site/{site} SITE^VPRJGC
 ; GET tasks/gc/patient/{id} PATIENT^VPRJGC
 ; GET tasks/gc/job/{id} JOB^VPRJGC
STARTUP  ; Run once before all tests
 K ^VPRJOB
 Q
 ;
SHUTDOWN ; Run once after all tests
 K ^VPRJOB
 Q
 ;
SETUP    ; Run before each test
 K HTTPREQ,HTTPERR,HTTPRSP
 N I,TAGS
 F I=1:1:5 S TAGS(I)="MED"_I_"^VPRJTP02"
 D BLDPT^VPRJTX(.TAGS)
 Q
TEARDOWN ; Run after each test
 K HTTPREQ,HTTPERR,HTTPRSP
 D CLRPT^VPRJTX
 D ODSCLR^VPRJTX
 Q
ASSERT(EXPECT,ACTUAL,MSG) ; convenience
 D EQ^VPRJT(EXPECT,ACTUAL,$G(MSG))
 Q
 ;
MOCKP ; mock patient data (new last)
 N HTTPERR,HTTPREQ
 ; Set variables to be reusable
 S PID="93EF;-7"
 S UID="urn:va:med:93EF:-7:15231"
 S JPID=$$JPID4PID^VPRJPR(PID)
 S VPRJTPID=$G(^VPRPTJ("JPID",PID))
 ; 1st version of object
 S METASTAMP1=76
 D MOCKSS(PID,UID,METASTAMP1)
 D SETPUT^VPRJTX("/vpr/"_PID,"MED6","VPRJTP02")
 D RESPOND^VPRJRSP
 K HTTPERR,HTTPREQ
 ; 2nd version of object
 S METASTAMP2=77
 D MOCKSS(PID,UID,METASTAMP2)
 D SETPUT^VPRJTX("/vpr/"_PID,"MED6N","VPRJTP02")
 D RESPOND^VPRJRSP
 S ^VPRSTATUS(JPID,PID,$P(PID,";"),"patient",METASTAMP2)=""
 Q
MOCKSS(PID,UID,STAMP,STORED) ; mock patient sync status
 N SITE,DOMAIN,JPID
 S SITE=$P(PID,";",1)
 S DOMAIN=$P(UID,":",3)
 S JPID=$$JPID4PID^VPRJPR(PID)
 S ^VPRSTATUS(JPID,PID,SITE,"stampTime")=STAMP
 S ^VPRSTATUS(JPID,PID,SITE,DOMAIN,STAMP)=""
 S ^VPRSTATUS(JPID,PID,SITE,DOMAIN,UID,STAMP)=""
 ; Conditional for forcing stored flag
 I $G(STORED) S ^VPRSTATUS(JPID,PID,SITE,DOMAIN,UID,STAMP,"stored")=1
 Q
MOCKSSD(UID,STAMP,STORED) ; mock operational data sync status
 ; ^VPRSTATUSOD(SITE,SOURCESTAMP,DOMAIN,ITEM,ITEMSTAMP)
 N SITE,DOMAIN
 S SITE=$P(UID,":",4)
 S DOMAIN=$P(UID,":",3)
 S ^VPRSTATUSOD(SITE,"stampTime")=STAMP
 S ^VPRSTATUSOD(SITE,DOMAIN,STAMP)=""
 S ^VPRSTATUSOD(SITE,DOMAIN,UID,STAMP)=""
 ; Conditional for forcing stored flag
 I $G(STORED) S ^VPRSTATUSOD(SITE,DOMAIN,UID,STAMP,"stored")=1
 Q
 ;
MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 N SC
 S ^VPRJOB(0)=$I(^VPRJOB(0))
 S SC=^VPRJOB(0)
 S ^VPRJOB(SC,"jobId")=JID
 S ^VPRJOB(SC,"jobId","\s")=""
 S ^VPRJOB(SC,"type")=TYPE
 S ^VPRJOB(SC,"jpid")=JPID
 S ^VPRJOB(SC,"payload","test")="true"
 S ^VPRJOB(SC,"payload","test","\s")=""
 S ^VPRJOB(SC,"rootJobId")=RJID
 S ^VPRJOB(SC,"rootJobId","\s")=""
 S ^VPRJOB(SC,"status")=STATUS
 S ^VPRJOB(SC,"timestamp")=STAMP
 S ^VPRJOB(SC,"timestamp","\s")=""
 S ^VPRJOB("A",JPID,TYPE,RJID,JID,STAMP,STATUS)=SC
 S ^VPRJOB("B",SC)=JPID_"^"_TYPE_"^"_RJID_"^"_JID_"^"_STAMP_"^"_STATUS
 S ^VPRJOB("C",JID,RJID)=""
 S ^VPRJOB("D",JPID,TYPE,STAMP,SC)=SC
 Q
 ;
MOCKP2 ; mock patient data reversed (new first)
 N HTTPERR,HTTPREQ
 ; Set variables to be resuable
 S PID="93EF;-7"
 S UID="urn:va:med:93EF:-7:15231"
 S JPID=$$JPID4PID^VPRJPR(PID)
 S VPRJTPID=$G(^VPRPTJ("JPID",PID))
 ; 2nd version of object
 S METASTAMP2=77
 D MOCKSS(PID,UID,METASTAMP2)
 D SETPUT^VPRJTX("/vpr/"_PID,"MED6N","VPRJTP02")
 D RESPOND^VPRJRSP
 K HTTPERR,HTTPREQ
 ; 1st version of object
 S METASTAMP1=76
 D SETPUT^VPRJTX("/vpr/"_PID,"MED6","VPRJTP02")
 D RESPOND^VPRJRSP
 S ^VPRSTATUS(JPID,PID,$P(PID,";"),"patient",METASTAMP2)=""
 Q
MOCKPM ; mock multiple patient data (new last)
 N HTTPERR,HTTPREQ,PID,UID,VPRJTPID
 ; Set variables to be resuable
 D ADDPT^VPRJTX("DEMOG8^VPRJTP01")
 S ^VPRSTATUS($$JPID4PID^VPRJPR("93EF;-7"),"93EF;-7","93EF","patient",7)=""
 S ^VPRSTATUS($$JPID4PID^VPRJPR("93EF;-8"),"93EF;-8","93EF","patient",8)=""
 F PID="93EF;-7","93EF;-8" D
 . S UID="urn:va:med:"_$TR(PID,";",":")_":15231"
 . S VPRJTPID=$G(^VPRPTJ("JPID",PID))
 . ; 1st version of object
 . S METASTAMP1=76
 . D MOCKSS(PID,UID,METASTAMP1)
 . I PID["7" D SETPUT^VPRJTX("/vpr/"_PID,"MED6","VPRJTP02")
 . I PID["8" D SETPUT^VPRJTX("/vpr/"_PID,"MED8","VPRJTP02")
 . D RESPOND^VPRJRSP
 . K HTTPERR,HTTPREQ
 . ; 2nd version of object
 . S METASTAMP2=77
 . D MOCKSS(PID,UID,METASTAMP2)
 . I PID["7" D SETPUT^VPRJTX("/vpr/"_PID,"MED6N","VPRJTP02")
 . I PID["8" D SETPUT^VPRJTX("/vpr/"_PID,"MED8N","VPRJTP02")
 . D RESPOND^VPRJRSP
 . S ^VPRSTATUS($$JPID4PID^VPRJPR(PID),PID,$P(PID,";"),"med",METASTAMP2)=""
 Q
MOCKPM2 ; mock multiple patient data (new last)
 N HTTPERR,HTTPREQ,PID,UID,VPRJTPID
 ; Set variables to be resuable
 D ADDPT^VPRJTX("DEMOG8^VPRJTP01")
 S ^VPRSTATUS($$JPID4PID^VPRJPR("93EF;-7"),"93EF;-7","93EF","patient",7)=""
 S ^VPRSTATUS($$JPID4PID^VPRJPR("93EF;-8"),"93EF;-8","93EF","patient",8)=""
 F PID="93EF;-7","93EF;-8" D
 . S UID="urn:va:med:"_$TR(PID,";",":")_":15231"
 . S VPRJTPID=$G(^VPRPTJ("JPID",PID))
 . ; 2nd version of object
 . S METASTAMP2=77
 . D MOCKSS(PID,UID,METASTAMP2)
 . I PID["7" D SETPUT^VPRJTX("/vpr/"_PID,"MED6N","VPRJTP02")
 . I PID["8" D SETPUT^VPRJTX("/vpr/"_PID,"MED8N","VPRJTP02")
 . D RESPOND^VPRJRSP
 . K HTTPERR,HTTPREQ
 . ; 1st version of object
 . S METASTAMP1=76
 . D MOCKSS(PID,UID,METASTAMP1)
 . I PID["7" D SETPUT^VPRJTX("/vpr/"_PID,"MED6","VPRJTP02")
 . I PID["8" D SETPUT^VPRJTX("/vpr/"_PID,"MED8","VPRJTP02")
 . D RESPOND^VPRJRSP
 . S ^VPRSTATUS($$JPID4PID^VPRJPR(PID),PID,$P(PID,";"),"med",METASTAMP2)=""
 Q
MOCKD ; mock operational data
 N HTTPERR,HTTPREQ
 ; Set variables to be resuable
 S SITE="F111"
 S UID="urn:va:test:F111:4"
 ; 1st version of object
 S METASTAMP1=24
 D MOCKSSD(UID,METASTAMP1)
 D SETPUT^VPRJTX("/data","SYS4","VPRJTD01")
 D RESPOND^VPRJRSP
 K HTTPERR,HTTPREQ
 ; 2nd version of object
 S METASTAMP2=25
 D MOCKSSD(UID,METASTAMP2)
 D SETPUT^VPRJTX("/data","SYS4NEW","VPRJTD01")
 D RESPOND^VPRJRSP
 S ^VPRSTATUSOD(SITE,"test",METASTAMP2)=""
 Q
MOCKD2 ; mock operational data (new last)
 N HTTPERR,HTTPREQ
 ; Set variables to be resuable
 S SITE="F111"
 S UID="urn:va:test:F111:4"
 ; 2nd version of object
 S METASTAMP2=25
 D MOCKSSD(UID,METASTAMP2)
 D SETPUT^VPRJTX("/data","SYS4NEW","VPRJTD01")
 D RESPOND^VPRJRSP
 K HTTPERR,HTTPREQ
 ; 1st version of object
 S METASTAMP1=24
 D MOCKSSD(UID,METASTAMP1)
 D SETPUT^VPRJTX("/data","SYS4","VPRJTD01")
 D RESPOND^VPRJRSP
 S ^VPRSTATUSOD(SITE,"test",METASTAMP2)=""
 Q
MOCKDM ; mock multiple operational data
 N HTTPERR,HTTPREQ,UID,SITE
 ; Set variables to be resuable
 F SITE="F111","F112" D
 . S UID="urn:va:test:"_SITE_":4"
 . ; 1st version of object
 . S METASTAMP1=24
 . D MOCKSSD(UID,METASTAMP1)
 . I SITE="F111" D SETPUT^VPRJTX("/data","SYS4","VPRJTD01")
 . I SITE="F112" D SETPUT^VPRJTX("/data","SYS5","VPRJTD01")
 . D RESPOND^VPRJRSP
 . K HTTPERR,HTTPREQ
 . ; 2nd version of object
 . S METASTAMP2=25
 . D MOCKSSD(UID,METASTAMP2)
 . I SITE="F111" D SETPUT^VPRJTX("/data","SYS4NEW","VPRJTD01")
 . I SITE="F112" D SETPUT^VPRJTX("/data","SYS5NEW","VPRJTD01")
 . D RESPOND^VPRJRSP
 . S ^VPRSTATUSOD(SITE,"test",METASTAMP2)=""
 Q
MOCKDM2 ; mock multiple operational data (new last)
 N HTTPERR,HTTPREQ,UID,SITE
 ; Set variables to be resuable
 F SITE="F111","F112" D
 . S UID="urn:va:test:"_SITE_":4"
 . ; 2nd version of object
 . S METASTAMP2=25
 . D MOCKSSD(UID,METASTAMP2)
 . I SITE="F111" D SETPUT^VPRJTX("/data","SYS4NEW","VPRJTD01")
 . I SITE="F112" D SETPUT^VPRJTX("/data","SYS5NEW","VPRJTD01")
 . D RESPOND^VPRJRSP
 . K HTTPERR,HTTPREQ
 . ; 1st version of object
 . S METASTAMP1=24
 . D MOCKSSD(UID,METASTAMP1)
 . I SITE="F111" D SETPUT^VPRJTX("/data","SYS4","VPRJTD01")
 . I SITE="F112" D SETPUT^VPRJTX("/data","SYS5","VPRJTD01")
 . D RESPOND^VPRJRSP
 . S ^VPRSTATUSOD(SITE,"test",METASTAMP2)=""
 Q
PATDATA ;; @TEST Ensure previous versions of patient data are garbage collected
 ; Look at SAVE^VPRJPS to ensure all save actions are covered
 N PID,UID,VPRJTPID,METASTAMP1,METASTAMP2,JPID
 N HTTPERR,HTTPREQ,HTTPRSP
 ; Stage Mock data
 D MOCKP
 S JPID=$$JPID4PID^VPRJPR(PID)
 ; Run algorithm
 ; Ensure variables from SETPUT are cleared
 K HTTPERR,HTTPREQ,HTTPRSP
 W ! D SETGET^VPRJTX("/tasks/gc/patient/"_PID)
 D RESPOND^VPRJRSP
 D SENDATA^VPRJRSP
 ; Wait for job to finish
 H 1
 ; Ensure HTTP Request had no errors
 D ASSERT(0,$D(^TMP("HTTPERR",$J)),"Error during HTTP rquest")
 ; Ensure previous version of object is gone
 D ASSERT(0,$D(^VPRPT(JPID,PID,UID,METASTAMP1)),"Previous medication ARRAY version found and it shouldn't be found")
 D ASSERT(10,$D(^VPRPT(JPID,PID,UID,METASTAMP2)),"Current medication ARRAY version not found and it should be found")
 ; Ensure previous version of JSON string is gone
 D ASSERT(0,$D(^VPRPTJ("JSON",JPID,PID,UID,METASTAMP1)),"Previous medication JSON version found and it shouldn't be found")
 D ASSERT(10,$D(^VPRPTJ("JSON",JPID,PID,UID,METASTAMP2)),"Current medication JSON version not found and it should be found")
 ; Ensure previous version of the KEY is gone
 D ASSERT(0,$D(^VPRPTJ("KEY",UID,PID,METASTAMP1)),"Previous medication KEY version found and it shouldn't be found")
 D ASSERT(1,$D(^VPRPTJ("KEY",UID,PID,METASTAMP2)),"Current medication KEY version not found and it should be found")
 ; Ensure previous version of the TEMPLATE is gone
 D ASSERT(1,$G(^VPRPTJ("TEMPLATE",JPID,PID,UID,"dose",1))["""dose"":""70 MG""","Current medication TEMPLATE version not found and it should be found")
 Q
PATDATA2 ;; @TEST Ensure previous versions of patient data are garbage collected (order reversed - new stored first)
 ; Look at SAVE^VPRJPS to ensure all save actions are covered
 N PID,UID,VPRJTPID,METASTAMP1,METASTAMP2,JPID
 N HTTPERR,HTTPREQ,HTTPRSP
 ; Stage Mock data
 D MOCKP2
 S JPID=$$JPID4PID^VPRJPR(PID)
 ; Run algorithm
 ; Ensure variables from SETPUT are cleared
 K HTTPERR,HTTPREQ,HTTPRSP
 W ! D SETGET^VPRJTX("/tasks/gc/patient/"_PID)
 D RESPOND^VPRJRSP
 D SENDATA^VPRJRSP
 ; Wait for job to finish
 H 1
 ; Ensure HTTP Request had no errors
 D ASSERT(0,$D(^TMP("HTTPERR",$J)),"Error during HTTP rquest")
 ; Ensure previous version of object is gone
 D ASSERT(0,$D(^VPRPT(JPID,PID,UID,METASTAMP1)),"Previous medication ARRAY version found and it shouldn't be found")
 D ASSERT(10,$D(^VPRPT(JPID,PID,UID,METASTAMP2)),"Current medication ARRAY version not found and it should be found")
 ; Ensure previous version of JSON string is gone
 D ASSERT(0,$D(^VPRPTJ("JSON",JPID,PID,UID,METASTAMP1)),"Previous medication JSON version found and it shouldn't be found")
 D ASSERT(10,$D(^VPRPTJ("JSON",JPID,PID,UID,METASTAMP2)),"Current medication JSON version not found and it should be found")
 ; Ensure previous version of the KEY is gone
 D ASSERT(0,$D(^VPRPTJ("KEY",UID,PID,METASTAMP1)),"Previous medication KEY version found and it shouldn't be found")
 D ASSERT(1,$D(^VPRPTJ("KEY",UID,PID,METASTAMP2)),"Current medication KEY version not found and it should be found")
 ; Ensure previous version of the TEMPLATE is gone
 D ASSERT(1,$G(^VPRPTJ("TEMPLATE",JPID,PID,UID,"dose",1))["""dose"":""70 MG""","Current medication TEMPLATE version not found and it should be found")
 Q
PATDATAll ;; @TEST Ensure previous versions of patient data are garbage collected (All Patients)
 ; Look at SAVE^VPRJPS to ensure all save actions are covered
 N PID,PID2,UID,VPRJTPID,METASTAMP1,METASTAMP2
 N HTTPERR,HTTPREQ,HTTPRSP
 ; Stage Mock data
 D MOCKPM
 ; Run algorithm
 ; Ensure variables from SETPUT are cleared
 K HTTPERR,HTTPREQ,HTTPRSP
 W ! D SETGET^VPRJTX("/tasks/gc/patient")
 D RESPOND^VPRJRSP
 D SENDATA^VPRJRSP
 ; Wait for job to finish
 H 1
 ; Ensure HTTP Request had no errors
 D ASSERT(0,$D(^TMP("HTTPERR",$J)),"Error during HTTP rquest")
 F PID="93EF;-7","93EF;-8" D
 . S PID2=$TR(PID,";",":")
 . S UID="urn:va:med:"_PID2_":15231"
 . ; Ensure previous version of object is gone
 . D ASSERT(0,$D(^VPRPT($$JPID4PID^VPRJPR(PID),PID,UID,METASTAMP1)),"Previous medication ARRAY version found and it shouldn't be found")
 . D ASSERT(10,$D(^VPRPT($$JPID4PID^VPRJPR(PID),PID,UID,METASTAMP2)),"Current medication ARRAY version not found and it should be found")
 . ; Ensure previous version of JSON string is gone
 . D ASSERT(0,$D(^VPRPTJ("JSON",$$JPID4PID^VPRJPR(PID),PID,UID,METASTAMP1)),"Previous medication JSON version found and it shouldn't be found")
 . D ASSERT(10,$D(^VPRPTJ("JSON",$$JPID4PID^VPRJPR(PID),PID,UID,METASTAMP2)),"Current medication JSON version not found and it should be found")
 . ; Ensure previous version of the KEY is gone
 . D ASSERT(0,$D(^VPRPTJ("KEY",UID,PID,METASTAMP1)),"Previous medication KEY version found and it shouldn't be found")
 . D ASSERT(1,$D(^VPRPTJ("KEY",UID,PID,METASTAMP2)),"Current medication KEY version not found and it should be found")
 . ; Ensure previous version of the TEMPLATE is gone
 . D ASSERT(1,$G(^VPRPTJ("TEMPLATE",$$JPID4PID^VPRJPR(PID),PID,UID,"dose",1))["""dose"":""70 MG""","Current medication TEMPLATE version not found and it should be found")
 Q
PATDATAll2 ;; @TEST Ensure previous versions of patient data are garbage collected (All Patients, order reversed - new stored first)
 ; Look at SAVE^VPRJPS to ensure all save actions are covered
 N PID,PID2,UID,VPRJTPID,METASTAMP1,METASTAMP2
 N HTTPERR,HTTPREQ,HTTPRSP
 ; Stage Mock data
 D MOCKPM2
 ; Run algorithm
 ; Ensure variables from SETPUT are cleared
 K HTTPERR,HTTPREQ,HTTPRSP
 W ! D SETGET^VPRJTX("/tasks/gc/patient")
 D RESPOND^VPRJRSP
 D SENDATA^VPRJRSP
 ; Wait for job to finish
 H 1
 ; Ensure HTTP Request had no errors
 D ASSERT(0,$D(^TMP("HTTPERR",$J)),"Error during HTTP rquest")
 F PID="93EF;-7","93EF;-8" D
 . S PID2=$TR(PID,";",":")
 . S UID="urn:va:med:"_PID2_":15231"
 . ; Ensure previous version of object is gone
 . D ASSERT(0,$D(^VPRPT($$JPID4PID^VPRJPR(PID),PID,UID,METASTAMP1)),"Previous medication ARRAY version found and it shouldn't be found")
 . D ASSERT(10,$D(^VPRPT($$JPID4PID^VPRJPR(PID),PID,UID,METASTAMP2)),"Current medication ARRAY version not found and it should be found")
 . ; Ensure previous version of JSON string is gone
 . D ASSERT(0,$D(^VPRPTJ("JSON",$$JPID4PID^VPRJPR(PID),PID,UID,METASTAMP1)),"Previous medication JSON version found and it shouldn't be found")
 . D ASSERT(10,$D(^VPRPTJ("JSON",$$JPID4PID^VPRJPR(PID),PID,UID,METASTAMP2)),"Current medication JSON version not found and it should be found")
 . ; Ensure previous version of the KEY is gone
 . D ASSERT(0,$D(^VPRPTJ("KEY",UID,PID,METASTAMP1)),"Previous medication KEY version found and it shouldn't be found")
 . D ASSERT(1,$D(^VPRPTJ("KEY",UID,PID,METASTAMP2)),"Current medication KEY version not found and it should be found")
 . ; Ensure previous version of the TEMPLATE is gone
 . D ASSERT(1,$G(^VPRPTJ("TEMPLATE",$$JPID4PID^VPRJPR(PID),PID,UID,"dose",1))["""dose"":""70 MG""","Current medication TEMPLATE version not found and it should be found")
 Q
OPDATA ;; @TEST  Ensure previous versions of operational data are garbage collected
 ; Look at SAVE^VPRJPS to ensure all save actions are covered
 N SITE,UID,METASTAMP1,METASTAMP2
 N HTTPERR,HTTPREQ,HTTPRSP
 ; Stage Mock data
 D MOCKD
 ; Run algorithm
 ; Ensure variables from SETPUT are cleared
 K HTTPERR,HTTPREQ,HTTPRSP
 W ! D SETGET^VPRJTX("/tasks/gc/data/"_SITE)
 D RESPOND^VPRJRSP
 D SENDATA^VPRJRSP
 ; Wait for job to finish
 H 1
 ; Ensure HTTP Request had no errors
 D ASSERT(0,$D(^TMP("HTTPERR",$J)),"Error during HTTP rquest")
 ; Ensure previous version of object is gone
 D ASSERT(0,$D(^VPRJD(UID,METASTAMP1)),"Previous test ARRAY version found and it shouldn't be found")
 D ASSERT(10,$D(^VPRJD(UID,METASTAMP2)),"Current test ARRAY version not found and it should be found")
 ; Ensure previous version of JSON string is gone
 D ASSERT(0,$D(^VPRJDJ("JSON",UID,METASTAMP1)),"Previous test JSON version found and it shouldn't be found")
 D ASSERT(10,$D(^VPRJDJ("JSON",UID,METASTAMP2)),"Current test JSON version not found and it should be found")
 ; Ensure previous version of the TEMPLATE is gone
 D ASSERT(1,$G(^VPRJDJ("TEMPLATE",UID,"unit-test-ods-summary",1))["""name"":""omega""","Current test TEMPLATE version not found and it should be found")
 Q
OPDATA2 ;; @TEST Ensure previous versions of operational data are garbage collected (order reversed - new stored first)
 ; Look at SAVE^VPRJPS to ensure all save actions are covered
 N SITE,UID,METASTAMP1,METASTAMP2
 N HTTPERR,HTTPREQ,HTTPRSP
 ; Stage Mock data
 D MOCKD2
 ; Run algorithm
 ; Ensure variables from SETPUT are cleared
 K HTTPERR,HTTPREQ,HTTPRSP
 W ! D SETGET^VPRJTX("/tasks/gc/data/"_SITE)
 D RESPOND^VPRJRSP
 D SENDATA^VPRJRSP
 ; Wait for job to finish
 H 1
 ; Ensure HTTP Request had no errors
 D ASSERT(0,$D(^TMP("HTTPERR",$J)),"Error during HTTP rquest")
 ; Ensure previous version of object is gone
 D ASSERT(0,$D(^VPRJD(UID,METASTAMP1)),"Previous test ARRAY version found and it shouldn't be found")
 D ASSERT(10,$D(^VPRJD(UID,METASTAMP2)),"Current test ARRAY version not found and it should be found")
 ; Ensure previous version of JSON string is gone
 D ASSERT(0,$D(^VPRJDJ("JSON",UID,METASTAMP1)),"Previous test JSON version found and it shouldn't be found")
 D ASSERT(10,$D(^VPRJDJ("JSON",UID,METASTAMP2)),"Current test JSON version not found and it should be found")
 ; Ensure previous version of the TEMPLATE is gone
 D ASSERT(1,$G(^VPRJDJ("TEMPLATE",UID,"unit-test-ods-summary",1))["""name"":""omega""","Current test TEMPLATE version not found and it should be found")
 Q
OPDATAM ;; @TEST  Ensure previous versions of multipleoperational data are garbage collected
 ; Look at SAVE^VPRJPS to ensure all save actions are covered
 N SITE,UID,METASTAMP1,METASTAMP2
 N HTTPERR,HTTPREQ,HTTPRSP
 ; Stage Mock data
 D MOCKDM
 ; Run algorithm
 ; Ensure variables from SETPUT are cleared
 K HTTPERR,HTTPREQ,HTTPRSP
 W ! D SETGET^VPRJTX("/tasks/gc/data/")
 D RESPOND^VPRJRSP
 D SENDATA^VPRJRSP
 ; Wait for job to finish
 H 1
 ; Ensure HTTP Request had no errors
 D ASSERT(0,$D(^TMP("HTTPERR",$J)),"Error during HTTP rquest")
 F SITE="F111","F112" D
 . S UID="urn:va:test:"_SITE_":4"
 . ; Ensure previous version of object is gone
 . D ASSERT(0,$D(^VPRJD(UID,METASTAMP1)),"Previous test ARRAY version found and it shouldn't be found")
 . D ASSERT(10,$D(^VPRJD(UID,METASTAMP2)),"Current test ARRAY version not found and it should be found")
 . ; Ensure previous version of JSON string is gone
 . D ASSERT(0,$D(^VPRJDJ("JSON",UID,METASTAMP1)),"Previous test JSON version found and it shouldn't be found")
 . D ASSERT(10,$D(^VPRJDJ("JSON",UID,METASTAMP2)),"Current test JSON version not found and it should be found")
 . ; Ensure previous version of the TEMPLATE is gone
 . D ASSERT(1,$G(^VPRJDJ("TEMPLATE",UID,"unit-test-ods-summary",1))["""name"":""omega""","Current test TEMPLATE version not found and it should be found")
 Q
OPDATA2M ;; @TEST Ensure previous versions of multiple operational data are garbage collected (order reversed - new stored first)
 ; Look at SAVE^VPRJPS to ensure all save actions are covered
 N SITE,UID,METASTAMP1,METASTAMP2
 N HTTPERR,HTTPREQ,HTTPRSP
 ; Stage Mock data
 D MOCKDM2
 ; Run algorithm
 ; Ensure variables from SETPUT are cleared
 K HTTPERR,HTTPREQ,HTTPRSP
 W ! D SETGET^VPRJTX("/tasks/gc/data/")
 D RESPOND^VPRJRSP
 D SENDATA^VPRJRSP
 ; Wait for job to finish
 H 1
 ; Ensure HTTP Request had no errors
 D ASSERT(0,$D(^TMP("HTTPERR",$J)),"Error during HTTP rquest")
 F SITE="F111","F112" D
 . S UID="urn:va:test:"_SITE_":4"
 . ; Ensure previous version of object is gone
 . D ASSERT(0,$D(^VPRJD(UID,METASTAMP1)),"Previous test ARRAY version found and it shouldn't be found")
 . D ASSERT(10,$D(^VPRJD(UID,METASTAMP2)),"Current test ARRAY version not found and it should be found")
 . ; Ensure previous version of JSON string is gone
 . D ASSERT(0,$D(^VPRJDJ("JSON",UID,METASTAMP1)),"Previous test JSON version found and it shouldn't be found")
 . D ASSERT(10,$D(^VPRJDJ("JSON",UID,METASTAMP2)),"Current test JSON version not found and it should be found")
 . ; Ensure previous version of the TEMPLATE is gone
 . D ASSERT(1,$G(^VPRJDJ("TEMPLATE",UID,"unit-test-ods-summary",1))["""name"":""omega""","Current test TEMPLATE version not found and it should be found")
 Q
 ;
JOBDATA ;; @TEST Ensure previous versions of patient job data are garbage collected
 N HTTPERR,HTTPREQ,HTTPRSP
 N PID,JPID,JID,RJID,TYPE,STAMP,STATUS
 ;
 ; Set up patient identifiers
 S PID="93EF;-8"
 S JPID=$$JPID4PID^VPRJPR(PID)
 ;
 ; Stage mock job data
 S (JID,RJID)=1
 S TYPE="enterprise-sync-request"
 S STAMP=201412180711200
 S STATUS="created"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711201
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711202
 S STATUS="completed"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=2,RJID=1
 S TYPE="vista-ZZUT-data-poller"
 S STAMP=201412180711203
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711204
 S STATUS="completed"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=3,RJID=1
 S TYPE="jmeadows-vitals-sync-request"
 S STAMP=201412180711205
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711206
 S STATUS="completed"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=4,RJID=1
 S TYPE="jmeadows-lab-sync-request"
 S STAMP=201412180711207
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711208
 S STATUS="completed"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 ; Run algorithm
 K HTTPERR,HTTPREQ,HTTPRSP
 W ! D SETGET^VPRJTX("/tasks/gc/job/"_PID)
 D RESPOND^VPRJRSP
 D SENDATA^VPRJRSP
 ; Wait for job to finish
 H 1
 ; Ensure HTTP Request had no errors
 D ASSERT(0,$D(^TMP("HTTPERR",$J)),"Error during HTTP rquest")
 ; Ensure that the correct jobs remain, and the correct jobs are gone
 ; ^VPRJOB(Sequential counter)=Passed JSON Object
 D ASSERT(0,$D(^VPRJOB(1)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(2)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(3)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(4)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(5)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(6)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(7)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(8)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(9)),"Latest job ARRAY not found and it should be found")
 D ASSERT(1,$G(^VPRJOB(3,"status"))="completed","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(5,"status"))="completed","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(7,"status"))="completed","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(9,"status"))="completed","Latest job status should be created and it is not")
 ; Ensure A index entries are correct
 ; ^VPRJOB("A",JPID,Type,Root Job ID,Job ID,TimeStamp,Status)=Sequential Counter
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",1,1,201412180711200,"created")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",1,1,201412180711201,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"enterprise-sync-request",1,1,201412180711202,"completed")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",1,2,201412180711203,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",1,2,201412180711204,"completed")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",1,3,201412180711205,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",1,3,201412180711206,"completed")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",1,4,201412180711207,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",1,4,201412180711208,"completed")),"A index entry does not exist and it should")
 ; Ensure B index entries are correct
 ; ^VPRJOB("B",Sequential counter)=JPID^Type^Root Job ID^Job ID^TimeStamp^Status
 D ASSERT(0,$D(^VPRJOB("B",1)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",2)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",3)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",4)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",5)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",6)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",7)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",8)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",9)),"B index entry does not exist and it should")
 ; Ensure C index entries are correct
 ; ^VPRJOB("C",Job ID,Root Job ID)=""
 D ASSERT(1,$D(^VPRJOB("C",1,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",1,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",1,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",2,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",2,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",3,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",3,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",4,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",4,1)),"C index entry does not exist and it should")
 ; Ensure D index entries are correct
 ; ^VPRJOB("D",JPID,Type,TimeStamp,Sequential counter)=Sequential counter
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711200,1)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711201,2)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711202,3)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711203,4)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711204,5)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711205,6)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711206,7)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711207,8)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711208,9)),"D index entry does not exist and it should")
 Q
 ;
JOBMDATA ;; @TEST Ensure previous versions of patient job data are garbage collected with multiple jobs stored
 N HTTPERR,HTTPREQ,HTTPRSP
 N PID,JPID,JID,RJID,TYPE,STAMP,STATUS
 ;
 ; Set up patient identifiers
 S PID="93EF;-8"
 S JPID=$$JPID4PID^VPRJPR(PID)
 ;
 ; Stage second mock job data
 S JID=5,RJID=2
 S TYPE="enterprise-sync-request"
 S STAMP=201412180711209
 S STATUS="created"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711210
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711211
 S STATUS="completed"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=6,RJID=2
 S TYPE="vista-ZZUT-data-poller"
 S STAMP=201412180711212
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711213
 S STATUS="completed"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=7,RJID=2
 S TYPE="jmeadows-vitals-sync-request"
 S STAMP=201412180711214
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711215
 S STATUS="completed"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=8,RJID=2
 S TYPE="jmeadows-lab-sync-request"
 S STAMP=201412180711216
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711217
 S STATUS="completed"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 ; Run algorithm
 K HTTPERR,HTTPREQ,HTTPRSP
 W ! D SETGET^VPRJTX("/tasks/gc/job/"_PID)
 D RESPOND^VPRJRSP
 D SENDATA^VPRJRSP
 ; Wait for job to finish
 H 1
 ; Ensure HTTP Request had no errors
 D ASSERT(0,$D(^TMP("HTTPERR",$J)),"Error during HTTP rquest")
 ; Ensure that the correct jobs remain, and the correct jobs are gone
 ; ^VPRJOB(Sequential counter)=Passed JSON Object
 D ASSERT(0,$D(^VPRJOB(1)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(2)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(3)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(4)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(5)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(6)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(7)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(8)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(9)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(10)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(11)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(12)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(13)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(14)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(15)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(16)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(17)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(18)),"Latest job ARRAY not found and it should be found")
 D ASSERT(1,$G(^VPRJOB(12,"status"))="completed","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(14,"status"))="completed","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(16,"status"))="completed","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(18,"status"))="completed","Latest job status should be created and it is not")
 ; Ensure A index entries are correct
 ; ^VPRJOB("A",JPID,Type,Root Job ID,Job ID,TimeStamp,Status)=Sequential Counter
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",1,1,201412180711200,"created")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",1,1,201412180711201,"started")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",1,1,201412180711202,"completed")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",1,2,201412180711203,"started")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",1,2,201412180711204,"completed")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",1,3,201412180711205,"started")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",1,3,201412180711206,"completed")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",1,4,201412180711207,"started")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",1,4,201412180711208,"completed")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",2,5,201412180711209,"created")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",2,5,201412180711210,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"enterprise-sync-request",2,5,201412180711211,"completed")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",2,6,201412180711212,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",2,6,201412180711213,"completed")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",2,7,201412180711214,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",2,7,201412180711215,"completed")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",2,8,201412180711216,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",2,8,201412180711217,"completed")),"A index entry does not exist and it should")
 ; Ensure B index entries are correct
 ; ^VPRJOB("B",Sequential counter)=JPID^Type^Root Job ID^Job ID^TimeStamp^Status
 D ASSERT(0,$D(^VPRJOB("B",1)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",2)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",3)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",4)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",5)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",6)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",7)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",8)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",9)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",10)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",11)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",12)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",13)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",14)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",15)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",16)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",17)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",18)),"B index entry does not exist and it should")
 ; Ensure C index entries are correct
 ; ^VPRJOB("C",Job ID,Root Job ID)=""
 D ASSERT(0,$D(^VPRJOB("C",1,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",1,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",1,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",2,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",2,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",3,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",3,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",4,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",4,1)),"C index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("C",5,2)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",5,2)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",5,2)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",6,2)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",6,2)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",7,2)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",7,2)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",8,2)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",8,2)),"C index entry does not exist and it should")
 ; Ensure D index entries are correct
 ; ^VPRJOB("D",JPID,Type,TimeStamp,Sequential counter)=Sequential counter
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711200,1)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711201,2)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711202,3)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711203,4)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711204,5)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711205,6)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711206,7)),"D index entry exist and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711207,8)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711208,9)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711209,10)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711210,11)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711211,12)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711212,13)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711213,14)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711214,15)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711215,16)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711216,17)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711217,18)),"D index entry does not exist and it should")
 Q
 ;
JOBDATAll ;; @TEST Ensure previous versions of patient job data are garbage collected (All Patients)
 ; Remove old job data that has already been garbage collected, to properly test cross patient garbage collection
 K ^VPRJOB
 ;
 N HTTPERR,HTTPREQ,HTTPRSP
 N PID,JPID,JID,RJID,TYPE,STAMP,STATUS
 ;
 ; Set up patient identifiers
 S PID="93EF;-8"
 S JPID=$$JPID4PID^VPRJPR(PID)
 ;
 ; Stage mock job data
 S (JID,RJID)=1
 S TYPE="enterprise-sync-request"
 S STAMP=201412180711200
 S STATUS="created"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711201
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711202
 S STATUS="completed"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=2,RJID=1
 S TYPE="vista-ZZUT-data-poller"
 S STAMP=201412180711203
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711204
 S STATUS="completed"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=3,RJID=1
 S TYPE="jmeadows-vitals-sync-request"
 S STAMP=201412180711205
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711206
 S STATUS="completed"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=4,RJID=1
 S TYPE="jmeadows-lab-sync-request"
 S STAMP=201412180711207
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711208
 S STATUS="completed"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 ; Set up second patient identifiers
 S PID="93EF;-9"
 S JPID=$$JPID4PID^VPRJPR(PID)
 ;
 ; Stage mock job data
 S JID=5,RJID=2
 S TYPE="enterprise-sync-request"
 S STAMP=201412180711209
 S STATUS="created"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711210
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711211
 S STATUS="error"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=6,RJID=2
 S TYPE="vista-ZZUT-data-poller"
 S STAMP=201412180711212
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711213
 S STATUS="error"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=7,RJID=2
 S TYPE="jmeadows-vitals-sync-request"
 S STAMP=201412180711214
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711215
 S STATUS="error"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=8,RJID=2
 S TYPE="jmeadows-lab-sync-request"
 S STAMP=201412180711216
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711217
 S STATUS="error"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 ; Run algorithm
 K HTTPERR,HTTPREQ,HTTPRSP
 W ! D SETGET^VPRJTX("/tasks/gc/job")
 D RESPOND^VPRJRSP
 D SENDATA^VPRJRSP
 ; Wait for job to finish
 H 1
 ; Ensure HTTP Request had no errors
 D ASSERT(0,$D(^TMP("HTTPERR",$J)),"Error during HTTP rquest")
 ; Ensure that the correct jobs remain, and the correct jobs are gone
 ; ^VPRJOB(Sequential counter)=Passed JSON Object
 D ASSERT(0,$D(^VPRJOB(1)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(2)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(3)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(4)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(5)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(6)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(7)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(8)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(9)),"Latest job ARRAY not found and it should be found")
 D ASSERT(1,$G(^VPRJOB(3,"status"))="completed","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(5,"status"))="completed","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(7,"status"))="completed","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(9,"status"))="completed","Latest job status should be created and it is not")
 D ASSERT(0,$D(^VPRJOB(10)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(11)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(12)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(13)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(14)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(15)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(16)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(17)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(18)),"Latest job ARRAY not found and it should be found")
 D ASSERT(1,$G(^VPRJOB(12,"status"))="error","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(14,"status"))="error","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(16,"status"))="error","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(18,"status"))="error","Latest job status should be created and it is not")
 ; Ensure A index entries are correct
 ; Set proper JPID for first patient
 S JPID="52833885-af7c-4899-90be-b3a6630b2370"
 ; ^VPRJOB("A",JPID,Type,Root Job ID,Job ID,TimeStamp,Status)=Sequential Counter
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",1,1,201412180711200,"created")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",1,1,201412180711201,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"enterprise-sync-request",1,1,201412180711202,"completed")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",1,2,201412180711203,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",1,2,201412180711204,"completed")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",1,3,201412180711205,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",1,3,201412180711206,"completed")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",1,4,201412180711207,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",1,4,201412180711208,"completed")),"A index entry does not exist and it should")
 ; Set proper JPID for second patient
 S JPID="52833885-af7c-4899-90be-b3a6630b2371"
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",2,5,201412180711209,"created")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",2,5,201412180711210,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"enterprise-sync-request",2,5,201412180711211,"error")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",2,6,201412180711212,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",2,6,201412180711213,"error")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",2,7,201412180711214,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",2,7,201412180711215,"error")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",2,8,201412180711216,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",2,8,201412180711217,"error")),"A index entry does not exist and it should")
 ; Ensure B index entries are correct
 ; ^VPRJOB("B",Sequential counter)=JPID^Type^Root Job ID^Job ID^TimeStamp^Status
 D ASSERT(0,$D(^VPRJOB("B",1)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",2)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",3)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",4)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",5)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",6)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",7)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",8)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",9)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",10)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",11)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",12)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",13)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",14)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",15)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",16)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",17)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",18)),"B index entry does not exist and it should")
 ; Ensure C index entries are correct
 ; ^VPRJOB("C",Job ID,Root Job ID)=""
 D ASSERT(1,$D(^VPRJOB("C",1,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",1,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",1,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",2,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",2,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",3,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",3,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",4,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",4,1)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",5,2)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",5,2)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",5,2)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",6,2)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",6,2)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",7,2)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",7,2)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",8,2)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",8,2)),"C index entry does not exist and it should")
 ; Ensure D index entries are correct
 ; Set proper JPID for first patient
 S JPID="52833885-af7c-4899-90be-b3a6630b2370"
 ; ^VPRJOB("D",JPID,Type,TimeStamp,Sequential counter)=Sequential counter
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711200,1)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711201,2)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711202,3)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711203,4)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711204,5)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711205,6)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711206,7)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711207,8)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711208,9)),"D index entry does not exist and it should")
 ; Set proper JPID for second patient
 S JPID="52833885-af7c-4899-90be-b3a6630b2371"
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711209,10)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711210,11)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711211,12)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711212,13)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711213,14)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711214,15)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711215,16)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711216,17)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711217,18)),"D index entry does not exist and it should")
 Q
 ;
JOBMDATALL ;; @TEST Ensure previous versions of patient job data are garbage collected with multiple jobs stored (All Patients)
 N HTTPERR,HTTPREQ,HTTPRSP
 N PID,JPID,JID,RJID,TYPE,STAMP,STATUS
 ;
 ; Set up patient identifiers
 S PID="93EF;-8"
 S JPID=$$JPID4PID^VPRJPR(PID)
 ;
 ; Stage second mock job data
 S JID=9,RJID=3
 S TYPE="enterprise-sync-request"
 S STAMP=201412180711218
 S STATUS="created"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711219
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711220
 S STATUS="completed"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=10,RJID=3
 S TYPE="vista-ZZUT-data-poller"
 S STAMP=201412180711221
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711222
 S STATUS="completed"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=11,RJID=3
 S TYPE="jmeadows-vitals-sync-request"
 S STAMP=201412180711223
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711224
 S STATUS="completed"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=12,RJID=3
 S TYPE="jmeadows-lab-sync-request"
 S STAMP=201412180711225
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711226
 S STATUS="completed"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 ; Set up second patient identifiers
 S PID="93EF;-9"
 S JPID=$$JPID4PID^VPRJPR(PID)
 ;
 ; Stage second mock job data
 S JID=13,RJID=4
 S TYPE="enterprise-sync-request"
 S STAMP=201412180711227
 S STATUS="created"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711228
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711229
 S STATUS="error"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=14,RJID=4
 S TYPE="vista-ZZUT-data-poller"
 S STAMP=201412180711230
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711231
 S STATUS="error"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=15,RJID=4
 S TYPE="jmeadows-vitals-sync-request"
 S STAMP=201412180711232
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711233
 S STATUS="error"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S JID=16,RJID=4
 S TYPE="jmeadows-lab-sync-request"
 S STAMP=201412180711234
 S STATUS="started"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 S STAMP=201412180711235
 S STATUS="error"
 D MOCKJS(JID,RJID,JPID,TYPE,STAMP,STATUS) ; Setup job status global
 ;
 ; Run algorithm
 K HTTPERR,HTTPREQ,HTTPRSP
 W ! D SETGET^VPRJTX("/tasks/gc/job")
 D RESPOND^VPRJRSP
 D SENDATA^VPRJRSP
 ; Wait for job to finish
 H 1
 ; Ensure HTTP Request had no errors
 D ASSERT(0,$D(^TMP("HTTPERR",$J)),"Error during HTTP rquest")
 ; Ensure that the correct jobs remain, and the correct jobs are gone
 ; ^VPRJOB(Sequential counter)=Passed JSON Object
 D ASSERT(0,$D(^VPRJOB(1)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(2)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(3)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(4)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(5)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(6)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(7)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(8)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(9)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(10)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(11)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(12)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(13)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(14)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(15)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(16)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(17)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(18)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(19)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(20)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(21)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(22)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(23)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(24)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(25)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(26)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(27)),"Latest job ARRAY not found and it should be found")
 D ASSERT(1,$G(^VPRJOB(21,"status"))="completed","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(23,"status"))="completed","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(25,"status"))="completed","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(27,"status"))="completed","Latest job status should be created and it is not")
 D ASSERT(0,$D(^VPRJOB(28)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(0,$D(^VPRJOB(29)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(30)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(31)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(32)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(33)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(34)),"Latest job ARRAY not found and it should be found")
 D ASSERT(0,$D(^VPRJOB(35)),"Earlier job ARRAY found and it should not be found")
 D ASSERT(10,$D(^VPRJOB(36)),"Latest job ARRAY not found and it should be found")
 D ASSERT(1,$G(^VPRJOB(30,"status"))="error","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(32,"status"))="error","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(34,"status"))="error","Latest job status should be created and it is not")
 D ASSERT(1,$G(^VPRJOB(36,"status"))="error","Latest job status should be created and it is not")
 ; Ensure A index entries are correct
 ; Set proper JPID for first patient
 S JPID="52833885-af7c-4899-90be-b3a6630b2370"
 ; ^VPRJOB("A",JPID,Type,Root Job ID,Job ID,TimeStamp,Status)=Sequential Counter
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",1,1,201412180711200,"created")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",1,1,201412180711201,"started")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",1,1,201412180711202,"completed")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",1,2,201412180711203,"started")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",1,2,201412180711204,"completed")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",1,3,201412180711205,"started")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",1,3,201412180711206,"completed")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",1,4,201412180711207,"started")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",1,4,201412180711208,"completed")),"A index entry exists and it should not")
 ; Set proper JPID for second patient
 S JPID="52833885-af7c-4899-90be-b3a6630b2371"
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",2,5,201412180711209,"created")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",2,5,201412180711210,"started")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",2,5,201412180711211,"error")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",2,6,201412180711212,"started")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",2,6,201412180711213,"error")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",2,7,201412180711214,"started")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",2,7,201412180711215,"error")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",2,8,201412180711216,"started")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",2,8,201412180711217,"error")),"A index entry exists and it should not")
 ; Set proper JPID for first patient
 S JPID="52833885-af7c-4899-90be-b3a6630b2370"
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",3,9,201412180711218,"created")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",3,9,201412180711219,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"enterprise-sync-request",3,9,201412180711220,"completed")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",3,10,201412180711221,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",3,10,201412180711222,"completed")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",3,11,201412180711223,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",3,11,201412180711224,"completed")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",3,12,201412180711225,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",3,12,201412180711226,"completed")),"A index entry does not exist and it should")
 ; Set proper JPID for second patient
 S JPID="52833885-af7c-4899-90be-b3a6630b2371"
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",4,13,201412180711227,"created")),"A index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"enterprise-sync-request",4,13,201412180711228,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"enterprise-sync-request",4,13,201412180711229,"error")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",4,14,201412180711230,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"vista-ZZUT-data-poller",4,14,201412180711231,"error")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",4,15,201412180711232,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"jmeadows-vitals-sync-request",4,15,201412180711233,"error")),"A index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",4,16,201412180711234,"started")),"A index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("A",JPID,"jmeadows-lab-sync-request",4,16,201412180711235,"error")),"A index entry does not exist and it should")
 ; Ensure B index entries are correct
 ; ^VPRJOB("B",Sequential counter)=JPID^Type^Root Job ID^Job ID^TimeStamp^Status
 D ASSERT(0,$D(^VPRJOB("B",1)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",2)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",3)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",4)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",5)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",6)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",7)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",8)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",9)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",10)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",11)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",12)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",13)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",14)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",15)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",16)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",17)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",18)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",19)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",20)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",21)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",22)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",23)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",24)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",25)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",26)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",27)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",28)),"B index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("B",29)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",30)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",31)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",32)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",33)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",34)),"B index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("B",35)),"B index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("B",36)),"B index entry does not exist and it should")
 ; Ensure C index entries are correct
 ; ^VPRJOB("C",Job ID,Root Job ID)=""
 D ASSERT(0,$D(^VPRJOB("C",1,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",1,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",1,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",2,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",2,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",3,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",3,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",4,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",4,1)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",5,2)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",5,2)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",5,2)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",6,2)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",6,2)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",7,2)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",7,2)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",8,2)),"C index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("C",8,2)),"C index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("C",9,3)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",9,3)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",9,3)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",10,3)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",10,3)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",11,3)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",11,3)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",12,3)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",12,3)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",13,4)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",13,4)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",13,4)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",14,4)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",14,4)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",15,4)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",15,4)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",16,4)),"C index entry does not exist and it should")
 D ASSERT(1,$D(^VPRJOB("C",16,4)),"C index entry does not exist and it should")
 ; Ensure D index entries are correct
 ; Set proper JPID for first patient
 S JPID="52833885-af7c-4899-90be-b3a6630b2370"
 ; ^VPRJOB("D",JPID,Type,TimeStamp,Sequential counter)=Sequential counter
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711200,1)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711201,2)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711202,3)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711203,4)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711204,5)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711205,6)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711206,7)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711207,8)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711208,9)),"D index entry exists and it should not")
 ; Set proper JPID for second patient
 S JPID="52833885-af7c-4899-90be-b3a6630b2371"
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711209,10)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711210,11)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711211,12)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711212,13)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711213,14)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711214,15)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711215,16)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711216,17)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711217,18)),"D index entry exists and it should not")
 ; Set proper JPID for first patient
 S JPID="52833885-af7c-4899-90be-b3a6630b2370"
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711218,19)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711219,20)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711220,21)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711221,22)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711222,23)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711223,24)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711224,25)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711225,26)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711226,27)),"D index entry does not exist and it should")
 ; Set proper JPID for second patient
 S JPID="52833885-af7c-4899-90be-b3a6630b2371"
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711227,28)),"D index entry exists and it should not")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711228,29)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"enterprise-sync-request",201412180711229,30)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711230,31)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"vista-ZZUT-data-poller",201412180711231,32)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711232,33)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"jmeadows-vitals-sync-request",201412180711233,34)),"D index entry does not exist and it should")
 D ASSERT(0,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711234,35)),"D index entry exists and it should not")
 D ASSERT(1,$D(^VPRJOB("D",JPID,"jmeadows-lab-sync-request",201412180711235,36)),"D index entry does not exist and it should")
 Q

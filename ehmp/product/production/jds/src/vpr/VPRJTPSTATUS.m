VPRJTPSTATUS ;KRM/CJE,V4W/DLW -- Unit Tests for business logic based sync status endpoints
 ;
STARTUP  ; Run once before all tests
 K ^VPRSTATUS
 K ^VPRJOB
 K ^VPRPTJ("JPID")
 K ^VPRMETA("JPID")
 D PATIDS
 Q
SHUTDOWN ; Run once after all tests
 K ^VPRSTATUS
 K ^VPRJOB
 K ^VPRPTJ("JPID")
 K ^VPRMETA("JPID")
 Q
SETUP    ; Run before each test
 K HTTPREQ,HTTPERR,HTTPRSP
 K ^VPRJOB,^VPRSTATUS
 Q
TEARDOWN ; Run after each test
 K HTTPREQ,HTTPERR,HTTPRSP
 K ^VPRJOB,^VPRSTATUS
 K ^||TMP("HTTPERR",$J)
 K ^||TMP($J)
 Q
ASSERT(EXPECT,ACTUAL,MSG) ; for convenience
 D EQ^VPRJT(EXPECT,ACTUAL,$G(MSG))
 Q
 ;
BASIC(SITE,ID,STAMPTIME) ; basic sync status
 I $G(STAMPTIME)="" S STAMPTIME=20141031094920
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"stampTime")=STAMPTIME
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"allergy",STAMPTIME)=""
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"allergy","urn:va:allergy:"_SITE_":"_ID_":1001",STAMPTIME)=""
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"allergy","urn:va:allergy:"_SITE_":"_ID_":1002",STAMPTIME)=""
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"vitals",STAMPTIME)=""
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"vitals","urn:va:vitals:"_SITE_":"_ID_":1001",STAMPTIME)=""
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"vitals","urn:va:vitals:"_SITE_":"_ID_":1002",STAMPTIME)=""
 Q
 ;
COMPLETEBASIC(SITE,ID,STAMPTIME)
 I $G(STAMPTIME)="" S STAMPTIME=20141031094920
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"vitals","urn:va:vitals:"_SITE_":"_ID_":1001",STAMPTIME,"stored")=1
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"vitals","urn:va:vitals:"_SITE_":"_ID_":1002",STAMPTIME,"stored")=1
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"allergy","urn:va:allergy:"_SITE_":"_ID_":1001",STAMPTIME,"stored")=1
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"allergy","urn:va:allergy:"_SITE_":"_ID_":1002",STAMPTIME,"stored")=1
 Q
 ;
COMPLETEBASICSOLR(SITE,ID,STAMPTIME)
 I $G(STAMPTIME)="" S STAMPTIME=20141031094920
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"vitals","urn:va:vitals:"_SITE_":"_ID_":1001",STAMPTIME,"solrStored")=1
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"vitals","urn:va:vitals:"_SITE_":"_ID_":1002",STAMPTIME,"solrStored")=1
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"allergy","urn:va:allergy:"_SITE_":"_ID_":1001",STAMPTIME,"solrStored")=1
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"allergy","urn:va:allergy:"_SITE_":"_ID_":1002",STAMPTIME,"solrStored")=1
 Q
 ;
COMPLETEBASICSYNCERR(SITE,ID,STAMPTIME)
 I $G(STAMPTIME)="" S STAMPTIME=20141031094920
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"vitals","urn:va:vitals:"_SITE_":"_ID_":1001",STAMPTIME,"syncError")=1
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"vitals","urn:va:vitals:"_SITE_":"_ID_":1002",STAMPTIME,"syncError")=1
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"allergy","urn:va:allergy:"_SITE_":"_ID_":1001",STAMPTIME,"syncError")=1
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"allergy","urn:va:allergy:"_SITE_":"_ID_":1002",STAMPTIME,"syncError")=1
 Q
 ;
COMPLETEBASICSOLRERR(SITE,ID,STAMPTIME)
 I $G(STAMPTIME)="" S STAMPTIME=20141031094920
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"vitals","urn:va:vitals:"_SITE_":"_ID_":1001",STAMPTIME,"solrError")=1
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"vitals","urn:va:vitals:"_SITE_":"_ID_":1002",STAMPTIME,"solrError")=1
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"allergy","urn:va:allergy:"_SITE_":"_ID_":1001",STAMPTIME,"solrError")=1
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369",SITE_";"_ID,SITE,"allergy","urn:va:allergy:"_SITE_":"_ID_":1002",STAMPTIME,"solrError")=1
 Q
 ;
PATIDS ; Setup patient identifiers
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","SITE;3")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","SITE;3")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","1234V4321")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","DOD;12345678")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","HDR;1234V4321")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","VLER;1234V4321")=""
 S ^VPRPTJ("JPID","SITE;3")="52833885-af7c-4899-90be-b3a6630b2369"
 S ^VPRPTJ("JPID","SITE;3")="52833885-af7c-4899-90be-b3a6630b2369"
 S ^VPRPTJ("JPID","1234V4321")="52833885-af7c-4899-90be-b3a6630b2369"
 S ^VPRPTJ("JPID","DOD;12345678")="52833885-af7c-4899-90be-b3a6630b2369"
 S ^VPRPTJ("JPID","HDR;1234V4321")="52833885-af7c-4899-90be-b3a6630b2369"
 S ^VPRPTJ("JPID","VLER;1234V4321")="52833885-af7c-4899-90be-b3a6630b2369"
 Q
 ;
DELPATIDS ; Delete patient identifiers
 K ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")
 K ^VPRPTJ("JPID","SITE;3")
 K ^VPRPTJ("JPID","SITE;3")
 K ^VPRPTJ("JPID","1234V4321")
 K ^VPRPTJ("JPID","DOD;12345678")
 K ^VPRPTJ("JPID","HDR;1234V4321")
 K ^VPRPTJ("JPID","VLER;1234V4321")
 Q
 ;
JOB(PIDVALUE,ROOTJOBID,STATUS,TIMESTAMP,TYPE) ; Build Job history for business logic
 N JOB,JSON,ERR,ARGS
 S JOB("jobId")=$S($G(TYPE)="enterprise-sync-request":ROOTJOBID,1:$$UUID^VPRJRUT)
 S JOB("jpid")="52833885-af7c-4899-90be-b3a6630b2369"
 S JOB("patientIdentifier","type")="pid"
 S JOB("patientIdentifier","value")=PIDVALUE
 S JOB("rootJobId")=ROOTJOBID
 S JOB("status")=STATUS
 S JOB("timestamp")=TIMESTAMP
 S JOB("type")=TYPE
 D ENCODE^VPRJSON("JOB","JSON","ERR")
 D SET^VPRJOB(.ARGS,.JSON)
 Q
 ;
 ; Tests
 ;
GETBEFORE ;; @TEST Get Patient Sync Status before metastamp stored
 N DATA,ARG,ERR,OBJECT,HTTPERR
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 ;
 ; Try again with an event stored, but no meta-stamp is stored
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","SITE;3","SITE","vitals","urn:va:vitals:SITE:3:1002",20141031094920,"stored")=1
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ; Ensure that the JSON matches what we expect
 ; this Sync Status should always be in progress
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 I $D(DATA) K @DATA
 Q
 ;
GETSTARTEDESR ;; @TEST Get Patient Sync Status ICN - ESR started, no meta-stamp or other jobs
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 ;
 ; Modify patient identifiers
 D DELPATIDS
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","1234V4321")=""
 S ^VPRPTJ("JPID","1234V4321")="52833885-af7c-4899-90be-b3a6630b2369"
 ;
 S ARG("icnpidjpid")="1234V4321"
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("1234V4321",ROOTJOBID,"started",20160420110400,"enterprise-sync-request")
 ;
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("20160420110400",$G(OBJECT("latestEnterpriseSyncRequestTimestamp")))
 D ASSERT("20160420110400",$G(OBJECT("latestJobTimestamp")))
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 ;
 I $D(DATA) K @DATA
 ; Cleanup patient identifiers
 D DELPATIDS
 D PATIDS
 K ^VPRJOB
 Q
 ;
GETSINGLEINPROGRESS ;; @TEST Get Single Site in-progress Patient Sync Status - no jobs
 N DATA,ARG,ERR,OBJECT,HTTPERR
 D BASIC("SITE",3)
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETSINGLECOMPLETE ;; @TEST Get Single Site complete Patient Sync Status - no jobs
 N DATA,ARG,ERR,OBJECT,HTTPERR
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 I $D(DATA) K @DATA
 Q
GETSINGLEESRERR ;; @TEST Get Single Site complete Patient Sync Status - enterprise-sync-request in error
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"error",20160420110400,"enterprise-sync-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("true",$G(OBJECT("hasError")),"hasError attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETSINGLEVSR ;; @TEST Get Single Site complete Patient Sync Status - vista-SITE-subscribe-request created
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"created",20160420110400,"vista-SITE-subscribe-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETSINGLEVDP ;; @TEST Get Single Site complete Patient Sync Status - vista-SITE-data-allergy-poller created
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"created",20160420110400,"vista-SITE-data-allergy-poller")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETSINGLEVHSR ;; @TEST Get Single Site complete Patient Sync Status - vistahdr-SITE-subscribe-request created
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"created",20160420110400,"vistahdr-SITE-subscribe-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETSINGLEVHDP ;; @TEST Get Single Site complete Patient Sync Status - vistahdr-SITE-data-allergy-poller created
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"created",20160420110400,"vistahdr-SITE-data-allergy-poller")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETSINGLEHSR ;; @TEST Get Single Site complete Patient Sync Status - hdr-subscribe-request created
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("HDR;1234V4321",ROOTJOBID,"created",20160420110400,"hdr-subscribe-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("HDR;1234V4321",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR should exist")
 D ASSERT("false",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETSINGLEHS ;; @TEST Get Single Site complete Patient Sync Status - hdr-sync-allergy-request created
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("HDR;1234V4321",ROOTJOBID,"created",20160420110400,"hdr-sync-allergy-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("HDR;1234V4321",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR should exist")
 D ASSERT("false",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETSINGLEHX ;; @TEST Get Single Site complete Patient Sync Status - hdr-xform-allergy-request created
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("HDR;1234V4321",ROOTJOBID,"created",20160420110400,"hdr-xform-allergy-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("HDR;1234V4321",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR should exist")
 D ASSERT("false",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETSINGLEJS ;; @TEST Get Single Site complete Patient Sync Status - jmeadows-sync-request created
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("DOD;12345678",ROOTJOBID,"created",20160420110400,"jmeadows-sync-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("false",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETSINGLEJDR ;; @TEST Get Single Site complete Patient Sync Status - jmeadows-document-retrieval created
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("DOD;12345678",ROOTJOBID,"created",20160420110400,"jmeadows-document-retrieval")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("false",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETSINGLEJPDT ;; @TEST Get Single Site complete Patient Sync Status - jmeadows-pdf-document-transform created
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("DOD;12345678",ROOTJOBID,"created",20160420110400,"jmeadows-pdf-document-transform")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("false",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETSINGLEJX ;; @TEST Get Single Site complete Patient Sync Status - jmeadows-xform-allergy-vpr created
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("DOD;12345678",ROOTJOBID,"created",20160420110400,"jmeadows-xform-allergy-vpr")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("false",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETSINGLEJCDC ;; @TEST Get Single Site complete Patient Sync Status - jmeadows-cda-document-conversion created
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("DOD;12345678",ROOTJOBID,"created",20160420110400,"jmeadows-cda-document-conversion")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("false",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETALLESR ;; @TEST Get ALL site complete Patient Sync Status - enterprise-sync-request created
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D BASIC("HDR","1234V4321")
 D COMPLETEBASIC("HDR","1234V4321")
 D BASIC("DOD",12345678)
 D COMPLETEBASIC("DOD",12345678)
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"created",20160420110400,"enterprise-sync-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 D ASSERT("HDR;1234V4321",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR should exist")
 D ASSERT("false",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR shouldn't be complete")
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("false",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETALLESRVHSR ;; @TEST Get ALL site complete Patient Sync Status - enterprise-sync-request,vistahdr-sync-request created
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D BASIC("HDR","1234V4321")
 D COMPLETEBASIC("HDR","1234V4321")
 D BASIC("DOD",12345678)
 D COMPLETEBASIC("DOD",12345678)
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 ;D JOB("SITE;3",ROOTJOBID,"created",20160420110400,"enterprise-sync-request")
 ;D JOB("SITE;3",ROOTJOBID,"complete",20160420110400,"vistahdr-SITE-subscribe-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 D ASSERT("HDR;1234V4321",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR should exist")
 D ASSERT("false",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR shouldn't be complete")
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("false",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETSITESINPROGRESS ;; @TEST Get single site inProgress Patient Sync Status - site filter
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D BASIC("SITE",3)
 D BASIC("HDR","1234V4321")
 D BASIC("DOD",12345678)
 ;
 S ARG("icnpidjpid")="SITE;3"
 S ARG("sites")="SITE"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("",$G(OBJECT("syncCompleted")),"SyncCompleted shouldn't exist")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 ; No other sites should show up
 D ASSERT("",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE shouldn't exist")
 D ASSERT("",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 D ASSERT("",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR shouldn't exist")
 D ASSERT("",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR shouldn't be complete")
 D ASSERT("",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD shouldn't exist")
 D ASSERT("",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETSITESCOMPLETE ;; @TEST Get single site complete Patient Sync Status - site filter
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D BASIC("HDR","1234V4321")
 D COMPLETEBASIC("HDR","1234V4321")
 D BASIC("DOD",12345678)
 D COMPLETEBASIC("DOD",12345678)
 ;
 S ARG("icnpidjpid")="SITE;3"
 S ARG("sites")="SITE"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("",$G(OBJECT("syncCompleted")),"SyncCompleted shouldn't exist")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 ; No other sites should show up
 D ASSERT("",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE shouldn't exist")
 D ASSERT("",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 D ASSERT("",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR shouldn't exist")
 D ASSERT("",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR shouldn't be complete")
 D ASSERT("",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD shouldn't exist")
 D ASSERT("",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETSITESOPENJOB ;; @TEST Get single site complete Patient Sync Status - enterprise-sync-request
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D BASIC("HDR","1234V4321")
 D COMPLETEBASIC("HDR","1234V4321")
 D BASIC("DOD",12345678)
 D COMPLETEBASIC("DOD",12345678)
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"created",20160420110400,"enterprise-sync-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 S ARG("sites")="SITE"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("",$G(OBJECT("syncCompleted")),"SyncCompleted shouldn't exist")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 ; No other sites should show up
 D ASSERT("",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE shouldn't exist")
 D ASSERT("",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 D ASSERT("",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR shouldn't exist")
 D ASSERT("",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR shouldn't be complete")
 D ASSERT("",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD shouldn't exist")
 D ASSERT("",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETMSITESINPROGRESS ;; @TEST Get multiple site inProgress Patient Sync Status - site filter
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D BASIC("SITE",3)
 D BASIC("HDR","1234V4321")
 D BASIC("DOD",12345678)
 ;
 S ARG("icnpidjpid")="SITE;3"
 S ARG("sites")="SITE,DOD"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("",$G(OBJECT("syncCompleted")),"SyncCompleted shouldn't exist")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("false",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD shouldn't be complete")
 ; No other sites should show up
 D ASSERT("",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE shouldn't exist")
 D ASSERT("",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 D ASSERT("",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR shouldn't exist")
 D ASSERT("",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETMSITESCOMPLETE ;; @TEST Get multiple site complete Patient Sync Status - site filter
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D BASIC("HDR","1234V4321")
 D COMPLETEBASIC("HDR","1234V4321")
 D BASIC("DOD",12345678)
 D COMPLETEBASIC("DOD",12345678)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"vista-SITE-data-allergy-poller")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"vistahdr-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"vistahdr-SITE-data-allergy-poller")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420110400,"hdr-sync-request")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420110400,"hdr-sync-allergy-request")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420110400,"hdr-xform-allergy-vpr")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110400,"jmeadows-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110400,"jmeadows-sync-allergy-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110400,"jmeadows-document-retrieval")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110400,"jmeadows-pdf-document-transform")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110400,"jmeadows-xform-allergy-vpr")
 ;
 S ARG("icnpidjpid")="SITE;3"
 S ARG("sites")="SITE,HDR"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("",$G(OBJECT("syncCompleted")),"SyncCompleted shouldn't exist")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("HDR;1234V4321",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR shouldn't exist")
 D ASSERT("true",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR should be complete")
 ; No other sites should show up
 D ASSERT("",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE shouldn't exist")
 D ASSERT("",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 D ASSERT("",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD shouldn't exist")
 D ASSERT("",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETMSITESOPENJOB ;; @TEST Get multiple site complete Patient Sync Status - enterprise-sync-request
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D BASIC("HDR","1234V4321")
 D COMPLETEBASIC("HDR","1234V4321")
 D BASIC("DOD",12345678)
 D COMPLETEBASIC("DOD",12345678)
 ;
 ; Create enterprise-sync-request error job
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"created",20160420110400,"enterprise-sync-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 S ARG("sites")="SITE,SITE"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("",$G(OBJECT("syncCompleted")),"SyncCompleted shouldn't exist")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE shouldn't exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE shouldn't be complete")
 ; No other sites should show up
 D ASSERT("",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR shouldn't exist")
 D ASSERT("",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR shouldn't be complete")
 D ASSERT("",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD shouldn't exist")
 D ASSERT("",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD shouldn't be complete")
 I $D(DATA) K @DATA
 Q
GETMSITESCOMPLETENHX ;; @TEST Get multiple site complete Patient Sync Status - REAL - NO hdr-xform, NO vler-xform, NO jmeadows-pdf, NO jmeadows-ccda, NO jmeadows-xform, NO jmeadows-document
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3,20141031094920)
 D COMPLETEBASIC("SITE",3,20141031094920)
 D BASIC("SITE",3,20141031095020)
 D COMPLETEBASIC("SITE",3,20141031095020)
 D BASIC("HDR","1234V4321",20151031094920)
 D COMPLETEBASIC("HDR","1234V4321",20151031094920)
 D BASIC("VLER","1234V4321",20131031094920)
 D COMPLETEBASIC("VLER","1234V4321",20131031094920)
 D BASIC("DOD",12345678,20161031094920)
 D COMPLETEBASIC("DOD",12345678,20161031094920)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110500,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110405,"vista-SITE-data-allergy-poller")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110700,"vistahdr-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110800,"vistahdr-SITE-data-allergy-poller")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420110900,"hdr-sync-request")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420111000,"hdr-sync-allergy-request")
 D JOB("VLER;1234V4321",ROOTJOBID,"completed",20160420110400,"vler-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110430,"jmeadows-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110500,"jmeadows-sync-allergy-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("true",$G(OBJECT("syncCompleted")),"SyncCompleted should exist")
 D ASSERT("",$G(OBJECT("hasError")),"hasError should not exist")
 D ASSERT(20160420111000,$G(OBJECT("latestJobTimestamp")),"latestJobTimestamp should exist")
 D ASSERT(20161031094920,$G(OBJECT("latestSourceStampTime")),"latestSourceStampTime should exist")
 D ASSERT(20160420110400,$G(OBJECT("latestEnterpriseSyncRequestTimestamp")),"latestEnterpriseSyncRequestTimestamp should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should not exist")
 D ASSERT(20141031094920,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("HDR;1234V4321",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR should exist")
 D ASSERT("true",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR should be complete")
 D ASSERT("",$G(OBJECT("sites","HDR","hasError")),"Site-hasError HDR should not exist")
 D ASSERT(20151031094920,$G(OBJECT("sites","HDR","sourceStampTime")),"Site-sourceStampTime HDR should exist")
 D ASSERT(20160420111000,$G(OBJECT("sites","HDR","latestJobTimestamp")),"Site-latestJobTimestamp HDR should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should not exist")
 D ASSERT(20141031095020,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110800,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("VLER;1234V4321",$G(OBJECT("sites","VLER","pid")),"Site-pid VLER should exist")
 D ASSERT("true",$G(OBJECT("sites","VLER","syncCompleted")),"Site-Sync VLER should be complete")
 D ASSERT("",$G(OBJECT("sites","VLER","hasError")),"Site-hasError VLER should not exist")
 D ASSERT(20131031094920,$G(OBJECT("sites","VLER","sourceStampTime")),"Site-sourceStampTime VLER should exist")
 D ASSERT(20160420110400,$G(OBJECT("sites","VLER","latestJobTimestamp")),"Site-latestJobTimestamp VLER should exist")
 ;
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("true",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD should be complete")
 D ASSERT("",$G(OBJECT("sites","DOD","hasError")),"Site-hasError DOD should not exist")
 D ASSERT(20161031094920,$G(OBJECT("sites","DOD","sourceStampTime")),"Site-sourceStampTime DOD should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","DOD","latestJobTimestamp")),"Site-latestJobTimestamp DOD should exist")
 I $D(DATA) K @DATA
 Q
GETMSITESCOMPLETE1E ;; @TEST Get multiple site complete Patient Sync Status - REAL 1st job in error
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3,20141031094920)
 D COMPLETEBASIC("SITE",3,20141031094920)
 D BASIC("SITE",3,20141031095020)
 D COMPLETEBASIC("SITE",3,20141031095020)
 D BASIC("HDR","1234V4321",20151031094920)
 D COMPLETEBASIC("HDR","1234V4321",20151031094920)
 D BASIC("VLER","1234V4321",20131031094920)
 D COMPLETEBASIC("VLER","1234V4321",20131031094920)
 D BASIC("DOD",12345678,20161031094920)
 D COMPLETEBASIC("DOD",12345678,20161031094920)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"error",20160420110500,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110405,"vista-SITE-data-allergy-poller")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110700,"vistahdr-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110800,"vistahdr-SITE-data-allergy-poller")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420110900,"hdr-sync-request")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420111000,"hdr-sync-allergy-request")
 D JOB("VLER;1234V4321",ROOTJOBID,"completed",20160420110400,"vler-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110430,"jmeadows-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110500,"jmeadows-sync-allergy-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"SyncCompleted should exist")
 D ASSERT("true",$G(OBJECT("hasError")),"hasError should exist")
 D ASSERT(20160420111000,$G(OBJECT("latestJobTimestamp")),"latestJobTimestamp should exist")
 D ASSERT(20161031094920,$G(OBJECT("latestSourceStampTime")),"latestSourceStampTime should exist")
 D ASSERT(20160420110400,$G(OBJECT("latestEnterpriseSyncRequestTimestamp")),"latestEnterpriseSyncRequestTimestamp should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should not be complete")
 D ASSERT("true",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should exist")
 D ASSERT(20141031094920,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("HDR;1234V4321",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR should exist")
 D ASSERT("true",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR should be complete")
 D ASSERT("",$G(OBJECT("sites","HDR","hasError")),"Site-hasError HDR should not exist")
 D ASSERT(20151031094920,$G(OBJECT("sites","HDR","sourceStampTime")),"Site-sourceStampTime HDR should exist")
 D ASSERT(20160420111000,$G(OBJECT("sites","HDR","latestJobTimestamp")),"Site-latestJobTimestamp HDR should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should not exist")
 D ASSERT(20141031095020,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110800,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("VLER;1234V4321",$G(OBJECT("sites","VLER","pid")),"Site-pid VLER should exist")
 D ASSERT("true",$G(OBJECT("sites","VLER","syncCompleted")),"Site-Sync VLER should be complete")
 D ASSERT("",$G(OBJECT("sites","VLER","hasError")),"Site-hasError VLER should not exist")
 D ASSERT(20131031094920,$G(OBJECT("sites","VLER","sourceStampTime")),"Site-sourceStampTime VLER should exist")
 D ASSERT(20160420110400,$G(OBJECT("sites","VLER","latestJobTimestamp")),"Site-latestJobTimestamp VLER should exist")
 ;
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("true",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD should be complete")
 D ASSERT("",$G(OBJECT("sites","DOD","hasError")),"Site-hasError DOD should not exist")
 D ASSERT(20161031094920,$G(OBJECT("sites","DOD","sourceStampTime")),"Site-sourceStampTime DOD should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","DOD","latestJobTimestamp")),"Site-latestJobTimestamp DOD should exist")
 I $D(DATA) K @DATA
 Q
GETMSITESCOMPLETE2E ;; @TEST Get multiple site complete Patient Sync Status - REAL 2nd job in error
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3,20141031094920)
 D COMPLETEBASIC("SITE",3,20141031094920)
 D BASIC("SITE",3,20141031095020)
 D COMPLETEBASIC("SITE",3,20141031095020)
 D BASIC("HDR","1234V4321",20151031094920)
 D COMPLETEBASIC("HDR","1234V4321",20151031094920)
 D BASIC("VLER","1234V4321",20131031094920)
 D COMPLETEBASIC("VLER","1234V4321",20131031094920)
 D BASIC("DOD",12345678,20161031094920)
 D COMPLETEBASIC("DOD",12345678,20161031094920)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110500,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"error",20160420110405,"vista-SITE-data-allergy-poller")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110700,"vistahdr-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110800,"vistahdr-SITE-data-allergy-poller")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420110900,"hdr-sync-request")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420111000,"hdr-sync-allergy-request")
 D JOB("VLER;1234V4321",ROOTJOBID,"completed",20160420110400,"vler-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110430,"jmeadows-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110500,"jmeadows-sync-allergy-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"SyncCompleted should exist")
 D ASSERT("true",$G(OBJECT("hasError")),"hasError should exist")
 D ASSERT(20160420111000,$G(OBJECT("latestJobTimestamp")),"latestJobTimestamp should exist")
 D ASSERT(20161031094920,$G(OBJECT("latestSourceStampTime")),"latestSourceStampTime should exist")
 D ASSERT(20160420110400,$G(OBJECT("latestEnterpriseSyncRequestTimestamp")),"latestEnterpriseSyncRequestTimestamp should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should not be complete")
 D ASSERT("true",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should exist")
 D ASSERT(20141031094920,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("HDR;1234V4321",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR should exist")
 D ASSERT("true",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR should be complete")
 D ASSERT("",$G(OBJECT("sites","HDR","hasError")),"Site-hasError HDR should not exist")
 D ASSERT(20151031094920,$G(OBJECT("sites","HDR","sourceStampTime")),"Site-sourceStampTime HDR should exist")
 D ASSERT(20160420111000,$G(OBJECT("sites","HDR","latestJobTimestamp")),"Site-latestJobTimestamp HDR should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should not exist")
 D ASSERT(20141031095020,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110800,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("VLER;1234V4321",$G(OBJECT("sites","VLER","pid")),"Site-pid VLER should exist")
 D ASSERT("true",$G(OBJECT("sites","VLER","syncCompleted")),"Site-Sync VLER should be complete")
 D ASSERT("",$G(OBJECT("sites","VLER","hasError")),"Site-hasError VLER should not exist")
 D ASSERT(20131031094920,$G(OBJECT("sites","VLER","sourceStampTime")),"Site-sourceStampTime VLER should exist")
 D ASSERT(20160420110400,$G(OBJECT("sites","VLER","latestJobTimestamp")),"Site-latestJobTimestamp VLER should exist")
 ;
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("true",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD should be complete")
 D ASSERT("",$G(OBJECT("sites","DOD","hasError")),"Site-hasError DOD should not exist")
 D ASSERT(20161031094920,$G(OBJECT("sites","DOD","sourceStampTime")),"Site-sourceStampTime DOD should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","DOD","latestJobTimestamp")),"Site-latestJobTimestamp DOD should exist")
 I $D(DATA) K @DATA
 Q
GETMSITESCOMPLETE3E ;; @TEST Get multiple site complete Patient Sync Status - REAL 3rd job in error
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3,20141031094920)
 D COMPLETEBASIC("SITE",3,20141031094920)
 D BASIC("SITE",3,20141031095020)
 D COMPLETEBASIC("SITE",3,20141031095020)
 D BASIC("HDR","1234V4321",20151031094920)
 D COMPLETEBASIC("HDR","1234V4321",20151031094920)
 D BASIC("VLER","1234V4321",20131031094920)
 D COMPLETEBASIC("VLER","1234V4321",20131031094920)
 D BASIC("DOD",12345678,20161031094920)
 D COMPLETEBASIC("DOD",12345678,20161031094920)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110500,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110405,"vista-SITE-data-allergy-poller")
 D JOB("SITE;3",ROOTJOBID,"error",20160420110700,"vistahdr-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110800,"vistahdr-SITE-data-allergy-poller")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420110900,"hdr-sync-request")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420111000,"hdr-sync-allergy-request")
 D JOB("VLER;1234V4321",ROOTJOBID,"completed",20160420110400,"vler-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110430,"jmeadows-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110500,"jmeadows-sync-allergy-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"SyncCompleted should exist")
 D ASSERT("true",$G(OBJECT("hasError")),"hasError should exist")
 D ASSERT(20160420111000,$G(OBJECT("latestJobTimestamp")),"latestJobTimestamp should exist")
 D ASSERT(20161031094920,$G(OBJECT("latestSourceStampTime")),"latestSourceStampTime should exist")
 D ASSERT(20160420110400,$G(OBJECT("latestEnterpriseSyncRequestTimestamp")),"latestEnterpriseSyncRequestTimestamp should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should not exist")
 D ASSERT(20141031094920,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("HDR;1234V4321",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR should exist")
 D ASSERT("true",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR should be complete")
 D ASSERT("",$G(OBJECT("sites","HDR","hasError")),"Site-hasError HDR should not exist")
 D ASSERT(20151031094920,$G(OBJECT("sites","HDR","sourceStampTime")),"Site-sourceStampTime HDR should exist")
 D ASSERT(20160420111000,$G(OBJECT("sites","HDR","latestJobTimestamp")),"Site-latestJobTimestamp HDR should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should not be complete")
 D ASSERT("true",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should exist")
 D ASSERT(20141031095020,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110800,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("VLER;1234V4321",$G(OBJECT("sites","VLER","pid")),"Site-pid VLER should exist")
 D ASSERT("true",$G(OBJECT("sites","VLER","syncCompleted")),"Site-Sync VLER should be complete")
 D ASSERT("",$G(OBJECT("sites","VLER","hasError")),"Site-hasError VLER should not exist")
 D ASSERT(20131031094920,$G(OBJECT("sites","VLER","sourceStampTime")),"Site-sourceStampTime VLER should exist")
 D ASSERT(20160420110400,$G(OBJECT("sites","VLER","latestJobTimestamp")),"Site-latestJobTimestamp VLER should exist")
 ;
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("true",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD should be complete")
 D ASSERT("",$G(OBJECT("sites","DOD","hasError")),"Site-hasError DOD should not exist")
 D ASSERT(20161031094920,$G(OBJECT("sites","DOD","sourceStampTime")),"Site-sourceStampTime DOD should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","DOD","latestJobTimestamp")),"Site-latestJobTimestamp DOD should exist")
 I $D(DATA) K @DATA
 Q
GETMSITESCOMPLETE4E ;; @TEST Get multiple site complete Patient Sync Status - REAL 4th job in error
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3,20141031094920)
 D COMPLETEBASIC("SITE",3,20141031094920)
 D BASIC("SITE",3,20141031095020)
 D COMPLETEBASIC("SITE",3,20141031095020)
 D BASIC("HDR","1234V4321",20151031094920)
 D COMPLETEBASIC("HDR","1234V4321",20151031094920)
 D BASIC("VLER","1234V4321",20131031094920)
 D COMPLETEBASIC("VLER","1234V4321",20131031094920)
 D BASIC("DOD",12345678,20161031094920)
 D COMPLETEBASIC("DOD",12345678,20161031094920)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110500,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110405,"vista-SITE-data-allergy-poller")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110700,"vistahdr-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"error",20160420110800,"vistahdr-SITE-data-allergy-poller")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420110900,"hdr-sync-request")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420111000,"hdr-sync-allergy-request")
 D JOB("VLER;1234V4321",ROOTJOBID,"completed",20160420110400,"vler-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110430,"jmeadows-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110500,"jmeadows-sync-allergy-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"SyncCompleted should exist")
 D ASSERT("true",$G(OBJECT("hasError")),"hasError should exist")
 D ASSERT(20160420111000,$G(OBJECT("latestJobTimestamp")),"latestJobTimestamp should exist")
 D ASSERT(20161031094920,$G(OBJECT("latestSourceStampTime")),"latestSourceStampTime should exist")
 D ASSERT(20160420110400,$G(OBJECT("latestEnterpriseSyncRequestTimestamp")),"latestEnterpriseSyncRequestTimestamp should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should not exist")
 D ASSERT(20141031094920,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("HDR;1234V4321",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR should exist")
 D ASSERT("true",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR should be complete")
 D ASSERT("",$G(OBJECT("sites","HDR","hasError")),"Site-hasError HDR should not exist")
 D ASSERT(20151031094920,$G(OBJECT("sites","HDR","sourceStampTime")),"Site-sourceStampTime HDR should exist")
 D ASSERT(20160420111000,$G(OBJECT("sites","HDR","latestJobTimestamp")),"Site-latestJobTimestamp HDR should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should not be complete")
 D ASSERT("true",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should exist")
 D ASSERT(20141031095020,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110800,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("VLER;1234V4321",$G(OBJECT("sites","VLER","pid")),"Site-pid VLER should exist")
 D ASSERT("true",$G(OBJECT("sites","VLER","syncCompleted")),"Site-Sync VLER should be complete")
 D ASSERT("",$G(OBJECT("sites","VLER","hasError")),"Site-hasError VLER should not exist")
 D ASSERT(20131031094920,$G(OBJECT("sites","VLER","sourceStampTime")),"Site-sourceStampTime VLER should exist")
 D ASSERT(20160420110400,$G(OBJECT("sites","VLER","latestJobTimestamp")),"Site-latestJobTimestamp VLER should exist")
 ;
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("true",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD should be complete")
 D ASSERT("",$G(OBJECT("sites","DOD","hasError")),"Site-hasError DOD should not exist")
 D ASSERT(20161031094920,$G(OBJECT("sites","DOD","sourceStampTime")),"Site-sourceStampTime DOD should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","DOD","latestJobTimestamp")),"Site-latestJobTimestamp DOD should exist")
 I $D(DATA) K @DATA
 Q
GETMSITESCOMPLETE5E ;; @TEST Get multiple site complete Patient Sync Status - REAL 5th job in error
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3,20141031094920)
 D COMPLETEBASIC("SITE",3,20141031094920)
 D BASIC("SITE",3,20141031095020)
 D COMPLETEBASIC("SITE",3,20141031095020)
 D BASIC("HDR","1234V4321",20151031094920)
 D COMPLETEBASIC("HDR","1234V4321",20151031094920)
 D BASIC("VLER","1234V4321",20131031094920)
 D COMPLETEBASIC("VLER","1234V4321",20131031094920)
 D BASIC("DOD",12345678,20161031094920)
 D COMPLETEBASIC("DOD",12345678,20161031094920)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110500,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110405,"vista-SITE-data-allergy-poller")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110700,"vistahdr-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110800,"vistahdr-SITE-data-allergy-poller")
 D JOB("HDR;1234V4321",ROOTJOBID,"error",20160420110900,"hdr-sync-request")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420111000,"hdr-sync-allergy-request")
 D JOB("VLER;1234V4321",ROOTJOBID,"completed",20160420110400,"vler-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110430,"jmeadows-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110500,"jmeadows-sync-allergy-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"SyncCompleted should exist")
 D ASSERT("true",$G(OBJECT("hasError")),"hasError should exist")
 D ASSERT(20160420111000,$G(OBJECT("latestJobTimestamp")),"latestJobTimestamp should exist")
 D ASSERT(20161031094920,$G(OBJECT("latestSourceStampTime")),"latestSourceStampTime should exist")
 D ASSERT(20160420110400,$G(OBJECT("latestEnterpriseSyncRequestTimestamp")),"latestEnterpriseSyncRequestTimestamp should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should not exist")
 D ASSERT(20141031094920,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("HDR;1234V4321",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR should exist")
 D ASSERT("false",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR should not be complete")
 D ASSERT("true",$G(OBJECT("sites","HDR","hasError")),"Site-hasError HDR should exist")
 D ASSERT(20151031094920,$G(OBJECT("sites","HDR","sourceStampTime")),"Site-sourceStampTime HDR should exist")
 D ASSERT(20160420111000,$G(OBJECT("sites","HDR","latestJobTimestamp")),"Site-latestJobTimestamp HDR should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should not exist")
 D ASSERT(20141031095020,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110800,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("VLER;1234V4321",$G(OBJECT("sites","VLER","pid")),"Site-pid VLER should exist")
 D ASSERT("true",$G(OBJECT("sites","VLER","syncCompleted")),"Site-Sync VLER should be complete")
 D ASSERT("",$G(OBJECT("sites","VLER","hasError")),"Site-hasError VLER should not exist")
 D ASSERT(20131031094920,$G(OBJECT("sites","VLER","sourceStampTime")),"Site-sourceStampTime VLER should exist")
 D ASSERT(20160420110400,$G(OBJECT("sites","VLER","latestJobTimestamp")),"Site-latestJobTimestamp VLER should exist")
 ;
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("true",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD should be complete")
 D ASSERT("",$G(OBJECT("sites","DOD","hasError")),"Site-hasError DOD should not exist")
 D ASSERT(20161031094920,$G(OBJECT("sites","DOD","sourceStampTime")),"Site-sourceStampTime DOD should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","DOD","latestJobTimestamp")),"Site-latestJobTimestamp DOD should exist")
 I $D(DATA) K @DATA
 Q
GETMSITESCOMPLETE6E ;; @TEST Get multiple site complete Patient Sync Status - REAL 6th job in error
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3,20141031094920)
 D COMPLETEBASIC("SITE",3,20141031094920)
 D BASIC("SITE",3,20141031095020)
 D COMPLETEBASIC("SITE",3,20141031095020)
 D BASIC("HDR","1234V4321",20151031094920)
 D COMPLETEBASIC("HDR","1234V4321",20151031094920)
 D BASIC("VLER","1234V4321",20131031094920)
 D COMPLETEBASIC("VLER","1234V4321",20131031094920)
 D BASIC("DOD",12345678,20161031094920)
 D COMPLETEBASIC("DOD",12345678,20161031094920)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110500,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110405,"vista-SITE-data-allergy-poller")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110700,"vistahdr-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110800,"vistahdr-SITE-data-allergy-poller")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420110900,"hdr-sync-request")
 D JOB("HDR;1234V4321",ROOTJOBID,"error",20160420111000,"hdr-sync-allergy-request")
 D JOB("VLER;1234V4321",ROOTJOBID,"completed",20160420110400,"vler-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110430,"jmeadows-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110500,"jmeadows-sync-allergy-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"SyncCompleted should exist")
 D ASSERT("true",$G(OBJECT("hasError")),"hasError should exist")
 D ASSERT(20160420111000,$G(OBJECT("latestJobTimestamp")),"latestJobTimestamp should exist")
 D ASSERT(20161031094920,$G(OBJECT("latestSourceStampTime")),"latestSourceStampTime should exist")
 D ASSERT(20160420110400,$G(OBJECT("latestEnterpriseSyncRequestTimestamp")),"latestEnterpriseSyncRequestTimestamp should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should not exist")
 D ASSERT(20141031094920,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("HDR;1234V4321",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR should exist")
 D ASSERT("false",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR should not be complete")
 D ASSERT("true",$G(OBJECT("sites","HDR","hasError")),"Site-hasError HDR should exist")
 D ASSERT(20151031094920,$G(OBJECT("sites","HDR","sourceStampTime")),"Site-sourceStampTime HDR should exist")
 D ASSERT(20160420111000,$G(OBJECT("sites","HDR","latestJobTimestamp")),"Site-latestJobTimestamp HDR should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should not exist")
 D ASSERT(20141031095020,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110800,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("VLER;1234V4321",$G(OBJECT("sites","VLER","pid")),"Site-pid VLER should exist")
 D ASSERT("true",$G(OBJECT("sites","VLER","syncCompleted")),"Site-Sync VLER should be complete")
 D ASSERT("",$G(OBJECT("sites","VLER","hasError")),"Site-hasError VLER should not exist")
 D ASSERT(20131031094920,$G(OBJECT("sites","VLER","sourceStampTime")),"Site-sourceStampTime VLER should exist")
 D ASSERT(20160420110400,$G(OBJECT("sites","VLER","latestJobTimestamp")),"Site-latestJobTimestamp VLER should exist")
 ;
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("true",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD should be complete")
 D ASSERT("",$G(OBJECT("sites","DOD","hasError")),"Site-hasError DOD should not exist")
 D ASSERT(20161031094920,$G(OBJECT("sites","DOD","sourceStampTime")),"Site-sourceStampTime DOD should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","DOD","latestJobTimestamp")),"Site-latestJobTimestamp DOD should exist")
 I $D(DATA) K @DATA
 Q
GETMSITESCOMPLETE7E ;; @TEST Get multiple site complete Patient Sync Status - REAL 7th job in error
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3,20141031094920)
 D COMPLETEBASIC("SITE",3,20141031094920)
 D BASIC("SITE",3,20141031095020)
 D COMPLETEBASIC("SITE",3,20141031095020)
 D BASIC("HDR","1234V4321",20151031094920)
 D COMPLETEBASIC("HDR","1234V4321",20151031094920)
 D BASIC("VLER","1234V4321",20131031094920)
 D COMPLETEBASIC("VLER","1234V4321",20131031094920)
 D BASIC("DOD",12345678,20161031094920)
 D COMPLETEBASIC("DOD",12345678,20161031094920)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110500,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110405,"vista-SITE-data-allergy-poller")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110700,"vistahdr-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110800,"vistahdr-SITE-data-allergy-poller")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420110900,"hdr-sync-request")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420111000,"hdr-sync-allergy-request")
 D JOB("VLER;1234V4321",ROOTJOBID,"error",20160420110400,"vler-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110430,"jmeadows-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110500,"jmeadows-sync-allergy-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"SyncCompleted should exist")
 D ASSERT("true",$G(OBJECT("hasError")),"hasError should exist")
 D ASSERT(20160420111000,$G(OBJECT("latestJobTimestamp")),"latestJobTimestamp should exist")
 D ASSERT(20161031094920,$G(OBJECT("latestSourceStampTime")),"latestSourceStampTime should exist")
 D ASSERT(20160420110400,$G(OBJECT("latestEnterpriseSyncRequestTimestamp")),"latestEnterpriseSyncRequestTimestamp should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should not exist")
 D ASSERT(20141031094920,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("HDR;1234V4321",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR should exist")
 D ASSERT("true",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR should be complete")
 D ASSERT("",$G(OBJECT("sites","HDR","hasError")),"Site-hasError HDR should not exist")
 D ASSERT(20151031094920,$G(OBJECT("sites","HDR","sourceStampTime")),"Site-sourceStampTime HDR should exist")
 D ASSERT(20160420111000,$G(OBJECT("sites","HDR","latestJobTimestamp")),"Site-latestJobTimestamp HDR should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should not exist")
 D ASSERT(20141031095020,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110800,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("VLER;1234V4321",$G(OBJECT("sites","VLER","pid")),"Site-pid VLER should exist")
 D ASSERT("false",$G(OBJECT("sites","VLER","syncCompleted")),"Site-Sync VLER should not be complete")
 D ASSERT("true",$G(OBJECT("sites","VLER","hasError")),"Site-hasError VLER should exist")
 D ASSERT(20131031094920,$G(OBJECT("sites","VLER","sourceStampTime")),"Site-sourceStampTime VLER should exist")
 D ASSERT(20160420110400,$G(OBJECT("sites","VLER","latestJobTimestamp")),"Site-latestJobTimestamp VLER should exist")
 ;
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("true",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD should be complete")
 D ASSERT("",$G(OBJECT("sites","DOD","hasError")),"Site-hasError DOD should not exist")
 D ASSERT(20161031094920,$G(OBJECT("sites","DOD","sourceStampTime")),"Site-sourceStampTime DOD should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","DOD","latestJobTimestamp")),"Site-latestJobTimestamp DOD should exist")
 I $D(DATA) K @DATA
 Q
GETMSITESCOMPLETE8E ;; @TEST Get multiple site complete Patient Sync Status - REAL 8th job in error
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3,20141031094920)
 D COMPLETEBASIC("SITE",3,20141031094920)
 D BASIC("SITE",3,20141031095020)
 D COMPLETEBASIC("SITE",3,20141031095020)
 D BASIC("HDR","1234V4321",20151031094920)
 D COMPLETEBASIC("HDR","1234V4321",20151031094920)
 D BASIC("VLER","1234V4321",20131031094920)
 D COMPLETEBASIC("VLER","1234V4321",20131031094920)
 D BASIC("DOD",12345678,20161031094920)
 D COMPLETEBASIC("DOD",12345678,20161031094920)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110500,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110405,"vista-SITE-data-allergy-poller")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110700,"vistahdr-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110800,"vistahdr-SITE-data-allergy-poller")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420110900,"hdr-sync-request")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420111000,"hdr-sync-allergy-request")
 D JOB("VLER;1234V4321",ROOTJOBID,"completed",20160420110400,"vler-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"error",20160420110430,"jmeadows-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110500,"jmeadows-sync-allergy-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"SyncCompleted should exist")
 D ASSERT("true",$G(OBJECT("hasError")),"hasError should exist")
 D ASSERT(20160420111000,$G(OBJECT("latestJobTimestamp")),"latestJobTimestamp should exist")
 D ASSERT(20161031094920,$G(OBJECT("latestSourceStampTime")),"latestSourceStampTime should exist")
 D ASSERT(20160420110400,$G(OBJECT("latestEnterpriseSyncRequestTimestamp")),"latestEnterpriseSyncRequestTimestamp should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should not exist")
 D ASSERT(20141031094920,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("HDR;1234V4321",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR should exist")
 D ASSERT("true",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR should  be complete")
 D ASSERT("",$G(OBJECT("sites","HDR","hasError")),"Site-hasError HDR should not exist")
 D ASSERT(20151031094920,$G(OBJECT("sites","HDR","sourceStampTime")),"Site-sourceStampTime HDR should exist")
 D ASSERT(20160420111000,$G(OBJECT("sites","HDR","latestJobTimestamp")),"Site-latestJobTimestamp HDR should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should not exist")
 D ASSERT(20141031095020,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110800,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("VLER;1234V4321",$G(OBJECT("sites","VLER","pid")),"Site-pid VLER should exist")
 D ASSERT("true",$G(OBJECT("sites","VLER","syncCompleted")),"Site-Sync VLER should be complete")
 D ASSERT("",$G(OBJECT("sites","VLER","hasError")),"Site-hasError VLER should not exist")
 D ASSERT(20131031094920,$G(OBJECT("sites","VLER","sourceStampTime")),"Site-sourceStampTime VLER should exist")
 D ASSERT(20160420110400,$G(OBJECT("sites","VLER","latestJobTimestamp")),"Site-latestJobTimestamp VLER should exist")
 ;
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("false",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD should not be complete")
 D ASSERT("true",$G(OBJECT("sites","DOD","hasError")),"Site-hasError DOD should exist")
 D ASSERT(20161031094920,$G(OBJECT("sites","DOD","sourceStampTime")),"Site-sourceStampTime DOD should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","DOD","latestJobTimestamp")),"Site-latestJobTimestamp DOD should exist")
 I $D(DATA) K @DATA
 Q
GETMSITESCOMPLETE9E ;; @TEST Get multiple site complete Patient Sync Status - REAL 9th job in error
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 D BASIC("SITE",3,20141031094920)
 D COMPLETEBASIC("SITE",3,20141031094920)
 D BASIC("SITE",3,20141031095020)
 D COMPLETEBASIC("SITE",3,20141031095020)
 D BASIC("HDR","1234V4321",20151031094920)
 D COMPLETEBASIC("HDR","1234V4321",20151031094920)
 D BASIC("VLER","1234V4321",20131031094920)
 D COMPLETEBASIC("VLER","1234V4321",20131031094920)
 D BASIC("DOD",12345678,20161031094920)
 D COMPLETEBASIC("DOD",12345678,20161031094920)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110500,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110405,"vista-SITE-data-allergy-poller")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110700,"vistahdr-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110800,"vistahdr-SITE-data-allergy-poller")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420110900,"hdr-sync-request")
 D JOB("HDR;1234V4321",ROOTJOBID,"completed",20160420111000,"hdr-sync-allergy-request")
 D JOB("VLER;1234V4321",ROOTJOBID,"completed",20160420110400,"vler-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"completed",20160420110430,"jmeadows-sync-request")
 D JOB("DOD;12345678",ROOTJOBID,"error",20160420110500,"jmeadows-sync-allergy-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"SyncCompleted should exist")
 D ASSERT("true",$G(OBJECT("hasError")),"hasError should exist")
 D ASSERT(20160420111000,$G(OBJECT("latestJobTimestamp")),"latestJobTimestamp should exist")
 D ASSERT(20161031094920,$G(OBJECT("latestSourceStampTime")),"latestSourceStampTime should exist")
 D ASSERT(20160420110400,$G(OBJECT("latestEnterpriseSyncRequestTimestamp")),"latestEnterpriseSyncRequestTimestamp should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should be complete")
 D ASSERT("",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should not exist")
 D ASSERT(20141031094920,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("HDR;1234V4321",$G(OBJECT("sites","HDR","pid")),"Site-pid HDR should exist")
 D ASSERT("true",$G(OBJECT("sites","HDR","syncCompleted")),"Site-Sync HDR should not be complete")
 D ASSERT("",$G(OBJECT("sites","HDR","hasError")),"Site-hasError HDR should exist")
 D ASSERT(20151031094920,$G(OBJECT("sites","HDR","sourceStampTime")),"Site-sourceStampTime HDR should exist")
 D ASSERT(20160420111000,$G(OBJECT("sites","HDR","latestJobTimestamp")),"Site-latestJobTimestamp HDR should exist")
 ;
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-Sync SITE should not be complete")
 D ASSERT("",$G(OBJECT("sites","SITE","hasError")),"Site-hasError SITE should exist")
 D ASSERT(20141031095020,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime SITE should exist")
 D ASSERT(20160420110800,$G(OBJECT("sites","SITE","latestJobTimestamp")),"Site-latestJobTimestamp SITE should exist")
 ;
 D ASSERT("VLER;1234V4321",$G(OBJECT("sites","VLER","pid")),"Site-pid VLER should exist")
 D ASSERT("true",$G(OBJECT("sites","VLER","syncCompleted")),"Site-Sync VLER should be complete")
 D ASSERT("",$G(OBJECT("sites","VLER","hasError")),"Site-hasError VLER should not exist")
 D ASSERT(20131031094920,$G(OBJECT("sites","VLER","sourceStampTime")),"Site-sourceStampTime VLER should exist")
 D ASSERT(20160420110400,$G(OBJECT("sites","VLER","latestJobTimestamp")),"Site-latestJobTimestamp VLER should exist")
 ;
 D ASSERT("DOD;12345678",$G(OBJECT("sites","DOD","pid")),"Site-pid DOD should exist")
 D ASSERT("false",$G(OBJECT("sites","DOD","syncCompleted")),"Site-Sync DOD should not be complete")
 D ASSERT("true",$G(OBJECT("sites","DOD","hasError")),"Site-hasError DOD should exist")
 D ASSERT(20161031094920,$G(OBJECT("sites","DOD","sourceStampTime")),"Site-sourceStampTime DOD should exist")
 D ASSERT(20160420110500,$G(OBJECT("sites","DOD","latestJobTimestamp")),"Site-latestJobTimestamp DOD should exist")
 I $D(DATA) K @DATA
 Q
GETMSITESCOMPLETENUM ;; @TEST Get multiple site complete Patient Sync Status - Fully Numeric site hash
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 K ^VPRPTJ("JPID")
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","6242;3")=""
 S ^VPRPTJ("JPID","6242;3")="52833885-af7c-4899-90be-b3a6630b2369"
 D BASIC("6242",3)
 D COMPLETEBASIC("6242",3)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("6242;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("6242;3",ROOTJOBID,"completed",20160420110400,"vista-6242-subscribe-request")
 D JOB("6242;3",ROOTJOBID,"completed",20160420110400,"vista-6242-data-allergy-poller")
 ;
 S ARG("icnpidjpid")="6242;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("true",$G(OBJECT("syncCompleted")),"SyncCompleted should exist")
 D ASSERT("6242;3",$G(OBJECT("sites","""6242","pid")),"Site-pid 6242 should exist")
 D ASSERT("true",$G(OBJECT("sites","""6242","syncCompleted")),"Site-Sync 6242 should be complete")
 I $D(DATA) K @DATA
 K ^VPRPTJ("JPID")
 D PATIDS
 Q
 ;
 ; SOLR stored tests
 ;
GETSOLRBEFORE ;; @TEST Get Patient Simple Sync Status before metastamp stored with SOLR status
 N DATA,ARG,ERR,OBJECT,HTTPERR
 S ARG("icnpidjpid")="SITE;3"
 ; save off SOLR configuration
 N SOLR
 S SOLR=$G(^VPRCONFIG("sync","status","solr"))
 ; Enable SOLR Sync Status reporting
 S ^VPRCONFIG("sync","status","solr")=1
 ;
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("false",$G(OBJECT("solrSyncCompleted")),"SOLR Sync shouldn't be complete")
 ;
 ; Try again with an event stored, but no meta-stamp is stored
 S ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","SITE;3","SITE","vitals","urn:va:vitals:SITE:3:1002",20141031094920,"solrStored")=1
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ; Ensure that the JSON matches what we expect
 ; this Sync Status should always be in progress
 D ASSERT("1234V4321",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Sync shouldn't be complete")
 D ASSERT("false",$G(OBJECT("solrSyncCompleted")),"SOLR Sync shouldn't be complete")
 I $D(DATA) K @DATA
 S:(SOLR'="") ^VPRCONFIG("sync","status","solr")=SOLR
 Q
 ;
GETSOLRMSITESCOMPLETENUM ;; @TEST Get multiple site complete Simple Patient Sync Status - Fully Numeric site hash with SOLR status
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 ; save off SOLR configuration
 N SOLR
 S SOLR=$G(^VPRCONFIG("sync","status","solr"))
 ; Enable SOLR Sync Status reporting
 S ^VPRCONFIG("sync","status","solr")=1
 K ^VPRPTJ("JPID")
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","6242;3")=""
 S ^VPRPTJ("JPID","6242;3")="52833885-af7c-4899-90be-b3a6630b2369"
 D BASIC("6242",3)
 D COMPLETEBASIC("6242",3)
 D COMPLETEBASICSOLR("6242",3)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("6242;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("6242;3",ROOTJOBID,"completed",20160420110400,"vista-6242-subscribe-request")
 D JOB("6242;3",ROOTJOBID,"completed",20160420110400,"vista-6242-data-allergy-poller")
 ;
 S ARG("icnpidjpid")="6242;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("",$G(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("true",$G(OBJECT("syncCompleted")),"SyncCompleted should exist")
 D ASSERT("6242;3",$G(OBJECT("sites","""6242","pid")),"Site-pid 6242 should exist")
 D ASSERT("true",$G(OBJECT("sites","""6242","syncCompleted")),"Site-Sync 6242 should be complete")
 D ASSERT("true",$G(OBJECT("sites","""6242","solrSyncCompleted")),"Site-SOLR Sync 6242 should be complete")
 I $D(DATA) K @DATA
 K ^VPRPTJ("JPID")
 D PATIDS
 S:(SOLR'="") ^VPRCONFIG("sync","status","solr")=SOLR
 Q
 ;
GETSOLREXCEPTIONS ;; @TEST Get Patient Simple Sync Status with SOLR domain exceptions
 N DATA,ARG,ERR,OBJECT,HTTPERR
 S ARG("icnpidjpid")="SITE;3"
 ; save off SOLR configuration
 N SOLR,DOMAINEXCEPTIONS
 S SOLR=$G(^VPRCONFIG("sync","status","solr"))
 M DOMAINEXCEPTIONS=^VPRCONFIG("sync","status","solr","domainExceptions")
 K ^VPRCONFIG("sync","status","solr","domainExceptions")
 ; Enable SOLR Sync Status reporting
 S ^VPRCONFIG("sync","status","solr")=1
 ; Reset data
 K ^VPRPTJ("JPID")
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","SITE;3")=""
 S ^VPRPTJ("JPID","SITE;3")="52833885-af7c-4899-90be-b3a6630b2369"
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D COMPLETEBASICSOLR("SITE",3)
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"vista-SITE-data-allergy-poller")
 ; Unset a SOLR stored item
 K ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","SITE;3","SITE","vitals","urn:va:vitals:SITE:3:1001",20141031094920,"solrStored")
 ;
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) K OBJECT D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT(11,$D(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","solrSyncCompleted")),"SOLR site sync shouldn't be complete")
 D ASSERT("true",$G(OBJECT("syncCompleted")),"Sync should be complete")
 D ASSERT("false",$G(OBJECT("solrSyncCompleted")),"SOLR Sync shouldn't be complete")
 ;
 ; Try again with the vitals domain added to the exceptions list
 S ^VPRCONFIG("sync","status","solr","domainExceptions","vitals")=""
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) K OBJECT D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ; Ensure that the JSON matches what we expect
 D ASSERT(11,$D(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","solrSyncCompleted")),"SOLR site sync should be complete")
 D ASSERT("true",$G(OBJECT("syncCompleted")),"Sync should be complete")
 D ASSERT("true",$G(OBJECT("solrSyncCompleted")),"SOLR Sync should be complete")
 ;
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","SITE;3")=""
 S ^VPRPTJ("JPID","SITE;3")="52833885-af7c-4899-90be-b3a6630b2369"
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D COMPLETEBASICSOLR("SITE",3)
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"vista-SITE-data-allergy-poller")
 ;
 ; Unset a different SOLR stored item
 K ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","SITE;3","SITE","allergy","urn:va:allergy:SITE:3:1001",20141031094920,"solrStored")
 ;
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) K OBJECT D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT(11,$D(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","solrSyncCompleted")),"SOLR site sync shouldn't be complete")
 D ASSERT("true",$G(OBJECT("syncCompleted")),"Sync should be complete")
 D ASSERT("false",$G(OBJECT("solrSyncCompleted")),"SOLR Sync shouldn't be complete")
 ;
 ; Try again with the allergy domain added to the exceptions list
 S ^VPRCONFIG("sync","status","solr","domainExceptions","allergy")=""
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) K OBJECT D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ; Ensure that the JSON matches what we expect
 D ASSERT(11,$D(OBJECT("icn")),"icn attribute should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","solrSyncCompleted")),"SOLR site sync should be complete")
 D ASSERT("true",$G(OBJECT("syncCompleted")),"Sync should be complete")
 D ASSERT("true",$G(OBJECT("solrSyncCompleted")),"SOLR Sync should be complete")
 ;
 I $D(DATA) K @DATA
 K ^VPRPTJ("JPID")
 D PATIDS
 ; Reset SOLR configuration
 S:(SOLR'="") ^VPRCONFIG("sync","status","solr")=SOLR
 K ^VPRCONFIG("sync","status","solr","domainExceptions")
 M ^VPRCONFIG("sync","status","solr","domainExceptions")=DOMAINEXCEPTIONS
 Q
STORERECORDUNKJPID ;; @TEST Manual Store flag ERROR if UNKNOWN JPID
 N BODY,RETURN,DATA,ARG,ERR,OBJECT,HTTPERR
 S ARG("pid")="1234;6"
 S BODY("uid")="urn:va:vitals:1234:6:1234"
 S BODY("eventStamp")=20141031094920
 D ENCODE^VPRJSON("BODY","DATA","ERR")
 K BODY,ERR
 S RETURN=$$STORERECORD^VPRJPSTATUS(.ARG,.DATA)
 D ASSERT(404,$G(HTTPERR),"An HTTP 404 should have occured")
 D ASSERT(404,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 404 should have occured")
 D ASSERT(224,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 224 reason code should have occured")
 D ASSERT("",$G(^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","1234;6","1234","vitals","urn:va:vitals:1234:6:1234",20141031094920,"stored")),"JDS Stored flag doesn't exist")
 D ASSERT("",$G(RETURN),"Returned a 201 instead of no data")
 Q
STORERECORDUIDPID ;; @TEST Manual Store flag Mismatch between PID and UID
 N BODY,RETURN,DATA,ARG,ERR,OBJECT,HTTPERR
 S ARG("pid")="SITE;3"
 S BODY("uid")="urn:va:vitals:1234:6:1234"
 S BODY("eventStamp")=20141031094920
 D ENCODE^VPRJSON("BODY","DATA","ERR")
 K BODY,ERR
 S RETURN=$$STORERECORD^VPRJPSTATUS(.ARG,.DATA)
 D ASSERT("1",$G(^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","SITE;3","SITE","vitals","urn:va:vitals:1234:6:1234",20141031094920,"stored")),"JDS Stored flag doesn't exist")
 D ASSERT("/vpr/SITE;3/urn:va:vitals:1234:6:1234",$G(RETURN),"Returned no data instead of a 201")
 Q
STORERECORDND ;; @TEST Manual Store flag ERROR if UID invalid - no domain
 N BODY,RETURN,DATA,ARG,ERR,OBJECT,HTTPERR
 S ARG("pid")="SITE;3"
 S BODY("uid")="urn:va::SITE:3"
 S BODY("eventStamp")=20141031094920
 D ENCODE^VPRJSON("BODY","DATA","ERR")
 K BODY,ERR
 S RETURN=$$STORERECORD^VPRJPSTATUS(.ARG,.DATA)
 D ASSERT(400,$G(HTTPERR),"An HTTP 400 should have occured")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 should have occured")
 D ASSERT(210,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 210 reason code should have occured")
 D ASSERT("",$G(^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","SITE;3","SITE","vitals","urn:va:vitals:SITE:3:1002",20141031094920,"stored")),"JDS Stored flag doesn't exist")
 D ASSERT("",$G(RETURN),"Returned a 201 instead of no data")
 Q
STORERECORDNI ;; @TEST Manual Store flag ERROR if UID invalid - no ien
 N BODY,RETURN,DATA,ARG,ERR,OBJECT,HTTPERR
 S ARG("pid")="SITE;3"
 S BODY("uid")="urn:va:vital:SITE:3"
 S BODY("eventStamp")=20141031094920
 D ENCODE^VPRJSON("BODY","DATA","ERR")
 K BODY,ERR
 S RETURN=$$STORERECORD^VPRJPSTATUS(.ARG,.DATA)
 D ASSERT(400,$G(HTTPERR),"An HTTP 400 should have occured")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 should have occured")
 D ASSERT(210,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 210 reason code should have occured")
 D ASSERT("",$G(^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","SITE;3","SITE","vitals","urn:va:vitals:SITE:3:1002",20141031094920,"stored")),"JDS Stored flag doesn't exist")
 D ASSERT("",$G(RETURN),"Returned a 201 instead of no data")
 Q
STORERECORDUES ;; @TEST Manual Store flag ERROR if no eventStamp
 N BODY,RETURN,DATA,ARG,ERR,OBJECT,HTTPERR
 S ARG("pid")="SITE;3"
 S BODY("uid")="urn:va:vitals:SITE:3:1002"
 D ENCODE^VPRJSON("BODY","DATA","ERR")
 K BODY,ERR
 S RETURN=$$STORERECORD^VPRJPSTATUS(.ARG,.DATA)
 D ASSERT(400,$G(HTTPERR),"An HTTP 400 should have occured")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 should have occured")
 D ASSERT(210,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 210 reason code should have occured")
 D ASSERT("",$G(^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","SITE;3","SITE","vitals","urn:va:vitals:SITE:3:1002",20141031094920,"stored")),"JDS Stored flag doesn't exist")
 D ASSERT("",$G(RETURN),"Returned a 201 instead of no data")
 Q
STORERECORDNES ;; @TEST Manual Store flag ERROR if eventStamp=""
 N BODY,RETURN,DATA,ARG,ERR,OBJECT,HTTPERR
 S ARG("pid")="SITE;3"
 S BODY("uid")="urn:va:vitals:SITE:3:1002"
 S BODY("eventStamp")=""
 D ENCODE^VPRJSON("BODY","DATA","ERR")
 K BODY,ERR
 S RETURN=$$STORERECORD^VPRJPSTATUS(.ARG,.DATA)
 D ASSERT(400,$G(HTTPERR),"An HTTP 400 should have occured")
 D ASSERT(400,$G(^||TMP("HTTPERR",$J,1,"error","code")),"An HTTP 400 should have occured")
 D ASSERT(210,$G(^||TMP("HTTPERR",$J,1,"error","errors",1,"reason")),"An 210 reason code should have occured")
 D ASSERT("",$G(^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","SITE;3","SITE","vitals","urn:va:vitals:SITE:3:1002",20141031094920,"stored")),"JDS Stored flag doesn't exist")
 D ASSERT("",$G(RETURN),"Returned a 201 instead of no data")
 Q
STORERECORDJDS ;; @TEST Manual Store flag is set for JDS
 N BODY,RETURN,DATA,ARG,ERR,OBJECT,HTTPERR
 S ARG("pid")="SITE;3"
 S BODY("uid")="urn:va:vitals:SITE:3:1002"
 S BODY("eventStamp")=20141031094920
 D ENCODE^VPRJSON("BODY","DATA","ERR")
 K BODY,ERR
 S RETURN=$$STORERECORD^VPRJPSTATUS(.ARG,.DATA)
 D ASSERT(1,$G(^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","SITE;3","SITE","vitals","urn:va:vitals:SITE:3:1002",20141031094920,"stored")),"JDS Stored flag doesn't exist")
 D ASSERT("/vpr/SITE;3/urn:va:vitals:SITE:3:1002",$G(RETURN),"Return not a 201/no data returned")
 Q
STORERECORDJDST ;; @TEST Manual Store flag is set for JDS with type field
 N BODY,RETURN,DATA,ARG,ERR,OBJECT,HTTPERR
 S ARG("pid")="SITE;3"
 S BODY("uid")="urn:va:vitals:SITE:3:1002"
 S BODY("eventStamp")=20141031094920
 S BODY("type")="jds"
 D ENCODE^VPRJSON("BODY","DATA","ERR")
 K BODY,ERR
 S RETURN=$$STORERECORD^VPRJPSTATUS(.ARG,.DATA)
 D ASSERT(1,$G(^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","SITE;3","SITE","vitals","urn:va:vitals:SITE:3:1002",20141031094920,"stored")),"JDS Stored flag doesn't exist")
 D ASSERT("/vpr/SITE;3/urn:va:vitals:SITE:3:1002",$G(RETURN),"Return not a 201/no data returned")
 Q
STORERECORDSOLR ;; @TEST Manual Store flag is set for SOLR
 N BODY,RETURN,DATA,ARG,ERR,OBJECT,HTTPERR
 S ARG("pid")="SITE;3"
 S BODY("uid")="urn:va:vitals:SITE:3:1002"
 S BODY("eventStamp")=20141031094920
 S BODY("type")="solr"
 D ENCODE^VPRJSON("BODY","DATA","ERR")
 K BODY,ERR
 S RETURN=$$STORERECORD^VPRJPSTATUS(.ARG,.DATA)
 D ASSERT(1,$G(^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","SITE;3","SITE","vitals","urn:va:vitals:SITE:3:1002",20141031094920,"solrStored")),"SOLR Stored flag doesn't exist")
 D ASSERT("/vpr/SITE;3/urn:va:vitals:SITE:3:1002",$G(RETURN),"Return not a 201/no data returned")
 Q
STORERECORDSOLRERR ;; @TEST Manual Store flag is set for solrError
 N BODY,RETURN,DATA,ARG,ERR,HTTPERR
 S ARG("pid")="SITE;3"
 S BODY("uid")="urn:va:vitals:SITE:3:1002"
 S BODY("eventStamp")=20141031094920
 S BODY("type")="solrError"
 D ENCODE^VPRJSON("BODY","DATA","ERR")
 K BODY,ERR
 S RETURN=$$STORERECORD^VPRJPSTATUS(.ARG,.DATA)
 D ASSERT(1,$G(^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","SITE;3","SITE","vitals","urn:va:vitals:SITE:3:1002",20141031094920,"solrError")),"SOLR Error flag doesn't exist")
 D ASSERT("/vpr/SITE;3/urn:va:vitals:SITE:3:1002",$G(RETURN),"Return not a 201/no data returned")
 Q
STORERECORDSYNCERR ;; @TEST Manual Store flag is set for syncError
 N BODY,RETURN,DATA,ARG,ERR,HTTPERR
 S ARG("pid")="SITE;3"
 S BODY("uid")="urn:va:vitals:SITE:3:1002"
 S BODY("eventStamp")=20141031094920
 S BODY("type")="syncError"
 D ENCODE^VPRJSON("BODY","DATA","ERR")
 K BODY,ERR
 S RETURN=$$STORERECORD^VPRJPSTATUS(.ARG,.DATA)
 D ASSERT(1,$G(^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","SITE;3","SITE","vitals","urn:va:vitals:SITE:3:1002",20141031094920,"syncError")),"Sync Error flag doesn't exist")
 D ASSERT("/vpr/SITE;3/urn:va:vitals:SITE:3:1002",$G(RETURN),"Return not a 201/no data returned")
 Q
 ;
 ; SOLR and Sync error flag tests for Simple Sync Status
 ;
GETSYNCERRORPARTSYNC ;; @TEST Get Patient Simple Sync Status with a Sync error after a partial sync
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 ;
 ; Set up test data
 K ^VPRPTJ("JPID")
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","SITE;3")=""
 S ^VPRPTJ("JPID","SITE;3")="52833885-af7c-4899-90be-b3a6630b2369"
 ;
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D COMPLETEBASICSOLR("SITE",3)
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-SYNC SITE should not be complete")
 D ASSERT("true",$G(OBJECT("sites","SITE","solrSyncCompleted")),"Site-SOLR Sync SITE should be complete")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Patient SITE;3 should not be sync complete")
 D ASSERT("true",$G(OBJECT("solrSyncCompleted")),"Patient SITE;3 should be SOLR sync complete")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasError")),"Site-SYNC SITE should not have Sync error")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasSolrError")),"Site-SOLR Sync SITE should not have SOLR error")
 D ASSERT(0,$D(OBJECT("hasError")),"Patient SITE;3 should not have Sync error")
 D ASSERT(0,$D(OBJECT("hasSolrError")),"Patient SITE;3 should not have SOLR error")
 ;
 I $D(DATA) K @DATA
 ; Set Sync error flags
 D COMPLETEBASICSYNCERR("SITE",3)
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-SYNC SITE should not be complete")
 D ASSERT("true",$G(OBJECT("sites","SITE","solrSyncCompleted")),"Site-SOLR Sync SITE should be complete")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Patient SITE;3 should not be sync complete")
 D ASSERT("true",$G(OBJECT("solrSyncCompleted")),"Patient SITE;3 should be SOLR sync complete")
 D ASSERT(1,$D(OBJECT("sites","SITE","hasError")),"Site-SYNC SITE should have Sync error")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasSolrError")),"Site-SOLR Sync SITE should not have SOLR error")
 D ASSERT(1,$D(OBJECT("hasError")),"Patient SITE;3 should have Sync error")
 D ASSERT(0,$D(OBJECT("hasSolrError")),"Patient SITE;3 should not have SOLR error")
 Q
 ;
GETSOLRERRORPARTSYNC ;; @TEST Get Patient Simple Sync Status with a SOLR error after a partial sync
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 ;
 ; Set up test data
 K ^VPRPTJ("JPID")
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","SITE;3")=""
 S ^VPRPTJ("JPID","SITE;3")="52833885-af7c-4899-90be-b3a6630b2369"
 ;
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D COMPLETEBASICSOLR("SITE",3)
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-SYNC SITE should not be complete")
 D ASSERT("true",$G(OBJECT("sites","SITE","solrSyncCompleted")),"Site-SOLR Sync SITE should be complete")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Patient SITE;3 should not be sync complete")
 D ASSERT("true",$G(OBJECT("solrSyncCompleted")),"Patient SITE;3 should be SOLR sync complete")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasError")),"Site-SYNC SITE should not have Sync error")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasSolrError")),"Site-SOLR Sync SITE should not have SOLR error")
 D ASSERT(0,$D(OBJECT("hasError")),"Patient SITE;3 should not have Sync error")
 D ASSERT(0,$D(OBJECT("hasSolrError")),"Patient SITE;3 should not have SOLR error")
 ;
 I $D(DATA) K @DATA
 ; Set SOLR error flags
 D COMPLETEBASICSOLRERR("SITE",3)
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-SYNC SITE should not be complete")
 D ASSERT("false",$G(OBJECT("sites","SITE","solrSyncCompleted")),"Site-SOLR Sync SITE should not be complete")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Patient SITE;3 should not be sync complete")
 D ASSERT("false",$G(OBJECT("solrSyncCompleted")),"Patient SITE;3 should not be SOLR sync complete")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasError")),"Site-SYNC SITE should not have Sync error")
 D ASSERT(1,$D(OBJECT("sites","SITE","hasSolrError")),"Site-SOLR Sync SITE should have SOLR error")
 D ASSERT(0,$D(OBJECT("hasError")),"Patient SITE;3 should not have Sync error")
 D ASSERT(1,$D(OBJECT("hasSolrError")),"Patient SITE;3 should have SOLR error")
 Q
 ;
GETSYNCSOLRERRORPARTSYNC ;; @TEST Get Patient Simple Sync Status with a Sync and a SOLR error after a partial sync
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 ;
 ; Set up test data
 K ^VPRPTJ("JPID")
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","SITE;3")=""
 S ^VPRPTJ("JPID","SITE;3")="52833885-af7c-4899-90be-b3a6630b2369"
 ;
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D COMPLETEBASICSOLR("SITE",3)
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-SYNC SITE should not be complete")
 D ASSERT("true",$G(OBJECT("sites","SITE","solrSyncCompleted")),"Site-SOLR Sync SITE should be complete")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Patient SITE;3 should not be sync complete")
 D ASSERT("true",$G(OBJECT("solrSyncCompleted")),"Patient SITE;3 should be SOLR sync complete")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasError")),"Site-SYNC SITE should not have Sync error")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasSolrError")),"Site-SOLR Sync SITE should not have SOLR error")
 D ASSERT(0,$D(OBJECT("hasError")),"Patient SITE;3 should not have Sync error")
 D ASSERT(0,$D(OBJECT("hasSolrError")),"Patient SITE;3 should not have SOLR error")
 ;
 I $D(DATA) K @DATA
 ; Set Sync and SOLR error flags
 D COMPLETEBASICSYNCERR("SITE",3)
 D COMPLETEBASICSOLRERR("SITE",3)
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-SYNC SITE should not be complete")
 D ASSERT("false",$G(OBJECT("sites","SITE","solrSyncCompleted")),"Site-SOLR Sync SITE should not be complete")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Patient SITE;3 should not be sync complete")
 D ASSERT("false",$G(OBJECT("solrSyncCompleted")),"Patient SITE;3 should not be SOLR sync complete")
 D ASSERT(1,$D(OBJECT("sites","SITE","hasError")),"Site-SYNC SITE should have Sync error")
 D ASSERT(1,$D(OBJECT("sites","SITE","hasSolrError")),"Site-SOLR Sync SITE should have SOLR error")
 D ASSERT(1,$D(OBJECT("hasError")),"Patient SITE;3 should have Sync error")
 D ASSERT(1,$D(OBJECT("hasSolrError")),"Patient SITE;3 should have SOLR error")
 Q
 ;
GETSYNCERRORFULLSYNC ;; @TEST Get Patient Simple Sync Status with a Sync error after a full sync
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 ;
 ; Set up test data
 K ^VPRPTJ("JPID")
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","SITE;3")=""
 S ^VPRPTJ("JPID","SITE;3")="52833885-af7c-4899-90be-b3a6630b2369"
 ;
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D COMPLETEBASICSOLR("SITE",3)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"vista-SITE-data-allergy-poller")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-SYNC SITE should be complete")
 D ASSERT("true",$G(OBJECT("sites","SITE","solrSyncCompleted")),"Site-SOLR Sync SITE should be complete")
 D ASSERT("true",$G(OBJECT("syncCompleted")),"Patient SITE;3 should be sync complete")
 D ASSERT("true",$G(OBJECT("solrSyncCompleted")),"Patient SITE;3 should be SOLR sync complete")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasError")),"Site-SYNC SITE should not have Sync error")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasSolrError")),"Site-SOLR Sync SITE should not have SOLR error")
 D ASSERT(0,$D(OBJECT("hasError")),"Patient SITE;3 should not have Sync error")
 D ASSERT(0,$D(OBJECT("hasSolrError")),"Patient SITE;3 should not have SOLR error")
 ;
 I $D(DATA) K @DATA
 ; Set Sync error flags
 D COMPLETEBASICSYNCERR("SITE",3)
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-SYNC SITE should not be complete")
 D ASSERT("true",$G(OBJECT("sites","SITE","solrSyncCompleted")),"Site-SOLR Sync SITE should be complete")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Patient SITE;3 should not be sync complete")
 D ASSERT("true",$G(OBJECT("solrSyncCompleted")),"Patient SITE;3 should be SOLR sync complete")
 D ASSERT(1,$D(OBJECT("sites","SITE","hasError")),"Site-SYNC SITE should have Sync error")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasSolrError")),"Site-SOLR Sync SITE should not have SOLR error")
 D ASSERT(1,$D(OBJECT("hasError")),"Patient SITE;3 should have Sync error")
 D ASSERT(0,$D(OBJECT("hasSolrError")),"Patient SITE;3 should not have SOLR error")
 Q
 ;
GETSOLRERRORFULLSYNC ;; @TEST Get Patient Simple Sync Status with a SOLR error after a full sync
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 ;
 ; Set up test data
 K ^VPRPTJ("JPID")
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","SITE;3")=""
 S ^VPRPTJ("JPID","SITE;3")="52833885-af7c-4899-90be-b3a6630b2369"
 ;
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D COMPLETEBASICSOLR("SITE",3)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"vista-SITE-data-allergy-poller")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-SYNC SITE should be complete")
 D ASSERT("true",$G(OBJECT("sites","SITE","solrSyncCompleted")),"Site-SOLR Sync SITE should be complete")
 D ASSERT("true",$G(OBJECT("syncCompleted")),"Patient SITE;3 should be sync complete")
 D ASSERT("true",$G(OBJECT("solrSyncCompleted")),"Patient SITE;3 should be SOLR sync complete")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasError")),"Site-SYNC SITE should not have Sync error")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasSolrError")),"Site-SOLR Sync SITE should not have SOLR error")
 D ASSERT(0,$D(OBJECT("hasError")),"Patient SITE;3 should not have Sync error")
 D ASSERT(0,$D(OBJECT("hasSolrError")),"Patient SITE;3 should not have SOLR error")
 ;
 I $D(DATA) K @DATA
 ; Set SOLR error flags
 D COMPLETEBASICSOLRERR("SITE",3)
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-SYNC SITE should be complete")
 D ASSERT("false",$G(OBJECT("sites","SITE","solrSyncCompleted")),"Site-SOLR Sync SITE should not be complete")
 D ASSERT("true",$G(OBJECT("syncCompleted")),"Patient SITE;3 should be sync complete")
 D ASSERT("false",$G(OBJECT("solrSyncCompleted")),"Patient SITE;3 should not be SOLR sync complete")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasError")),"Site-SYNC SITE should not have Sync error")
 D ASSERT(1,$D(OBJECT("sites","SITE","hasSolrError")),"Site-SOLR Sync SITE should have SOLR error")
 D ASSERT(0,$D(OBJECT("hasError")),"Patient SITE;3 should not have Sync error")
 D ASSERT(1,$D(OBJECT("hasSolrError")),"Patient SITE;3 should have SOLR error")
 Q
 ;
GETSYNCSOLRERRORFULLSYNC ;; @TEST Get Patient Simple Sync Status with a Sync and a SOLR error after a full sync
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 ;
 ; Set up test data
 K ^VPRPTJ("JPID")
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","SITE;3")=""
 S ^VPRPTJ("JPID","SITE;3")="52833885-af7c-4899-90be-b3a6630b2369"
 ;
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D COMPLETEBASICSOLR("SITE",3)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"vista-SITE-data-allergy-poller")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-SYNC SITE should be complete")
 D ASSERT("true",$G(OBJECT("sites","SITE","solrSyncCompleted")),"Site-SOLR Sync SITE should be complete")
 D ASSERT("true",$G(OBJECT("syncCompleted")),"Patient SITE;3 should be sync complete")
 D ASSERT("true",$G(OBJECT("solrSyncCompleted")),"Patient SITE;3 should be SOLR sync complete")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasError")),"Site-SYNC SITE should not have Sync error")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasSolrError")),"Site-SOLR Sync SITE should not have SOLR error")
 D ASSERT(0,$D(OBJECT("hasError")),"Patient SITE;3 should not have Sync error")
 D ASSERT(0,$D(OBJECT("hasSolrError")),"Patient SITE;3 should not have SOLR error")
 ;
 I $D(DATA) K @DATA
 ; Set Sync and SOLR error flags
 D COMPLETEBASICSYNCERR("SITE",3)
 D COMPLETEBASICSOLRERR("SITE",3)
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("false",$G(OBJECT("sites","SITE","syncCompleted")),"Site-SYNC SITE should not be complete")
 D ASSERT("false",$G(OBJECT("sites","SITE","solrSyncCompleted")),"Site-SOLR Sync SITE should not be complete")
 D ASSERT("false",$G(OBJECT("syncCompleted")),"Patient SITE;3 should not be sync complete")
 D ASSERT("false",$G(OBJECT("solrSyncCompleted")),"Patient SITE;3 should not be SOLR sync complete")
 D ASSERT(1,$D(OBJECT("sites","SITE","hasError")),"Site-SYNC SITE should have Sync error")
 D ASSERT(1,$D(OBJECT("sites","SITE","hasSolrError")),"Site-SOLR Sync SITE should have SOLR error")
 D ASSERT(1,$D(OBJECT("hasError")),"Patient SITE;3 should have Sync error")
 D ASSERT(1,$D(OBJECT("hasSolrError")),"Patient SITE;3 should have SOLR error")
 Q
RESETSYNCERROR ;; @TEST Get Patient Simple Sync Status with a Sync and a SOLR error after a full sync
 N BODY,JPID,DATA,ARG,ERR,HTTPERR,STAMPTIME,RETURN
 ; Set up solr error
 D PATIDS
 S JPID="52833885-af7c-4899-90be-b3a6630b2369"
 S STAMPTIME=20141031094920
 S ARG("pid")="SITE;3"
 S BODY("uid")="urn:va:vitals:SITE:3:1001",BODY("eventStamp")=STAMPTIME,BODY("type")="solrErr",BODY("pid")="SITE;3"
 D ENCODE^VPRJSON("BODY","DATA","ERR")
 S RETURN=$$STORERECORD^VPRJPSTATUS(.ARG,.DATA)
 ; Set status to stored
 S BODY("type")="solr"
 K DATA,ERR D ENCODE^VPRJSON("BODY","DATA","ERR")
 S RETURN=$$STORERECORD^VPRJPSTATUS(.ARG,.DATA)
 D ASSERT("",$G(^VPRSTATUS(JPID,"SITE;3","SITE","vitals",BODY("uid"),STAMPTIME,"solrError")),"SOLR Error should have been cleared")
 D ASSERT(1,$G(^VPRSTATUS(JPID,"SITE;3","SITE","vitals",BODY("uid"),STAMPTIME,"solrStored")),"SOLR status should be stored")
 S BODY("uid")="urn:va:vitals:SITE:3:1002",BODY("type")="syncError"
 K DATA,ERR D ENCODE^VPRJSON("BODY","DATA","ERR")
 S RETURN=$$STORERECORD^VPRJPSTATUS(.ARG,.DATA)
 S BODY("type")="jds"
 K DATA,ERR D ENCODE^VPRJSON("BODY","DATA","ERR")
 S RETURN=$$STORERECORD^VPRJPSTATUS(.ARG,.DATA)
 D ASSERT("",$G(^VPRSTATUS(JPID,"SITE;3","SITE","vitals",BODY("uid"),STAMPTIME,"syncError")),"Sync Error should have been cleared")
 D ASSERT(1,$G(^VPRSTATUS(JPID,"SITE;3","SITE","vitals",BODY("uid"),STAMPTIME,"stored")),"Object should be stored")
 Q
GET2NDTIME ;; @TEST 1st time Patient sync complete started ESR Job
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID
 ;
 ; Set up test data
 K ^VPRPTJ("JPID")
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","SITE;3")=""
 S ^VPRPTJ("JPID","SITE;3")="52833885-af7c-4899-90be-b3a6630b2369"
 ;
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D COMPLETEBASICSOLR("SITE",3)
 ;
 ; Create jobs
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"enterprise-sync-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"vista-SITE-subscribe-request")
 D JOB("SITE;3",ROOTJOBID,"completed",20160420110400,"vista-SITE-data-allergy-poller")
 S ROOTJOBID=$$UUID^VPRJRUT
 D JOB("SITE;3",ROOTJOBID,"started",20160420110405,"enterprise-sync-request")
 ;
 S ARG("icnpidjpid")="SITE;3"
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 ; Ensure that the JSON matches what we expect
 D ASSERT("SITE;3",$G(OBJECT("sites","SITE","pid")),"Site-pid SITE should exist")
 D ASSERT("true",$G(OBJECT("sites","SITE","syncCompleted")),"Site-SYNC SITE should be complete")
 D ASSERT("true",$G(OBJECT("sites","SITE","solrSyncCompleted")),"Site-SOLR Sync SITE should be complete")
 D ASSERT(20141031094920,$G(OBJECT("sites","SITE","sourceStampTime")),"Site-sourceStampTime should have a value")
 D ASSERT("true",$G(OBJECT("syncCompleted")),"Patient SITE;3 should be sync complete")
 D ASSERT("true",$G(OBJECT("solrSyncCompleted")),"Patient SITE;3 should be SOLR sync complete")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasError")),"Site-SYNC SITE should not have Sync error")
 D ASSERT(0,$D(OBJECT("sites","SITE","hasSolrError")),"Site-SOLR Sync SITE should not have SOLR error")
 D ASSERT(0,$D(OBJECT("hasError")),"Patient SITE;3 should not have Sync error")
 D ASSERT(0,$D(OBJECT("hasSolrError")),"Patient SITE;3 should not have SOLR error")
 QUIT
 ;
 ; VLER-DAS tests
ASSERTJOBS(JOBS,PID,SYNCCOMPLETE,SYNCERROR,DEBUG)
 ; JOBS Array format
 ; JOBS(1,"JOB")="vler-das-sync-request"
 ; JOBS(1,"STATUS")="error"
 ; JOBS(1,"PID")="VLER;1234V4321"
 ; JOBS(1,"TIMESTAMP")=20160420110400
 ; JOBS(2,"JOB")="vler-das-subscribe-request"
 ; JOBS(2,"STATUS")="error"
 ; JOBS(2,"PID")="VLER;1234V4321"
 ; JOBS(2,"TIMESTAMP")=20160420110400
 N DATA,ARG,ERR,OBJECT,HTTPERR,ROOTJOBID,JOB
 S DEBUG=$G(DEBUG)
 ;
 ; Set up test data
 K ^VPRPTJ("JPID")
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","SITE;3")=""
 S ^VPRPTJ("JPID","SITE;3")="52833885-af7c-4899-90be-b3a6630b2369"
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","VLER;1234V4321")=""
 S ^VPRPTJ("JPID","VLER;1234V4321")="52833885-af7c-4899-90be-b3a6630b2369"
 ;
 D BASIC("SITE",3)
 D COMPLETEBASIC("SITE",3)
 D COMPLETEBASICSOLR("SITE",3)
 D BASIC("VLER","1234V4321")
 D:SYNCCOMPLETE="true" COMPLETEBASIC("VLER","1234V4321")
 D:SYNCCOMPLETE="true" COMPLETEBASICSOLR("VLER","1234V4321")
 ;
 ; Create jobs
 S JOB=""
 F  S JOB=$O(JOBS(JOB)) Q:JOB=""  D
 . S ROOTJOBID=$$UUID^VPRJRUT
 . D JOB(JOBS(JOB,"PID"),ROOTJOBID,JOBS(JOB,"STATUS"),JOBS(JOB,"TIMESTAMP"),JOBS(JOB,"JOB"))
 ;
 I DEBUG W !,"CALLING ENDPOINT"
 S ARG("icnpidjpid")=PID
 S ARG("debug")=1
 D COMBINED^VPRJPSTATUS(.DATA,.ARG)
 I $D(DATA) D DECODE^VPRJSON(DATA,"OBJECT","ERR")
 I DEBUG W !,"OBJECT",! ZWRITE OBJECT W !
 I DEBUG W !,"RULES",! ZWRITE ^||TMP($J) W !
 ; If we can't decode the JSON Fail the test
 D ASSERT(0,$D(ERR),"ERROR DECODING JSON")
 ;
 I DEBUG W !,"DOING ASSERTS"
 I DEBUG W !,"SYNCCOMPLETE ",SYNCCOMPLETE
 I DEBUG W ,"SYNCERROR ",SYNCERROR
 I DEBUG W !,"SYNC STATUS",! ZWRITE ^VPRSTATUS
 ; Ensure that the JSON matches what we expect
 D ASSERT(PID,$G(OBJECT("sites",$P(PID,";",1),"pid")),"Site-pid "_$P(PID,";",1)_" should exist")
 D ASSERT(SYNCCOMPLETE,$G(OBJECT("sites",$P(PID,";",1),"syncCompleted")),"Site-SYNC "_$P(PID,";",1)_" should "_$S(SYNCCOMPLETE="true":"",1:"not ")_"be complete")
 D ASSERT(20141031094920,$G(OBJECT("sites",$P(PID,";",1),"sourceStampTime")),"Site-sourceStampTime "_$P(PID,";",1)_" should have a value")
 D ASSERT($S(SYNCERROR="1":1,1:0),$D(OBJECT("sites",$P(PID,";",1),"hasError")),"Site-SYNC "_PID_" should "_$S(SYNCERROR="1":"",1:"not ")_"have Sync error")
 D ASSERT($S(SYNCERROR="1":1,1:0),$D(OBJECT("hasError")),"Patient "_PID_" should "_$S(SYNCERROR="1":"",1:"not ")_"have Sync error")
 QUIT
VDR1 ;; @TEST VLER-DAS Rule 1
 N JOBS
 ; VDSR not complete (error)
 S JOBS(1,"JOB")="vler-das-sync-request"
 S JOBS(1,"STATUS")="error"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 W !,"VDSR error"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",1)
 D ASSERT("",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSR not complete (started)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-sync-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 W !,"VDSR started"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSUR not complete (error)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-subscribe-request"
 S JOBS(1,"STATUS")="error"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 W !,"VDSUR error"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",1)
 D ASSERT("",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSUR not complete (started)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-subscribe-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 W !,"VDSUR started"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDDR not complete (error)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-doc-retrieve"
 S JOBS(1,"STATUS")="error"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 W !,"VDDR error"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",1)
 D ASSERT("",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDDR not complete (started)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-doc-retrieve"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 W !,"VDDR started"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDXV not complete (error)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-xform-vpr"
 S JOBS(1,"STATUS")="error"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 W !,"VDXV error"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",1)
 D ASSERT("",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSR & VDSUR not complete (error)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-sync-request"
 S JOBS(1,"STATUS")="error"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-subscribe-request"
 S JOBS(2,"STATUS")="error"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"VDSR & VDSUR error"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",1)
 D ASSERT("",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSR & VDSUR not complete (started)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-sync-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-subscribe-request"
 S JOBS(2,"STATUS")="started"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"VDSR & VDSUR started"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSR & VDDR not complete (error)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-sync-request"
 S JOBS(1,"STATUS")="error"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-subscribe-request"
 S JOBS(2,"STATUS")="error"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"VDSR & VDDR error"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",1)
 D ASSERT("",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSR & VDDR not complete (started)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-sync-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-doc-retrieve"
 S JOBS(2,"STATUS")="started"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"VDSR & VDDR started"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSR & VDXV not complete (error)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-sync-request"
 S JOBS(1,"STATUS")="error"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-xform-vpr"
 S JOBS(2,"STATUS")="error"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"VDSR & VDXV error"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",1)
 D ASSERT("",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSR & VDXV not complete (started)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-sync-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-xform-vpr"
 S JOBS(2,"STATUS")="started"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"VDSR & VDXV started"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSUR & VDDR not complete (error)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-subscribe-request"
 S JOBS(1,"STATUS")="error"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-doc-retrieve"
 S JOBS(2,"STATUS")="error"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"VDSUR & VDDR error"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",1)
 D ASSERT("",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSUR & VDDR not complete (started)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-subscribe-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-doc-retrieve"
 S JOBS(2,"STATUS")="started"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"VDSR & VDSUR started"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSUR & VDXV not complete (error)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-subscribe-request"
 S JOBS(1,"STATUS")="error"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-xform-vpr"
 S JOBS(2,"STATUS")="error"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"VDSUR & VDXV error"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",1)
 D ASSERT("",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSUR & VDXV not complete (started)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-subscribe-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-xform-vpr"
 S JOBS(2,"STATUS")="started"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"VDSUR & VDXV started"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDDR & VDXV not complete (error)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-doc-retrieve"
 S JOBS(1,"STATUS")="error"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-xform-vpr"
 S JOBS(2,"STATUS")="error"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"VDDR & VDXV error"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",1)
 D ASSERT("",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDDR & VDXV not complete (started)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-doc-retrieve"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-xform-vpr"
 S JOBS(2,"STATUS")="started"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"VDDR & VDXV started"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSR & VDSUR & VDDR not complete (error)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-sync-request"
 S JOBS(1,"STATUS")="error"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-subscribe-request"
 S JOBS(2,"STATUS")="error"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 S JOBS(3,"JOB")="vler-das-doc-retrieve"
 S JOBS(3,"STATUS")="error"
 S JOBS(3,"PID")="VLER;1234V4321"
 S JOBS(3,"TIMESTAMP")=20160420110400
 W !,"VDSR & VDSUR & VDDR error"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",1)
 D ASSERT("",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSR & VDSUR & VDDR not complete (started)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-sync-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-subscribe-request"
 S JOBS(2,"STATUS")="started"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 S JOBS(3,"JOB")="vler-das-doc-retrieve"
 S JOBS(3,"STATUS")="started"
 S JOBS(3,"PID")="VLER;1234V4321"
 S JOBS(3,"TIMESTAMP")=20160420110400
 W !,"VDSR & VDSUR & VDDR started"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSR & VDSUR & VDXV not complete (error)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-sync-request"
 S JOBS(1,"STATUS")="error"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-subscribe-request"
 S JOBS(2,"STATUS")="error"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 S JOBS(3,"JOB")="vler-das-xform-vpr"
 S JOBS(3,"STATUS")="error"
 S JOBS(3,"PID")="VLER;1234V4321"
 S JOBS(3,"TIMESTAMP")=20160420110400
 W !,"VDSR & VDSUR & VDXV error"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",1)
 D ASSERT("",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSR & VDSUR & VDXV not complete (started)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-sync-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-subscribe-request"
 S JOBS(2,"STATUS")="started"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 S JOBS(3,"JOB")="vler-das-xform-vpr"
 S JOBS(3,"STATUS")="started"
 S JOBS(3,"PID")="VLER;1234V4321"
 S JOBS(3,"TIMESTAMP")=20160420110400
 W !,"VDSR & VDSUR & VDXV started"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSUR & VDDR & VDXV not complete (error)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-subscribe-request"
 S JOBS(1,"STATUS")="error"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-doc-retrieve"
 S JOBS(2,"STATUS")="error"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 S JOBS(3,"JOB")="vler-das-xform-vpr"
 S JOBS(3,"STATUS")="error"
 S JOBS(3,"PID")="VLER;1234V4321"
 S JOBS(3,"TIMESTAMP")=20160420110400
 W !,"VDSUR & VDDR & VDXV error"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",1)
 D ASSERT("",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSUR & VDDR & VDXV not complete (started)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-subscribe-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-doc-retrieve"
 S JOBS(2,"STATUS")="started"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 S JOBS(3,"JOB")="vler-das-xform-vpr"
 S JOBS(3,"STATUS")="started"
 S JOBS(3,"PID")="VLER;1234V4321"
 S JOBS(3,"TIMESTAMP")=20160420110400
 W !,"VDSUR & VDDR & VDXV started"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; VDSR & VDSUR & VDDR & VDXV not complete (error)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-sync-request"
 S JOBS(1,"STATUS")="error"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-subscribe-request"
 S JOBS(2,"STATUS")="error"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 S JOBS(3,"JOB")="vler-das-doc-retrieve"
 S JOBS(3,"STATUS")="error"
 S JOBS(3,"PID")="VLER;1234V4321"
 S JOBS(3,"TIMESTAMP")=20160420110400
 S JOBS(4,"JOB")="vler-das-xform-vpr"
 S JOBS(4,"STATUS")="error"
 S JOBS(4,"PID")="VLER;1234V4321"
 S JOBS(4,"TIMESTAMP")=20160420110400
 W !,"VDSR & VDSUR & VDDR & VDXV error"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",1)
 D ASSERT("",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 QUIT
 ;
 ; VDSR & VDSUR & VDDR & VDXV not complete (started)
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="vler-das-sync-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-subscribe-request"
 S JOBS(2,"STATUS")="started"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 S JOBS(3,"JOB")="vler-das-doc-retrieve"
 S JOBS(3,"STATUS")="started"
 S JOBS(3,"PID")="VLER;1234V4321"
 S JOBS(3,"TIMESTAMP")=20160420110400
 S JOBS(4,"JOB")="vler-das-xform-vpr"
 S JOBS(4,"STATUS")="started"
 S JOBS(4,"PID")="VLER;1234V4321"
 S JOBS(4,"TIMESTAMP")=20160420110400
 W !,"VDSR & VDSUR & VDDR & VDXV started"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; ESR complete & VDSR complete
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="enterprise-sync-request"
 S JOBS(1,"STATUS")="completed"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-sync-request"
 S JOBS(2,"STATUS")="completed"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"ESR & VDSR complete"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't true")
 ;
 ; ESR complete & VDSUR complete
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="enterprise-sync-request"
 S JOBS(1,"STATUS")="completed"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-subscribe-request"
 S JOBS(2,"STATUS")="completed"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"ESR & VDSUR complete"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; ESR complete & VDDR complete
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="enterprise-sync-request"
 S JOBS(1,"STATUS")="completed"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-doc-retrieve"
 S JOBS(2,"STATUS")="completed"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"ESR complete & VDDR complete"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; ESR complete & VDSR & VDSUR complete
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="enterprise-sync-request"
 S JOBS(1,"STATUS")="completed"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-sync-request"
 S JOBS(2,"STATUS")="completed"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 S JOBS(3,"JOB")="vler-das-subscribe-request"
 S JOBS(3,"STATUS")="completed"
 S JOBS(3,"PID")="VLER;1234V4321"
 S JOBS(3,"TIMESTAMP")=20160420110400
 W !,"ESR & VDSR & VDSUR complete"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't true")
 ;
 ; ESR complete & VDSR & VDDR complete
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="enterprise-sync-request"
 S JOBS(1,"STATUS")="completed"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-sync-request"
 S JOBS(2,"STATUS")="completed"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 S JOBS(3,"JOB")="vler-das-doc-retrieve"
 S JOBS(3,"STATUS")="completed"
 S JOBS(3,"PID")="VLER;1234V4321"
 S JOBS(3,"TIMESTAMP")=20160420110400
 W !,"ESR complete & VDSR & VDDR complete"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; ESR complete & VDSUR & VDDR complete
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="enterprise-sync-request"
 S JOBS(1,"STATUS")="completed"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-subscribe-request"
 S JOBS(2,"STATUS")="completed"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 S JOBS(3,"JOB")="vler-das-doc-retrieve"
 S JOBS(3,"STATUS")="completed"
 S JOBS(3,"PID")="VLER;1234V4321"
 S JOBS(3,"TIMESTAMP")=20160420110400
 W !,"ESR complete & VDSUR & VDDR complete"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't false")
 ;
 ; ESR Started & VDSR doesn't exist rest exist
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="enterprise-sync-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-subscribe-request"
 S JOBS(2,"STATUS")="completed"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 S JOBS(3,"JOB")="vler-das-doc-retrieve"
 S JOBS(3,"STATUS")="completed"
 S JOBS(3,"PID")="VLER;1234V4321"
 S JOBS(3,"TIMESTAMP")=20160420110400
 W !,"ESR Started & VDSR doesn't exist rest exist"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't true")
 ;
 ; ESR Started & VDSUR doesn't exist rest exist
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="enterprise-sync-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-sync-request"
 S JOBS(2,"STATUS")="completed"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 S JOBS(3,"JOB")="vler-das-doc-retrieve"
 S JOBS(3,"STATUS")="completed"
 S JOBS(3,"PID")="VLER;1234V4321"
 S JOBS(3,"TIMESTAMP")=20160420110400
 W !,"ESR Started & VDSUR doesn't exist rest exist"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't true")
 ;
 ; ESR Started & VDDR doesn't exist rest exist
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="enterprise-sync-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-sync-request"
 S JOBS(2,"STATUS")="completed"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 S JOBS(3,"JOB")="vler-das-subscribe-request"
 S JOBS(3,"STATUS")="completed"
 S JOBS(3,"PID")="VLER;1234V4321"
 S JOBS(3,"TIMESTAMP")=20160420110400
 W !,"ESR Started & VDDR doesn't exist rest exist"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't true")
 ;
 ; ESR Started & VDSR & VDSUR doesn't exist rest exist
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="enterprise-sync-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-doc-retrieve"
 S JOBS(2,"STATUS")="completed"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"ESR Started & VDSR & VDSUR doesn't exist rest exist"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't true")
 ;
 ; ESR Started & VDSR & VDDR doesn't exist rest exist
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="enterprise-sync-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-subscribe-request"
 S JOBS(2,"STATUS")="completed"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"ESR Started & VDSR & VDDR doesn't exist rest exist"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't true")
 ;
 ; ESR Started & VDSUR & VDDR doesn't exist rest exist
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="enterprise-sync-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-sync-request"
 S JOBS(2,"STATUS")="completed"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 W !,"ESR Started & VDSUR & VDDR doesn't exist rest exist"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 1 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't true")
 QUIT
VDR2 ;; @TEST VLER-DAS Rule 2
 ; This rule requires enterprise-sync-request to be completed in all cases and at least one vler-das job to exist to run
 N JOBS
 ; ESR complete & VDSR & VDSUR & VDDR complete
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="enterprise-sync-request"
 S JOBS(1,"STATUS")="completed"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-sync-request"
 S JOBS(2,"STATUS")="completed"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 S JOBS(3,"JOB")="vler-das-subscribe-request"
 S JOBS(3,"STATUS")="completed"
 S JOBS(3,"PID")="VLER;1234V4321"
 S JOBS(3,"TIMESTAMP")=20160420110400
 S JOBS(4,"JOB")="vler-das-doc-retrieve"
 S JOBS(4,"STATUS")="completed"
 S JOBS(4,"PID")="VLER;1234V4321"
 S JOBS(4,"TIMESTAMP")=20160420110400
 W !,"ESR complete & VDSR & VDSUR & VDDR complete"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","true",0)
 D ASSERT("VLER DAS RULE 2 TRUE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't true")
 ;
 ; ESR & VDSR & VDSUR & VDDR complete, metastamp incomplete
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="enterprise-sync-request"
 S JOBS(1,"STATUS")="completed"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 S JOBS(2,"JOB")="vler-das-sync-request"
 S JOBS(2,"STATUS")="completed"
 S JOBS(2,"PID")="VLER;1234V4321"
 S JOBS(2,"TIMESTAMP")=20160420110400
 S JOBS(3,"JOB")="vler-das-subscribe-request"
 S JOBS(3,"STATUS")="completed"
 S JOBS(3,"PID")="VLER;1234V4321"
 S JOBS(3,"TIMESTAMP")=20160420110400
 S JOBS(4,"JOB")="vler-das-doc-retrieve"
 S JOBS(4,"STATUS")="completed"
 S JOBS(4,"PID")="VLER;1234V4321"
 S JOBS(4,"TIMESTAMP")=20160420110400
 W !,"ESR & VDSR & VDSUR & VDDR & VDXV completed, metastamp incomplete"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER DAS RULE 2 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't true")
 QUIT
VDR3 ;; @TEST VLER-DAS Rule 3
 N JOBS
 ; Base assumption is that an ESR has to exist at one point, else there is nothing to test.
 ; If ESR is in error then Rule 3 will never execute due to fail fast methodologies.
 ;
 ; ESR Started & VDSR & VDSUR & VDDR doesn't exist rest exist
 D TEARDOWN
 K JOBS
 S JOBS(1,"JOB")="enterprise-sync-request"
 S JOBS(1,"STATUS")="started"
 S JOBS(1,"PID")="VLER;1234V4321"
 S JOBS(1,"TIMESTAMP")=20160420110400
 W !,"ESR Started & VDSR & VDSUR & VDDR doesn't exist rest exist"
 D ASSERTJOBS(.JOBS,"VLER;1234V4321","false",0)
 D ASSERT("VLER RULE 3 FALSE",$G(^||TMP($J,"RESULT","return","RULES","VLER")),"Expected rule isn't true")
 QUIT
 ;
GETDOMAINJOBSNOTIMESTAMP ;; @TEST GETDOMAINJOBS works when no JOB TIMESTAMP exists
 ; This is technically an invalid scenario, but if it does happen we shouldn't generate a hard error
 N JOB,ROOTJOBID,U,VDJOBS
 S U="^"
 S ROOTJOBID=$$UUID^VPRJRUT
 S JOB("jobId")=$$UUID^VPRJRUT
 S JOB("jpid")="52833885-af7c-4899-90be-b3a6630b2369"
 S JOB("patientIdentifier","type")="pid"
 S JOB("patientIdentifier","value")="SITE;3"
 S JOB("rootJobId")=ROOTJOBID
 S JOB("status")="completed"
 S JOB("type")="vista-SITE-data-poller"
 S VPRCNT=$I(^VPRJOB(0))
 S ^VPRJOB("A",JOB("jpid"),JOB("type"),JOB("rootJobId"),JOB("jobId"),11111,JOB("status"))=VPRCNT
 S ^VPRJOB("B",VPRCNT)=JOB("jpid")_U_JOB("type")_U_JOB("rootJobId")_U_JOB("jobId")_U_11111_U_JOB("status")
 S ^VPRJOB("C",JOB("jobId"),JOB("rootJobId"))=""
 S ^VPRJOB("D",JOB("jpid"),JOB("type"),11111,VPRCNT)=VPRCNT
 M ^VPRJOB(VPRCNT)=JOB
 D GETDOMAINJOBS^VPRJPSTATUS(.VDJOBS,JOB("jpid"),"vista-SITE-data-")
 D ASSERT(10,$D(VDJOBS),"No jobs returned")
 QUIT

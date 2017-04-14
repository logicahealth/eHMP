VPRJPSTATUS ;KRM/CJE -- Handle Patient Sync Status operations
 Q
 ;
SET(ARGS,BODY) ; Store patient metastamps from a source
 N OBJECT,ERR,JID,JPID,JPID2,ICN,PID,SOURCE,SSOURCE,DOMAIN,DOMAINSTAMP,EVENT,EVENTSTAMP,I,J,K,PREVSTAMP
 S OBJECT=$NA(^||TMP($J,"metastamp"))
 K @OBJECT
 D DECODE^VPRJSON("BODY",OBJECT,"ERR") ; Decode JSON to OBJECT array
 ; Get the source site hash (only one allowed per post)
 S SOURCE=""
 S SOURCE=$O(@OBJECT@("sourceMetaStamp",SOURCE))
 ; No source found. Quit with error
 I SOURCE="""" D SETERROR^VPRJRER(227) K @OBJECT Q ""
 ;
 ; Support for all numeric site hashes
 ; The JSON Encoder/Decoder uses a magic character to tell the JSON
 ; encoder that an attribute that is a MUMPS number type should be
 ; encoded as a string.
 ; The magic character, which is a ", is prepended to the beginning
 ; of the string.
 ; We need to strip this character when storing the object, and add
 ; the character back when retrieving the object.
 ;
 ; Use SSOURCE to hold the name of the source that is used in storage
 ; (Stored Source)
 ; Strip leading " if it has one.
 I SOURCE["""" S SSOURCE=$P(SOURCE,"""",2)
 ; Make sure SSOURCE exists.
 E  S SSOURCE=SOURCE
 ;
 ; We must have a PID for the patient
 S PID=$G(@OBJECT@("sourceMetaStamp",SOURCE,"pid"))
 I PID="" D SETERROR^VPRJRER(211,"No PID found in BODY") Q ""
 ;
 ; ICN is optional, but if it exists we must check to make sure the
 ; JPID is the same between the PID and ICN.
 S ICN=$G(@OBJECT@("icn"))
 ;
 ; Check to make sure we know this patient
 I '$D(^VPRPTJ("JPID",PID)) D SETERROR^VPRJRER(224) Q ""
 ; Get the JPID based on patient identifiers
 S JPID="",JPID2=""
 I $G(ICN)'="" S JPID2=$$JPID4PID^VPRJPR(ICN)
 I $G(PID)'="" S JPID=$$JPID4PID^VPRJPR(PID)
 ; Ensure that found JPIDs match, if not error as something went wrong
 ; Only run if JPID2 exists
 I JPID2'="",JPID'=JPID2 D SETERROR^VPRJRER(223,"JPID from ICN "_JPID2_" JPID from PID "_JPID) Q ""
 ; Ensure that we know JPID
 ; We can avoid the call to translate using ^VPRPTJ("JPID") since we have already done a lookup
 I JPID="" D SETERROR^VPPRJRER(224) Q ""
 ;
 ; Ensure metastamp has correct stampTimes
 ; Overall stampTime
 S SOURCESTAMP=$G(@OBJECT@("sourceMetaStamp",SOURCE,"stampTime"))
 ; Ensure overall stampTime is valid
 I '$$ISSTMPTM^VPRSTMP(SOURCESTAMP) D SETERROR^VPRJRER(228,"Invalid Source stampTime passed: "_SOURCESTAMP) Q ""
 ; Loop through the sourceMetaStamp
 S DOMAIN=""
 S ERR=0
 F  S DOMAIN=$O(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN)) Q:DOMAIN=""  Q:ERR  D
 . ; Ensure Domain stampTimes is valid
 . S DOMAINSTAMP=$G(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"stampTime"))
 . I '$$ISSTMPTM^VPRSTMP(DOMAINSTAMP) D SETERROR^VPRJRER(228,"Invalid Domain "_DOMAIN_" stampTime passed: "_DOMAINSTAMP) S ERR=1 Q
 . ; Ensure Event stampTimes is valid
 . S EVENT=""
 . F  S EVENT=$O(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"eventMetaStamp",EVENT)) Q:EVENT=""  Q:ERR  D
 . . S EVENTSTAMP=$G(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"eventMetaStamp",EVENT,"stampTime"))
 . . I '$$ISSTMPTM^VPRSTMP(EVENTSTAMP) D SETERROR^VPRJRER(228,"Invalid event "_EVENT_" stampTime passed: "_EVENTSTAMP) S ERR=1 Q
 I ERR Q ""
 ;
 ; Everything is ok, store the metastamp
 ; If this is the first metastamp stored, update lastAccessTime
 I $D(^VPRSTATUS(JPID,PID))=0,$G(^VPRMETA("JPID",JPID,"lastAccessTime"))="" D
 . S LASTTIME=$$CURRTIME^VPRJRUT
 . S ^VPRMETA("JPID",JPID,"lastAccessTime")=LASTTIME
 ;
 ; Store metastamp
 ; Metastamp has to be updated in a critical section.
 ; Use locking to ensure no one else is modifying the metastamp when a new one is stored
 ;
 ; ** Begin Critical Section **
 L +^VPRSTATUS(JPID,PID,SSOURCE):$G(^VPRCONFIG("timeout"),5) E  D SETERROR^VPRJRER(502) K @OBJECT Q ""
 ; Set sourcestamp
 S ^VPRSTATUS(JPID,PID,SSOURCE,"stampTime")=SOURCESTAMP
 ; foreach domain
 S DOMAIN=""
 F  S DOMAIN=$O(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN)) Q:DOMAIN=""  D
 . ; Skip non-domain subscripts
 . I DOMAIN="stampTime" Q
 . ;
 . ; Store the domain stampTime
 . S DOMAINSTAMP=$G(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"stampTime"))
 . ; We are guaranteed that DOMAINSTAMP exists and is valid since we checked it already
 . S ^VPRSTATUS(JPID,PID,SSOURCE,DOMAIN,DOMAINSTAMP)=""
 . ;
 . ; foreach event
 . S EVENT=""
 . F  S EVENT=$O(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"eventMetaStamp",EVENT)) Q:EVENT=""  D
 . . ; Store the event stampTime
 . . ; We are guaranteed that the EVENTSTAMP exists and is valid since we checked it already
 . . S EVENTSTAMP=$G(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"eventMetaStamp",EVENT,"stampTime"))
 . . S ^VPRSTATUS(JPID,PID,SSOURCE,DOMAIN,EVENT,EVENTSTAMP)=""
 . . ; check to see if the old data was stored
 . . I $G(^VPRSTATUS(JPID,PID,SSOURCE,DOMAIN,EVENT,EVENTSTAMP,"stored"))=1 S ^VPRSTATUS(JPID,PID,SSOURCE,DOMAIN,EVENT,EVENTSTAMP,"stored")=1
  L -^VPRSTATUS(JPID,PID,SSOURCE)
 ; ** End of Critical Section **
 ;
 K @OBJECT
 Q ""
 ;
GET(RETURN,ARGS) ; Return patient sync status based on metastamps
 N RESULT,DETAILED,JPID,PIDS,ID,RESULT,ERR,FILTER,CLAUSES
 S RESULT=$NA(^||TMP($J,"RESULT"))
 K @RESULT
 ; Ensure we don't have any unknown arguments
 I $$UNKARGS^VPRJCU(.ARGS,"id,detailed,filter") Q
 ; Set detailed flag if passed
 S:$G(ARGS("detailed"))="true" DETAILED=1
 S DETAILED=$G(DETAILED)
 ; Get any filters and parse them into CLAUSES
 S FILTER=$G(ARGS("filter"))
 I $L(FILTER) D PARSE^VPRJCF(FILTER,.CLAUSES) Q:$G(HTTPERR)
 ; Get the JPID based on passed patient identifier
 S JPID=""
 S JPID=$$JPID4PID^VPRJPR(ARGS("id")) I JPID="" D SETERROR^VPRJRER(224) Q
 ; Get all PIDs for JPID
 D PID4JPID^VPRJPR(.PIDS,JPID)
 ; Generate Metastamp based on index
 ;
 ; Loop through patient identifiers for this JPID
 S ID=""
 F  S ID=$O(PIDS(ID)) Q:ID=""  D
 . D PATIENT(RESULT,PIDS(ID),DETAILED,.CLAUSES)
 ;
 S RETURN=$NA(^||TMP($J,"RETURN"))
 K @RETURN ; Clear the output global array, avoid subtle bugs
 D ENCODE^VPRJSON(RESULT,RETURN,"ERR") ; From an array to JSON
 K @RESULT
 I $D(ERR) D SETERROR^VPRJRER(202) Q
 Q
 ;
PATIENT(RESULT,PID,DETAILED,CLAUSES,MINIMAL) ; GET Patient Sync Status algorithm
 N SOURCE,SSOURCE,DOMAINCOMPLETE,BUILD,DOMAIN,DOMAINSTAMP,EVENTSCOMPLETE,EVENT
 N EVENTSTORED,EVENTSTAMP,COMPLETE,TOTAL,DOMAINARRAY,EVENTARRAY,JPID,DOMAINSTORED
 N SOLREVENTSCOMPLETE,SOLREVENTSTORED,SOLRDOMAINSTORED,SOLRDOMAINCOMPLETE,SOLR
 N SOLRDOMAIN,SOLREXCEPTIONS
 ; Ensure Detailed flag exists
 S DETAILED=$G(DETAILED)
 S MINIMAL=$G(MINIMAL)
 ; Get configuration to determine if SOLR status should be reported
 S SOLR=$G(^VPRCONFIG("sync","status","solr"))
 ; Get SOLR domains configured to be ignored in the sync status algorithm
 S SOLRDOMAIN="",SOLREXCEPTIONS=","
 F  S SOLRDOMAIN=$O(^VPRCONFIG("sync","status","solr","domainExceptions",SOLRDOMAIN)) Q:SOLRDOMAIN=""  D
 . S SOLREXCEPTIONS=SOLREXCEPTIONS_SOLRDOMAIN_","
 ; Quit if PID doesn't exist
 I $G(PID)="" Q
 S SOURCE=$P(PID,";",1)
 ;
 ; Support for all numeric site hashes
 ; The JSON Encoder/Decoder uses a magic character to tell the JSON
 ; encoder that an attribute that is a MUMPS number type should be
 ; encoded as a string.
 ; The magic character, which is a ", is prepended to the beginning
 ; of the string.
 ; We need to strip this character when storing the object, and add
 ; the character back when retrieving the object.
 ;
 ; Use SSOURCE to hold the name of the source that is used in JSON
 ; encoding
 ; Add leading " if the source is fully numeric
 I SOURCE=+SOURCE S SSOURCE=""""_SOURCE_""
 E  S SSOURCE=SOURCE
 ;
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(224,"Unable to acquire JPID for PID: "_PID) Q
 ;
 ; Check to see if we have a metastamp for this source
 I '$G(^VPRSTATUS(JPID,PID,SOURCE,"stampTime")) Q
 ; Set BUILD up to use as a target for indirection
 S BUILD=$NA(^||TMP($J,"RESULT","BUILD"))
 K @BUILD
 ;
 ; This may be blank if no ICN is on file, if it is blank only primary site data is on file
 S:'MINIMAL @BUILD@("icn")=$$ICN4JPID^VPRJPR(JPID)
 ;
 ; Get time this patient has been accessed
 S:'MINIMAL @BUILD@("lastAccessTime")=$G(^VPRMETA("JPID",JPID,"lastAccessTime"))
 ;
 ; sourceMetaStamp object
 S @BUILD@("sourceMetaStamp",SSOURCE,"pid")=PID
 S:'MINIMAL @BUILD@("sourceMetaStamp",SSOURCE,"localId")=$P(PID,";",2)
 S @BUILD@("sourceMetaStamp",SSOURCE,"stampTime")=$G(^VPRSTATUS(JPID,PID,SOURCE,"stampTime"))
 ;
 ; domainMetaStamp object
 ; foreach domain
 S DOMAIN=""
 ;
 F  S DOMAIN=$O(^VPRSTATUS(JPID,PID,SOURCE,DOMAIN)) Q:DOMAIN=""  D
 . ; skip non domain subscripts
 . I DOMAIN="stampTime"!(DOMAIN="syncCompleteAsOf")!(DOMAIN="solrSyncCompleteAsOf") Q
 . ;
 . ; Set the domain stampTime
 . ; A is the first character after numerics so we can run the $O backwards
 . S DOMAINSTAMP="A"
 . S DOMAINSTAMP=$O(^VPRSTATUS(JPID,PID,SOURCE,DOMAIN,DOMAINSTAMP),-1)
 . ;
 . ; Flag if all domains are complete
 . ; If a domainstamp doesn't exist domain can never be complete
 . I DOMAINSTAMP="" S DOMAINCOMPLETE=0
 . E   I $G(DOMAINCOMPLETE)'=0 S DOMAINCOMPLETE=1
 . I SOLR D
 . . I DOMAINSTAMP="" S SOLRDOMAINCOMPLETE=0
 . . E  I $G(SOLRDOMAINCOMPLETE)'=0 S SOLRDOMAINCOMPLETE=1
 . S (SOLRDOMAINSTORED,DOMAINSTORED)=0
 . ;
 . ; eventMetaStamp object
 . ; All events begin with urn
 . S (EVENTSCOMPLETE,SOLREVENTSCOMPLETE)=1
 . S EVENT="urn"
 . S COMPLETE=0
 . F TOTAL=1:1 S EVENT=$O(^VPRSTATUS(JPID,PID,SOURCE,DOMAIN,EVENT)) Q:EVENT=""  D
 . . I EVENT="stampTime" Q
 . . ; Flag if all events are complete within a domain
 . . S (EVENTSTORED,SOLREVENTSTORED)=0
 . . ;
 . . ; Get the event stampTime
 . . ; A is the first character after numerics so we can run the $O backwards
 . . S EVENTSTAMP="A"
 . . S EVENTSTAMP=$O(^VPRSTATUS(JPID,PID,SOURCE,DOMAIN,EVENT,EVENTSTAMP),-1)
 . . ;
 . . ; Get the stored flag
 . . I $G(^VPRSTATUS(JPID,PID,SOURCE,DOMAIN,EVENT,EVENTSTAMP,"stored")) S EVENTSTORED=1
 . . E  S EVENTSCOMPLETE=0
 . . ; Get the SOLR stored flag
 . . I SOLR D
 . . . I $G(^VPRSTATUS(JPID,PID,SOURCE,DOMAIN,EVENT,EVENTSTAMP,"solrStored")) S SOLREVENTSTORED=1
 . . . E  I SOLREXCEPTIONS'[(","_DOMAIN_",") S SOLREVENTSCOMPLETE=0
 . . ;
 . . I EVENTSTORED S COMPLETE=COMPLETE+1
 . . ;
 . . ; Filters for event data when in detailed mode
 . . K EVENTARRAY
 . . S EVENTARRAY("domain")=DOMAIN
 . . ; uid and event are the same filter
 . . S EVENTARRAY("uid")=EVENT,EVENTARRAY("event")=EVENT
 . . S EVENTARRAY("stampTime")=EVENTSTAMP
 . . I EVENTSTORED S EVENTARRAY("stored")="true"
 . . I SOLR,SOLREVENTSTORED S EVENTARRAY("solrStored")="true"
 . . ; All clauses are wrapped in an implicit AND
 . . I DETAILED,$D(CLAUSES),'$$EVALAND^VPRJGQF(.CLAUSES,$NA(EVENTARRAY)) Q
 . . ;
 . . ; If detailed flag pased return all events in object
 . . I DETAILED S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"eventMetaStamp",EVENT,"stampTime")=EVENTSTAMP
 . . ;
 . . I DETAILED,EVENTSTORED S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"eventMetaStamp",EVENT,"stored")="true"
 . . I SOLR,DETAILED,SOLREVENTSTORED S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"eventMetaStamp",EVENT,"solrStored")="true"
 . ;
 . ; Set the flags to control syncCompleted for the domain and inProgress/completedStamp for the entire site
 . ; Is the domain complete, if so set DOMAINSTORED=1
 . I EVENTSCOMPLETE,DOMAINSTAMP'="" S DOMAINSTORED=1
 . ; domain isn't complete, set DOMAINCOMPLETE=0
 . E  S DOMAINCOMPLETE=0
 . ; Set the flag to control solrSyncCompleted for the domain
 . I SOLR D
 . . I SOLREVENTSCOMPLETE,DOMAINSTAMP'="" S SOLRDOMAINSTORED=1
 . . E  S SOLRDOMAINCOMPLETE=0
 . . ; Need to test and maybe set SOLRDOMAINSTORED again so that SOLRDOMAINCOMPLETE can still be set to 0 for metaStamp roll-up
 . . I SOLREXCEPTIONS[(","_DOMAIN_";") S SOLRDOMAINSTORED=1
 . ;
 . ; TOTAL will be one extra from the loop before it quits at end of data
 . S TOTAL=TOTAL-1
 . ; Filters for domain data when not in detailed mode
 . K DOMAINARRAY
 . S DOMAINARRAY("domain")=DOMAIN
 . S DOMAINARRAY("eventCount")=TOTAL
 . S DOMAINARRAY("stampTime")=DOMAINSTAMP
 . S DOMAINARRAY("storedCount")=COMPLETE
 . I EVENTSCOMPLETE S DOMAINARRAY("syncCompleted")="true"
 . I SOLR,SOLREVENTSCOMPLETE S DOMAINARRAY("solrSyncCompleted")="true"
 . ; All clauses are wrapped in an implicit AND
 . I 'DETAILED,$D(CLAUSES),'$$EVALAND^VPRJGQF(.CLAUSES,$NA(DOMAINARRAY)) Q
 . ;
 . ; If we pass the filter add the syncCompleted for the domain
 . S:'MINIMAL @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"syncCompleted")=$S(DOMAINSTORED:"true",1:"false")
 . ; If we pass the filter add the solrSyncCompleted for the domain
 . S:SOLR&('MINIMAL) @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"solrSyncCompleted")=$S(SOLRDOMAINSTORED:"true",1:"false")
 . ;
 . ; If domainstamp is null set the domain stampTime to the latest event stamp
 . I DOMAINSTAMP="",EVENTSTAMP>DOMAINSTAMP D
 . . S:'MINIMAL @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"stampTime")=EVENTSTAMP
 . E  S:'MINIMAL @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"stampTime")=DOMAINSTAMP
 . ;
 . S:'MINIMAL @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"domain")=DOMAIN
 . ;
 . ; Add event counts to output
 . S:'MINIMAL @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"eventCount")=TOTAL
 . S:'MINIMAL @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"storedCount")=COMPLETE
 ;
 ; Set the solr complete flag if all of the domains are complete
 I SOLR,$G(SOLRDOMAINCOMPLETE) D
 . S @BUILD@("sourceMetaStamp",SSOURCE,"solrSyncCompleted")="true"
 . S ^VPRSTATUS(JPID,PID,SOURCE,"solrSyncCompleteAsOf")=$$CURRTIME^VPRJRUT
 . S:'MINIMAL @BUILD@("sourceMetaStamp",SSOURCE,"solrSyncCompleteAsOf")=$G(^VPRSTATUS(JPID,PID,SOURCE,"solrSyncCompleteAsOf"))
 E  S:(SOLR)&($G(^VPRSTATUS(JPID,PID,SOURCE,"solrSyncCompleteAsOf"))'="")&('MINIMAL) @BUILD@("sourceMetaStamp",SSOURCE,"solrSyncCompleteAsOf")=$G(^VPRSTATUS(JPID,PID,SOURCE,"solrSyncCompleteAsOf"))
 ;
 ; Set the complete flag if all of the domains are complete
 I $G(DOMAINCOMPLETE) D
 . S @BUILD@("sourceMetaStamp",SSOURCE,"syncCompleted")="true"
 . S ^VPRSTATUS(JPID,PID,SOURCE,"syncCompleteAsOf")=$$CURRTIME^VPRJRUT
 . S:'MINIMAL @BUILD@("sourceMetaStamp",SSOURCE,"syncCompleteAsOf")=$G(^VPRSTATUS(JPID,PID,SOURCE,"syncCompleteAsOf"))
 . M @RESULT@("completedStamp")=@BUILD
 E  D
 . S:$G(^VPRSTATUS(JPID,PID,SOURCE,"syncCompleteAsOf"))'=""&('MINIMAL) @BUILD@("sourceMetaStamp",SSOURCE,"syncCompleteAsOf")=$G(^VPRSTATUS(JPID,PID,SOURCE,"syncCompleteAsOf"))
 . M @RESULT@("inProgress")=@BUILD
 K @BUILD
 Q
 ;
CLEAR(RESULT,ARGS) ; Delete all sync status data
 K ^VPRSTATUS
 Q
DELSS(PID) ; Delete a patient's sync status
 N JPID
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(224,"Unable to acquire JPID for PID: "_PID) Q
 ;
 K ^VPRSTATUS(JPID,PID)
 Q
DELSITE(SITE) ; Delete a site's sync status
 N PID,JPID
 S JPID=""
 F  S JPID=$O(^VPRPT(JPID)) Q:JPID=""  D
 . S PID=SITE
 . F  S PID=$O(^VPRPT(JPID,PID)) Q:PID=""!($P(PID,";")'=SITE)  D
 . . K ^VPRSTATUS(JPID,PID)
 Q
STORERECORD(ARGS,BODY)
 ; Set flags to indicate records are stored.
 ; supports type="jds" only for testing purposes - not to be used in regular operations
 ; type="solr" is supported for regular operations
 N OBJECT,ERR,PID,SOURCE,DOMAIN,UID,EVENTSTAMP,JPID
 D DECODE^VPRJSON("BODY","OBJECT","ERR")
 S UID=$G(OBJECT("uid"))
 S PID=$G(ARGS("pid"))
 S SOURCE=$P(PID,";",1)
 S DOMAIN=$P(UID,":",3)
 S EVENTSTAMP=$G(OBJECT("eventStamp"))
 S TYPE=$G(OBJECT("type"))
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(224,"Unable to acquire JPID for PID: "_PID) Q ""
 I (DOMAIN="")!(UID="")!(EVENTSTAMP="")!($P(UID,":",6)="") D SETERROR^VPRJRER(210,"Required fields are missing from the UID or eventStamp") Q ""
 I (TYPE="")!(TYPE="jds") S ^VPRSTATUS(JPID,PID,SOURCE,DOMAIN,UID,EVENTSTAMP,"stored")=1
 E  I (TYPE="solr") S ^VPRSTATUS(JPID,PID,SOURCE,DOMAIN,UID,EVENTSTAMP,"solrStored")=1
 Q "/vpr/"_PID_"/"_UID
 ;
COMBINED(RETURN,ARGS) ; Return patient sync status with job status
 ; NOTE: if only id associations are stored the the timestamp and stampTimes are empty strings instead
 ; of numeric
 N RESULT,DETAILED,JPID,PIDS,ID,RESULT,ERR,FILTER,CLAUSES,ALLCOMPLETE,SITES,SITELIST
 S RESULT=$NA(^||TMP($J,"RESULT","syncStatus"))
 K ^||TMP($J,"RESULT")
 ; Ensure we don't have any unknown arguments
 I $$UNKARGS^VPRJCU(.ARGS,"icnpidjpid,sites") Q
 ; Set sites list
 S SITELIST=0
 S SITES=$G(ARGS("sites"))
 I $L(SITES) S SITELIST=1
 ; If we don't have a site list set the global syncStatus to true
 S:'SITELIST ^||TMP($J,"RESULT","return","syncCompleted")="true"
 ; If solr status is enabled and we don't have a site list set the global solrSyncStatus to true
 S:$G(^VPRCONFIG("sync","status","solr"))&('SITELIST) ^||TMP($J,"RESULT","return","solrSyncCompleted")="true"
 ;
 ; Get the JPID based on passed patient identifier
 S JPID=""
 S JPID=$$JPID4PID^VPRJPR(ARGS("icnpidjpid")) I JPID="" D SETERROR^VPRJRER(224) Q
 ; Get all PIDs for JPID
 D PID4JPID^VPRJPR(.PIDS,JPID)
 ;
 ; Get jobs that are used across all sites
 ; Currently this is just the enterprise-sync-request
 N ESR,ESRJOB
 S ESR=$$GETJOBBYINDEX(.ESRJOB,JPID,"enterprise-sync-request")
 ;
 ; Job debugging
 ;N INCR S INCR=$I(^KTMP($J))
 ;M ^KTMP($J,INCR,"RESULT","JOBS","ESR")=ESRJOB
 ;M ^KTMP($J,INCR,"RESULT","PIDS")=PIDS
 ;
 ; We always want to report the last time an enterprise-sync-request was created for the patient
 S ^||TMP($J,"RESULT","return","latestEnterpriseSyncRequestTimestamp")=$G(ESRJOB("timestamp"))
 ;
 ; Global enterprise-sync-request rules
 ; If enterprise-sync-request is in error the site can never be complete
 ; Set the hasError flag and set syncComplete=false
 I $G(ESRJOB("status"))="error" D BLDRESULT($G(PIDS(1)),"false",$G(ESRJOB("timestamp")),1) G BLDRETURN
 ;
 ; If we have a started enterprise-sync-request, but no patient identifiers the sync isn't complete
 ; We are guaranteed to have 2 results in the PIDS array in most cases (the JPID and the identifier
 ; used to begin the ESR job) so we check the third one if the ESRJOB is in started status.
 I ($G(ESRJOB("status"))="started")&($G(PIDS(3))="") D BLDRESULT($G(PIDS(1)),"false",$G(ESRJOB("timestamp"))) G BLDRETURN
 ;
 ; Loop through identifiers for patient
 S ID=""
 F  S ID=$O(PIDS(ID)) Q:ID=""  D
 . N SITE,SSITE
 . S SITE=$P(PIDS(ID),";",1)
 . ; Only include real sites - JPID and ICNs are not real sites
 . I (PIDS(ID)'[";")!(SITE="JPID") Q
 . ; If we have a site list and this identifier isn't in it go to the next one
 . I SITELIST&(SITES'[SITE) Q
 . ;
 . ; Always get the patient meta-stamp
 . D PATIENT(RESULT,PIDS(ID),"",.CLAUSES,1)
 . ;
 . ; VistA Primary Site and VistA/HDR Pub/Sub Checks
 . ; These checks are combined as there is no way to tell via PID which is which
 . ; VistA Primary Site checks take presidence over VistA/HDR Pub/Sub
 . ;
 . I SITE'="DOD"&(SITE'="HDR")&(SITE'="VLER") D
 . . ; VistA Primary Site
 . . ; VistA HDR Pub/Sub
 . . ;
 . . ; Get jobs
 . . N VSR,VSRJOB,VDJOBS
 . . N VHSR,VHSRJOB,VHDJOBS
 . . S VSR=$$GETJOBBYINDEX(.VSRJOB,JPID,"vista-"_SITE_"-subscribe-request")
 . . D GETDOMAINJOBS(.VDJOBS,JPID,"vista-"_SITE_"-data-")
 . . S VHSR=$$GETJOBBYINDEX(.VHSRJOB,JPID,"vistahdr-"_SITE_"-subscribe-request")
 . . D GETDOMAINJOBS(.VHDJOBS,JPID,"vistahdr-"_SITE_"-data-")
 . . ;
 . . ; Overwrite latestJobTimestamp to include other jobs that aren't data jobs
 . . I $G(VSRJOB("timestamp"))>$G(VDJOBS("latestTimestamp")) S VDJOBS("latestTimestamp")=VSRJOB("timestamp")
 . . I $G(ESRJOB("timestamp"))>$G(VDJOBS("latestTimestamp")) S VDJOBS("latestTimestamp")=ESRJOB("timestamp")
 . . ; vistahdr
 . . I $G(VHSRJOB("timestamp"))>$G(VHDJOBS("latestTimestamp")) S VHDJOBS("latestTimestamp")=VHSRJOB("timestamp")
 . . I $G(ESRJOB("timestamp"))>$G(VHDJOBS("latestTimestamp")) S VHDJOBS("latestTimestamp")=ESRJOB("timestamp")
 . . ;
 . . ; Determine if Jobs are in error
 . . I $G(VSRJOB("status"))="error" S VDJOBS("hasError")=1
 . . I $G(VDJOBS("hasError")) D BLDRESULT(PIDS(ID),"false",VDJOBS("latestTimestamp"),1) Q
 . . ; vistahdr
 . . I $G(VHSRJOB("status"))="error" S VHDJOBS("hasError")=1
 . . I $G(VHDJOBS("hasError")) D BLDRESULT(PIDS(ID),"false",VHDJOBS("latestTimestamp"),1) Q
 . . ;
 . . ; Save jobs off to global for debugging
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"ESR")=ESRJOB
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"VSR")=VSRJOB
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"VDJOBS")=VDJOBS
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"VHSR")=VHSRJOB
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"VHDJOBS")=VHDJOBS
 . . ;
 . . ; 1. If vista-{SiteHash}-subscribe-request OR vista-{SiteHash}-data-{domain}-poller jobs are OPEN or ERROR: syncComplete = false
 . . I (($G(VSRJOB("status"))'="completed")!('VDJOBS("allJobsComplete")))&(('VHSR)&('VHDJOBS("numberOfJobs"))) S ^||TMP($J,"RESULT","RULES",SITE)="VISTA RULE 1 FALSE" D BLDRESULT(PIDS(ID),"false",VDJOBS("latestTimestamp")) Q
 . . ;
 . . ; 2. If vista-{SiteHash}-subscribe-request AND vista-{SiteHash}-data-{domain}-poller are COMPLETED syncComplete = meta-stamp status
 . . I ($G(VSRJOB("status"))="completed")&(VDJOBS("allJobsComplete")) D  Q
 . . . ; setup SSITE to deal with fully numeric site hashes
 . . . I SITE=+SITE S SSITE=""""_SITE_""
 . . . E  S SSITE=SITE
 . . . I $D(^||TMP($J,"RESULT","syncStatus","inProgress","sourceMetaStamp",SSITE)) S ^||TMP($J,"RESULT","RULES")="VISTA RULE 2 FALSE" D BLDRESULT(PIDS(ID),"false",VDJOBS("latestTimestamp"))
 . . . E  I $D(^||TMP($J,"RESULT","syncStatus","completedStamp","sourceMetaStamp",SSITE)) S ^||TMP($J,"RESULT","RULES",SITE)="VISTA RULE 2 TRUE" D BLDRESULT(PIDS(ID),"true",VDJOBS("latestTimestamp"))
 . . . E  I '$D(^||TMP($J,"RESULT","syncStatus")) S ALLCOMPLETE=0
 . . ;
 . . ; 3. If vista-{SiteHash}-subscribe-request OR vista-{SiteHash}-data-{domain}-poller don't exist AND enterprise-sync-request is OPEN or ERROR: syncComplete = false
 . . I (('VSR)!('VDJOBS("numberOfJobs")))&('VHSR)&('VHDJOBS("numberOfJobs"))&(($G(ESRJOB("status"))="open")) S ^||TMP($J,"RESULT","RULES",SITE)="VISTA RULE 3 FALSE" D BLDRESULT(PIDS(ID),"false",VDJOBS("latestTimestamp")) Q
 . . ;
 . . ; VistA HDR Pub/Sub
 . . ; 1. If vistahdr-{SiteHash}-subscribe-request OR vistahdr-{SiteHash}-data-{domain}-poller jobs are OPEN or ERROR: syncComplete = false
 . . I (($G(VHSRJOB("status"))'="completed")!('VHDJOBS("allJobsComplete"))) S ^||TMP($J,"RESULT","RULES",SITE)="VISTAHDR RULE 1 FALSE" D BLDRESULT(PIDS(ID),"false",VHDJOBS("latestTimestamp")) Q
 . . ;
 . . ; 2. If vistahdr-{SiteHash}-subscribe-request OR vistahdr-{SiteHash}-data-{domain}-poller are COMPLETE: syncComplete = meta-stamp status
 . . I ($G(VHSRJOB("status"))="completed")&(VHDJOBS("allJobsComplete")) D  Q
 . . . ; setup SSITE to deal with fully numeric site hashes
 . . . I SITE=+SITE S SSITE=""""_SITE_""
 . . . E  S SSITE=SITE
 . . . I $D(^||TMP($J,"RESULT","syncStatus","inProgress","sourceMetaStamp",SSITE)) S ^||TMP($J,"RESULT","RULES")="VISTAHDR RULE 2 FALSE" D BLDRESULT(PIDS(ID),"false",VHDJOBS("latestTimestamp"))
 . . . E  I $D(^||TMP($J,"RESULT","syncStatus","completedStamp","sourceMetaStamp",SSITE)) S ^||TMP($J,"RESULT","RULES",SITE)="VISTAHDR RULE 2 TRUE" D BLDRESULT(PIDS(ID),"true",VHDJOBS("latestTimestamp"))
 . . ;
 . . ; 3. If vistahdr-{SiteHash}-subscribe-request OR vistahdr-{SiteHash}-data-{domain}-poller don't exist AND enterprise-sync-request is OPEN or ERROR: syncComplete = false
 . . I (('VHSR)!('VHDJOBS("numberOfJobs")))&('VSR)&('VDJOBS("numberOfJobs"))&(($G(ESRJOB("status"))="open")) S ^||TMP($J,"RESULT","RULES",SITE)="VISTAHDR RULE 3 FALSE" D BLDRESULT(PIDS(ID),"false",VHDJOBS("latestTimestamp")) Q
 . ;
 . E  I SITE="HDR" D
 . . ; HDR Req/Res
 . . N HSR,HSRJOB,HXJOBS,HDJOBS
 . . ;
 . . ; Get jobs
 . . S HSR=$$GETJOBBYINDEX(.HSRJOB,JPID,"hdr-sync-request")
 . . D GETDOMAINJOBS(.HDJOBS,JPID,"hdr-sync-")
 . . D GETDOMAINJOBS(.HXJOBS,JPID,"hdr-xform-")
 . . ;
 . . ; Overwrite latestJobTimestamp to include other jobs that aren't data jobs
 . . I $G(HSRJOB("timestamp"))>$G(HDJOBS("latestTimestamp")) S HDJOBS("latestTimestamp")=HSRJOB("timestamp")
 . . I $G(HXJOBS("latestTimestamp"))>$G(HDJOBS("latestTimestamp")) S HDJOBS("latestTimestamp")=HXJOBS("latestTimestamp")
 . . I $G(ESRJOB("timestamp"))>$G(HDJOBS("latestTimestamp")) S HDJOBS("latestTimestamp")=ESRJOB("timestamp")
 . . ;
 . . ; Determine if Jobs are in error
 . . I $G(HSRJOB("status"))="error" S HDJOBS("hasError")=1
 . . I $G(HXJOBS("hasError")) S HDJOBS("hasError")=1
 . . I $G(HDJOBS("hasError")) D BLDRESULT(PIDS(ID),"false",HDJOBS("latestTimestamp"),1) Q
 . . ;
 . . ; Save jobs off to global for debugging
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"ESR")=ESRJOB
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"HSR")=HSRJOB
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"HSDR")=HDJOBS
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"HX")=HXJOBS
 . . ;
 . . ; 1. If hdr-subscribe-request OR hdr-sync-{domain}-request OR hdr-xform-{domain}-vpr jobs are OPEN or ERROR: syncComplete = false
 . . I ($G(HSRJOB("status"))'="completed")!('HDJOBS("allJobsComplete"))!((HXJOBS("numberOfJobs"))&('HXJOBS("allJobsComplete"))) S ^||TMP($J,"RESULT","RULES",SITE)="HDR RULE 1 FALSE" D BLDRESULT(PIDS(ID),"false",HDJOBS("latestTimestamp")) Q
 . . ;
 . . ; 2. If enterprise-sync-request AND hdr-subscribe-request AND hdr-sync-{domain}-request AND hdr-xform-{domain}-vpr are COMPLETE: syncComplete = meta-stamp status
 . . I ($G(ESRJOB("status"))="completed")&($G(HSRJOB("status"))="completed")&(HDJOBS("allJobsComplete"))&(('HXJOBS("numberOfJobs"))!(HXJOBS("allJobsComplete"))) D  Q
 . . . I $D(^||TMP($J,"RESULT","syncStatus","inProgress","sourceMetaStamp",$P(PIDS(ID),";",1))) S ^||TMP($J,"RESULT","RULES",SITE)="HDR RULE 2 FALSE" D BLDRESULT(PIDS(ID),"false",HDJOBS("latestTimestamp"))
 . . . E  I $D(^||TMP($J,"RESULT","syncStatus","completedStamp","sourceMetaStamp",$P(PIDS(ID),";",1))) S ^||TMP($J,"RESULT","RULES",SITE)="HDR RULE 2 TRUE" D BLDRESULT(PIDS(ID),"true",HDJOBS("latestTimestamp"))
 . . ;
 . . ; 3. If hdr-subscribe-request AND hdr-sync-{domain}-request AND hdr-xform-{domain}-vpr don't exist AND enterprise-sync-request is OPEN or ERROR: syncComplete = false
 . . I ('HSR)&('HDJOBS("numberOfJobs"))&('HXJOBS("numberOfJobs"))&(($G(ESRJOB("status"))="open")) S ^||TMP($J,"RESULT","RULES",SITE)="HDR RULE 3 FALSE" D BLDRESULT(PIDS(ID),"false",HDJOBS("latestTimestamp")) Q
 . ;
 . E  I SITE="DOD" D
 . . ; DOD Req/Res
 . . ;
 . . ; Get jobs
 . . N JSR,JSRJOB,JDR,JDRJOB,JPDT,JPDTJOB,JXJOBS,JCDC,JCDCJOB,JJOBS
 . . S JSR=$$GETJOBBYINDEX(.JSRJOB,JPID,"jmeadows-sync-request")
 . . S JDR=$$GETJOBBYINDEX(.JDRJOB,JPID,"jmeadows-document-retrieval",)
 . . S JPDT=$$GETJOBBYINDEX(.JPDTJOB,JPID,"jmeadows-pdf-document-transform",)
 . . S JCDC=$$GETJOBBYINDEX(.JCDCJOB,JPID,"jmeadows-cda-document-conversion")
 . . D GETDOMAINJOBS(.JJOBS,JPID,"jmeadows-sync-")
 . . D GETDOMAINJOBS(.JXJOBS,JPID,"jmeadows-xform-")
 . . ;
 . . ; Overwrite latestJobTimestamp to include other jobs that aren't data jobs
 . . I $G(JSRJOB("timestamp"))>$G(JJOBS("latestTimestamp")) S JJOBS("latestTimestamp")=JSRJOB("timestamp")
 . . I $G(JDRJOB("timestamp"))>$G(JJOBS("latestTimestamp")) S JJOBS("latestTimestamp")=JDRJOB("timestamp")
 . . I $G(JPDTJOB("timestamp"))>$G(JJOBS("latestTimestamp")) S JJOBS("latestTimestamp")=JPDTJOB("timestamp")
 . . I $G(JXJOBS("latestTimestamp"))>$G(JJOBS("latestTimestamp")) S JJOBS("latestTimestamp")=JXJOBS("latestTimestamp")
 . . I $G(JCDCJOB("timestamp"))>$G(JJOBS("latestTimestamp")) S JJOBS("latestTimestamp")=JCDCJOB("timestamp")
 . . I $G(ESRJOB("timestamp"))>$G(JJOBS("latestTimestamp")) S JJOBS("latestTimestamp")=ESRJOB("timestamp")
 . . ;
 . . ; Determine if Jobs are in error
 . . I $G(JSRJOB("status"))="error" S JJOBS("hasError")=1
 . . I $G(JDRJOB("status"))="error" S JJOBS("hasError")=1
 . . I $G(JPDTJOB("status"))="error" S JJOBS("hasError")=1
 . . I $G(JCDCJOB("status"))="error" S JJOBS("hasError")=1
 . . I $G(JXJOBS("hasError")) S JJOBS("hasError")=1
 . . I $G(JJOBS("hasError")) D BLDRESULT(PIDS(ID),"false",JJOBS("latestTimestamp"),1) Q
 . . ;
 . . ; Save jobs off to global for debugging
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"ESR")=ESRJOB
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"JS")=JSRJOB
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"JJOBS")=JJOBS
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"JDR")=JDRJOB
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"JPDT")=JPDTJOB
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"JX")=JXJOB
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"JCDC")=JCDCJOB
 . . ;
 . . ; 1. If jmeadows-sync-request OR jmeadows-sync-{domain}-request OR jmeadows-document-retrieval OR jmeadows-pdf-document-transform OR jmeadows-xform-{domain}-vpr
 . . ;    OR jmeadows-cda-document-conversion jobs are OPEN or ERROR: syncComplete = false
 . . I ($G(JSRJOB("status"))'="completed")!('JJOBS("allJobsComplete"))!((JDR)&($G(JDRJOB("status"))'="completed"))!((JPDT)&($G(JPDTJOB("status"))'="completed"))!((JXJOBS("numberOfJobs"))&('JXJOBS("allJobsComplete")))!((JCDC)&($G(JCDCJOB("status"))'="completed")) S ^||TMP($J,"RESULT","RULES",SITE)="DOD RULE 1 FALSE" D BLDRESULT(PIDS(ID),"false",JJOBS("latestTimestamp")) Q
 . . ;
 . . ; 2. If enterprise-sync-request AND jmeadows-sync-request AND jmeadows-sync-{domain}-request AND jmeadows-document-retrieval AND jmeadows-pdf-document-transform
 . . ;    AND jmeadows-xform-{domain}-vpr AND jmeadows-cda-document-conversion are COMPLETE: syncComplete = meta-stamp status
 . . I ($G(ESRJOB("status"))="completed")&($G(JSRJOB("status"))="completed")&(JJOBS("allJobsComplete"))&(('JDR)!($G(JDRJOB("status"))="completed"))&(('JPDT)!($G(JPDTJOB("status"))="completed"))&(('JXJOBS("numberOfJobs"))!(JXJOBS("allJobsComplete")))&(('JCDC)!($G(JCDCJOB("status"))="completed")) D  Q
 . . . I $D(^||TMP($J,"RESULT","syncStatus","inProgress","sourceMetaStamp",$P(PIDS(ID),";",1))) S ^||TMP($J,"RESULT","RULES",SITE)="DOD RULE 2 FALSE" D BLDRESULT(PIDS(ID),"false",JJOBS("latestTimestamp"))
 . . . E  I $D(^||TMP($J,"RESULT","syncStatus","completedStamp","sourceMetaStamp",$P(PIDS(ID),";",1))) S ^||TMP($J,"RESULT","RULES",SITE)="DOD RULE 2 TRUE" D BLDRESULT(PIDS(ID),"true",JJOBS("latestTimestamp"))
 . . ;
 . . ; 3. If jmeadows-sync-request AND jmeadows-sync-{domain}-request AND jmeadows-document-retrieval AND jmeadows-pdf-document-transform
 . . ;    AND jmeadows-xform-{domain}-vpr AND jmeadows-cda-document-conversion don't exist AND enterprise-sync-request is OPEN or ERROR: syncComplete = false
 . . I ('JSR)&('JJOBS("numberOfJobs"))&('JXJOBS("numberOfJobs"))&('JDR)&('JPDT)&('JCDC)&(($G(ESRJOB("status"))="open")) S ^||TMP($J,"RESULT","RULES",SITE)="DOD RULE 3 FALSE" D BLDRESULT(PIDS(ID),"false",JJOBS("latestTimestamp")) Q
 . ;
 . E  I SITE="VLER" D
 . . ; VLER Req/Res
 . . ;
 . . ; Get jobs
 . . N VSR,VSRJOB,VXV,VXVJOB,VJOBS
 . . S VSR=$$GETJOBBYINDEX(.VSRJOB,JPID,"vler-sync-request")
 . . S VXV=$$GETJOBBYINDEX(.VXVJOB,JPID,"vler-xform-vpr")
 . . S VJOBS("latestTimestamp")=$S($G(VSRJOB("timestamp"))>$G(VXVJOB("timestamp")):VSRJOB("timestamp"),1:$G(VSRJOB("timestamp")))
 . . I $G(ESRJOB("timestamp"))>$G(VJOBS("latestTimestamp")) S VJOBS("latestTimestamp")=ESRJOB("timestamp")
 . . ;
 . . ; Determine if Jobs are in error
 . . I $G(VSRJOB("status"))="error" S VJOBS("hasError")=1
 . . I $G(VXVJOB("status"))="error" S VJOBS("hasError")=1
 . . I $G(VJOBS("hasError")) D BLDRESULT(PIDS(ID),"false",VJOBS("latestTimestamp"),1) Q
 . . ;
 . . ; Save jobs off to global for debugging
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"ESR")=ESRJOB
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"VSR")=VSRJOB
 . . ;M ^KTMP($J,INCR,"RESULT","JOBS",SITE,"VXV")=VXVJOB
 . . ;
 . . ; 1. If vler-sync-request OR vler-xform-vpr jobs are OPEN or ERROR: syncComplete = false
 . . I ($G(VSRJOB("status"))'="completed")!((VXV)&($G(VXVJOB("status"))'="completed")) S ^||TMP($J,"RESULT","RULES",SITE)="VLER RULE 1 FALSE" D BLDRESULT(PIDS(ID),"false",VJOBS("latestTimestamp")) Q
 . . ;
 . . ; 2. If enterprise-sync-request AND vler-sync-request AND vler-xform-vpr are COMPLETE: syncComplete = meta-stamp status
 . . I ($G(ESRJOB("status"))="completed")&($G(VSRJOB("status"))="completed")&(('VXV)!($G(VXVJOB("status"))="completed")) D  Q
 . . . I $D(^||TMP($J,"RESULT","syncStatus","inProgress","sourceMetaStamp",$P(PIDS(ID),";",1))) S ^||TMP($J,"RESULT","RULES",SITE)="VLER RULE 2 FALSE" D BLDRESULT(PIDS(ID),"false",VJOBS("latestTimestamp"))
 . . . E  I $D(^||TMP($J,"RESULT","syncStatus","completedStamp","sourceMetaStamp",$P(PIDS(ID),";",1))) S ^||TMP($J,"RESULT","RULES",SITE)="VLER RULE 2 TRUE" D BLDRESULT(PIDS(ID),"true",VJOBS("latestTimestamp"))
 . . ;
 . . ; 3. If vler-sync-request AND vler-xform-vpr don't exist AND enterprise-sync-request is OPEN or ERROR: syncComplete = false
 . . I ('VSR)&('VXV)&(($G(ESRJOB("status"))="open")) S ^||TMP($J,"RESULT","RULES",SITE)="VLER RULE 3 FALSE" D BLDRESULT(PIDS(ID),"false",VJOBS("latestTimestamp")) Q
 ;
BLDRETURN
 ; Build Return
 S ^||TMP($J,"RESULT","return","icn")=$$ICN4JPID^VPRJPR(JPID)
 ;
 S RETURN=$NA(^||TMP($J,"RETURN"))
 K @RETURN ; Clear the output global array, avoid subtle bugs
 D ENCODE^VPRJSON($NA(^||TMP($J,"RESULT","return")),RETURN,"ERR") ; From an array to JSON
 K @RESULT
 I $D(ERR) D SETERROR^VPRJRER(202) Q
 Q
 ;
BLDRESULT(PID,STATUS,TIMESTAMP,ERROR)
 N SOURCE,SOLRSTATUS
 S SOURCE=$P(PID,";",1)
 I SOURCE=+SOURCE S SOURCE=""""_SOURCE_""
 I $$ISPID^VPRJPR(PID) D
 . S ^||TMP($J,"RESULT","return","sites",SOURCE,"pid")=PID
 . S ^||TMP($J,"RESULT","return","sites",SOURCE,"syncCompleted")=STATUS
 . ;
 . ; Set Site sourceStampTime (either from inProgress or completedStamp) and solr sync status
 . I $G(^||TMP($J,"RESULT","syncStatus","completedStamp","sourceMetaStamp",SOURCE,"stampTime")) D
 . . S ^||TMP($J,"RESULT","return","sites",SOURCE,"sourceStampTime")=$G(^||TMP($J,"RESULT","syncStatus","completedStamp","sourceMetaStamp",SOURCE,"stampTime"))
 . . ; if solrSyncComplted doesn't exist the answer is false (implemented as the $G default)
 . . S:$G(^VPRCONFIG("sync","status","solr")) (SOLRSTATUS,^||TMP($J,"RESULT","return","sites",SOURCE,"solrSyncCompleted"))=$G(^||TMP($J,"RESULT","syncStatus","completedStamp","sourceMetaStamp",SOURCE,"solrSyncCompleted"),"false")
 . E  D
 . . S ^||TMP($J,"RESULT","return","sites",SOURCE,"sourceStampTime")=$G(^||TMP($J,"RESULT","syncStatus","inProgress","sourceMetaStamp",SOURCE,"stampTime"))
 . . ; if solrSyncComplted doesn't exist the answer is false (implemented as the $G default)
 . . S:$G(^VPRCONFIG("sync","status","solr")) (SOLRSTATUS,^||TMP($J,"RESULT","return","sites",SOURCE,"solrSyncCompleted"))=$G(^||TMP($J,"RESULT","syncStatus","inProgress","sourceMetaStamp",SOURCE,"solrSyncCompleted"),"false")
 . ;
 . ; Set Site latestJobTimestamp
 . S ^||TMP($J,"RESULT","return","sites",SOURCE,"latestJobTimestamp")=TIMESTAMP
 ;
 ; Set Site & Global hasError flag
 I $G(ERROR) D
 . I $$ISPID^VPRJPR(PID) S ^||TMP($J,"RESULT","return","sites",SOURCE,"hasError")="true"
 . S ^||TMP($J,"RESULT","return","hasError")="true"
 ;
 ; Set Global syncStatus
 I 'SITELIST&(STATUS="false") S ^||TMP($J,"RESULT","return","syncCompleted")="false"
 ; Set Global solrSyncStatus
 I ($G(^VPRCONFIG("sync","status","solr")))&('SITELIST)&($G(SOLRSTATUS,"false")="false") S ^||TMP($J,"RESULT","return","solrSyncCompleted")="false"
 ;
 ; Set Global latestSourceStampTime
 I 'SITELIST&($G(^||TMP($J,"RESULT","return","latestSourceStampTime"))<$G(^||TMP($J,"RESULT","return","sites",SOURCE,"sourceStampTime"))) D
 . S ^||TMP($J,"RESULT","return","latestSourceStampTime")=$G(^||TMP($J,"RESULT","return","sites",SOURCE,"sourceStampTime"))
 ;
 ; Set Global latestJobTimestamp
 I 'SITELIST&($G(^||TMP($J,"RESULT","return","latestJobTimestamp"))<TIMESTAMP) S ^||TMP($J,"RESULT","return","latestJobTimestamp")=TIMESTAMP
 Q
 ;
GETJOBBYINDEX(RJOB,JPID,JOBNAME,SITE)
 ; RJOB will contain the matching JOB
 N JOB,RETURN,TIMESTAMP,JOBNUM
 ; default return
 S RETURN=0
 ; Ensure SITE exists
 S SITE=$G(SITE)
 ;
 ; site specific job
 I SITE'="" D  Q:RETURN RETURN
 . S JOB=$O(^VPRJOB("D",JPID,JOBNAME))
 . I JOB'=""&(JOB[SITE) D
 . . S RETURN=1
 . . S TIMESTAMP=$O(^VPRJOB("D",JPID,JOB,""),-1)
 . . S JOBNUM=$O(^VPRJOB("D",JPID,JOB,TIMESTAMP,""),-1)
 . . M RJOB=^VPRJOB(JOBNUM)
 ;
 ; non-site specific job
 E  D
 . S JOB=$O(^VPRJOB("D",JPID,JOBNAME,""),-1)
 . I JOB'="" D
 . . S RETURN=1
 . . S JOBNUM=$O(^VPRJOB("D",JPID,JOBNAME,JOB,""),-1)
 . . M RJOB=^VPRJOB(JOBNUM)
 Q RETURN
 ;
GETDOMAINJOBS(DJOBS,JPID,BASEJOBNAME)
 N JOBNAME,JOB,LATEST,NUMJOBS
 S JOBNAME=BASEJOBNAME
 S DJOBS("latestTimestamp")=""
 S DJOBS("allJobsComplete")=1
 S NUMJOBS=0
 F  S JOBNAME=$O(^VPRJOB("D",JPID,JOBNAME)) Q:JOBNAME=""  Q:JOBNAME'[BASEJOBNAME  D
 . I JOBNAME=(BASEJOBNAME_"request") Q ; jmeadows mixes a sync-request with the domain sync-requests
 . S NUMJOBS=NUMJOBS+1
 . ; Get the latest version of the job
 . S LATEST=$O(^VPRJOB("D",JPID,JOBNAME,""),-1)
 . S JOB=$O(^VPRJOB("D",JPID,JOBNAME,LATEST,""),-1)
 . M DJOBS(JOBNAME,"status")=^VPRJOB(JOB,"status")
 . I DJOBS("latestTimestamp")<^VPRJOB(JOB,"timestamp") S DJOBS("latestTimestamp")=^VPRJOB(JOB,"timestamp")
 . I ^VPRJOB(JOB,"status")'="completed" S DJOBS("allJobsComplete")=0
 . I ^VPRJOB(JOB,"status")="error" S DJOBS("hasError")=1
 S DJOBS("numberOfJobs")=NUMJOBS
 I NUMJOBS=0 S DJOBS("allJobsComplete")=0
 Q

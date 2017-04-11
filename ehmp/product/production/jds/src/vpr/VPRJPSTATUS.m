VPRJPSTATUS ;KRM/CJE -- Handle Patient Sync Status operations ; 10/20/2015
 ; No entry from top
 Q
 ;
SET(ARGS,BODY) ; Store patient metastamps from a source
 N OBJECT,ERR,JID,JPID,JPID2,ICN,PID,SOURCE,SSOURCE,DOMAIN,DOMAINSTAMP,EVENT,EVENTSTAMP,I,J,K,PREVSTAMP
 S OBJECT=$NA(^TMP($J,"metastamp"))
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
 I '$$ISSTMPTM^VPRSTMP(SOURCESTAMP) D SETERROR^VPRJRER(228,"Invalid Source stampTime passed") Q ""
 ; Loop through the sourceMetaStamp
 S DOMAIN=""
 S ERR=0
 F  S DOMAIN=$O(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN)) Q:DOMAIN=""  Q:ERR  D
 . ; Ensure Domain stampTimes is valid
 . S DOMAINSTAMP=$G(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"stampTime"))
 . I '$$ISSTMPTM^VPRSTMP(DOMAINSTAMP) D SETERROR^VPRJRER(228,"Invalid Domain stampTime passed") S ERR=1 Q
 . ; Ensure Event stampTimes is valid
 . S EVENT=""
 . F  S EVENT=$O(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"eventMetaStamp",EVENT)) Q:EVENT=""  Q:ERR  D
 . . S EVENTSTAMP=$G(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"eventMetaStamp",EVENT,"stampTime"))
 . . I '$$ISSTMPTM^VPRSTMP(EVENTSTAMP) D SETERROR^VPRJRER(228,"Invalid event stampTime passed") S ERR=1 Q
 I ERR Q ""
 ;
 ; Everything is ok, store the metastamp
 ; If this is the first metastamp stored, update lastAccessTime
 I $D(^VPRSTATUS(PID))=0,$G(^VPRMETA("JPID",JPID,"lastAccessTime"))="" D
 . S LASTTIME=$$CURRTIME^VPRJRUT
 . S ^VPRMETA("JPID",JPID,"lastAccessTime")=LASTTIME
 ;
 ; Store metastamp
 ; Metastamp has to be updated in a critical section.
 ; Use locking to ensure no one else is modifying the metastamp when a new one is stored
 ;
 ; ** Begin Critical Section **
 L +^VPRSTATUS(PID,SSOURCE):$G(^VPRCONFIG("timeout"),5) E  D SETERROR^VPRJRER(502) K @OBJECT Q ""
 ; Set sourcestamp
 S ^VPRSTATUS(PID,SSOURCE,"stampTime")=SOURCESTAMP
 ; foreach domain
 S DOMAIN=""
 F  S DOMAIN=$O(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN)) Q:DOMAIN=""  D
 . ; Skip non-domain subscripts
 . I DOMAIN="stampTime" Q
 . ;
 . ; Store the domain stampTime
 . S DOMAINSTAMP=$G(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"stampTime"))
 . ; We are guaranteed that DOMAINSTAMP exists and is valid since we checked it already
 . S ^VPRSTATUS(PID,SSOURCE,DOMAIN,DOMAINSTAMP)=""
 . ;
 . ; foreach event
 . S EVENT=""
 . F  S EVENT=$O(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"eventMetaStamp",EVENT)) Q:EVENT=""  D
 . . ; Store the event stampTime
 . . ; We are guaranteed that the EVENTSTAMP exists and is valid since we checked it already
 . . S EVENTSTAMP=$G(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"eventMetaStamp",EVENT,"stampTime"))
 . . S ^VPRSTATUS(PID,SSOURCE,DOMAIN,EVENT,EVENTSTAMP)=""
 . . ; check to see if the old data was stored
 . . I $G(^VPRSTATUS(PID,SSOURCE,DOMAIN,EVENT,EVENTSTAMP,"stored"))=1 S ^VPRSTATUS(PID,SSOURCE,DOMAIN,EVENT,EVENTSTAMP,"stored")=1
  L -^VPRSTATUS(PID,SSOURCE)
 ; ** End of Critical Section **
 ;
 K @OBJECT
 Q ""
 ;
GET(RETURN,ARGS) ; Return patient sync status based on metastamps
 N RESULT,DETAILED,JPID,PIDS,ID,RESULT,ERR,FILTER,CLAUSES
 S RESULT=$NA(^TMP($J,"RESULT"))
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
 S RETURN=$NA(^TMP($J,"RETURN"))
 K @RETURN ; Clear the output global array, avoid subtle bugs
 D ENCODE^VPRJSON(RESULT,RETURN,"ERR") ; From an array to JSON
 K @RESULT
 I $D(ERR) D SETERROR^VPRJRER(202) Q
 Q
 ;
PATIENT(RESULT,PID,DETAILED,CLAUSES) ; GET Patient Sync Status algorithm
 N SOURCE,SSOURCE,DOMAINCOMPLETE,BUILD,DOMAIN,DOMAINSTAMP,EVENTSCOMPLETE,EVENT
 N EVENTSTORED,EVENTSTAMP,COMPLETE,TOTAL,DOMAINARRAY,EVENTARRAY
 ; Ensure Detailed flag exists
 S DETAILED=$G(DETAILED)
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
 ; Check to see if we have a metastamp for this source
 I '$G(^VPRSTATUS(PID,SOURCE,"stampTime")) Q
 ; Set BUILD up to use as a target for indirection
 S BUILD=$NA(^TMP($J,"RESULT","BUILD"))
 K @BUILD
 ;
 ; This may be blank if no ICN is on file, if it is blank only primary site data is on file
 S @BUILD@("icn")=$$ICN4JPID^VPRJPR(JPID)
 ;
 ; Get time this patient has been accessed
 S @BUILD@("lastAccessTime")=$G(^VPRMETA("JPID",JPID,"lastAccessTime"))
 ;
 ; sourceMetaStamp object
 S @BUILD@("sourceMetaStamp",SSOURCE,"pid")=PID
 S @BUILD@("sourceMetaStamp",SSOURCE,"localId")=$P(PID,";",2)
 S @BUILD@("sourceMetaStamp",SSOURCE,"stampTime")=$G(^VPRSTATUS(PID,SOURCE,"stampTime"))
 ;
 ; domainMetaStamp object
 ; foreach domain
 S DOMAIN=""
 ;
 F  S DOMAIN=$O(^VPRSTATUS(PID,SOURCE,DOMAIN)) Q:DOMAIN=""  D
 . ; skip non domain subscripts
 . I DOMAIN="stampTime" Q
 . ;
 . ; Set the domain stampTime
 . ; A is the first character after numerics so we can run the $O backwards
 . S DOMAINSTAMP="A"
 . S DOMAINSTAMP=$O(^VPRSTATUS(PID,SOURCE,DOMAIN,DOMAINSTAMP),-1)
 . ;
 . ; Flag if all domains are complete
 . ; If a domainstamp doesn't exist domain can never be complete
 . I DOMAINSTAMP="" S DOMAINCOMPLETE=0
 . E   I $G(DOMAINCOMPLETE)'=0 S DOMAINCOMPLETE=1
 . S DOMAINSTORED=0
 . ;
 . ; eventMetaStamp object
 . ; All events begin with urn
 . S EVENTSCOMPLETE=1
 . S EVENT="urn"
 . S COMPLETE=0
 . F TOTAL=1:1 S EVENT=$O(^VPRSTATUS(PID,SOURCE,DOMAIN,EVENT)) Q:EVENT=""  D
 . . I EVENT="stampTime" Q
 . . ; Flag if all events are complete within a domain
 . . S EVENTSTORED=0
 . . ;
 . . ; Get the event stampTime
 . . ; A is the first character after numerics so we can run the $O backwards
 . . S EVENTSTAMP="A"
 . . S EVENTSTAMP=$O(^VPRSTATUS(PID,SOURCE,DOMAIN,EVENT,EVENTSTAMP),-1)
 . . ;
 . . ; Get the stored flag
 . . I $G(^VPRSTATUS(PID,SOURCE,DOMAIN,EVENT,EVENTSTAMP,"stored")) S EVENTSTORED=1
 . . E  S EVENTSCOMPLETE=0
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
 . . ; All clauses are wrapped in an implicit AND
 . . I DETAILED,$D(CLAUSES),'$$EVALAND^VPRJGQF(.CLAUSES,$NA(EVENTARRAY)) Q
 . . ;
 . . ; If detailed flag pased return all events in object
 . . I DETAILED S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"eventMetaStamp",EVENT,"stampTime")=EVENTSTAMP
 . . ;
 . . I DETAILED,EVENTSTORED S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"eventMetaStamp",EVENT,"stored")="true"
 . ; TOTAL will be one extra from the loop before it quits at end of data
 . S TOTAL=TOTAL-1
 . ; Filters for domain data when not in detailed mode
 . K DOMAINARRAY
 . S DOMAINARRAY("domain")=DOMAIN
 . S DOMAINARRAY("eventCount")=TOTAL
 . S DOMAINARRAY("stampTime")=DOMAINSTAMP
 . S DOMAINARRAY("storedCount")=COMPLETE
 . I EVENTSCOMPLETE S DOMAINARRAY("syncCompleted")="true"
 . ; All clauses are wrapped in an implicit AND
 . I 'DETAILED,$D(CLAUSES),'$$EVALAND^VPRJGQF(.CLAUSES,$NA(DOMAINARRAY)) Q
 . ;
 . ; Set the stored flag if all of the events are complete and DOMAINSTAMP isn't null
 . I EVENTSCOMPLETE,DOMAINSTAMP'="" D
 . . S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"syncCompleted")="true"
 . . S DOMAINSTORED=1
 . E  D
 . . S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"syncCompleted")="false"
 . . S DOMAINCOMPLETE=0
 . ;
 . ; If domainstamp is null set the domain stampTime to the latest event stamp
 . I DOMAINSTAMP="",EVENTSTAMP>DOMAINSTAMP D
 . . S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"stampTime")=EVENTSTAMP
 . E  S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"stampTime")=DOMAINSTAMP
 . ;
 . S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"domain")=DOMAIN
 . ;
 . ; Add event counts to output
 . S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"eventCount")=TOTAL
 . S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"storedCount")=COMPLETE
 ; Set the complete flag if all of the domains were complete
 I $G(DOMAINCOMPLETE) S @BUILD@("sourceMetaStamp",SSOURCE,"syncCompleted")="true" M @RESULT@("completedStamp")=@BUILD
 E  M @RESULT@("inProgress")=@BUILD
 K @BUILD
 Q
 ;
CLEAR(RESULT,ARGS) ; Delete all sync status data
 K ^VPRSTATUS
 Q
DELSS(PID) ; Delete a patient's sync status
 K ^VPRSTATUS(PID)
 Q
DELSITE(SITE) ; Delete a site's sync status
 N PID
 S PID=SITE
 F  S PID=$O(^VPRPT(PID)) Q:PID=""!($P(PID,";")'=SITE)  D
 . K ^VPRSTATUS(PID)
 Q
STORERECORD(RESULT,BODY)
 ; Testing endpoint
 N OBJECT,ERR,PID,SOURCE,DOMAIN,UID,EVENTSTAMP
 D DECODE^VPRJSON("BODY","OBJECT","ERR")
 S PID=$G(OBJECT("pid"))
 S SOURCE=$G(OBJECT("source"))
 S UID=$G(OBJECT("uid"))
 S DOMAIN=$G(OBJECT("domain"))
 S EVENTSTAMP=$G(OBJECT("eventStamp"))
 I $D(^VPRSTATUS(PID,SOURCE,DOMAIN,UID,EVENTSTAMP)) S ^VPRSTATUS(PID,SOURCE,DOMAIN,UID,EVENTSTAMP,"stored")="1"
 Q ""
 ;

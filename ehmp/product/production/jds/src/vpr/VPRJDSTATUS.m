VPRJDSTATUS ;KRM/CJE -- Handle Operational Data Sync Status operations ; 10/20/2015
 ; No entry from top
 Q
 ;
SET(ARGS,BODY) ; Store operational data metastamp from a source
 N OBJECT,ERR,JID,JPID,JPID2,ICN,PID,SOURCE,SSOURCE,DOMAIN,DOMAINSTAMP,ITEM,ITEMSTAMP,I,J,K,PREVSTAMP,OLDOBJ
 S OBJECT=$NA(^||TMP($J,"metastamp"))
 K:$D(@OBJECT) @OBJECT
 D DECODE^VPRJSON("BODY",OBJECT,"ERR") ; Decode JSON to OBJECT array
 ; Get the source site hash (only one allowed per post)
 S SOURCE=""
 S SOURCE=$O(@OBJECT@("sourceMetaStamp",SOURCE))
  ; No source found. Quit with error
 I SOURCE="""" D SETERROR^VPRJRER(227) K:$D(@OBJECT) @OBJECT Q ""
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
 . ; Ensure item stampTimes is valid
 . S ITEM=""
 . F  S ITEM=$O(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"itemMetaStamp",ITEM)) Q:ITEM=""  Q:ERR  D
 . . S ITEMSTAMP=$G(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"itemMetaStamp",ITEM,"stampTime"))
 . . I '$$ISSTMPTM^VPRSTMP(ITEMSTAMP) D SETERROR^VPRJRER(228,"Invalid item "_ITEM_" stampTime passed: "_ITEMSTAMP) S ERR=1 Q
 I ERR Q ""
 ;
 ; Everything is ok, store the metastamp
 ; Store metastamp
 ; Metastamp has to be updated in a critical section.
 ; Use locking to ensure no one else is modifying the metastamp when a new one is stored
 ;
 ; ** Begin Critical Section **
 L +^VPRSTATUSOD(SSOURCE):$G(^VPRCONFIG("timeout"),5) E  D SETERROR^VPRJRER(502) K:$D(@OBJECT) @OBJECT Q ""
 ; Set sourcestamp
 S ^VPRSTATUSOD(SSOURCE,"stampTime")=SOURCESTAMP
 ; foreach domain
 S DOMAIN=""
 F  S DOMAIN=$O(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN)) Q:DOMAIN=""  D
 . ; Skip non-domain subscripts
 . I DOMAIN="stampTime" Q
 . ;
 . ; Store the domain stampTime
 . S DOMAINSTAMP=$G(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"stampTime"))
 . ; We are guaranteed that DOMAINSTAMP exists and is valid since we checked it already
 . S ^VPRSTATUSOD(SSOURCE,DOMAIN,DOMAINSTAMP)=""
 . ;
 . ; foreach item
 . S ITEM=""
 . F  S ITEM=$O(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"itemMetaStamp",ITEM)) Q:ITEM=""  D
 . . ; Store the item stampTime
 . . ; We are guaranteed that the ITEMSTAMP exists and is valid since we checked it already
 . . S ITEMSTAMP=$G(@OBJECT@("sourceMetaStamp",SOURCE,"domainMetaStamp",DOMAIN,"itemMetaStamp",ITEM,"stampTime"))
 . . S ^VPRSTATUSOD(SSOURCE,DOMAIN,ITEM,ITEMSTAMP)=""
 . . ; check to see if the old data was stored
 . . I $G(^VPRSTATUSOD(SSOURCE,DOMAIN,ITEM,ITEMSTAMP,"stored"))=1 S ^VPRSTATUSOD(SSOURCE,DOMAIN,ITEM,ITEMSTAMP,"stored")=1
  L -^VPRSTATUSOD(SSOURCE)
 ; ** End of Critical Section **
 ;
 K:$D(@OBJECT) @OBJECT
 Q ""
 ;
GET(RETURN,ARGS) ; Return operational data sync status based on metastamps
 N RESULT,BUILD,OBJECT,ERR,SOURCE,DOMAIN,DOMAINSTAMP,ITEM,ITEMSTAMP,FILTER,CLAUSES
 N ID,DOMAINCOMPLETE,DOMAINSTORED,ITEMSCOMPLETE,ITEMSTORED,DETAILED
 S RESULT=$NA(^||TMP($J,"RESULT"))
 K:$D(@RESULT) @RESULT
 ; Ensure we don't have any unknown parameters
 I $$UNKARGS^VPRJCU(.ARGS,"id,detailed,filter") Q
 ; Set detailed flag if passed
 S:$G(ARGS("detailed"))="true" DETAILED=1
 S DETAILED=$G(DETAILED)
 ; Get any filters and parse them into CLAUSES
 S FILTER=$G(ARGS("filter"))
 I $L(FILTER) D PARSE^VPRJCF(FILTER,.CLAUSES) Q:$G(HTTPERR)
 ; If there are no sync statuses on file quit
 I $D(^VPRSTATUSOD)=0 D SETERROR^VPRJRER(229) Q
 I $G(ARGS("id"))="" D SETERROR^VPRJRER(241) Q
 ;
 D DATA(RESULT,ARGS("id"),DETAILED,.CLAUSES)
 S RETURN=$NA(^||TMP($J,"RETURN"))
 K:$D(@RETURN) @RETURN ; Clear the output global array, avoid subtle bugs
 D ENCODE^VPRJSON(RESULT,RETURN,"ERR") ; From an array to JSON
 K:$D(@RESULT) @RESULT
 I $D(ERR) D SETERROR^VPRJRER(202) Q
 Q
 ;
DATA(RESULT,ID,DETAILED,CLAUSES) ; GET Operational Data Sync Status algorithm
 N SOURCE,SSOURCE,DOMAINCOMPLETE,BUILD,DOMAIN,DOMAINSTAMP,ITEMSCOMPLETE,ITEM
 N ITEMSTORED,ITEMSTAMP,COMPLETE,TOTAL,DOMAINARRAY,ITEMARRAY
 ; Ensure Detailed flag exists
 S DETAILED=$G(DETAILED)
 ; Quit if ID doesn't exist
 I '$L(ID) Q
 S SOURCE=ID
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
 I '$G(^VPRSTATUSOD(SOURCE,"stampTime")) Q
 ; Set BUILD up to use as a target for indirection
 S BUILD=$NA(^||TMP($J,"RESULT","BUILD"))
 K:$D(@BUILD) @BUILD
 ;
 ; sourceMetaStamp object
 S @BUILD@("sourceMetaStamp",SSOURCE,"stampTime")=$G(^VPRSTATUSOD(SOURCE,"stampTime"))
 ;
 ; domainMetaStamp object
 ; foreach domain
 S DOMAIN=""
 ;
 F  S DOMAIN=$O(^VPRSTATUSOD(SOURCE,DOMAIN)) Q:DOMAIN=""  D
 . ; skip non domain subscripts
 . I DOMAIN="stampTime"!(DOMAIN="syncCompleteAsOf") Q
 . ;
 . ; Set the domain stampTime
 . ; A is the first character after numerics so we can run the $O backwards
 . S DOMAINSTAMP="A"
 . S DOMAINSTAMP=$O(^VPRSTATUSOD(SOURCE,DOMAIN,DOMAINSTAMP),-1)
 . ;
 . ; Flag if all domains are complete
 . ; If a domainstamp doesn't exist domain can never be complete
 . I DOMAINSTAMP="" S DOMAINCOMPLETE=0
 . E   I $G(DOMAINCOMPLETE)'=0 S DOMAINCOMPLETE=1
 . S DOMAINSTORED=0
 . ;
 . ; itemMetaStamp object
 . ; All items begin with urn
 . S ITEMSCOMPLETE=1
 . S ITEM="urn"
 . S COMPLETE=0
 . F TOTAL=1:1 S ITEM=$O(^VPRSTATUSOD(SOURCE,DOMAIN,ITEM)) Q:ITEM=""  D
 . . I ITEM="stampTime" Q
 . . ; Flag if all items are complete within a domain
 . . S ITEMSTORED=0
 . . ;
 . . ; Get the item stampTime
 . . ; A is the first character after numerics so we can run the $O backwards
 . . S ITEMSTAMP="A"
 . . S ITEMSTAMP=$O(^VPRSTATUSOD(SOURCE,DOMAIN,ITEM,ITEMSTAMP),-1)
 . . ;
 . . ; Get the stored flag
 . . I $G(^VPRSTATUSOD(SOURCE,DOMAIN,ITEM,ITEMSTAMP,"stored")) S ITEMSTORED=1
 . . E  S ITEMSCOMPLETE=0
 . . ;
 . . I ITEMSTORED S COMPLETE=COMPLETE+1
 . . ;
 . . ; Filters for item data when in detailed mode
 . . K ITEMARRAY
 . . S ITEMARRAY("domain")=DOMAIN
 . . ; uid and item are the same filter
 . . S ITEMARRAY("uid")=ITEM,ITEMARRAY("item")=ITEM
 . . S ITEMARRAY("stampTime")=ITEMSTAMP
 . . I ITEMSTORED S ITEMARRAY("stored")="true"
 . . ; All clauses are wrapped in an implicit AND
 . . I DETAILED,$D(CLAUSES),'$$EVALAND^VPRJGQF(.CLAUSES,$NA(ITEMARRAY)) Q
 . . ;
 . . ; If detailed flag passed return all items in object
 . . I DETAILED S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"itemMetaStamp",ITEM,"stampTime")=ITEMSTAMP
 . . ;
 . . I DETAILED,ITEMSTORED S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"itemMetaStamp",ITEM,"stored")="true"
 . ;
 . ; Set the flags to control syncCompleted for the domain and inProgress/completedStamp for the entire site
 . I ITEMSCOMPLETE,DOMAINSTAMP'="" D
 . . ; domain is complete
 . . S DOMAINSTORED=1
 . E  D
 . . ; set entire site inProgress - domain is not complete
 . . S DOMAINCOMPLETE=0
 . ;
 . ; TOTAL will be one extra from the loop before it quits at end of data
 . S TOTAL=TOTAL-1
 . ; Filters for domain data when not in detailed mode
 . K DOMAINARRAY
 . S DOMAINARRAY("domain")=DOMAIN
 . S DOMAINARRAY("itemCount")=TOTAL
 . S DOMAINARRAY("stampTime")=DOMAINSTAMP
 . S DOMAINARRAY("storedCount")=COMPLETE
 . I ITEMSCOMPLETE S DOMAINARRAY("syncCompleted")="true"
 . ; All clauses are wrapped in an implicit AND
 . I $D(CLAUSES),'$$EVALAND^VPRJGQF(.CLAUSES,$NA(DOMAINARRAY)) Q
 . ;
 . ; If we pass the filter add the syncCompleted for the domain
 . S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"syncCompleted")=$S(DOMAINSTORED:"true",1:"false")
  . ;
 . ; If domainstamp is null set the domain stampTime to the latest item stamp
 . I DOMAINSTAMP="",ITEMSTAMP>DOMAINSTAMP D
 . . S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"stampTime")=ITEMSTAMP
 . E  S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"stampTime")=DOMAINSTAMP
 . ;
 . S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"domain")=DOMAIN
 . ;
 . ; Add item counts to output
 . S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"itemCount")=TOTAL
 . S @BUILD@("sourceMetaStamp",SSOURCE,"domainMetaStamp",DOMAIN,"storedCount")=COMPLETE
 ; Set the complete flag if all of the domains were complete
 I $G(DOMAINCOMPLETE) D
 . S @BUILD@("sourceMetaStamp",SSOURCE,"syncCompleted")="true"
 . S ^VPRSTATUSOD(SOURCE,"syncCompleteAsOf")=$$CURRTIME^VPRJRUT
 . S @BUILD@("sourceMetaStamp",SSOURCE,"syncCompleteAsOf")=$G(^VPRSTATUSOD(SOURCE,"syncCompleteAsOf"))
 . M @RESULT@("completedStamp")=@BUILD
 E  D
 . S:$G(^VPRSTATUSOD(SOURCE,"syncCompleteAsOf"))'="" @BUILD@("sourceMetaStamp",SSOURCE,"syncCompleteAsOf")=$G(^VPRSTATUSOD(SOURCE,"syncCompleteAsOf"))
 . M @RESULT@("inProgress")=@BUILD
 K:$D(@BUILD) @BUILD
 QUIT
 ;
DEL(RESULT,ARGS) ; Delete all sync status data
 ; If we are passed an id only kill that site's sync status
 I $G(ARGS("id"))'="" K:$D(^VPRSTATUSOD(ARGS("id"))) ^VPRSTATUSOD(ARGS("id")) Q
 ; If no id passed kill the whole thing
 I $G(ARGS("id"))="" K:$D(^VPRSTATUSOD) ^VPRSTATUSOD
 Q
 ;
STORERECORD(RESULT,BODY)
 ; Testing endpoint
 N OBJECT,ERR,SOURCE,DOMAIN,UID,ITEMSTAMP
 D DECODE^VPRJSON("BODY","OBJECT","ERR")
 S SOURCE=$G(OBJECT("source"))
 S UID=$G(OBJECT("uid"))
 S DOMAIN=$G(OBJECT("domain"))
 S ITEMSTAMP=$G(OBJECT("itemStamp"))
 I $D(^VPRSTATUSOD(SOURCE,DOMAIN,UID,ITEMSTAMP)) S ^VPRSTATUSOD(SOURCE,DOMAIN,UID,ITEMSTAMP,"stored")="1"
 Q ""
 ;

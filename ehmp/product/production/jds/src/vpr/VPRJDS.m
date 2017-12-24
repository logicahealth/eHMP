VPRJDS ;SLC/KCM -- Save JSON objects
 ;
SAVE(JSON) ; Save a JSON encoded object
 N UID,COLL,KEY,OBJECT,OLDOBJ,VPRJERR,INDEXER,TLTARY,STAMP,OLDSTAMP,SOURCESTAMP,SOURCE,DOMAIN
 ;
 ; decode JSON into object and extract required fields
 D DECODE^VPRJSON("JSON","OBJECT","VPRJERR")
 I $L($G(VPRJERR)) D SETERROR^VPRJRER(202,VPRJERR) QUIT ""
 S UID=$G(OBJECT("uid")) I '$L(UID) D SETERROR^VPRJRER(207) QUIT ""
 ; stampTime is a required field
 S STAMP=$G(OBJECT("stampTime")) I '$$ISSTMPTM^VPRSTMP(STAMP) D SETERROR^VPRJRER(221,"Invalid stampTime passed: "_STAMP) QUIT ""
 ;
 ; Parse out the collection, and key from the UID
 ; Currently assuming UID is urn:va:type:vistaAccount...
 ; For example:  urn:va:fresh:93EF
 N COLL S COLL=$P(UID,":",3)
 I '$L(COLL) D SETERROR^VPRJRER(210,UID) QUIT ""
 ;
 ; kill the old indexes and object
 ; Get the old(er) object
 S OLDSTAMP=""
 S OLDSTAMP=$O(^VPRJD(UID,""),-1)
 ; Get the old object if STAMP is equal or greater than OLDSTAMP
 I OLDSTAMP'="",STAMP'<OLDSTAMP S OLDOBJ="" M OLDOBJ=^VPRJD(UID,OLDSTAMP)
 ; Rebuild template if STAMP is equal or greater than OLDSTAMP
 I STAMP'<OLDSTAMP D BLDTLT^VPRJCT1(COLL,.OBJECT,.TLTARY) Q:$G(HTTPERR) ""
 ;
 ; ** Begin Critical Section - data update **
 L +^VPRJD(UID):$G(^VPRCONFIG("timeout","odstore"),5) E  D SETERROR^VPRJRER(502,"Unable to obtain lock for "_UID) Q
 ;
 K:$D(^VPRJD(UID,STAMP)) ^VPRJD(UID,STAMP)
 K:$D(^VPRJDJ("JSON",UID,STAMP)) ^VPRJDJ("JSON",UID,STAMP)
 ;
 M ^VPRJDJ("JSON",UID,STAMP)=JSON
 ; Merge template array if STAMP is equal or greater than OLDSTAMP
 I STAMP'<OLDSTAMP M ^VPRJDJ("TEMPLATE",UID)=TLTARY
 M ^VPRJD(UID,STAMP)=OBJECT
 ; Set stored flags
 ; UID format: urn:va:{domain}:{siteHash}:{local identifier}
 S SOURCE=$P(UID,":",4)
 S SOURCESTAMP=""
 S DOMAIN=COLL
 ; Operational Data Sync Status global structure:
 ; ^VPRSTATUSOD(SOURCE,SOURCESTAMP,DOMAIN,ITEM,ITEMSTAMP)
 ; ** Begin Critical Section - metastamp update **
 L +^VPRSTATUSOD(SOURCE,DOMAIN,UID,STAMP):$G(^VPRCONFIG("timeout","odstore"),5) E  D SETERROR^VPRJRER(502) Q
 S ^VPRSTATUSOD(SOURCE,DOMAIN,UID,STAMP,"stored")="1"
 L -^VPRSTATUSOD(SOURCE,DOMAIN,UID,STAMP)
 ; ** End Critical Section - metastamp update **
 ;
 ; If we have an OLDSTAMP, but no OLDOBJ it means that
 ; the object on file was newer than the object currently
 ; stored and we shouldn't update any indexes
 I '((OLDSTAMP'="")&($D(OLDOBJ)=0)) D INDEX^VPRJDX(UID,.OLDOBJ,.OBJECT)
 ;
 L -^VPRJD(UID)
 ; ** Begin Critical Section - data update **
 ;
 Q $$URLENC^VPRJRUT(UID)  ; no errors
 ;
DELETE(KEY) ; Delete an object given its UID
 N OLDOBJ,OBJECT,COLL,STAMP
 S COLL=$P(KEY,":",3)
 I '$L(COLL) D SETERROR^VPRJRER(210,KEY) QUIT ""
 ;
 L +^VPRJD(KEY):$G(^VPRCONFIG("timeout","oddelete"),5) E  D SETERROR^VPRJRER(502) QUIT ""
 ; kill the old indexes and object
 S OBJECT=""
 S STAMP=""
 S STAMP=$O(^VPRJD(KEY,STAMP),-1)
 S OLDOBJ="" I STAMP'="" M OLDOBJ=^VPRJD(KEY,STAMP)
 ; Kill all versions of this object
 TSTART
 K:$D(^VPRJD(KEY)) ^VPRJD(KEY)
 K:$D(^VPRJDJ("JSON",KEY)) ^VPRJDJ("JSON",KEY)
 K:$D(^VPRJDJ("TEMPLATE",KEY)) ^VPRJDJ("TEMPLATE",KEY)
 D INDEX^VPRJDX(KEY,.OLDOBJ,.OBJECT)
 TCOMMIT
 L -^VPRJD(KEY)
 Q
DELCTN(COLL,SYSID) ; Delete a collection given its name
 I '$L(COLL) D SETERROR^VPRJRER(215) QUIT ""
 N ROOT,LROOT,UID
 S ROOT="urn:va:"_COLL_":"
 I $L($G(SYSID)) S ROOT=ROOT_SYSID_":"
 S LROOT=$L(ROOT)
 S UID=ROOT F  S UID=$O(^VPRJD(UID)) Q:$E(UID,1,LROOT)'=ROOT  D DELETE(UID)
 Q
DELSITE(SITE) ; Delete an entire site
 I '$L(SITE) D SETERROR^VPRJRER(208) QUIT
 N UID,ARGS
 S UID=""
 F  S UID=$O(^VPRJD(UID)) Q:UID=""  D
 . Q:$P(UID,":",4)'=SITE
 . D DELETE(UID) ; Delete each object for our given site
 S ARGS("id")=SITE
 D DEL^VPRJDSTATUS(.RESULT,.ARGS) ; Delete operational data status per site
 Q

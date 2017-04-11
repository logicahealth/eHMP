VPRSTATUS ;KRM/CJE -- Handle Sync Status operations
 ; No entry from top
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
 N OBJECT,ERR,PID,SOURCE,SOURCESTAMP,DOMAIN,UID,EVENTSTAMP,K
 D DECODE^VPRJSON("BODY","OBJECT","ERR")
 S PID=$G(OBJECT("pid"))
 S SOURCE=$G(OBJECT("source"))
 S UID=$G(OBJECT("uid"))
 S DOMAIN=$G(OBJECT("domain"))
 S EVENTSTAMP=$G(OBJECT("eventStamp"))
 S SOURCESTAMP=""
 I $D(^VPRSTATUS(PID,SOURCE,DOMAIN,UID,EVENTSTAMP)) S ^VPRSTATUS(PID,SOURCE,DOMAIN,UID,EVENTSTAMP,"stored")="1"
 Q ""
 ;
 ; Operational data sync status
 ;
DELOD(RESULT,ARGS) ; Delete all sync status data
 ; If we are passed an id only kill that site's sync status
 I $G(ARGS("id"))'="" K ^VPRSTATUSOD(ARGS("id")) Q
 ; If no id passed kill the whole thing
 I $G(ARGS("id"))="" K ^VPRSTATUSOD
 Q
STORERECORDOD(RESULT,BODY)
 ; Testing endpoint
 N OBJECT,ERR,SOURCE,SOURCESTAMP,DOMAIN,UID,ITEMSTAMP,K
 D DECODE^VPRJSON("BODY","OBJECT","ERR")
 S SOURCE=$G(OBJECT("source"))
 S UID=$G(OBJECT("uid"))
 S DOMAIN=$G(OBJECT("domain"))
 S ITEMSTAMP=$G(OBJECT("itemStamp"))
 S SOURCESTAMP=""
 F K=1:1 S SOURCESTAMP=$O(^VPRSTATUSOD(SOURCE,SOURCESTAMP)) Q:SOURCESTAMP=""  D
 . I $D(^VPRSTATUSOD(SOURCE,SOURCESTAMP,DOMAIN,UID,ITEMSTAMP)) S ^VPRSTATUSOD(SOURCE,SOURCESTAMP,DOMAIN,UID,ITEMSTAMP,"stored")="1"
 Q ""

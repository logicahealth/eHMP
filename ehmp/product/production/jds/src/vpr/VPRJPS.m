VPRJPS ;SLC/KCM -- Save / Retrieve Patient-Related JSON objects
 ;
SAVE(JPID,JSON) ; Save a JSON encoded object
 N UID,COLL,KEY,OBJECT,OLDOBJ,VPRJERR,INDEXER,TLTARY,METASTAMP,PID,SOURCESTAMP,OLDSTAMP,STATUS,SOURCE,DOMAIN,LASTTIME
 ;
 I $G(JSON("ewdjs"),0)=1 D
 . N SJSON
 . ; Save JSON for storage in ^VPRPTJ("JSON"), since JSON contains the M object in ewdjs mode
 . M SJSON=JSON("ewdjs","JSON")
 . K JSON("ewdjs")
 . M OBJECT=JSON
 . K JSON
 . M JSON=SJSON
 E  D  I $D(VPRJERR) D SETERROR^VPRJRER(202) Q ""
 . K JSON("ewdjs")
 . ; decode JSON into object and extract required fields
 . D DECODE^VPRJSON("JSON","OBJECT","VPRJERR")
 I $L($G(VPRJERR)) D SETERROR^VPRJRER(202,VPRJERR) QUIT ""
 S UID=$G(OBJECT("uid"))
 ; If the uid >100 characters the JSON decoder will put it
 ; into an extension node. We'll manually set the UID to
 ; the vaule in the first extension node and force the
 ; object UID to be that value
 I '$L(UID) D
 . S UID=$G(OBJECT("uid","\",1))
 . S OBJECT("uid")=UID
 ; Still no UID defined? QUIT
 I '$L(UID) D SETERROR^VPRJRER(207) QUIT ""
 ;
 ; Parse out the collection, and key from the UID
 ; Currently assuming UID is urn:va:type:vistaAccount:localId...
 ; For example:  urn:va:med:93EF:34014
 N COLL S COLL=$P(UID,":",3)
 I '$L(COLL) D SETERROR^VPRJRER(210,UID) QUIT ""
 ;
 ; Pre-actions for collections go here
 ; Next statement is special processing when patient demographics are updated
 ;   (DEMOG is defined if UPDPT has been called already)
 I COLL="patient",'$D(DEMOG) S JPID=$$UPDPT^VPRJPR(.OBJECT,JPID) Q:'$L(JPID) ""
 ;
 ; Get the PID from the object. Always store with the PID of the given object.
 ; PID is required
 S PID=$G(OBJECT("pid")) I '$L(PID) D SETERROR^VPRJRER(226) QUIT ""
 ; Ensure there is a JPID mapping for the PID
 I '$D(^VPRPTJ("JPID",PID)) D SETERROR^VPRJRER(224) QUIT ""
 ; Ensure the stampTime exists and is valid
 S METASTAMP=$G(OBJECT("stampTime")) I '$$ISSTMPTM^VPRSTMP(METASTAMP) D SETERROR^VPRJRER(221,"Invalid stampTime passed: "_METASTAMP) QUIT ""
 ; kill the old indexes and object
 S OLDSTAMP=""
 S OLDSTAMP=$O(^VPRPT(JPID,PID,UID,""),-1)
 ; Get the old object if METASTAMP is equal or greater than OLDSTAMP
 I OLDSTAMP'="",METASTAMP'<OLDSTAMP S OLDOBJ="" M OLDOBJ=^VPRPT(JPID,PID,UID,OLDSTAMP)
 ; Rebuild template if METASTAMP is equal or greater than OLDSTAMP
 I METASTAMP'<OLDSTAMP D BLDTLT^VPRJCT1(COLL,.OBJECT,.TLTARY) Q:$G(HTTPERR) ""
 K ^VPRPT(JPID,PID,UID,METASTAMP)
 K ^VPRPTJ("JSON",JPID,PID,UID,METASTAMP)
 ;
 S ^VPRPTJ("KEY",UID,PID,METASTAMP)=""
 M ^VPRPTJ("JSON",JPID,PID,UID,METASTAMP)=JSON
 ; Merge template array if METASTAMP is equal or greater than OLDSTAMP
 I METASTAMP'<OLDSTAMP M ^VPRPTJ("TEMPLATE",JPID,PID,UID)=TLTARY
 M ^VPRPT(JPID,PID,UID,METASTAMP)=OBJECT
 ; Set stored flags
 S SOURCE=$P(PID,";",1)
 S SOURCESTAMP=""
 S DOMAIN=COLL
 ;
 ; ** Begin Critical Section **
 L +^VPRSTATUS(JPID,PID,SOURCE,DOMAIN,UID,METASTAMP):$G(^VPRCONFIG("timeout","ptstore"),5) E  D SETERROR^VPRJRER(502,"PID,SOURCE,SOURCESTAMP,DOMAIN,UID,METASTAMP "_$G(PID)_","_$G(SOURCE)_","_$G(SOURCESTAMP)_","_$G(DOMAIN)_","_$G(UID)_","_$G(METASTAMP)) Q
 S ^VPRSTATUS(JPID,PID,SOURCE,DOMAIN,UID,METASTAMP,"stored")="1"
 K ^VPRSTATUS(JPID,PID,SOURCE,DOMAIN,UID,METASTAMP,"syncError")
 L -^VPRSTATUS(JPID,PID,SOURCE,DOMAIN,UID,METASTAMP)
 ; ** End Critical Section **
 ;
 ; If we have an OLDSTAMP, but no OLDOBJ it means that
 ; the object on file was newer than the object currently
 ; stored and we shouldn't update any indexes
 I '((OLDSTAMP'="")&($D(OLDOBJ)=0)) D INDEX^VPRJPX(PID,UID,.OLDOBJ,.OBJECT)
 ;
 ; Set time this patient has been accessed for filtering
 S LASTTIME=$$CURRTIME^VPRJRUT
 S ^VPRMETA("JPID",JPID,"lastAccessTime")=LASTTIME
 ; End store using metastamps
 S ^VPRPTI(JPID,PID,"every","every")=$H  ; timestamps latest update for this PID
 ;
 Q $$URLENC^VPRJRUT(UID)  ; no errors
 ;
DELETE(PID,KEY,SITEDEL) ; Delete an object given its UID
 ; Setting the SITEDEL flag means we are deleting a site, so it
 ; is okay to delete just a patient UID, and not the whole patient
 N OLDOBJ,OBJECT,COLL,STAMP,JPID,LASTTIME
 S COLL=$P(KEY,":",3)
 I '$L(COLL) D SETERROR^VPRJRER(210,KEY) QUIT
 ; must delete entire patient instead, if the SITEDEL flag is not set
 I '$G(SITEDEL,0),COLL="patient" D SETERROR^VPRJRER(213,KEY) QUIT
 ;
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(222,"Identifier "_PID) QUIT
 ;
 L +^VPRPT(JPID,PID,KEY):$G(^VPRCONFIG("timeout","ptdelete"),5) E  D SETERROR^VPRJRER(502) QUIT
 ; kill the old indexes and object
 S OBJECT=""
 S STAMP=""
 S STAMP=$O(^VPRPT(JPID,PID,KEY,STAMP),-1)
 S OLDOBJ="" M OLDOBJ=^VPRPT(JPID,PID,KEY,STAMP)
 TSTART
 K ^VPRPT(JPID,PID,KEY)
 K ^VPRPTJ("KEY",KEY,PID)
 K ^VPRPTJ("JSON",JPID,PID,KEY)
 K ^VPRPTJ("TEMPLATE",JPID,PID,KEY)
 D INDEX^VPRJPX(PID,KEY,.OLDOBJ,.OBJECT)
 TCOMMIT
 L -^VPRPT(JPID,PID,KEY)
 ;
 ; Set time this patient has been accessed for filtering
 I JPID'="",$$ISJPID^VPRJPR(JPID) D
 . S LASTTIME=$$CURRTIME^VPRJRUT
 . S ^VPRMETA("JPID",JPID,"lastAccessTime")=LASTTIME
 ;
 S ^VPRPTI(JPID,PID,"every","every")=$H ; timestamps latest update for the PID
 Q
DELCLTN(PID,CLTN,SYSID) ; Delete a collection for a patient
 I '$L(CLTN) D SETERROR^VPRJRER(215) QUIT
 N ROOT,LROOT,UID,JPID
 S ROOT="urn:va:"_CLTN_":"
 I $L($G(SYSID)) S ROOT=ROOT_SYSID_":"
 S LROOT=$L(ROOT)
 ;
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(222,"Identifier "_PID) QUIT
 ;
 L +^VPRPT(JPID,PID,ROOT):$G(^VPRCONFIG("timeout","ptdelete"),5) E  D SETERROR^VPRJRER(502) QUIT
 S UID=ROOT F  S UID=$O(^VPRPT(JPID,PID,UID)) Q:$E(UID,1,LROOT)'=ROOT  D DELETE(PID,UID)
 L -^VPRPT(JPID,PID,ROOT)
 Q
DELSITE(SITE) ; Delete a site's patient data
 I '$L(SITE) D SETERROR^VPRJRER(208) Q
 ;
 N PID,JPID,UID,PIDS,HASH,KEY,ID,ICN
 D DELSITE^VPRJPSTATUS(SITE) ; Delete sync status for site
 S JPID=""
 F  S JPID=$O(^VPRPT(JPID)) Q:JPID=""  D
 . S PID=SITE ; Speed up the $O, since a PID starts with the site
 . F  S PID=$O(^VPRPT(JPID,PID)) Q:PID=""!($P(PID,";")'=SITE)  D
 . . S UID=""
 . . F  S UID=$O(^VPRPT(JPID,PID,UID)) Q:UID=""  D
 . . . D DELETE(PID,UID,1) ; Delete the patient UIDs (pass 1 to delete by site)
 . . ;
 . . S HASH="" ; Remove cached queries
 . . F  S HASH=$O(^VPRTMP("PID",PID,HASH)) Q:HASH=""  D
 . . . K ^VPRTMP(HASH)
 . . K ^VPRTMP("PID",PID)
 . . ;
 . . S KEY="" ; Remove the XREF for UIDs
 . . F  S KEY=$O(^VPRPT(JPID,PID,KEY)) Q:KEY=""  D
 . . . K ^VPRPTJ("KEY",KEY,PID)
 . . ;
 . . D CLRCODES^VPRJ2P(PID) ; Delete codes in VPRPTX
 . . D CLREVIEW^VPRJ2P(PID) ; Delete review dates in VPRPTX
 . . D CLRCOUNT^VPRJ2P(PID) ; Decrement the cross-patient totals for PID
 . . D CLRXIDX^VPRJ2P(PID) ; Remove cross-patient indexes for PID
 . . D DELSITE^VPRJOB(PID) ; Delete job status for site by PID
 . . ;
 . . D JPIDDIDX^VPRJPR(JPID,PID) ; Remove JPID indexes for PID
 . . D PID4JPID^VPRJPR(.PIDS,JPID)
 . . S ID=$O(PIDS(""),-1)
 . . I ID=1,$$ISICN^VPRJPR(PIDS(ID)) D  ; Down to ICN only
 . . . S ICN=PIDS(ID) ;
 . . . D JPIDDIDX^VPRJPR(JPID,ICN) ; Remove ICN and JPID if no more PIDs exist
 . ; Remove last time this patient has been accessed if deleting a site removed the last patient info
 . I $D(^VPRPTJ("JPID",JPID))=0 K ^VPRMETA("JPID",JPID)
 Q
CLEARPT(PID) ; -- Clear data for patient
 N PIDS,JPID,ID
 ; go through with cleanup even if PID not used
 N PIDUSED
 S PIDUSED=($D(^VPRPTJ("JPID",PID))>0)
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(222,"Identifier "_PID) QUIT
 ; Get the PIDS for a JPID
 I $$ISJPID^VPRJPR(JPID) D
 . D PID4JPID^VPRJPR(.PIDS,JPID)
 ; If we aren't a JPID delete the patient by PID
 E  D
 . S PIDS(1)=PID
 S PID=""
 S ID=""
 ; Loop through all PIDs associated with a JPID
 F  S ID=$O(PIDS(ID)) Q:ID=""  D
 . S PID=PIDS(ID)
 . L +^VPRPT(JPID,PID):$G(^VPRCONFIG("timeout","ptdelete"),5) E  D SETERROR^VPRJRER(502) QUIT
 . N HASH ; remove cached queries
 . S HASH="" F  S HASH=$O(^VPRTMP("PID",PID,HASH)) Q:HASH=""  K ^VPRTMP(HASH)
 . K ^VPRTMP("PID",PID)
 . ;
 . N KEY ; remove the xref for UID's
 . S KEY="" F  S KEY=$O(^VPRPT(JPID,PID,KEY)) Q:KEY=""  K ^VPRPTJ("KEY",KEY,PID)
 . ;
 . ;D CLRXIDX^VPRJ2P(PID)  ; clear indexes of type xattr
 . D CLRCODES^VPRJ2P(PID) ; clear codes in VPRPTX
 . D CLREVIEW^VPRJ2P(PID) ; clear review dates in VPRPTX
 . D CLRCOUNT^VPRJ2P(PID) ; decrement the cross patient counts
 . D DELSS^VPRJPSTATUS(PID) ; Clear Sync Status for PID
 . D DEL^VPRJOB(JPID) ; Clear Job Status for JPID
 . ;
 . K ^VPRPTI(JPID,PID)           ; kill all indexes for the patient at a particular site
 . K ^VPRPT(JPID,PID)            ; kill all the data for the patient at a particular site
 . K ^VPRPTJ("JSON",JPID,PID)    ; kill original JSON objects for the patient at a particular site
 . K ^VPRPTJ("TEMPLATE",JPID,PID) ; kill the pre-compiled JSON objects for the patient at a particular site
 . ; Remove JPID indexes
 . D JPIDDIDX^VPRJPR(JPID,PID)
 . L -^VPRPT(JPID,PID)
 ; Remove last time this patient has been accessed
 K ^VPRMETA("JPID",JPID,"lastAccessTime")
 Q

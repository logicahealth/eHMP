VPRJGC ;KRM/CJE -- Handle Garbage Collection operations
 ; No entry from top
 Q
 ;
SITE(RESULT,ARGS)
 Q
 ;
DATA(RESULT,ARGS)
 N SITE,SYNCSTATUS,OPDGCD
 ; Ensure only known arguments are passed
 I $$UNKARGS^VPRJCU(.ARGS,"site") Q
 ; Loop through sites if the site is blank
 S SITE=""
 ; If a site is passed quit the loop below when found
 S OPDGCD=0
 ; Order through the SyncStatus global for operational data as that
 ; is the only place where a list of sites is easily found
 F  S SITE=$O(^VPRSTATUSOD(SITE)) Q:SITE=""  Q:OPDGCD  D
 . ; If we were passed a site only GC for that site
 . I $G(ARGS("site")) I SITE'=ARGS("site") Q
 . ; If we have a site and the current site matches signal loop to quit next time
 . I $G(ARGS("site")) I SITE=ARGS("site") S OPDGCD=1
 . ; Get the sync status
 . ; This can't use process private globals (if available) as this is an explict
 . ; need for IPC (Inter-process communication)
 . S SYNCSTATUS=$NA(^TMP($J,"SYNCSTATUSO"))
 . D DATA^VPRJDSTATUS(SYNCSTATUS,SITE)
 . ; Collect the garbage
 . J GCDATA(SITE,SYNCSTATUS)
 Q
 ;
PAT(RESULT,ARGS)
 N ID,JPID,PID,PIDS,PTGCD,GCPID
 ; Ensure only known arguments are passed
 I $$UNKARGS^VPRJCU(.ARGS,"id") Q
 ; Loop through the PIDs if ID is blank
 S (JPID,PID)=""
 ; If a patient identifier is passed quit the loop below when found
 S PTGCD=0
 F  S JPID=$O(^VPRPTJ("JSON",JPID)) Q:JPID=""  Q:PTGCD  D
 . F  S PID=$O(^VPRPTJ("JSON",JPID,PID)) Q:PID=""  Q:PTGCD  D
 . . ; If we have a patient identifier and the current pid doesn't match quit
 . . I $G(ARGS("id")) I PID'=ARGS("id") Q
 . . ; If we have a patient identifier and the current pid matches signal loop to quit next time
 . . I $G(ARGS("id")) I PID=ARGS("id") S PTGCD=1
 . . ; Get all PIDs for JPID
 . . D PID4JPID^VPRJPR(.PIDS,JPID)
 . . ; Loop through all patient identifiers
 . . S ID=""
 . . F  S ID=$O(PIDS(ID)) Q:ID=""  D
 . . . S GCPID=PIDS(ID)
 . . . ; Get the sync status
 . . . ; This can't use process private globals (if available) as this is an explict
 . . . ; need for IPC (Inter-process communication)
 . . . N SYNCSTATUS S SYNCSTATUS=$NA(^TMP($J,"SYNCSTATUSP"))
 . . . D PATIENT^VPRJPSTATUS(SYNCSTATUS,GCPID)
 . . . ; Collect the garbage
 . . . J GCPAT(GCPID,SYNCSTATUS)
 Q
 ;
JOB(RESULT,ARGS)
 N JPID
 ; Ensure only known arguments are passed
 I $$UNKARGS^VPRJCU(.ARGS,"id") Q
 ;
 ; Set the JPID and run the garbage collector only on that JPID, if there is a PID passed
 I $G(ARGS("id")) D  Q
 . S JPID=$$JPID4PID^VPRJPR(ARGS("id"))
 . ; Collect the garbage
 . J GCJOB(JPID)
 ;
 ; Run job garbage collector for all patients
 S JPID=""
 F  S JPID=$O(^VPRJOB("D",JPID)) Q:JPID=""  D
 . ; Collect the garbage
 . J GCJOB(JPID)
 Q
 ;
GCDATA(SITE,STATUS)
 N UID,SOURCESTAMP
 ; Ensure SITE is defined
 I '$L(SITE) Q
 ;
 ; Don't continue if garbage collection is running
 I $G(^VPRJGC("DATA","RUNNING",SITE)) Q
 L +^VPRJGC("DATA","RUNNING",SITE):$G(^VPRCONFIG("timeout","gc"),5)
 E  S ^VPRLOG($I(^VPRLOG))="Unable to start data garbage collector for SITE: "_SITE Q
 S ^VPRJGC("DATA","RUNNING",SITE)=$J
 L -^VPRJGC("DATA","RUNNING",SITE)
 ;
 ; Loop through all collections
 S UID="urn:va:"
 F  S UID=$O(^VPRJD(UID)) Q:UID=""  D
 . ; Check to see if we only want to garbage collect for a given site
 . I $P(UID,":",4)'=SITE Q
 . ; Get current stamp
 . N STAMP,OLDSTAMP
 . S STAMP=$O(^VPRJD(UID,""),-1) Q:STAMP=""
 . ; If no metastamp exists don't garbage collect
 . I '$G(^VPRSTATUSOD(SITE,"stampTime")) Q
 . ; If the current metastamp isn't complete don't delete the previous versions of the object
 . I $G(@STATUS@("completedStamp","sourceMetaStamp",SITE,"syncCompleted"))'="true" Q
 . ; Set OLDSTAMP to current STAMP to see if there are older objects than the current
 . S OLDSTAMP=STAMP
 . F  S OLDSTAMP=$O(^VPRJD(UID,OLDSTAMP),-1) Q:OLDSTAMP=""  D
 . . ; Previous object versions found
 . . ; Delete previous version of object
 . . K ^VPRJD(UID,OLDSTAMP)
 . . ; Delete previous version of JSON string
 . . K ^VPRJDJ("JSON",UID,OLDSTAMP)
 K ^VPRJGC("DATA","RUNNING",SITE)
 Q
 ;
GCPAT(PID,STATUS,SITE)
 N UID,SOURCESTAMP,JPID
 ; Ensure PID is defined
 I '$L(PID) Q
 ;
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" Q
 ;
 ; Don't continue if garbage collection is running
 I $G(^VPRJGC("PATIENT","RUNNING",PID)) Q
 L +^VPRJGC("PATIENT","RUNNING",PID):$G(^VPRCONFIG("timeout","gc"),5)
 E  S ^VPRLOG($I(^VPRLOG))="Unable to start patient garbage collector for PID: "_PID Q
 S ^VPRJGC("PATIENT","RUNNING",PID)=$J
 L -^VPRJGC("PATIENT","RUNNING",PID)
 ;
 ; Loop through all collections
 S UID="urn:va:"
 F  S UID=$O(^VPRPT(JPID,PID,UID)) Q:UID=""  D
 . ; Check to see if we only want to garbage collect for a given site
 . I $G(SITE)'="",$P(UID,":",4)'=SITE Q
 . ; Get current stamp
 . N STAMP,OLDSTAMP
 . S STAMP=$O(^VPRPT(JPID,PID,UID,""),-1) Q:STAMP=""
 . ; Get the latest metastamp
 . S SOURCESTAMP=$O(^VPRSTATUS(JPID,PID,$P(PID,";",1),""),-1)
 . ; If no metastamp exists don't garbage collect
 . I '$G(^VPRSTATUS(JPID,PID,$P(PID,";",1),"stampTime")) Q
 . ; Is the current object part of a completed stamp
 . ; If it isn't complete don't delete the previous versions of the object
 . I $G(@STATUS@("completedStamp","sourceMetaStamp",$P(PID,";",1),"syncCompleted"))'="true" Q
 . ; Set OLDSTAMP to current STAMP to see if there are older objects than the current
 . S OLDSTAMP=STAMP
 . F  S OLDSTAMP=$O(^VPRPT(JPID,PID,UID,OLDSTAMP),-1) Q:OLDSTAMP=""  D
 . . ; Previous object versions found
 . . ; Delete previous version of object
 . . K ^VPRPT(JPID,PID,UID,OLDSTAMP)
 . . ; Delete previous version of JSON string
 . . K ^VPRPTJ("JSON",JPID,PID,UID,OLDSTAMP)
 . . ; Delete previous version of the KEY
 . . K ^VPRPTJ("KEY",UID,PID,OLDSTAMP)
 K ^VPRJGC("PATIENT","RUNNING",PID)
 Q
 ;
GCJOB(JPID)
 N JID,RJID,SC,STAMP,TJID,TRJID,TSC,TYPE
 ; Ensure JPID is defined
 I '$L(JPID) Q
 ;
 ; Don't continue if garbage collection is running
 I $G(^VPRJGC("JOB","RUNNING",JPID)) Q
 L +^VPRJGC("JOB","RUNNING",JPID):$G(^VPRCONFIG("timeout","gc"),5)
 E  S ^VPRLOG($I(^VPRLOG))="Unable to start job garbage collector for JPID: "_JPID Q
 S ^VPRJGC("JOB","RUNNING",JPID)=$J
 L -^VPRJGC("JOB","RUNNING",JPID)
 ;
 ; Loop through all job types via "D" index
 S TYPE=""
 F  S TYPE=$O(^VPRJOB("D",JPID,TYPE)) Q:TYPE=""  D
 . ; Get current stamp to use to reverse iterate over
 . S STAMP=$O(^VPRJOB("D",JPID,TYPE,""),-1) Q:STAMP=""
 . ; Save the RJID and JID of the latest stamp, to guard against removing C index entries that should still exist
 . S TSC=$O(^VPRJOB("D",JPID,TYPE,STAMP,""))
 . S TRJID=^VPRJOB(TSC,"rootJobId")
 . S TJID=^VPRJOB(TSC,"jobId")
 . ; Remove all stamps older than STAMP
 . F  S STAMP=$O(^VPRJOB("D",JPID,TYPE,STAMP),-1) Q:STAMP=""  D
 . . ; Get the job sequence counter
 . . S SC=$O(^VPRJOB("D",JPID,TYPE,STAMP,""))
 . . ; Get the job IDs for the A and C indexes
 . . S RJID=^VPRJOB(SC,"rootJobId")
 . . S JID=^VPRJOB(SC,"jobId")
 . . ; Kill the A index entry
 . . K ^VPRJOB("A",JPID,TYPE,RJID,JID,STAMP)
 . . ; Kill the B index entry
 . . K ^VPRJOB("B",SC)
 . . ; Test to see if the latest stamp has the same JID and RJID as the current one, to avoid removing the C index entry
 . . I RJID'=TRJID&(JID'=TJID) D
 . . . ; Kill the C index entry
 . . . K ^VPRJOB("C",JID,RJID)
 . . ; Kill the D index entry
 . . K ^VPRJOB("D",JPID,TYPE,STAMP)
 . . ; Kill the data
 . . K ^VPRJOB(SC)
 K ^VPRJGC("JOB","RUNNING",JPID)
 Q
 ;

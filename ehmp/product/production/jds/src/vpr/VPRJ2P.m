VPRJ2P ;SLC/KCM -- Management utilities for JSON patient objects
 ;
RIDX ; Re-index all patients, giving an option to re-index all indexes, or a list of possible indexes
 N YESNO
 R !,"Would you like to re-index every index? (Y/N - defaults to N): ",YESNO
 S YESNO=$TR(YESNO,"yesno","YESNO")
 W !!
 I YESNO'="","YES"[YESNO W !,"Re-indexing patient data for all indexes...",! D RIDXALL QUIT
 E  D
 . N CNT,JPID,PID,KEY,COLL,IDX,IDXLIST,INDEX,INDEXES,LABEL,I,LINE,DESC,LN
 . S INDEX=""
 . W !
 . F LABEL="IDXLIST","IDXTALLY","IDXTIME","IDXATTR","IDXMATCH","XIDXATTR" D
 . . F I=1:1 S LINE=$P($T(@LABEL+I^VPRJPMX),";;",2,99) Q:LINE["zzzzz"  I $E(LINE)'=" " S INDEXES(LINE)=""
 . . S CNT=0,(IDX,LN)="",DESC=$P($T(@LABEL^VPRJPMX),";",2,99)
 . . W DESC,! S $P(LN,"-",$L(DESC))="" W LN_"--",!
 . . F  S IDX=$O(INDEXES(IDX)) Q:IDX=""  W $J(IDX,25) S CNT=CNT+1 W:CNT#3=0 !
 . . W:CNT#3'=0 !
 . . W !
 . . K INDEXES
 . W !,"Select the names of the indexes that you want to re-index, then hit <enter>",!
 . W "Hit <enter> again when you are finished, or Q <enter> if you want to quit without running",!
 . F  R !,"Enter index name: ",IDXLIST Q:(IDXLIST="")!($TR(IDXLIST,"q","Q")="Q")  D
 . . S INDEX=INDEX_","_IDXLIST
 . I $TR(IDXLIST,"q","Q")="Q" W ! Q
 . S $E(INDEX)=""
 . I INDEX="" W !,"Nothing to re-index, quitting...",! Q
 . E  W !,"Re-indexing patient data for the chosen index(es): "_$TR(INDEX,","," "),!
 . D RIDXALL(INDEX)
 QUIT
 ;
RIDXALL(INDEX) ; Re-index all patients
 ; @param {string} [INDEX=""] - A list of one or more comma-delimited index names to re-index, or if omitted or empty, re-index all
 N OK,JPID,PID,KEY,NUM,FLG,VPRMETA
 K:$D(^XTMP("VPRJVUP","vpr")) ^XTMP("VPRJVUP","vpr")
 S ^XTMP("VPRJVUP","vpr","total")=$G(^VPRPTX("count","patient","patient"))
 D LOGMSG^VPRJ("vpr","Re-indexing VPR for ALL patients")
 ; Disabling global lock (cf. WRC 880083)
 ; L +^VPRPT:$G(^VPRCONFIG("timeout","ptindex"),5) E  D LOGMSG^VPRJ("vpr","Unable to lock ALL patient data") QUIT
 D SUSPEND^VPRJ
 S NUM=0,FLG=0
 F  S NUM=$O(^VPRHTTP(NUM)) Q:(NUM'=+NUM)!FLG  D
 . I (($D(^VPRHTTP(NUM,"listener"))#2)&(^VPRHTTP(NUM,"listener")'="stopped"))!($D(^VPRHTTP(0,"child"))'=0) D
 . . W "Unable to re-index patient data at this time.."
 . . D RESUME^VPRJ
 . . ; Disabling global lock (cf. WRC 880083)
 . . ; L -^VPRPT
 . . S FLG=1
 I FLG QUIT
 D CLRINDEX(.OK,$G(INDEX)) QUIT:'OK
 ;
 S JPID="" F  S JPID=$O(^VPRPT(JPID)) Q:JPID=""  D
 . S PID="" F  S PID=$O(^VPRPT(JPID,PID)) Q:PID=""  D
 . . S KEY="" F  S KEY=$O(^VPRPT(JPID,PID,KEY)) Q:KEY=""  D RIDXOBJ(PID,KEY,$G(INDEX))
 . . S ^VPRPTI(JPID,PID,"every","every")=$H  ; timestamps latest re-index for this PID
 . . D LOGCNT^VPRJ("vpr")
 D RESUME^VPRJ
 ; Disabling global lock (cf. WRC 880083)
 ; L -^VPRPT
 S ^XTMP("VPRJVUP","vpr","complete")=1
 QUIT
 ;
RIDXPID(PID) ; Re-index a single patient
 N JPID,KEY,LTP
 ;
 K:$D(^XTMP("VPRJVUP","vpr")) ^XTMP("VPRJVUP","vpr")
 D LOGMSG^VPRJ("vpr","Re-index VPR for a single patient")
 Q:'$L($G(PID))
 ;
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D LOGMSG^VPRJ("vpr","Unable to acquire JPID for PID: "_PID) Q
 ;
 ; Using ECP with a lot of data, locking and using transactions around the re-indexing code might have a performance penalty
 ; Check to see if we should wrap this with a lock and a transaction in this environment
 S LTP=$G(^VPRCONFIG("reindexLockTransactions"),0)
 I LTP L +^VPRPT(JPID,PID):$G(^VPRCONFIG("timeout","ptindex"),5) E  D LOGMSG^VPRJ("vpr","Unable to lock patient data") Q
 D CLRCODES(PID),CLREVIEW(PID),CLRCOUNT(PID)
 K:$D(^VPRPTI(JPID,PID)) ^VPRPTI(JPID,PID)
 S KEY="" F  S KEY=$O(^VPRPT(JPID,PID,KEY)) Q:KEY=""  D RIDXOBJ(PID,KEY)
 I LTP L -^VPRPT(JPID,PID)
 Q
 ;
RBLDALL ; Rebuild all patients (includes templates)
 N OK,JPID,OPID
 K:$D(^XTMP("VPRJVUP","vpr")) ^XTMP("VPRJVUP","vpr")
 S ^XTMP("VPRJVUP","vpr","total")=$G(^VPRPTX("count","patient","patient"))
 D LOGMSG^VPRJ("vpr","Re-build VPR (including templates) for ALL patients")
 ; Disabling global lock (cf. WRC 880083)
 ; L +^VPRPT:$G(^VPRCONFIG("timeout","ptbuild"),5) E  D LOGMSG^VPRJ("vpr","Unable to lock ALL patient data") Q
 D SUSPEND^VPRJ
 D CLRINDEX(.OK) Q:'OK  ; clears VPRPTI,VPRPTX,VPRTMP
 D CLRDATA(.OK) Q:'OK   ; clears VPRPT,VPRPTJ except VPRPTJ("JSON")
 S JPID="" F  S JPID=$O(^VPRPTJ("JSON",JPID)) Q:JPID=""  D
 . ; OPID is the original PID
 . S OPID="" F  S OPID=$O(^VPRPTJ("JSON",JPID,OPID)) Q:OPID=""  D
 . . N PID,KEY
 . . ; Need to pass JPID and OPID to make sure we can get the key
 . . S PID=$$MKPID(JPID,OPID)
 . . I '$L(PID) D LOGMSG^VPRJ("vpr","Error creating PID: "_OPID) Q
 . . S KEY="" F  S KEY=$O(^VPRPTJ("JSON",JPID,OPID,KEY)) Q:KEY=""  D RBLDOBJ(OPID,KEY)
 . . D LOGCNT^VPRJ("vpr")
 D RESUME^VPRJ
 ; Disabling global lock (cf. WRC 880083)
 ; L -^VPRPT
 D LOGMSG^VPRJ("vpr","VPR rebuild complete")
 S ^XTMP("VPRJVUP","vpr","complete")=1
 Q
MKPID(JPID,PID) ; create PID entries with demographics object
 N KEY,JSON,DEMOG,ERR,STAMP
 S KEY=$O(^VPRPTJ("JSON",JPID,PID,"urn:va:patient:"))
 I '$L(KEY) D SETERROR^VPRJRER(214) Q ""
 S STAMP=$O(^VPRPTJ("JSON",JPID,PID,KEY,""),-1)
 M JSON=^VPRPTJ("JSON",JPID,PID,KEY,STAMP)
 D DECODE^VPRJSON("JSON","DEMOG","ERR")
 I $D(ERR) D SETERROR^VPRJRER(202) Q ""
 Q $$UPDPT^VPRJPR(.DEMOG)
 ;
RBLDPID(PID) ; Rebuild single patient (includes templates)
 N JPID,KEY
 ;
 K:$D(^XTMP("VPRJVUP","vpr")) ^XTMP("VPRJVUP","vpr")
 D LOGMSG^VPRJ("vpr","Re-build VPR (including templates) for a single patient")
 Q:'$L($G(PID))
 ;
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D LOGMSG^VPRJ("vpr","Unable to acquire JPID for PID: "_PID) Q
 ;
 L +^VPRPT(JPID,PID):$G(^VPRCONFIG("timeout","ptbuild"),5) E  D LOGMSG^VPRJ("vpr","Unable to lock patient data") Q
 D CLRCODES(PID),CLREVIEW(PID),CLRCOUNT(PID)
 K:$D(^VPRPTI(JPID,PID)) ^VPRPTI(JPID,PID)
 S KEY="" F  S KEY=$O(^VPRPT(JPID,PID,KEY)) Q:KEY=""  D RBLDOBJ(PID,KEY)
 L -^VPRPT(JPID,PID)
 Q
RIDXOBJ(PID,KEY,INDEX) ; Re-index a single object
 ; @param {string} PID - The patient site identifier
 ; @param {string} KEY - The identifier (UID) of the patient data event
 ; @param {string} [INDEX=""] - A list of one or more comma-delimited index names to re-index, or if omitted or empty, re-index all
 N JPID,OBJECT,STAMP,LTP
 ;
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D LOGMSG^VPRJ("vpr","Unable to acquire JPID for PID: "_PID) QUIT
 ;
 ; Using ECP with a lot of data, locking and using transactions around the re-indexing code might have a performance penalty
 ; Check to see if we should wrap this with a lock and a transaction in this environment
 S LTP=$G(^VPRCONFIG("reindexLockTransactions"),0)
 I LTP L +^VPRPT(JPID,PID,KEY):$G(^VPRCONFIG("timeout","ptindex"),5) E  D LOGMSG^VPRJ("vpr","Unable to obtain lock for "_KEY) QUIT
 S STAMP=$O(^VPRPT(JPID,PID,KEY,""),-1)
 I STAMP="" W "PID: "_PID_"; UID: "_KEY_" HAS NO EVENTSTAMP",! L:LTP -^VPRPT(JPID,PID,KEY) QUIT
 M OBJECT=^VPRPT(JPID,PID,KEY,STAMP)
 I LTP TSTART
 D INDEX^VPRJPX(PID,KEY,"",.OBJECT,$G(INDEX))
 I LTP TCOMMIT
 I LTP L -^VPRPT(JPID,PID,KEY)
 QUIT
 ;
RBLDOBJ(PID,KEY) ; Re-build a single object
 N LINE,JSON,STAMP
 ;
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D LOGMSG^VPRJ("vpr","Unable to acquire JPID for PID: "_PID) Q
 ;
 L +^VPRPT(JPID,PID,KEY):$G(^VPRCONFIG("timeout","ptbuild"),5) E  D LOGMSG^VPRJ("vpr","Unable to obtain lock for "_KEY) Q
 S STAMP=$O(^VPRPTJ("JSON",JPID,PID,KEY,""),-1)
 ; get the original JSON object without the templates
 S LINE=0 F  S LINE=$O(^VPRPTJ("JSON",JPID,PID,KEY,STAMP,LINE)) Q:'LINE  D
 . S JSON(LINE)=^VPRPTJ("JSON",JPID,PID,KEY,STAMP,LINE)
 ; indexes have been killed for whole patient, so remove the original object
 K:$D(^VPRPT(JPID,PID,KEY)) ^VPRPT(JPID,PID,KEY)
 K:$D(^VPRPTJ("JSON",JPID,PID,KEY)) ^VPRPTJ("JSON",JPID,PID,KEY)
 K:$D(^VPRPTJ("TEMPLATE",JPID,PID,KEY)) ^VPRPTJ("TEMPLATE",JPID,PID,KEY)
 K:$D(^VPRPTJ("KEY",KEY,PID)) ^VPRPTJ("KEY",KEY,PID)
 ; call save the replace the object & reset indexes
 D SAVE^VPRJPS(JPID,.JSON)
 L -^VPRPT(JPID,PID,KEY)
 Q
 ;
CLRINDEX(OK,INDEX) ; Clear all the indexes, preserving the "put patient" part, since that is not redone with a re-index
 ; @param {string} {required} OK (passed by reference) - A return flag that signals whether indexes were cleared of data
 ; @param {string} {optional} INDEX - A list of one or more comma-delimited index names to clear from the indexes
 ;        If not passed, or the empty string, all indexes defined in VPRJPMX will be cleared
 N PCNT
 ; Disabling global lock (cf. WRC 880083)
 ; L +^VPRPTJ("PID"):$G(^VPRCONFIG("timeout","ptclear"),5) E  D LOGMSG^VPRJ("vpr","Unable to get lock for indexes.") S OK=0 QUIT
 S PCNT=$G(^VPRPTX("count","patient","patient"),0)
 I $G(INDEX)'="" D
 . N JPID,PID,IDX
 . S JPID="" F  S JPID=$O(^VPRPTI(JPID)) Q:JPID=""  D
 . . S PID="" F  S PID=$O(^VPRPTI(JPID,PID)) Q:PID=""  D
 . . . S IDX="" F  S IDX=$O(^VPRPTI(JPID,PID,"attr",IDX)) Q:IDX=""  I (","_INDEX_",")[IDX D
 . . . . K:$D(^VPRPTI(JPID,PID,"attr",IDX)) ^VPRPTI(JPID,PID,"attr",IDX) K:$D(^VPRPTX("xattr",IDX)) ^VPRPTX("xattr",IDX)
 . . . K:$D(^VPRPTI(JPID,PID,"tally","collection")) ^VPRPTI(JPID,PID,"tally","collection") K:$D(^VPRPTI(JPID,PID,"tally","domain")) ^VPRPTI(JPID,PID,"tally","domain")
 . K:$D(^VPRPTX("count")) ^VPRPTX("count") K:$D(^VPRTMP) ^VPRTMP
 E  D
 . I $ZV["Cache" D
 . . D KILLSHARD("VPRPTI")
 . E  D
 . . K:$D(^VPRPTI) ^VPRPTI
 . ; Common unsharded globals
 . K:$D(^VPRPTX) ^VPRPTX
 . K:$D(^VPRTMP) ^VPRTMP
 S ^VPRPTX("count","patient","patient")=PCNT ; preserve the count
 ; Disabling global lock (cf. WRC 880083)
 ; L -^VPRPTJ("PID")
 D SETUP^VPRJPMD
 S OK=1
 QUIT
 ;
CLRDATA(OK) ; Clear all data except for original JSON
 ; Disabling global lock (cf. WRC 880083)
 ; L +^VPRPTJ("PID"):$G(^VPRCONFIG("timeout","ptclear"),5) E  D LOGMSG^VPRJ("vpr","Unable to get lock for data.") S OK=0 Q
 K:$D(^VPRPT) ^VPRPT K:$D(^VPRPTJ("TEMPLATE")) ^VPRPTJ("TEMPLATE") K:$D(^VPRPTJ("KEY")) ^VPRPTJ("KEY") K:$D(^VPRPTJ("PID")) ^VPRPTJ("PID")
 K:$D(^VPRPTX("count","patient","patient")) ^VPRPTX("count","patient","patient")  ; remove since total rebuild
 ; Disabling global lock (cf. WRC 880083)
 ; L -^VPRPTJ("PID")
 S OK=1
 Q
CLRCODES(PID) ; Clear the cross patient indexes for coded values
 ;remove ^VPRPTX("allCodes",code,field,PID)
 ;remove ^VPRPTX("pidCodes",PID)
 N FLD,CODE,KEY
 S FLD="" F  S FLD=$O(^VPRPTX("pidCodes",PID,FLD)) Q:FLD=""  D
 . S CODE="" F  S CODE=$O(^VPRPTX("pidCodes",PID,FLD,CODE)) Q:CODE=""  D
 . . S KEY="" F  S KEY=$O(^VPRPTX("pidCodes",PID,FLD,CODE,KEY)) Q:KEY=""  D
 . . . K:$D(^VPRPTX("allCodes",CODE,FLD,PID,KEY)) ^VPRPTX("allCodes",CODE,FLD,PID,KEY)
 K:$D(^VPRPTX("pidCodes",PID)) ^VPRPTX("pidCodes",PID)
 Q
CLREVIEW(PID) ; Clear the cross patient indexes for re-evaluation times
 ;remove ^VPRPTX("review",reviewTime,PID)
 ;remove ^VPRPTX("pidReview",PID)
 N REVTM
 S REVTM="" F  S REVTM=$O(^VPRPTX("pidReview",PID,REVTM)) Q:REVTM=""  D
 . K:$D(^VPRPTX("review",REVTM,PID)) ^VPRPTX("review",REVTM,PID)
 K:$D(^VPRPTX("pidReview",PID)) ^VPRPTX("pidReview",PID)
 Q
CLRCOUNT(PID) ; Decrement the cross-patient totals for a patient
 ;reduce ^VPRPTX("count","collection",topic)
 ;    by ^VPRPTI(JPID,PID,"tally","collection",topic)
 ;reduce ^VPRPTX("count","domain",topic)
 ;    by ^VPRPTI(JPID,PID,"tally","domain",topic)
 N GROUP,TOPIC,CNT4PID,CNT4ALL,JPID ; decrement the relevant counts
 ;
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(222,"Identifier "_PID) Q
 ;
 F GROUP="collection","domain" I $D(^VPRPTI(JPID,PID,"tally",GROUP)) D
 . S TOPIC="" F  S TOPIC=$O(^VPRPTI(JPID,PID,"tally",GROUP,TOPIC)) Q:TOPIC=""  D
 . . S CNT4PID=+$G(^VPRPTI(JPID,PID,"tally",GROUP,TOPIC))
 . . L +^VPRPTX("count",GROUP,TOPIC):$G(^VPRCONFIG("timeout","ptclear"),5) E  D SETERROR^VPRJRER(502,GROUP_" "_NAME) Q
 . . S CNT4ALL=+$G(^VPRPTX("count",GROUP,TOPIC))
 . . S ^VPRPTX("count",GROUP,TOPIC)=CNT4ALL-CNT4PID ; decr count across patients
 . . L -^VPRPTX("count",GROUP,TOPIC)
 Q
 ;
CLRXIDX(PID) ; remove cross-patient indexes for a patient
 N KEY,OLDOBJ,JPID,STAMP
 ;
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(222,"Identifier "_PID) QUIT
 ;
 S KEY="" F  S KEY=$O(^VPRPT(JPID,PID,KEY)) Q:'$L(KEY)  D
 . L +^VPRPT(JPID,PID,KEY):$G(^VPRCONFIG("timeout","ptclear"),5) E  D SETERROR^VPRJRER(502,PID_">  "_KEY) Q
 . S STAMP=$O(^VPRPT(JPID,PID,KEY,""),-1)
 . I STAMP="" D SETERROR^VPRJRER(228,PID_">  "_KEY) L -^VPRPT(JPID,PID,KEY) Q
 . M OLDOBJ=^VPRPT(JPID,PID,KEY,STAMP)
 . D CLRXONE(PID,KEY,.OLDOBJ)
 . L -^VPRPT(JPID,PID,KEY)
 QUIT
 ;
CLRXONE(PID,KEY,OLDOBJ) ; Clear cross-patient indexes for this key
 N IDXCOLL,IDXNAME,NEWOBJ
 ; Currently assuming UID is urn:va:type:vistaAccount:localId...
 ; For example:  urn:va:med:93EF:34014
 S IDXCOLL=$P(KEY,":",3),NEWOBJ=""
 S IDXNAME="" F  S IDXNAME=$O(^VPRMETA("collection",IDXCOLL,"index",IDXNAME)) Q:IDXNAME=""  D
 . I ^VPRMETA("index",IDXNAME,"common","method")'="xattr" QUIT
 . N IDXMETA
 . M IDXMETA=^VPRMETA("index",IDXNAME,"collection",IDXCOLL)
 . S IDXMETA("setif")=$G(^VPRMETA("index",IDXNAME,"common","setif"))
 . S IDXMETA("review")=$G(^VPRMETA("index",IDXNAME,"common","review"))
 . S IDXMETA("levels")=$G(^VPRMETA("index",IDXNAME,"common","levels"))
 . S IDXMETA("method")=^VPRMETA("index",IDXNAME,"common","method")
 . D XATTR^VPRJPXA
 Q
STATUS(PID) ; Show VPR status for a patient
 N JPID
 S JPID=$$JPID4PID^VPRJPR($G(PID))
 ;
 I $L($G(PID)),JPID'="" D
 . W !,"For PID ",PID," --"
 . W !,?4,"Index Nodes: ",$$NODECNT("^VPRPTI("""_JPID_""","""_PID_""")")
 . W !,?4," Data Nodes: ",$$NODECNT("^VPRPT("""_JPID_""","""_PID_""")")
 . W !,?4,"Object Counts --"
 . W !,?8,"    Domain: ",$$ITEMCNT("domain",PID)
 . W !,?8,"Collection: ",$$ITEMCNT("collection",PID)
 . W !,?8,"     UID's: ",$$OBJCNT(PID)
 . W !,?4,"Code Refs: ",$$NODECNT("^VPRPTX(""pidCodes"","""_PID_""")")
 E  D
 . W !,"VPR Totals --"
 . W !,?4,"Patients: ",$$PTCNT()
 . W !,?4,"Index Nodes: ",$$NODECNT("^VPRPTI")
 . W !,?4," Data Nodes: ",$$NODECNT("^VPRPT")
 . W !,?4,"Object Counts --"
 . W !,?8,"    Domain: ",$$ITEMCNT("domain")
 . W !,?8,"Collection: ",$$ITEMCNT("collection")
 . W !,?8,"     UID's: ",$$OBJCNT()
 . W !,?4,"  Code Refs: ",$$NODECNT("^VPRPTX(""allCodes"")")
 . W !,?4,"Review Refs: ",$$NODECNT("^VPRPTX(""review"")")
 Q
PTCNT() ; Return the number of patients in the VPR
 N PID,COUNT,JPID
 S PID="",COUNT=0,JPID=""
 F  S JPID=$O(^VPRPT(JPID)) Q:'$L(JPID)  D
 . F  S PID=$O(^VPRPT(JPID,PID)) Q:'$L(PID)  S COUNT=COUNT+1
 Q COUNT
 ;
NODECNT(ROOT) ; Return the number of nodes for ROOT
 N X,COUNT
 S X=ROOT,COUNT=0
 I $E(ROOT,$L(ROOT))=")" S ROOT=$E(ROOT,1,$L(ROOT)-1)
 F  S X=$Q(@X) Q:$E(X,1,$L(ROOT))'=ROOT  S COUNT=COUNT+1
 Q COUNT
 ;
ITEMCNT(GROUP,PID) ; Return the item count for a group
 ; PID is optional, if absent, entire VPR is counted
 N COUNT,TOPIC,JPID
 S COUNT=0
 ;
 S JPID=$$JPID4PID^VPRJPR($G(PID))
 ;
 I $L($G(PID)),JPID'="" D
 . S TOPIC="" F  S TOPIC=$O(^VPRPTI(JPID,PID,"tally",GROUP,TOPIC)) Q:TOPIC=""  D
 . . S COUNT=COUNT+^VPRPTI(JPID,PID,"tally",GROUP,TOPIC)
 E  D
 . S TOPIC="" F  S TOPIC=$O(^VPRPTX("count",GROUP,TOPIC)) Q:TOPIC=""  D
 . . S COUNT=COUNT+^VPRPTX("count",GROUP,TOPIC)
 Q COUNT
 ;
OBJCNT(PID) ; Return a count of objects by UID
 ; PID is optional, if absent, entire VPR is counted
 N COUNT,UID,JPID
 ;
 S JPID=$$JPID4PID^VPRJPR($G(PID))
 ;
 S COUNT=0
 I $L($G(PID)),JPID'="" D
 . S UID="" F  S UID=$O(^VPRPT(JPID,PID,UID)) Q:UID=""  S COUNT=COUNT+1
 E  D
 . F  S JPID=$O(^VPRPT(JPID)) Q:'$L(JPID)  D
 . . S PID="" F  S PID=$O(^VPRPT(JPID,PID)) Q:'$L(PID)  D
 . . . S UID="" F  S UID=$O(^VPRPT(JPID,PID,UID)) Q:UID=""  S COUNT=COUNT+1
 Q COUNT
 ;
KILLDB ; -- Delete and reset the globals for the database
 N JPID
 K:$D(^VPRHTTP("log")) ^VPRHTTP("log")
 ; Patient data needs to be deleted by database due to sharding (Caché only)
 I $ZV["Cache" D
 . D KILLSHARD("VPRPT")
 . D KILLSHARD("VPRPTJ")
 . D KILLSHARD("VPRPTI")
 . D KILLSHARD("VPRSTATUS")
 E  D
 . K:$D(^VPRPT) ^VPRPT
 . K:$D(^VPRPTJ) ^VPRPTJ
 . K:$D(^VPRPTI) ^VPRPTI
 . K:$D(^VPRSTATUS) ^VPRSTATUS
 ; These globals are not sharded
 K:$D(^VPRPTX) ^VPRPTX
 K:$D(^VPRTMP) ^VPRTMP
 K:$D(^VPRMETA) ^VPRMETA
 K:$D(^VPRJOB) ^VPRJOB
 D SETUP^VPRJPMD
 Q
ASKPID() ; Return PID after prompting for it
 N PID,KEY,JPID
 ;
 S PID=$$PROMPT^VPRJ1("PID","","","Enter the PID for a patient.")
 Q:PID="" PID
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" W !,"Unable to acquire JPID for PID: "_PID Q PID
 I '$D(^VPRPT(JPID,PID)) W !,"PID "_PID_" not found." S PID=""
 Q PID
 ;
 ; Kill possibly sharded globals (only for Caché)
 ; This uses a few object script classes to get a list of databases that
 ; exist on the server and blindly kills the data. There is no check to see
 ; if they are mapped into the JDS namespace, so it assumes that the caché instance
 ; is dedicated to a single JDS install.
KILLSHARD(GLOBAL)
 N NAMESPACE,DATABASES,STATUS,DBNAME,DIRECTORY,SERVER,KILLGLOBAL
 S NAMESPACE=$ZU(5)
 ; Retrieve the list of databases. Only available via %SYS Namespace
 ; Ran as a single line to make sure we get back to our namespace as quick as possible
 ZN "%SYS"
 S DATABASES=##class(%ResultSet).%New("Config.Databases:List")
 S STATUS=DATABASES.Execute()
 ; Iterate through all databases listed
 WHILE (DATABASES.%Next()) {
  S DBNAME=DATABASES.Get("Name")
  S DIRECTORY=DATABASES.Get("Directory")
  S SERVER=DATABASES.Get("Server")
  I (DBNAME'="CACHESYS"),(DBNAME'="CACHELIB"),(DBNAME'="CACHETEMP"),(DBNAME'="CACHE"),(DBNAME'="CACHEAUDIT"),(DBNAME'="DOCBOOK"),(DBNAME'="SAMPLES") D
  . ; Extended Global Reference: ^|"^SERVER"^"DIRECTORY"|GLOBAL
  . ; Sample: ^|"^JDSDB1^/opt/cache/dbs/"|VPRPTJ
  . I SERVER'="" S KILLGLOBAL = "^|""^"_SERVER_"^"_DIRECTORY_"""|"_GLOBAL
  . E  S KILLGLOBAL = "^|""^^"_DIRECTORY_"""|"_GLOBAL
  . K @KILLGLOBAL
 }
 D DATABASES.Close()
 ZN NAMESPACE
 Q

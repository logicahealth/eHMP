VPRJPX ;SLC/KCM -- Index a JSON object
 ;
INDEX(PID,KEY,OLDOBJ,NEWOBJ,INDEX) ; Index this object identified by its KEY
 ; @param {string} PID - The patient site identifier
 ; @param {string} KEY - The identifier (UID) of the patient data event
 ; @param {array} [.OLDOBJ] - Old patient data to remove from index
 ; @param {array} .NEWOBJ - New patient data to add to index
 ; @param {string} [INDEX=""] - A list of one or more comma-delimited index names to reindex, or if omitted or empty, reindex all
 N IDXCOLL,IDXNAME
 ; Currently assuming UID is urn:va:type:vistaAccount:localId...
 ; For example:  urn:va:med:93EF:34014
 N VPRCONST D CONST
 S IDXCOLL=$P(KEY,":",3)
 S IDXNAME="" F  S IDXNAME=$O(^VPRMETA("collection",IDXCOLL,"index",IDXNAME)) Q:IDXNAME=""  D
 . I $G(INDEX)'="",(","_INDEX_",")'[IDXNAME Q
 . N IDXMETA
 . M IDXMETA=^VPRMETA("index",IDXNAME,"collection",IDXCOLL)
 . I IDXMETA("method")="tally" D TALLY Q
 . I IDXMETA("method")="time"  D TIME Q
 . I IDXMETA("method")="attr"  D ATTRIB^VPRJPXA Q
 . I IDXMETA("method")="xattr" D XATTR^VPRJPXA Q
 S IDXNAME="" F  S IDXNAME=$O(^VPRMETA("collection",IDXCOLL,"link",IDXNAME)) Q:IDXNAME=""  D
 . I $G(INDEX)'="",(","_INDEX_",")'[IDXNAME Q
 . N IDXMETA
 . M IDXMETA=^VPRMETA("link",IDXNAME,"collection",IDXCOLL)
 . D REVERSE
 ;D CODES (do this later -- when we add in support for matches)
 D COUNTS
 QUIT
 ;
 ; ----- Maintain counts of objects -----
 ;
COUNTS ; set counts for different collection types
 N DOMAIN
 D KCOUNT("collection",IDXCOLL,.OLDOBJ)
 D SCOUNT("collection",IDXCOLL,.NEWOBJ)
 S DOMAIN=$G(^VPRMETA("collection",IDXCOLL,"domain")) Q:DOMAIN=""
 D KCOUNT("domain",DOMAIN,.OLDOBJ)
 D SCOUNT("domain",DOMAIN,.NEWOBJ)
 Q
SCOUNT(GROUP,TOPIC,OBJECT) ; Increment a count index
 Q:$D(OBJECT)<10
 N TALLY,JPID
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(222,"Unable to acquire JPID for PID: "_PID) Q
 S TALLY=$I(^VPRPTI(JPID,PID,"tally",GROUP,TOPIC)) ; incr count for patient
 S TALLY=$I(^VPRPTX("count",GROUP,TOPIC))
 Q
KCOUNT(GROUP,TOPIC,OBJECT) ; Decrement a count index
 Q:$D(OBJECT)<10
 N TALLY,JPID
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(222,"Unable to acquire JPID for PID: "_PID) Q
 S TALLY=$I(^VPRPTI(JPID,PID,"tally",GROUP,TOPIC),-1) ; decr count for patient
 S TALLY=$I(^VPRPTX("count",GROUP,TOPIC),-1)
 Q
 ;
 ; ----- Index Logic: tally by attribute value -----
 ;
TALLY ; TALLY index (PID,"tally",group,value)=tally
 ; if FIELD has no value, count is not changed
 D KTALLY(.OLDOBJ)
 D STALLY(.NEWOBJ)
 N JPID
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(222,"Unable to acquire JPID for PID: "_PID) Q
 S ^VPRPTI(JPID,PID,"tally",IDXNAME)=$H
 Q
STALLY(OBJECT) ; Increment a tally index
 Q:$D(OBJECT)<10
 N VALUES,I,TALLY,JPID
 D IDXVALS^VPRJCV(.OBJECT,.VALUES,.IDXMETA) Q:'$D(VALUES)
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(222,"Unable to acquire JPID for PID: "_PID) Q
 S I="" F  S I=$O(VALUES(I)) Q:I=""  D
 . S TALLY=$I(^VPRPTI(JPID,PID,"tally",IDXNAME,VALUES(I,1)))
 Q
KTALLY(OBJECT) ; Decrement a tally index
 Q:$D(OBJECT)<10
 N VALUES,I,TALLY,JPID
 D IDXVALS^VPRJCV(.OBJECT,.VALUES,.IDXMETA) Q:'$D(VALUES)
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(222,"Unable to acquire JPID for PID: "_PID) Q
 S I="" F  S I=$O(VALUES(I)) Q:I=""  D
 . S TALLY=$I(^VPRPTI(JPID,PID,"tally",IDXNAME,VALUES(I,1)),-1)
 . I $G(^VPRPTI(JPID,PID,"tally",IDXNAME,VALUES(I,1)))=0 K ^VPRPTI(JPID,PID,"tally",IDXNAME,VALUES(I,1))
 Q
 ;
 ; ----- Index Logic: time ranges -----
 ;
TIME ; TIME index   (PID,"time",group,start,key)=stop
 ; -- if time range (PID,"stop",group,stop,key)=start
 ; expects start to always be something (0 if null), stop is optional
 D KTIME(.OLDOBJ)
 D STIME(.NEWOBJ)
 N JPID
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(222,"Unable to acquire JPID for PID: "_PID) Q
 S ^VPRPTI(JPID,PID,"time",IDXNAME)=$H
 Q
STIME(OBJECT) ; Set a time based index
 Q:$D(OBJECT)<10
 Q:'$$SETIF(.OBJECT)
 N VALUES,I,JPID
 D IDXVALS^VPRJCV(.OBJECT,.VALUES,.IDXMETA) Q:'$D(VALUES)
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(222,"Unable to acquire JPID for PID: "_PID) Q
 S I="" F  S I=$O(VALUES(I)) Q:I=""  D
 . S ^VPRPTI(JPID,PID,"time",IDXNAME,VALUES(I,1),KEY,I)=$G(VALUES(I,2))
 . Q:'$L($G(VALUES(I,2)))
 . S ^VPRPTI(JPID,PID,"stop",IDXNAME,VALUES(I,2),KEY,I)=VALUES(I,1)
 Q
KTIME(OBJECT) ; Kill a time based index
 Q:$D(OBJECT)<10
 N VALUES,I,JPID
 D IDXVALS^VPRJCV(.OBJECT,.VALUES,.IDXMETA) Q:'$D(VALUES)
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(222,"Unable to acquire JPID for PID: "_PID) Q
 S I="" F  S I=$O(VALUES(I)) Q:I=""  D
 . K:$D(^VPRPTI(JPID,PID,"time",IDXNAME,VALUES(I,1),KEY,I)) ^VPRPTI(JPID,PID,"time",IDXNAME,VALUES(I,1),KEY,I)
 . Q:'$L($G(VALUES(I,2)))
 . K:$D(^VPRPTI(JPID,PID,"stop",IDXNAME,VALUES(I,2),KEY,I)) ^VPRPTI(JPID,PID,"stop",IDXNAME,VALUES(I,2),KEY,I)
 Q
 ;
REVERSE ; REV index
 ; (PID,"rev",pointedToURN,relName,thisURN)
 D KREVERSE(.OLDOBJ)
 D SREVERSE(.NEWOBJ)
 N JPID
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(222,"Unable to acquire JPID for PID: "_PID) Q
 S ^VPRPTI(JPID,PID,"rev",IDXNAME)=$H
 Q
SREVERSE(OBJECT) ; Set a relation link index
 Q:$D(OBJECT)<10
 N VALUES,I,JPID
 D IDXVALS^VPRJCV(.OBJECT,.VALUES,.IDXMETA) Q:'$D(VALUES)
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(222,"Unable to acquire JPID for PID: "_PID) Q
 S I="" F  S I=$O(VALUES(I)) Q:I=""  S ^VPRPTI(JPID,PID,"rev",VALUES(I,1),IDXNAME,KEY,I)=""
 Q
KREVERSE(OBJECT) ; Kill a relation link index
 Q:$D(OBJECT)<10
 N VALUES,I,JPID
 D IDXVALS^VPRJCV(.OBJECT,.VALUES,.IDXMETA) Q:'$D(VALUES)
 S JPID=$$JPID4PID^VPRJPR(PID)
 I JPID="" D SETERROR^VPRJRER(222,"Unable to acquire JPID for PID: "_PID) Q
 S I="" F  S I=$O(VALUES(I)) Q:I=""  K:$D(^VPRPTI(JPID,PID,"rev",VALUES(I,1),IDXNAME,KEY,I)) ^VPRPTI(JPID,PID,"rev",VALUES(I,1),IDXNAME,KEY,I)
 Q
CODES ; code indexes
 D KCODES(.OLDOBJ)
 D SCODES(.NEWOBJ)
 Q
SCODES(OBJECT) ; set indexed codes
 Q:$D(OBJECT)<10
 N FIELD,SUB,LIST,I  ; assume max of 2 levels for now
 S FIELD="" F  S FIELD=$O(^VPRMETA("codes",IDXCOLL,FIELD)) Q:FIELD=""  D
 . I FIELD'["[]" D SETCODE(PID,KEY,$G(OBJECT(FIELD)),FIELD) Q
 . S LIST=$P(FIELD,"[]")
 . S I=0 F  S I=$O(OBJECT(LIST,I)) Q:'I  D
 . . S SUB="" F  S SUB=$O(^VPRMETA("codes",IDXCOLL,LIST,SUB)) Q:SUB=""  D SETCODE(PID,KEY,$G(OBJECT(LIST,I,SUB)),SUB)
 Q
KCODES(OBJECT) ; kill indexed codes
 Q:$D(OBJECT)<10
 N FIELD,SUB,LIST,I  ; assume max of 2 levels for now
 S FIELD="" F  S FIELD=$O(^VPRMETA("codes",IDXCOLL,FIELD)) Q:FIELD=""  D
 . I FIELD'["[]" D KILLCODE(PID,KEY,$G(OBJECT(FIELD)),FIELD) Q
 . S LIST=$P(FIELD,"[]")
 . S I=0 F  S I=$O(OBJECT(LIST,I)) Q:'I  D
 . . S SUB="" F  S SUB=$O(^VPRMETA("codes",IDXCOLL,LIST,SUB)) Q:SUB=""  D KILLCODE(PID,KEY,$G(OBJECT(LIST,I,SUB)),SUB)
 Q
SETCODE(PID,KEY,CODE,FIELD) ; Set index of all codes
 Q:'$L($G(CODE))
 S ^VPRPTX("allCodes",CODE,FIELD,PID,KEY)=""
 S ^VPRPTX("pidCodes",PID,FIELD,CODE,KEY)=""
 Q
KILLCODE(PID,KEY,CODE,FIELD) ; Kill index of all codes
 Q:'$L($G(CODE))
 K:$D(^VPRPTX("allCodes",CODE,FIELD,PID,KEY)) ^VPRPTX("allCodes",CODE,FIELD,PID,KEY)
 K:$D(^VPRPTX("pidCodes",PID,FIELD,CODE,KEY)) ^VPRPTX("pidCodes",PID,FIELD,CODE,KEY)
 Q
CONST ; Set up constants for use
 S VPRCONST("SCT_MED_STATUS_ACTIVE")="urn:sct:55561003"
 S VPRCONST("SCT_MED_TYPE_OTC")="urn:sct:329505003"
 S VPRCONST("SCT_MED_TYPE_PRESCRIBED")="urn:sct:73639000"
 S VPRCONST("SCT_MED_TYPE_GENERAL")="urn:sct:105903003"
 Q
SETIF(OBJECT) ; return evaluated setif statement, otherwise return true
 ; expects IDXMETA
 ; SETIF conditional statement is in format "$$TAG^ROUTINE"
 N OK,SETIF
 S OK=1
 I $L(IDXMETA("setif")) S OK=0,SETIF=IDXMETA("setif")_"(.OBJECT)" I @SETIF S OK=1
 Q OK
 ;

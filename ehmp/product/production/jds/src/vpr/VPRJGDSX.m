VPRJGDSX ;SLC/KCM/CJE -- Index a JSON object (Generic Data Store)
 ;;1.0;JSON DATA STORE;;Sep 01, 2012
 ;
INDEX(KEY,OLDOBJ,NEWOBJ) ; Index this object identified by its KEY
 N IDXCOLL,IDXNAME,GLOBAL,GLOBALX
 ; Parsed JSON
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 ; Index
 S GLOBALX="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"X"
 ;
 S IDXCOLL=$G(HTTPREQ("store"))
 S IDXNAME="" F  S IDXNAME=$O(^VPRMETA("collection",IDXCOLL,"index",IDXNAME)) Q:IDXNAME=""  D
 . N IDXMETA
 . M IDXMETA=^VPRMETA("index",IDXNAME,"collection",IDXCOLL)
 . I IDXMETA("method")="tally" D TALLY Q
 . I IDXMETA("method")="attr"  D ATTRIB Q
 S IDXNAME="" F  S IDXNAME=$O(^VPRMETA("collection",IDXCOLL,"link",IDXNAME)) Q:IDXNAME=""  D
 . N IDXMETA
 . M IDXMETA=^VPRMETA("link",IDXNAME,"collection",IDXCOLL)
 . D REVERSE
 D COUNTS
 Q
 ;
 ; ----- Maintain counts of objects -----
 ;
COUNTS ; set counts for different collection types
 N DOMAIN
 D KCOUNT("collection",IDXCOLL,.OLDOBJ)
 D SCOUNT("collection",IDXCOLL,.NEWOBJ)
 Q
SCOUNT(GROUP,TOPIC,OBJECT) ; Increment a count index
 Q:$D(OBJECT)<10
 N TALLY
 S TALLY=$I(@GLOBALX@("tally",GROUP,TOPIC)) ; incr count for collection
 S TALLY=$I(@GLOBALX@("count",GROUP,TOPIC))
 Q
KCOUNT(GROUP,TOPIC,OBJECT) ; Decrement a count index
 Q:$D(OBJECT)<10
 N TALLY
 S TALLY=$I(@GLOBALX@("tally",GROUP,TOPIC),-1) ; decr count for collection
 S TALLY=$I(@GLOBALX@("count",GROUP,TOPIC),-1)
 Q
 ;
 ; ----- Index Logic: tally by attribute value -----
 ;
TALLY ; TALLY index ("tally",group,value)=tally
 ; if FIELD has no value, count is not changed
 D KTALLY(.OLDOBJ)
 D STALLY(.NEWOBJ)
 S @GLOBALX@("tally",IDXNAME)=$H
 Q
STALLY(OBJECT) ; Increment a tally index
 Q:$D(OBJECT)<10
 N VALUES,I,TALLY
 D IDXVALS^VPRJCV(.OBJECT,.VALUES,.IDXMETA) Q:'$D(VALUES)
 S I="" F  S I=$O(VALUES(I)) Q:I=""  D
 . S TALLY=$I(@GLOBALX@("tally",IDXNAME,VALUES(I,1)))
 Q
KTALLY(OBJECT) ; Decrement a tally index
 Q:$D(OBJECT)<10
 N VALUES,I,TALLY
 D IDXVALS^VPRJCV(.OBJECT,.VALUES,.IDXMETA) Q:'$D(VALUES)
 S I="" F  S I=$O(VALUES(I)) Q:I=""  D
 . S TALLY=$I(@GLOBALX@("tally",IDXNAME,VALUES(I,1)),-1)
 . I @GLOBALX@("tally",IDXNAME,VALUES(I,1))=0 K:$D(^VPRJDX("tally",IDXNAME,VALUES(I,1))) ^VPRJDX("tally",IDXNAME,VALUES(I,1))
 Q
 ;
 ; ----- Index Logic: attributes -----
 ;
ATTRIB ; ATTRIBUTE index ("attr",group,value,sort,key)
 D KATTRIB(.OLDOBJ)
 D SATTRIB(.NEWOBJ)
 S @GLOBALX@("attr",IDXNAME)=$H
 Q
SATTRIB(OBJECT) ; Set attribute based index
 Q:$D(OBJECT)<10
 ; SETIF conditional statement is in format "$$TAG^ROUTINE"
 N OK,SETIF
 S OK=1
 I $L(IDXMETA("setif")) S OK=0,SETIF=IDXMETA("setif")_"(.OBJECT)" I @SETIF S OK=1
 Q:'OK
 I $L(IDXMETA("review")) D
 . N REVIEW,REVTM
 . S REVIEW="S REVTM="_REVIEW_"(.OBJECT)" X REVIEW
 . S @GLOBALX@("keyReview",KEY,IDXNAME)=REVTM
 . S @GLOBALX@("review",REVTM,KEY,IDXNAME)=""
 ;
 I IDXMETA("levels")=0  D SA0  Q
 ;
 N VALUES,I
 D IDXVALS^VPRJCV(.OBJECT,.VALUES,.IDXMETA) Q:'$D(VALUES)
 I IDXMETA("levels")=1  D SA1  Q
 I IDXMETA("levels")=2  D SA2  Q
 I IDXMETA("levels")=3  D SA3  Q
 Q
KATTRIB(OBJECT) ; Kill attribute based index
 Q:$D(OBJECT)<10
 ;
 I $L(IDXMETA("review")) D
 . N REVTM
 . S REVTM=$G(@GLOBALX@("keyReview",KEY,IDXNAME)) Q:'$L(REVTM)
 . K:$D(@GLOBALX@("keyReview",KEY,IDXNAME)) @GLOBALX@("keyReview",KEY,IDXNAME)
 . K:$D(@GLOBALX@("review",REVTM,KEY,IDXNAME)) @GLOBALX@("review",REVTM,KEY,IDXNAME)
 ;
 I IDXMETA("levels")=0  D KA0  Q
 ;
 N VALUES,I
 D IDXVALS^VPRJCV(.OBJECT,.VALUES,.IDXMETA) Q:'$D(VALUES)
 I IDXMETA("levels")=1  D KA1  Q
 I IDXMETA("levels")=2  D KA2  Q
 I IDXMETA("levels")=3  D KA3  Q
 Q
SA0 ; unsorted list set logic
 S @GLOBALX@("attr",IDXNAME,KEY)=""
 Q
KA0 ; unsorted list kill logic
 K:$D(@GLOBALX@("attr",IDXNAME,KEY)) @GLOBALX@("attr",IDXNAME,KEY)
 Q
SA1 ; one attribute set logic
 S I="" F  S I=$O(VALUES(I)) Q:I=""  S @GLOBALX@("attr",IDXNAME,VALUES(I,1),KEY,I)=""
 Q
KA1 ; one attribute kill logic
 S I="" F  S I=$O(VALUES(I)) Q:I=""  K:$D(@GLOBALX@("attr",IDXNAME,VALUES(I,1),KEY,I)) @GLOBALX@("attr",IDXNAME,VALUES(I,1),KEY,I)
 Q
SA2 ; two attributes set logic
 S I="" F  S I=$O(VALUES(I)) Q:I=""  S @GLOBALX@("attr",IDXNAME,VALUES(I,1),VALUES(I,2),KEY,I)=""
 Q
KA2 ; two attributes kill logic
 S I="" F  S I=$O(VALUES(I)) Q:I=""  K:$D(@GLOBALX@("attr",IDXNAME,VALUES(I,1),VALUES(I,2),KEY,I)) @GLOBALX@("attr",IDXNAME,VALUES(I,1),VALUES(I,2),KEY,I)
 Q
SA3 ; three attributes set logic
 S I="" F  S I=$O(VALUES(I)) Q:I=""  S @GLOBALX@("attr",IDXNAME,VALUES(I,1),VALUES(I,2),VALUES(I,3),KEY,I)=""
 Q
KA3 ; three attributes kill logic
 S I="" F  S I=$O(VALUES(I)) Q:I=""  K:$D(@GLOBALX@("attr",IDXNAME,VALUES(I,1),VALUES(I,2),VALUES(I,3),KEY,I)) @GLOBALX@("attr",IDXNAME,VALUES(I,1),VALUES(I,2),VALUES(I,3),KEY,I)
 Q
 ;
REVERSE ; REV index
 ; ("rev",pointedToURN,relName,thisURN)
 D KREVERSE(.OLDOBJ)
 D SREVERSE(.NEWOBJ)
 S @GLOBALX@("rev",IDXNAME)=$H
 Q
SREVERSE(OBJECT) ; Set a relation link index
 Q:$D(OBJECT)<10
 N VALUES,I
 D IDXVALS^VPRJCV(.OBJECT,.VALUES,.IDXMETA) Q:'$D(VALUES)
 S I="" F  S I=$O(VALUES(I)) Q:I=""  S @GLOBALX@("rev",VALUES(I,1),IDXNAME,KEY,I)=""
 Q
KREVERSE(OBJECT) ; Kill a relation link index
 Q:$D(OBJECT)<10
 N VALUES,I
 D IDXVALS^VPRJCV(.OBJECT,.VALUES,.IDXMETA) Q:'$D(VALUES)
 S I="" F  S I=$O(VALUES(I)) Q:I=""  K:$D(@GLOBALX@("rev",VALUES(I,1),IDXNAME,KEY,I)) @GLOBALX@("rev",VALUES(I,1),IDXNAME,KEY,I)
 Q

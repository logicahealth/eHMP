VPRJERR ;KRM/CJE -- Handle User error operations
 ;;1.0;JSON DATA STORE;;MAY 27, 2015
 ;
 Q
 ;
SET(ARGS,BODY)  ; Store error(s) based on the passed in id
 N OBJECT,ERR,ERRNUM,RESULT
 D DECODE^VPRJSON("BODY","OBJECT","ERR") ; From JSON to an array
 I $D(ERR) D SETERROR^VPRJRER(202) Q ""
 S ERRNUM=$I(^VPRJERR(0))
 S OBJECT("id")=ERRNUM
 M ^VPRJERR(ERRNUM)=OBJECT
 Q ""
 ;
CLR(RESULT,ARGS)  ; Clear ALL user data object!!!
 ;**** This operation is IRREVERSIBLE!!!!!! ****
 N VPRJA
 L +^VPRJERR:$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502) Q
 S VPRJA=0
 TSTART
 F  S VPRJA=$O(^VPRJERR(VPRJA)) Q:VPRJA']""  K ^VPRJERR(VPRJA)
 S ^VPRJERR(0)=0
 TCOMMIT
 L -^VPRJERR
 S RESULT="{}"
 Q
 ;
DEL(RESULT,ARGS)  ; Delete a given user data object
 I $G(ARGS("id"))="" D SETERROR^VPRJRER(111,"id is blank") Q
 I $D(^VPRJERR(ARGS("id"))) D
 . L +^VPRJERR(ARGS("id")):$G(^VPRCONFIG("timeout","gds"),5)
 . TSTART
 . K ^VPRJERR(ARGS("id"))
 . TCOMMIT
 . L -^VPRJERR(ARGS("id"))
 S RESULT="{}"
 Q
 ;
LEN(RESULT,ARGS)  ; Returns the total number of user data objects
 N VPRJA,VPRJB,VPRJQ
 S (VPRJA,VPRJB)=0
 L +^VPRJERR:$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502) Q
 F  S VPRJA=$O(^VPRJERR(VPRJA)) Q:VPRJA=""  D
 . S VPRJB=VPRJB+1
 L -^VPRJERR
 S VPRJQ=""""
 S RESULT="{"_VPRJQ_"length"_VPRJQ_":"_VPRJQ_+VPRJB_VPRJQ_"}"
 Q
 ;
GET(RESULT,ARGS) ; Returns user data object
 N OBJECT,FILTER,CLAUSES,CLAUSE,ERR,BODY,ITEM,VALUE
 I $$UNKARGS^VPRJCU(.ARGS,"id,filter") Q
 ; Get any filters and parse them into CLAUSES
 S FILTER=$G(ARGS("filter"))
 I $L(FILTER) D PARSE^VPRJCF(FILTER,.CLAUSES) Q:$G(HTTPERR)
 ; Set OBJECT into ^TMP($J)
 S OBJECT=$NA(^TMP($J,"OBJECT"))
 ; Ensure variables are cleaned out
 K @OBJECT
 ; Get single object
 I $G(ARGS("id"))'="" D
 . M ^TMP($J,"OBJECT","items",1)=^VPRJERR(ARGS("id"))
 . I '$D(@OBJECT) S ERR=1
 I $D(ERR) D SETERROR^VPRJRER(229,"id "_ARGS("id")_" doesn't exist") Q
 ; Get all objects (or run filter) if no uid passed
 I '$D(@OBJECT) D
 . N UID
 . S UID=""
 . N I
 . F I=0:1 S UID=$O(^VPRJERR(UID)) Q:UID=""  D
 . . ; All clauses are wrapped in an implicit AND
 . . I $D(CLAUSES) Q:'$$EVALAND^VPRJGQF(.CLAUSES,$NA(^VPRJERR(UID)))
 . . ; Merge the data (will run only if the filter is true or non-existant)
 . . M @OBJECT@("items",I)=^VPRJERR(UID)
 ; Set Result variable to global
 S RESULT=$NA(^TMP($J,"RESULT"))
 K @RESULT
 ; Encode object into JSON return
 D ENCODE^VPRJSON(OBJECT,RESULT,"ERR") ; From an array to JSON
 ; Clean up staging variable
 K @OBJECT
 I $D(ERR) D SETERROR^VPRJRER(202) Q
 Q
 ;

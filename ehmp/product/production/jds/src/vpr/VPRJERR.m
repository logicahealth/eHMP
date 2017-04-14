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
 N OBJECT,FILTER,CLAUSES,CLAUSE,ERR,BODY,ITEM,VALUE,STARTID,START,LIMIT
 I $$UNKARGS^VPRJCU(.ARGS,"id,filter,startid") Q
 ; STARTID starts at an error id, rather than a position in the error store list
 S STARTID=$G(ARGS("startid")) S:STARTID<1 STARTID=1
 ; We don't want to START with 0, as the 0 node holds the count of total errors in the error store, and negative doesn't work
 ; START starts at a position in the error store list, relative to STARTID
 S START=$G(ARGS("start"),1) S:START<1 START=1
 S LIMIT=$G(ARGS("limit"),999999) ; LIMIT works fine if it is 0 or negative
 ; Get any filters and parse them into CLAUSES
 S FILTER=$G(ARGS("filter"))
 I $L(FILTER) D PARSE^VPRJCF(FILTER,.CLAUSES) Q:$G(HTTPERR)
 ; Set OBJECT into ^||TMP($J)
 S OBJECT=$NA(^||TMP($J,"OBJECT"))
 ; Ensure variables are cleaned out
 K @OBJECT
 ; Get single object
 I $G(ARGS("id"))'="" D
 . M ^||TMP($J,"OBJECT","items",1)=^VPRJERR(ARGS("id"))
 . I '$D(@OBJECT) S ERR=1
 I $D(ERR) D SETERROR^VPRJRER(229,"id "_ARGS("id")_" doesn't exist") Q
 ; Get all objects (or run filter) if no uid passed
 I '$D(@OBJECT) D
 . N UID,CNT,I
 . S UID=(STARTID-1) ; UID should start at STARTID, so we need to move it to the previous id number as it is $ORDERed at loop begin
 . S CNT=0 ; CNT gives us the total items returned (considering filters, start, and limit), not the total in the error store
 . ; LIMIT is on the returned items length, regardless of the error id of each item
 . F I=1:1 S UID=$O(^VPRJERR(UID)) Q:UID=""!(CNT'<LIMIT)  D
 . . I I<START Q  ; Start at the correct position in the error store (relative to the STARTID)
 . . ; All clauses are wrapped in an implicit AND
 . . I $D(CLAUSES),'$$EVALAND^VPRJGQF(.CLAUSES,$NA(^VPRJERR(UID))) Q
 . . E  S CNT=CNT+1 ; Only increment the count for items actually returned after filtering
 . . ; Merge the data (will run only if the filter is true or non-existent)
 . . M @OBJECT@("items",CNT)=^VPRJERR(UID)
 . S @OBJECT@("totalItems")=CNT
 ; Set Result variable to global
 S RESULT=$NA(^||TMP($J,"RESULT"))
 K @RESULT
 ; Encode object into JSON return
 D ENCODE^VPRJSON(OBJECT,RESULT,"ERR") ; From an array to JSON
 ; Clean up staging variable
 K @OBJECT
 I $D(ERR) D SETERROR^VPRJRER(202) Q
 Q
 ;

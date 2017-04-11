VPRJUSR ;AGL/SRG -- Handle User Data Object operations
  ;;1.0;JSON DATA STORE;;JAN 22, 2015
  ;
  Q
  ;
SET(ARGS,BODY)  ; Store or update a user data object based on the passed in id
  N DEMOG,ERR,SID,INCR
  D DECODE^VPRJSON("BODY","DEMOG","ERR") ; From JSON to an array
  I $D(ERR) D SETERROR^VPRJRER(202) Q ""
  I $G(DEMOG("_id"))="" D SETERROR^VPRJRER(220) Q ""
  S SID=DEMOG("_id")
  L +^VPRJUSR(SID):$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502) Q ""
  TSTART
  I $O(^VPRJUSR(SID,""))']"" S INCR=$I(^VPRJUSR(0))
  K ^VPRJUSR(SID)
  M ^VPRJUSR(SID)=DEMOG
  TCOMMIT
  L -^VPRJUSR(SID)
  Q ""
  ;
CLR(RESULT,ARGS)  ; Clear ALL user data object!!!
  ;**** This operation is IRREVERSIBLE!!!!!! ****
  N VPRJA
  L +^VPRJUSR:$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502) Q
  S VPRJA=0
  TSTART
  F  S VPRJA=$O(^VPRJUSR(VPRJA)) Q:VPRJA']""  K ^VPRJUSR(VPRJA)
  S ^VPRJUSR(0)=0
  TCOMMIT
  L -^VPRJUSR
  S RESULT="{}"
  Q
  ;
DEL(RESULT,ARGS)  ; Delete a given user data object
  I $$UNKARGS^VPRJCU(.ARGS,"_id") Q
  I $D(^VPRJUSR(ARGS("_id"))) D
  .L +^VPRJUSR(ARGS("_id")):$G(^VPRCONFIG("timeout","gds"),5)
  .TSTART
  .K ^VPRJUSR(ARGS("_id"))
  .TCOMMIT
  .L -^VPRJUSR(ARGS("_id"))
  S RESULT="{}"
  Q
  ;
LEN(RESULT,ARGS)  ; Returns the total number of user data objects
  N VPRJA,VPRJB,VPRJQ
  S (VPRJA,VPRJB)=0
  L +^VPRJUSR:$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502) Q
  F  S VPRJA=$O(^VPRJUSR(VPRJA)) Q:VPRJA']""  S VPRJB=VPRJB+1
  L -^VPRJUSR
  S VPRJQ=""""
  S RESULT="{"_VPRJQ_"length"_VPRJQ_":"_VPRJQ_VPRJB_VPRJQ_"}"
  Q
  ;
GET(RESULT,ARGS) ; Returns user data object
  N DEMOG,ERR,BODY,SID
  I $$UNKARGS^VPRJCU(.ARGS,"_id") Q
  S SID=ARGS("_id")
  M DEMOG=^VPRJUSR(SID)
  D ENCODE^VPRJSON("DEMOG","BODY","ERR") ; From an array to JSON
  I $D(ERR) D SETERROR^VPRJRER(202) Q
  M RESULT=BODY
  Q

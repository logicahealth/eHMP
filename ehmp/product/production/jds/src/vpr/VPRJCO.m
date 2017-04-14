VPRJCO ;SLC/KCM -- Common Utilities for handling sorting (order parameter)
 ;;1.0;JSON DATA STORE;;Sep 01, 2012
 ;
SETORDER(ORDER) ; set up the order subscripts
 ; expects INDEX for /index/indexname queries, otherwise INDEX undefined
 ; expects TEMPLATE (may be empty)
 ; INDEX, if defined, is from ^VPRMETA("index",name,"common")
 ; returns:
 ;   ORDER(0)=#                ; sort levels
 ;   ORDER(#)=#|name           ; level # or field name
 ;   ORDER(#,"dir")=1 or -1    ; asc or desc
 ;   ; if the field is not part of the subscripts
 ;   ORDER(#,0,fieldSpecInfo)
 ;   ORDER(#,collection,fieldSpecInfo)
 ;   ORDER(#,"ftype")=1|2|3|4  ; field name structure
 ;   ORDER(#,"field")=name     ; field name
 ;   ORDER(#,"mult")=name      ; multiple name
 ;   ORDER(#,"nocase")=1 or 0  ; 1 = case insensitive, 0 = case sensitive
 ;   ORDER(#,"sub")=name       ; subfield name
 ;   ORDER(#,"instance")=level ; which field to use for multiple instance
 ;
 N I,X,F,D,S,C                           ; F=field, D=direction, C=case sensitivity
 S S=0                                   ; S=number of sort levels
 S X=$$LOW^XLFSTR($$TRIM^XLFSTR(ORDER))  ; if only "asc" or "desc" passed
 ; if order field not passed in the order parameter in first sort level, use default order field from index
 ; use of default order field from index only allowed for first sort level
 I ",asc,desc,ci,cs,"[(","_$P(X," ")_",") S ORDER=$P($G(INDEX("order"))," ")_" "_X
 S X=$P(ORDER," ")
 I ",asc,desc,ci,cs,"[(","_X_",") D SETERROR^VPRJRER(110) Q  ; missing order field
 I '$L(ORDER) S ORDER=$G(INDEX("order")) ; use default if no ORDER parameter
 I '$L(ORDER) S ORDER(0)=0 QUIT             ; no sorting
 ; loop through the sorting levels (delimited by commas)
 N J,OPT
 F I=1:1:$L(ORDER,",") S X=$$TRIM^XLFSTR($P(ORDER,",",I)) Q:'$L(X)  D  Q:$G(HTTPERR)
 . S S=S+1
 . S F=$$TRIM^XLFSTR($P(X," "))
 . S D="asc"
 . S C="cs"
 . F J=2:1:$L(X," ") D
 . . S OPT=$$LOW^XLFSTR($$TRIM^XLFSTR($P(X," ",J)))
 . . S:OPT="asc"!(OPT="desc") D=OPT
 . . S:OPT="ci"!(OPT="cs") C=OPT
 . ; if sorting on something already in the index, use the index value
 . S ORDER(I)=$S($D(INDEX("alias",F)):INDEX("alias",F),1:F)
 . I +ORDER(I),$G(INDEX("collate",ORDER(I)))="V" S D=$S(D="asc":"desc",1:"asc")
 . S ORDER(I,"dir")=$S(D="desc":-1,1:1)
 . S ORDER(I,"nocase")=$S(C="ci":1,1:0)
 . Q:+ORDER(I)
 . I F["[" D SETERROR^VPRJRER(109,F) Q  ; arrays have to be indexed for sorting
 . N SPEC
 . D FLDSPEC^VPRJCD(F,.SPEC,$S(HTTPREQ("store")="data":"data",$D(^VPRCONFIG("store",$G(HTTPREQ("store")),"global")):HTTPREQ("store"),1:"vpr"))
 . M ORDER(I,0)=SPEC
 . Q:'$L(TEMPLATE)
 . ; TODO: iterate through template aliases and build a spec for each collection
 S ORDER(0)=S
 QUIT
 ;

VPRJDOCS ;KRM/CJE -- JDS documentation
 Q ; No entry from top
 ;
DATA(RESULT,ARGS)
 N JSON,ERR,BASEURL
 S BASEURL="http://"_$G(HTTPREQ("header","host"))_"/documentation"
 S JSON("data",1)=BASEURL_"/index"
 D ENCODE^VPRJSON("JSON","RESULT","ERR")
 Q
 ;
INDEX(RESULT,ARGS)
 N SEQ,MD,BASEURL,PARAMURL,LOCATION
 S BASEURL="http://"_$G(HTTPREQ("header","host"))_"/documentation"
 S PARAMURL=BASEURL_"/parameters"
 S RESULT=$NA(^||TMP($J))
 F SEQ=1:1 S MD=$P($T(INDEX+SEQ^VPRJDOCSINDEX),";;",2) Q:MD="zzzzz"  D
 . ; Find last character of string and replace it
 . S LOCATION=$F(MD,"parameters/") ;11 Characters
 . I LOCATION S MD=$E(MD,1,LOCATION-12)_PARAMURL_$P(MD,"parameters",2)
 . S ^||TMP($J,SEQ)=MD_$C(13,10)
 Q
 ;
PARAMETERS(RESULT,ARGS)
 N SEQ,MD,PARAMETER
 S RESULT=$NA(^||TMP($J))
 S PARAMETER=$P(ARGS("parameter"),".",1)
 ; Ensure parameter exists, if not exit
 I $T(@PARAMETER^VPRJDOCSPARM)="" Q
 F SEQ=1:1 S MD=$P($T(@PARAMETER+SEQ^VPRJDOCSPARM),";;",2) Q:MD="zzzzz"  D
 . S ^||TMP($J,SEQ)=MD_$C(13,10)
 Q
 ;

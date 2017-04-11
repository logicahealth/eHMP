VPRJWPS ;V4W/DLW -- Save / Retrieve Patient-Related JSON objects - EWD.js REST
 ;;1.0;JSON DATA STORE;;Sep 8, 2015
 ;
SAVE(JPID,NAME,JSON) ; Store patient demographics
 N BODY,HTTPERR,UID
 ;
 M BODY=@NAME
 ;
 S BODY("ewdjs")=1
 S BODY("ewdjs","JSON")=JSON
 ;
 S UID=$$SAVE^VPRJPS(JPID,.BODY)
 ;
 I $G(HTTPERR) Q "HTTPERR"
 E  Q UID
 ;

VPRJWPR ;V4W/DLW -- Handle RESTful operations for patient objects - EWD.js REST
 ;;1.0;JSON DATA STORE;;Jul 23, 2015
 ;
ASSOCIATE(PID,NAME) ; EWD.js REST wrapper that associates a patient with a JPID
 N BODY,EWDERR,HTTPARGS,HTTPERR,JPID
 ;
 S EWDERR=0 ; Hack to pass scoped HTTPERR back to this function
 S HTTPARGS("ewdjs")=1
 S:PID'="" HTTPARGS("jpid")=PID
 M BODY=@NAME
 ;
 S JPID=$$ASSOCIATE^VPRJPR(.HTTPARGS,.BODY) ; Call real function to associate a patient with a JPID
 ;
 I $G(EWDERR) Q "HTTPERR"
 E  Q ""
 ;
PUTPT(NAME) ; EWD.js REST wrapper that stores patient demographics
 N BODY,HTTPARGS,HTTPERR,URL
 ;
 S HTTPARGS("ewdjs")=1
 M BODY=@NAME
 ;
 S URL=$$PUTPT^VPRJPR(.HTTPARGS,.BODY) ; Call real function to store patient demographics
 ;
 I $G(HTTPERR) Q "HTTPERR"
 E  Q URL
 ;
GETPT(PID,TEMPLATE) ; EWD.js REST wrapper that returns patient demographics
 N HTTPARGS,HTTPRSP,HTTPREQ,HTTPERR,SIZE,PREAMBLE
 ;
 I PID[";" S HTTPARGS("pid")=PID
 E  I PID["V" S HTTPARGS("icndfn")=PID
 I TEMPLATE'="" S HTTPARGS("template")=TEMPLATE
 ;
 D GETPT^VPRJPR(.HTTPRSP,.HTTPARGS) ; Call real function to return patient demographics
 ;
 S HTTPREQ("store")="vpr"
 D PAGE^VPRJRUT(.HTTPRSP,0,999999,.SIZE,.PREAMBLE) ; Call function to create page of data and preamble
 ;
 I $G(HTTPERR) Q "HTTPERR"
 E  Q PREAMBLE
 ;
GETOBJ(PID,UID,TEMPLATE) ; EWD.js REST wrapper that returns patient demographics
 N HTTPARGS,HTTPRSP,HTTPREQ,HTTPERR,SIZE,PREAMBLE
 ;
 S HTTPARGS("pid")=PID
 S HTTPARGS("uid")=UID
 I TEMPLATE'="" S HTTPARGS("template")=TEMPLATE
 ;
 D GETOBJ^VPRJPR(.HTTPRSP,.HTTPARGS) ; Call real function to return patient demographics
 ;
 S HTTPREQ("store")="vpr"
 D PAGE^VPRJRUT(.HTTPRSP,0,999999,.SIZE,.PREAMBLE) ; Call function to create page of data and preamble
 ;
 I $G(HTTPERR) Q "HTTPERR"
 E  Q PREAMBLE
 ; 
DELPT(PID) ; EWD.js REST wrapper that removes patient demographics
 N HTTPARGS,HTTPRSP,HTTPERR
 ;
 S HTTPARGS("pid")=PID
 D DELPT^VPRJPR(.HTTPRSP,.HTTPARGS) ; Call real function to remove patient demographics
 ;
 I $G(HTTPERR) Q "HTTPERR"
 E  Q ""
 ;
DELUID(PID,UID) ; EWD.js REST wrapper that removes patient demographics
 N HTTPARGS,HTTPRSP,HTTPERR
 ;
 I PID'="" S HTTPARGS("pid")=PID
 S HTTPARGS("uid")=UID
 ;
 D DELUID^VPRJPR(.HTTPRSP,.HTTPARGS) ; Call real function to remove patient demographics
 ;
 I $G(HTTPERR) Q "HTTPERR"
 E  Q ""
 ;

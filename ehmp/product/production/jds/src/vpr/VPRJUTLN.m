VPRJUTLN ;V4W/DLW -- Utilities for wrapper functions called by cache.node
 ;
 QUIT
 ;
 ; Generate unique identifier for output data used (along with $JOB) to avoid race conditions from asynchronous JS code
 ;
 ; @return {string} UUID - A UUID or a <1:UUID EXCEPTION> error string to return to jds-cache-api
GENUUID()
 N FLAG,I
 ;
 S FLAG=1
 F I=1:1:10 S UUID=$$UUID^VPRJRUT I '$D(^TMP(UUID,$J)),'$D(^TMP("HTTPERR",UUID,$J)) S FLAG=0 Q
 I FLAG QUIT "1:UUID EXCEPTION"
 ;
 QUIT UUID
 ;
 ; Common setup tasks to create the environment for the underlying endpoint call
 ;
 ; @return {none}
SETUP
 ; Set defaults if not passed by jds-cache-api code
 S START=$G(START,0)
 S LIMIT=$G(LIMIT,999999)
 S STARTID=$G(STARTID)
 ; Passes as true/false, but we need 1/0
 I $G(RETCNTS)="true" S RETCNTS=1
 E  S RETCNTS=0
 ;
 ; JDS uses this to flag whether there is an error or not
 S HTTPERR=0
 ; clean any old data
 K:$D(^||TMP($J)) ^||TMP($J)
 K:$D(^||TMP("HTTPERR",$J)) ^||TMP("HTTPERR",$J)
 ;
 QUIT
 ;
 ; Stage return data in an M global array, for retrieveQueryResult in jds-cache-api clients
 ;
 ; @param {array} RESULT - (passed by reference) An array containg the return type of the staged data
 ; @return {string} UUID - A UUID used to stage the return data to retrieveQueryResult in order to avoid races
 ; @param {string} START - The offset (by count of items) to begin at to add to the return array
 ; @param {string} LIMIT - Limit of items (by count) to add to the return array
 ; @param {string} STARTID - The first item (by item number or uid) to add to the return array
 ; @param {string} RETCNTS - Return a header with the totalItems and currentItemCount
 ; @return {string} RETURN - <0|1>:<UUID> Error code followed by UUID key
RETURNDATA(RESULT,UUID,START,LIMIT,STARTID,RETCNTS) ; Return data to jds-cache-api
 N SIZE,PREAMBLE,POSTAMBLE,RETURN
 ;
 ; if there is an error, do not attempt to paginate
 I $G(HTTPERR) K RESULT("pageable")
 ;
 ; equivalent to RSPTYPE=3
 I $D(RESULT("pageable")) D
 . ; support for start, limit, startid, and returncounts for pageable data
 . I STARTID'="" F I=1:1:$G(@RESULT@("total")) I $D(@RESULT@("data",I,STARTID)) S START=START+I Q
 . ; stage output data
 . D PAGE^VPRJRUT(.RESULT,START,LIMIT,.SIZE,.PREAMBLE,RETCNTS)
 . ;
 . ; set ending JSON appropriately by store type
 . I RESULT("pageable")="gds" D
 . . ; set ending JSON appropriately based on whether there is data or not
 . . I PREAMBLE["[" S POSTAMBLE="]}"
 . . E  S POSTAMBLE="}"
 . E  S POSTAMBLE="]}}"
 . ; store data so that jds-cache-api can retrieve it
 . ; return a 1 to represent JDS error, 0 for JDS success
 . I $G(HTTPERR) M ^TMP("HTTPERR",UUID,$J)=^||TMP("HTTPERR",$J) S RETURN=1_":"_UUID
 . E  M ^TMP(UUID,$J,"PREAMBLE")=PREAMBLE,^TMP(UUID,$J)=@RESULT@($J) D
 . . S ^TMP(UUID,$J,"POSTAMBLE")=POSTAMBLE
 . . ; set status code for jds-cache-api
 . . I $G(URL)'="" S ^TMP(UUID,$J,"STATUS")=201
 . . E  S ^TMP(UUID,$J,"STATUS")=200
 . . S RETURN=0_":"_UUID
 ; equivalent to RSPTYPE=2
 E  I $E($G(RESULT))="^" D
 . ; store data so that jds-cache-api can retrieve it
 . ; return a 1 to represent JDS error, 0 for JDS success
 . I $G(HTTPERR) M ^TMP("HTTPERR",UUID,$J)=^||TMP("HTTPERR",$J) S RETURN=1_":"_UUID
 . E  M ^TMP(UUID,$J)=@RESULT D
 . . ; set status code for jds-cache-api
 . . I $G(URL)'="" S ^TMP(UUID,$J,"STATUS")=201
 . . E  S ^TMP(UUID,$J,"STATUS")=200
 . . S RETURN=0_":"_UUID
 ; equivalent to RSPTYPE=1
 E  D 
 . ; store data so that jds-cache-api can retrieve it
 . ; return a 1 to represent JDS error, 0 for JDS success
 . I $G(HTTPERR) M ^TMP("HTTPERR",UUID,$J)=^||TMP("HTTPERR",$J) S RETURN=1_":"_UUID
 . E  M ^TMP(UUID,$J)=RESULT D
 . . ; set status code for jds-cache-api
 . . I $G(URL)'="" S ^TMP(UUID,$J,"STATUS")=201
 . . E  S ^TMP(UUID,$J,"STATUS")=200
 . . S RETURN=0_":"_UUID
 ;
 QUIT RETURN
 ;
 ; Stage return data in an M global array, for retrieveQueryResult in jds-cache-api clients
 ;
 ; @param {array} BODY - (passed by reference) A container array used to pass back the JSON result to the wrapper calls
 ; @param {string} NODEUUID - UUID that jds-cache-api used to stage the set data, used (along with $JOB) to avoid races
 ; @return {none}
STAGEDATA(BODY,NODEUUID) ; Stage data for storage from jds-cache-api
 K BODY
 M BODY=^TMP("BODY",NODEUUID,$J,"data")
 ;
 K:$D(^TMP("BODY",NODEUUID,$J)) ^TMP("BODY",NODEUUID,$J)
 ;
 QUIT
 ;

VPRJDRN ;AFS/MBS -- Handle RESTful operations for data objects
 ;
 QUIT
 ;
 ; Gets an object given a UID
 ;
 ; @param {string} IDENTIFIER - The uid of the object to be retrieved
 ; @param {string} [TEMPLATE=""] - Template to use to format the returned data
 ; @param {string} [START=0] - The offset (by count of items) to begin at to add to the return array
 ; @param {string} [LIMIT=999999] - Limit of items (by count) to add to the return array
 ; @param {string} [STARTID=""] - The first item (by item number or uid) to add to the return array
 ; @param {string} [RETCNTS=0] - Return a header with the totalItems and currentItemCount
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in pjds-client.js
GETOBJ(IDENTIFIER,TEMPLATE,START,LIMIT,STARTID,RETCNTS) ; Called as getOperationalDataByUid in jds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 ;
 ; setup code
 S ARGS("uid")=$G(IDENTIFIER)
 S ARGS("template")=$G(TEMPLATE)
 S HTTPREQ("store")="data"
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; bail if no uid passed in
 I $G(IDENTIFIER)="" D SETERROR^VPRJRER(104) QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; call endpoint
 D GETOBJ^VPRJDR(.RESULT,.ARGS)
 ; ods code will return a result pointer even if empty, which breaks $$RETURNDATA^VPRJUTLN, so handle that
 K:'$D(@RESULT) RESULT
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; GET for objects by index
 ;
 ; @param {string} INDEX - The index to use to retrieve the data
 ; @param {string} [TEMPLATE=""] - Template to use to format the returned data
 ; @param {string} [ORDER=""] - Order of the data items in the return array [asc|desc] [ci|cs]
 ; @param {string} [RANGE=""] - A range of keys to limit the items being retrieved by index
 ; @param {string} [BAIL=""] - Similar to limit, but faster, and is unable to calculate totalItems in RETCNTS
 ; @param {string} [FILTER=""] - A filter expression to apply to the retrieved items
 ; @param {string} [START=0] - The offset (by count of items) to begin at to add to the return array
 ; @param {string} [LIMIT=999999] - Limit of items (by count) to add to the return array
 ; @param {string} [STARTID=""] - The first item (by item number or uid) to add to the return array
 ; @param {string} [RETCNTS=0] - Return a header with the totalItems and currentItemCount
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in pjds-client.js
INDEX(INDEX,TEMPLATE,ORDER,RANGE,BAIL,FILTER,START,LIMIT,STARTID,RETCNTS) ; Called as getOperationalIndexData in jds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 ;
 ; setup code
 S ARGS("indexName")=$G(INDEX)
 S ARGS("template")=$G(TEMPLATE)
 S ARGS("order")=$G(ORDER)
 S ARGS("range")=$G(RANGE)
 S ARGS("bail")=$G(BAIL)
 S ARGS("filter")=$G(FILTER)
 S HTTPREQ("store")="data"
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; bail if no index name passed in
 I $G(INDEX)="" D SETERROR^VPRJRER(101) QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; call endpoint
 D INDEX^VPRJDR(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Get tally or count of objects
 ;
 ; @param {string} COUNTNAME - The name of the tally or count to retrieve
 ; @param {string} [ALL=""] - If passed with value of "true," receive COUNT instead of TALLY
 ; @param {string} [START=0] - The offset (by count of items) to begin at to add to the return array
 ; @param {string} [LIMIT=999999] - Limit of items (by count) to add to the return array
 ; @param {string} [STARTID=""] - The first item (by item number or uid) to add to the return array
 ; @param {string} [RETCNTS=0] - Return a header with the totalItems and currentItemCount
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in pjds-client.js
COUNT(COUNTNAME,ALL,START,LIMIT,STARTID,RETCNTS) ; Called as getOperationalDataCount in jds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 ;
 ; setup code
 S ARGS("countName")=$G(COUNTNAME)
 S HTTPREQ("store")="data"
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; bail if no count name passed in
 I $G(COUNTNAME)="" D SETERROR^VPRJRER(101) QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; call endpoint (if ALL=true, use ALLCOUNT endpoint, otherwise default to COUNT
 I $G(ALL)="true" D ALLCOUNT^VPRJDR(.RESULT,.ARGS)
 E  D COUNT^VPRJDR(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Get objects by collection
 ;
 ; @param {string} COLLECTION - The collection of objects to retrieve
 ; @param {string} [TEMPLATE=""] - Template to use to format the returned data
 ; @param {string} [ORDER=""] - Order of the data items in the return array [asc|desc] [ci|cs]
 ; @param {string} [BAIL=""] - Similar to limit, but faster, and is unable to calculate totalItems in RETCNTS
 ; @param {string} [FILTER=""] - A filter expression to apply to the retrieved items
 ; @param {string} [START=0] - The offset (by count of items) to begin at to add to the return array
 ; @param {string} [LIMIT=999999] - Limit of items (by count) to add to the return array
 ; @param {string} [STARTID=""] - The first item (by item number or uid) to add to the return array
 ; @param {string} [RETCNTS=0] - Return a header with the totalItems and currentItemCount
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in pjds-client.js
FIND(COLLECTION,TEMPLATE,ORDER,BAIL,FILTER,START,LIMIT,STARTID,RETCNTS) ; Called as getOperationalDataCollection in jds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 ;
 ; setup code
 S ARGS("collection")=$G(COLLECTION)
 S ARGS("template")=$G(TEMPLATE)
 S ARGS("order")=$G(ORDER)
 S ARGS("bail")=$G(BAIL)
 S ARGS("filter")=$G(FILTER)
 S HTTPREQ("store")="data"
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; bail if no uid passed in
 I $G(COLLECTION)="" D SETERROR^VPRJRER(215) QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; call endpoint
 D FIND^VPRJDR(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;

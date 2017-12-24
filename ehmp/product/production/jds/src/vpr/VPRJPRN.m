VPRJPRN ;V4W/DLW -- Wrap Patient CRUD calls to REST endpoints for consumption by jdsClient using cache.node in jds-cache-api
 ;
 QUIT
 ;
 ; Get patient demographics from a single site, or from all sites
 ;
 ; @param {string} IDENTIFIER - Either a PID, or an ICN
 ; @param {string} [START=0] - The offset (by count of items) to begin at to add to the return array
 ; @param {string} [LIMIT=999999] - Limit of items (by count) to add to the return array
 ; @param {string} [STARTID=""] - The first item (by item number or uid) to add to the return array
 ; @param {string} [RETCNTS=0] - Return a header with the totalItems and currentItemCount
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in client-utils.js
GETPT(IDENTIFIER,START,LIMIT,STARTID,RETCNTS) ; Called as getPtDemographicsBy{Pid,Icn} in jds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 ;
 ; setup code
 S ARGS("icndfn")=$G(IDENTIFIER)
 S HTTPREQ("store")="vpr"
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; bail if no pid nor icn was passed in
 I $G(IDENTIFIER)="" D SETERROR^VPRJRER(211) QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; call endpoint
 D GETPT^VPRJPR(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Get patient data by index
 ;
 ; @param {string} PID - Patient identifier
 ; @param {string} INDEX - Index name
 ; @param {string} [TEMPLATE=""] - Template to use to format the returned data
 ; @param {string} [ORDER=""] - Order of the data items in the return array [asc|desc] [ci|cs]
 ; @param {string} [RANGE=""] - A range of keys to limit the items being retrieved by index
 ; @param {string} [BAIL=""] - Similar to limit, but faster, and is unable to calculate totalItems in RETCNTS
 ; @param {string} [FILTER=""] - A filter expression to apply to the retrieved items
 ; @param {string} [START=0] - The offset (by count of items) to begin at to add to the return array
 ; @param {string} [LIMIT=999999] - Limit of items (by count) to add to the return array
 ; @param {string} [STARTID=""] - The first item (by item number or uid) to add to the return array
 ; @param {string} [RETCNTS=0] - Return a header with the totalItems and currentItemCount
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in client-utils.js
INDEX(PID,INDEX,TEMPLATE,ORDER,RANGE,BAIL,FILTER,START,LIMIT,STARTID,RETCNTS) ; Called as getPatientIndexData in jds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 ;
 ; setup code
 S ARGS("pid")=$G(PID)
 S ARGS("indexName")=$G(INDEX)
 S ARGS("template")=$G(TEMPLATE)
 S ARGS("order")=$G(ORDER)
 S ARGS("range")=$G(RANGE)
 S ARGS("bail")=$G(BAIL)
 S ARGS("filter")=$G(FILTER)
 S HTTPREQ("store")="vpr"
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; bail if no pid was passed in
 I $G(PID)="" D SETERROR^VPRJRER(226) QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ; bail if no index was passed in
 I $G(INDEX)="" D SETERROR^VPRJRER(101) QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; call endpoint
 D INDEX^VPRJPR(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Get patient data by searching the VPR data store
 ;
 ; @param {string} PID - Patient identifier
 ; @param {string} COLLECTION = Collection name
 ; @param {string} [TEMPLATE=""] - Template to use to format the returned data
 ; @param {string} [ORDER=""] - Order of the data items in the return array [asc|desc] [ci|cs]
 ; @param {string} [BAIL=""] - Similar to limit, but faster, and is unable to calculate totalItems in RETCNTS
 ; @param {string} [FILTER=""] - A filter expression to apply to the retrieved items
 ; @param {string} [START=0] - The offset (by count of items) to begin at to add to the return array
 ; @param {string} [LIMIT=999999] - Limit of items (by count) to add to the return array
 ; @param {string} [STARTID=""] - The first item (by item number or uid) to add to the return array
 ; @param {string} [RETCNTS=0] - Return a header with the totalItems and currentItemCount
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in client-utils.js
FIND(PID,COLLECTION,TEMPLATE,ORDER,BAIL,FILTER,START,LIMIT,STARTID,RETCNTS) ; Called as getPatientDomainData in jds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 ;
 ; setup code
 S ARGS("pid")=$G(PID)
 S ARGS("collection")=$G(COLLECTION)
 S ARGS("template")=$G(TEMPLATE)
 S ARGS("order")=$G(ORDER)
 S ARGS("bail")=$G(BAIL)
 S ARGS("filter")=$G(FILTER)
 S HTTPREQ("store")="vpr"
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; bail if no pid was passed in
 I $G(PID)="" D SETERROR^VPRJRER(226) QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ; bail if no collection was passed in
 I $G(COLLECTION)="" D SETERROR^VPRJRER(215) QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; call endpoint
 D FIND^VPRJPR(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Get patient data counts per domain
 ;
 ; @param {string} PID - Patient identifier
 ; @param {string} COUNTNAME - Count name
 ; @param {string} [START=0] - The offset (by count of items) to begin at to add to the return array
 ; @param {string} [LIMIT=999999] - Limit of items (by count) to add to the return array
 ; @param {string} [STARTID=""] - The first item (by item number or uid) to add to the return array
 ; @param {string} [RETCNTS=0] - Return a header with the totalItems and currentItemCount
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in client-utils.js
COUNT(PID,COUNTNAME,START,LIMIT,STARTID,RETCNTS) ; Called as getPatientCountData in jds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 ;
 ; setup code
 S ARGS("pid")=$G(PID)
 S ARGS("countName")=$G(COUNTNAME)
 S HTTPREQ("store")="vpr"
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; bail if no pid was passed in
 I $G(PID)="" D SETERROR^VPRJRER(226) QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; call endpoint
 D COUNT^VPRJPR(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Get all patient data counts per domain
 ;
 ; @param {string} COUNTNAME
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key
ALLCOUNT(COUNTNAME) ; Called as getAllCountData in jds-client.js
 N ARGS,HTTPERR,HTTPREQ,LIMIT,RESULT,RETCNTS,START,STARTID,UUID
 ;
 ; setup code
 S ARGS("countName")=$G(COUNTNAME)
 S HTTPREQ("store")="xvpr"
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; call endpoint
 D ALLCOUNT^VPRJPR(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Get all patient data by index
 ;
 ; @param {string} INDEX
 ; @param {string} [TEMPLATE=""] - Template to use to format the returned data
 ; @param {string} [ORDER=""] - Order of the data items in the return array [asc|desc] [ci|cs]
 ; @param {string} [RANGE=""] - A range of keys to limit the items being retrieved by index
 ; @param {string} [BAIL=""] - Similar to limit, but faster, and is unable to calculate totalItems in RETCNTS
 ; @param {string} [FILTER=""] - A filter expression to apply to the retrieved items
 ; @param {string} [START=0] - The offset (by count of items) to begin at to add to the return array
 ; @param {string} [LIMIT=999999] - Limit of items (by count) to add to the return array
 ; @param {string} [STARTID=""] - The first item (by item number or uid) to add to the return array
 ; @param {string} [RETCNTS=0] - Return a header with the totalItems and currentItemCount
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key
ALLINDEX(INDEX,TEMPLATE,ORDER,RANGE,BAIL,FILTER,START,LIMIT,STARTID,RETCNTS) ; Called as getAllIndexData in jds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 ;
 ; setup code
 S ARGS("indexName")=$G(INDEX)
 S ARGS("template")=$G(TEMPLATE)
 S ARGS("order")=$G(ORDER)
 S ARGS("range")=$G(RANGE)
 S ARGS("bail")=$G(BAIL)
 S ARGS("filter")=$G(FILTER)
 S HTTPREQ("store")="xvpr"
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; call endpoint
 D ALLINDEX^VPRJPR(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Get all patient data by collection by searching the xvpr data store
 ; FILTER is not optional
 ;
 ; @param {string} COLLECTION - Collection name
 ; @param {string} [TEMPLATE=""] - Template to use to format the returned data
 ; @param {string} [ORDER=""] - Order of the data items in the return array [asc|desc] [ci|cs]
 ; @param {string} [BAIL=""] - Similar to limit, but faster, and is unable to calculate totalItems in RETCNTS
 ; @param {string} FILTER - A filter expression to apply to the retrieved items
 ; @param {string} [START=0] - The offset (by count of items) to begin at to add to the return array
 ; @param {string} [LIMIT=999999] - Limit of items (by count) to add to the return array
 ; @param {string} [STARTID=""] - The first item (by item number or uid) to add to the return array
 ; @param {string} [RETCNTS=0] - Return a header with the totalItems and currentItemCount
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key
ALLFIND(COLLECTION,TEMPLATE,ORDER,BAIL,FILTER,START,LIMIT,STARTID,RETCNTS) ; Called as getAllDomainData in jds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 ;
 ; setup code
 S ARGS("collection")=$G(COLLECTION)
 S ARGS("template")=$G(TEMPLATE)
 S ARGS("order")=$G(ORDER)
 S ARGS("bail")=$G(BAIL)
 S ARGS("filter")=$G(FILTER)
 S HTTPREQ("store")="xvpr"
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; bail if no collection was passed in
 I $G(COLLECTION)="" D SETERROR^VPRJRER(215) QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; call endpoint
 D ALLFIND^VPRJPR(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Get patient data item by PID and UID
 ;
 ; @param {string} PID - Patient identifier
 ; @param {string} UID - Patient data key
 ; @param {string} [TEMPLATE=""] - Template to use to format the returned data
 ; @param {string} [START=0] - The offset (by count of items) to begin at to add to the return array
 ; @param {string} [LIMIT=999999] - Limit of items (by count) to add to the return array
 ; @param {string} [STARTID=""] - The first item (by item number or uid) to add to the return array
 ; @param {string} [RETCNTS=0] - Return a header with the totalItems and currentItemCount
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in client-utils.js
GETOBJ(PID,UID,TEMPLATE,START,LIMIT,STARTID,RETCNTS) ; Called as getPatientDataByPidAndUid in jds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 ;
 ; setup code
 S ARGS("pid")=$G(PID)
 S ARGS("uid")=$G(UID)
 S ARGS("template")=$G(TEMPLATE)
 S HTTPREQ("store")="vpr"
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; bail if no pid was passed in
 I $G(PID)="" D SETERROR^VPRJRER(226) QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; call endpoint
 D GETOBJ^VPRJPR(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Get patient data item by UID
 ;
 ; @param {string} UID - Patient data key
 ; @param {string} [TEMPLATE=""] - Template to use to format the returned data
 ; @param {string} [START=0] - The offset (by count of items) to begin at to add to the return array
 ; @param {string} [LIMIT=999999] - Limit of items (by count) to add to the return array
 ; @param {string} [STARTID=""] - The first item (by item number or uid) to add to the return array
 ; @param {string} [RETCNTS=0] - Return a header with the totalItems and currentItemCount
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in client-utils.js
GETUID(UID,TEMPLATE,START,LIMIT,STARTID,RETCNTS) ; Called as getPatientDataByUid in jds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 ;
 ; setup code
 S ARGS("uid")=$G(UID)
 S ARGS("template")=$G(TEMPLATE)
 S HTTPREQ("store")="xvpr"
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; call endpoint
 D GETUID^VPRJPR(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;

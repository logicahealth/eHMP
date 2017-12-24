VPRJGDSN ;V4W/DLW -- Wrap CRUD calls to GDS REST endpoints for consumption by jdsClient using cache.node in jds-cache-api
 ;
 QUIT
 ;
 ; Create a new data store
 ;
 ; @param {string} STORE - Store name
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in client-utils.js
CREATEDB(STORE) ; Called as createPjdsStore in pjds-client.js
 N ARGS,BODY,HTTPERR,RESULT,URL,UUID
 N LIMIT,RETCNTS,START,STARTID
 ;
 ; setup code
 S ARGS("store")=$G(STORE)
 D SETUP^VPRJUTLN
 S BODY=""
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; call endpoint
 S URL=$$CREATEDB^VPRJCONFIG(.ARGS,.BODY)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Clear a data store, including removing all of its data, indexes, templates, and remove the store itself
 ;
 ; @param {string} STORE - Store name
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in client-utils.js
CLR(STORE) ; Called as clearPjdsStore in pjds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 N LIMIT,RETCNTS,START,STARTID
 ;
 ; setup code
 S HTTPREQ("store")=$$LOW^VPRJRUT($G(STORE))
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; call endpoint
 D CLR^VPRJGDS(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Get information about a data store
 ;
 ; @param {string} STORE - Store name
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in client-utils.js
INFO(STORE) ; Called as getPjdsStoreInfo in pjds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 N LIMIT,RETCNTS,START,STARTID
 ;
 ; setup code
 S HTTPREQ("store")=$$LOW^VPRJRUT($G(STORE))
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; call endpoint
 D INFO^VPRJGDS(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Get a data item from a store by uid, or all data items from the store
 ;
 ; @param {string} STORE - Store name
 ; @param {string} UID - Data item key to retrieve, or empty to retrieve all data items
 ; @param {string} [TEMPLATE=""] - Template to use to format the returned data
 ; @param {string} [ORDER=""] - Order of the data items in the return array [asc|desc] [ci|cs]
 ; @param {string} [SKIPLCKD="false"] - Whether to skip retrieving locked items [true|false]
 ; @param {string} [FILTER=""] - A filter expression to apply to the retrieved items
 ; @param {string} [START=0] - The offset (by count of items) to begin at to add to the return array
 ; @param {string} [LIMIT=999999] - Limit of items (by count) to add to the return array
 ; @param {string} [STARTID=""] - The first item (by item number or uid) to add to the return array
 ; @param {string} [RETCNTS=0] - Whether to return a header with the totalItems and currentItemCount
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in client-utils.js
GET(STORE,UID,TEMPLATE,ORDER,SKIPLCKD,FILTER,START,LIMIT,STARTID,RETCNTS) ; Called as getPjdsStoreData in pjds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 ;
 ; setup code
 S ARGS("uid")=$G(UID)
 S ARGS("template")=$G(TEMPLATE)
 S ARGS("order")=$G(ORDER)
 S ARGS("skiplocked")=$G(SKIPLCKD,"false")
 S ARGS("filter")=$G(FILTER)
 S ARGS("startid")=$G(STARTID)
 S HTTPREQ("store")=$$LOW^VPRJRUT($G(STORE))
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; call endpoint
 D GET^VPRJGDS(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Add a data item to the store
 ;
 ; @param {string} STORE - Store name
 ; @param {string} UID - Data item key to use for the new item, or empty to allow pJDS to assign one
 ; @param {string} PATCH - Whether to allow updates to data items already stored [true|false] - requires a UID
 ; @param {string} NODEUUID - UUID of the storage location of the data item to store (along with $JOB, it prevents races)
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in client-utils.js
SET(STORE,UID,PATCH,NODEUUID) ; Called as setPjdsStoreData in pjds-client.js
 N ARGS,BODY,HTTPREQ,HTTPERR,RESULT,URL,UUID
 N LIMIT,RETCNTS,START,STARTID
 ;
 ; setup code
 S ARGS("uid")=$G(UID)
 S HTTPREQ("store")=$$LOW^VPRJRUT($G(STORE))
 I $G(PATCH)="true" S HTTPREQ("method")="PATCH"
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 D STAGEDATA^VPRJUTLN(.BODY,NODEUUID)
 ;
 ; call endpoint
 S URL=$$SET^VPRJGDS(.ARGS,.BODY)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Delete a data item from the store
 ;
 ; @param {string} STORE - Store name
 ; @param {string} UID - Data item key to remove, or empty to allow remove all data items from store - requires DELETALL to be true
 ; @param {string} DELETEALL - Whether to allow deleting every data item [true|false] - requires UID to be empty
 ; @param {string} [FILTER=""] - A filter expression to apply to the retrieved items
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in client-utils.js
DEL(STORE,UID,DELETEALL,FILTER) ; Called as deletePjdsStoreData in pjds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 N LIMIT,RETCNTS,START,STARTID
 ;
 ; setup code
 S ARGS("uid")=$G(UID)
 S ARGS("confirm")=$G(DELETEALL,"false")
 S ARGS("filter")=$G(FILTER)
 S HTTPREQ("store")=$$LOW^VPRJRUT($G(STORE))
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; call endpoint
 D DEL^VPRJGDS(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Add a new index on a data store
 ;
 ; @param {string} STORE - Store name
 ; @param {string} NODEUUID - UUID of the storage location of the data item to store (along with $JOB, it prevents races)
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in client-utils.js
CINDEX(STORE,NODEUUID) ; Called as createPjdsStoreIndex in pjds-client.js
 N ARGS,BODY,HTTPREQ,HTTPERR,RESULT,URL,UUID
 N LIMIT,RETCNTS,START,STARTID
 ;
 ; setup code
 S HTTPREQ("store")=$$LOW^VPRJRUT($G(STORE))
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 D STAGEDATA^VPRJUTLN(.BODY,NODEUUID)
 ;
 ; call endpoint
 S URL=$$CINDEX^VPRJGDS(.ARGS,.BODY)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;
 ; Get items by index
 ;
 ; @param {string} STORE - Store name
 ; @param {string} IDXNAME - Index name
 ; @param {string} [TEMPLATE=""] - Template to use to format the returned data
 ; @param {string} [ORDER=""] - Order of the data items in the return array [asc|desc] [ci|cs]
 ; @param {string} [RANGE=""] - A range of keys to limit the items being retrieved by index
 ; @param {string} [BAIL=""] - Similar to limit, but faster, and is unable to calculate totalItems in RETCNTS
 ; @param {string} [SKIPLCKD="false"] - Whether to skip retrieving locked items [true|false]
 ; @param {string} [FILTER=""] - A filter expression to apply to the retrieved items
 ; @param {string} [START=0] - The offset (by count of items) to begin at to add to the return array
 ; @param {string} [LIMIT=999999] - Limit of items (by count) to add to the return array
 ; @param {string} [STARTID=""] - The first item (by item number or uid) to add to the return array
 ; @param {string} [RETCNTS=0] - Whether to return a header with the totalItems and currentItemCount
 ; @return {RETURNDATA^VPRJUTLN} RETURN - <0|1>:<UUID> Error code followed by UUID key to retrieveQueryResult in client-utils.js
INDEX(STORE,IDXNAME,TEMPLATE,ORDER,RANGE,BAIL,SKIPLCKD,FILTER,START,LIMIT,STARTID,RETCNTS) ; Called as getPjdsStoreIndex in pjds-client.js
 N ARGS,HTTPERR,HTTPREQ,RESULT,UUID
 ;
 ; setup code
 S ARGS("indexName")=$G(IDXNAME)
 S ARGS("template")=$G(TEMPLATE)
 S ARGS("order")=$G(ORDER)
 S ARGS("range")=$G(RANGE)
 S ARGS("bail")=$G(BAIL)
 S ARGS("skiplocked")=$G(SKIPLCKD,"false")
 S ARGS("filter")=$G(FILTER)
 S ARGS("startid")=$G(STARTID)
 S HTTPREQ("store")=$$LOW^VPRJRUT($G(STORE))
 D SETUP^VPRJUTLN
 ;
 S UUID=$$GENUUID^VPRJUTLN
 Q:UUID="1:UUID EXCEPTION" UUID
 ;
 ; call endpoint
 D INDEX^VPRJGDS(.RESULT,.ARGS)
 ;
 QUIT $$RETURNDATA^VPRJUTLN(.RESULT,UUID,START,LIMIT,STARTID,RETCNTS)
 ;

VPRJDOCSINDEX ;KRM/CJE -- JDS documentation - index
 ;
INDEX
 ;;# Group Patient
 ;;
 ;;Contains all endpoints (Resources) that relate to the patient data section of JDS
 ;;
 ;;# Patient Data [/vpr]
 ;;
 ;;## Add/Update object [POST]
 ;;
 ;;Add/Update a VPR object for a patient. The patient has to be known to JDS (has a JPID) before objects can be added or an error message will occur. A PID, UID, and stampTime are the minimum required fields in the VPR object. Note: The patient data section of JDS is insert only, so updates are full objects.
 ;;
 ;;+ Response 201 (application/json)
 ;;
 ;;        VPR object successfuly added to patient
 ;;
 ;;+ Response 400 (application/json)
 ;;
 ;;        Unable to decode JSON, JPID Collision Detected, Missing UID, Unknown UID format, Missing PID, Missing Metastamp
 ;;
 ;;+ Response 404 (application/json)
 ;;
 ;;        JPID Not Found, Missing patient identifiers
 ;;
 ;;+ Response 502 (application/json)
 ;;
 ;;        Unable to lock record
 ;;
 ;;## Delete store [DELETE /vpr{?confirm}]
 ;;
 ;;Delete the entire patient data store. This irrecoverably removes all patients from the data store.
 ;;
 ;;+ Parameters
 ;;    * confirm: `true` (string,required) - Confirms the deletion of the patient data store
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;        VPR data store deleted
 ;;
 ;;+ Response 400 (application/json)
 ;;
 ;;        Method Not Allowed
 ;;
 ;;# Cross Patient [/vpr/all]
 ;;
 ;;## Cross Patient List [GET /vpr/all/patientlist{?filter}]
 ;;
 ;;Lists all patients stored and all identifiers associated with the patient as well as the lastAccessTime for a patient
 ;;
 ;;+ Parameters
 ;;    :[filter](parameters/filter.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Cross Patient Count [GET /vpr/all/count{?count}]
 ;;
 ;;Count of objects across all patients
 ;;
 ;;+ Parameters
 ;;    :[crossPatientCount](parameters/crossPatientCount.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Cross Patient PID listing [GET /vpr/all/index/pid/pid]
 ;;
 ;;Lists all synced patient identifiers in JDS
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Cross Patient Index [GET /vpr/all/index/{index}{?order}{?filter}{?range}]
 ;;
 ;;+ Parameters
 ;;    :[crossPatientIndex](parameters/crossPatientIndex.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;    :[range](parameters/range.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Cross Patient Index with Template [GET /vpr/all/index/{index}/{template}{?order}{?filter}{?range}]
 ;;
 ;;+ Parameters
 ;;    :[patientIndex](parameters/patientIndex.md)
 ;;    :[patientTemplate](parameters/patientTemplate.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;    :[range](parameters/range.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Cross Patient Find [GET /vpr/all/find/{collection}{?order}{?filter}]
 ;;
 ;;+ Parameters
 ;;    :[patientCollection](parameters/patientCollection.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Cross Patient Find with Template [GET /vpr/all/find/{collection}/{template}{?order}{?filter}]
 ;;
 ;;+ Parameters
 ;;    :[patientCollection](parameters/patientCollection.md)
 ;;    :[patientTemplate](parameters/patientTemplate.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Delete Collection for all patients [DELETE /vpr/all/collection/{collection}]
 ;;
 ;;+ Parameters
 ;;    :[patientCollection](parameters/patientCollection.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;# Individual objects [/vpr/uid]
 ;;
 ;;## Get object by UID [GET /vpr/uid/{uid}]
 ;;
 ;;+ Parameters
 ;;    :[uid](parameters/uid.md)
 ;;+ Response 200 (application/json)
 ;;
 ;;## Delete object by UID [DELETE /vpr/uid/{uid}]
 ;;
 ;;+ Parameters
 ;;    :[uid](parameters/uid.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Get object by UID with template[GET /vpr/uid/{uid}/{template}]
 ;;
 ;;+ Parameters
 ;;    :[uid](parameters/uid.md)
 ;;    :[patientTemplate](parameters/patientTemplate.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;# Patient Demographics [/vpr/pid]
 ;;
 ;;## Get patient demographics [GET /vpr/pid/{icnpidjpid}]
 ;;
 ;;This will return demographics for the given patient. If queried by a PID you will receive the demographics only for the site contained in the PID. If queried by ICN all demographics objects will be returned.
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Get patient demographics [GET /vpr/mpid/{icnpidjpid}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Save Patient objects  [POST /vpr/{icnpidjpid}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve patient objects via an index [GET /vpr/{icnpidjpid}/index/{index}{?order}{?filter}{?range}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;    :[patientIndex](parameters/patientIndex.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;    :[range](parameters/range.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve patient objects via an index with a template [GET /vpr/{icnpidjpid}/index/{index}/{template}{?order}{?filter}{?range}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;    :[patientIndex](parameters/patientIndex.md)
 ;;    :[patientTemplate](parameters/patientTemplate.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;    :[range](parameters/range.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Get the last stored patient object in an index [GET /vpr/{icnpidjpid}/last/{index}{?order}{?filter}{?range}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;    :[patientIndex](parameters/patientIndex.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;    :[range](parameters/range.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve the last stored patient object in an index with a template [GET /vpr/{icnpidjpid}/last/{index}/{template}{?order}{?filter}{?range}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;    :[patientIndex](parameters/patientIndex.md)
 ;;    :[patientTemplate](parameters/patientTemplate.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;    :[range](parameters/range.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve patient data without an index [GET /vpr/{icnpidjpid}/find/{collection}{?order}{?filter}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;    :[patientCollection](parameters/patientCollection.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve patient data without an index and with a template [GET /vpr/{icnpidjpid}/find/{collection}/{template}{?order}{?filter}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;    :[patientCollection](parameters/patientCollection.md)
 ;;    :[patientTemplate](parameters/patientTemplate.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve a single patient data object via patient identifier and uid [GET /vpr/{icnpidjpid}/{uid}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;    :[uid](parameters/uid.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;## Delete a single patient data object via patient identifier and uid [DELETE /vpr/{icnpidjpid}/{uid}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;    :[uid](parameters/uid.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve a single patient data object via patient identifier and uid with a template [GET /vpr/{icnpidjpid}/{uid}/{template}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;    :[uid](parameters/uid.md)
 ;;    :[patientTemplate](parameters/patientTemplate.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve the count of objects for a patient [GET /vpr/{icnpidjpid}/count/{count}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;    :[patientCount](parameters/patientCount.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Get patient demographics [GET /vpr/{icnpidjpid}]
 ;;
 ;;This will return demographics for the given patient. If queried by a PID you will receive the demographics only for the site contained in the PID. If queried by ICN all demographics objects will be returned.
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Delete patient from data store [DELETE /vpr/{icnpidjpid}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve the checksum for a system [GET /vpr/{icnpidjpid}/checksum/{system}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;    :[system](parameters/system.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Delete a collection of objects for a patient [DELETE /vpr/{icnpidjpid}/collection/{collection}{?order}{?filter}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;    :[patientCollection](parameters/patientCollection.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Delete all patients at a site [DELETE /vpr/site/{site}]
 ;;
 ;;+ Parameters
 ;;    :[site](parameters/site.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;# Patient Identifiers [/vpr/jpid]
 ;;
 ;;## Get patient identifiers associated for a patient [GET /vpr/jpid/{icnpidjpid}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Associate patient identifiers for an existing patient [POST /vpr/jpid/{icnpidjpid}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Delete all associated patient identifiers for a patient [DELETE /vpr/jpid/{icnpidjpid}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Associate patient identifiers for a new patient [POST /vpr/jpid]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Delete all associated patient identifiers [DELETE /vpr/jpid/clear]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;# Group Operational
 ;;
 ;;Contains all endpoints (Resources) that relate to the Operational data section of JDS
 ;;
 ;;# Operational Data [/data]
 ;;
 ;;## Add new operational data item [POST /data]
 ;;      summary: Add operational data object to data store
 ;;      description: Adds VPR formatted operational data object to data store
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Remove all operational data items [DELETE /data]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve an individual operational data item [GET /data/{uid}]
 ;;
 ;;+ Parameters
 ;;    :[uid](parameters/uid.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Remove an individual operational data item [DELETE /data/{uid}]
 ;;
 ;;+ Parameters
 ;;    :[uid](parameters/uid.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve an individual operational data item with a template [GET /data/{uid}/{template}]
 ;;
 ;;+ Parameters
 ;;    :[uid](parameters/uid.md)
 ;;    :[operationalTemplate](parameters/operationalTemplate.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve operational data items via an index [GET /data/index/{index}{?order}{?filter}{?range}]
 ;;
 ;;+ Parameters
 ;;    :[operationalIndex](parameters/operationalIndex.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;    :[range](parameters/range.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve operational data items via an index with a template [GET /data/index/{index}/{template}{?order}{?filter}{?range}]
 ;;
 ;;+ Parameters
 ;;    :[operationalIndex](parameters/operationalIndex.md)
 ;;    :[operationalTemplate](parameters/operationalTemplate.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;    :[range](parameters/range.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve the last operational data item stored in an index [GET /data/last/{index}{?order}{?filter}{?range}]
 ;;
 ;;+ Parameters
 ;;    :[operationalIndex](parameters/operationalIndex.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;    :[range](parameters/range.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Get a count of operational data items [GET /data/count/{count}]
 ;;
 ;;+ Parameters
 ;;    :[operationalCount](parameters/operationalCount.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Get operational data items without an index [GET /data/find/{collection}{?order}{?filter}]
 ;;
 ;;+ Parameters
 ;;    :[operationalCollection](parameters/operationalCollection.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Get operational data items without an index with a template [GET /data/find/{collection}/{template}{?order}{?filter}]
 ;;
 ;;+ Parameters
 ;;    :[operationalCollection](parameters/operationalCollection.md)
 ;;    :[operationalTemplate](parameters/operationalTemplate.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Get the number of operational data objects accross all sites and collections [GET /data/all/count/{count}]
 ;;
 ;;+ Parameters
 ;;    :[operationalCount](parameters/operationalCount.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Delete an operational data collection across all sites [DELETE /data/collection/{collection}{?order}{?filter}]
 ;;
 ;;+ Parameters
 ;;    :[operationalCollection](parameters/operationalCollection.md)
 ;;    :[order](parameters/order.md)
 ;;    :[filter](parameters/filter.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Delete all operational data for a site [DELETE /data/site/{site}]
 ;;
 ;;+ Parameters
 ;;    :[site](parameters/site.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;# Group Adminstration
 ;;
 ;;Contains all endpoints (Resources) that relate to the administering JDS
 ;;
 ;;## Ping [GET /ping]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Version [GET /version]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## JDS logging level [/jds/logger/this]
 ;;
 ;;### Retrieve jds logging level [GET]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;### Set JDS logging level [POST]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Set JDS logging level [PUT]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;# Group Session Store
 ;;
 ;;Contains all endpoints (Resources) that relate to the session store
 ;;
 ;;## Create Session [/session/set/this]
 ;;
 ;;### Create Session [POST]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;### Create Session [PUT]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve a session by id [GET /session/get/{id}]
 ;;
 ;;+ Parameters
 ;;    :[id](parameters/id.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Count of all sessions stored [GET /session/length/this]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Delete a session by id [/session/destroy/{id}]
 ;;
 ;;+ Parameters
 ;;    :[id](parameters/id.md)
 ;;
 ;;### Delete a session by id [DELETE]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;### Delete a session by id [GET]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Delete session by id [GET /session/destroy/_id/{id}]
 ;;
 ;;+ Parameters
 ;;    :[id](parameters/id.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Delete all sessions stored [/session/clear/this]
 ;;
 ;;### Delete all sessions stored [DELETE]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;### Delete all sessions stored [GET]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;# Group Mutable operational data
 ;;
 ;;Contains all endpoints (Resources) that relate to the mutable operational data
 ;;
 ;;## Store a mutable operational data item [/odmutable/set/this]
 ;;
 ;;### Store a mutable operational data item [POST]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;### Store a mutable operational data item [PUT]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve a mutable operational data item [GET /odmutable/get/{id}]
 ;;
 ;;+ Parameters
 ;;    :[id](parameters/id.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Count of mutable operational data items [GET /odmutable/length/this]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Remove mutable operational data item [/odmutable/destroy/{id}]
 ;;
 ;;+ Parameters
 ;;    :[id](parameters/id.md)
 ;;
 ;;### Remove mutable operational data item [DELETE]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;### Remove mutable operational data item [GET]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Remove all mutable operational data items [/odmutable/clear/this]
 ;;
 ;;### Remove all mutable operational data items [DELETE]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;### Remove all mutable operational data items [GET]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;# Group User pJDS data store
 ;;
 ;;Contains all endpoints (Resources) that relate to the User store
 ;;
 ;;## Store a user data item  [/user/set/this]
 ;;
 ;;### Store a user data item [POST]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;### Store a user data item [PUT]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve a user data item [GET /user/get/{id}]
 ;;
 ;;+ Parameters
 ;;    :[id](parameters/id.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Count of user data items [GET /user/length/this]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Remove user data item [/user/destroy/{id}]
 ;;
 ;;+ Parameters
 ;;    :[id](parameters/id.md)
 ;;
 ;;### Remove user data item [DELETE]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Remove user data item [GET]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Remove user data item [GET /user/destroy/_id/{id}]
 ;;
 ;;+ Parameters
 ;;    :[id](parameters/id.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Remove all user data items [/user/clear/this]
 ;;
 ;;### Remove all user data items [DELETE]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;### Remove all user data items [GET]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;# Group Error
 ;;
 ;;Contains all endpoints (Resources) that relate to the VX-Sync Error Store
 ;;
 ;;## Store a user data item  [/error/set/this]
 ;;
 ;;### Store a user data item [POST]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;### Store a user data item [PUT]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve a user data item [GET /error/get/{id}]
 ;;
 ;;+ Parameters
 ;;    :[id](parameters/id.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Count of error data items [GET /error/length/this]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Remove error data item [DELETE /error/destroy/{id}]
 ;;
 ;;+ Parameters
 ;;    :[id](parameters/id.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Remove error data item  [GET /error/destroy/{id}]
 ;;
 ;;+ Parameters
 ;;    :[id](parameters/id.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Remove error data item [GET /error/destroy/_id/{id}]
 ;;
 ;;+ Parameters
 ;;    :[id](parameters/id.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Remove all error data items [DELETE /error/clear/this]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Remove all error data items [GET /error/clear/this]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;# Group Garbage Collection
 ;;
 ;;Contains all endpoints (Resources) that relate to garbage collection
 ;;
 ;;## Collect garbage patient data objects for a specific patient [GET /tasks/gc/patient/{icnpidjpid}]
 ;;
 ;;+ Parameters
 ;;    :[icnpidjpid](parameters/icnpidjpid.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Collect garbage patient data objects for all patients [GET /tasks/gc/patient]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Collect garbage operational data objects for a site [GET /tasks/gc/data/{site}]
 ;;
 ;;+ Parameters
 ;;    :[site](parameters/site.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Collect garbage operational data objects for all sites [GET /tasks/gc/data/]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;# Group Generic Data Store
 ;;
 ;;Contains all endpoints (Resources) that relate to the Generic Data Store (pJDS)
 ;;
 ;;## Store Operations [/{store}]
 ;;
 ;;+ Parameters
 ;;    :[store](parameters/store.md)
 ;;
 ;;### Create Generic Data Store [PUT]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;### Return basic store information [GET]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Item CRUD operations [/{store}/{uid}]
 ;;
 ;;+ Parameters
 ;;    :[store](parameters/store.md)
 ;;    :[uid](parameters/uid.md)
 ;;
 ;;### Store an object [PUT]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve an object [GET]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Delete an object [DELETE]
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Create an Index [POST /{store}/index]
 ;;
 ;;+ Parameters
 ;;    :[store](parameters/store.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;
 ;;## Retrieve objects via index [GET /{store}/index/{gdsIndex}]
 ;;
 ;;+ Parameters
 ;;    :[store](parameters/store.md)
 ;;    :[gdsIndex](parameters/gdsIndex.md)
 ;;
 ;;+ Response 200 (application/json)
 ;;zzzzz

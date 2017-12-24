Declare

v_activityjson varchar2(32767);

Begin

DELETE FROM activitydb.data_model_object WHERE processinstanceid < 0;
DELETE FROM activitydb.data_model_instance WHERE processinstanceid < 0;
DELETE FROM activitydb.am_processroute WHERE processInstanceId < 0;
DELETE FROM activitydb.am_processinstance WHERE processinstanceid < 0;

INSERT INTO activitydb.am_processinstance (
    processinstanceid,
    icn,
    pid,
    facilityid,
    processname,
    processdefinitionid,
    deploymentid,
    statusid,
    statustimestamp,
    createdbyid,
    version,
    initiationdate,
    instancename,
    state,
    statestartdate,
    destinationfacilityid,
    assignedto,
    activityhealthy,
    activityhealthdescription,
    type,
    domain,
    description
) VALUES (
    -1,
    '11010V543403',
    'SITE;239',
    '500',
    'DischargeFollowup',
    'Order.DischargeFollowup',
    'VistaCore:Order:2.x.0.2345',
    1,
    TO_DATE('22-JUN-17','DD-MON-RR'),
    'SITE;10000000272',
    '1.0',
    TO_DATE('22-JUN-17','DD-MON-RR'),
    'instancename test data',
    'Active: Pending Response',
    TO_DATE('22-JUN-17','DD-MON-RR'),
    '500',
    'SITE;10000000272',
    1,
    'activityhealthdescription test data',
    'Order',
    'DischargeFollowup',
    'description test data'
);

INSERT INTO activitydb.am_processinstance (
    processinstanceid,
    icn,
    pid,
    facilityid,
    processname,
    processdefinitionid,
    deploymentid,
    statusid,
    statustimestamp,
    createdbyid,
    version,
    initiationdate,
    instancename,
    state,
    statestartdate,
    destinationfacilityid,
    assignedto,
    activityhealthy,
    activityhealthdescription,
    type,
    domain,
    description
) VALUES (
    -2,
    '10123V057919',
    'SITE;722',
    '500',
    'DischargeFollowup',
    'Order.DischargeFollowup',
    'VistaCore:Order:2.x.0.2345',
    1,
    TO_DATE('22-JUN-17','DD-MON-RR'),
    'SITE;10000000271',
    '1.0',
    TO_DATE('22-JUN-17','DD-MON-RR'),
    'instancename test data',
    'Active: Pending Response',
    TO_DATE('22-JUN-17','DD-MON-RR'),
    '500',
    'SITE;10000000272',
    1,
    'activityhealthdescription test data',
    'Order',
    'DischargeFollowup',
    'description test data'
);
INSERT INTO activitydb.am_processinstance (
    processinstanceid,
    icn,
    pid,
    facilityid,
    processname,
    processdefinitionid,
    deploymentid,
    statusid,
    statustimestamp,
    createdbyid,
    version,
    initiationdate,
    instancename,
    state,
    statestartdate,
    destinationfacilityid,
    assignedto,
    activityhealthy,
    activityhealthdescription,
    type,
    domain,
    description
) VALUES (
    -3,
    '11010V543403',
    'SITE;239',
    '500',
    'DischargeFollowup',
    'Order.DischargeFollowup',
    'VistaCore:Order:2.x.0.2345',
    1,
    TO_DATE('22-JUN-17','DD-MON-RR'),
    'SITE;10000000272',
    '1.0',
    TO_DATE('22-JUN-17','DD-MON-RR'),
    'instancename test data',
    'Active: Pending Response',
    TO_DATE('22-JUN-17','DD-MON-RR'),
    '500',
    'SITE;10000000272',
    1,
    'activityhealthdescription test data',
    'Order',
    'DischargeFollowup',
    'description test data'
);
INSERT INTO activitydb.am_processinstance (
    processinstanceid,
    icn,
    pid,
    facilityid,
    processname,
    processdefinitionid,
    deploymentid,
    statusid,
    statustimestamp,
    createdbyid,
    version,
    initiationdate,
    instancename,
    state,
    statestartdate,
    destinationfacilityid,
    assignedto,
    activityhealthy,
    activityhealthdescription,
    type,
    domain,
    description
) VALUES (
    -4,
    '11010V543403',
    'SITE;239',
    '500',
    'DischargeFollowup',
    'Order.DischargeFollowup',
    'VistaCore:Order:2.x.0.2345',
    1,
    TO_DATE('22-JUN-17','DD-MON-RR'),
    'SITE;10000000272',
    '1.0',
    TO_DATE('22-JUN-17','DD-MON-RR'),
    'instancename test data',
    'Active: Pending Response',
    TO_DATE('22-JUN-17','DD-MON-RR'),
    '500',
    'SITE;10000000272',
    1,
    'activityhealthdescription test data',
    'Order',
    'DischargeFollowup',
    'description test data'
);
INSERT INTO activitydb.am_processinstance (
    processinstanceid,
    icn,
    pid,
    facilityid,
    processname,
    processdefinitionid,
    deploymentid,
    statusid,
    statustimestamp,
    createdbyid,
    version,
    initiationdate,
    instancename,
    state,
    statestartdate,
    destinationfacilityid,
    assignedto,
    activityhealthy,
    activityhealthdescription,
    type,
    domain,
    description
) VALUES (
    -5,
    '11010V543403',
    'SITE;239',
    '500',
    'DischargeFollowup',
    'Order.DischargeFollowup',
    'VistaCore:Order:2.x.0.2345',
    2,
    TO_DATE('22-JUN-17','DD-MON-RR'),
    'SITE;10000000272',
    '1.0',
    TO_DATE('22-JUN-17','DD-MON-RR'),
    'instancename test data',
    'Active: Pending Response',
    TO_DATE('22-JUN-17','DD-MON-RR'),
    '500',
    'SITE;10000000272',
    1,
    'activityhealthdescription test data',
    'Order',
    'DischargeFollowup',
    'description test data'
);

INSERT INTO activitydb.am_processinstance (
    processinstanceid,
    icn,
    pid,
    facilityid,
    processname,
    processdefinitionid,
    deploymentid,
    statusid,
    statustimestamp,
    createdbyid,
    version,
    initiationdate,
    instancename,
    state,
    statestartdate,
    destinationfacilityid,
    assignedto,
    activityhealthy,
    activityhealthdescription,
    type,
    domain,
    description
) VALUES (
    -6,
    '11010V543403',
    'SITE;239',
    '500',
    'FakeConsult',
    'Order.FakeConsult',
    'VistaCore:Order:2.x.0.2345',
    1,
    TO_DATE('22-JUN-17','DD-MON-RR'),
    'SITE;10000000272',
    '1.0',
    TO_DATE('22-JUN-17','DD-MON-RR'),
    'instancename test data',
    'Active: Pending Response',
    TO_DATE('22-JUN-17','DD-MON-RR'),
    '500',
    'SITE;10000000272',
    1,
    'activityhealthdescription test data',
    'Order',
    'FakeConsult',
    'description test data'
);
INSERT INTO activitydb.am_processinstance (
    processinstanceid,
    icn,
    pid,
    facilityid,
    processname,
    processdefinitionid,
    deploymentid,
    statusid,
    statustimestamp,
    createdbyid,
    version,
    initiationdate,
    instancename,
    state,
    statestartdate,
    destinationfacilityid,
    assignedto,
    activityhealthy,
    activityhealthdescription,
    type,
    domain,
    description
) VALUES (
    -7,
    '10123V057919',
    'SITE;722',
    '500',
    'DischargeFollowup',
    'Order.DischargeFollowup',
    'VistaCore:Order:2.x.0.2345',
    2,
    TO_DATE('22-JUN-17','DD-MON-RR'),
    'SITE;10000000272',
    '1.0',
    TO_DATE('22-JUN-17','DD-MON-RR'),
    'instancename test data',
    'Active: Pending Response',
    TO_DATE('22-JUN-17','DD-MON-RR'),
    '500',
    'SITE;10000000272',
    0,
    'activityhealthdescription test data',
    'Order',
    'DischargeFollowup',
    'description test data'
);

v_activityjson := '{"activity":{"activityDescription":"Discharge Follow-up is used to document the patient contact after discharge from the hospital. filtertest1","deploymentId":"VistaCore:Order","processDefinitionId":"Order.DischargeFollowup","type":"Order","domain":"Discharge Follow-Up","processInstanceId":"123","instanceName":"Inpatient Discharge","patientUid":"urn:va:patient:[site]:[DFN]:[DFN]","clinicalObjectUid":"","sourceFacilityId":"","destinationFacilityId":"","state":"e","initiator":"urn:va:user:[site]:[DUZ]","timeStamp":"20160420000000","urgency":"9","assignedTo":"","activityHealthy":"1","activityHealthDescription":"","patientName":"FakeName1","health":{"id":"[healthId]","isHealthy":"true","description":"","importance":"1"}},"discharge":{"dateTime":"20170320000000","admitDateTime":"20170319000000","fromFacilityId":"637","fromFacilityDescription":"facility desc3","disposition":"[discharged disposition]","primaryCarePhysicianNameAtDischarge":"[userid3]","primaryCarePhysicianIdAtActivityClosure":"[userId]","primaryCarePhysicianNameAtActivityClosure":"[user name]","primaryCareTeamAtDischarge":"[primary care team1]","timeout":"[configurable timeout value]","diagnosis":{"id":"1","code":"[code]","description":"[diagnosis description]","timeout":"[configurable timeout value]"}},"contact":{"dueDateTime":"20170322000000","attempts":"1"},"follow-up":[{"actionId":"[actionId]","actionText":"Contact Attempt","executionUserId":"[userId]","executionUserName":"[user name]","executionDateTime":"[timestamp]","visit":{"location":"[visit location]","serviceCategory":"[category]","dateTime":"[datetime]"},"comment":"Attempted to call but no answer from the patient","attempt":"1"}],"signals":[]}';
activitydb.data_model_api.save_data_model(-1, 'Order.DischargeFollowup', v_activityjson);

v_activityjson := '{"activity":{"activityDescription":"Discharge Follow-up is used to document the patient contact after discharge from the hospital. filtertest1","deploymentId":"VistaCore:Order","processDefinitionId":"Order.DischargeFollowup","type":"Order","domain":"Discharge Follow-Up","processInstanceId":"123","instanceName":"Inpatient Discharge","patientUid":"urn:va:patient:[site]:[DFN]:[DFN]","clinicalObjectUid":"","sourceFacilityId":"","destinationFacilityId":"","state":"d","initiator":"urn:va:user:[site]:[DUZ]","timeStamp":"20160420000000","urgency":"9","assignedTo":"","activityHealthy":"1","activityHealthDescription":"","patientName":"FakeName4","health":{"id":"[healthId]","isHealthy":"true","description":"","importance":"1"}},"discharge":{"dateTime":"20170321000000","admitDateTime":"20170319000000","fromFacilityId":"637","fromFacilityDescription":"facility desc1","disposition":"[discharged1 disposition]","primaryCarePhysicianNameAtDischarge":"[userid1]","primaryCarePhysicianIdAtActivityClosure":"[userId]","primaryCarePhysicianNameAtActivityClosure":"[user name]","primaryCareTeamAtDischarge":"[primary care team2]","timeout":"[configurable timeout value]","diagnosis":{"id":"1","code":"[code]","description":"[diagnosis description]","timeout":"[configurable timeout value]"}},"contact":{"dueDateTime":"20170322000000","attempts":"2"},"follow-up":[{"actionId":"[actionId]","actionText":"Contact Attempt","executionUserId":"[userId]","executionUserName":"[user name]","executionDateTime":"[timestamp]","visit":{"location":"[visit location]","serviceCategory":"[category]","dateTime":"[datetime]"},"comment":"Attempted to call but no answer from the patient","attempt":"1"}],"signals":[{"name":"END","actionId":"[actionId]","actionText":"Discontinue","history":"[generated value based on the data submitted and the history]","executionUserId":"[userId]","executionUserName":"[user name]","executionDateTime":"[timestamp]","data":{"comment":"Comment from UI Screen"}}]}';
activitydb.data_model_api.save_data_model(-2, 'Order.DischargeFollowup', v_activityjson);

v_activityjson := '{"activity":{"activityDescription":"Discharge Follow-up is used to document the patient contact after discharge from the hospital. filtertest2","deploymentId":"VistaCore:Order","processDefinitionId":"Order.DischargeFollowup","type":"Order","domain":"Discharge Follow-Up","processInstanceId":"123","instanceName":"Inpatient Discharge","patientUid":"urn:va:patient:[site]:[DFN]:[DFN]","clinicalObjectUid":"","sourceFacilityId":"","destinationFacilityId":"","state":"c","initiator":"urn:va:user:[site]:[DUZ]","timeStamp":"20160420000000","urgency":"9","assignedTo":"","activityHealthy":"0","activityHealthDescription":"","patientName":"FakeName3","health":{"id":"[healthId]","isHealthy":"true","description":"","importance":"1"}},"discharge":{"dateTime":"20170322000000","admitDateTime":"20170319000000","fromFacilityId":"637","fromFacilityDescription":"facility desc2","disposition":"[discharged2 disposition]","primaryCarePhysicianNameAtDischarge":"[userid2]","primaryCarePhysicianIdAtActivityClosure":"[userId]","primaryCarePhysicianNameAtActivityClosure":"[user name]","primaryCareTeamAtDischarge":"[primary care team1]","timeout":"[configurable timeout value]","diagnosis":{"id":"1","code":"[code]","description":"[diagnosis description]","timeout":"[configurable timeout value]"}},"contact":{"dueDateTime":"20170322000000","attempts":"3"},"follow-up":[{"actionId":"[actionId]","actionText":"Contact Attempt","executionUserId":"[userId]","executionUserName":"[user name]","executionDateTime":"[timestamp]","visit":{"location":"[visit location]","serviceCategory":"[category]","dateTime":"[datetime]"},"comment":"Attempted to call but no answer from the patient","attempt":"1"}],"signals":[{"name":"END","actionId":"[actionId]","actionText":"Discontinue","history":"[generated value based on the data submitted and the history]","executionUserId":"[userId]","executionUserName":"[user name]","executionDateTime":"[timestamp]","data":{"comment":"Comment from UI Screen"}}]}';
activitydb.data_model_api.save_data_model(-3, 'Order.DischargeFollowup', v_activityjson);

v_activityjson := '{"activity":{"activityDescription":"Discharge Follow-up is used to document the patient contact after discharge from the hospital.","deploymentId":"VistaCore:Order","processDefinitionId":"Order.DischargeFollowup","type":"Order","domain":"Discharge Follow-Up","processInstanceId":"123","instanceName":"Inpatient Discharge","patientUid":"urn:va:patient:[site]:[DFN]:[DFN]","clinicalObjectUid":"","sourceFacilityId":"","destinationFacilityId":"","state":"a","initiator":"urn:va:user:[site]:[DUZ]","timeStamp":"20160420000000","urgency":"9","assignedTo":"","activityHealthy":"0","activityHealthDescription":"","patientName":"FakeName","health":{"id":"[healthId]","isHealthy":"true","description":"","importance":"1"}},"discharge":{"dateTime":"20170320000000","admitDateTime":"20170319000000","fromFacilityId":"637","fromFacilityDescription":"facility desc7","disposition":"[discharged disposition]","primaryCarePhysicianNameAtDischarge":"[userid4]","primaryCarePhysicianIdAtActivityClosure":"[userId]","primaryCarePhysicianNameAtActivityClosure":"[user name]","primaryCareTeamAtDischarge":"[primary care team2]","timeout":"[configurable timeout value]","diagnosis":{"id":"1","code":"[code]","description":"[diagnosis description]","timeout":"[configurable timeout value]"}},"contact":{"dueDateTime":"20170322000000","attempts":"4"},"follow-up":[{"actionId":"[actionId]","actionText":"Contact Attempt","executionUserId":"[userId]","executionUserName":"[user name]","executionDateTime":"[timestamp]","visit":{"location":"[visit location]","serviceCategory":"[category]","dateTime":"[datetime]"},"comment":"Attempted to call but no answer from the patient","attempt":"1"}],"signals":[{"name":"END","actionId":"[actionId]","actionText":"Discontinue","history":"[generated value based on the data submitted and the history]","executionUserId":"[userId]","executionUserName":"[user name]","executionDateTime":"[timestamp]","data":{"comment":"Comment from UI Screen"}}]}';
activitydb.data_model_api.save_data_model(-4, 'Order.DischargeFollowup', v_activityjson);

v_activityjson := '{"activity":{"activityDescription":"Discharge Follow-up is used to document the patient contact after discharge from the hospital.","deploymentId":"VistaCore:Order","processDefinitionId":"Order.DischargeFollowup","type":"Order","domain":"Discharge Follow-Up","processInstanceId":"123","instanceName":"Inpatient Discharge","patientUid":"urn:va:patient:[site]:[DFN]:[DFN]","clinicalObjectUid":"","sourceFacilityId":"","destinationFacilityId":"","state":"a","initiator":"urn:va:user:[site]:[DUZ]","timeStamp":"20160420000000","urgency":"9","assignedTo":"","activityHealthy":"1","activityHealthDescription":"","patientName":"FakeName","health":{"id":"[healthId]","isHealthy":"true","description":"","importance":"1"}},"discharge":{"dateTime":"20170420000000","admitDateTime":"20170319000000","fromFacilityId":"637","fromFacilityDescription":"facility desc5","disposition":"[discharged disposition]","primaryCarePhysicianNameAtDischarge":"[userid]","primaryCarePhysicianIdAtActivityClosure":"[userId]","primaryCarePhysicianNameAtActivityClosure":"[user name]","primaryCareTeamAtDischarge":"[primary care team3]","timeout":"[configurable timeout value]","diagnosis":{"id":"1","code":"[code]","description":"[diagnosis description]","timeout":"[configurable timeout value]"}},"contact":{"dueDateTime":"20170322000000","attempts":"5"},"follow-up":[{"actionId":"[actionId]","actionText":"Contact Attempt","executionUserId":"[userId]","executionUserName":"[user name]","executionDateTime":"[timestamp]","visit":{"location":"[visit location]","serviceCategory":"[category]","dateTime":"[datetime]"},"comment":"Attempted to call but no answer from the patient","attempt":"1"}],"signals":[{"name":"END","actionId":"[actionId]","actionText":"Discontinue","history":"[generated value based on the data submitted and the history]","executionUserId":"[userId]","executionUserName":"[user name]","executionDateTime":"[timestamp]","data":{"comment":"Comment from UI Screen"}}]}';
activitydb.data_model_api.save_data_model(-5, 'Order.DischargeFollowup', v_activityjson);

v_activityjson := '{"activity":{"activityDescription":"Discharge Follow-up is used to document the patient contact after discharge from the hospital.","deploymentId":"VistaCore:Order","processDefinitionId":"Order.FakeConsult","type":"Order","domain":"Discharge Follow-Up","processInstanceId":"123","instanceName":"Inpatient Discharge","patientUid":"urn:va:patient:[site]:[DFN]:[DFN]","clinicalObjectUid":"","sourceFacilityId":"","destinationFacilityId":"","state":"a","initiator":"urn:va:user:[site]:[DUZ]","timeStamp":"20160420000000","urgency":"9","assignedTo":"","activityHealthy":"1","activityHealthDescription":"","patientName":"FakeName","health":{"id":"[healthId]","isHealthy":"true","description":"","importance":"1"}},"discharge":{"dateTime":"20170320000000","admitDateTime":"20170319000000","fromFacilityId":"637","fromFacilityDescription":"facility desc","disposition":"[discharged disposition]","primaryCarePhysicianNameAtDischarge":"[userid]","primaryCarePhysicianIdAtActivityClosure":"[userId]","primaryCarePhysicianNameAtActivityClosure":"[user name]","primaryCareTeamAtDischarge":"[primary care team3]","timeout":"[configurable timeout value]","diagnosis":{"id":"1","code":"[code]","description":"[diagnosis description]","timeout":"[configurable timeout value]"}},"contact":{"dueDateTime":"20170322000000","attempts":"5"},"follow-up":[{"actionId":"[actionId]","actionText":"Contact Attempt","executionUserId":"[userId]","executionUserName":"[user name]","executionDateTime":"[timestamp]","visit":{"location":"[visit location]","serviceCategory":"[category]","dateTime":"[datetime]"},"comment":"Attempted to call but no answer from the patient","attempt":"1"}]}';
activitydb.data_model_api.save_data_model(-6, 'Order.DischargeFollowup', v_activityjson);

v_activityjson := '{"activity":{"activityDescription":"Discharge Follow-up is used to document the patient contact after discharge from the hospital. filtertest1","deploymentId":"VistaCore:Order","processDefinitionId":"Order.DischargeFollowup","type":"Order","domain":"Discharge Follow-Up","processInstanceId":"123","instanceName":"Inpatient Discharge","patientUid":"urn:va:patient:[site]:[DFN]:[DFN]","clinicalObjectUid":"","sourceFacilityId":"","destinationFacilityId":"","state":"e","initiator":"urn:va:user:[site]:[DUZ]","timeStamp":"20160420000000","urgency":"9","assignedTo":"","activityHealthy":"1","activityHealthDescription":"","patientName":"FakeName","health":{"id":"[healthId]","isHealthy":"true","description":"","importance":"1"}},"discharge":{"dateTime":"20170320000000","admitDateTime":"20170319000000","fromFacilityId":"637","fromFacilityDescription":"facility desc","disposition":"[discharged disposition]","primaryCarePhysicianNameAtDischarge":"[userid]","primaryCarePhysicianIdAtActivityClosure":"[userId]","primaryCarePhysicianNameAtActivityClosure":"[user name]","primaryCareTeamAtDischarge":"[primary care team1]","timeout":"[configurable timeout value]","diagnosis":{"id":"1","code":"[code]","description":"[diagnosis description]","timeout":"[configurable timeout value]"}},"contact":{"dueDateTime":"20170322000000","attempts":"1"},"follow-up":[{"actionId":"[actionId]","actionText":"Contact Attempt","executionUserId":"[userId]","executionUserName":"[user name]","executionDateTime":"[timestamp]","visit":{"location":"[visit location]","serviceCategory":"[category]","dateTime":"[datetime]"},"comment":"Attempted to call but no answer from the patient","attempt":"1"}],"signals":[{"name":"END","actionId":"[actionId]","actionText":"Discontinue","history":"[generated value based on the data submitted and the history]","executionUserId":"[userId]","executionUserName":"[user name]","executionDateTime":"[timestamp]","data":{"comment":"Comment from UI Screen"}}]}';
activitydb.data_model_api.save_data_model(-7, 'Order.DischargeFollowup', v_activityjson);
commit;

End;
/
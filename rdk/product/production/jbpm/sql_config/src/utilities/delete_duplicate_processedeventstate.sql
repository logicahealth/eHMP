-- This SQL is also executed in create_jbpm_activity_schema.sql when updating an existing instance of PROCESSED_EVENT_STATE table to add unique constraint
-- However, this file is provided as a utility so that it may be run in an ad-hoc manner as needed for different deployment scenarios.
DELETE FROM "ACTIVITYDB"."PROCESSED_EVENT_STATE" WHERE ID IN
(SELECT ID FROM
  (SELECT ID, DATA_LOCATION, VALUE, LISTENER_ID, row_number()
    over (partition BY DATA_LOCATION, VALUE, LISTENER_ID order by ID)
  AS dup_cnt FROM "ACTIVITYDB"."PROCESSED_EVENT_STATE") WHERE dup_cnt > 1
);
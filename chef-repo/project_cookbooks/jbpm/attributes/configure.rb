#
# Cookbook Name:: jbpm
# Recipe:: default
#

default[:jbpm][:configure][:datasource] = "jbpmDS"
default[:jbpm][:configure][:activitydb_datasource] = "activityDbDS"
default[:jbpm][:configure][:security_domain] = "ehmp"
default[:jbpm][:configure][:processeventlistener] = "gov.va.jbpm.eventlisteners.CustomProcessEventListener"
default[:jbpm][:configure][:taskeventlistener] = "gov.va.jbpm.eventlisteners.CustomTaskEventListener"
default[:jbpm][:configure][:base_route_entity] = "gov.va.jbpm.entities.impl.BaseRoute"
default[:jbpm][:configure][:task_instance_entity] = "gov.va.jbpm.entities.impl.TaskInstanceImpl"
default[:jbpm][:configure][:process_instance_entity] = "gov.va.jbpm.entities.impl.ProcessInstanceImpl"
default[:jbpm][:configure][:task_route_entity] = "gov.va.jbpm.entities.impl.TaskRouteImpl"
default[:jbpm][:configure][:process_route_entity] = "gov.va.jbpm.entities.impl.ProcessRouteImpl"
default[:jbpm][:configure][:event_listener_entity] = "gov.va.signalregistrationservice.entities.EventListener"
default[:jbpm][:configure][:event_match_action_entity] = "gov.va.signalregistrationservice.entities.EventMatchAction"
default[:jbpm][:configure][:event_match_criteria_entity] = "gov.va.signalregistrationservice.entities.EventMatchCriteria"
default[:jbpm][:configure][:simple_match_entity] = "gov.va.signalregistrationservice.entities.SimpleMatch"
default[:jbpm][:configure][:signal_instance_entity] = "gov.va.activitydb.entities.SignalInstance"
default[:jbpm][:configure][:processed_event_state_entity] = "gov.va.eventstatewriteservice.entities.ProcessedEventState"
default[:jbpm][:configure][:rdk_internal_auth_endpoint] = "/resource/authentication/systems/internal"
default[:jbpm][:configure][:rdk_undeploy_endpoint] = "/resource/activities/undeploy-old-deployments"
default[:jbpm][:configure][:remove_legacy_jars] = true
default[:jbpm][:configure][:discharge_followup_timeout] = "30"
default[:jbpm][:configure][:cleanup_activitydb_data] = false

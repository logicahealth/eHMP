
Feature: F142 / F108 Operational sync status can be retrieved for verification

#This feature item requests the operational sync status by site and domain.
      
@f108_1_operational_sync_status
Scenario: Client can request operational sync status from multiple sites and domains
  When the client requests operational sync status for multitple sites
  Then a successful response is returned
  And the operational sync results contain different domains from "Panorama site"
      | field                                                           			| value  |
      | syncOperationalComplete														| true	 |
      | operationalSyncStatus.domainExpectedTotals.immunization-list:SITE.count 	| IS_SET |
    
      | operationalSyncStatus.domainExpectedTotals.signssymptoms-list:SITE.count 	| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.vitaltypes-list:SITE.count 		| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.vitalqualifier-list:SITE.count 	| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.vitalcategory-list:SITE.count 	| IS_SET |
      
      
      | operationalSyncStatus.domainExpectedTotals.doc-def:SITE.count 				| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.labgroup:SITE.count 				| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.asu-class:SITE.count 			| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.asu-rule:SITE.count 				| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.labpanel:SITE.count 				| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.location:SITE.count 				| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.orderable:SITE.count 			| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.pt-select:SITE.count 			| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.quick:SITE.count 				| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.route:SITE.count 				| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.schedule:SITE.count 	| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.user:SITE.count 		| IS_SET |    
      
  And the operational sync results contain different domains from "Kodak site"
      | field                                                          				    | value  |
      | operationalSyncStatus.domainExpectedTotals.immunization-list:SITE.count 		| IS_SET |
      
      | operationalSyncStatus.domainExpectedTotals.signssymptoms-list:SITE.count 		| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.vitaltypes-list:SITE.count 			| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.vitalqualifier-list:SITE.count 		| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.vitalcategory-list:SITE.count 		| IS_SET |
      
      | operationalSyncStatus.domainExpectedTotals.doc-def:SITE.count 					| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.labgroup:SITE.count 					| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.asu-class:SITE.count 				| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.asu-rule:SITE.count 					| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.labpanel:SITE.count 					| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.location:SITE.count 					| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.orderable:SITE.count 				| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.pt-select:SITE.count 				| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.quick:SITE.count 					| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.route:SITE.count 					| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.schedule:SITE.count 					| IS_SET |
      | operationalSyncStatus.domainExpectedTotals.user:SITE.count 						| IS_SET |  
      

  
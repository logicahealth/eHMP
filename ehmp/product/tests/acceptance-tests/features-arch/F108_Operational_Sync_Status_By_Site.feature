
Feature: F108 Operational sync status can be retrieved for verification

#This feature item requests the operational sync status by site and domain.
      
@f108_1_operational_sync_status
Scenario: Client can request operational sync status from multiple sites and domains
  When the client requests operational sync status for multitple sites
  Then a successful response is returned
  And the operational sync results contain different domains from "Panorama site"
      | field                                                           | value                 |
      | uid                                                             | urn:va:syncstatus:OPD |
      | syncOperationalComplete											| true					|
      | operationalSyncStatus.domainExpectedTotals.doc-def:SITE.count 	| 691 					|
      | operationalSyncStatus.domainExpectedTotals.labgroup:SITE.count 	| 16 					|
      | operationalSyncStatus.domainExpectedTotals.asu-class:SITE.count | 119 					|
      | operationalSyncStatus.domainExpectedTotals.asu-rule:SITE.count 	| 179 					|
      | operationalSyncStatus.domainExpectedTotals.labpanel:SITE.count 	| 141 					|
      | operationalSyncStatus.domainExpectedTotals.location:SITE.count 	| 417 					|
      | operationalSyncStatus.domainExpectedTotals.orderable:SITE.count | 4800 					|
      | operationalSyncStatus.domainExpectedTotals.pt-select:SITE.count | 1620 					|
      | operationalSyncStatus.domainExpectedTotals.quick:SITE.count 	| 434 					|
      | operationalSyncStatus.domainExpectedTotals.route:SITE.count 	| 259 					|
      | operationalSyncStatus.domainExpectedTotals.schedule:SITE.count 	| 51 					|
      | operationalSyncStatus.domainExpectedTotals.user:SITE.count 		| IS_SET 					|    
      
  And the operational sync results contain different domains from "Kodak site"
      | field                                                           | value                 |
      | operationalSyncStatus.domainExpectedTotals.doc-def:SITE.count 	| 691 					|
      | operationalSyncStatus.domainExpectedTotals.labgroup:SITE.count 	| 16 					|
      | operationalSyncStatus.domainExpectedTotals.asu-class:SITE.count | 119 					|
      | operationalSyncStatus.domainExpectedTotals.asu-rule:SITE.count 	| 179 					|
      | operationalSyncStatus.domainExpectedTotals.labpanel:SITE.count 	| 141 					|
      | operationalSyncStatus.domainExpectedTotals.location:SITE.count 	| 417 					|
      | operationalSyncStatus.domainExpectedTotals.orderable:SITE.count | 4800 					|
      | operationalSyncStatus.domainExpectedTotals.pt-select:SITE.count | 1620 					|
      | operationalSyncStatus.domainExpectedTotals.quick:SITE.count 	| 434 					|
      | operationalSyncStatus.domainExpectedTotals.route:SITE.count 	| 259 					|
      | operationalSyncStatus.domainExpectedTotals.schedule:SITE.count 	| 51 					|
      | operationalSyncStatus.domainExpectedTotals.user:SITE.count 		| IS_SET 					|  
      

  
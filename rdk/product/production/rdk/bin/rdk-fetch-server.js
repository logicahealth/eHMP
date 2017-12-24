#!/usr/bin/env node

'use strict';
var path = require('path');
var rdk = require('../src/core/rdk');

var ROOT = path.resolve(__dirname, '..');

var app = rdk.appfactory().defaultConfigFilename(ROOT + '/config/rdk-fetch-server-config.json').argv(process.argv).build();
// app.register
// app.start

app.register('/authentication', ROOT + '/src/resources/authentication/auth-resource');
app.register('/user', ROOT + '/src/resources/user/user-resource');

app.register('/sync', ROOT + '/src/resources/patient-record/patient-sync-resource');

app.register('/asu', ROOT + '/src/resources/asu-resource');

app.register('/patient-search', ROOT + '/src/resources/patient-search/patient-search-resource');
app.register('/patient-search', ROOT + '/src/resources/patient-search/search-resource');

app.register('/patient/record/uid', ROOT + '/src/resources/patient-record/patient-uid-resource');
app.register('/patient/record/search', ROOT + '/src/resources/patient-record/search/patient-record-search-resource');
app.register('/patient/record/search/by-type', ROOT + '/src/resources/search-by-type/search-by-type-resource');
app.register('/patient/record', ROOT + '/src/resources/patient-record/patient-record-resource');
app.register('/patient/record/complex-note', ROOT + '/src/resources/patient-record/patient-complex-note-resource');
app.register('/patient/record/cwad', ROOT + '/src/resources/patient-record/patient-cwad-resource');
app.register('/patient/record/labs/by-order', ROOT + '/src/resources/lab-search-by-order-resource');
app.register('/patient/record/labs/by-panel', ROOT + '/src/resources/lab-panels/lab-panels-resource');
app.register('/patient/record/timeline', ROOT + '/src/resources/patient-record/patient-timeline-resource');
app.register('/patient/record/notes', ROOT + '/src/resources/patient-record/patient-notes-resource');
app.register('/patient/record/service-connected', ROOT + '/src/resources/service-connected/service-connected-resource');
app.register('/patient/record/metadata', ROOT + '/src/resources/patient-meta/patientmeta-resource');

app.register('/patient/health-summaries', ROOT + '/src/resources/health-summaries-resource');
app.register('/patient/global-timeline', ROOT + '/src/resources/global-timeline-resource');
app.register('/patient/photo', ROOT + '/src/resources/patient-photo/patient-photo-resource');


// CDS
app.register('/cds/advice', ROOT + '/src/resources/cds-advice/cds-advice-resource');
app.register('/cds/work-product', ROOT + '/src/resources/cds-work-product/cds-work-product-resource');
//cds patient criteria, definitions, list
app.register('/cds/patient', ROOT + '/src/resources/cds-patient-list/patient-list-resource');
//cds job scheduler
app.register('/cds/schedule', ROOT + '/src/resources/cds-schedule/cds-schedule-resource');
app.register('/cds/execute', ROOT + '/src/resources/cds-schedule/cds-execute-resource');
app.register('/cds/engine', ROOT + '/src/resources/cds-engine/cds-engine-resource');
app.register('/cds/intent', ROOT + '/src/resources/cds-intent/cds-intent-resource');
app.register('/cds/metrics', ROOT + '/src/resources/cds-metrics/metrics-resource');

// CRS
app.register('/crs/concept-relationships', ROOT + '/src/resources/crs/concept-relationships-resource');

//Orders
app.register('/order', ROOT + '/src/resources/orders/order-resource');

//Facility
app.register('/facility', ROOT + '/src/resources/facility/facility-resource');

// Locations
app.register('/locations', ROOT + '/src/resources/locations-resource');
app.register('/locations/facility-monikers', ROOT + '/src/resources/facility-moniker/facility-moniker-resource');


// Order Details resource using RPC call
app.register('/order', ROOT + '/src/resources/order-detail-resource');
app.register('/problems', ROOT + '/src/resources/problems-resource');
app.register('/visits', ROOT + '/src/resources/visits/visits-resource');
app.register('/vitals', ROOT + '/src/resources/vitals/vitals-resource');
app.register('/tasks', ROOT + '/src/resources/activitymanagement/tasks/tasks-resource');
app.register('/notifications', ROOT + '/src/resources/notifications/notifications-resource');
app.register('/activities', ROOT + '/src/resources/activitymanagement/activities/activities-resource');
app.register('/activities-with-details', ROOT + '/src/resources/activities-with-details/activities-with-details-resource');
app.register('/notes/recent-titles', ROOT + '/src/resources/notes-title-resource');
app.register('/video-visits', ROOT + '/src/resources/video-visits/video-visits-resource');

//note objects
app.register('/note-objects', ROOT + '/src/resources/note-objects/note-objects-resource');

app.register('/user/screens', ROOT + '/src/resources/user-defined-screens/user-defined-screens-resource');
app.register('/user/screens', ROOT + '/src/resources/user-defined-screens/write-user-defined-screens-resource');
app.register('/user/filter', ROOT + '/src/resources/user-defined-screens/user-defined-filter-resource');
app.register('/user/sort', ROOT + '/src/resources/user-defined-screens/user-defined-sort-resource');
app.register('/user/stack', ROOT + '/src/resources/user-defined-screens/user-defined-stack-resource');

//fhir - metadata must be 1st!
app.register('/fhir/metadata', ROOT + '/src/fhir/conformance/conformance-resource');
app.register('/fhir/patient/:id', ROOT + '/src/fhir/patient-demographics/patient-demographics-resource');
app.register('/fhir/adverseReaction', ROOT + '/src/fhir/adverse-reaction/adverse-reaction-resource');
app.register('/fhir/allergyintolerance', ROOT + '/src/fhir/allergy-intolerance/allergy-intolerance-resource');
app.register('/fhir/patient/:id/observation', ROOT + '/src/fhir/observation/observation-resource');
app.register('/fhir/patient/:id/diagnosticreport', ROOT + '/src/fhir/diagnostic-report/diagnostic-report-resource');
app.register('/fhir/order', ROOT + '/src/fhir/order/order-resource');
app.register('/fhir/patient/:id/diagnosticorder', ROOT + '/src/fhir/order/diagnostic-order/diagnostic-order-resource');
app.register('/fhir/patient/:id/procedure', ROOT + '/src/fhir/procedure/procedure-resource');
// FUTURE-TODO: Uncomment Procedure Request, Device Use Request and Nutrition Order once the FHIR mapping has been completed.
// app.register('/fhir/patient/:id/procedurerequest', ROOT + '/src/fhir/order/procedure-request/procedure-request-resource');
// app.register('/fhir/patient/:id/deviceuserequest', ROOT + '/src/fhir/order/device-use-request/device-use-request-resource');
// app.register('/fhir/patient/:id/nutritionorder', ROOT + '/src/fhir/order/nutrition-order/nutrition-order-resource');
app.register('/fhir/patient/:id/condition', ROOT + '/src/fhir/condition/condition-list-resource');
app.register('/fhir/immunization', ROOT + '/src/fhir/immunization/immunization-resource');
app.register('/fhir/composition', ROOT + '/src/fhir/composition/composition-resource');
app.register('/fhir/referralrequest', ROOT + '/src/fhir/referral-request/referral-request-resource');
app.register('/fhir/medicationdispense', ROOT + '/src/fhir/medication-dispense/medication-dispense-resource');
app.register('/fhir/medicationadministration', ROOT + '/src/fhir/medication-administration/medication-administration-resource');
app.register('/fhir/medicationstatement', ROOT + '/src/fhir/medication-statement/medication-statement-resource');
app.register('/fhir/patient/:id/medicationprescription', ROOT + '/src/fhir/medication-prescription/medication-prescription-resource');

app.register('/fhir/communication', ROOT + '/src/fhir/communication/communication-resource');


// Orderables
app.register('/orderables', ROOT + '/src/resources/orderables/orderables-resource');

// FUTURE-TODO: Uncomment when resource is fully supported/tested end-to-end by system.
// app.register('/favorites', ROOT + '/src/resources/orderables/favorites/favorites-resource');
// app.register('/orderset', ROOT + '/src/resources/orderables/order-set/order-set-resource');
// app.register('/quickorder', ROOT + '/src/resources/orderables/quick-order/quick-order-resource');

app.register('/enterprise-orderable', ROOT + '/src/resources/orderables/enterprise-orderable/enterprise-orderable-resource');

//Authorization
//TODO this will be moved to its own resource server prior to delivery
app.register('/authorize', ROOT + '/src/resources/authorization-check-resource');

//Operational data
app.register('/operational-data/type', ROOT + '/src/resources/jds-operational-data/op-data-resource');
app.register('/operational-data-by-uid', ROOT + '/src/resources/jds-operational-data/operational-data-by-uid-resource');
//vler
app.register('/vler/:pid/toc', ROOT + '/src/resources/vler/toc/toc-resource');

// eHMP Permissions and Permission Sets
app.register('/permission-sets', ROOT + '/src/resources/permission-sets/permission-sets-resource');
app.register('/permissions', ROOT + '/src/resources/permissions/permissions-resource');

app.register('/shortcuts', ROOT + '/src/resources/shortcuts/shortcuts-resource');

// Configuration endpoints
app.register('/configuration', ROOT + '/src/resources/configuration/ehmp-configuration-resource');
app.register('/tracker', ROOT + '/src/resources/tracker/tracker-resource');

// Incident Reporting
app.register('/incident-report', ROOT + '/src/resources/incident-report/incident-report-resource');

//imaging
app.register('/vix-image', ROOT + '/src/resources/vix-image/vix-image-resource');

//prefetch patients
app.register('/prefetch-patients', ROOT + '/src/resources/prefetch-patients/prefetch-patients-resource');

//ehmp versions
app.register('/ehmp-versions', ROOT + '/src/resources/ehmp-versions-list/ehmp-versions-list-resource');

// TEST RESOURCE for Generic RPC Calls
// DO NOT ENABLE IN PRODUCTION; IT IS A SECURITY RISK!
// app.register('/test', '../src/resources/vista-resource');

app.logger.info('app created with ' + app.resourceRegistry.getResources().length + ' mounted endpoints');
app.logger.info('UV_THREADPOOL_SIZE = %s', process.env.UV_THREADPOOL_SIZE);

// FUTURE-TODO: maybe start listening earlier, asynchronously register resources
var port = app.config.appServer.port;
app.rdkListen(port, function() {
    app.logger.info('application now listening on %s', port);
});

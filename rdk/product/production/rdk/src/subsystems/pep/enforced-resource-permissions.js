/**
 * Created by alexluong on 11/2/15.
 */

/**
 * Should be kept up-to-date with: https://wiki.vistacore.us/display/VACORE/Patient+Read+Permission+Mappings#PatientReadPermissionMappings-Resource>Permission
 * Used by pep-config-enforcer-spec.js to ensure resources are assigned the correct permissions
 */
//jshint -W069
var permissions = {};

permissions['patient-record-allergy'] = {
    get: ['read-allergy']
};
permissions['patient-record-appointment'] = {
    get: ['read-encounter']
};
permissions['cds-advice-detail'] = {
    get: ['read-clinical-reminder']
};
permissions['cds-advice-list'] = {
    get: ['read-clinical-reminder']
};
permissions['healthsummaries-getReportContentByReportID'] = {
    get: ['read-vista-health-summary']
};
permissions['healthsummaries-getSitesInfoFromPatientData'] = {
    get: ['read-vista-health-summary']
};
permissions['order-detail'] = {
    get: ['read-order']
};
permissions['patient-record-allergy'] = {
    get: ['read-allergy']
};
permissions['patient-record-appointment'] = {
    get: ['read-encounter']
};
permissions['patient-record-complexnote'] = {
    get: ['read-document']
};
permissions['patient-record-document'] = {
    get: ['read-document']
};
permissions['patient-record-document-view'] = {
    get: ['read-document']
};
permissions['patient-record-immunization'] = {
    get: ['read-immunization']
};
permissions['patient-record-lab'] = {
    get: ['read-order']
};
permissions['patient-record-labsbypanel'] = {
    get: ['read-order']
};
permissions['patient-record-med'] = {
    get: ['read-active-medication']
};
permissions['patient-record-patient'] = {
    get: ['read-patient-record']
};
permissions['patient-record-problem'] = {
    get: ['read-condition-problem']
};
permissions['patient-record-timeline'] = {
    get: ['read-encounter']
};
permissions['patient-record-vital'] = {
    get: ['read-vital']
};
permissions['patient-record-vlerdocument'] = {
    get: ['read-document']
};
permissions['patient-search-full-name'] = {
    get: ['read-patient-record']
};
permissions['patient-search-detail-document'] = {
    get: ['read-patient-record']
};
permissions['patient-search-detail-trend'] = {
    get: ['read-patient-record']
};
permissions['patient-search-last5'] = {
    get: ['read-patient-record']
};
permissions['patient-search-pid'] = {
    get: ['read-patient-record']
};
permissions['patient-search-text'] = {
    get: ['read-patient-record']
};
permissions['patient-search-suggest'] = {
    get: ['read-patient-record']
};
permissions['search-default-search'] = {
    get: ['read-patient-record']
};
permissions['search-global-search'] = {
    get: ['read-patient-record']
};
permissions['tasks-tasks'] = {
    get: ['read-task']
};
permissions['uid'] = {
    get: ['read-patient-record']
};
permissions['user-defined-stack'] = {
    get: ['access-stack-graph']
};

module.exports = permissions;

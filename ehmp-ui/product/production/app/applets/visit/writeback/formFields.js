define([
    'moment',
    'handlebars'
], function(moment, Handlebars) {
    "use strict";

    var providerspickListArray;
    var locationspickListArray;

// *********************************************** CONTAINERS ****************************************
 var selectEncounterProviderContainer = {
        control: "container",
        extraClasses: ["row select-encounter-container"],
        items: [{
            control: "container",
            extraClasses: ["col-md-6"],
            items: [{
                control: "select",
                label: "Select Encounter Provider",
                srOnlyLabel: false,
                name: "selectEncounterProvider",
                placeholder: "Please wait while the list is loading.",
                disabled: true,
                pickList: providerspickListArray,
                showFilter: true,
                groupEnabled: true
            }]
        }]
    };
    var clinicalAppointmentsTab = {
        title: "Clinic Appointments",
        items: [{
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-md-12", "marginTopButtom"],
                template: '<span class="sr-only">{{preSelectSRText}}</span><span>Viewing {{clinicAppointmentsFromDate}} to {{clinicAppointmentsThroughDate}}<span>'
            }]
        }, {
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "selectableTable",
                name: "appointmentsModel",
                id: "selectableTableAppointments",
                collection:  function(appointmentsArray) {
                 return appointmentsArray;
                },
                columns: [{
                    title: "Date",
                    id: "formatteddateTime"
                }, {
                    title: "Details",
                    id: "summary"
                }, {
                    title: "Facility",
                    id: "facilityDisplay"
                }, {
                    title: "Location",
                    id: "locationDisplayName"
                }],
                extraClasses: ["special-class"]
            }]
        }]
    };
    var hospitalAdmissionsTab = {
        title: "Hospital Admissions",
        items: [{
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-md-12", "marginTopButtom"],
                template: '<span>Viewing {{hospitalAdmissionFromDate}} to {{hospitalAdmissionThroughDate}}</span>'
            }]
        }, {
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "selectableTable",
                name: "admissionsModel",
                id: "selectableTableAdmissions",
                collection:  function(admissionsArray) {
                  return admissionsArray;
                },columns: [{
                    title: "Date",
                    id: "formatteddateTime"
                }, {
                    title: "Details",
                    id: "reasonName"
                }, {
                    title: "Facility",
                    id: "facilityDisplay"
                }, {
                    title: "Location",
                    id: "locationDisplayName"
                }],
                extraClasses: ["special-class"]
            }]
        }]
    };
    var newVisitTab = {
        title: "New Visit",
        items: [{
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-md-12"],
                template: '<h6>New Visit</h6>'
            }]
        }, {
            control: "container",
            extraClasses: ["row"],
            items: [{
                control: "container",
                extraClasses: ["col-md-6"],
                items: [{
                    control: "select",
                    label: "New Encounter Location",
                    srOnlyLabel: false,
                    name: "selectnewencounterLocation",
                    disabled: true,
                    pickList: locationspickListArray,
                    showFilter: true,
                    groupEnabled: true
                }]
            }, {
                control: "container",
                extraClasses: ["col-md-6"],
                items: [{
                    control: "container",
                    extraClasses: ["col-md-6"],
                    items: [{
                        control: "datepicker",
                        name: "newVisitDate",
                        srOnlyLabel: false,
                        label: "Date"
                    }]
                }, {
                    control: "container",
                    extraClasses: ["col-md-6"],
                    items: [{
                        control: "timepicker",
                        placeholder: "HH:MM",
                        name: "newVisitTime",
                        srOnlyLabel: false,
                        label: "Time of Visit"
                    }]
                }, {
                    control: "container",
                    extraClasses: ["col-md-12"],
                    items: [{
                        control: "alertBanner",
                        name: "newVisitDateTimeWarning",
                        type: "warning"
                    }]
                }, {
                    control: "container",
                    extraClasses: ["row"],
                    items: [{
                        control: "container",
                        extraClasses: ["col-md-12"],
                        items: [{
                            control: "checkbox",
                            name: "isHistorical",
                            label: "Historical Visit: a visit that occurred at some time in the past or at some other location (possibly non-VA) but is not used for workload credit."
                        }]
                    }]
                }]
            }]
        }]
    };

    var selectEncounterProviderLocation = {
        control: "container",
        extraClasses: ["row"],
        items: [{
            control: "container",
            extraClasses: ["col-md-12"],
            items: [{
                control: "container",
                tagName: "h5",
                extraClasses: ["encounters-sub-heading"],
                template: "Select Encounter Location"
            }, {
                control: "tabs",
                id: "tabs-container",
                tabs: [clinicalAppointmentsTab, hospitalAdmissionsTab, newVisitTab]
            }]
        }]
    };
    // *********************************************** END OF CONTAINERS ****************************************

    // *********************************************** FIELDS ***************************************************
    var formFields = [{
        control: "container",
        extraClasses: ["modal-body"],
        items: [{
            control: "container",
            extraClasses: ["container-fluid"],
            items: [selectEncounterProviderLocation, selectEncounterProviderContainer]
        }]
    }, {
        control: "container",
        extraClasses: ["modal-footer"],
        items: [{
            control: "container",
            extraClasses: ["form-group"],
            items: [{
                control: "checkbox",
                id: "viewEncounters-checkbox",
                label: "View encounter form after setting",
                extraClasses: ["checkbox-inline", "right-margin-xs"],
                name: "viewEncounter"
            }, {
                control: "button",
                type: "submit",
                id: "cancel-btn",
                label: "Cancel",
                disabled: false,
                extraClasses: ["btn-default", "btn-sm"],
                name: "cancel"
            }, {
                control: "button",
                type: "submit",
                id: "viewEncounters-btn",
                label: "Set",
                disabled: true,
                extraClasses: ["btn-default", "btn-sm", "left-margin-xs"],
                name: "set"
            }]
        }]
    }];

    // *********************************************** END OF FIELDS ********************************************


      return formFields;

});
define([
    'backbone',
    'marionette',
    'jquery',
    'async',
    'app/applets/visit/writeback/addselectVisit',
    './collectionHandler'
], function(Backbone, Marionette, $, Async, addselectVisit, collectionHandler) {
    "use strict";

    // Channel constants
    var OPEN_VISIT_SELECTOR = 'openVisitSelector';
    var VISIT = 'visit';
    var visitChannel = ADK.Messaging.getChannel(VISIT),
        currentAppletKey;
    // *********************************************** MODEL ****************************************************
    var FormModel = Backbone.Model.extend({
        defaults: {
            visit: {}
        }
    });
    visitChannel.comply(OPEN_VISIT_SELECTOR, handleOpenVisit);
    // *********************************************** END OF MODEL *********************************************
    // function isVisitSet() {
    //     var currentPatient = ADK.PatientRecordService.getCurrentPatient();
    //     if (!currentPatient.get(VISIT)) return false;
    //     return true;
    // }
    function createForm() {
        // *********************************************** MODEL AND WORKFLOW INSTANCE ******************************
        var formModel = new FormModel({
            newVisit: ''
        });
        var patientModel = ADK.PatientRecordService.getCurrentPatient();
        if (patientModel && patientModel.has('visit')) {
            var visitModel = JSON.parse(JSON.stringify(patientModel.get('visit')));
            if(!visitModel.formatteddateTime || visitModel.formatteddateTime === ''){
                visitModel.visitDateTime = '';
            }
            if (visitModel) {
                formModel.set('contextVisit', new Backbone.Model(visitModel));
            }
        }
        var workflowOptions = {
            size: "medium",
            title: "Change Current Encounter",
            showProgress: false,
            keyboard: true,
            steps: [{
                view: addselectVisit,
                viewModel: formModel
            }]
        };
        var workflow = new ADK.UI.Workflow(workflowOptions);
        workflow.show();
        //************************************************ END MODEL AND WORKFLOW INSTANCE
    }

    function handleOpenVisit(appletKey, options) {
        createForm();
    }
    var applet = {
        id: "visit",
        viewTypes: [{
            type: 'writeback',
            view: addselectVisit,
            chromeEnabled: false
        }],
        defaultViewType: 'writeback'
    };
    return applet;
});
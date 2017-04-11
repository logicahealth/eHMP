define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'async',
    'app/applets/task_forms/common/views/mainBody_View',
    'app/applets/task_forms/common/utils/detailUtils'
], function(Backbone, Marionette, _, Handlebars, Async, MainBodyView, Utils) {
    'use strict';
    var ActivityOverview = {
        startActivityDetails: function(processId, readOnly){
            var modal = new ADK.UI.Modal({
                view: ADK.Views.Loading.create(),
                options: {
                    size: "large",
                    title: "Loading..."
                }
            });
            modal.show();

            var fetchOptions = {
                resourceTitle: 'activities-single-instance',
                cache: false,
                criteria: {
                    id: processId
                },
                onSuccess: function(collection){
                    var model = collection.models[0];
                    Utils.enrichSingleActivityModel(model, ADK.Messaging.request('facilityMonikers'), ADK.WorkspaceContextRepository.currentContextId, readOnly);


                    if(!_.isUndefined(model.get('processDefinitionId'))){
                        // Dynamically load the view controller and left footer button for the given process/activity
                        // Don't set err in Async because it will terminate early and all files may not load by then
                        Async.parallel({
                            domainDetails: function(callback){
                                var activityDomainDetailsViewFile = 'app/applets/task_forms/activities/' + model.get('processDefinitionId').toLowerCase() + '/views/activityDetails_View';
                                require([activityDomainDetailsViewFile], 
                                    function(DomainDetailsContentView){
                                        return callback(null, DomainDetailsContentView);
                                    }, function(err){
                                        return callback(null);
                                });
                            },
                            footerView: function(callback){
                                var activityDetailsFooterFile = 'app/applets/task_forms/activities/' + model.get('processDefinitionId').toLowerCase() + '/views/activityDetailsFooter_View';
                                require([activityDetailsFooterFile], 
                                    function(FooterView){
                                        return callback(null, FooterView);
                                    }, function(err){
                                        return callback(null);
                                });
                            },
                        },
                        function(err, results){
                            if(!_.isUndefined(results.domainDetails)){
                                model.set('domainDetailsContentView', results.domainDetails);
                            }

                            ActivityOverview.launchDetailsModal(model, results.footerView);
                        });
                    }
                }
            };

            ADK.ResourceService.fetchCollection(fetchOptions);
        },
        launchDetailsModal: function(model, FooterView){
            var modalOptions = {
                title: 'Activity Details - ' + model.get('activityName'),
                size: 'large'
            };

            if(!_.isUndefined(FooterView) && !model.get('readOnly')){
                modalOptions.footerView = new FooterView({model: model});
            }

            var detailModal = new ADK.UI.Modal({view: new MainBodyView({model: model}), options: modalOptions});
            detailModal.show();
        }
    };

    return ActivityOverview;
});
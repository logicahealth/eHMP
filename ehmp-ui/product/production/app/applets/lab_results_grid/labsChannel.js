/* global ADK */
define([
    "backbone",
    "marionette",
    'underscore',
    'jquery',
    'app/applets/lab_results_grid/modal/modalView',
    'app/applets/lab_results_grid/modal/stackedGraph',
    "app/applets/lab_results_grid/modal/noteView",
    "app/applets/visit/writeback/addselectVisit"
], function (Backbone, Marionette, _, $, ModalView, StackedGraph, NoteView, AddSelectVisit) {
    'use strict';

    // I am intentionally using a controlled memory leak. As of right now there is never an instance that this
    // channel is turned off. However, doing it this way will give us the ability to do so in the future.
    var labs;

    var appletChannel = ADK.Messaging.getChannel('lab_results_grid');
    var timeLineChannel = ADK.Messaging.getChannel('labresults_timeline_detailview');


    //noinspection UnnecessaryLocalVariableJS
    var LabsChannel = Marionette.Object.extend({
        labsChannel: appletChannel,
        labChannelEvents: {
            detailView: 'showDetailsView',
            notesView: 'showNotesView'
        },
        initialize: function initialize() {
            this.bindEntityEvents(this.labsChannel, this.labChannelEvents);
        },
        onBeforeDestroy: function onBeforeDestroy() {
            this.unbindEntityEvents(this.labsChannel, this.labChannelEvents);
        },
        showDetailsView: function showDetailsView(params) {
            var modalView = new ModalView({
                model: params.model,
                collection: params.model.collection,
                navHeader: false
            });

            var model = params.model;
            var title =  model.get('typeName') + ' - ' + model.get('specimen');

            var modalOptions = {
                'fullScreen': params.isFullscreen,
                'size': "xlarge",
                'title': title
            };

            var modal = new ADK.UI.Modal({
                view: modalView,
                options: modalOptions
            });

            modal.show();
        },
        showNotesView: function showNotesView(params) {
            var model = new Backbone.Model(params.model.attributes);

            var options = {
                size: 'medium',
                showProgress: false,
                keyboard: true,
                steps: [],
                title: 'Create Note Object'
            };

            ADK.utils.writebackUtils.handleVisitWorkflow(options, AddSelectVisit);

            options.steps.push({
                view: NoteView,
                viewModel: model
            });

            var workflow = new ADK.UI.Workflow(options);
            workflow.show();
        }
    });


    var labsChannel = {
        startListening: function startListening() {
            labs = new LabsChannel();
        },
        stopListening: function stopListening() {
            if (labs) {
                labs.destroy();
                labs = null;
            }
        },
        startReplying: function startReplying() {
            appletChannel.reply('chartInfo', labsChannel._chartInfo);
        },
        stopReplying: function stopReplying() {
            appletChannel.stopReplying('chartInfo');
        },
        _chartInfo: function chartInfo(params) {
            var displayName = params.typeName;
            var chartModel = new Backbone.Model({
                typeName: params.typeName,
                displayName: displayName,
                requesterInstanceId: params.instanceId,
                graphType: params.graphType,
                applet_id: 'lab_results_grid'
            });

            var response = $.Deferred();

            var stackedGraph = new StackedGraph({
                model: chartModel,
                target: null,
                requestParams: params
            });

            response.resolve({
                view: stackedGraph
            });

            return response.promise();
        }
    };


    var timelineChannel = {
        startReplying: function startReplying() {
            timeLineChannel.reply('detailView', timelineChannel._detailsView);
        },
        stopReplying: function stopReplying() {
            timeLineChannel.stopReplying('detailsView');
        },
        _detailsView: function detailsView(params) {
            var model = params.model;
            var title = model.get('summary') || model.get('typeName') + ' - ' + model.get('specimen');
            if (_.isString(title)) {
                title = title.replace(/(<([^>]+)>)/g, '');
            }

            if (model.get('basicResult')) {
                // This is a solr result and is not enough info to draw the Modal.
                var collection = new ADK.UIResources.Fetch.Labs.GridCollection();
                var isFirst = true;
                collection.fetchOptions.criteria.filter = 'eq(uid,"' + model.get('uid') + '")';
                return {
                    title: function() {
                        if (isFirst) {
                            isFirst = false;
                            return 'Loading';
                        }
                        return title;
                    },
                    view: ModalView.extend({
                        model: model,
                        collection: collection
                    })
                };
            }
            return {
                title: title,
                view: ModalView.extend({
                    model: params.model,
                    collection: params.model.collection
                })
            };
        }
    };


    return {
        start: function start() {
            labsChannel.startListening();
            labsChannel.startReplying();
            timelineChannel.startReplying();
        },
        stop: function stop() {
            labsChannel.stopListening();
            labsChannel.stopReplying();
            timelineChannel.stopReplying();
        },
        labsChannel: labsChannel,
        timelineChannel: timelineChannel
    };
});
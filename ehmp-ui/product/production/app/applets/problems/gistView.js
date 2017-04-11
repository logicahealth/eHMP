define([
    'backbone',
    'underscore',
    'app/applets/problems/modalView/modalView',
    'app/applets/problems/modalView/modalHeaderView',
    'app/applets/problems/modalView/modalFooterView',
    'app/applets/problems/util',
    'hbs!app/applets/problems/list/tooltip',
    'moment',
    'app/applets/problems/writeback/AddEditProblems',
    'app/applets/problems/writeback/workflowUtils',
    'hbs!app/applets/problems/list/gistViewLayout',
    'hbs!app/applets/problems/list/gistChildLayout'
], function(Backbone, _, ModalView, modalHeader, modalFooter, Util, tooltip, moment, AddEditProblemsView, WorkflowUtils, gistViewLayout, gistChildLayout) {
    'use strict';

    var allEncounterDateArray = [];
    
    var gistConfiguration = {
        //TODO: This needs to be moved to the collection
        transformCollection: function(collection) {
            var ProblemGroupModel = ADK.UIResources.Fetch.Problems.Model.extend({});
            var problemGroupsCollection = collection;
            var instanceId = this.options.instanceId;
            problemGroupsCollection.comparator = function(problemOne, problemTwo) {
                if (problemOne.get('statusName') === problemTwo.get('statusName')) {
                    if (problemOne.get('timeSinceDate') > problemTwo.get('timeSinceDate')) {
                        return -1;
                    } else if (problemOne.get('timeSinceDate') < problemTwo.get('timeSinceDate')) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (problemOne.get('statusName') === 'Active') {
                        return -1;
                    } else {
                        return 1;
                    }
                }
            };
            var encounterDateArray, problemGroup_EncounterCount;
            //group collection of models by standardizedDescription
            var groups = problemGroupsCollection.groupBy(function(problem) {
                return Util.getProblemGroupByData(problem).groupbyValue;
            });
            //map grouped problems and return the models
            var screenId = ADK.Messaging.request('get:current:screen').config.id;
            var problemGroups = _.map(groups, function(problems, groupName) {
                return new ProblemGroupModel({
                    groupName: groupName,
                    probs: problems,
                    serviceConnected: problems[0].get('serviceConnected'),
                    militarySexualTrauma: problems[0].get('militarySexualTrauma'),
                    militarySexualTraumaBool: problems[0].get('militarySexualTrauma') === 'YES',
                    persianGulfExposure: problems[0].get('persianGulfExposure'),
                    persianGulfExposureBool: problems[0].get('persianGulfExposure') === 'YES',
                    radiationExposure: problems[0].get('radiationExposure'),
                    radiationExposureBool: problems[0].get('radiationExposure') === 'YES',
                    shipboardHazard: problems[0].get('shipboardHazard'),
                    shipboardHazardBool: problems[0].get('shipboardHazard') === 'YES',
                    headNeckCancer: problems[0].get('headNeckCancer'),
                    headNeckCancerBool: problems[0].get('headNeckCancer') === 'YES',
                    agentOrangeExposure: problems[0].get('agentOrangeExposure'),
                    agentOrangeExposureBool: problems[0].get('agentOrangeExposure') === 'YES',
                    allGroupedComments: [],
                    acuityName: problems[0].get('acuityName'),
                    statusName: problems[0].get('statusDisplayName'),
                    timeSince: problems[0].get('timeSince'),
                    age: problems[0].get('age'),
                    timeSinceDateString: problems[0].get('timeSinceDateString'),
                    timeSinceText: problems[0].get('timeSinceText'),
                    uid: problems[0].get('uid'),
                    id: problems[0].get('uid').replace(/[:|.]/g, "_"),
                    entered: problems[0].get('entered'),
                    documents: problems[0].get('documents'),
                    encounters: problems[0].get('encounters'),
                    problemText: problems[0].get('problemText'),
                    locationName: problems[0].get('locationName'),
                    service: problems[0].get('service'),
                    providerUid: problems[0].get('providerUid'),
                    facilityMoniker: problems[0].get('facilityMoniker'),
                    pid: problems[0].get('pid'),
                    summary: problems[0].get('summary'),
                    icdCode: problems[0].get('icdCode'),
                    snomedCode: problems[0].get('snomedCode'),
                    onset: problems[0].get('onset'),
                    onsetFormatted: problems[0].get('onsetFormatted'),
                    providerDisplayName: problems[0].get('providerDisplayName'),
                    facilityName: problems[0].get('facilityName'),
                    locationUid: problems[0].get('locationUid'),
                    locationDisplayName: problems[0].get('locationDisplayName'),
                    updated: problems[0].get('updated'),
                    comments: problems[0].get('comments'),
                    timeSinceDate: problems[0].get('timeSinceDate'),
                    codes: problems[0].get('codes'),
                    applet_id: "problems",
                    instanceId: instanceId,
                    allGroupedEncounters: [],
                    crsDomain: ADK.utils.crsUtil.domain.PROBLEM,
                    lexiconCode: problems[0].get('lexiconCode'),
                    standardizedDescription: problems[0].get('standardizedDescription'),
                    updatedFormatted: problems[0].get('updatedFormatted'),
                    facilityCode: problems[0].get('facilityCode'),
                    facNameTruncated: problems[0].get('facilityName').substring(0, 3),
                    enteredBy: problems[0].get('enteredBy'),
                    recordedBy: problems[0].get('recordedBy'),
                    recordedOn: problems[0].get('recordedOn')
                });
            });
            problemGroupsCollection.reset(problemGroups);

            //function to group the encounters by date and map them
            function groupEncounters(encounterDateArray) {
                var encounterDateGroup = _.groupBy(encounterDateArray, function(date) {
                    return date;
                });
                encounterDateGroup = _.map(encounterDateGroup, function(dateArray, dateString) {
                    return {
                        date: dateString,
                        count: dateArray.length
                    };
                });
                return encounterDateGroup;
            }

            //Going through each Problem Group in the collection
            for (var q = 0; q < problemGroupsCollection.length; q++) {
                problemGroup_EncounterCount = 0;
                var problemGroup = problemGroupsCollection.at(q);
                //Going through each Problem of the Group
                for (var r = 0; r < problemGroup.get('probs').length; r++) {
                    var problem = problemGroup.get('probs')[r];
                    encounterDateArray = [];
                    //Push all comments within a group to allGroupedComments array
                    if (problem.get('comments') && problem.get('comments') !== undefined) {
                        for (var d = 0; d < problem.get('comments').length; d++) {
                            var comments = problem.get('comments')[d];
                            problemGroup.get('allGroupedComments').push(comments.comment);
                        }
                    }

                    //Push all encounter within a group to allGroupedEncounters array
                    if (problem.get('encounters')) {
                        for (var s = 0; s < problem.get('encounters').length; s++) {
                            var encounter = problem.get('encounters')[s];

                            var _date = encounter.dateTime + '';
                            _date = _date.substr(0, 8);
                            var _slashDate = _date.replace(/(\d{4})(\d{2})(\d{2})/, "$2/$3/$1");

                            encounterDateArray.push(_date);
                            allEncounterDateArray.push(_date);
                            problemGroup.get('allGroupedEncounters').push({
                                dateTime: _slashDate,
                                stopCodeName: encounter.facilityName,
                                problemText: problemGroup.get('problemText'),
                                acuity: problemGroup.get('acuityName')
                            });
                        }
                        problem.set('encouterDates', encounterDateArray);
                    } else {
                        // problemGroup.get('timeSinceDate') looks to be in milliseconds
                        encounterDateArray.push(moment(problemGroup.get('timeSinceDate'), "YYYYMMDD").format("YYYYMMDD"));
                        allEncounterDateArray.push(moment(problemGroup.get('timeSinceDate'), "YYYYMMDD").format("YYYYMMDD"));
                        problemGroup.get('allGroupedEncounters').push({
                            dateTime: moment(problemGroup.get('timeSinceDate'), "YYYYMMDD").format("MM/DD/YYYY"),
                            stopCodeName: problem.get('facilityName'),
                            problemText: problemGroup.get('problemText'),
                            acuity: problemGroup.get('acuityName')
                        });
                        problem.set('encouterDates', encounterDateArray);
                    }
                    //Sort the encounters in allGroupedEncounters array
                    Util.sortData({
                        problemGroup: problemGroup
                    });
                    //Reset allGroupedEncounters with most five recent encounters
                    problemGroup.set('allGroupedEncounters', problemGroup.get('allGroupedEncounters').slice(0, 5));
                    problemGroup_EncounterCount += encounterDateArray.length;
                    var allEncountersGroupedByDate = groupEncounters(encounterDateArray);
                    var date, count;
                    var max = 0;
                    var series = [];
                    allEncounterDateArray.sort(Util.compare);
                    //Going through grouped encounters and add dates and number of encounters to graph property
                    for (var k = 0; k < allEncountersGroupedByDate.length; k++) {
                        date = allEncountersGroupedByDate[k].date;
                        count = allEncountersGroupedByDate[k].count;

                        if (max < count) {
                            max = count;
                        }
                        series.push([moment(date, "YYYYMMDD").valueOf(), count]);
                    }

                    problemGroup.set('graphData', {
                        series: series
                    });
                }

                problemGroup.set('encounterCount', problemGroup_EncounterCount);
            }
            var oDate, nDate;
            var now = moment.utc().startOf('day').valueOf();
            var newDuration = moment.duration({
                'months': 6
            });
            oDate = moment.utc(_.first(allEncounterDateArray), "YYYY").valueOf();
            nDate = moment(now).add(newDuration).valueOf();
            problemGroupsCollection.each(function(model) {
                model.get('graphData').oldestDate = oDate;
                model.get('graphData').newestDate = nDate;
                // Create QuickView html string(tooltip)
                model.set('tooltip', tooltip(model));
            });
            return problemGroupsCollection;
        }
    };

    var GistViewItem = ADK.Views.EventGist.getRowItem().extend({
        template: gistChildLayout
    });

    var ExtendedGistView = ADK.Views.EventGist.getView().extend({
        template: gistViewLayout,
        childView: GistViewItem
    });

    var GistView = ADK.AppletViews.EventsGistView.extend({
        appletOptions: {
            gistHeaders: {
                name: {
                    title: 'Problem',
                    sortable: true,
                    sortType: 'alphabetical',
                    key: 'groupName',
                    hoverTip: 'conditions_problem'
                },
                acuityName: {
                    title: 'Acuity',
                    sortable: true,
                    sortType: 'alphabetical',
                    key: 'acuityName',
                    hoverTip: 'conditions_acuity'
                },
                statusName: {
                    title: 'Status',
                    sortable: true,
                    sortType: 'alphabetical',
                    key: 'statusName',
                    hoverTip: 'conditions_status'
                },
                facilityMoniker: {
                    title: 'Facility',
                    sortable: true,
                    sortType: 'alphabetical',
                    key: 'facilityMoniker',
                    hoverTip: 'conditions_facility'
                }
            },
            gistModel: [{
                id: 'groupName',
                field: 'groupName'
            }, {
                id: 'allGroupedComments',
                field: 'allGroupedComments'
            }, {
                id: 'facilityMoniker',
                field: 'facilityMoniker'
            }, {
                id: 'statusName',
                field: 'statusName'
            }, {
                id: 'acuityName',
                field: 'acuityName'
            }, {
                id: 'problemText',
                field: 'problemText'
            }],
            filterFields: ['problemText', 'standardizedDescription', 'acuityName', 'statusName', 'onsetFormatted', 'updatedFormatted', 'providerDisplayName', 'facilityMoniker', 'comments']
        },
        initialize: function(options) {
            this._super = ADK.AppletViews.EventsGistView.prototype;

            this.appletOptions.enableTileSorting = true;
            this.appletOptions.collectionParser = gistConfiguration.transformCollection;
            this.appletOptions.serializeData = this._serializeData;
            this.appletOptions.serializeModel = this._serializeData;
            this.appletOptions.showLinksButton = true;
            this.appletOptions.showCrsButton = true;
            this.appletOptions.AppletView = ExtendedGistView;

            if (ADK.UserService.hasPermission('add-condition-problem') && ADK.PatientRecordService.isPatientInPrimaryVista()) {
                this.appletOptions.onClickAdd = function(event) {
                    event.preventDefault();
                    onAddProblems();
                };

            }

            if (ADK.UserService.hasPermission('edit-condition-problem') && ADK.PatientRecordService.isPatientInPrimaryVista()) {
                this.appletOptions.showEditButton = true;
                this.appletOptions.disableNonLocal = true;
            }

            this.listenTo(ADK.Messaging.getChannel('problems'), 'editView', function(channelObj) {
                var existingProblemModel = channelObj.model;
                if (existingProblemModel.get('instanceId') === this.options.appletConfig.instanceId) {
                    ADK.UI.Modal.hide();
                    WorkflowUtils.startEditProblemsWorkflow(AddEditProblemsView, existingProblemModel);
                }
            });
            this.listenTo(ADK.Messaging.getChannel('problems'), 'detailView', function(params) {
                var model = params.model;
                var view = new ModalView({
                    model: model,
                    collection: params.collection
                });
                var modalOptions = {
                    'title': Util.getModalTitle(model),
                    'size': 'normal',
                    'headerView': modalHeader.extend({
                        model: model,
                        theView: view
                    }),
                    'footerView': modalFooter.extend({
                        model: model
                    })
                };
                var modal = new ADK.UI.Modal({
                    view: view,
                    options: modalOptions
                });
                modal.show();
            });
            this.appletOptions.collection = this.collection = new ADK.UIResources.Fetch.Problems.Collection();
            this.collection.fetchCollection(this.fetchOptions);

            this.listenTo(ADK.Messaging.getChannel('problems'), 'refreshGridView', function() {
                this.refresh({});
            });

            this._super.initialize.apply(this, arguments);
        },
        _serializeData: function serializeData() {
            var model = this.model;
            var problemData = model.toJSON();

            problemData.statusName = model.getStatusName(problemData.statusName);
            problemData.problemText = model.getProblemText(problemData.problemText);
            problemData.icdCode = model.getICDCode(problemData.icdCode);
            problemData.enteredFormatted = ADK.utils.formatDate(problemData.entered);
            return problemData;
        },
        events: {
            'toolbar.show': function() {
                ADK.utils.crsUtil.removeStyle(this);
            },
            'toolbar.hide': function(event) {
                if (this.$(event.target).closest('.table-row-toolbar').data('code') === this.$(document.activeElement).closest('.table-row-toolbar').data('code')) {
                    ADK.utils.crsUtil.removeStyle(this);
                }
            }
        },
        onBeforeDestroy: function() {
            ADK.Messaging.getChannel('problems').off('detailView');
        },
        onDestroy: function() {
            ADK.utils.crsUtil.removeStyle(this);
        }
    });

    function onAddProblems() {
        WorkflowUtils.startAddProblemsWorkflow(AddEditProblemsView);
    }

    return GistView;
});
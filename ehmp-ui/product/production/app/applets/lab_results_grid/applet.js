define([
    "backbone",
    "marionette",
    'underscore',
    "app/applets/lab_results_grid/appletHelpers",
    "app/applets/lab_results_grid/appletUiHelpers",
    "app/applets/lab_results_grid/gridView",
    "app/applets/lab_results_grid/details/detailsView",
    "app/applets/lab_results_grid/modal/modalView",
    "hbs!app/applets/lab_results_grid/templates/tooltip",
    'app/applets/lab_results_grid/modal/stackedGraph',
    'app/applets/orders/tray/labs/trayUtils',
    'app/applets/orders/tray/labs/trayView'
], function(Backbone, Marionette, _, AppletHelper, AppletUiHelper, GridView, DetailsView, ModalView, tooltip, StackedGraph, LabOrderTrayUtils, trayView) {
    "use strict";

    var AppletID = 'lab_results_grid',
        _fetchOptions = {
            resourceTitle: 'patient-record-lab',
            pageable: true,
            cache: true,
            allowAbort: true,
            collectionConfig: {
                comparator: function(model) {
                    var observed = model.get('observed');
                    if (!observed) {
                        // Fall back to resulted attribute
                        observed = model.get('resulted');

                        // This should never happen but additional safety check
                        if (!observed) return -1;
                    }
                    if (observed.length === 12) observed = [observed, '00'].join('');
                    return -observed;
                }
            },
            viewModel: {
                parse: function(response) {
                    // Check 'codes' for LOINC codes and Standard test name.
                    var lCodes = [];
                    var testNames = [];
                    var crsUtil = ADK.utils.crsUtil;
                    if (response.codes) {
                        response.codes.forEach(function(code) {
                            if (code.system.indexOf("loinc") != -1) {
                                lCodes.push(" " + code.code);
                                testNames.push(" " + code.display);
                            }
                        });
                    }

                    response.loinc = lCodes;
                    response.stdTestNames = testNames;
                    response[crsUtil.crsAttributes.CRSDOMAIN] = crsUtil.domain.LABORATORY;

                    var low = response.low,
                        high = response.high;

                    if (low && high) {
                        response.referenceRange = low + '-' + high;
                    }

                    if (response.interpretationCode) {
                        var temp = response.interpretationCode.split(":").pop(),
                            flagTooltip = "",
                            labelClass = "applet-badges label-critical";

                        if (temp === "HH") {
                            temp = "H*";
                            flagTooltip = "Critical High";
                        }
                        if (temp === "LL") {
                            temp = "L*";
                            flagTooltip = "Critical Low";
                        }
                        if (temp === "H") {
                            flagTooltip = "Abnormal High";
                            labelClass = "label-warning";
                        }
                        if (temp === "L") {
                            flagTooltip = "Abnormal Low";
                            labelClass = "label-warning";
                        }
                        response.interpretationCode = temp;
                        response.flagTooltip = flagTooltip;
                        response.labelClass = labelClass;
                    }

                    if (response.categoryCode) {
                        var categoryCode = response.categoryCode.slice(response.categoryCode.lastIndexOf(':') + 1);
                        switch (categoryCode) {
                            case 'EM':
                            case 'MI':
                            case 'SP':
                            case 'CY':
                            case 'AP':
                                response.result = 'View Report';
                                if (!response.typeName) {
                                    response.typeName = response.categoryName;
                                }
                                response.pathology = true;
                                break;
                        }
                    }
                    return response;
                }
            }
        };

    var gistConfiguration = {
        //Collection fetchOptions

        gistModel: [{
            id: 'shortName',
            field: 'shortName'
        }, {
            id: 'specimenForTrend',
            field: 'specimenForTrend'
        }, {
            id: 'displayName',
            field: 'normalizedName'
        }, {
            id: 'result',
            field: 'result'
        }, {
            id: 'previousInterpretationCode',
            field: 'previousInterpretationCode'
        }, {
            id: 'previousResult',
            field: 'previousResult'
        }, {
            id: 'units',
            field: 'units'
        }, {
            id: 'timeSince',
            field: 'timeSince'
        }, {
            id: 'observationType',
            field: 'observationType'
        }, {
            id: 'tooltip',
            field: 'tooltip'
        }],
        filterFields: ['observedFormatted', 'typeName', 'flag', 'result', 'specimen', 'groupName', 'isPanel', 'units', 'referenceRange', 'facilityMoniker', 'labs.models'],
        gistHeaders: {
            header1: {
                title: 'Lab Test',
                sortable: true,
                sortType: 'alphabetical',
                key: 'shortName',
                hoverTip: 'labresults_description'
            },
            header2: {
                title: 'Result',
                sortable: true,
                sortType: 'numeric',
                key: 'result',
                hoverTip: 'labresults_results'
            },
            header3: {
                title: '',
                sortable: false,
            },
            header4: {
                title: 'Last',
                sortable: true,
                sortType: 'date',
                key: 'observed',
                hoverTip: 'labresults_last'
            }
        },
        defaultView: 'observation',
        enableHeader: 'true',
        graphOptions: {
            height: '19', //defaults to 20
            width: '90', //defaults to 80
            id: '',
            //abnormalRangeWidth: 14, //defaults to Math.floor(w / 6)
            //rhombusA: 6, //defaults to Math.floor(h / 2 * 0.7)
            //rhombusB: 4, //defaults to Math.floor(aw / 2 * 0.7)
            //radius: 3, //defaults to 3
            //minimumDistance: 10, //defaults to 10
            hasCriticalInterpretation: true, //defaults to false
        }
    };

    var InAPanelModel = Backbone.Model.extend({
        parse: _fetchOptions.viewModel.parse
    });

    var gridView;
    var GistView = ADK.Applets.BaseGridApplet.extend({
        collectionEvents: {
            'read:success': function() {
                var self = this;
                var collection = this.collection;
                var options = this.options;
                var fullCollection = collection.fullCollection || collection;

                fullCollection.each(function(result) {
                    var resultAttributes = _.values(result.attributes);

                    if (typeof resultAttributes[0][0] === 'object' && !resultAttributes[0][0].code) {
                        var currentPanel = resultAttributes[0];
                        var currentPanelFirstLab = currentPanel[0];
                        var panelGroupName = _.keys(result.attributes)[0];

                        var group = panelGroupName,
                            id = group.replace(/\s/g, ''),
                            tempCode = "",
                            tempTooltip = "",
                            labelClass = "";

                        _.each(currentPanel, function(lab, i) {
                            lab = new InAPanelModel(InAPanelModel.prototype.parse(lab));

                            if (lab.attributes.interpretationCode == "H*") {
                                tempCode = "H*";
                                tempTooltip = "Critical High";
                                labelClass = "applet-badges label-critical";

                            } else if (lab.attributes.interpretationCode == "L*") {
                                if (tempCode == "H" || tempCode == "L" || tempCode === "") {
                                    tempCode = "L*";
                                    tempTooltip = "Critical Low";
                                    labelClass = "applet-badges label-critical";
                                }
                            } else if (lab.attributes.interpretationCode == "H") {
                                if (tempCode == "L" || tempCode === "") {
                                    tempCode = "H";
                                    tempTooltip = "Abnormal High";
                                    labelClass = "label-warning";
                                }
                            } else if (lab.attributes.interpretationCode == "L") {
                                if (tempCode === "") {
                                    tempCode = "L";
                                    tempTooltip = "Abnormal Low";
                                    labelClass = "label-warning";
                                }
                            }
                            currentPanel[i] = lab;
                        });

                        var tempUid = panelGroupName.replace(/\s/g, '') + "_" + currentPanelFirstLab.groupUid.replace(/\s/g, '');
                        tempUid = tempUid.replace('#', '');

                        result.set({
                            labs: new Backbone.Collection(currentPanel),
                            observed: currentPanelFirstLab.observed,
                            isPanel: 'Panel',
                            typeName: group,
                            panelGroupName: panelGroupName,
                            facilityCode: currentPanelFirstLab.facilityCode,
                            facilityMoniker: currentPanelFirstLab.facilityMoniker,
                            interpretationCode: tempCode,
                            flagTooltip: tempTooltip,
                            labelClass: labelClass,
                            uid: tempUid,
                            type: 'panel'
                        });
                    }
                });

                if (self.columnsViewType !== undefined && self.columnsViewType === 'gist') {
                    var modifiedCollection = self.modifyModel(fullCollection);
                    fullCollection.reset(modifiedCollection.models, {
                        reindex: true
                    });
                }
            }
        },
        getLoincValues: function(json) {
            if (json.codes === undefined) return '';
            var codesWithLoincString = '';
            _.each(json.codes, function(item) {
                if (item.system === 'http://loinc.org'){
                    codesWithLoincString += ' ' + item.code;
                }
            });
            return codesWithLoincString;
        },
        initialize: function(options) {
            this._super = ADK.Applets.BaseGridApplet.prototype;

            var fetchOptions = _.clone(_fetchOptions);

            var addPermission = 'add-lab-order';
            var onClickRow = function(model, event, gridView) {
                event.preventDefault();

                if (model.get('isPanel')) {
                    if (!gridView.$(event.currentTarget).data('isOpen')) {
                        gridView.$(event.currentTarget).data('isOpen', true);
                    } else {
                        var k = gridView.$(event.currentTarget).data('isOpen');
                        k = !k;
                        gridView.$(event.currentTarget).data('isOpen', k);
                    }

                    var i = gridView.$(event.currentTarget).find('.js-has-panel i');
                    if (i.length) {
                        if (i.hasClass('fa-chevron-up')) {
                            i.removeClass('fa-chevron-up')
                                .addClass('fa-chevron-down');
                            gridView.$(event.currentTarget).data('isOpen', true);
                        } else {
                            i.removeClass('fa-chevron-down')
                                .addClass('fa-chevron-up');
                            gridView.$(event.currentTarget).data('isOpen', false);
                        }
                    }
                    gridView.expandRow(model, event);
                } else {
                    AppletUiHelper.getDetailView(model, null, this.collection);
                }
            };

            var dataGridOptions = {
                formattedFilterFields: {
                    'observed': function(model, key) {
                        var val = model.get(key);
                        val = val.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/, '$2/$3/$1 $4:$5');
                        return val;
                    }
                },
                gistView: true,
                appletConfiguration: gistConfiguration,
                DetailsView: DetailsView,
                filterDateRangeEnabled: true,
                filterDateRangeField: {
                    name: "observed",
                    label: "Date",
                    format: "YYYYMMDD"
                },
                onClickRow: onClickRow
            };
            dataGridOptions.filterFields = gistConfiguration.filterFields;
            dataGridOptions.filterFields.push(this.getLoincValues);

            // Only show the "+" icon for the applet if the user has the 'add-lab-order' permission
            if (ADK.UserService.hasPermissions(addPermission) && ADK.PatientRecordService.isPatientInPrimaryVista()) {
                dataGridOptions.onClickAdd = LabOrderTrayUtils.launchLabForm;
            }

            var self = this;
            //date change handling
            this.listenTo(ADK.Messaging, 'globalDate:selected', function(dateModel) {
                // Bypass the global date filtering if All button is selected
                var selectedId = ADK.SessionStorage.getModel('globalDate').get('selectedId');
                if (selectedId !== 'allRangeGlobal') {
                    self.dataGridOptions.collection.fetchOptions.criteria.filter = self.buildJdsDateFilter('observed', options);
                } else {
                    delete self.dataGridOptions.collection.fetchOptions.criteria.filter;
                }

                self.loading();
                self.createDataGridView();
                ADK.ResourceService.fetchCollection(self.dataGridOptions.collection.fetchOptions, self.dataGridOptions.collection);
            });
            fetchOptions.criteria = {
                filter: this.buildJdsDateFilter('observed') + ',eq(categoryCode , "urn:va:lab-category:CH")'
            };
            fetchOptions.onSuccess = function(collection) {
                collection.trigger('read:success', collection);
            };

            this.collection = dataGridOptions.collection = ADK.PatientRecordService.createEmptyCollection(fetchOptions);
            ADK.PatientRecordService.fetchCollection(fetchOptions, dataGridOptions.collection);

            this.dataGridOptions = dataGridOptions;
            if (!self.isFullscreen) {
                if (dataGridOptions.gistView === true) {
                    this.dataGridOptions.SummaryView = ADK.Views.LabresultsGist.getView();
                    var originalChildView = this.dataGridOptions.SummaryView.prototype.childView;
                    this.dataGridOptions.SummaryView = this.dataGridOptions.SummaryView.extend({
                        childView: originalChildView.extend({
                            serializeModel: function(model) {
                                var data = model.toJSON();
                                var limit = 4;
                                if (data.oldValues) {
                                    data.limitedoldValues = data.oldValues.splice(0, limit - 1);
                                    if ((data.oldValues.length - data.limitedoldValues.length) > 0) {
                                        data.moreresultsCount = data.oldValues.length - data.limitedoldValues.length;
                                    }
                                }
                                data.tooltip = tooltip(data);
                                return data;
                            }
                        })
                    });
                    this.dataGridOptions.SummaryViewOptions = {
                        gistHeaders: gistConfiguration.gistHeaders,
                        enableTileSorting: true
                    };
                }
            }

            this._super.initialize.apply(this, arguments);


            var channel = ADK.Messaging.getChannel(AppletID);
            this.listenTo(channel, 'detailView', function(params) {
                this.expandOrOpenDetails(params);
            });

            this.listenTo(channel, 'addItem', function(e) {
                var addOrdersChannel = ADK.Messaging.getChannel('addALabOrdersRequestChannel');
                addOrdersChannel.trigger('addLabOrdersModal', event, gridView);
            });

            var message = ADK.Messaging.getChannel('lab_results');
            message.reply('gridCollection', function() {
                return self.gridCollection;
            });

        },
        expandOrOpenDetails: function(channelObj) {
            var model = channelObj.model,
                currentTarget = channelObj.$el;

            if (!this.$(currentTarget).length) return;

            if (model.get('isPanel')) {
                if (!this.$(currentTarget).data('isOpen')) {
                    this.$(currentTarget).data('isOpen', true);
                } else {
                    var k = this.$(currentTarget).data('isOpen');
                    k = !k;
                    this.$(currentTarget).data('isOpen', k);
                }

                var i = this.$(currentTarget).find('.js-has-panel i');
                if (i.length) {
                    if (i.hasClass('fa-chevron-up')) {
                        i.removeClass('fa-chevron-up')
                            .addClass('fa-chevron-down');
                        this.$(currentTarget).data('isOpen', true);
                    } else {
                        i.removeClass('fa-chevron-down')
                            .addClass('fa-chevron-up');
                        this.$(currentTarget).data('isOpen', false);
                    }
                }
                this.getRegion('appletContainer').currentView.expandRow(model, event);
            } else {
                AppletUiHelper.getDetailView(model, null, this.collection);
            }
        },
        onDestroy: function() {
            ADK.Messaging.getChannel('lab_results_grid').off('addItem');
            var message = ADK.Messaging.getChannel('lab_results');
            message.stopReplying('gridCollection');
        },
        modifyModel: function(collectionItems) {
            var modifiedCollection = {};
            var appletid = this.dataGridOptions.appletId;

            //Create deep clone for collection
            _.extend(modifiedCollection, collectionItems);
            //Reset models field for the new collection
            modifiedCollection.models = [];

            for (var i = 0; i < collectionItems.models.length; i++) {
                //Only laboratory results should be visible
                if (collectionItems.models[i].attributes.kind !== undefined && collectionItems.models[i].attributes.kind === 'Laboratory') {
                    //Add applet_id to model (used in toolbarview to trigger detailview)
                    collectionItems.models[i].attributes.applet_id = appletid;
                    //Add fields necessary to the gist mmodel
                    collectionItems.models[i].attributes.timeSince = AppletHelper.setTimeSince(collectionItems.models[i].attributes.observed);
                    collectionItems.models[i].attributes.observedFormatted = AppletHelper.getObservedFormatted(collectionItems.models[i].attributes.observed);
                    collectionItems.models[i].attributes.numericTime = AppletHelper.getNumericTime(collectionItems.models[i].attributes.timeSince);
                    collectionItems.models[i].attributes.observationType = 'labs';
                    collectionItems.models[i].attributes.shortName = collectionItems.models[i].attributes.typeName;
                    collectionItems.models[i].attributes.specimenForTrend = collectionItems.models[i].attributes.specimen;
                    var serum = collectionItems.models[i].attributes.specimenForTrend.indexOf('SERUM');
                    var blood = collectionItems.models[i].attributes.specimenForTrend.indexOf('BLOOD');
                    if (serum >= 0 || blood >= 0) {
                        collectionItems.models[i].attributes.specimenForTrend = '';
                    }
                    if (collectionItems.models[i].attributes.typeName.indexOf(',') >= 0) {
                        collectionItems.models[i].attributes.shortName = collectionItems.models[i].attributes.typeName.substring(0, collectionItems.models[i].attributes.typeName.indexOf(','));
                    }
                    collectionItems.models[i].attributes.graphOptions = gistConfiguration.graphOptions;
                    collectionItems.models[i].attributes.normalizedName = collectionItems.models[i].attributes.typeName.replace(/\W/g, '_');
                    //Initialize modifiedCollection models field.
                    if (modifiedCollection.models.length === 0) {
                        modifiedCollection.models.push(collectionItems.models[i]);
                    } else {
                        //found is true when we find another item in the modifiedCollection with the same typeName
                        var found = false;
                        for (var j = 0; j < modifiedCollection.models.length; j++) {
                            //If the modifiedCollection item has the same typeName as the initial collectionItems item
                            if ((modifiedCollection.models[j].attributes.facilityCode === 'DOD' && collectionItems.models[i].facilityCode === 'DOD' &&
                                    modifiedCollection.models[j].attributes.codes[0].code === collectionItems.models[i].attributes.codes[0].code) ||
                                (modifiedCollection.models[j].attributes.typeName === collectionItems.models[i].attributes.typeName && modifiedCollection.models[j].attributes.specimen === collectionItems.models[i].attributes.specimen)) {
                                //We will put the old values with the same typeName in the oldValues array within the attributes
                                if (modifiedCollection.models[j].attributes.oldValues === undefined) {
                                    //Initialize the oldValues if this is the second value found in the collectionItems
                                    modifiedCollection.models[j].attributes.oldValues = [];
                                    //Previous value represents the second value with the same typeName of the collectionItems array
                                    modifiedCollection.models[j].attributes.previousResult = collectionItems.models[i].attributes.result;
                                    modifiedCollection.models[j].attributes.previousInterpretationCode = collectionItems.models[i].attributes.interpretationCode;
                                }
                                modifiedCollection.models[j].attributes.oldValues.push(collectionItems.models[i]);
                                found = true;
                            }
                        }
                        //If this is the first time when we encounter the typeName we add it to the modifiedCollection
                        if (!found) modifiedCollection.models.push(collectionItems.models[i]);
                    }
                }

            }
            modifiedCollection.length = modifiedCollection.models.length;
            return modifiedCollection;
        }
    });

    var applet = {
        id: AppletID,
        viewTypes: [{
            type: 'summary',
            view: GridView.extend({
                columnsViewType: "summary"
            }),
            chromeEnabled: true
        }, {
            type: 'expanded',
            view: GridView.extend({
                columnsViewType: "expanded"
            }),
            chromeEnabled: true
        }, {
            type: 'gist',
            view: GistView.extend({
                columnsViewType: "gist"
            }),
            chromeEnabled: true
        }, {
            //new writeback code added from ADK documentation
            type: 'writeback',
            view: trayView,
            chromeEnabled: false
        }],
        defaultViewType: 'summary'
    };

    var channel = ADK.Messaging.getChannel(AppletID);

    channel.on('detailView', function(params) {
        var modalView = new ModalView.ModalView({
            model: params.model,
            collection: params.model.collection,
            navHeader: false,
        });

        var modalOptions = {
            'fullScreen': self.isFullscreen,
            'size': "xlarge",
            'title': params.model.get('typeName') + ' - ' + params.model.get('specimen')
        };

        var modal = new ADK.UI.Modal({
            view: modalView,
            options: modalOptions
        });

        modal.show();
    });

    channel.on('notesView', function(params) {
        AppletUiHelper.launchNoteWorkflow(params.model);
    });

    ADK.Messaging.getChannel('labresults_timeline_detailview').reply('detailView', function(params) {

        var fetchOpt = {
            criteria: {
                "uid": params.uid
            },
            patient: new Backbone.Model({
                icn: params.patient.icn,
                pid: params.patient.pid
            }),
            pageable: true,
            resourceTitle: 'uid',
            viewModel: {
                parse: params.model.parse
            }
        };

       var collection = ADK.PatientRecordService.createEmptyCollection(fetchOpt);
       collection.fetchOptions = fetchOpt;
       var config = AppletUiHelper.getDetailView(params.model, null, collection);
       return config;
    });

    // get the chart for the StackedGraph applet
    channel.reply('chartInfo', function(params) {

        var displayName = params.typeName;
        var ChartModel = Backbone.Model.extend({});
        var chartModel = new ChartModel({
            typeName: params.typeName,
            displayName: displayName,
            requesterInstanceId: params.instanceId,
            graphType: params.graphType,
            applet_id: applet.id
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
    });

    return applet;
});

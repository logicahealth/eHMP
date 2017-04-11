define([
    "backbone",
    "marionette",
    'underscore',
    "app/applets/lab_results_grid/appletHelpers",
    "app/applets/lab_results_grid/appletUiHelpers",
    "app/applets/lab_results_grid/details/detailsView",
    "app/applets/lab_results_grid/meta/columns",
    "hbs!app/applets/lab_results_grid/templates/tooltip",
    'app/applets/orders/tray/labs/trayUtils'
], function(Backbone, Marionette, _, AppletHelper, AppletUiHelper, DetailsView, columns, tooltip, LabOrderTrayUtils) {
    "use strict";

    var fetchOptions = {
        resourceTitle: 'patient-record-labsbypanel',
        pageable: true,
        cache: true,
        allowAbort: true,
        collectionConfig: {
            comparator: function(model) {
                var observed = model.get('observed');

                // I don't believe this is a stable in the long term,
                // but it is the pattern that the onSuccess is already using.
                if (!observed) {

                    for (var key in model.attributes) {
                        if (model.attributes.hasOwnProperty(key)) {
                            observed = model.get(key)[0];
                            observed = observed.observed;
                            model.set('observed', observed, {
                                silent: true
                            });
                            break;
                        }
                    }

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
                    var temp = response.interpretationCode.split(":").pop();

                    var flagTooltip = "";
                    var labelClass = "applet-badges label-critical";

                    if (temp === "HH" || temp === 'H*') {
                        temp = "H*";
                        flagTooltip = "Critical High";
                    }
                    if (temp === "LL" || temp ==='L*') {
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
                if (response.observed) {
                    response.observedFormatted = AppletHelper.getObservedFormatted(response.observed);
                }

                return response;
            },
            defaults: {
                'applet_id': 'lab_results_grid'
            }
        }
    };

    var InAPanelModel = Backbone.Model.extend({
        parse: fetchOptions.viewModel.parse
    });

    var labResultsView = ADK.AppletViews.GridView.extend({
        collectionEvents: {
            'read:success': function(collection) {
                var self = this;
                var fullCollection = collection.fullCollection || collection;
                fullCollection.each(function(result) {
                    var resultAttributes = _.values(result.attributes);
                    if (typeof resultAttributes[0][0] === 'object') {
                        var currentPanel = resultAttributes[0],
                            currentPanelFirstLab = currentPanel[0],
                            panelGroupName = _.keys(result.attributes)[0],
                            group = panelGroupName,
                            id = group.replace(/\s/g, ''),
                            tempCode = "",
                            tempTooltip = "",
                            labelClass = "",
                            codes = [];
                        _.each(currentPanel, function(lab, i) {
                            lab = new InAPanelModel(InAPanelModel.prototype.parse(lab));
                            codes.push.apply(codes, lab.get('codes'));
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

                        var tempUid = panelGroupName.replace(/\s/g, '') + "_" + currentPanelFirstLab.groupUid.replace(/\s/g, '') + '-' + self.options.appletConfig.instanceId;
                        tempUid = tempUid.replace('#', '');

                        result.set({
                            codes: codes,
                            labs: new Backbone.Collection(currentPanel),
                            observed: currentPanelFirstLab.observed,
                            infobuttonContext: 'LABRREV',
                            isPanel: 'Panel',
                            typeName: group,
                            panelGroupName: panelGroupName,
                            qualifiedName: panelGroupName,
                            facilityCode: currentPanelFirstLab.facilityCode,
                            facilityMoniker: currentPanelFirstLab.facilityMoniker,
                            interpretationCode: tempCode,
                            flagTooltip: tempTooltip,
                            labelClass: labelClass,
                            uid: tempUid,
                            excludeToolbar: true,
                            type: 'panel'
                        });
                    } else {
                        result.set('infobuttonContext', 'LABRREV');
                    }
                });
            }
        },
        initialize: function(options) {
            this._super = ADK.AppletViews.GridView.prototype;
            this.summaryColumns = [columns.dateCol(), columns.testCol(), columns.flagCol(), columns.resultAndUnitCol()];
            this.fullScreenColumns = [columns.dateCol(), columns.testCol(), columns.flagCol(), columns.resultNoUnitCol(), columns.unitCol(), columns.refCol(), columns.facilityCol()];
            var addPermission = 'add-lab-order';
            var onClickRow = function(model, event, appletView) {
                event.preventDefault();
                appletView.$(event.currentTarget).toggleClass('active');
                if (options.appletConfig.fullScreen) {
                    model.set('isFullscreen', true);
                } else {
                    model.set('isFullscreen', false);
                }
                if (model.get('isPanel')) {
                    if (!$(event.currentTarget).data('isOpen')) {
                        $(event.currentTarget).data('isOpen', true);
                    } else {
                        var k = $(event.currentTarget).data('isOpen');
                        k = !k;
                        $(event.currentTarget).data('isOpen', k);
                    }
                    var i = $(event.currentTarget).find('.js-has-panel i');
                    if (i.length) {
                        if (i.hasClass('fa-chevron-up')) {
                            i.removeClass('fa-chevron-up')
                                .addClass('fa-chevron-down');
                            $(event.currentTarget).data('isOpen', true);
                        } else {
                            i.removeClass('fa-chevron-down')
                                .addClass('fa-chevron-up');
                            $(event.currentTarget).data('isOpen', false);
                        }
                    }
                    appletView.expandRow(model, event);
                } else {
                    AppletUiHelper.getDetailView(model, event.currentTarget, appletView.options, true, AppletUiHelper.showModal, AppletUiHelper.showErrorModal);
                }
            };

            var appletOptions = {
                filterFields: ['observedFormatted', 'typeName', 'flag', 'result', 'specimen', 'groupName', 'isPanel', 'units', 'referenceRange', 'facilityMoniker', 'labs.models', this.getLoincValues],
                formattedFilterFields: {
                    'observed': function(model, key) {
                        var val = model.get(key);
                        val = val.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/, '$2/$3/$1 $4:$5');
                        return val;
                    }
                },
                DetailsView: DetailsView,
                filterDateRangeField: {
                    name: "observed",
                    label: "Date",
                    format: "YYYYMMDD"
                },
                onClickRow: onClickRow,
                tblRowSelector: "#data-grid-" + this.options.appletConfig.instanceId + " tbody tr"
            };

            if (this.columnsViewType === "expanded") {
                appletOptions.columns = this.fullScreenColumns;
            } else if (this.columnsViewType === "summary") {
                appletOptions.columns = this.summaryColumns;
            } else {
                appletOptions.summaryColumns = this.summaryColumns;
                appletOptions.fullScreenColumns = this.fullScreenColumns;
            }

            // Only show the "+" icon for the applet if the user has the 'add-lab-order' permission
            if (ADK.UserService.hasPermissions(addPermission)) {
                appletOptions.onClickAdd = LabOrderTrayUtils.launchLabForm;
            }

            var self = this;

            fetchOptions.onSuccess = function(collection) {
                collection.trigger('read:success', collection);
            };

            var numericLabsFilter = 'eq(categoryCode , "urn:va:lab-category:CH")';

            fetchOptions.criteria = {
                customFilter: numericLabsFilter,
                filter: this.buildJdsDateFilter('observed') + ',' + numericLabsFilter
            };

            this.listenTo(ADK.Messaging, 'globalDate:selected', function(dateModel) {
                this.dateRangeRefresh('observed', {
                    customFilter: numericLabsFilter
                });
            });


            this.collection = this.gridCollection = ADK.PatientRecordService.createEmptyCollection(fetchOptions);
            ADK.PatientRecordService.fetchCollection(fetchOptions, this.gridCollection);
            appletOptions.collection = this.gridCollection;

            appletOptions.toolbarOptions = {
                buttonTypes: ['infobutton', 'detailsviewbutton', 'notesobjectbutton']
            };

            this.appletOptions = appletOptions;
            this._super.initialize.apply(this, arguments);

            this.listenTo(ADK.Messaging.getChannel('lab_results_grid'), 'detailView', function(params) {
                this.expandOrOpenDetails(params);
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
                AppletUiHelper.getDetailView(model, currentTarget, model.collection, true, AppletUiHelper.showModal, AppletUiHelper.showErrorModal);
            }
        },
        getLoincValues: function(json) {
            if (json.codes === undefined) return '';
            var codesWithLoinc = _.filter(json.codes, function(item) {
                return item.system === 'http://loinc.org';
            });
            return _.pluck(codesWithLoinc, 'code').join(' ');
        },

        onBeforeDestroy: function() {
            var message = ADK.Messaging.getChannel('lab_results');
            message.stopReplying('gridCollection');
            fetchOptions.onSuccess = null;
        },

        events: {
            'click .js-has-panel': 'togglePanel',
            'click tr.selectable': function(event) {
                var row = $(event.target).closest("tr");
                var model = row.data('model');
                if (model.get('isPanel')) {
                    this.appletOptions.onClickRow(model, event, this.displayAppletView);
                }
                this.appletOptions.AppletView.prototype.onClickRow.apply(this.displayAppletView, [event]);
            }
        },
        togglePanel: function() {
            $('#info-button-sidekick-detailView').click();
        }
    });
    return labResultsView;
});
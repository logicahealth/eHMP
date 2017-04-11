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
        collectionConfig: {
            comparator: function(model) {
                var observed = model.get('observed');

                // I don't believe this is a stable in the long term,
                // but it is the pattern that the onSuccess is already using.
                if (!observed) {

                    for (var key in model.attributes) {
                        if(model.attributes.hasOwnProperty(key)) {
                            observed = model.get(key)[0];
                            observed = observed.observed;
                            model.set('observed', observed, {silent: true});
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

                var low = response.low,
                    high = response.high;

                if (low && high) {
                    response.referenceRange = low + '-' + high;
                }

                if (response.interpretationCode) {
                    var temp = response.interpretationCode.split(":").pop();

                    var flagTooltip = "";
                    var labelClass = "label-danger";

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
                if (response.observed) {
                    response.observedFormatted = AppletHelper.getObservedFormatted(response.observed);
                }

                return response;
            }
        }
    };

    var InAPanelModel = Backbone.Model.extend({
        parse: fetchOptions.viewModel.parse
    });

    var gridView;
    var labResultsView = ADK.AppletViews.GridView.extend({
        initialize: function(options) {
            this._super = ADK.AppletViews.GridView.prototype;
            this.summaryColumns = [columns.dateCol(), columns.testCol(), columns.flagCol(), columns.resultAndUnitCol()];
            this.fullScreenColumns = [columns.dateCol(), columns.testCol(), columns.flagCol(), columns.resultNoUnitCol(), columns.unitCol(), columns.refCol(), columns.facilityCol()];
            var addPermission = 'add-lab-order';
            var onClickRow = function(model, event, gridView) {
                event.preventDefault();
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
                    gridView.expandRow(model, event);
                } else {
                    AppletUiHelper.getDetailView(model, event.currentTarget, appletOptions, true, AppletUiHelper.showModal, AppletUiHelper.showErrorModal);
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
                events: {
                    'click tr.selectable': function(event) {
                        var row = $(event.target).closest("tr");
                        var model = row.data('model');
                        if (event.target.innerHTML === 'Panel') {
                            this.options.onClickRow(model, event, this);
                        }
                        this.options.AppletView.prototype.onClickRow.apply(this, [event]);
                    },
                    'keypress tr.selectable': function(event) {
                        if (event.which === 13 || event.which ===32) {
                            this.options.AppletView.prototype.onClickRow.apply(this, [event]);

                        }
                    }
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
                            labelClass = "";
                        _.each(currentPanel, function(lab, i) {
                            lab = new InAPanelModel(InAPanelModel.prototype.parse(lab));

                            if (lab.attributes.interpretationCode == "H*") {
                                tempCode = "H*";
                                tempTooltip = "Critical High";
                                labelClass = "label-danger";

                            } else if (lab.attributes.interpretationCode == "L*") {
                                if (tempCode == "H" || tempCode == "L" || tempCode === "") {
                                    tempCode = "L*";
                                    tempTooltip = "Critical Low";
                                    labelClass = "label-danger";
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
                            labs: new Backbone.Collection(currentPanel),
                            observed: currentPanelFirstLab.observed,
                            infobuttonContext: 'LABRREV',
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
                    } else {
                        result.set('infobuttonContext', 'LABRREV');
                    }
                });
            };

            var numericLabsFilter = 'eq(categoryCode , "urn:va:lab-category:CH")';

            fetchOptions.criteria = {
                customFilter: numericLabsFilter,
                filter: this.buildJdsDateFilter('observed') + ',' + numericLabsFilter
            };

            this.listenTo(ADK.Messaging, 'globalDate:selected', function(dateModel) {
                self.dateRangeRefresh('observed', {
                    customFilter: numericLabsFilter
                });
            });


            this.gridCollection = ADK.PatientRecordService.fetchCollection(fetchOptions);
            appletOptions.collection = this.gridCollection;

            this.appletOptions = appletOptions;
            this._super.initialize.apply(this, arguments);

            var message = ADK.Messaging.getChannel('lab_results');
            message.reply('gridCollection', function() {
                return self.gridCollection;
            });
        },
        getLoincValues : function(json) {
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
            'click .js-has-panel': 'togglePanel'
        },
        togglePanel: function() {
            $('#info-button-sidekick-detailView').click();
        }
    });
    return labResultsView;
});

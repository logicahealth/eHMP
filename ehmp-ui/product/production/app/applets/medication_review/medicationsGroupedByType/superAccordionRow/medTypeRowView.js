define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'highcharts',
    'moment',
    'hbs!app/applets/medication_review/medicationsGroupedByType/superAccordionRow/medTypeRow',
    'app/applets/medication_review/medicationsGroupedByType/superAccordionRow/medTypeRowModel',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionList/medNameListCollection',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/medNameRowView',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/graph/highchartConfig'
], function(_, Backbone, Marionette, Handlebars, Highcharts, moment, MedTypeRow, MedTypeRowModel, MedNameListCollection, MedNameRowView, HighchartConfig) {
    'use strict';
    var EmptyView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<p class="empty-medlist">No Records Found</p>')
    });

    return Backbone.Marionette.CompositeView.extend({
        reorderOnSort: true,
        defaultSortColumnName: 'status',
        ui: {
            accordionButton: '.btn-accordion',
            accordionPanel: '.panel-body',
            caret: '.right-padding-sm',
            graphHeader: '.graph-header',
            sortCaret: '.sort-caret',
            columnHeader: '.header'
        },
        behaviors: {
            QuickTile: {
                childContainerSelector: function() {
                    return this.$el.find('[data-medication-container=medication-list]');
                },
                rowTagName: 'div'
            }
        },
        childEvents: {
            'panelClick': 'onChildClicked'
        },
        onChildClicked: function(child) {
            if (this.mostRecentlyClickedChild !== child) {
                if (this.mostRecentlyClickedChild) {
                    this.mostRecentlyClickedChild.triggerMethod('otherChildClicked');
                }
                this.mostRecentlyClickedChild = child;
            }
        },
        events: {
            'click .header': function(event) {
                event.preventDefault();
                event.stopImmediatePropagation();
                this.sortCollection($(event.target));
            },
            'keydown .medication-layout-view': function(event) {
                if(event.which === 13) {
                    $(event.currentTarget).find('.panel-heading > .row').click();
                }
            },
            'shown.bs.collapse': function() {
                this.renderHeaderGraph();
                this.ui.caret.removeClass('fa-chevron-right');
                this.ui.caret.addClass('fa-chevron-down');
                this.ui.accordionButton.attr("title", "Press enter to collapse " + this.model.get('medicationDisplayType') + " accordion.");
                if (this.$el.find('.empty-medlist').length) {
                    this.ui.accordionPanel.removeAttr('tabindex');
                }
            },
            'hidden.bs.collapse': function() {
                this.ui.caret.removeClass('fa-chevron-down');
                this.ui.caret.addClass('fa-chevron-right');
                this.ui.accordionButton.attr("title", "Press enter to expand " + this.model.get('medicationDisplayType') + " accordion.");
            }
        },
        initialize: function(options) {
            this.model.set("appletInstanceId", options.appletInstanceId);
            if (_.isUndefined(this.model.get('medications'))) {
                this.model.set('medications', new MedNameListCollection());
            }

            this.collection = this.model.get('medications');
            if (this.collection.length > 0) {
                this.getFillableOrNextColumn();
            } else {
                this.setEmptyMessage();
            }
        },
        template: MedTypeRow,
        templateHelpers: function() {
            return {
                hasMeds: function() {
                    return this.medications.length > 0;
                }
            };
        },
        className: 'panel panel-default all-border-no selectable accordion-toggle',
        childViewContainer: '.medication-item-list-region',
        childView: MedNameRowView,
        childViewOptions: function() {
            return {
                appletInstanceId: this.options.appletInstanceId
            };
        },
        emptyView: EmptyView,
        setEmptyMessage: function(errorMessage) {
            this.emptyView = Backbone.Marionette.ItemView.extend({
                template: _.template('<p class="empty-medlist color-grey-darkest" role="cell">No Records Found</p>'),
                attributes: {
                    role: 'row'
                }
            });
        },
        onRender: function() {
            if (this.model.collection) {
                this.ui.caret.addClass('fa fa-chevron-right');
                this.ui.accordionButton.attr("aria-expanded","false");
                this.ui.accordionButton.attr("title","Press enter to expand " + this.model.get('medicationType') + " accordion.");
            }

            if (this.model.get('medications').length > 0) {
                this.setHighChartsOptions(false);
                this.addHeaderGraph();
                this.listenTo(ADK.Messaging, 'meds-review-date-change', function(dateModel) {
                    this.setHighChartsOptions(false);
                    if (this.hasGraph) {
                        this.ui.graphHeader.highcharts().destroy();
                    }
                    this.addHeaderGraph();

                    this.setHighChartsOptions(true);
                });
            }
            this.$el.find('svg').attr('focusable', false);
            this.$el.find('svg').attr('aria-hidden', true);
        },
        onBeforeShow: function() {
            this.resetToDefaultSort();
        },
        resetToDefaultSort: function() {
            var statusColumnHeader = this.$el.find("[sortKey='status']");
            this.previouslySortedHeader = statusColumnHeader[0];
            statusColumnHeader.find('.sort-caret').addClass('fa-caret-up');
            statusColumnHeader.parent().attr('aria-sort', 'ascending');
        },
        setHighChartsOptions: function(useUTC) {
            Highcharts.setOptions({
                global: {
                    //Switch whether highcharts is using UTC or local browser time.
                    useUTC: useUTC
                }
            });
        },
        renderHeaderGraph: function() {
            if (this.hasGraph) {
                this.setHighChartsOptions(false);
                this.ui.graphHeader.highcharts().reflow();
                this.setHighChartsOptions(true);
            }
            ADK.Messaging.trigger('medication_review:superAccordionClicked');
        },
        onAttach: function() {
            this.renderHeaderGraph();
        },
        onBeforeDestroy: function() {
            if (this.hasGraph) {
                this.ui.graphHeader.highcharts().destroy();
            }
        },
        sortCollection: function(headerElement) {
            if (headerElement.attr("sortable") === "true") {
                var currentColumnName = headerElement.attr('sortKey');
                var shouldResetSort = false;
                var previouslySortedHeaderWasClicked = this.previouslySortedHeader == headerElement[0];
                if (!previouslySortedHeaderWasClicked) {
                    var $previouslySortedHeader = $(this.previouslySortedHeader);
                    if ($previouslySortedHeader) {
                        $previouslySortedHeader.parent().attr('aria-sort', 'none');
                        $previouslySortedHeader.find('.sort-caret').removeClass('fa-caret-up fa-caret-down');
                    }

                    headerElement.find('.sort-caret').addClass('fa-caret-up');
                    headerElement.parent().attr('aria-sort', 'ascending');
                } else {
                    if (this.collection.currentSortOrder === this.collection.descending) {
                        headerElement.find('.sort-caret').removeClass('fa-caret-down');
                        headerElement.parent().attr('aria-sort', 'none');
                        shouldResetSort = true;
                    } else {
                        headerElement.find('.sort-caret').removeClass('fa-caret-up');
                        headerElement.find('.sort-caret').addClass('fa-caret-down');
                        headerElement.parent().attr('aria-sort', 'descending');
                    }
                }

                if (shouldResetSort) {
                    this.resetToDefaultSort();
                    this.collection.setUpSortForColumn(this.defaultSortColumnName);
                } else {
                    this.collection.setUpSortForColumn(currentColumnName);
                    this.previouslySortedHeader = headerElement[0];
                }

                this.collection.sort();
            }
        },
        addHeaderGraph: function() {
            var dateModel = ADK.SessionStorage.getModel('globalDate');
            var medicationChannel = ADK.Messaging.getChannel("medication_review");
            var earliestStartAsEpoch = medicationChannel.request('earliestStartAsEpoch');
            var oldest;

            if (dateModel.get('selectedId') === 'allRangeGlobal') {
                oldest = earliestStartAsEpoch;
            } else {
                oldest = moment(dateModel.get("fromDate"), "MM/DD/YYYY").valueOf();
            }
            var newest = moment(dateModel.get("toDate"), "MM/DD/YYYY").add(23, "hours").add(59, "minutes").valueOf();
            var vaType = this.model.get("medicationType");
            //exclude Inpatient and IV types from charting
            this.hasGraph = false;
            if (vaType !== 'inpatient' && vaType !== 'clinical') {
                this.hasGraph = true;
                this.headerChartConfig = new HighchartConfig({
                    chart: {
                        height: 20
                    },
                    name: 'headerChart',
                    xAxis: {
                        min: oldest,
                        max: newest,
                        labels: {
                            enabled: true
                        },
                        tickColor: '#bbb',
                        tickLength: 5,
                        tickWidth: 2,
                        tickPosition: 'inside'
                    },
                    series: [{
                        pointRange: 60 * 1000,
                        data: [{
                            height: 1,
                            x: oldest,
                            x2: newest,
                            y: 0
                        }]
                    }]
                });
                this.ui.graphHeader.highcharts(this.headerChartConfig);
            }
        },
        getFillableOrNextColumn: function() {
            this.statusFillableSortFunction = function(firstModel, secondModel) {
                var fillablePriority = function(model) {
                    var fillsRemaining = model.get('fillsRemaining');
                    var status = model.get('modifiedVaStatus');
                    var fillableStatus = model.get('fillableStatus');
                    if (status === 'expired' && fillableStatus !== 'Non VA') {
                        return 6;
                    } else if (status === 'active' && fillsRemaining === 0 && fillableStatus !== 'Non VA') {
                        return 5;
                    } else if (status === 'active' && fillsRemaining > 0 && fillableStatus !== 'Non VA') {
                        return 4;
                    } else if (status === 'pending') {
                        return 3;
                    } else if (fillableStatus === 'Non VA') {
                        return 2;
                    } else if (status === 'discontinued') {
                        return 1;
                    } else {
                        return 0;
                    }
                };
                var firstModelPriority = fillablePriority(firstModel);
                var secondModelPriority = fillablePriority(secondModel);
                if (firstModelPriority > secondModelPriority) {
                    return -1;
                } else if (firstModelPriority < secondModelPriority) {
                    return 1;
                } else {
                    var priority = firstModelPriority;
                    var firstName = firstModel.get('medicationName').toLowerCase();
                    var secondName = secondModel.get('medicationName').toLowerCase();
                    var firstStopped = moment(firstModel.get('stopped'), 'YYYYMMDDHHmm').valueOf();
                    var secondStopped = moment(secondModel.get('stopped'), 'YYYYMMDDHHmm').valueOf();
                    var firstFillsRemaining = firstModel.get('nextMedication');
                    var secondFillsRemaining = secondModel.get('nextMedication');

                    /* expired or discontinued */
                    if (priority === 6 || priority === 1) {
                        if (firstStopped < secondStopped) {
                            return -1;
                        } else if (firstStopped > secondStopped) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                    /* active with no refills or pending */
                    else if (priority === 5 || priority === 3) {
                        if (firstName < secondName) {
                            return -1;
                        } else if (firstName > secondName) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                    /* active with more than one refill*/
                    else if (priority === 4) {
                        if (firstFillsRemaining.days < secondFillsRemaining.days) {
                            return -1;
                        } else if (firstFillsRemaining.days > secondFillsRemaining.days) {
                            return 1;
                        } else {
                            return 0;
                        }
                    } else if (priority === 0) {

                        return 0;
                    }

                }
            };

            this.statusNextSortFunction = function(firstModel, secondModel) {
                var fillablePriority = function(model) {

                    var status = model.get('modifiedVaStatus').toLowerCase();

                    if (status === 'active') {
                        return 4;
                    } else if (status === 'pending') {
                        return 3;
                    } else if (status === 'expired') {
                        return 2;
                    } else if (status === 'discontinued') {
                        return 1;
                    } else {
                        return 0;
                    }
                };
                var firstModelPriority = fillablePriority(firstModel);
                var secondModelPriority = fillablePriority(secondModel);
                if (firstModelPriority > secondModelPriority) {
                    return -1;
                } else if (firstModelPriority < secondModelPriority) {
                    return 1;
                } else {
                    var priority = firstModelPriority;
                    var firstName = firstModel.get('displayName').toLowerCase();
                    var secondName = secondModel.get('displayName').toLowerCase();
                    var firstStopped = moment(firstModel.get('stopped'), 'YYYYMMDDHHmm').valueOf();
                    var secondStopped = moment(secondModel.get('stopped'), 'YYYYMMDDHHmm').valueOf();
                    var firstNextAdmin = firstModel.get('nextAdminData').display;
                    var secondNextAdmin = secondModel.get('nextAdminData').display;

                    /* expired or discontinued */
                    if (priority === 2 || priority === 1) {
                        if (firstStopped < secondStopped) {
                            return -1;
                        } else if (firstStopped > secondStopped) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                    /* pending */
                    else if (priority === 3) {
                        if (firstName < secondName) {
                            return -1;
                        } else if (firstName > secondName) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                    /* active */
                    else if (priority === 4) {
                        if (firstNextAdmin < secondNextAdmin) {
                            return -1;
                        } else if (firstNextAdmin > secondNextAdmin) {
                            return 1;
                        } else {
                            return 0;
                        }
                    } else if (priority === 0) {

                        return 0;
                    }

                }
            };
            this.statusNextOrStatusFillableSort = this.statusFillableSortFunction;
            if (this.model.get('vaType') && this.model.get('vaType').toLowerCase() === "i") {
                this.statusNextOrStatusFillableSort = this.statusNextSortFunction;
            }
        }
    });
});
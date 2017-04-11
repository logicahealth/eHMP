define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'hbs!app/applets/medication_review/medicationsGroupedByType/superAccordionRow/medTypeRow',
    'app/applets/medication_review/medicationsGroupedByType/superAccordionRow/medTypeRowModel',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionList/medNameListCollection',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/medNameRowView',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/graph/highchartConfig'
], function(_, Backbone, Marionette, Handlebars, MedTypeRow, MedTypeRowModel, MedNameListCollection, MedNameRowView, HighchartConfig) {
    'use strict';
    var EmptyView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<p class="emptyMedsList">No Records Found</p>')
    });

    return Backbone.Marionette.CompositeView.extend({
        ui: {
            accordionPanel: '.panel-body',
            caret: '.right-padding-xs',
            graphHeader: '.graph-header',
            sortCaret: '.sort-caret',
            columnHeader: '.header'
        },
        childEvents: {
            'toolbar': 'onChildClicked'
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
        className: 'panel panel-default med-type-list-view selectable accordion-toggle',
        attributes: {
            'tabindex': 1
        },
        childViewContainer: '.med-name-row-view-region',
        childView: MedNameRowView,
        childViewOptions: function() {
            return {
                appletInstanceId: this.options.appletInstanceId
            };
        },
        emptyView: EmptyView,
        setEmptyMessage: function(errorMessage) {
            this.emptyView = Backbone.Marionette.ItemView.extend({
                template: _.template('<p class="emptyMedsList">No Records Found</p>')
            });
        },
        onRender: function() {
            if (this.model.collection && this.model.collection.indexOf(this.model) !== 0) {
                this.ui.caret.addClass('fa fa-caret-right');
            } else {
                this.ui.caret.addClass('fa fa-caret-down');
                this.ui.accordionPanel.addClass('in');
            }

            if (this.model.get('medications').length > 0) {
                this.addHeaderGraph();

                this.listenTo(ADK.Messaging, 'meds-review-date-change', function(dateModel) {
                    if (this.hasGraph) {
                        this.ui.graphHeader.highcharts().destroy();
                    }
                    this.addHeaderGraph();
                });
            }

            var self = this;
            this.$el.on('shown.bs.collapse', function() {
                self.redrawGraph();
                self.ui.caret.removeClass('fa fa-caret-right');
                self.ui.caret.addClass('fa fa-caret-down');
            });
            this.$el.on('hidden.bs.collapse', function() {
                self.ui.caret.removeClass('fa fa-caret-down');
                self.ui.caret.addClass('fa fa-caret-right');
            });
        },
        redrawGraph: function() {
            if (this.hasGraph) {
                this.ui.graphHeader.highcharts().reflow();
            }
            ADK.Messaging.trigger('medication_review:superAccordionClicked');
        },
        onAttach: function() {
            if (this.hasGraph) {
                this.ui.graphHeader.highcharts().reflow();
            }
        },
        onBeforeDestroy: function() {
            if (this.hasGraph) {
                this.ui.graphHeader.highcharts().destroy();
            }
        },
        sortCollection: function(headerElement) {
            /* clear existing collection comparator to allow collection to rerender after sort */
            this.collection.comparator = null;
            if (headerElement.attr("sortable") === "true") {
                var nextSortOrder = '';
                switch (headerElement.attr("sortDirection")) {
                    case 'asc':
                        nextSortOrder = 'desc';
                        break;
                    case 'desc':
                        nextSortOrder = 'none';
                        break;
                    case 'none':
                        nextSortOrder = 'asc';
                        break;
                }
                this.ui.columnHeader.attr("sortDirection", 'none');
                headerElement.attr("sortDirection", nextSortOrder);
                this.ui.sortCaret.removeClass('fa-caret-up');
                this.ui.sortCaret.removeClass('fa-caret-down');

                if (nextSortOrder === "asc") {
                    headerElement.find('.sort-caret').addClass('fa-caret-up');
                } else if (nextSortOrder === "desc") {
                    headerElement.find('.sort-caret').addClass('fa-caret-down');
                }

                if (nextSortOrder === 'none') {
                    ADK.utils.CollectionTools.resetSort(this.collection);
                } else {
                    var sortType = headerElement.attr("sortType");
                    var key = headerElement.attr("sortKey");
                    ADK.utils.CollectionTools.sort(this.collection, key, nextSortOrder, sortType, this.statusNextOrStatusFillableSort);
                }
            }
        },
        addHeaderGraph: function() {
            var dateModel = ADK.SessionStorage.getModel('globalDate');
            var medicationChannel = ADK.Messaging.getChannel("medication_review");
            var earliestStartAsEpoch = medicationChannel.request('earliestStartAsEpoch');
            var oldest;

            if (dateModel.get('selectedId') === 'all-range-global') {
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
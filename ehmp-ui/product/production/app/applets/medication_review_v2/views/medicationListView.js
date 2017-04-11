define([
    'jquery',
    'underscore',
    'backbone',
    'hbs!app/applets/medication_review_v2/templates/medicationsListLayout',
    'hbs!app/applets/medication_review_v2/templates/medicationsListItem',
    'app/applets/medication_review_v2/views/medicationDetailView',
    'app/applets/medication_review_v2/charts/chartBuilder',
    'app/applets/medication_review_v2/charts/chartConfig',
    'main/components/appletToolbar/appletToolbarView',
], function($, _, Backbone, MedicationListLayoutTemplate, MedicationListItemTemplate, MedicationDetailView, ChartBuilder, GraphConfig, ToolbarView) {

    'use strict';
    var AppletID = null;

    var MedicationListItem = Backbone.Marionette.LayoutView.extend({
        template: MedicationListItemTemplate,
        className: 'medsItem item',
        chartPointer: null,
        ui: {
            toolbarToggler: '.selectable'
        },

        events: {
            'click [data-toggle="collapse"]': function(event) {
                event.stopImmediatePropagation();
            },
            'click .medsItemInner': function(event) {
                var activeAccordion = this.$el.find(".medicationReviewDetail");
                var allMedicationDetailViewAccordions = $(".medicationReviewDetail.collapse.in");
                var notActiveAccordions = allMedicationDetailViewAccordions.not(activeAccordion);
                notActiveAccordions.collapse('toggle');
            },
            'click .clickDetail': function(event) {
                this.showDetail();
            },
            'click .appletToolbar .btn': function() {
                this.hideToolbar();
            },
            'click .selectable': 'toggleToolbar',
            'keydown': function(e) {
                var k = e.which || e.keyCode;
                if (!/(13|32)/.test(k)) return;
                this.ui.toolbarToggler.trigger('click');
                e.preventDefault();
                e.stopPropagation();
            },
        },

        initialize: function(options) {
            var instanceid = this.instanceid;
            this.model.set('instanceid', instanceid);
            var id = this.model.get('uid').replace(/[:|.]/g, "_");
            this.$el.attr('data-group-uid', 'medication_Item_' + this.model.get('id'));
            this.$el.data('view', this);
            this.model.set('id', id);
            this.model.set('applet_id', options.AppletID);
            this.model.set('medicationClass', options.medicationClass);
            if (this.model.get('medicationClass').toLowerCase() === "inpatient") {
                this.model.set('inpatient', true);
            }
            if (this.model.get('subMedsInternalGroupModels').models[0] !== undefined) {
                this.model.set('graphInfoText', this.model.get('subMedsInternalGroupModels').models[0].get('graphInfoText'));
            } else {
                //If the subgroup has all bad data, the models array will be empty. We recreate this array here
                //to allow the list to display the medication name and an icon.
                this.model.set('emptySubMedsInternalGroupModels', true);
                this.model.get('subMedsInternalGroupModels').reset(new Backbone.Model({
                    isFirstOverlappingMed: true,
                    firstFacilityMed: new Backbone.Model({
                        displayName: this.model.get('displayName'),
                        badDataFound: true
                    })
                }));
            }

            this.initialized = false;
            var self = this;
            if (this.model.get('subMedsInternalGroupModels').models[0] !== undefined && this.model.get('subMedsInternalGroupModels').models[0].get('ariaLabelAdditionalText')) {
                this.model.set('ariaLabelAdditionalText', this.model.get('subMedsInternalGroupModels').models[0].get('ariaLabelAdditionalText'));
            }

            this.model.set('overlappingMeds', this.model.get('subMedsInternalGroupModels').models);
            this.listenTo(ADK.Messaging.getChannel(options.AppletID), 'detailView', function(params) {
                if (params.uid === self.model.get('uid')) {
                    var accordion = self.$el.find('[data-toggle="collapse"]').find('.collapse');
                    accordion.collapse('toggle');
                }

            });

            if (this.model) {
                this.detailView = new MedicationDetailView({
                    model: this.model
                });
            }


        },
        regions: function(options) {
            var instanceid = this.instanceid;
            options.model.set('instanceid', instanceid);
            var detailRegion = "#detail_Area_" + options.model.get('uid').replace(/[:|.]/g, "_") + '_' + options.model.get('instanceid');
            var regions = {
                detailRegion: detailRegion,
                toolbarView: '.toolbar-container'

            };
            return regions;
        },
        onBeforeDestroy: function() {
            var meds = this.model;
            if (typeof(this.$el.find('#chart_' + meds.get('id') + '_' + meds.get('instanceid')).highcharts()) !== 'undefined') {
                (this.$el.find('#chart_' + meds.get('id') + '_' + meds.get('instanceid')).highcharts()).destroy();
            }
            if (this.toolbar) {
                this.toolbar.destroy();
            }
        },
        onRender: function() {
            var targetElement = this.$el.find('.medsItemInner');
            targetElement.options = this.options;
            targetElement.$el = this.$el;
            targetElement.model = this.model;
            this.toolbar = new ToolbarView({
                targetElement: targetElement,
                buttonTypes: ['infobutton', 'detailsviewbutton'],
                appletID: this.options.AppletID,
                model: this.model
            });



        },
        onShow: function() {
            var self = this;
            var chart;
            //hide chart container for Inpatient and IV types
            if (vaType === 'I' || vaType === 'V') {
                this.$el.find('.highcharts-container').hide();
            } else if (!this.model.get('emptySubMedsInternalGroupModels')) { //if empty model - don't chart it but don't hide the view
                var meds = this.model;
                var buildchart = new ChartBuilder(meds);
                var medChartConfig = new GraphConfig(buildchart);
                var vaType = this.model.get("vaType");
                setTimeout(function() {
                    chart = self.$el.find('#chart_' + meds.get('id') + '_' + meds.get('instanceid')).highcharts(medChartConfig).highcharts();
                }, 500);


            }


            this.toolbarView.show(this.toolbar);
        },
        toggleToolbar: function() {
            var toolbarView = this.toolbarView.currentView;
            if (this.$el.hasClass('toolbarActive')) {
                this.hideToolbar();
            } else {
                this.showToolbar();
            }
        },
        showToolbar: function() {
            var toolbarView = this.toolbarView.currentView;
            this.trigger('before:showtoolbar');
            toolbarView.show();
            this.$el.addClass('toolbarActive');
            this.trigger('after:showtoolbar', toolbarView);
            this.$el.siblings()
                .each(function() {
                    var view = $(this).data('view');
                    view.hideToolbar();
                });
        },
        hideToolbar: function() {
            var toolbarView = this.toolbarView.currentView;
            this.trigger('before:hidetoolbar');
            toolbarView.hide();
            this.$el.removeClass('toolbarActive');
            this.trigger('after:hidetoolbar');
        },
        showDetail: function() {
            if (this.detailView) {
                this.showChildView('detailRegion', this.detailView);
            }
        }
    });

    var MedicationList = Backbone.Marionette.CompositeView.extend({
        template: MedicationListLayoutTemplate,
        // childView: MedicationListItem.extend({
        //     instanceid: this.options.instanceid
        // }),
        className: 'panel panel-default medsReviewMainGroup',
        emptyView: Backbone.Marionette.ItemView.extend({
            template: _.template('<div class="emptyMedsList">No Records Found</div>')
        }),
        templateHelpers: function() {
            return {
                normalizeMedicationClass: function() {
                    return this.medicationClass.replace(/_/g, ' ');
                }
            };
        },
        events: {
            'show.bs.collapse .mainAccordionPanel': 'onExpandGroup',
            'shown.bs.collapse .mainAccordionPanel': 'reflowHChart',
            'hide.bs.collapse .mainAccordionPanel': 'onCollapseGroup',
            'hidden.bs.collapse .mainAccordionPanel': 'reflowHChart',
            'focus .mainAccordion': function(event) {
                var mainAccordion = $(event.target);
                mainAccordion.keypress(function(e) {
                    if (e.which === 13 || e.which === 32) {
                        mainAccordion.click();
                    }
                });
            },
            'click .header': function(event) {
                event.preventDefault();
                event.stopImmediatePropagation();
                this.sortCollection($(event.target));
            },
            'focus .header': function(event) {
                event.preventDefault();
                event.stopImmediatePropagation();
                var currentHeaderFocus = $(event.target);
                var self = this;
                currentHeaderFocus.keypress(function(e) {
                    if (e.which === 13 || e.which === 32) {
                        self.sortCollection(currentHeaderFocus);
                    }
                });
            }
        },
        onDomRefresh: function() {
            this.reflowHChart();
        },
        onRender: function() {
            var self = this;
            if (!_.isUndefined(this.model.get('meds').models[0])) {
                var chartHeaderID = this.model.get('medicationClass') + '-graph-header-' + this.model.get('instanceid');
                var olddate = this.model.get('meds').models[0].get('graphRelativeityOldestTime');
                var newdate = this.model.get('meds').models[0].get('graphRelativeityNewestTime');
                var vaType = this.model.get("meds").models[0].get("vaType");
                //exclude Inpatient and IV types from charting
                if (vaType !== 'I' && vaType !== 'V') {
                    this.headerChartConfig = new GraphConfig({
                        chart: {
                            height: 20
                        },
                        name: 'headerChart',
                        xAxis: {
                            min: olddate,
                            max: newdate,
                            labels: {
                                enabled: true
                            },
                            tickColor: '$grey-dark',
                            tickLength: 12,
                            tickWidth: 2,
                            tickPosition: 'outside'
                        },
                        yAxis: {
                            categories: [{
                                categories: ["headerChart"]
                            }]
                        },
                        series: [{
                            pointRange: 60 * 1000,
                            data: [{
                                height: 1,
                                x: olddate,
                                x2: newdate,
                                y: 0
                            }]
                        }]
                    });
                    this.headerChartPointer = $('#' + chartHeaderID);
                    setTimeout(function() {
                        (self.$el.find('#' + self.model.get('medicationClass') + '-graph-header-' + self.model.get('instanceid'))).highcharts(self.headerChartConfig);
                    }, 500);

                }
            }
        },
        onBeforeDestroy: function() {
            var pointer = (this.$el.find('#' + this.model.get('medicationClass') + '-graph-header-' + this.model.get('instanceid')));
            if (typeof(pointer.highcharts()) !== 'undefined') {
                (pointer.highcharts()).destroy();
            }

        },
        reflowHChart: function() {
            var self = this;
            if (!this.model.get('hasEmptyView')) {
                $('[medsItemChart="true"]').each(function() {
                    if (!_.isUndefined($(this).highcharts())) {
                        var chartHeaderID = '#' + self.model.get('medicationClass') + '-graph-header-' + self.model.get('instanceid');
                        var firstChartHeader = $(chartHeaderID);
                        var height = $(this).highcharts().chartHeight;
                        var width = firstChartHeader.width();
                        $(this).highcharts().setSize(width, height, false);
                        $(this).highcharts().reflow();
                    }
                });
            }

        },
        onExpandGroup: function(event) {
            if ($(event.target).hasClass('mainAccordionPanel')) {
                var caret = this.$el.find('.mainAccordionIndicator');

                caret.removeClass('fa-caret-right');
                caret.addClass('fa-caret-down');
            }

        },
        onCollapseGroup: function(event) {
            if ($(event.target).hasClass('mainAccordionPanel')) {
                var caret = this.$el.find('.mainAccordionIndicator');

                caret.removeClass('fa-caret-down');
                caret.addClass('fa-caret-right');
            }

        },

        initialize: function(options) {
            this.childView = MedicationListItem.extend({
                instanceid: options.instanceid
            });
            this._super = Backbone.Marionette.CompositeView.prototype;
            this.model.set('instanceid', options.instanceid);

            AppletID = getAppletId(options);
            this.childViewOptions = {
                AppletID: AppletID,
                medicationClass: this.model.get('type'),
                chartHeaderID: '#' + this.model.get('type').toUpperCase() + '-graph-header-' + this.model.get('instanceid')
            };

            if (this.model.get('expandOnInitialRender')) {
                if (this.model.get('meds').models.length > 0) {
                    this.model.get('meds').models[this.model.get('meds').models.length - 1].set('lastChildInCollection', true);
                }
            }
            this.collection = this.model.get('meds');
            if (this.model.get('type').toLowerCase() === "inpatient") {
                this.model.set('inpatient', true);
            }

            this.model.set('id', AppletID);
            this.model.set('medicationClass', this.model.get('type').toUpperCase());
            this.$el.attr('data-group-instanceid', 'medsReviewMainGroup_' + this.model.get('medicationClass'));
            this.childViewContainer = "." + this.childViewOptions.medicationClass + "-medication" + "-list-items";

            /* In some cases the hight of the empty view could be really tall, so if the collecion is 
                empty, set the container height to a fixed value. */
            if (this.collection.models.length === 0) {
                this.model.set('hasEmptyView', true);
                this.childViewContainer = "." + this.childViewOptions.medicationClass + "-medication" + "-list-items";
            }


            this.statusFillableSortFunction = function(firstModel, secondModel) {
                var fillablePriority = function(model) {
                    var fillsRemaining = model.get('fillsRemaining');
                    var status = model.get('standardizedVaStatus').toLowerCase();
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
                    var firstName = firstModel.get('displayName').toLowerCase();
                    var secondName = secondModel.get('displayName').toLowerCase();
                    var firstStopped = moment(firstModel.get('stopped'), 'YYYYMMDDHHmm').valueOf();
                    var secondStopped = moment(secondModel.get('stopped'), 'YYYYMMDDHHmm').valueOf();
                    var firstFillsRemaining = firstModel.get('fillableDays');
                    var secondFillsRemaining = secondModel.get('fillableDays');

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

                    var nextAdmin = model.get('nextInpatientAdminText');
                    var status = model.get('standardizedVaStatus').toLowerCase();
                    var fillableStatus = model.get('fillableStatus');
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
            if (this.model.get('inpatient') === true) {
                this.statusNextOrStatusFillableSort = this.statusNextSortFunction;
            }
            this._super.initialize.apply(this, arguments);
        },
        toggleMainAccordion: function() {
            var caret = this.$el.find('.mainAccordionIndicator');
            if (caret.hasClass('fa-caret-right')) {
                caret.removeClass('fa-caret-right');
                caret.addClass('fa-caret-down');
            } else {
                caret.removeClass('fa-caret-down');
                caret.addClass('fa-caret-right');
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
                this.$el.find('.header').attr("sortDirection", 'none');
                headerElement.attr("sortDirection", nextSortOrder);
                this.$el.find('.header').find('[sortArrow=headerDirectionalIndicator]').removeClass('fa-caret-up');
                this.$el.find('.header').find('[sortArrow=headerDirectionalIndicator]').removeClass('fa-caret-down');

                if (nextSortOrder === "asc") {
                    headerElement.find('[sortArrow=headerDirectionalIndicator]').addClass('fa-caret-up');
                } else if (nextSortOrder === "desc") {
                    headerElement.find('[sortArrow=headerDirectionalIndicator]').addClass('fa-caret-down');
                }

                if (nextSortOrder === 'none') {
                    ADK.utils.CollectionTools.resetSort(this.collection);
                } else {
                    var sortType = headerElement.attr("sortType");
                    var key = headerElement.attr("sortKey");
                    ADK.utils.CollectionTools.sort(this.collection, key, nextSortOrder, sortType, this.statusNextOrStatusFillableSort);
                }
            }
            this.reflowHChart();
        }
    });

    function getAppletId() {
        return "medication_review_v2";
    }

    return MedicationList;
});
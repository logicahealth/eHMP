define([
    'backbone',
    'marionette',
    'underscore',
    'highcharts',
    'moment',
    'hbs!app/applets/stackedGraph/list/stackedGraphViewTemplate',
    'app/applets/stackedGraph/list/chartsCompositeView',
    'app/applets/medication_review_v2/medicationCollectionHandler',
    'app/applets/medication_review_v2/medicationResourceHandler',
    'app/applets/stackedGraph/utils/utils',
    'typeahead',
    'highcharts-more',
    'app/applets/medication_review_v2/applet',
    'app/applets/lab_results_grid/applet'
], function(Backbone, Marionette, _, Highcharts, moment, StackedGraphViewTemplate, ChartsCompositeView, CollectionHandler, MedsResource, Utils) {
    "use strict";

    return Backbone.Marionette.LayoutView.extend({
        template: StackedGraphViewTemplate,
        initialize: function(options) {
            var self = this;
            this.appletOptions = options;
            this.predefined = ADK.ADKApp.currentScreen.config.predefined;
            this.isAdded = [];
            this.activeCharts = [];
            this.timeLineCharts = [];
            this.instanceId = options.appletConfig.instanceId;
            this.chartOptionsCollection = new Backbone.Collection(null, {
                comparator: function(graph) {
                    return graph.get('stackedGraphPosition');
                }
            });

            this.listenTo(this.chartOptionsCollection, 'remove', function(model, collection, options) {
                if (!_.isUndefined(options.removeIndex)) {
                    // Remove the reordered chart from the activeCharts array.
                    self.activeCharts.splice(self.activeCharts.length - (options.removeIndex+1), 1);
                }
            });
            this.stackedGraphChannel = ADK.Messaging.getChannel('stackedGraph');
            this.listenTo(this.stackedGraphChannel, 'readyToChart', function(response) {
                if (response.response.requesterInstanceId === self.instanceId) {
                    if (!_.isUndefined(self.chartsCompositeView)) {
                        //Need this for when adding new graphs
                        self.chartsCompositeView.$noGraph.hide();
                    }
                    //we need to map this model to the original response's graphType and typeName
                    //incoming graphType and typeName on response may not necessarily be the same that we sent on request
                    //example: The vitals stacked graph changes Blood Pressure to Blood Pressure Systolic on the response. This breaks deleting the graph when mismatch occurs
                    response.response.stackedGraphType = response.requestParams.graphType;
                    response.response.stackedGraphTypeName = response.requestParams.typeName;
                    response.response.stackedGraphPosition = response.requestParams.graphPosition;

                    self.chartOptionsCollection.add(response.response);
                    self.isAdded.unshift((response.requestParams.typeName + '-' + response.requestParams.graphType.toUpperCase()));
                    var persistedPickList = ADK.UserDefinedScreens.getStackedGraphForOneAppletFromSession(ADK.ADKApp.currentScreen.config.id, self.instanceId);
                    if (_.isUndefined(persistedPickList) || persistedPickList.length === self.isAdded.length) {
                        this.showDefaultScreen(self);
                        self.chartsCompositeView.$noGraph.hide();
                        self.isLoading = false;
                    }
                }
            });

            this.listenTo(ADK.Messaging, 'globalDate:selected', function(dateModel) {
                var sessionGlobalDate = ADK.SessionStorage.getModel_SessionStoragePreference('globalDate');
                var fromDate = moment(sessionGlobalDate.get('fromDate'), 'MM/DD/YYYY');
                var toDate = moment(sessionGlobalDate.get('toDate'), 'MM/DD/YYYY');

                //add 1 day to toDate to enusure red line for current date is always displayed on the chart
                toDate.add(1, 'd');
                _.each(this.activeCharts, function(e, i) {
                    e.xAxis[0].setExtremes(Date.UTC(fromDate.year(), fromDate.month(), fromDate.date()), Date.UTC(toDate.year(), toDate.month(), toDate.date()));
                });

                _.each(self.timeLineCharts, function(e, i) {
                    e.xAxis[0].setExtremes(Date.UTC(fromDate.year(), fromDate.month(), fromDate.date()), Date.UTC(toDate.year(), toDate.month(), toDate.date()));
                });
            });

            this.listenTo(this.stackedGraphChannel, 'delete', function(response) {
                if (response.model.attributes.requesterInstanceId !== self.instanceId || this.predefined === true) {
                    return;
                }

                var bodyView = Backbone.Marionette.ItemView.extend({
                    template: _.template('<p><strong>Are you sure you want to delete the ' + response.model.attributes.typeName + ' graph?</strong></p>')
                });

                var footerView = Backbone.Marionette.ItemView.extend({
                    template: _.template('<button type="button" class="btn btn-default btn-sm" title="Press enter to go back" data-dismiss="modal">No</button>' +
                        '<button type="button" class="btn btn-danger btn-sm" title="Press enter to delete" data-dismiss="modal">Yes</button>'),
                    events: {
                        'click .btn-danger': 'deleteGraph',
                        'click .btn-default': 'cancelDelete'
                    },
                    deleteGraph: function() {
                        var focusEl = this.findFocusEl();
                        var pickListPersistanceFetchOptions = {
                            resourceTitle: 'user-defined-stack',
                            fetchType: 'DELETE',
                            criteria: {
                                id: ADK.ADKApp.currentScreen.config.id,
                                instanceId: self.instanceId,
                                graphType: response.model.attributes.stackedGraphType,
                                typeName: response.model.attributes.stackedGraphTypeName.toUpperCase()
                            },

                            onSuccess: function() {
                                var filter = self.chartOptionsCollection.filter(function(model) {
                                    return (model.get('stackedGraphTypeName').toUpperCase() + '-' + model.get('stackedGraphType').toUpperCase()) === (response.model.get('stackedGraphTypeName').toUpperCase() + '-' + response.model.get('stackedGraphType').toUpperCase());
                                });
                                self.chartOptionsCollection.remove(filter);
                                var index = _.indexOf(self.isAdded, (filter[0].get('stackedGraphTypeName').toUpperCase() + '-' + filter[0].get('stackedGraphType').toUpperCase()));
                                if (index !== -1) {
                                    self.isAdded.splice(index, 1);
                                }
                                // Reset the applet graph view if all charts are removed.
                                if (self.chartOptionsCollection.length === 0) {
                                    self.chartsCompositeView.$noGraph.show();
                                }
                            }
                        };

                        ADK.ResourceService.fetchCollection(pickListPersistanceFetchOptions);

                        ADK.UserDefinedScreens.removeOneStackedGraphFromSession(
                            ADK.ADKApp.currentScreen.config.id,
                            self.instanceId,
                            response.model.attributes.stackedGraphType,
                            response.model.attributes.stackedGraphTypeName
                        );
                        ADK.UI.Alert.hide();
                        focusEl.focus();
                    },
                    cancelDelete: function() {
                        ADK.UI.Alert.hide();
                        if (this.model.get('activeEl').length === 0) {
                            this.model.get('picklistBtnEl').focus();
                        } else {
                            this.model.get('activeEl').focus();
                        }
                    },
                    findFocusEl: function() {
                        var activeRow = this.model.get('activeEl');
                        var nextRow = activeRow.next();
                        if (activeRow.siblings('[tabindex]').length === 0) {
                            return this.model.get('picklistBtnEl');
                        } else if (nextRow.attr('tabindex') === '0') {
                            return nextRow;
                        } else {
                            return activeRow.prev();
                        }
                    }
                });

                var footerModel = new Backbone.Model({
                    activeEl: this.$('.toolbar-active'),
                    picklistBtnEl: this.$el.closest('[data-appletid="stackedGraph"]').find('[data-toggle="dropdown"]')
                });

                var modal = new ADK.UI.Alert({
                    title: 'Delete',
                    icon: 'icon-triangle-exclamation',
                    messageView: bodyView,
                    footerView: footerView.extend({
                        model: footerModel
                    })

                });
                modal.show();
            });

            var persistedPickList = ADK.UserDefinedScreens.getStackedGraphForOneAppletFromSession(ADK.ADKApp.currentScreen.config.id, self.instanceId);

            if (persistedPickList) {
                populateApplet(persistedPickList);
            }

            this.listenTo(ADK.Messaging, 'refresh:applet', function(instanceId) {
                if (self.instanceId !== instanceId) {
                    return;
                }
                // Clear out activeCharts to prevent memory leak
                self.activeCharts = [];
                self.isAdded.length = 0; //this clears the array without breaking reference on chartsCompositeView
                var persistedPickList = ADK.UserDefinedScreens.getStackedGraphForOneAppletFromSession(ADK.ADKApp.currentScreen.config.id, self.instanceId);
                if (persistedPickList) {
                    populateApplet(persistedPickList);
                }

            });

            function populateApplet(persistedPickList) {
                self.isLoading = true;
                if (self.isRendered) {
                    self.collectionViewRegion.show(ADK.Views.Loading.create());
                }

                //separate function as lint would not allow anonymous function in callbacks inside a loop.
                var requestGraphInfo = function(index) {

                    var persistedPickListItem = persistedPickList[index];
                    var params = {
                        typeName: persistedPickListItem.typeName,
                        instanceId: self.instanceId,
                        graphType: persistedPickListItem.graphType,
                        graphPosition: persistedPickList.length - index //last graph on list must be shown first an so on.

                    };

                    var channel;
                    var $deferred = $.Deferred();

                    if (persistedPickListItem.graphType === 'Vitals') {
                        channel = ADK.Messaging.getChannel('vitals');
                        $deferred.resolve({
                            collection: null
                        });


                    } else if (persistedPickListItem.graphType === 'Lab Tests') {
                        channel = ADK.Messaging.getChannel('lab_results_grid');
                        $deferred.resolve({
                            collection: null
                        });
                    } else if (persistedPickListItem.graphType === 'Medications') {
                        channel = ADK.Messaging.getChannel('meds_review');
                        var medCollection = ADK.ResourceService.createEmptyCollection({
                            pageable: true
                        });
                        self.listenToOnce(medCollection, 'read:success', function(collection) {
                            self.stopListening(medCollection, 'read:error');
                            $deferred.resolve({
                                collection: collection
                            });
                        });
                        self.listenToOnce(medCollection, 'read:error', function(collection) {
                            self.stopListening(medCollection, 'read:success');
                        });
                        CollectionHandler.fetchAllMeds(false, medCollection);
                    }

                    $deferred.done(function(response) {
                        params.collection = response.collection;
                        channel.request('chartInfo', params);
                    });
                };


                for (var ind = 0; ind < persistedPickList.length; ind++) {
                    requestGraphInfo(ind);
                }

            }

        },
        showDefaultScreen: function(self) {
            self.chartsCompositeView = new ChartsCompositeView({
                collection: self.chartOptionsCollection,
                instanceId: self.instanceId,
                options: {
                    appletId: self.appletOptions.appletConfig.id,
                    isAdded: self.isAdded
                },
                activeCharts: self.activeCharts,
                timeLineCharts: self.timeLineCharts
            });

            var sessionGlobalDate = ADK.SessionStorage.getModel_SessionStoragePreference('globalDate');
            var fromDate = moment(sessionGlobalDate.get('fromDate'), 'MM/DD/YYYY');
            var toDate = moment(sessionGlobalDate.get('toDate'), 'MM/DD/YYYY');

            //add 1 day to toDate to enusure red line for current date is always displayed on the chart
            toDate.add(1, 'd');

            // The following used to have a setInterval and if statement self.$('.header-placeholder').length > 0) which would clear the
            // interval.  However, that since that should always evaluate to true (because of the self) than it seems
            // like it would be better to use an animationFrame which is the optimal time to draw to the DOM
            window.requestAnimationFrame(function() {
                var timeLineChart1 = self.$('.header-placeholder').highcharts($.extend(true, {}, self.pChartOptions, {
                    xAxis: {
                        labels: {
                            y: -10
                        }
                    }
                })).highcharts();
                timeLineChart1.xAxis[0].setExtremes(Date.UTC(fromDate.year(), fromDate.month(), fromDate.date()), Date.UTC(toDate.year(), toDate.month(), toDate.date()));
                self.timeLineCharts.push(timeLineChart1);
            });

            // Same as above
            window.requestAnimationFrame(function() {
                var timeLineChart2 = self.$('.footer-placeholder').highcharts(self.pChartOptions).highcharts();
                timeLineChart2.xAxis[0].setExtremes(Date.UTC(fromDate.year(), fromDate.month(), fromDate.date()), Date.UTC(toDate.year(), toDate.month(), toDate.date()));
                self.timeLineCharts.push(timeLineChart2);
            });

            self.collectionViewRegion.show(self.chartsCompositeView);

            function onMouseLeaveHitArea(evt) {
                $.each(self.activeCharts, function(i, obj) {
                    obj.tooltip.hide();
                });
            }

            var pointers = self.$('.stacked-graph-pointer');

            self.$('*').not('.collection-container .render-to, .highcharts-container').on('mouseover.stackedGraph', function(e) {
                pointers.css({
                    visibility: 'hidden'
                });
                // hidePointer();

                $.each(self.activeCharts, function(i, chart) {
                    if (chart.tooltip) {
                        chart.tooltip.hide();
                    }
                    if (chart.line) {
                        chart.line.
                        css({
                            visibility: 'hidden'
                        });

                    }
                });

            });

            self.$('.collection-container').on({
                'mouseover.stackedGraph': function(evt) {
                    evt.stopPropagation();
                    if (self.activeCharts.length < 1) {
                        return;
                    }

                    $.each(self.activeCharts, function(i, chart) {
                        var ev = chart.pointer.normalize(evt);
                        var mouseX = evt.pageX;
                        chart.pointer.runPointActions(ev);
                        if (chart.line) {
                            chart.line.attr({
                                x: ev.chartX
                            }).
                            css({
                                visibility: 'visible'
                            });
                        }
                    });
                },
                'mousemove.stackedGraph': function(evt) {
                    evt.stopPropagation();
                    if (self.activeCharts.length < 1) {
                        return;
                    }

                    $.each(self.activeCharts, function(i, chart) {
                        var ev = chart.pointer.normalize(evt);
                        var mouseX = evt.pageX;
                        chart.pointer.runPointActions(ev);
                        if (chart.line) {
                            chart.line.attr({
                                x: ev.chartX
                            });
                        }

                    });

                    var chartX = self.activeCharts[0].pointer.normalize(evt);

                    pointers.text(moment(self.activeCharts[0].xAxis[0].toValue(chartX.chartX)).format('M/D/YY'));

                    var offSet = self.$('.pointer-container').offset();
                    var mouseX = (evt.pageX - offSet.left);
                    pointers.css({
                        left: mouseX - pointers.eq(0).width(),
                        visibility: 'visible'
                    });

                }

            }, '.highcharts-container');
        },
        onShow: function() {
            var self = this;
            if (!this.isLoading) {
                this.showDefaultScreen(self);
            } else {
                //If we have charts to load, show loading screen.
                this.collectionViewRegion.show(ADK.Views.Loading.create());
            }
        },
        pChartOptions: {
            chart: {
                ignoreHiddenSeries: false,
                type: 'line',
                height: 40 //20
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            title: {
                text: null
            },
            subtitle: {
                text: null
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                gridLineWidth: 0,
                labels: {
                    enabled: false
                },
                title: null,
                minPadding: 0,
                maxPadding: 0
            },
            plotOptions: {},
            series: [{
                data: [],
                visible: false
            }]
        },
        /*
         * this eventMapper with the attributes "refresh" and "add"
         * tied to the view's "refreshCollection" and "onClickAdd" methods
         * will enable the Applet Chrome's "refresh" and "add" buttons
         */
        eventMapper: {
            'refresh': 'refreshCollection',
            'add': 'onClickAdd'
        },
        refreshCollection: function() {
            this.chartOptionsCollection.reset();
            ADK.Messaging.trigger('refresh:applet', this.instanceId);
        },
        regions: {
            collectionViewRegion: '.grid-container'
        },
        onDestroy: function() {
            this.$('.collection-container').off('.stackedGraph');
            this.$('*').not('.collection-container .render-to, .highcharts-container').off('.stackedGraph');

            _.each(this.activeCharts, function(e, i) {
                e.destroy();
            });
            this.activeCharts = [];

            _.each(this.timeLineCharts, function(e, i) {
                e.destroy();
            });
            this.timeLineCharts = [];

            this.chartOptionsCollection.reset();
        }

    });
});
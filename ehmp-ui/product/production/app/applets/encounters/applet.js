define([
    "handlebars",
    "underscore",
    "backbone",
    "marionette",
    "moment",
    "app/applets/encounters/GistView",
    "app/applets/encounters/appConfig",
    "app/applets/encounters/appUtil",
    "app/applets/encounters/writeback/encounterForm",
    'app/applets/encounters/writeback/showEncounter',
    'app/applets/encounters/tray/trayView'
], function (Handlebars, _, Backbone, Marionette, moment, GistView, CONFIG, util, WriteBackForm, showEncounter) {
    'use strict';
    /* global ADK */

    var GROUPING = CONFIG.groupBy;

    var ENCOUNTER_ORDER = {
        visit: {title: "Visits", order: 0, sort_direction: "past"},
        admission: {title: "Admissions", order: 2, sort_direction: "past"},
        procedure: {title: "Procedures", order: 3, sort_direction: "past"},
        appointment: {title: "Appointments", order: 1, sort_direction: "future"}
    };


    var viewParseModel = {
        parse: function (response) {
            var activityDate = util.getActivityDateTime(response);
            activityDate = activityDate.substr(0, 8);
            response.eventDate = activityDate;
            response.showDate = util.displayDate(activityDate);
            response.encProvider = util.encounterProvider(response);
            if (util.isAppointment(response)) {
                response.kind = 'Appointment';
                response.custom_filter_field = response.stopCodeName;
            }
            if (util.isDoDAppointment(response)) {
                if (util.isDoDAppointmentFuture(response)) {
                    response.kind = 'Appointment';
                } else {
                    response.kind = 'Visit';
                }
                response.stopCodeName = response.stopCodeName || 'UNKNOWN';
                response.custom_filter_field = response.stopCodeName;
            }
            if (util.isDoDEncounter(response)) {
                response.kind = 'Visit';
                response.stopCodeName = response.stopCodeName || 'UNKNOWN';
                response.appointmentStatus = response.appointmentStatus || "Unknown";
                response.custom_filter_field = response.stopCodeName;
            }
            if (util.isProcedure(response)) {
                response.service = response.service || "Unknown";
                response.procName = response.name || response.consultProcedure || "Unknown";
                response.custom_filter_field = response.procName;
            }
            if (util.isAdmission(response)) {
                response.reasonName = util.admissionDiagnosis(response);
                response.custom_filter_field = response.reasonName;
            }
            if (util.isVisit(response)) {
                if (_.isUndefined(response.stopCodeName)) {
                    response.stopCodeName = 'UNKNOWN';
                }
                response.appointmentStatus = response.appointmentStatus || "Unknown";
                response.custom_filter_field = response.stopCodeName;
            }
            return response;
        }
    };


    var GridApplet = ADK.Applets.BaseGridApplet;
    var AppletLayoutView = GridApplet.extend({
        initialize: function (options) {
            var dataGridOptions = this.dataGridOptions = {
                enableModal: true,
                filterEnabled: true,
                shadowCollection: new Backbone.Collection(),
                collection: new Backbone.Collection(),
                refresh: _.bind(this._refresh, this),
                SummaryView: GistView
            };
            this.appletConfig = options.appletConfig;

            this._setListeners();
            this.queryCollection(this, dataGridOptions.collection);

            AppletLayoutView.__super__.initialize.apply(this, arguments);
        },

        _refresh: function (obj) {
            this.loading();
            this.dataGridView.destroy();
            this.dataGridView = new this.dataGridOptions.SummaryView(this.dataGridOptions);
            this.queryCollection(obj, this.dataGridOptions.collection);
        },

        _setListeners: function () {
            var messaging = ADK.Messaging;
            var internalChannel = messaging.getChannel('encounters_internal');
            this.listenTo(messaging, 'globalDate:selected', this.onGlobalDateSelected);
            this.listenTo(internalChannel, 'filter_collection', this.onFilterCollection);
            this.listenTo(internalChannel, 'clear_filter', this.onClearFilter);
            this.listenTo(internalChannel, 'fetch_error', this.onFetchError);
            this.listenTo(messaging.getChannel('enc_detail_v_a'), 'detailView', this.showVisitDetail);
            this.listenTo(messaging.getChannel('enc_detail_p'), 'detailView', this.showDocumentDetail);
        },
        queryCollection: function (obj, existingCollection) {
            existingCollection.reset(null);
            var searchQuery;
            var self = this;
            var timeRange;
            var toDate;
            if (obj && obj.filterView) {
                searchQuery = obj.filterView.getFilterRegExp();
            }
            var GDate = ADK.SessionStorage.getModel('globalDate');
            if (GDate.get('selectedId') === "allRangeGlobal") { // add 6 month ahead if selected All
                toDate = moment().add(6, 'M').format('MM/DD/YYYY');
                timeRange = obj.buildJdsDateFilter('dateTime', {
                    isOverrideGlobalDate: true,
                    fromDate: GDate.get('fromDate'),
                    toDate: toDate
                });
            } else {
                timeRange = obj.buildJdsDateFilter('dateTime');
            }
            ADK.PatientRecordService.fetchCollection({
                resourceTitle: 'patient-record-timeline',
                onSuccess: function (collection) {
                    self.dataGridOptions.shadowCollection.reset(collection.clone().models);
                    self.onFilterCollection(searchQuery, true);
                },
                onError: function (collection, resp) {
                    ADK.Messaging.getChannel("encounters_internal").trigger("fetch_error", collection, resp);
                },
                pageable: false,
                filterEnabled: true,
                viewModel: viewParseModel,
                cache: true,
                allowAbort: true,
                criteria: {
                    filter: 'or(eq(kind, "Visit"),eq(kind, "Admission"),eq(kind, "Procedure"),eq(kind, "DoD Appointment"),eq(kind, "Appointment"),eq(kind, "DoD Encounter")),' + 'and(' + timeRange + ')',
                    order: 'dateTime DESC'
                }
            }, existingCollection);
        },
        primaryLayerGrouping: function (firstEvent, primeGroup, kind) {
            var time = util.selectStartStopPoint(firstEvent);
            var order = ENCOUNTER_ORDER[kind.toLowerCase()];

            var result = {
                kind: kind,
                elKind: util.clanUpItem(kind),
                count: primeGroup.length,
                firstEvent: time.start,
                firstEventDisplay: util.displayDate(time.start),
                chartData: [],
                maxChart: time.stop,
                processed: true,
                order: order.order || 0,
                appletConfig: this.appletConfig
            };

            primeGroup = _.sortBy(primeGroup, 'dateTime').reverse();
            result.lastEvent = primeGroup[0].dateTime;
            result.lastEventDisplay = util.displayDate(result.lastEvent);

            primeGroup.forEach(function changeDateFormat(item) {
                var dateTokens = item.showDate.split('-');
                item.showDate = [dateTokens[1], '/', dateTokens[2], '/', dateTokens[0]].join('');
            });

            return result;
        },
        primaryLayerOrdering: function (result, primeGroup, kind) {
            var order = ENCOUNTER_ORDER[kind.toLowerCase()];
            if (order && order.sort_direction === "future") {
                result.timeSinceLast = ADK.utils.getTimeSince(util.getTimeSinceForFuture(primeGroup)).timeSince;
                var recentFuture = util.getRecentForFuture(primeGroup);
                result.futureTime = recentFuture.bFutureTime;
            } else {
                result.timeSinceLast = ADK.utils.getTimeSince(primeGroup[0].dateTime).timeSince;
                result.futureTime = false;
            }
            return result;
        },
        primaryLayerChartingData: function (kind, primeGroup, result) {
            var group = GROUPING[kind.toLowerCase()];
            if (group.specialChart) {
                result.allData = primeGroup;
                if (!_.isUndefined(group.parser)) group.parser(result);
            } else {
                var chartMap = {};
                _.each(primeGroup, function mapChartingData(item) {
                    if (!chartMap.hasOwnProperty(item.eventDate)) {
                        chartMap[item.eventDate] = 0;
                    }
                    chartMap[item.eventDate]++;
                });
                _.each(chartMap, function chartingDataToArray(value, key) {
                    result.chartData.push([util.convertChartDate(key), value]);
                });
            }
            result.recent = primeGroup.slice(0, 5);
            return result;
        },
        findSubGroups: function (encounterGroup, field) {
            var subGroups = {};
            _.each(encounterGroup, function findSubGroup(item) {
                var key = item[field];
                if (!subGroups.hasOwnProperty(key)) {
                    subGroups[key] = {
                        count: 0,
                        items: []
                    };
                }
                subGroups[key].count++;
                subGroups[key].items.push(item);
            });
            return subGroups;
        },
        mapSecondaryChartDate: function (subTypes) {
            var chartDataMap = {};
            _.each(subTypes, function (item) {
                var key = item.eventDate;
                if (!chartDataMap.hasOwnProperty(key)) {
                    chartDataMap[key] = 0;
                }
                chartDataMap[key]++;
            });
            return chartDataMap;
        },
        secondaryGroupGraphData: function (currentGroup, grouping, chartDataMap) {
            var series = [];
            var max = 0;

            if (!grouping.specialChart) {

                currentGroup.chartData = _.map(chartDataMap, function (val, key) {
                    if (val < max) {
                        max = val;
                    }
                    series.push([util.convertChartDate(key), val]);
                    return {key: key, value: val};
                });
            }

            currentGroup.graphData = {
                series: series,
                nowMaxCount: max,
                oldestDate: util.convertChartDate(currentGroup.firstEvent),
                newestDate: util.convertChartDate(currentGroup.maxChart)
            };
        },
        secondaryGroupSorting: function (grouping, currentGroup, recent) {
            if (!_.isUndefined(grouping.sort_direction)) {
                if (grouping.sort_direction === "future") {
                    currentGroup.time = ADK.utils.getTimeSince(util.getTimeSinceForFuture(recent)).timeSince;
                } else {
                    currentGroup.time = ADK.utils.getTimeSince(recent[0].dateTime).timeSince;
                }
            } else {
                currentGroup.time = ADK.utils.getTimeSince(recent[0].dateTime).timeSince;
            }
            currentGroup.sort_time = recent[0].dateTime;
        },
        secondLayerGrouping: function (encounterGroup, result, firstEvent, showResult, Node) {
            var kind = result.kind.toLowerCase();
            var grouping = GROUPING[kind];

            if (grouping) {
                result[kind] = true;

                var field = grouping.grouping[0].field;

                var subGroups = this.findSubGroups(encounterGroup, field);
                result.grouping = {
                    title: grouping.grouping[0].title,
                    group: _.map(subGroups, function (val, key) {
                        return {key: key, value: val.count};
                    })
                };

                var groups = result.grouping.group;

                var subListRecent = [];

                _.each(groups, function (currentGroup) {
                    var arrSubType = subGroups[currentGroup.key].items;

                    subListRecent = [];
                    if (arrSubType.length > 0) {
                        subListRecent = _.sortBy(arrSubType, 'dateTime').reverse();
                        currentGroup.allData = subListRecent;
                        currentGroup.recent = subListRecent.slice(0, 5);
                        this.secondaryGroupSorting(grouping, currentGroup, subListRecent);
                    }

                    currentGroup.kind = result.kind;
                    currentGroup.elKind = result.elKind;
                    currentGroup.subKind = currentGroup.key.trim() !== "" ? currentGroup.key : "UNKNOWN";
                    currentGroup.elSubKind = util.clanUpItem(currentGroup.subKind);
                    currentGroup.count = currentGroup.value;
                    currentGroup.processed = true;
                    currentGroup[kind] = true;
                    currentGroup.kind = ENCOUNTER_ORDER[kind].title;

                    var stopPoint = util.selectStartStopPoint(firstEvent);
                    currentGroup.firstEvent = stopPoint.start;
                    currentGroup.maxChart = stopPoint.stop;

                    if (currentGroup.elSubKind.length > 50) {
                        currentGroup.elSubKind = currentGroup.elSubKind.substring(0, 50) + "-" + Math.round(Math.random() * 100);
                    }
                    currentGroup.id = "encounters-" + currentGroup.elKind + "-" + currentGroup.elSubKind;

                    var chartDataMap = this.mapSecondaryChartDate(arrSubType);
                    this.secondaryGroupGraphData(currentGroup, grouping, chartDataMap);

                    showResult.allGroupedEncounters = [];

                    if (!_.isUndefined(grouping.parser)) {
                        grouping.parser(currentGroup);
                    }

                    var arrModels = _.sortBy(groups, 'sort_time').reverse();
                    result.node = new Node({
                        kind: currentGroup.kind,
                        collection: new Node(arrModels)
                    });
                }, this);
            }
            return result;
        },
        addToCollection: function (coll, result) {
            var kind = result.kind.toLowerCase();
            var encounter = ENCOUNTER_ORDER[kind];
            if (encounter) {
                result.kind = encounter.title;
                result.elKind = util.clanUpItem(result.kind);
            }
            coll.add(result);
            return coll;
        },
        collectionAggregator: function (collection) {
            var firstDate;
            var collectionMap = {};
            _.each(collection.toJSON(), function (item) {
                var kind = item.kind;
                if (!collectionMap.hasOwnProperty(kind)) {
                    collectionMap[kind] = [];
                }
                collectionMap[kind].push(item);
                if (item.dateTime < firstDate || _.isUndefined(firstDate)) {
                    firstDate = item.dateTime;
                }
            });

            collection.reset(null, {silent: true});
            collection.comparator = 'order';

            var Node = Backbone.Collection.extend();
            var showResult = {};
            var result = {};
            _.each(collectionMap, function (encounterGroup, kind) {
                var result = this.primaryLayerGrouping(firstDate, encounterGroup, kind, result);
                result = this.primaryLayerOrdering(result, encounterGroup, kind);
                result = this.primaryLayerChartingData(kind, encounterGroup, result);
                result = this.secondLayerGrouping(encounterGroup, result, firstDate, showResult, Node);
                collection = this.addToCollection(collection, result);
            }, this);

            return collection;

        },
        onGlobalDateSelected: function () {
            this.loading();
            this.dataGridView.destroy();
            this.dataGridView = new this.dataGridOptions.SummaryView(this.dataGridOptions);
            this.queryCollection(this, this.dataGridOptions.collection);
        },
        onFilterCollection: function (search, isInitialFetch) {
            //if we have values for lastSearch and current search, we compare to determine if we attempt a search
            //if we can't compare, we return false as we can't do string comparison;
            var isSameAsPreviousSearch = function (lastSearch, currentSearch) {
                if (lastSearch && currentSearch) {
                    return lastSearch.toString() === currentSearch.toString();
                } else {
                    return false;
                }
            };

            //we filter unconditionally if this is first fetch OR if the new term is different from last term
            //this avoids double filtering call due to filtering call being fired from ADK right after fetch.
            if (isInitialFetch || !isSameAsPreviousSearch(this.lastSearch, search)) {
                var filteredCollection;
                if (search) {
                    var filtered = this.dataGridOptions.shadowCollection.filter(function (item) {
                        return search.test(item.get("custom_filter_field"));
                    });
                    filteredCollection = new Backbone.Collection(filtered);
                } else {
                    filteredCollection = this.dataGridOptions.shadowCollection.clone();
                }
                this.dataGridOptions.collection.reset(this.collectionAggregator(filteredCollection).models);

                //we store the last search to avoid re-searching on duplicate search fired by ADK right after load
                this.lastSearch = search;
            }
        },
        onClearFilter: function (search) {
            if (search) {
                this.onFilterCollection(search);
            }
        },
        onFetchError: function (err, resp) {
            this.dataGridOptions.collection.trigger('error', err, resp);
        },
        showVisitDetail: function (params) {
            if (!_.isUndefined(params.model)) {
                if (params.model.get("isCPTdomain")) {
                    params.model.set("recent_model", util.getCPTprocedureDetailViewModel(this, params.uid));
                }
            }
            util.showDetailView(params, "visitDetail");
        },
        showDocumentDetail: function (params) {
            util.showDetailView(params, "documents");
        },
        onBeforeDestroy: function () {
            delete this.dataGridOptions.refresh;
            delete this.dataGridOptions.shadowCollection;

        }
    });

    var encounterChannel = ADK.Messaging.getChannel('encounterFormRequestChannel');
    encounterChannel.comply('openEncounterForm', showEncounter);

    return {
        id: "encounters",
        viewTypes: [{
            type: 'gist',
            view: AppletLayoutView,
            chromeEnabled: true
        }, {
            type: 'writeback',
            view: WriteBackForm,
            chromeEnabled: false
        }],
        defaultViewType: 'gist'
    };
});

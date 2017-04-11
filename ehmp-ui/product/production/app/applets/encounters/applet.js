//----------------------------------------
// Name:        Encounters Gist
// Files:       applet.js, appConfig.js GistView.js appUtil.js templets/item.html templets/itemList.html
// Screen:      Overview.js
// Version:     1.3
// Date:        2014-12-17
// Modified:    2015-12-14
// Team:        Jupiter/Saturn
// Description: Provides gist view (widget) for patient encounters
//
//----------------------------------------
define([
    "handlebars",
    "underscore",
    "backbone",
    "marionette",
    "crossfilter",
    "app/applets/encounters/GistView",
    "app/applets/encounters/appConfig",
    "app/applets/encounters/appUtil",
    "app/applets/encounters/gistConfig",
    "app/applets/encounters/writeback/encounterForm",
    'app/applets/encounters/writeback/modelUtil'
], function(Handlebars, _, Backbone, Marionette, Crossfilter, GistView, CONFIG, util, gistConf, WritebackForm, formUtil) {
    'use strict';
    // Switch ON/OFF debug info
    var DEBUG = CONFIG.debug;
    // Dimentions for grouping
    var GROUPING = CONFIG.groupBy;
    // Showing configurarion
    var SHOWING = CONFIG.showBy;
    // Top tile ordering & injection
    var TOP_ORDER = CONFIG.eventOrder;
    if (DEBUG) console.log("EncGist initialization ----->>Start");
    var ENCOUNTER_FORM_ERROR_MSG = '<h3>There was an error retreiving the encounter form. Try again in a couple of minutes.</h3>';
    var ENCOUNTER_FORM_ERROR_TITLE = 'Encounter Form Error';
    var ENCOUNTER_FORM_ERROR_ICON = 'fa fa-exclamation-triangle font-size-18 color-red';
    var _super;

    var tempChartData = [];
    var dimensionProp = "";
    var aggregationScale = "";
    var filterVal = "";
    var viewParseModel = {
        parse: function(response) {
            if (DEBUG) console.log(response);
            response.eventDate = util.parseDate(util.getActivityDateTime(response), aggregationScale);
            response.showDate = util.displayDate(util.parseDate(util.getActivityDateTime(response)));
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
                //response.custom_filter_field = response.locationDisplayName+" - "+response.facilityName;
                //response.reasonName = response.reasonName || "Unknown";
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
            if (DEBUG) console.log(response);
            return response;
        }
    };
    var AggregationFunctions = {
        // Aggregation sub functions
        dimentionByDateTime: function(d) {
            return d.dateTime;
        },
        prepareChartData: function(p, n) {
            tempChartData.push({
                dateTime: p.eventDate
            });
        },
        orderValue: function(p) {
            return p.key;
        },
        zeroFilter: function(v) {
            return v.value > 0;
        },
        subGrouping: function(d) {
            if (DEBUG) {
                console.log("subGrouping---->> start");
                console.log(dimensionProp);
                console.log(d[dimensionProp]);
                console.log(d);
                console.log("subGrouping---->> stop");
            }
            return d[dimensionProp] || "";
        },
        dateTimeSort: function(d) {
            return d.dateTime;
        },
        timeSort: function(d) {
            return d.sort_time;
        },
        showDateSort: function(x) {
            return x.dateTime.value;
        },
        filterSubItems: function(y) {
            return y[dimensionProp] === filterVal;
        },
        changeDateFormat: function(p, n) {
            var dateTokens = p.showDate.split('-');
            p.showDate = [dateTokens[1], '/', dateTokens[2], '/', dateTokens[0]].join('');
        }
    };

    function collectionFetchError(collection, resp) {
        ADK.Messaging.getChannel("encounters_internal").trigger("fetch_error", collection, resp);
    }
    var GridApplet = ADK.Applets.BaseGridApplet;
    var AppletLayoutView = GridApplet.extend({
        initialize: function(options) {

            if (DEBUG) console.log("EncGist initialization ----->>");
            _super = GridApplet.prototype;
            var dataGridOptions = {};
            dataGridOptions.enableModal = true;
            dataGridOptions.filterEnabled = true;
            dataGridOptions.shadowCollection = new Backbone.Collection();
            dataGridOptions.collection = new Backbone.Collection();
            var self = this;
            dataGridOptions.refresh = function(obj) {
                self.loading();
                self.dataGridView.destroy();
                self.dataGridView = new self.dataGridOptions.SummaryView(self.dataGridOptions);
                self.queryCollection(obj, self.dataGridOptions.collection);
            };

            this.listenTo(ADK.Messaging, 'globalDate:selected', this.onGlobalDateSelected);

            // Event filter_collection
            this.listenTo(ADK.Messaging.getChannel('encounters_internal'), 'filter_collection', this.onFilterCollection);
            // Event clear_filter
            this.listenTo(ADK.Messaging.getChannel('encounters_internal'), 'clear_filter', this.onClearFilter);
            //Fetch error
            this.listenTo(ADK.Messaging.getChannel('encounters_internal'), 'fetch_error', this.onFetchError);

            if (DEBUG) console.log(ADK.SessionStorage.getModel_SessionStoragePreference('globalDate').get("selectedId"));
            aggregationScale = util.setAggregationScale(ADK.SessionStorage.getModel_SessionStoragePreference('globalDate').get("selectedId"));
            this.dataGridOptions = dataGridOptions;
            this.dataGridOptions.SummaryView = GistView;

            // ----- ADK ---------------------------
            window.appletConfig = options.appletConfig; // app id and app instance id for event gist view (ADK)
            window.showInfoButton = false;
            //---------------------------------------

            // request detail view through messaging
            this.listenTo(ADK.Messaging.getChannel('enc_detail_v_a'), 'detailView', this.showVisitDetail);
            this.listenTo(ADK.Messaging.getChannel('enc_detail_p'), 'detailView', this.showDocumentDetail);

            this.queryCollection(this, dataGridOptions.collection);

            _super.initialize.apply(this, arguments);
        },
        queryCollection: function(obj, existingCollection) {
            existingCollection.reset(null);
            var searchQuery;
            var self = this;
            var timeRange;
            var toDate;
            if (obj && obj.filterView) {
                searchQuery = obj.filterView.getFilterRegExp();
            }
            var GDate = ADK.SessionStorage.getModel('globalDate');
            //if(GDate.get('selectedId') === "all-range-global"){ // add 6 month ahead if selected All
            if (GDate.get('selectedId') === "all-range-global") { // add 6 month ahead if selected All
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
                onSuccess: function(collection) {
                    self.dataGridOptions.shadowCollection.reset(collection.clone().models);
                    self.onFilterCollection(searchQuery, true);
                },
                onError: collectionFetchError,
                pageable: false,
                filterEnabled: true,
                viewModel: viewParseModel,
                cache: true,
                criteria: {
                    filter: 'or(eq(kind, "Visit"),eq(kind, "Admission"),eq(kind, "Procedure"),eq(kind, "DoD Appointment"),eq(kind, "Appointment"),eq(kind, "DoD Encounter")),' + 'and(' + timeRange + ')',
                    order: 'dateTime DESC'
                }
            }, existingCollection);
        },

        collectionAggregator: function(coll) {

            if (DEBUG) console.log("EncGist ----->> preare collection (grouping)");
            // Clear collection from wrong Appointments (the same as Visits)
            // var iDup = util.filterAppointments(coll);
            // if (DEBUG) console.log("Appointments vs. Visits duplications ------->>" + iDup);
            var arrData =  coll.toJSON();
            var FirstEventForPatient = "";
            if(arrData.length>0){
                if(typeof arrData[0].dateTime !== "undefined"){
                    FirstEventForPatient = (_.sortBy(arrData,AggregationFunctions.dateTimeSort)).slice(0,1)[0].dateTime;
                }
            }
            if (DEBUG) console.log("First Event for Patient  ------->>" + FirstEventForPatient);
            var encounters = new Crossfilter(arrData);
            coll.reset(null, {silent:true});
            // Collection oredering by order field
            coll.comparator = 'order';
            var encEventCF = null;
            var encEventCFdimByDate = null;
            var dimByKind = encounters.dimension(function(d) { return d.kind; });
            if (DEBUG) console.log("EncGist ----->> crossfilter.size = "+ encounters.size() );
            if (DEBUG) console.log("EncGist ----->> number of types = "+ dimByKind.group().size() );
            var result = {};
            var dimKind = {};
            var dimTime = {};
            var groupingDim = {};
            var showingDim = {};
            var k,z,x,m =0;
            var showResult = {};
            var showTitles = {};
            var arrShowResult =[];
            var arrSubType = [];
            var arrSortByTime = [];
            var pointer;
            var Node = Backbone.Collection.extend();
            var encountersByKindAgrigated =dimByKind.group().all();
            if (DEBUG) console.log(JSON.stringify(encountersByKindAgrigated));  // groups by type and count it
            for(var i=0;i<encountersByKindAgrigated.length;i++){
                arrSortByTime = [];
                result = {kind:"",elKind:"",count:"",
                    firstEvent: util.selectStartStopPoint(FirstEventForPatient).start,
                    lastEvent:"",
                    timeSinceLast:"",
                    chartData:[],
                    firstEventDisplay: "",
                    lastEventDisplay: "",
                    maxChart: util.selectStartStopPoint(FirstEventForPatient).stop,  // max chart date, depends on GDF
                    processed: true, order: 0 };
                result.kind = encountersByKindAgrigated[i].key;
                result.elKind = util.clanUpItem(result.kind); // kind as name of chart container, delete space,/,\ from kind
                result.count = encountersByKindAgrigated[i].value;
                dimKind = dimByKind.filterExact(result.kind);
                tempChartData = []; // reset temp data array
                arrSortByTime = _.sortBy(dimKind.top(Infinity),AggregationFunctions.dateTimeSort).reverse();
                result.timeSinceLast = ADK.utils.getTimeSince(arrSortByTime[0].dateTime).timeSince;
                if(TOP_ORDER[result.kind.toLowerCase()]){
                    if(TOP_ORDER[result.kind.toLowerCase()].sort_direction === "future"){
                        result.timeSinceLast = ADK.utils.getTimeSince(util.getTimeSinceForFuture(arrSortByTime)).timeSince;
                    }
                }
                dimKind.top(Infinity).forEach(AggregationFunctions.prepareChartData); // dateTime array preparation by event type
                encEventCF = new Crossfilter(tempChartData);
                encEventCFdimByDate = encEventCF.dimension(AggregationFunctions.dimentionByDateTime);
                if (DEBUG) console.log("EncGist ----->> temp crossfilter.size = "+ encEventCF.size() );
                dimTime = encEventCFdimByDate.group().order(AggregationFunctions.orderValue).all();
                result.lastEvent  = arrSortByTime[0].dateTime;
                result.firstEventDisplay = util.displayDate(result.firstEvent);
                result.lastEventDisplay  = util.displayDate(result.lastEvent);
                arrSortByTime.forEach(AggregationFunctions.changeDateFormat);
                // Event top level has a non standard chart
                if(GROUPING[result.kind.toLowerCase()].specialChart){
                    result.allData = arrSortByTime; //all events filtered out by kind
                    if(!_.isUndefined(GROUPING[result.kind.toLowerCase()].parser)) GROUPING[result.kind.toLowerCase()].parser(result);
                }else{
                    for (m=0; m < dimTime.length; m++) {
                        result.chartData.push([ util.convertChartDate(dimTime[m].key), dimTime[m].value ]);
                    }
                }
                result.recent = arrSortByTime.slice(0,5);//recent 5 events for 1st level of gist
                // check for future
                result.futureTime = false;
                if(TOP_ORDER[result.kind.toLowerCase()]){
                    if(TOP_ORDER[result.kind.toLowerCase()].sort_direction === "future"){
                        var recentFuture = util.getRecentForFuture(arrSortByTime);//recent/next 5 events for 1st level of gist & binary Future flag
                        result.futureTime = recentFuture.bFutureTime;
                    }
                }
                // Top tile sorting by predefined order
                if(TOP_ORDER[result.kind.toLowerCase()]){
                    result.order = TOP_ORDER[result.kind.toLowerCase()].order;
                }
                if (DEBUG) console.log(result.kind.toLowerCase());
                // Grouping (second level of gist)----------------------------------------
                groupingDim = {};
                if(GROUPING[result.kind.toLowerCase()]){
                    dimensionProp = GROUPING[result.kind.toLowerCase()].grouping[0].field;
                    groupingDim = encounters.dimension(AggregationFunctions.subGrouping); // grouping for second level
                    result[result.kind.toLowerCase()] = true;
                    var group = groupingDim.group().top(Infinity);
                    result.grouping  = {title: GROUPING[result.kind.toLowerCase()].grouping[0].title,
                        group: _.filter(group, AggregationFunctions.zeroFilter)};
                    // Age calculation, data preparation
                    var subListRecent = [];
                    var subListDimByDate = {};
                    for(x=0;x<result.grouping.group.length;x++){
                        // Age calculation --------------------------
                        arrSubType = [];
                        filterVal = result.grouping.group[x].key;
                        arrSubType = _.filter(groupingDim.top(Infinity),AggregationFunctions.filterSubItems);
                        subListRecent = [];
                        if(arrSubType.length>0){
                            subListRecent  = _.sortBy(arrSubType,AggregationFunctions.dateTimeSort).reverse();
                            result.grouping.group[x].allData = subListRecent; //all events filtered out by subtype
                            result.grouping.group[x].recent = subListRecent.slice(0,5); //recent 5 events by subtype
                            if(!_.isUndefined(GROUPING[result.kind.toLowerCase()].sort_direction)){ // different sorting order for past and future events
                                if(GROUPING[result.kind.toLowerCase()].sort_direction === "future"){
                                    // check for future
                                    result.grouping.group[x].time = ADK.utils.getTimeSince(util.getTimeSinceForFuture(subListRecent)).timeSince;
                                }else{
                                    result.grouping.group[x].time = ADK.utils.getTimeSince(subListRecent[0].dateTime).timeSince;
                                }
                            }else{
                                result.grouping.group[x].time = ADK.utils.getTimeSince(subListRecent[0].dateTime).timeSince;
                            }
                            result.grouping.group[x].sort_time = subListRecent[0].dateTime;
                        }
                        // Data preparation -------------------------------------------
                        result.grouping.group[x].kind = result.kind;
                        result.grouping.group[x].elKind = result.elKind;
                        result.grouping.group[x].subKind = result.grouping.group[x].key.trim() !== "" ? result.grouping.group[x].key : "UNKNOWN";
                        result.grouping.group[x].elSubKind = util.clanUpItem(result.grouping.group[x].subKind);
                        result.grouping.group[x].count = result.grouping.group[x].value;
                        result.grouping.group[x].processed = true;
                        result.grouping.group[x][result.kind.toLowerCase()] = true;
                        result.grouping.group[x].kind = TOP_ORDER[result.kind.toLowerCase()].title;
                        if(DEBUG) console.log("EncGist---secondery level--->"+result.kind+"/"+result.grouping.group[x].key+"-"+result.grouping.group[x].value+"/array elements-"+ arrSubType.length);
                        if(((result.grouping.group[x].value+0) !== arrSubType.length)&&(DEBUG)) console.log("ERROR ------>>> Crossfilter grouping!!!");
                        // Chart data grouping ----------------------------------------
                        tempChartData = []; // reset temp data array
                        arrSubType.forEach(AggregationFunctions.prepareChartData);
                        if(DEBUG) console.log("EncGist---secondery level--->"+result.kind+"/"+result.grouping.group[x].key+"- events:"+tempChartData.length);
                        subListDimByDate = new Crossfilter(tempChartData);
                        // Chart data for subitem
                        var series = [];
                        var max =0;
                        var count = 0;
                        result.grouping.group[x].firstEvent = util.selectStartStopPoint(FirstEventForPatient).start;//FirstEventForPatient;
                        result.grouping.group[x].maxChart = util.selectStartStopPoint(FirstEventForPatient).stop;
                        // Conversion chart data for ADK gist view
                        if(result.grouping.group[x].elSubKind.length > 50){
                            result.grouping.group[x].elSubKind = result.grouping.group[x].elSubKind.substring(0,50)+"-"+Math.round(Math.random()*100);
                        }
                        result.grouping.group[x].id = "encounters-"+result.grouping.group[x].elKind+"-"+result.grouping.group[x].elSubKind;
                        if(!GROUPING[result.kind.toLowerCase()].specialChart){  // Sub level has a non standart chart
                            result.grouping.group[x].chartData = (subListDimByDate.dimension(AggregationFunctions.dimentionByDateTime)).group().order(AggregationFunctions.orderValue).all();
                            for(var chartDataIterator=0;chartDataIterator<result.grouping.group[x].chartData.length;chartDataIterator++){
                                count = result.grouping.group[x].chartData[chartDataIterator].value;
                                series.push([ util.convertChartDate(result.grouping.group[x].chartData[chartDataIterator].key),
                                    result.grouping.group[x].chartData[chartDataIterator].value]);
                                if(max<count) {max = count;}
                            }
                        }
                        result.grouping.group[x].graphData = {series: series,
                            nowMaxCount: max,
                            oldestDate: util.convertChartDate(result.grouping.group[x].firstEvent),
                            newestDate: util.convertChartDate(result.grouping.group[x].maxChart)
                        };
                        showResult.allGroupedEncounters = [];
                        //Translation for problemGistView
                        if(!_.isUndefined(GROUPING[result.kind.toLowerCase()].parser)) GROUPING[result.kind.toLowerCase()].parser(result.grouping.group[x]);
                        // Subcollection
                        var arrModels = [];
                        if(!_.isUndefined(GROUPING[result.kind.toLowerCase()].sort_direction)){ // different sorting order for past and future events
                            if(GROUPING[result.kind.toLowerCase()].sort_direction === "future"){
                                arrModels = _.sortBy(result.grouping.group,AggregationFunctions.timeSort);
                            }else{
                                arrModels = _.sortBy(result.grouping.group,AggregationFunctions.timeSort).reverse();
                            }
                        }else{
                            arrModels = _.sortBy(result.grouping.group,AggregationFunctions.timeSort).reverse();
                        }
                        arrModels = _.sortBy(result.grouping.group,AggregationFunctions.timeSort).reverse();
                        result.node = new Node({ kind:      result.grouping.group[x].kind,
                            collection: new Node(arrModels)});
                        groupingDim.filterAll();
                    }
                    groupingDim.dispose();
                }
                //-------------------------------------------------------------
                // Showing without agregation
                showingDim = {};
                var arrShowDateTime =[];
                if(SHOWING[result.kind.toLowerCase()]){
                    showingDim = dimByKind.filterExact(result.kind).top(Infinity);
                    result[result.kind.toLowerCase()] = true;
                    arrShowResult =[];
                    for(k=0;k<showingDim.length;k++){
                        showResult = {};
                        showTitles = {};
                        for(z=0;z<SHOWING[result.kind.toLowerCase()].showing.length;z++){
                            pointer = SHOWING[result.kind.toLowerCase()].showing[z];
                            showResult[pointer.field] = showingDim[k][pointer.field];
                            // showTitles[pointer.field] = {title: pointer.title};
                        }
                        // system/special fields
                        showResult.kind = TOP_ORDER[result.kind.toLowerCase()].title;
                        // object for daetail view
                        showResult.recent_model = showingDim[k];
                        // Parser fof shoing by (see appConfig.js)
                        if(!_.isUndefined(SHOWING[result.kind.toLowerCase()].parser)) SHOWING[result.kind.toLowerCase()].parser(showResult);
                        //----------------
                        showResult.elKind = util.clanUpItem(showResult.kind);
                        showResult.id = "encounters-"+showResult.elKind+"-"+Math.round(Math.random()*10000000000);
                        arrShowDateTime =[];
                        arrShowDateTime.push([util.convertChartDate(showResult.dateTime),1]); //.value
                        showResult.graphData = {series: arrShowDateTime,
                            nowMaxCount: 0,
                            oldestDate: util.convertChartDate(result.firstEventDisplay),
                            newestDate: util.convertChartDate(result.maxChart)
                        };
                        arrShowResult.push(showResult);
                    }
                    result.showingTitles = showTitles;
                    // Sorting by date and formatting
                    result.showing =  _.sortBy(arrShowResult, AggregationFunctions.dateTimeSort).reverse();//arrShowResult; showDateSort
                    // Subcollection
                    result.node = new Node({ kind: TOP_ORDER[result.kind.toLowerCase()].title,
                        collection: new Node(result.showing)});
                }
                //--------------------------------
                // Sort result by predefined order and change name of tile
                if(TOP_ORDER[result.kind.toLowerCase()]){
                    result.kind = TOP_ORDER[result.kind.toLowerCase()].title;
                    result.elKind = util.clanUpItem(result.kind);
                }
                coll.add(result);
                if (DEBUG) console.log(result);
                dimKind.filterAll();
            }
            // Add empty top level tiles
            util.addEmptyTiles(coll,FirstEventForPatient);
            // Clear all dimentions and filters
            arrData = null;
            encEventCF = null;
            encEventCFdimByDate = null;
            dimByKind = null;
            dimKind = null;
            encounters = null;
            return coll;

        },
        onGlobalDateSelected: function(dateModel) {
            if (DEBUG) console.log(JSON.stringify(dateModel));
            this.loading();
            this.dataGridView.destroy();
            this.dataGridView = new this.dataGridOptions.SummaryView(this.dataGridOptions);
            aggregationScale = util.setAggregationScale(dateModel.get("selectedId"));
            this.queryCollection(this, this.dataGridOptions.collection);
        },

        onFilterCollection: function(search, isInitialFetch) {
            if (DEBUG) {
                var t0 = performance.now();
            }
            if (DEBUG) console.log("EncGist filter ----->> custom filter");
            if (DEBUG) console.log(search);


            //if we have values for lastSearch and current search, we compare to determine if we attempt a search
            //if we can't compare, we return false as we can't do string comparison;
            var isSameAsPreviousSearch = function(lastSearch, currentSearch) {
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
                    var filtered = this.dataGridOptions.shadowCollection.filter(function(item) {
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


            if (DEBUG) {
                var t1 = performance.now();
            }
        },

        onClearFilter: function(search) {
            if (DEBUG) console.log("EncGist filter ----->> clear_filter");
            if (search) {
                this.onFilterCollection(search);
            }
        },
        onFetchError: function(err, resp) {
            this.dataGridOptions.collection.trigger('error', err, resp);
        },
        showVisitDetail: function(params) {
            if (DEBUG) console.log("detailView --->>visitDetail");
            if (!_.isUndefined(params.model)) {
                if (params.model.get("isCPTdomain")) {
                    params.model.set("recent_model", util.getCPTprocedureDetailViewModel(this, params.uid));
                }
            }
            util.showDetailView(params, "visitDetail");
        },

        showDocumentDetail: function(params) {
            if (DEBUG) console.log("detailView --->>documents");
            util.showDetailView(params, "documents");
        },
        onBeforeDestroy: function() {

            delete this.dataGridOptions.refresh;

            delete this.dataGridOptions.shadowCollection;

            if (typeof _super.onBeforeDestroy === 'function') {
                _super.onBeforeDestroy.apply(this, this.arguments);
            }
        }
    });

    var encounterChannel = ADK.Messaging.getChannel('encounterFormRequestChannel');
    encounterChannel.comply('openEncounterForm', handleChannel);

    function handleChannel(appletKey) {
        var writebackView = ADK.utils.appletUtils.getAppletView('encounters', 'writeback');
        //Construct our model
        var FormModel = Backbone.Model.extend({
            defaults: {}
        });
        var formModel = new FormModel({
            //Service Connected Section
            serviceConnected: '%',
            ratedDisabilities: '',
            //Visit Type Section
            providerList: new ADK.UIResources.Picklist.Encounters.Providers(),
            availableVisitModifiers: new ADK.UIResources.Picklist.Encounters.CptModifiers(),
            visitTypeSelection: '',
            visitCollection: new ADK.UIResources.Picklist.Encounters.VisitType(),
            selectedModifiersForVisit: '',
            //Diagnoses Section
            diagnosesSection: '',
            addOtherDiagnosisSearchString: '',
            addOtherDiagnosisPicklist: new Backbone.Collection(),
            DiagnosisCollection: new ADK.UIResources.Picklist.Encounters.Diagnoses(),
            //Procedure Section
            procedureSection: '',
            addOtherProcedureSearchString: '',
            addOtherProcedurePicklist: new ADK.UIResources.Picklist.Encounters.OtherProcedures(),
            ProcedureCollection: new ADK.UIResources.Picklist.Encounters.Procedures()
        });

        //Construct the workflow
        var workflowOptions = {
            title: 'Encounter Form',
            size: 'large',
            showProgress: false,
            keyboard: true,
            steps: [{
                view: writebackView,
                viewModel: formModel,
                stepTitle: 'Encounter Form'
            }]
        };
        // Set modal title
        var patient = ADK.PatientRecordService.getCurrentPatient();
        var visit = patient.get('visit');
        var datetime = '';
        if (!_.isUndefined(visit)) {
            workflowOptions.title = workflowOptions.title + ' for ' + patient.get('displayName');
            if (!_.isUndefined(visit.formatteddateTime) && visit.formateddateTime !== '') {
                datetime = ' (' + visit.formatteddateTime + ')';
            } else if (!_.isUndefined(visit.dateTime) && visit.dateTime !== '') {
                datetime = ' (' + visit.dateTime + ')';
            }
            if (datetime !== '') {
                workflowOptions.title = workflowOptions.title + datetime;
            }
        }
        // Loading modal
        var modal = new ADK.UI.Modal({
            view: ADK.Views.Loading.create(),
            options: {
                backdrop: false,
                size: "large",
                title: workflowOptions.title
            }
        });
        // Show loading modal
        modal.show();
        // Prepopulate all the picklists.
        $.when(
            formModel.get('DiagnosisCollection').fetch({
                dateTime: visit.visitDateTime,
                clinicIen: visit.locationIEN
            }),
            formModel.get('providerList').fetch({
                dateTime: visit.visitDateTime
            }),
            formUtil.retrieveRatedDisabilties(formModel),
            formModel.get('visitCollection').fetch({
                dateTime: visit.visitDateTime,
                clinicIen: visit.locationIEN
            }),
            formModel.get('ProcedureCollection').fetch({
                dateTime: visit.visitDateTime,
                clinicIen: visit.locationIEN
            })
        ).done(function() {
            //Set up and clear out the OTHER sections
            formModel.get('ProcedureCollection').add({
                categoryName: 'OTHER PROCEDURES'
            });
            formModel.get('ProcedureCollection').get('OTHER PROCEDURES').get('cptCodes').reset();
            formModel.get('DiagnosisCollection').add({
                categoryName: 'OTHER DIAGNOSES'
            });
            formModel.get('DiagnosisCollection').get('OTHER DIAGNOSES').get('values').reset();
            var deferredExisting = $.Deferred();
            //Set up parsing existing data.
            formModel.listenToOnce(formModel, 'change:encounterResults', function() {
                var result = formModel.get('encounterResults');
                formUtil.parseEncounterDataProvider(result, formModel);
                formUtil.parseEncounterDataVisitAndProcedures(result, formModel);
                formUtil.parseEncounterDataDiagnosis(result, formModel);
                formUtil.parseEncounterDataVisitRelated(result, formModel);
                //We finished so let the form load up.
                deferredExisting.resolve();
            });
            //Pull existing data
            formUtil.retrieveEncounterData(formModel);

            //Once existing is finished being loaded into the model load the form.
            deferredExisting.done(function() {
                //Pre-select initial fields in drilldown select components.
                if (formModel.get('DiagnosisCollection').length > 0) {
                    formModel.set('diagnosesSection', formModel.get('DiagnosisCollection').models[0].get('categoryName'));
                }
                if (formModel.get('visitCollection').length > 0 && _.isEmpty(formModel.get('visitTypeSelection'))) {
                    formModel.set('visitTypeSelection', formModel.get('visitCollection').models[0].get('categoryName'));
                }
                if (formModel.get('ProcedureCollection').length > 0) {
                    formModel.set('procedureSection', formModel.get('ProcedureCollection').models[0].get('categoryName'));
                }
                //Hide the loading modal
                ADK.UI.Modal.hide();
                var workflowController = new ADK.UI.Workflow(workflowOptions);
                //Show the encounter form.
                workflowController.show();
            });
        //If we had an error pulling in picklist data.
        }).fail(function(child, response) {
            ADK.UI.Modal.hide();
            // Alert the user
            var SimpleAlertItemView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile([
                    ENCOUNTER_FORM_ERROR_MSG + '<div><strong>Error:</strong> ' + response.status + ' - ' + response.statusText + '<br><strong>Error Response: </strong>' + response.responseText + '</div>'
                ].join('\n'))
            });
            var SimpleAlertFooterItemView = Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile([
                    '{{ui-button "OK" classes="btn-primary alert-continue" title="Press enter to continue."}}'
                ].join('\n')),
                events: {
                    'click button': function() {
                        ADK.UI.Alert.hide();
                    }
                }
            });
            var alertView = new ADK.UI.Alert({
                title: ENCOUNTER_FORM_ERROR_TITLE,
                icon: ENCOUNTER_FORM_ERROR_ICON,
                messageView: SimpleAlertItemView,
                footerView: SimpleAlertFooterItemView
            });
            alertView.show();
            console.log('Error retreiving encounter form:');
            console.log(response);
        });
    }

    var applet = {
        id: "encounters",
        viewTypes: [{
            type: 'gist',
            view: AppletLayoutView,
            chromeEnabled: true
        }, {
            type: 'writeback',
            view: WritebackForm,
            chromeEnabled: false
        }],
        defaultViewType: 'gist'
    };
    return applet;
});
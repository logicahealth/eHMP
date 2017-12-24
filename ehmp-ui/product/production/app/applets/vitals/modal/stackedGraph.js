define([
    'jquery',
    'underscore',
    'moment',
    'app/applets/vitals/appletHelpers',
    'app/resources/fetch/vitals/utils',
    'hbs!app/applets/vitals/templates/tooltip'
], function($, _, moment, AppletHelper, Utils, tooltip) {
    'use strict';

    function Chart(options) {
        return this.init(options);
    }

    Chart.prototype = {
        init: function(options) {
            this.collection = options.collection;
            this.first = this.collection.first();
            this.chartOptions = $.extend(true, {}, options.chartOptions);
            this.fullCollection = this.collection.fullCollection;

            this.chartOptions.xAxis.type = 'datetime';

            var low = this.fullCollection.pluck('low');
            var high = this.fullCollection.pluck('high');

            if (options.modalDisplayName !== 'BP') {
                low = _.map(low, function(num) {
                    return parseFloat(num);
                });

                high = _.map(high, function(num) {
                    return parseFloat(num);
                });
            } else {
                var bpSplitData;
                low = _.map(low, function(num) {
                    if (_.isString(num)) {
                        bpSplitData = num.split('/');
                        return parseFloat(bpSplitData[1]);
                    } else {
                        return undefined;
                    }
                });

                high = _.map(high, function(num) {
                    if (_.isString(num)) {
                        bpSplitData = num.split('/');
                        return parseFloat(bpSplitData[0]);
                    } else {
                        return undefined;
                    }
                });
            }

            var categories = this.fullCollection.pluck('observed');

            categories = _.map(categories, function(num) {
                return moment(ADK.utils.formatDate(num)).valueOf();
            });

            categories.reverse();

            var data = this.fullCollection.pluck('result');
            var units = [];
            units = this.fullCollection.pluck('units');
            var bpDiatolicData = [];
            var bpSystolicData = [];
            var cleanData = [];
            _.each(data, function(e, i) {
                if (options.modalDisplayName !== 'BP') {
                    if (_.isNaN(data[i] * 1)) {
                        cleanData.push(null);
                    } else {
                        if (options.modalDisplayName !== 'HT') {
                            cleanData.push(data[i] * 1);
                        } else {
                            if (units[i] !== 'in' && units[i] !== 'inches') {
                                cleanData.push(Math.floor(data[i] * 0.4));
                            } else {
                                cleanData.push(data[i] * 1);
                            }
                        }
                    }
                } else {
                    var bpSplitData;
                    if (data[i] !== undefined) {
                        if (_.isNaN(data[i] * 1) && data[i].indexOf('/') === -1) {
                            //Currently does not display TextOnly data
                            bpDiatolicData.push(null);
                            bpSystolicData.push(null);
                            cleanData.push(null);
                        } else {
                            bpSplitData = data[i].split('/');
                            bpDiatolicData.push(parseFloat(bpSplitData[1]));
                            bpSystolicData.push(parseFloat(bpSplitData[0]));
                            cleanData.push(parseFloat(bpSplitData[0]));
                        }
                    } else {
                        bpDiatolicData.push(null);
                        bpSystolicData.push(null);
                        cleanData.push(null);
                    }
                }
            });

            var highLow = [];

            //Parsing out bad data
            if (options.modalDisplayName !== 'WT' && options.modalDisplayName !== 'HT' && options.modalDisplayName !== 'PN' && options.modalDisplayName !== 'BMI') {
                _.each(cleanData, function(e, i) {
                    var dataNumber = parseFloat(cleanData[i]);

                    if (options.modalDisplayName == 'BP') {
                        var bpDataNumber = parseFloat(bpDiatolicData[i]);
                        if (_.isFinite(bpDataNumber) && _.isFinite(dataNumber)) {
                            if (!isNaN(low[i]) && !isNaN(high[i])) {
                                highLow.push([low[i], high[i]]);
                            } else {
                                highLow.push([null, null]);
                            }
                        } else {
                            highLow.push([null, null]);
                        }
                    } else if (!isNaN(dataNumber)) {
                        if (!isNaN(low[i]) && !isNaN(high[i])) {
                            highLow.push([low[i], high[i]]);
                        } else {
                            highLow.push([null, null]);
                        }
                    }
                });
            }

            //Reverse the graph so that the x and y line up
            bpSystolicData.reverse();
            bpDiatolicData.reverse();
            data = cleanData;
            data.reverse();
            highLow.reverse();
            var onlyNumData = [];
            //Checks the count of data that is chartable
            _.each(cleanData, function(e, i) {
                var dataNumber = parseFloat(cleanData[i]);
                if (_.isFinite(dataNumber)) {
                    onlyNumData.push(dataNumber);
                }
            });

            this.chartOptions.series[0].data = [];

            if (options.modalDisplayName !== 'BP') {
                _.forEach(data, function(e, i) {
                    var mo = moment(categories[i]);
                    this.chartOptions.series[0].data.push({
                        y: data[i],
                        x: categories[i],
                        dataLabels: {
                            enabled: false
                        }
                    });
                    if (highLow[i]) {
                        highLow[i].unshift(categories[i]);
                    }

                }, this);
            } else {
                _.forEach(bpSystolicData, function(e, i) {
                    this.chartOptions.series[0].data.push({
                        y: bpSystolicData[i],
                        x: categories[i],
                        dataLabels: {
                            enabled: false
                        }
                    });
                    if (highLow[i]) {
                        highLow[i].unshift(categories[i]);
                    }
                }, this);
            }

            this.chartOptions.series[0].zIndex = 1;
            if (this.first !== undefined) {
                this.chartOptions.yAxis.title.text = this.first.get('units');
            } else {
                this.chartOptions.yAxis.title.text = '';
            }

            if (options.modalDisplayName === 'BP') {
                this.chartOptions.series[0].name = 'SBP';
            } else if (options.modalDisplayName === 'WT') {
                this.chartOptions.series[0].name = 'Weight';
            } else {
                this.chartOptions.series[0].name = options.model.get('typeName');
            }

            var graphUnits = [];
            if (options.modalDisplayName !== 'BMI' && !_.isUndefined(this.first)) {
                graphUnits = this.first.get('units');
            }

            this.chartOptions.tooltip = {
                valueSuffix: ' ' + graphUnits,
                crosshairs: true,
                shared: true,
                style: {
                    padding: 4,
                    zIndex: 9999
                },
                useHTML: true
            };

            if (this.chartOptions.series[2]) {
                this.chartOptions.series[2].data = [];
            }

            if (this.chartOptions.series[1]) {
                this.chartOptions.series[1].data = [];
            }

            if (options.modalDisplayName == 'BP') {
                this.chartOptions.series[1] = {
                    name: 'DBP',
                    data: [],
                    type: 'line',
                    linkedTo: ':previous',
                    zIndex: 1,
                    showInLegend: false,
                    dataLabels: {
                        enabled: false
                    }
                };

                _.forEach(bpDiatolicData, function(e, i) {
                    this.chartOptions.series[1].data.push({
                        y: bpDiatolicData[i],
                        x: categories[i],
                        dataLabels: {
                            enabled: false
                        }
                    });
                }, this);

                this.chartOptions.series[2] = {
                    name: 'Ref Range',
                    data: highLow,
                    type: 'arearange',
                    lineWidth: 0,
                    linkedTo: ':previous',
                    color: '#5CB85C',
                    fillOpacity: 0.3,
                    zIndex: 0,
                    showInLegend: false
                };
            } else if (highLow.length > 0) {
                this.chartOptions.series[1] = {
                    name: 'Ref Range',
                    data: highLow,
                    type: 'arearange',
                    lineWidth: 0,
                    linkedTo: ':previous',
                    color: '#5CB85C',
                    fillOpacity: 0.3,
                    zIndex: 0,
                    showInLegend: false
                };
            }
            return this.chartOptions;
        }
    };

    function VitalsStackedGraph(options) {
        this.options = options;
        this.model = options.model;
        this.init(options);
    }
    VitalsStackedGraph.prototype = {
        init: function() {
            var typeName = this.model.get('typeName');
            if(_.isString(typeName) && typeName.indexOf('Blood') >= 0) {
                typeName = 'Blood Pressure';
            }
            
            var criteria;
            if (typeName === 'BMI') {
                criteria = {
                    filter: 'in(typeName,["WEIGHT","HEIGHT"])'
                };
            } else {
                criteria = {
                    filter: 'eq(typeName,"' + this.model.get('typeName') + '")'
                };
            }

            if (this.model.get('displayName').indexOf('BP') >= 0) {
                this.modalDisplayName = 'BP';
            } else {
                this.modalDisplayName = this.model.get('displayName');
            }

            this.collection = new ADK.UIResources.Fetch.Vitals.Collection.PageableCollection({isClientInfinite: true});
            this.comparator = 'observed';
            this.collection.on('fetch:success', function() {
                if (this.collection.length > 0) {
                    this.model.set(this.collection.first().toJSON());
                } else {
                    this.model.set('resultUnits', '--');
                }

                if (this.model.get('displayName') === 'BP') {
                    var splitBpVital = Utils.splitBpVital(this.model.attributes);
                    this.model.set(splitBpVital.bps);
                }

                $.extend(true, this, this.model.attributes);

                this.chart = new Chart({
                    chartOptions: $.extend(true, {}, AppletHelper.chartOptions),
                    model: this.model,
                    collection: this.collection,
                    modalDisplayName: this.modalDisplayName
                });

                var tooltipModel = this.createTooltipModel(this.collection);
                if (!$.isEmptyObject(tooltipModel)) {
                    this.tooltip = tooltip(tooltipModel.attributes);
                }

                ADK.Messaging.getChannel('stackedGraph').trigger('readyToChart', {
                    response: this,
                    time: moment(),
                    requestParams: this.options.requestParams
                });
            }, this);
            this.collection.fetchCollection(criteria, false);
        },
        createTooltipModel: function(collectionItems) {
            if (collectionItems.models.length === 0) {
                return {};
            }

            var tooltipModel = {};
            for (var i = 0; i < collectionItems.models.length && i < 5; i++) {

                if ($.isEmptyObject(tooltipModel)) {
                    tooltipModel = collectionItems.models[i];
                } else {

                    if (_.isUndefined(tooltipModel.get('limitedoldValues'))) {
                        tooltipModel.set('limitedoldValues', []);
                    }
                    tooltipModel.get('limitedoldValues').push(collectionItems.models[i]);
                }
            }

            return tooltipModel;
        }
    };

    return VitalsStackedGraph;
});
define(['moment'], function() {
    'use strict';
    var green = 'rgba(153, 207, 3, 0.5)';
    var grey = 'rgba(215, 215, 215, 1)';
    var white = 'rgba(255, 255, 255, 1)';
    var blue = 'rgba(0, 153, 255, 0.5)';
    var color;

    var grey_pattern = {
        pattern: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAQklEQVQYV4XM2Q0AIAgFQWiUqqiAEmkAo4nGA3n7PVlW1RARQrG7h5kRwgP2G8ILInzACj/wh1OY4S+8cQl3DOHEDZAqQEOzcBPYAAAAAElFTkSuQmCC',
        width: 6,
        height: 6
    };

    var red_pattern = {
        pattern: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAPUlEQVQIW2P8zsHx//ePHwwgwMrBwcD54wcj4ycGhv8gDkiCj4GBESQJFwRxYBJgQZAKmA6wdrBhSABkBwDyohkM7A9p8gAAAABJRU5ErkJggg== ',
        width: 6,
        height: 6
    };

    var nineteen = 19;
    var ten = 10;
    var five = 5;
    var zero = 0;

    function chartBuilder(model) {
        var localListGraphData = {
            chart: {},
            name: model.get('name'),
            xAxis: {
                plotLines: [],
                labels: {
                    enabled: false
                },
            },
            series: [{
                borderWidth: 1,
                pointRange: 60 * 1000,
                data: [],
            }, {
                borderWidth: 1,
                pointRange: 60 * 1000,
                color: 'rgba(1, 152, 117, 0.3)',
                data: []
            }]
        };

        var pushToLocalGraph = function(height, start, stop, color, seriesIndex, borderColor) {
            localListGraphData.series[seriesIndex].data.push({
                height: height,
                x: start,
                x2: stop,
                y: 0,
                color: color
            });
        };

        var medicationCollection = model.get("medications");
        var dateModel = ADK.SessionStorage.getModel('globalDate');
        var medicationChannel = ADK.Messaging.getChannel("medication_review");
        var earliestStartAsEpoch = medicationChannel.request('earliestStartAsEpoch');
        var oldest;

        if (dateModel.get('selectedId') === 'allRangeGlobal') {
            oldest = earliestStartAsEpoch;
        } else {
            oldest = moment(dateModel.get("fromDate"), "MM/DD/YYYY").valueOf(); //788936400000;
        }

        var newest = moment(dateModel.get("toDate"), "MM/DD/YYYY").add(23, "hours").add(59, "minutes").valueOf();

        localListGraphData.chart.plotBackgroundColor = '#F2F2F2';
        localListGraphData.chart.height = nineteen;

        for (var t = medicationCollection.length - 1; t >= 0; t--) {
            var medication = medicationCollection.at(t);

            localListGraphData.xAxis.min = oldest;
            localListGraphData.xAxis.max = newest;

            var dosages = medication.get('dosages');
            if (dosages) {
                localListGraphData.instructions = medication.get("instructions");
            } else {
                localListGraphData.instructions = '--';
            }

            var vaStatus = medication.get('vaStatus').toLowerCase();
            var overallStart = moment(medication.get('overallStart'), 'YYYYMMDD').valueOf();
            if (overallStart < oldest) {
                overallStart = oldest;
            }
            var overallStop = moment(medication.get('overallStop'), 'YYYYMMDD').valueOf();
            var stopped = moment(medication.get('stopped'), 'YYYYMMDD').valueOf();
            var vaType = medication.get('vaType').toLowerCase();
            var calculatedStopDate = medication.getEarlierStopAsMoment().valueOf();

            if (medication.getCanBeGraphed()) {

                if (overallStart === calculatedStopDate) {
                    stopped = moment(stopped).add(1, 'minutes').valueOf();
                }

                if (vaType === 'n' && vaStatus === 'active') {
                    calculatedStopDate = newest;
                }

                pushToLocalGraph(nineteen, overallStart, calculatedStopDate, white, 0, white);

                localListGraphData.xAxis.plotLines.push({
                    color: '#f20000',
                    value: moment().valueOf(),
                    dashStyle: 'solid',
                    width: 1,
                    zIndex: 5
                });

                if (calculatedStopDate <= newest) {
                    if (vaType !== "n") {
                        color = grey;
                        pushToLocalGraph(nineteen, overallStop, newest, grey, 0, grey);
                    }

                    //Graph Discontinued
                    if (vaStatus === "discontinued" || vaStatus === "discontinued/edit") {
                        color = grey_pattern;
                        pushToLocalGraph(nineteen, stopped, newest, color, 0, color);
                    }
                }

                if (vaType === "o") {
                    var fills = medication.get('fills');
                    if (fills && fills.length > 0) {
                        var releaseDate;
                        for (var c = 0; c < fills.length; c++) {
                            if (fills[c].releaseDate) {
                                releaseDate = moment(fills[c].releaseDate, 'YYYYMMDDHHmm').valueOf();
                                if (releaseDate < oldest) {
                                    releaseDate = oldest;
                                }
                                if (_.isUndefined(fills[c].daysSupplyDispensed)) {
                                    pushToLocalGraph(five, releaseDate, releaseDate, blue, 1, blue);
                                } else {
                                    var fillEndDate = moment(releaseDate).add(fills[c].daysSupplyDispensed, 'days').valueOf();
                                    if (releaseDate <= newest) {
                                        if (fillEndDate > newest) {
                                            fillEndDate = newest;
                                        }
                                        pushToLocalGraph(five, releaseDate, fillEndDate, blue, 1, blue);
                                    }
                                }
                            }
                        }
                    }
                } else if (vaType === "n") {
                    // vaType == n means non-va which means no fills
                    pushToLocalGraph(five, overallStart, calculatedStopDate, blue, 1, blue);
                } else if (vaType === "i" || vaType === "v") {
                    var administered = medication.get('administrations');
                    if (administered) {

                        for (var l = 0; l < administered.length; l++) {
                            var admin = administered[l];
                            var timeGiven = admin.dateTime;
                            var status = admin.status;
                            var given = admin.given;

                            if (given === true && status === "GIVEN") {
                                color = green;
                                borderColor = green;
                            } else if (status === "REFUSED") {
                                color = red_pattern;
                                borderColor = red_pattern;
                            } else if (status === "HELD") {
                                color = grey_pattern;
                                borderColor = grey_pattern;
                            } else {
                                color = white;
                                borderColor = white;
                            }
                            for (var f = 0; f < dosages.length; f++) {
                                if (!isNaN(dosages[f].scheduleFreq)) {
                                    var timeGivenStart = moment(timeGiven, 'YYYYMMDDHHmm').valueOf();
                                    var timeGivenEnd = moment(timeGiven, 'YYYYMMDDHHmm').add(dosages[f].scheduleFreq, 'minutes').valueOf();
                                    pushToLocalGraph(five, timeGivenStart, timeGivenEnd, color, 1, color);
                                }
                            }
                        }
                    }
                }
            }

        }
        return {
            chart: localListGraphData.chart,
            series: localListGraphData.series,
            name: localListGraphData.name,
            instructions: localListGraphData.instructions,
            xAxis: localListGraphData.xAxis,
            uid: localListGraphData.uid
        };
    }
    return chartBuilder;
});
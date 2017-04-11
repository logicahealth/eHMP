define([
    'backbone',
    'marionette',
    'underscore',
    'moment',
    'app/applets/vitals/utilParse'

], function(Backbone, Marionette, _, moment, Util) {
    "use strict";
    Util.defaults = {
        'BPS': {
            descriptionColumn: 'BPS',
            observationType: 'vitals'
        },
        'BPD': {
            descriptionColumn: 'BPD',
            observationType: 'vitals'
        },
        'BP': {
            descriptionColumn: 'BP',
            observationType: 'vitals'
        },
        'T': {
            descriptionColumn: 'Temp',
            observationType: 'vitals'
        },
        'PO2': {
            descriptionColumn: 'SpO<sub>2</sub>',
            observationType: 'vitals',
        },
        'PN': {
            descriptionColumn: 'Pain',
            observationType: 'vitals',
        },
        'BMI': {
            descriptionColumn: 'BMI',
            observationType: 'vitals',
        },
        'WT': {
            descriptionColumn: 'Wt',
            observationType: 'vitals'
        },
        'P': {
            descriptionColumn: 'Pulse',
            observationType: 'vitals'
        },
        'R': {
            descriptionColumn: 'RR',
            observationType: 'vitals'
        },
        'HT': {
            descriptionColumn: 'Ht',
            observationType: 'vitals',
        },
        'CG': {
            descriptionColumn: 'Circum/Girth',
            observationType: 'Vitals'
        }
    };

    Util.getNumericDate = function(response) {
        if (response.observed) {
            response.numericDate = ADK.utils.formatDate(response.observed, 'YYYYMMDD');
        }
        return response;
    };

    Util.getObservedFormatted = function(response) {
        response.observedFormatted = '';
        if (response.observed) {
            response.observedFormatted = ADK.utils.formatDate(response.observed, ADK.utils.dateUtils.defaultOptions().placeholder + ' - HH:mm');
        }
        return response;
    };

    Util.getObservedFormattedCover = function(response) {
        response.observedFormattedCover = '';
        if (response.observed) {
            response.observedFormattedCover = ADK.utils.formatDate(response.observed, ADK.utils.dateUtils.defaultOptions().placeholder);
        }
        return response;
    };

    Util.getResultedFormatted = function(response) {
        response.resultedFormatted = '';
        if (response.resulted) {
            response.resultedFormatted = ADK.utils.formatDate(response.resulted, ADK.utils.dateUtils.defaultOptions().placeholder + ' - HH:mm');
        }
        return response;
    };

    Util.splitCollection = function(collection, splitCols) {

        var items = collection.models;
        var len = items.length;
        var step = len / splitCols | 0;
        var result = [];

        for (var i = 0, j; i < step; ++i) {
            j = i;

            while (j < len) {
                result.push(items[j]);
                j += step;
            }
        }

        collection.reset(result, {
            reindex: true
        });
        return collection;
    };

    Util.buildCollection = function(collection, splitBloodPressure) {

        var newcol = Util.splitBloodPressure(collection, splitBloodPressure);
        //add normalized names,columndescriptions,valid result flag
        newcol.each(function(model) {
            if (model.attributes.displayName.toLowerCase().indexOf('po2') >= 0) {
                model.attributes.normalizedName = 'SpO2';
            }else{
                model.attributes.normalizedName = model.attributes.displayName.replace(/\W/g, '_');
            }
            model.attributes.descriptionColumn = (Util.defaults.hasOwnProperty(model.attributes.displayName)) ? Util.defaults[model.attributes.displayName].descriptionColumn : model.attributes.displayName;
            model.attributes.isValid = (model.attributes.result) ? Util.checkValidResult(model.attributes.result, model.attributes.displayName) : false;

            //add BMI interpretation
            if (model.attributes.displayName === 'BMI') {
                if (model.attributes.result <= 18.5) {                    
                    model.attributes.interpretationField = 'underweight';                
                } else if (model.attributes.result > 18.5 && model.attributes.result <= 24.9) {                    
                    model.attributes.interpretationField = 'normal';                
                } else if (model.attributes.result > 24.9 && model.attributes.result <= 29.9) {                    
                    model.attributes.interpretationField = 'overweight';                
                } else model.attributes.interpretationField = 'obese';
            }

            if (model.attributes.displayName === 'T') {
                model.attributes.resultAndUnitsMerged = true;
                model.attributes.finalResult = model.attributes.resultUnitsMetricResultUnits || model.attributes.result;
            }
            if (model.attributes.displayName === 'WT') {
                model.attributes.resultAndUnitsMerged = true;
                model.attributes.finalResult = model.attributes.resultUnitsMetricResultUnits || model.attributes.result;
            }

            model.attributes.timeSince = Util.setTimeSince(model.attributes.observed);
            model.attributes.numericTime = Util.getNumericTime(model.attributes.timeSince);
            model.attributes.observationType = 'vitals';
            model.attributes.vitalColumns = true;
        });

        collection.reset(newcol.models, {});
        return collection;
    };

    Util.splitBloodPressure = function(collection, splitBloodPressure) {
        var newcol = new Backbone.Collection();
        var BP_col = collection.where({
            displayName: 'BP'
        });
        if (BP_col.length > 0) {
            BP_col.forEach(function(BP) {
                if (splitBloodPressure) {
                    var item_BPD = BP.clone();
                    var item_BPS = BP.clone();
                    //set props for bpd and bps
                    item_BPS.attributes.qualifiedName += ' Systolic';
                    item_BPS.attributes.typeName += ' Systolic';

                    item_BPD.attributes.qualifiedName += ' Diastolic';
                    item_BPD.attributes.typeName += ' Diastolic';

                    item_BPS.attributes.displayName = 'BPS';
                    item_BPS.attributes.name += ' S';
                    item_BPS.attributes.tooltipName = 'Blood Pressure';

                    item_BPD.attributes.displayName = 'BPD';
                    item_BPD.attributes.name += ' D';
                    item_BPD.attributes.tooltipName = 'Blood Pressure';

                    var lowVals = BP.attributes.low.split('/');
                    item_BPS.attributes.low = lowVals[0];
                    item_BPD.attributes.low = (lowVals.length === 3) ? lowVals[2] : lowVals[1];

                    var hiVals = BP.attributes.high.split('/');
                    item_BPS.attributes.high = hiVals[0];
                    item_BPD.attributes.high = (hiVals.length === 3) ? hiVals[2] : hiVals[1];

                    if (BP.attributes.result) {

                        // Account for the case where the result value is not an actual recorded blood pressure value (e.g. "Refused" or "Unavailable")
                        var resultVals = BP.attributes.result.split('/');
                        if (resultVals.length > 1) {
                            item_BPS.attributes.result = resultVals[0];
                            item_BPD.attributes.result = (resultVals.length === 3) ? resultVals[2] : resultVals[1];
                        } else {
                            item_BPS.attributes.result = item_BPD.attributes.result = BP.attributes.result;
                        }

                        item_BPS.attributes.finalResult = item_BPS.attributes.result + ' ' + 'mm';
                        item_BPS.attributes.finalUnits = 'mm';
                        item_BPD.attributes.finalResult = item_BPD.attributes.result + ' ' + 'mm';
                        item_BPD.attributes.finalUnits = 'mm';
                        item_BPS.attributes.resultUnitsMetricResultUnits = item_BPS.attributes.result + ' mm[Hg]';
                        item_BPD.attributes.resultUnitsMetricResultUnits = item_BPD.attributes.result + ' mm[Hg]';
                        item_BPS.attributes.resultUnits = item_BPS.attributes.result + ' mm[Hg]';
                        item_BPD.attributes.resultUnits = item_BPD.attributes.result + ' mm[Hg]';
                    }
                    if (BP.attributes.previousResult) {

                        // Account for the case where the previous resule value is not an actual recorded blood pressure value (e.g. "Refused" or "Unavailable")
                        var previousResultVals = BP.attributes.previousResult.split('/');
                        if (previousResultVals.length > 1) {
                            item_BPS.attributes.previousResult = previousResultVals[0];
                            item_BPD.attributes.previousResult = (previousResultVals.length === 3) ? previousResultVals[2] : previousResultVals[1];
                        } else {
                            item_BPS.attributes.previousResult = item_BPD.attributes.previousResult = BP.attributes.previousResult;
                        }
                    }

                    newcol.add([item_BPS, item_BPD]);
                } else {
                    BP.set('displayName', 'BP');
                }
            });
        }
        newcol.add(collection.models);
        return newcol;
    };

    Util.findNearestRange = function(reference, index) {
        if (isNaN(reference[index]) || reference[index] === undefined) {
            _.each(reference, function(e, item) {
                if (!isNaN(item) && item !== undefined) {
                    return item;
                }
            });
        } else {
            return reference[index];
        }
    };

    Util.setNoRecords = function(resultColl, recordTypes, knownTypes) {
        recordTypes.forEach(function(type) {
            resultColl[knownTypes.indexOf(type)] = {
                vitalColumns: true,
                descriptionColumn: (Util.defaults.hasOwnProperty(type)) ? Util.defaults[type].descriptionColumn : type,
                displayName: type,
                name: type,
                resultUnitsMetricResultUnits: 'No Records Found',
                resultUnits: 'No Records Found',
                summary: 'No Records Found',
                metricResultUnits: 'No Records Found',
                typeName: type,
                observed: '',
                observationType: (Util.defaults.hasOwnProperty(type)) ? Util.defaults[type].observationType : 'vitals',
            };

        });
        return resultColl;
    };
    Util.setTimeSince = function(fromDate) {

        if (fromDate === undefined || fromDate === "") return undefined;
        var startDate = moment(fromDate, 'YYYYMMDDHHmmssSSS');
        var endDate = moment();

        var duration = moment.duration(endDate.diff(startDate));

        var years = parseFloat(duration.asYears());
        var days = parseFloat(duration.asDays());
        var months = parseFloat(duration.asMonths());
        var hours = parseFloat(duration.asHours());
        var min = parseFloat(duration.asMinutes());

        if (min > 0 && min < 60) {
            hours = 1;
        }

        var lYear = "y";
        var lMonth = "m";
        var lDay = "d";
        var lHour = "h";
        var finalResult = "";
        if (months >= 24) {
            finalResult = Math.round(years) + lYear;
        } else if ((months < 24) && (days > 60)) {
            finalResult = Math.round(months) + lMonth;
        } else if ((days >= 2) && (days <= 60)) {
            finalResult = Math.round(days) + lDay;
        } else if (days < 2) {
            finalResult = Math.round(hours) + lHour;
        }

        return finalResult;
    };

    Util.checkValidResult = function(res, resulttype) {
        //special case for BP
        return (resulttype === 'BP') ? true : !isNaN(res);
    };


    return Util;
});
define([
	'underscore'
], function(_) {
	'use strict';

	var vitalNameMappings = {
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

	var Util = {
		getDisplayName: function(vital) {
			var displayName = vital.displayName || '';
			if (_.isEmpty(displayName) && !_.isEmpty(vital.typeName)) {
                var type = vital.typeName.toLowerCase();
                switch (type) {
                    case 'blood pressure':
                        displayName = 'BP';
                        break;
                    case 'pulse':
                        displayName = 'P';
                        break;
                    case 'respiration':
                        displayName = 'R';
                        break;
                    case 'temperature':
                        displayName = 'T';
                        break;
                    case 'pulse oximetry':
                        displayName = 'PO2';
                        break;
                    case 'pain':
                        displayName = 'PN';
                        break;
                    case 'weight':
                    case 'patient body weight - measured':
                        displayName = 'WT';
                        break;
                    case 'height':
                        displayName = 'HT';
                        break;
                    case 'body mass index':
                        displayName = 'BMI';
                        break;
                    case 'circumference/girth':
                        displayName = 'CG';
                        break;
                    default:
                        displayName = vital.typeName;
                        break;
                }
            }
            return displayName;
		},
		splitBpVital: function(bpVital) {
			// underscore cloning/extend cannot be used here because it triggers events that break the aggregate collection
			var bpd = {
				displayName: 'BPD',
				observed: bpVital.observed,
				typeName: 'Blood Pressure Diastolic',
				units: bpVital.units,
				resulted: bpVital.resulted,
				facilityCode: bpVital.facilityCode
			};
			var bps = {
				displayName: 'BPS',
				observed: bpVital.observed,
				typeName: 'Blood Pressure Systolic',
				units: bpVital.units,
				resulted: bpVital.resulted,
				facilityCode: bpVital.facilityCode
			};

			bps.qualifiedName = bpVital.qualifiedName + ' Systolic';
			bpd.qualifiedName = bpVital.qualifiedName + ' Diastolic';
			bps.tooltipName = 'Blood Pressure';
			bpd.tooltipName = 'Blood Pressure';

			if(!_.isUndefined(bpVital.result)) {
				// Account for the case where the result value is not an actual recorded blood pressure value (e.g. "Refused" or "Unavailable")
				var resultVals = bpVital.result.split('/');
				if (resultVals.length > 1) {
					bps.result = resultVals[0];
					bpd.result = (resultVals.length === 3) ? resultVals[2] : resultVals[1];
				} else {
					bps.result = bpd.result = bpVital.result;
				}

				bps.resultUnitsMetricResultUnits = bps.result + ' mm[Hg]';
				bpd.resultUnitsMetricResultUnits = bpd.result + ' mm[Hg]';
				bps.resultUnits = bps.result + ' mm[Hg]';
				bpd.resultUnits = bpd.result + ' mm[Hg]';
			}

			if(!_.isUndefined(bpVital.low)) {
				var lowVals = bpVital.low.split('/');
				bps.low = lowVals[0];
				bpd.low = (lowVals.length === 3) ? lowVals[2] : lowVals[1];
			}

			if(!_.isUndefined(bpVital.high)) {
				var hiVals = bpVital.high.split('/');
				bps.high = hiVals[0];
				bpd.high = (hiVals.length === 3) ? hiVals[2] : hiVals[1];
			}

			if (!_.isEmpty(bpVital.previousResult)) {
                //Account for the case where the previous resule value is not an actual recorded blood pressure value (e.g. "Refused" or "Unavailable")
                var previousResultVals = bpVital.previousResult.split('/');
                if (previousResultVals.length > 1) {
                    bps.previousResult = previousResultVals[0];
                    bpd.previousResult = (previousResultVals.length === 3) ? previousResultVals[2] : previousResultVals[1];
                } else {
                    bps.previousResult = bpd.previousResult = bpVital.previousResult;
                }
            }

            return {
				bps: bps,
				bpd: bpd
            };
		},
		getGistDescriptionColumn: function(displayName) {
			var mappedName = _.get(vitalNameMappings, displayName);
            return !_.isUndefined(mappedName) ? mappedName.descriptionColumn : displayName;
		},
        getResultUnitsMetricResultUnits: function(response) {
            var resultUnitsMetricResultUnits = '';
            if(response.noRecordsFound) {
                resultUnitsMetricResultUnits = 'No Records Found';
            } else {
                resultUnitsMetricResultUnits = response.resultUnits;
                if(response.metricResultUnits){
                    resultUnitsMetricResultUnits += ' / ' + response.metricResultUnits;
                }
            }

            return resultUnitsMetricResultUnits;
        },
        setResultUnits: function(response) {
            response.resultUnits = '';
            if (( _.isString(response.result) && !_.isEmpty(response.result)) || _.isNumber(response.result)) {
                if (!_.isEmpty(response.typeName) && response.typeName.toLowerCase() === 'pain') {
                    // fix for de3511
                    // in the case of DOD data, the data is different than Vista
                    // parse out the number from the incoming data.
                    var number  = parseInt(response.result);
                    if (! isNaN(number)){
                        response.result = number;
                    }
                }

                response.resultUnits = response.result;
            }
            if (response.units && (response.result !== 'Pass' && response.result !== 'Refused' && response.result !== 'Unavailable')) {
                response.resultUnits += ' ' + response.units;
            }
        },
        getQualifiersNames: function(response) {
            var qualifierNames = '';
            if (response.qualifiers && response.qualifiers.length > 0) {
                qualifierNames = _.pluck(response.qualifiers, 'name').join(',');
            }
            return qualifierNames;
        },
        setMetricResult: function(response) {
            if(!response.metricUnits) {
                if(response.units === 'lb') {
                    response.metricUnits = 'kg';
                    response.metricResult = Math.round(response.result / 2.20462);
                } else if (response.units === 'in') {
                    response.metricUnits = 'cm';
                    response.metricResult = Math.round(response.result / 0.3937);
                } else if (response.units === 'F') {
                    response.metricUnits = 'C';
                    response.metricResult = Math.round((response.result - 32) / 1.8);
                }
            } else if (!_.isUndefined(response.result) && (response.result.toUpperCase() === 'UNAVAILABLE' || response.result.toUpperCase() === 'REFUSED' || response.result.toUpperCase() === 'PASS')){
                response.metricResult = '';
                response.metricUnits = '';
            }
        },
        getMetricResultUnits: function(response) {
            var metricResultUnits = '';
            if (response.metricResult) {
                metricResultUnits = response.metricResult;
            }
            if (response.metricUnits && (response.metricUnits !== 'Pass' && response.metricUnits !== 'Refused' && response.result !== 'Unavailable')) {
                metricResultUnits += ' ' + response.metricUnits;
            }
            return metricResultUnits;
        },
        setFormattedWeight: function(response) {
            var formattedWeight = null;
            if (response.typeName && response.typeName.toLowerCase().indexOf('weight') > -1) {
                if (response.units && response.units === 'kg') {
                    response.metricResult = response.result;
                    response.metricUnits = response.units;
                    response.result = Math.round(response.result * 2.20462);
                    response.units = 'lb';
                }
            }
        },
        setFormattedHeight: function(response) {
            if (response.typeName && response.typeName.toLowerCase() === 'height') {
                if (!isNaN(response.result)) {
                    if (response.units && response.units === 'cm') {
                        response.result = Math.round(response.result * 0.3937);
                        response.units = 'in';
                    }
                }
            }
        },
        toTitleCase: function(str) {
            if (!str) {
                return '';
            } else {
                return str.replace(/\w\S*/g, function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            }
        },
        getTypeName: function(response) {
            if (!response.noRecordsFound && response.typeName && response.typeName !== 'BMI') {
                return Util.toTitleCase(response.typeName);
            }

            return response.typeName;
        },
        getFormattedDate: function(date, dateFormat) {
            return date ? ADK.utils.formatDate(date, dateFormat) : '';
        }
	};

	return Util;
});
define([
	'jasminejquery',
	'test/stubs',
	'app/resources/fetch/vitals/utils'
], function(jasminejquery, Stubs, Utils) {
	'use strict';

	describe('Testing vitals resource pool utility function - getDisplayName', function() {
		it('Function should return formatted vitals', function() {
			expect(Utils.getDisplayName({displayName: 'existing display name'})).toEqual('existing display name');
			expect(Utils.getDisplayName({typeName: 'Blood Pressure'})).toEqual('BP');
			expect(Utils.getDisplayName({typeName: 'Pulse'})).toEqual('P');
			expect(Utils.getDisplayName({typeName: 'Respiration'})).toEqual('R');
			expect(Utils.getDisplayName({typeName: 'Temperature'})).toEqual('T');
			expect(Utils.getDisplayName({typeName: 'Pain'})).toEqual('PN');
			expect(Utils.getDisplayName({typeName: 'Weight'})).toEqual('WT');
			expect(Utils.getDisplayName({typeName: 'Patient Body Weight - Measured'})).toEqual('WT');
			expect(Utils.getDisplayName({typeName: 'Height'})).toEqual('HT');
			expect(Utils.getDisplayName({typeName: 'Body Mass Index'})).toEqual('BMI');
			expect(Utils.getDisplayName({typeName: 'Circumference/Girth'})).toEqual('CG');
			expect(Utils.getDisplayName({typeName: 'Default'})).toEqual('Default');
		});
	});

	describe('Testing vitals resource pool utility function - splitBpVital', function() {
		it('Should handle splitting BP vital correctly', function() {
			var bpVital = {
				observed: '201701011100',
				units: 'mm HG',
				resulted: '201701011200',
				facilityCode: 'TST1',
				qualifiedName: 'Blood Pressure',
				result: '120/80',
				low: '100/50',
				high: '210/110',
				previousResult: '110/75'
			};

			var split = Utils.splitBpVital(bpVital);
			expect(split.bps).toBeDefined();
			expect(split.bpd).toBeDefined();
			expect(split.bps.displayName).toEqual('BPS');
			expect(split.bpd.displayName).toEqual('BPD');
			expect(split.bps.observed).toEqual('201701011100');
			expect(split.bpd.observed).toEqual('201701011100');
			expect(split.bps.typeName).toEqual('Blood Pressure Systolic');
			expect(split.bpd.typeName).toEqual('Blood Pressure Diastolic');
			expect(split.bps.units).toEqual('mm HG');
			expect(split.bpd.units).toEqual('mm HG');
			expect(split.bps.resulted).toEqual('201701011200');
			expect(split.bpd.resulted).toEqual('201701011200');
			expect(split.bps.facilityCode).toEqual('TST1');
			expect(split.bpd.facilityCode).toEqual('TST1');
			expect(split.bps.qualifiedName).toEqual('Blood Pressure Systolic');
			expect(split.bpd.qualifiedName).toEqual('Blood Pressure Diastolic');
			expect(split.bps.tooltipName).toEqual('Blood Pressure');
			expect(split.bpd.tooltipName).toEqual('Blood Pressure');
			expect(split.bps.result).toEqual('120');
			expect(split.bpd.result).toEqual('80');
			expect(split.bps.resultUnitsMetricResultUnits).toEqual('120 mm[Hg]');
			expect(split.bpd.resultUnitsMetricResultUnits).toEqual('80 mm[Hg]');
			expect(split.bps.resultUnits).toEqual('120 mm[Hg]');
			expect(split.bpd.resultUnits).toEqual('80 mm[Hg]');
			expect(split.bps.low).toEqual('100');
			expect(split.bpd.low).toEqual('50');
			expect(split.bps.high).toEqual('210');
			expect(split.bpd.high).toEqual('110');
			expect(split.bps.previousResult).toEqual('110');
			expect(split.bpd.previousResult).toEqual('75');
		});
	});

	describe('Testing vitals resource pool utility function - getGistDescriptionColumn', function() {
		it('Should return displayName if mapping not found', function() {
			expect(Utils.getGistDescriptionColumn('Testing')).toEqual('Testing');
		});

		it('Should return mapped name', function() {
			expect(Utils.getGistDescriptionColumn('CG')).toEqual('Circum/Girth');
		});
	});

	describe('Testing vitals resource pool utility function - getResultUnitsMetricResultUnits', function() {
		it('Should return correct text if no records found', function() {
			expect(Utils.getResultUnitsMetricResultUnits({noRecordsFound: true})).toEqual('No Records Found');
		});

		it('Should return correct text with no metric results', function() {
			expect(Utils.getResultUnitsMetricResultUnits({resultUnits: '200 lb'})).toEqual('200 lb');
		});

		it('Should return correct text with metric results', function() {
			expect(Utils.getResultUnitsMetricResultUnits({resultUnits: '200 lb', metricResultUnits: '90.91 kg'})).toEqual('200 lb / 90.91 kg');
		});
	});

	describe('Testing vitals resource pool utility function - setResultUnits', function() {
		it('Should return empty string if there is no result', function() {
			var response = {};
			Utils.setResultUnits(response);
			expect(response.resultUnits).toEqual('');
		});

		it('Should return formatted text with units', function() {
			var response = {
				result: '60',
				units: 'in'
			};
			Utils.setResultUnits(response);
			expect(response.resultUnits).toEqual('60 in');
		});

		it('Should return formatted text correctly for pain vital', function() {
			var response = {
				typeName: 'Pain',
				result: '3/10',
				units: 'Clinical Workstation'
			};
			Utils.setResultUnits(response);
			expect(response.resultUnits).toEqual('3 Clinical Workstation');
		});
	});

	describe('Testing vitals resource pool utility - getQualifiersNames', function() {
		it('Should return qualified names formatted properly', function() {
			var response = {
				qualifiers: [{
					name: 'L ARM'
				}, {
					name: 'TEMPORAL'
				}]
			};
			expect(Utils.getQualifiersNames(response)).toEqual('L ARM,TEMPORAL');
		});
	});

	describe('Testing vitals resource pool utility - setMetricResult', function() {
		it('Should set metric properties for pounds', function() {
			var response = {
				units: 'lb',
				result: '200'
			};
			Utils.setMetricResult(response);
			expect(response.metricResult).toEqual(91);
			expect(response.metricUnits).toEqual('kg');
		});

		it('Should set metric properties for inches', function() {
			var response = {
				units: 'in',
				result: '60'
			};
			Utils.setMetricResult(response);
			expect(response.metricResult).toEqual(152);
			expect(response.metricUnits).toEqual('cm');
		});

		it('Should set metric properties for fahrenheit', function() {
			var response = {
				units: 'F',
				result: '98.6'
			};
			Utils.setMetricResult(response);
			expect(response.metricResult).toEqual(37);
			expect(response.metricUnits).toEqual('C');
		});
	});

	describe('Testing vitals resource pool utility - getMetricResultUnits', function() {
		it('Should get metric result units (result and units together)', function() {
			expect(Utils.getMetricResultUnits({metricResult: '91', metricUnits: 'kg'})).toEqual('91 kg');
		});
	});

	describe('Testing vitals resource pool utility - setFormattedWeight', function() {
		it('Should set weight properties correctly if metric already', function() {
			var response = {
				typeName: 'weight',
				units: 'kg',
				result: '100'
			};
			Utils.setFormattedWeight(response);
			expect(response.metricResult).toEqual('100');
			expect(response.metricUnits).toEqual('kg');
			expect(response.result).toEqual(220);
			expect(response.units).toEqual('lb');
		});
	});

	describe('Testing vitals resource pool utility - setFormattedHeight', function() {
		it('Should set height properties correctly if metric already', function() {
			var response = {
				typeName: 'height',
				units: 'cm',
				result: '140'
			};
			Utils.setFormattedHeight(response);
			expect(response.units).toEqual('in');
			expect(response.result).toEqual(55);
		});
	});

	describe('Testing vitals resource pool utility - toTitleCase', function() {
		it('Should format string properly', function() {
			expect(Utils.toTitleCase('blood pressure')).toEqual('Blood Pressure');
		});
	});

	describe('Testing vitals resource pool utility - getTypeName', function() {
		it('Should get type name and format properly', function() {
			expect(Utils.getTypeName({typeName: 'blood pressure'})).toEqual('Blood Pressure');
		});
	});

	describe('Testing vitals resource pool utility - getFormattedDate', function() {
		it('Should return properly formatted date', function() {
			expect(Utils.getFormattedDate('201701010808', 'MM-DD-YYYY HH:mm')).toEqual('01-01-2017 08:08');
		});
	});
});
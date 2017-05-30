define([
	'jasminejquery',
	'app/applets/vitals/util'
], function(jasminejquery, Util) {
	'use strict';

	describe('Test vitals utility function for getting long name', function() {
		it('Should return printable long name based on type', function() {
			expect(Util.getVitalLongName('BP')).toEqual('Blood Pressure');
			expect(Util.getVitalLongName('P')).toEqual('Pulse');
			expect(Util.getVitalLongName('R')).toEqual('Respiration');
			expect(Util.getVitalLongName('RR')).toEqual('Respiration');
			expect(Util.getVitalLongName('T')).toEqual('Temperature');
			expect(Util.getVitalLongName('PO2')).toEqual('Pulse Oximetry');
			expect(Util.getVitalLongName('PN')).toEqual('Pain');
			expect(Util.getVitalLongName('WT')).toEqual('Weight');
			expect(Util.getVitalLongName('HT')).toEqual('Height');
			expect(Util.getVitalLongName('BMI')).toEqual('Body Mass Index');
			expect(Util.getVitalLongName('Default')).toEqual('Default');
		});
	});
});
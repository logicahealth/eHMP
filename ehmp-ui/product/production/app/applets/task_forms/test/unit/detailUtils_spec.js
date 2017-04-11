/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['jquery', 'backbone', 'marionette', 'jasminejquery', 'app/applets/task_forms/common/utils/detailUtils'],
    function ($, Backbone, Marionette, Jasmine, Util) {
        describe('Testing enrichSingleActivityModel utility function', function(){
            it('Should fill in normal fields properly', function(){
                var model = new Backbone.Model({
                    'facilityRequestDivisionId': '500',
                    'healthIndicator': 0,
                    'domain': 'Consult',
                    'state': 'Draft'
                });

                var facilityMonikers = new Backbone.Collection();
                facilityMonikers.push(new Backbone.Model({facilityCode: '500', facilityName: 'Camp Master'}));

                Util.enrichSingleActivityModel(model, facilityMonikers, 'staff');
                expect(model.get('facilityRequestedName')).toEqual('Camp Master');
                expect(model.get('isStaffView')).toEqual(true);
                expect(model.get('state')).toEqual('Draft');
                expect(model.get('healthIndicator')).toEqual(true);
            });

            it('Should fill in other cases', function(){
                var model = new Backbone.Model({
                    'facilityRequestDivisionId': '400',
                    'healthIndicator': null,
                    'domain': 'Note',
                    'state': 'Unreleased:Pre-order workup'
                });

                var facilityMonikers = new Backbone.Collection();
                facilityMonikers.push(new Backbone.Model({facilityCode: '500', facilityName: 'Camp Master'}));

                Util.enrichSingleActivityModel(model, facilityMonikers, 'patient');
                expect(model.get('facilityRequestedName')).toEqual('');
                expect(model.get('isStaffView')).toEqual(false);
                expect(model.get('state')).toEqual('Unreleased');
                expect(model.get('substate')).toEqual('Pre-order workup');
                expect(model.get('healthIndicator')).toEqual(false);
            });
        });
    });
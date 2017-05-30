/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, jqm, describe, it, expect, beforeEach, afterEach, spyOn, window, ADK*/

'use strict';

define([
    "jquery",
    "backbone",
    "marionette",
    "jasminejquery",
    "test/stubs",
    "app/applets/patient_selection/views/recentPatients/summary"
], function($, Backbone, Marionette, jasmine, Stubs, RecentPatientApplicationHeaderDropDown) {

    describe('The recent patient application header dropdown', function() {
        var dropdown;

        Stubs.bootstrapViewTest();

        beforeEach(function() {
            var mockRecentPatients = [{
                displayName: 'One,Patient',
                pid: 'ABCD;1111',
                ssn: '555-55-2345'
            }, {
                displayName: 'Two,Patient',
                pid: 'ABCD;1222',
            }, {
                displayName: 'Three,Patient',
                pid: 'ABCD;1333',
            }];

            Stubs.setPatientList(mockRecentPatients);
            dropdown = new RecentPatientApplicationHeaderDropDown.AlertDropdown();
            Stubs.testRegion.show(dropdown.dropDownView);
        });

        describe('when is constructing the dropdown', function() {
            it('should exist', function() {
                expect(dropdown).toBeDefined();
            });
        });

        describe('when triggering sync', function() {
            it('onSync with patients', function() {
                dropdown.collection.trigger('sync', dropdown.collection, {
                    message: 'No results found.'
                });
                expect(dropdown.dropDownView.$('#noRecentPatients')).toHaveClass('hidden');
                expect(dropdown.dropDownView.$('.loading')).toHaveClass('hidden');
                expect(dropdown.dropDownView.$('.dropdown-body')).not.toHaveClass('hidden');
            });

            it('onSync empty collection', function() {
                dropdown.dropDownView.collection.set([]);
                dropdown.collection.trigger('sync', dropdown.collection, {
                    message: 'No results found.'
                });
                expect(dropdown.dropDownView.$('#noRecentPatients')).not.toHaveClass('hidden');
                expect(dropdown.dropDownView.$('.loading')).toHaveClass('hidden');
                expect(dropdown.dropDownView.$('.dropdown-body')).not.toHaveClass('hidden');
            });
        });

        describe('on a patient row', function() {
            it('click', function() {
                dropdown.dropDownView.$('a[title="Press enter to select One,Patient (O2345)"]').click();
                expect(ADK.PatientRecordService.getCurrentPatient().get('displayName')).toEqual('One,Patient');
                expect(ADK.PatientRecordService.getCurrentPatient().get('pid')).toEqual('ABCD;1111');
            });
        });

        describe('when calling serializeModel', function() {
            var serializeModel;

            beforeEach(function() {
                serializeModel = _.get(RecentPatientApplicationHeaderDropDown, 'AlertDropdown.prototype.RowView.prototype.serializeModel');
            });

            it('with a model containing last5', function() {
                var mockView = {
                    model: new Backbone.Model({
                        last5: 'L1234',
                        displayName: 'Last, First',
                        ssn: '555-55-1234'
                    })
                };

                var result = serializeModel.call(mockView);
                expect(result.lastInitialPlusSsn).toEqual('L1234');
            });

            it('with a model that does not have last5 but has displayName and ssn', function() {
                var mockView = {
                    model: new Backbone.Model({
                        displayName: 'Apple, First',
                        ssn: '555-55-1235'
                    })
                };

                var result = serializeModel.call(mockView);
                expect(result.lastInitialPlusSsn).toEqual('A1235');
            });

            it('with a model that does not have last5, displayName, or ssn', function() {
                var mockView = {
                    model: new Backbone.Model({})
                };

                var result = serializeModel.call(mockView);
                expect(result.lastInitialPlusSsn).toEqual('');
            });

            it('with a model that does not have last5 but has displayName and ssn where ssn is "*SENSITIVE*"', function() {
                var mockView = {
                    model: new Backbone.Model({
                        displayName: 'Apple, First',
                        ssn: '*SENSITIVE*'
                    })
                };

                var result = serializeModel.call(mockView);
                expect(result.lastInitialPlusSsn).toEqual('*SENSITIVE*');
            });
        });
    });
});
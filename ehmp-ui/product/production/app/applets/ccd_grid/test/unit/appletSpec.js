/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, afterEach, spyOn, handlebars, ADK, jasmine, document, window */

'use strict';

// Jasmine Unit Testing Suite
define(['jquery', 'backbone', 'marionette', 'jasminejquery', 'test/stubs', 'app/applets/ccd_grid/util'],
    function($, Backbone, Marionette, jasminejquery, Stubs, Util) {

        describe('Test for community health summaries utilities functions', function() {

            var response = null;

            var originalFormatDate = ADK.utils.formatDate;

            beforeEach(function(done) {
                ADK.utils.formatDate = jasmine.createSpy('formatDate').and.callFake(function(date, format) {
                    return '06/17/2014';
                });
                response = getInitializeResponse();
                done();
            });

            afterEach(function(done) {
                ADK.utils.formatDate = originalFormatDate;
                response = null;
                done();
            });

            function getInitializeResponse() {
                var initialResponse = {
                    'ccdDateTime': '20140617014108'
                };
                return initialResponse;
            }

            it('Test getReferenceDateDisplay and getReferenceDateTimeDisplay is formatted', function() {
                var referenceDateDisplay = Util.getReferenceDateDisplay(response.ccdDateTime);
                var referenceDateTimeDisplay = Util.getReferenceDateTimeDisplay(response.ccdDateTime);
                expect(ADK.utils.formatDate).toHaveBeenCalled();

                delete response.ccdDateTime;
                referenceDateDisplay = Util.getReferenceDateDisplay(response.ccdDateTime);
                expect(referenceDateDisplay).toEqual('N/A');
                referenceDateTimeDisplay = Util.getReferenceDateTimeDisplay(response.ccdDateTime);
                expect(referenceDateTimeDisplay).toEqual('N/A');
            });

        });
    });

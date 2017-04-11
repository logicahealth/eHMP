define([
    'jquery',
    'backbone',
    'marionette',
    'jasminejquery',
    'test/stubs',
    'app/applets/immunizations/applet'
], function($, Backbone, Marionette, jasminejquery, Stubs, ImmunizationsApplet) {
    'use strict';

    describe('Base tests for Immunizations applet', function() {
        it('Test serializeModel functionality', function() {
            var serializeModel = _.get(ImmunizationsApplet, 'viewTypes[1].view.prototype.DataGrid.prototype.DataGridRow.prototype.serializeModel');
            var mockView = {
                model: new Backbone.Model({
                    administeredDateTime: '20121115',
                    contraindicated: true,
                    facilityCode: 'DOD',
                    comment: 'A comment'
                })
            };
            var result = serializeModel.call(mockView);
            expect(result.contraindicatedDisplay).toEqual('Yes');
            expect(result.facilityColor).toEqual('DOD');
            expect(result.commentBubble).toEqual(true);
            expect(result.timeSinceDate).toEqual('20121115');
        });
    });
});
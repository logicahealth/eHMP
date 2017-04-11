/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, afterEach, spyOn */
define([
    'jasminejquery',
    'app/applets/cds_advice/util'
], function (jasminejquery, Util) {
    'use strict';

    describe('cdsAdviceUtil', function () {
        it('method getPriorityCSS should return a string with the CSS class for the corresponding priority', function () {
            expect(Util.getPriorityCSS(100)).toEqual('color-red bold-font');
            expect(Util.getPriorityCSS(81)).toEqual('color-red bold-font');
            expect(Util.getPriorityCSS(80)).toEqual('');
        });

        it('method formatDetailText returns a string without multiple space characters', function () {
            expect(Util.formatDetailText('Test     string with   extra spaces.')).toEqual('Test string with extra spaces.');
        });
    });
});

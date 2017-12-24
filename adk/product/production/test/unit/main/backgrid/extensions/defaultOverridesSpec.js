/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(["jquery", "backbone", "backgrid", "main/backgrid/extensions/defaultOverrides"],
    function ($, Backbone) {

        describe("Backgrid' StringCell is extended", function () {
            it("DE8400: escapes special characters on default model", function () {
                var vital = new Backbone.Model({
                    title: "<svg/onload=alert('xss')>"
                });
                var column = {
                    name: "title",
                    cell: "string"
                };
                var cell = new Backgrid.StringCell({
                    model: vital,
                    column: column
                });
                cell.render();
                expect(cell.$el.html()).toBe("&lt;svg/onload=alert('xss')&gt;");
            });

            it("DE8400: escapes special characters for JSON that we pass as argument", function () {
                var vital = new Backbone.Model({
                    title: "<svg/onload=alert('xss')>"
                });
                var column = {
                    name: "title",
                    cell: "string"
                };
                var cell = new Backgrid.StringCell({
                    model: vital,
                    column: column
                });
                cell.render({
                    title: "<svg/onload=alert('xss2')>"
                });
                expect(cell.$el.html()).toBe("&lt;svg/onload=alert('xss2')&gt;");
            });

        });

    });


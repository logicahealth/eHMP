/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, jasmine */

'use strict';

define([
    'app/applets/user_management/appletUtil'
], function(appletUtil) {

    //Test for appletUtil.compareArrays()
    describe("Verify if the comparison of two arrays:", function() {

        var result;

        it("should return true for two empty arrays", function() {
            var array1 = [];
            var array2 = [];
            result = appletUtil.compareArrays(array1, array2);
            expect(result).toBe(true);
        });

        it("should return false for one empty array and one array that has one or more elements", function() {
            var array1 = [];
            var array2 = ["a", "b"];
            result = appletUtil.compareArrays(array1, array2);
            expect(result).toBe(false);
        });

        it("should return false for one empty array and one array that has one or more elements", function() {
            var array1 = [];
            var array2 = ["a", "b"];
            result = appletUtil.compareArrays(array2, array1);
            expect(result).toBe(false);
        });

        it("should return true for two arrays that have the same elements in the same order", function() {
            var array1 = ["a", "b", "c"];
            var array2 = ["a", "b", "c"];
            result = appletUtil.compareArrays(array1, array2);
            expect(result).toBe(true);
        });

        it("should return true for two arrays that have the same elements, but NOT the same order", function() {
            var array1 = ["a", "b", "c"];
            var array2 = ["c", "a", "b"];
            result = appletUtil.compareArrays(array1, array2);
            expect(result).toBe(true);
        });

        it("should return false for two arrays that have different number of elements", function() {
            var array1 = ["a", "b", "c"];
            var array2 = ["a", "b", "c", "d"];
            result = appletUtil.compareArrays(array1, array2);
            expect(result).toBe(false);
        });

        it("should return false for two arrays that have different number of elements", function() {
            var array1 = ["a", "b", "c"];
            var array2 = ["a", "b", "c", "d"];
            result = appletUtil.compareArrays(array2, array1);
            expect(result).toBe(false);
        });

        it("should return false for two arrays that have the same number of elements, but different elements", function() {
            var array1 = ["a", "b", "c"];
            var array2 = ["a", "b", "cc"];
            result = appletUtil.compareArrays(array1, array2);
            expect(result).toBe(false);
        });

        it("should return false for two arrays that have the same number of elements, but different elements", function() {
            var array1 = ["a", "b", "c"];
            var array2 = ["a", "b", "cc"];
            result = appletUtil.compareArrays(array2, array1);
            expect(result).toBe(false);
        });
    });

    describe("Verify if the users list is formatted properly when pageable (isValidUsersList):", function() {
        var pageable = true;
        var result;

        it("should return false when the returned user collection object is undefined", function() {
            result = appletUtil.isValidUsersList(undefined);
            expect(result).toBe(false);
        });

        it("should return false when the returned user collection object object has no data attribute", function() {
            result = appletUtil.isValidUsersList({});
            expect(result).toBe(false);
        });

        it("should return false when the returned user collection object is pageable and has empty fullCollection attribute", function() {
            result = appletUtil.isValidUsersList({
                fullCollection: {}
            }, pageable);
            expect(result).toBe(false);
        });

        it("should return false when the returned user collection object is pageable and has fullCollection with models object", function() {
            result = appletUtil.isValidUsersList({
                fullCollection: {
                    models: {}
                }
            }, pageable);
            expect(result).toBe(false);
        });

        it("should return false when the returned user collection object is pageable and has fullCollection with models empty array", function() {
            result = appletUtil.isValidUsersList({
                fullCollection: {
                    models: []
                }
            }, pageable);
            expect(result).toBe(false);
        });

        it("should return true when the returned user collection object is pageable and has fullCollection with model array of objects", function() {
            result = appletUtil.isValidUsersList({
                fullCollection: {
                    models: [{}]
                }
            }, pageable);
            expect(result).toBe(true);
        });
    });

    describe("Verify if the users list is formatted properly when NOT pageable (isValidUsersList):", function() {
        var pageable = false;
        var result;

        it("should return false when the returned user collection object is NOT pageable and has no models", function() {
            result = appletUtil.isValidUsersList({
                models: {}
            }, pageable);
            expect(result).toBe(false);
        });

        it("should return false when the returned user collection object is NOT pageable and has no models", function() {
            result = appletUtil.isValidUsersList({
                models: []
            }, pageable);
            expect(result).toBe(false);
        });

        it("should return true when the returned user collection object is NOT pageable and has model objects", function() {
            result = appletUtil.isValidUsersList({
                models: [{}]
            }, pageable);
            expect(result).toBe(true);
        });
    });
});

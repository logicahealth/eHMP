/*jslint node: true, nomen: true, unparam: true */
/*global moment, jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

define(['handlebars'], function(Handlebars) {
    function convertStringToInteger(string) {
        return string? parseInt(string) : 0;
    }

    Handlebars.registerHelper('convertStringToInteger', convertStringToInteger);
    return convertStringToInteger;
});
/*jslint node: true, nomen: true, unparam: true */
/*global document, moment, jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

define(['underscore', 'handlebars', 'moment', 'main/Utils'], function(_, Handlebars, moment, Utils) {
    function breakLines(text) {
        var safeText = Handlebars.Utils.escapeExpression(text);
        return new Handlebars.SafeString(Utils.breakLines(safeText));
    }

    Handlebars.registerHelper('breakLines', breakLines);
    return breakLines;
});
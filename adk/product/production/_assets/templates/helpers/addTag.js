/*jslint node: true, nomen: true, unparam: true */
/*global document, moment, jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

define(['underscore', 'handlebars', 'moment'], function(_, Handlebars, moment) {
    function addTag(contents, tag, className) {
        var tagName = tag || 'em';

        var $el = document.createElement(tagName);

        if(className) {
            $el.className = className;
        }

        $el.innerText = Handlebars.Utils.escapeExpression(contents);
        return new Handlebars.SafeString($el.outerHTML);
    }

    Handlebars.registerHelper('addTag', addTag);
    return addTag;
});
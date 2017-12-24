/*jslint node: true, nomen: true, unparam: true */
/*global moment, jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';
/*
 **  Helper to format phone numbers consistently across the app
 **  @number - phone number to transform
 **  @defaultVal - string to return when @number isn't defined.
 **
 **  @return - number in format of (555) 555-5555{ ext. 5555} ||
                returns the number given if it couldn't format it
 */
define(['handlebars', 'main/adk_utils/stringUtils'], function(Handlebars, StringUtils) {
    function formatPhone(number, defaultVal) {
        if (!number) {
            return defaultVal instanceof Object ? '' : defaultVal;
        }
        return StringUtils.formatPhoneNumber(number);
    }

    Handlebars.registerHelper('formatPhone', formatPhone);
    return formatPhone;
});

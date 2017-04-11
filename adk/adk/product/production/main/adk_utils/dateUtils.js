define(['jquery', 'moment', 'underscore'], function($, Moment, _) {
    "use strict";

    var DateUtils = {};

    var regex = /^(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d\d$/g,
        dpFormat = 'MM/DD/YYYY',
        config = function() {
            return {
                format: dpFormat.toLowerCase(),
                placeholder: dpFormat,
                regex: regex,
                clearIncomplete: true,
                todayHighlight: true,
                endDate: new Moment().format(dpFormat),
                startDate: new Moment('01/01/1900', dpFormat).format(dpFormat),
                keyboardNavigation: false,
                onincomplete: function(e) { //Required to ensure model is sync'd to field
                    $(this).val('').trigger('change');
                },
                inputmask: 'm/d/y',
                autoclose: true
            };
        }();

    DateUtils.datepicker = function(el, options, eventOptions) {
        var datePickerConfig = _.clone(config, true);
        var opts = options || {};
        eventOptions = eventOptions || {};

        _.extend(datePickerConfig, opts);

        var datepickerElement = el.datepicker(datePickerConfig).data({
            //Set the data against the DOM element
            value: datePickerConfig.initialDate,
            regex: datePickerConfig.regex,
            format: datePickerConfig.format,
            autoclose: datePickerConfig.autoclose,
            dateUtilsOptions: datePickerConfig
        });

        _.each(eventOptions, function(anEvent) {
            datepickerElement.on(anEvent.type, anEvent.handler);
        });

        datepickerElement.inputmask(datePickerConfig.inputmask, datePickerConfig).prop('placeholder', datePickerConfig.placeholder);
    };

    DateUtils.defaultOptions = function() {
        return config;
    };

    DateUtils.getRdkDateTimeFormatter = function() {
        return {
            getCurrentDate: function() {
                return new Moment().format("YYYYMMDD");
            },

            getCurrentTimeWithZeroSeconds: function() {
                return new Moment().format("HHmm") + "00";
            },

            getCurrentTime: function() {
                return new Moment().format("HHmmss");
            },

            getDateFromDateString: function(dateString) {
                return new Moment(dateString, dpFormat).format("YYYYMMDD");
            },

            getDateTimeFromDateTimeStrings: function(date, time) {
                var input = new Moment(date + ' ' + time + 'm');
                if (!input.isValid()) {
                    return 0;
                } else {
                    return input.format('YYYYMMDDHHmm');
                }
            }
        };
    };


    var _final = DateUtils.staticFinal = {};

    /** Months full names */
    var FULL_MONTH_MAP = _final.FULL_MONTH_MAP = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    /** Months abbreviated names */
    var ABBREVIATED_MONTH_MAP = _final.ABBREVIATED_MONTH_MAP = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    Object.freeze(_final.FULL_MONTH_MAP);
    Object.freeze(_final.ABBREVIATED_MONTH_MAP);


    /**
     * Converts a month number to the 3 digit month abbreviation
     * @example toAbbreviatedMonth(3) => Mar
     * @param month {string|number} The number value of the month
     * @returns {string} a three digit letter representation of the month
     */
    DateUtils.toAbbreviateMonth = function(month) {
        month -= 1;
        return ABBREVIATED_MONTH_MAP[month];
    };

    /**
     * Convert a month number to the full name of the month
     * @example toFullMonth(3) => March
     * @param month {string|number} The number value of the month
     * @returns {string} The full name of the month
     */
    DateUtils.toFullMonth = function(month) {
        month -= 1;
        return FULL_MONTH_MAP[month];
    };

    /**
     * Alternative to using moment.js for creating group labels.
     * Convert YYYYMM format to MMMM YYYY format
     * @example timeGroupLabel(197001) => January 1970
     * @param date {string|number} Expected format
     * @returns {string} Month Year
     */
    DateUtils.timeGroupLabel = function(date) {
        if(typeof date === "number")
            date = date + '';
        var year = date.substring(0, 4);
        var month = date.substring(4,6);
        return [this.toFullMonth(month), year].join(' ');
    };


    /**
     * Converts a string into a StringFormatter Object.
     * Designed to be a drop in replacement for moment.js when moment is only being used for string formatting.
     * ei. Do not use this for calculating time differences.
     *
     * Local testing shows this runs ~60-75% faster than moment.
     *
     * This is more restrictive then moment:
     *      It only handles 4 digit years
     *      It only handles 2 digit days
     *      It will not handle 1 digit months
     *      It only handles 24 hour time
     *      It only goes to the second
     *
     * Example:
     * var sf = new StringFormatter("197001300830", "YYYYMMDDHHmm")
     *  sf.year === 1970
     *  sf.month === 01
     *  sf.day === 30
     *  sf.hour === 08
     *  sf.minute === 30
     *  sf.second === 00
     *
     * @param dateStr {string}
     * @param inputFormat {string}
     * @constructor
     */
    DateUtils.StringFormatter = function(dateStr, inputFormat) {
        inputFormat = inputFormat || "YYYYMMDDHHmmSS";

        var year = inputFormat.search(/(YYYY)/);
        var month = inputFormat.search(/(MM)/);
        var day = inputFormat.search(/(DD)/);
        var hour = inputFormat.search(/(HH)/);
        var min = inputFormat.search(/(mm)/);
        var second = inputFormat.search(/(SS)/);

        this.moment = undefined;
        this.year = dateStr.substr(year, 4);
        this.month = dateStr.substr(month, 2);
        this.day = dateStr.substr(day, 2);

        this.hour = hour >= 0 ? dateStr.substr(hour, 2) : '00';
        this.minute = min >= 0 ? dateStr.substr(min, 2) : '00';
        this.second = second >= 0 ? dateStr.substr(second, 2) : '00';



        /**
         * This is the equivalent of the Moment.format() method
         * It assumes
         *
         * @param output {string}
         * @returns {string}
         */
        this.format = function(output) {
            output = output.replace(/(YYYY)/, this.year);
            if(output.search(/(MMMM)/) >= 0) {
                output = output.replace(/(MMMM)/, DateUtils.toFullMonth(this.month));
            } else if (output.search(/(MMM)/) >= 0) {
                output = output.replace(/(MMM)/, DateUtils.toAbbreviateMonth(this.month));
            } else {
                output = output.replace(/(MM)/, this.month);
            }
            output = output.replace(/(DD)/, this.day);
            output = output.replace(/(HH)/, this.hour);
            output = output.replace(/(mm)/, this.minute);
            output = output.replace(/(ss)/, this.second);
            return output;
        };
    };

    return DateUtils;
});

/* global ADK */
define([
    'underscore',
    'moment',
    'backbone'
], function (_, Moment, Backbone) {
    'use strict';


    //noinspection UnnecessaryLocalVariableJS
    var Model = Backbone.Model.extend({
        idAttribute: 'uid',
        defaults: {
            applet_id: 'lab_results_grid',
            observationType: 'labs',
            infobuttonContext: 'LABRREV'
        },
        parse: function parse(response) {
            var specimen = _.get(response, 'specimen');
            var observed = _.get(response, 'observed');
            var timeSince = _.get(response, 'timeSince');
            var shortName = _.get(response, 'typeName');
            var specimenForTrend = _.get(response, 'specimen');
            var normalizedName = shortName.replace(/\W/g, '_');

            if (_.contains(specimen, 'SERUM') || _.contains(specimen, 'BLOOD')) {
                specimenForTrend = '';
            }

            if (_.contains(shortName, ',')) {
                shortName = shortName.substr(0, _.indexOf(shortName, ','));
            }

            _.set(response, 'timeSince', this.getTimeSince(observed));
            _.set(response, 'observedFormatted', this.getObservedFormatted(observed));
            _.set(response, 'numericTime', this.getNumericTime(timeSince));
            _.set(response, 'shortName', shortName);
            _.set(response, 'specimenForTrend', specimenForTrend);
            _.set(response, 'normalizedName', normalizedName);

            return response;
        },
        /**
         * @param {String}[observedTime=this.attributes.observed]
         */
        getTimeSince: function (observedTime) {
            var fromDate = observedTime || this.get('observed');

            // TODO this should be able to use ADK.util.formatDate
            if (fromDate === undefined || fromDate === '') return undefined;
            var startDate = new Moment(fromDate, 'YYYYMMDDHHmmssSSS');
            var endDate = new Moment();

            var duration = new Moment.duration(endDate.diff(startDate));

            var years = parseFloat(duration.asYears());
            var days = parseFloat(duration.asDays());
            var months = parseFloat(duration.asMonths());
            var hours = parseFloat(duration.asHours());
            var min = parseFloat(duration.asMinutes());

            if (min > 0 && min < 60) {
                hours = 1;
            }
            //console.log(hours1);

            var lYear = 'y';
            var lMonth = 'm';
            var lDay = 'd';
            var lHour = 'h';
            var finalResult = '';
            if (months >= 24) {
                finalResult = Math.round(years) + lYear;
            } else if ((months < 24) && (days > 60)) {
                finalResult = Math.round(months) + lMonth;
            } else if ((days >= 2) && (days <= 60)) {
                finalResult = Math.round(days) + lDay;
            } else if (days < 2) {
                finalResult = Math.round(hours) + lHour;
            }

            return finalResult;
        },
        /**
         * @param {String}[observedTime=this.attributes.observed]
         */
        getObservedFormatted: function (observedTime) {
           var observed = observedTime || this.get('observed') || this.get('resulted');
           var moment = new Moment(observed, 'YYYYMMDDHHmmssSSS');
           return moment.format('MM/DD/YYYY - HH:mm');
        },
        getNumericTime: function (timeSince) {
            // TODO refactor this
            var _timeSince = timeSince || this.get('timeSince');
            if (!_timeSince) {
                return;
            }
            var reg = /(\d+)/ig;
            var strReg = _timeSince.match(reg);
            _timeSince = _timeSince.substr(_timeSince.length - 1);
            switch (_timeSince) {
                case 'y':
                    if (strReg == 1) {
                        _timeSince = 'year';
                    } else _timeSince = 'years';
                    break;

                case 'm':
                    if (strReg == 1) {
                        _timeSince = 'month';
                    } else _timeSince = 'months';
                    break;

                case 'M':
                    if (strReg == 1) {
                        _timeSince = 'month';
                    } else _timeSince = 'months';
                    break;

                case 'd':
                    if (strReg == 1) {
                        _timeSince = 'month';
                    } else _timeSince = 'months';
                    break;

                case 'h':
                    if (strReg == 1) {
                        _timeSince = 'day';
                    } else _timeSince = 'days';
                    break;
            }
            return strReg + ' ' + _timeSince;
        }

    });

    return Model;
});
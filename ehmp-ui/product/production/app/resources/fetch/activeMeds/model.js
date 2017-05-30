/* global ADK */

define([
    'backbone',
    'marionette',
    'underscore',
    'moment',
    'hbs!app/applets/activeMeds/templates/tooltip',
    'app/applets/activeMeds/staticText'
], function ActiveMedsModel(Backbone, Marionette, _, Moment, tooltip, MEDS) {
    "use strict";

    //noinspection UnnecessaryLocalVariableJS
    var MedicationModel = Backbone.Model.extend({
        idAttribute: 'uid',
        defaults: {
            totalFillsRemaining: 'Unknown',
            applet_id: 'activeMeds',
            infobuttonContext: 'MLREV'
        },
        parse: function (response) {
            ADK.Enrichment.addFacilityMoniker(response);
            response.overallStartFormat = ADK.utils.formatDate(response.lastAction);
            response.popoverMeds = [{
                overallStartFormat: response.overallStartFormat,
                normalizedName: response.normalizedName,
                sig: response.sig,
                age: response.age
            }];
            var crsUtil = ADK.utils.crsUtil;
            response.standardizedVaStatus = this.getStandardizedVaStatus(response.calculatedStatus, response.vaStatus);
            response.fillableStatus = this.getFillableStatus(response.standardizedVaStatus, response.vaType, response.orders);
            response[crsUtil.crsAttributes.CRSDOMAIN] = ADK.utils.crsUtil.domain.MEDICATION;
            response.tooltip = tooltip(response);
            return response;
        },

        /**
         * @returns {String} The number of fills left or 'No Data'
         */
        getFillsRemaining: function getFillsRemaining() {
            var calculatedStatus = this.get('calculatedStatus') || "";
            calculatedStatus = calculatedStatus.toUpperCase();
            var vaType = this.get('vaType') || "";
            vaType = vaType.toUpperCase();

            var firstOrder = this.get('orders') || [];
            firstOrder = firstOrder[0];

            if (vaType === 'I' || vaType === 'V' || (vaType === 'N' && !_.has(firstOrder, 'fillsRemaining'))) {
                return MEDS.NO_DATA;
            } else if (calculatedStatus === 'PENDING') {
                if (_.has(firstOrder, 'fillsAllowed')) {
                    var fillsAllowed = _.get(firstOrder, 'fillsAllowed');
                    return fillsAllowed.toString();
                }
                return MEDS.NO_DATA;
            } else if (calculatedStatus !== 'DISCONTINUED' && calculatedStatus !== 'CANCELLED' && calculatedStatus !== 'EXPIRED') {
                return _.get(firstOrder, 'fillsRemaining').toString();
            }
            return '0';

        },

        /**
         * @returns {String} The status text for the Medication
         */
        getStandardizedVaStatus: function (calculatedStatus, vaStatus) {
            var standardizedStatus = calculatedStatus || vaStatus;
            if (standardizedStatus) {
                standardizedStatus = standardizedStatus.toUpperCase();
                if (standardizedStatus === "DISCONTINUED/EDIT") {
                    standardizedStatus = "DISCONTINUED";
                }
                return standardizedStatus;
            }
            return "";
        },

        /**
         * Converts the status to a string that represents that status.
         * @param standardizedStatus {String} result of getStandardizedVaStatus()
         * @param vaType {String} result of getStandardizedVaStatus()
         * @param orders {Array} result of getStandardizedVaStatus()
         * @returns {String}
         */
        getFillableStatus: function (standardizedStatus, vaType, orders) {
            var vaStatus = standardizedStatus ||  "";
            var type = vaType || "";
            var order = orders || [];

            vaStatus = vaStatus.toLocaleLowerCase();
            order = order[0];

            if (vaStatus === "expired") {
                return "Expired";
            } else if (vaStatus === "discontinued") {
                return (type === 'N') ? "Non VA - Discont." : "Discontinued";
            } else if (vaStatus === "pending") {
                return "Pending";
            } else if (type === 'N') {
                return "Non VA";
            } else if (_.get(order, 'fillsRemaining') === 0) {
                return "0 Refills";
            } else if (!this.get('lastFilled') && !_.get(order, 'fillsRemaining') && _.isEmpty(this.get('fills'))) {
                return "No Data";
            }
            return "Fillable for";
        },

        /**
         * Converts data from the Model into information on how to display it
         *
         * @param fillableStatus
         * @returns {*|{display: *, hasLabel: boolean}}
         */
        getFillableData: function (fillableStatus) {
            if (fillableStatus === "Fillable for") {
                return this._getFillableLabels(fillableStatus);
            }
            return this._getNotFillableLabels(fillableStatus);

        },

        _getEarlierStopAsMoment: function () {
            var DATE_FORMAT = 'YYYYMMDDHHmm';

            var overallStop = new Moment(this.get('overallStop'), DATE_FORMAT);
            var stopped = new Moment(this.get('stopped'), DATE_FORMAT);
            var overallStart = new Moment(this.get('overallStart'), DATE_FORMAT);

            if (!stopped.isValid() || !overallStop.isValid()) {
                return stopped.isValid ? stopped : overallStop;
            }

            var earliest = stopped.isSame(overallStop) || stopped.isBefore(overallStop) ? stopped : overallStop;
            if (overallStart.isValid() && earliest.isBefore(overallStart)) {
                return earliest === stopped ? overallStop : stopped;
            }

            return earliest;
        },

        _getLastFill: function () {

            var lastFilled = this.get('lastFilled');
            if (!lastFilled) {
                var fills = this.get('fills') || [];
                if (fills.length > 1) {
                    _.sortBy(fills, function (d) {
                        return d.dispenseDate;
                    });

                    return _.last(fills).dispenseDate;
                } else {
                    return 'none';
                }
            }
            return lastFilled;
        },

        _getNotFillableLabels: function (fillableStatus) {
            var result = {
                display: fillableStatus,
                hasLabel: false
            };

            var stopped = this._getEarlierStopAsMoment();

            if (fillableStatus === "Expired") {
                var expired = ADK.utils.getTimeSince(stopped, true);
                result.hasLabel = true;
                result.label = 'label label-danger all-padding-xs align-self-flex-start';
                if (expired.count < 0) {
                    result.date = '??';
                    result.description = MEDS.BEFORE_EXPIRED;
                } else {
                    result.date = expired.count + expired.timeUnits;
                    result.description = MEDS.EXPIRED_ON(expired.timeSinceDescription);
                }
                return result;
            } else if (fillableStatus === "0 Refills") {
                result.description = MEDS.NO_REFILLS;
                result.label = 'label label-danger all-padding-xs align-self-flex-start';
                result.hasLabel = true;
            } else if (fillableStatus === "Discontinued" || fillableStatus === "Non VA - Discont.") {
                var discontinued = ADK.utils.getTimeSince(stopped, true);
                if (discontinued.count < 0) {
                    result.date = '??';
                    result.description = MEDS.BEFORE_DISCONTINUED;
                } else {
                    result.date = discontinued.count + discontinued.timeUnits;
                    result.description = MEDS.DISCONTINUED_ON(discontinued.timeSinceDescription);
                }
                if (fillableStatus === "Non VA - Discont.") {
                    result.description = MEDS.DISCONTINUED_ON_NON_VA(discontinued.timeSinceDescription);
                }
                result.label = 'label label-default all-padding-xs align-self-flex-start';
                result.hasLabel = true;
            } else if (fillableStatus === "Pending") {
                result.description = MEDS.PENDING_MEDICATION;
            } else if (fillableStatus === "Non VA") {
                result.description = MEDS.NON_ACTIVE;
            } else if (fillableStatus === 'No Data') {
                result.description = MEDS.MISSING_STATUS;
                result.display = 'No Data';
                result.label = 'label label-danger all-padding-xs align-self-flex-start';
                result.hasLabel = true;
            }
            return result;
        },

        _getFillableLabels: function getFillableLabels(fillableStatus) {
            var DATE_FORMAT = 'YYYYMMDDHHmm';
            var MIN_PER_DAY = 1440;
            var SIXTY_DAYS_IN_MIN = 86400;
            var TWO_YEARS_IN_MIN = 1051200;

            var result = {
                display: fillableStatus,
                hasLabel: false
            };

            var lastFilled = this._getLastFill();
            var firstOrder = this.get('orders') || [];
            firstOrder = firstOrder[0];

            var daysSupply = this.get('daysSupply') || _.get(firstOrder, 'daysSupply');
            var fillsRemaining = _.get(firstOrder, 'fillsRemaining');

            var today = new Moment();
            var lastFilledMoment = new Moment(lastFilled, DATE_FORMAT);
            var minutesSupply = daysSupply * MIN_PER_DAY;

            var lastFilledMinusToday = lastFilledMoment.diff(today, 'minutes');

            var fillableTimeMinutes = (minutesSupply * (fillsRemaining - 1));
            fillableTimeMinutes += Math.max((lastFilledMinusToday + minutesSupply), 0);

            //if (expirationDate - today) is less than fillableTimeMinutes, report the lower of the two values
            var expirationDateMoment = new Moment(this.get('expirationDate'), DATE_FORMAT);
            if (expirationDateMoment.isValid()) {
                var expirationDateMinusToday = expirationDateMoment.diff(today, 'minutes');

                if (((expirationDateMinusToday >= 0) && (expirationDateMinusToday < fillableTimeMinutes)) || expirationDateMinusToday < 0) {
                    fillableTimeMinutes = expirationDateMinusToday;
                }
            }

            var fillableTimeDuration = Moment.duration(fillableTimeMinutes, 'minutes');

            //display minutes, hours, months, or years as described in the "Time Annotations" section of the F338 Feature Spec
            var fillableTimeString = '';

            if (fillableTimeMinutes < MIN_PER_DAY) {
                fillableTimeString = '1 d';
            } else if (fillableTimeMinutes <= SIXTY_DAYS_IN_MIN) {
                fillableTimeString = parseInt(Math.round(fillableTimeDuration.asDays())) + 'd';
            } else if (fillableTimeMinutes <= TWO_YEARS_IN_MIN) {
                fillableTimeString = parseInt(Math.round(fillableTimeDuration.asMonths())) + 'm';
            } else {
                fillableTimeString = parseInt(Math.round(fillableTimeDuration.asYears())) + 'y';
            }

            // If no time left, danger label.  If less than 90 days left, warning label
            var fillableTimeDays = fillableTimeMinutes / MIN_PER_DAY;
            if (fillableTimeDays <= 90) {
                result.label = 'label label-warning all-padding-xs align-self-flex-start';
                result.hasLabel = true;
            }
            if (fillableTimeDays <= 0) {
                if (fillsRemaining === 1) {
                    result.description = MEDS.ACTIVE_MED;
                    result.display = "Refillable";
                } else {
                    result.description = MEDS.ACTIVE_EXPIRED;
                    result.display = "Not Refillable";
                }
            } else {
                result.description = MEDS.ACTIVE_FILLABLE_FOR(fillableTimeString);
                result.date = fillableTimeString;
            }
            return result;
        }
    });

    return MedicationModel;

});
define([
    'underscore',
    'backbone',
    'moment'
], function(_, Backbone, moment) {
    'use strict';
    var allStatusRanks = {
        'active': 1,
        'pending': 2,
        'expired': 3,
        'discontinued': 4
    };

    return Backbone.Model.extend({
        idAttribute: 'uid',
        parse: function(response) {
            response.vaType = _.get(response, 'va_type', response.vaType);
            return response;
        },
        getModifiedVaStatus: function() {
            var vaStatus = this.get("calculatedStatus") || this.get("vaStatus");
            if (vaStatus) {
                var lowerCaseVaStatus = vaStatus.toLowerCase();
                if (lowerCaseVaStatus === "discontinued/edit") {
                    return "discontinued";
                } else {
                    return lowerCaseVaStatus;
                }
            } else {
                return "No Data";
            }
        },
        getStatusRank: function() {
            if (this.statusRank && !this.changed.vaStatus) {
                return this.statusRank;
            }
            this.statusRank = allStatusRanks[this.getModifiedVaStatus()] || 100;
            return this.statusRank;
        },
        getName: function() {
            var name = this.get("name");
            return name ? name.toLowerCase() : "No Data";
        },
        getCode: function() {
            var codes = this.get("codes");
            var rxnormSystem = "urn:oid:2.16.840.1.113883.6.88";
            if (codes && codes.length > 0) {
                for (var i = 0; i < codes.length; i++) {
                    if (rxnormSystem === codes[i].system) {
                        return codes[i].code;
                    }
                }
            }
        },
        getFacilityName: function() {
            var facilityName = this.get("facilityName");
            return facilityName ? facilityName : "No Data";
        },
        getProducts: function() { //needs rewriting because should not be accessing only first object need to loop
            var products = this.get("products");
            var noData = "No Data";
            if (products && products[0]) {
                var strength = products[0].strength;
                var ingredientCodeName = products[0].ingredientCodeName;
                var volume = products[0].volume;
                var drugClassName = products[0].drugClassName;
                return {
                    drugClassName: drugClassName ? drugClassName : noData,
                    ingredientCodeName: ingredientCodeName ? ingredientCodeName : noData,
                    strength: strength ? strength : "",
                    volume: volume ? volume : noData
                };
            } else {
                return noData;
            }
        },
        getFillsAllowed: function() { //needs rewriting because should not be accessing only first object need to loop
            var fillsAllowed = this.get('orders')[0].fillsAllowed;
            return fillsAllowed ? fillsAllowed : 0;
        },
        getDaysSupply: function() { //needs rewriting because should not be accessing only first object need to loop
            var daysSupply = this.get('orders')[0].daysSupply;
            return daysSupply ? daysSupply : undefined;
        },
        getUid: function() {
            var uid = this.get('uid').replace(/[:|.]/g, "_");
            return uid ? uid : undefined;
        },
        getSig: function() {
            var doseUnitRouteSchedule = '';
            var sig = this.get('sig');
            var qualifiedName = this.get('qualifiedName');
            var name = this.get('name');
            var dosages = this.get('dosages');
            var products = this.get('products');
            var textComplexConjunction;
            var vaType = this.get('vaType').toLowerCase();
            var summary = this.get('summary');
            var noData = "No Data";

            function getSigSummaryName() {
                var sigSummaryName;
                if (sig) {
                    sigSummaryName = sig;
                } else if (summary) {
                    sigSummaryName = summary;
                } else if (qualifiedName) {
                    sigSummaryName = qualifiedName;
                } else if (name) {
                    sigSummaryName = name;
                } else {
                    sigSummaryName = noData;
                }
                return sigSummaryName.trim();
            }

            function getProducts() {
                var outputProducts = [];
                if (products && products.length > 0) {
                    for (var i = 0; i < products.length; i++) {
                        var medicationName = products[i].suppliedName ? products[i].suppliedName.trim() : products[i].ingredientName ? products[i].ingredientName.trim() : "";
                        var volume = products[i].volume ? products[i].volume : "";
                        if (vaType === "v") {
                            if (medicationName) {
                                if (volume) {
                                    if (products.length === 1) {
                                        outputProducts.push(medicationName + " " + volume);
                                    } else if (i === products.length - 1) {
                                        outputProducts.push("in " + medicationName + " " + volume);
                                    }
                                } else {
                                    if (i === products.length - 1) {
                                        return noData;
                                    } else {
                                        outputProducts.push(medicationName);
                                    }
                                }
                            } else {
                                return noData;
                            }
                        } else {
                            if (medicationName && sig) {
                                return medicationName + " " + sig;
                            } else if (medicationName) {
                                return medicationName;
                            } else {
                                return getSigSummaryName();
                            }
                        }
                    }
                    return outputProducts;
                } else {
                    return getSigSummaryName();
                }
            }

            function getDosages() {
                var ivDosages = '';
                var complexMed = false;

                if (dosages && dosages.length > 0) {
                    for (var i = 0; i < dosages.length; i++) {

                        var routeName = dosages[i].routeName ? dosages[i].routeName + " " : "";
                        var scheduleName = dosages[i].scheduleName ? dosages[i].scheduleName + " " : " Continuous ";

                        var dose = dosages[i].dose ? dosages[i].dose : "";
                        var duration = dosages[i].duration ? dosages[i].duration + " " : "";
                        var ivRate = dosages[i].ivRate ? dosages[i].ivRate : duration ? duration : "";
                        var units = dosages[i].units ? dosages[i].units + " " : "";
                        var complexConjunction = dosages[i].complexConjunction;
                        var complexDuration = dosages[i].complexDuration ? dosages[i].complexDuration + " " : "";

                        if (vaType === "v") {
                            if (routeName && ivRate) {
                                ivDosages = routeName + ivRate + scheduleName;
                            } else {
                                ivDosages = noData;
                            }

                        } else if (complexDuration || complexMed) {
                            complexMed = true;
                            if (complexConjunction === "T") {
                                textComplexConjunction = "Then";
                            } else if (complexConjunction === "A") {
                                textComplexConjunction = "And";
                            } else if (i !== dosages.length - 1) {
                                textComplexConjunction = "Except";
                            } else {
                                textComplexConjunction = "";
                            }

                            if (dose && units && routeName && scheduleName && complexDuration && (complexConjunction === "T" || (i === dosages.length - 1))) {
                                ivDosages = ivDosages + " " + dose + units + routeName + duration + scheduleName + complexDuration + textComplexConjunction;
                            } else if (dose && units && routeName && scheduleName && !complexDuration && (complexConjunction === "T")) {
                                return sig;
                            } else if (dose && units && routeName && scheduleName || complexDuration && (complexConjunction !== "T" || (i === dosages.length - 1))) {
                                ivDosages = ivDosages + " " + dose + units + routeName + duration + scheduleName + complexDuration + textComplexConjunction;
                            } else {
                                ivDosages = ivDosages + " " + dose + units + routeName + duration + scheduleName + complexDuration + textComplexConjunction;
                            }
                        } else {
                            if (dose && units && routeName && scheduleName) {
                                ivDosages = ivDosages + dose + units + routeName + duration + scheduleName;
                            } else {
                                ivDosages = noData;
                            }
                        }
                    }
                } else {
                    ivDosages = noData;
                }
                return ivDosages;
            }

            if (vaType && vaType === "v") {
                var ivObj = {
                    products: undefined,
                    dosages: undefined
                };
                if (getProducts() === noData || getDosages() === noData) {
                    doseUnitRouteSchedule = getSigSummaryName();
                } else {
                    ivObj.products = getProducts();
                    ivObj.dosages = getDosages().trim();
                    return ivObj;
                }
            } else {
                if (getDosages() !== noData) {
                    doseUnitRouteSchedule = getDosages();
                } else {
                    doseUnitRouteSchedule = getProducts();
                }
            }
            return doseUnitRouteSchedule.trim();
        },
        userSiteIcon: function(userSiteCode) {
            if (this.get('uid')) {
                var siteCode = this.get('uid').split(':')[3];
                if (siteCode !== userSiteCode) {
                    return "fa-globe";
                }
            }
        },
        getPRN: function() {
            var sig = this.get('sig').toLowerCase();
            var scheduleName = this.get('dosages')[0].scheduleName.toLowerCase(); //needs rewriting because should not be accessing only first object need to loop
            var vaType = this.get('vaType').toLowerCase();
            if (sig && sig.indexOf("as needed") != -1 || ((scheduleName && (scheduleName.indexOf("prn") != -1) || scheduleName === "prn"))) {
                return 'PRN';
            } else if (vaType === "v") {
                return "IV";
            } else {
                return false;
            }
        },
        hasFillDetail: function(medDomainData) {
            var vaType = this.get('vaType').toLowerCase();
            var fillsAllowed = this.get('orders')[0].fillsAllowed; //needs rewriting because should not be accessing only first object need to loop
            var supply = this.get('supply');
            if (vaType === 'o' || supply) {
                return (fillsAllowed && fillsAllowed >= 0);
            } else {
                return false;
            }
        },
        getFacilityText: function() {
            var facilityCode = this.get('facilityCode');
            if (facilityCode === "500") {
                return "NCH";
            } else {
                return facilityCode || "No Data";
            }
        },
        getScheduleName: function() {
            var dosages = this.get('dosages');
            var scheduleName;
            if (dosages && dosages[0] && dosages[0].scheduleName) { //needs rewriting because should not be accessing only first object need to loop
                scheduleName = dosages[0].scheduleName;
            } else {
                scheduleName = "No Data";
            }
            return scheduleName;
        },
        getScheduleType: function() {
            var dosages = this.get('dosages');
            var scheduleType;
            if (dosages && dosages[0] && dosages[0].scheduleType) { //ok to get only first for detail view per client's request
                scheduleType = dosages[0].scheduleType;
            } else {
                scheduleType = "No Data";
            }
            return scheduleType;
        },
        getCalculatedFillsRemaining: function() {
            var orders = this.get('orders');
            var fillsRemaining;
            if (orders && orders[0] && orders[0].fillsRemaining) { //needs rewriting because should not be accessing only first object need to loop
                fillsRemaining = orders[0].fillsRemaining;
            } else {
                fillsRemaining = 0;
            }
            return fillsRemaining;
        },
        getDisplayName: function() { //there issue with this code because tests that should fail don't
            if (this.get('products') && this.get('products')[0] && this.get('products')[0].ingredientCodeName) { //needs rewriting because should not be accessing only first object need to loop
                return {
                    property: "products[].ingredientCodeName",
                    value: this.get('products')[0].ingredientCodeName.toLowerCase()
                };
            }
            var qualifiedName = this.get('qualifiedName');
            var name = this.get('name');
            if (qualifiedName) {
                return {
                    property: "qualifiedName",
                    value: qualifiedName.toLowerCase()
                };
            } else if (name) {
                return {
                    property: "name",
                    value: name.split(/[, ]+/)[0].toLowerCase()
                };
            } else {
                return {
                    property: "NoData",
                    value: "No Data"
                };
            }
        },
        getNextMedication: function(date, staticDate) {
            var now;
            if (staticDate) {
                now = staticDate.startOf('minute');
            } else {
                now = moment();
            }
            var vaType = this.get('vaType').toLowerCase();
            var vaStatus = this.get('vaStatus').toLowerCase();

            var daysSupply = parseInt(this.get('orders')[0].daysSupply);
            var lastFilledMoment = moment(this.get('lastFilled'), 'YYYYMMDDHHmm');
            var earlierStopMoment = this.getEarlierStopAsMoment();

            var fillsRemaining = parseInt(this.get('orders')[0].fillsRemaining);

            var supplyRemainForPickup = moment.duration(((daysSupply * (fillsRemaining - 1)) * 1440), "minutes");

            var supplyOnHands = lastFilledMoment.add((daysSupply * 1440), 'minutes').endOf('minutes').diff(now, "minutes");
            if (supplyOnHands < 0) supplyOnHands = 0;  // today occurs after supply on hand runs out

            var fillableFor = supplyRemainForPickup.add(supplyOnHands, "minutes");
            var fillTimeInMinutes = fillableFor.asMinutes();

            var fillText = '';
            var result = {
                display: vaStatus
            };

            if (earlierStopMoment.isValid()) {
                var earlierStopMomentMinusToday = earlierStopMoment.diff(now, 'minutes');  // time until expiration
                // (not yet expired AND expires before not fillable) OR already expired
                if ((earlierStopMomentMinusToday >= 0 && (earlierStopMomentMinusToday < fillTimeInMinutes)) || earlierStopMomentMinusToday < 0) {
                    fillTimeInMinutes = earlierStopMomentMinusToday;
                    fillableFor = moment.duration(earlierStopMomentMinusToday, 'minutes');
                }
            }

            var count;
            var durationUnitText;

            if (fillTimeInMinutes <= 0) {
                fillText = '0\'';
                durationUnitText = '0\'';
            } else if (fillTimeInMinutes > 0 && fillTimeInMinutes < 1440) {
                count = 1;
                fillText = "1d";
                durationUnitText = "1 day";
            } else if (fillTimeInMinutes >= 1440 && fillTimeInMinutes <= 86400) {
                count = parseInt(Math.round(fillableFor.asDays()));
                fillText = count + "d";
                durationUnitText = count + " day";
            } else if (fillTimeInMinutes > 86400 && fillTimeInMinutes <= 1051200) {
                count = parseInt(Math.round(fillableFor.asMonths()));
                fillText = count + "m";
                durationUnitText = count + " month";
            } else if (fillTimeInMinutes > 1051200) {
                count = parseInt(Math.round(fillableFor.asYears()));
                fillText = count + "y";
                durationUnitText = count + " year";
            }

            if (count > 1) {
                durationUnitText = durationUnitText + "s";
            }

            if (vaStatus === "expired") {
                if (date.count < 0) {
                    result.date = '??';
                    result.description = "This medication is listed as expired but expiration date has not yet passed.";
                } else {
                    result.date = date.count + date.timeUnits;
                    result.description = "This medication was expired " + date.timeSinceDescription.toLowerCase() + " ago.";
                }
                result.label = 'label label-danger';
            } else if (vaStatus === "pending") {
                result.description = "This medication is pending.";
            } else if (vaStatus === "discontinued" || vaStatus === "discontinued/edit") {
                if (this.getIsNonVA()) {
                    result.display = "Non VA - Discont.";
                    result.description = "This medication is Non VA and was discontinued " + date.timeSinceDescription.toLowerCase() + " ago.";
                } else {
                    result.display = "discontinued";
                }
                if (date.count < 0) {
                    result.date = '??';
                    result.description = "This medication is listed as discontinued but discontinue date has not yet passed.";
                } else {
                    result.date = date.count + date.timeUnits;
                    result.description = "This medication was discontinued " + date.timeSinceDescription.toLowerCase() + " ago.";
                }
                result.label = 'label label-default';
            } else if (vaStatus === "active" && (vaType === "i" || vaType === "v")) {
                result.description = "This medication is active.";
            } else if (this.getIsNonVA()) {
                result.display = "Non VA";
                result.description = "This medication is an active Non VA medication.";
            } else if (fillsRemaining === 0) {
                result.display = "0 Refills";
                result.description = "This medication is active with no refills remaining.";
                result.label = 'label label-danger';
            } else if (!lastFilledMoment.isValid() && isNaN(fillsRemaining) && _.isEmpty(this.get('fills'))) {
                result.display = "No Data";
                result.description = "This medication was not filled or missing data to determine its status.";
                result.label = 'label label-danger';
            } else {
                var daysLeft = Math.round(fillableFor.asDays());
                var hoursLeft = Math.round(fillableFor.asHours());
                if (daysLeft <= 90) {
                    result.label = 'label label-warning';
                }
                if (daysLeft <= 0 && hoursLeft <= 0) {
                    if (fillsRemaining === 1) {
                        result.description = "This medication is "+vaStatus+" and expiration date has not passed, but supply should be exhausted and the last refill has not been picked up.";
                        result.display = "Refillable";
                    } else {
                        result.description = "This medication is "+vaStatus+" but expiration date has passed.";
                        result.display = "Not Refillable";
                    }
                    result.label = 'label label-warning';
                } else {
                    result.description = "This medication is active and fillable for " + durationUnitText + ".";
                    result.display = "Fillable for ";
                    result.date = fillText;
                }
                return result;
            }
            return result;
        },
        getArialText: function(date) {
            var name = this.getDisplayName().value;
            var vaType = this.get('vaType').toLowerCase();
            var sig = this.getSig();
            if (vaType === "v") {
                var ivSig = "";
                if (sig.products) {
                    for (var i = 0; i < sig.products.length; i++) {
                        ivSig = ivSig + " " + sig.products[i];
                    }
                    if (sig.dosages) {
                        ivSig = ivSig + " " + sig.dosages;
                    }
                }
                sig = ivSig.trim();
            }
            var sigText;
            var nameText;

            function escapeRegExp(string) {
                return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            }

            function replaceAll(string, find, replace) {
                return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
            }

            if (sig && (sig !== "No Data")) {
                sigText = "with a sig value of: " + sig + ". ";
                sigText = replaceAll(sigText.toLowerCase(), 'inj', 'injection');
                sigText = replaceAll(sigText.toLowerCase(), 'soln', 'solution');
            } else {
                sigText = "with no sig provided. ";
            }

            name = replaceAll(name.toLowerCase(), 'inj', 'injection');
            name = replaceAll(name.toLowerCase(), 'soln', 'solution');

            switch (vaType) {
                case "i":
                    vaType = 'inpatient';
                    break;
                case "o":
                    vaType = 'outpatient';
                    break;
                case "v":
                    vaType = 'iv';
                    break;
                case "n":
                    vaType = 'non va';
                    break;
            }
            if (this.get('IMO') || this.get('kind') === "Medication, Clinic Order") {
                vaType = 'clinical order';
            } else if (this.get('supply')) {
                vaType = 'supply';
            }
            nameText = "You are viewing " + vaType + " medication: " + name + " " + sigText;
            return nameText + this.getNextMedication(date).description;
        },
        sliceString: function(string) {
            return string.slice(string.lastIndexOf(":") + 1);
        },
        getOrderUid: function() {
            var orders = this.get('orders');
            if (orders && orders[0] && orders[0].orderUid) { //needs rewriting because should not be accessing only first object need to loop
                return this.sliceString(this.get('orders')[0].orderUid);
            } else {
                return "No Data";
            }
        },
        getType: function() {
            var medType = {};
            if (this.get('IMO') || this.get('kind') === "Medication, Clinic Order") {
                medType.displayType = 'CLINIC ORDER MEDS';
                medType.type = 'clinical';
            } else {
                var vaType = this.get('vaType').toLowerCase();
                if (this.getIsNonVA() || vaType == 'o' || this.get('supply')) {
                    medType.displayType = 'OUTPATIENT MEDS';
                    medType.type = 'outpatient';
                } else if (vaType === 'i' || vaType == 'v') {
                    medType.displayType = 'INPATIENT MEDS';
                    medType.type = 'inpatient';
                }
            }
            return medType;
        },
        getIsNonVA: function() {
            return this.get('vaType') === 'N' || this.get('vaType') === 'n';
        },
        getFillableHeader: function() {
            var type = this.getType().type;
            return (type === "inpatient") ? "Status/Next" : "Status/Fillable";
        },
        getTooltip: function() {
            var tooltip = {};
            var medicationName = "Name of medication";
            var sig = "Name, dosage and instructions on use of the prescription";
            var outpatientFillable = 'For active medications with remaining refills, this column tells you how long until a patient will run out of valid refills (i.e. how long the medication is fillable for). This is based on the date the patient is expected to request their last refill or the expiration date, whichever is set to happen first.   For active medications with “0 refills”, “pending” medications and “non-VA” medications, you will see corresponding labels.  For expired and discontinued medications, you will see how long ago the medication order expired or was discontinued.';
            var inpatientFillable = "Prescription status (discontinued, expired) or timeframe of next dosage";

            tooltip.sig = sig;
            tooltip.medicationName = medicationName;

            if (this.getType().type === "inpatient") {
                tooltip.fillable = inpatientFillable;
            } else {
                tooltip.fillable = outpatientFillable;
            }
            return tooltip;
        },
        getOverallStartAsMoment: function() {
            if (!_.isUndefined(this.overallStartAsMoment) && !this.changed.overallStart) {
                return this.overallStartAsMoment;
            }
            this.overallStartAsMoment = moment(this.get('overallStart'), 'YYYYMMDDHHmm');
            return this.overallStartAsMoment;
        },
        getStoppedAsMoment: function() {
            if (!_.isUndefined(this.stoppedAsMoment) && !this.changed.stopped) {
                return this.stoppedAsMoment;
            }
            this.stoppedAsMoment = moment(this.get('stopped'), 'YYYYMMDDHHmm');
            return this.stoppedAsMoment;
        },
        getOverallStopAsMoment: function() {
            if (!_.isUndefined(this.overallStopAsMoment) && !this.changed.overallStop) {
                return this.overallStopAsMoment;
            }
            this.overallStopAsMoment = moment(this.get('overallStop'), 'YYYYMMDDHHmm');
            return this.overallStopAsMoment;
        },
        getEarlierStopAsMoment: function() {
            if (!_.isUndefined(this.earlierStopAsMoment) && !this.changed.overallStop && !this.changed.stopped && !this.changed.overallStart) {
                return this.earlierStopAsMoment;
            }
            var overallStop = this.getOverallStopAsMoment();
            var stopped = this.getStoppedAsMoment();
            var overallStart = this.getOverallStartAsMoment();

            if (!stopped.isValid() || !overallStop.isValid()) {
                this.earlierStopAsMoment = stopped.isValid() ? stopped : overallStop;
            } else {
                this.earlierStopAsMoment = stopped.isSame(overallStop) || stopped.isBefore(overallStop) ? stopped : overallStop;
                if (overallStart.isValid() && this.earlierStopAsMoment.isBefore(overallStart)) {
                    this.earlierStopAsMoment = this.earlierStopAsMoment === stopped ? overallStop : stopped;
                }
            }
            return this.earlierStopAsMoment;
        },
        getCanBeGraphed: function() {
            if (!_.isUndefined(this.canBeGraphed) && !this.changed.overallStart && !this.changed.overallStop && !this.changed.stopped && !this.changed.vaStatus && !this.changed.vaType) {
                return this.canBeGraphed;
            }

            var status = this.getModifiedVaStatus();
            if (status === 'pending') {
                this.canBeGraphed = true;
                return this.canBeGraphed;
            }

            var overallStart = this.getOverallStartAsMoment();
            if (!overallStart.isValid()) {
                this.canBeGraphed = false;
                return this.canBeGraphed;
            }

            var earlierStop = this.getEarlierStopAsMoment();
            this.canBeGraphed = false;
            if (status === 'active') {
                if (this.getIsNonVA() || (earlierStop.isValid() && !earlierStop.isBefore(overallStart))) {
                    this.canBeGraphed = true;
                }
            } else if (status === 'expired') {
                if ((this.getOverallStopAsMoment().isValid() && !this.getOverallStopAsMoment().isBefore(overallStart)) || this.getIsNonVA()) {
                    this.canBeGraphed = true;
                }
            } else if (status === 'discontinued') {
                var overallStop = this.getOverallStopAsMoment();
                var stopped = this.getStoppedAsMoment();
                var overallStopIsBad = this.getIsNonVA() ? false : (!overallStop.isValid() || overallStop.isBefore(overallStart));
                var badDates = (overallStopIsBad || !stopped.isValid() || stopped.isBefore(overallStart));
                if (!badDates) {
                    this.canBeGraphed = true;
                }
            }
            return this.canBeGraphed;
        },
        fallsWithinRange: function(startDate, endDate) {
            var overallStart = moment(this.get('overallStart'), 'YYYYMMDD');

            if (this.getIsNonVA() && this.getModifiedVaStatus() == 'active' && !endDate.isBefore(overallStart)) {
                return true;
            }

            var stopped = this.getEarlierStopAsMoment();
            if (!overallStart.isValid() || !stopped.isValid()) {
                return resultFromInvalidStartOrStop(overallStart, stopped);
            }

            // At this point we know we have a valid overallStart and a valid stopped
            var overallStartIsOnOrBeforeEnd = overallStart.isSame(endDate) || overallStart.isBefore(endDate);
            var stoppedIsOnOrAfterStart = stopped.isSame(startDate) || stopped.isAfter(startDate);
            if (overallStartIsOnOrBeforeEnd && stoppedIsOnOrAfterStart) {
                return true;
            }

            // At this point, we know that start/stop are out of the range, and
            // we only need to continue if start/stop are before the range
            if (overallStart.isAfter(endDate) && stopped.isAfter(endDate)) {
                return false;
            }

            // Now we know that start/stop are before the range, but we only
            // need to continue if stop is "close" to the range
            var durationConsideredClose = moment.duration(6, "months").add(15, 'days');
            var stoppedIsCloseToRange = moment(stopped).add(durationConsideredClose).isAfter(startDate);
            if (!stoppedIsCloseToRange) {
                return false;
            }
            return fillsOrAdminsExtendIntoRange(this);


            function resultFromInvalidStartOrStop(start, stop) {
                if (stop.isValid()) {
                    var stopIsBeforeRange = !stop.isSame(startDate) && !stop.isAfter(startDate);
                    if (stopIsBeforeRange) {
                        // we can't be confident about start, but we are confident stop before the range
                        return false;
                    }
                }
                if (start.isValid()) {
                    var startIsAfterRange = !start.isSame(endDate) && !start.isBefore(endDate);
                    if (startIsAfterRange) {
                        // we can't be confident about stop, but we are confident start is after the range
                        return false;
                    }
                }
                // Either both stop and start are invalid OR
                // stoppedIsAfterStart OR
                // startIsBeforeEnd so
                // we'll conservatively say it's within range
                return true;
            } // end local function resultFromInvalidStartOrStop()

            function fillsOrAdminsExtendIntoRange(medOrder) {
                var latestFillOrAdmin;
                var latestDateToConsider;
                if (medOrder.get('fills') && medOrder.get('fills').length > 0) {
                    var fills = medOrder.get('fills').sort(sortFills);
                    var latestFill = _.last(fills);

                    latestFillOrAdmin = latestFill.releaseDate || latestFill.dispenseDate;
                    latestFillOrAdmin = moment(latestFillOrAdmin, 'YYYYMMDD');
                    var daysSupplyDispensed = latestFill.daysSupplyDispensed;
                    if (!_.isNumber(daysSupplyDispensed)) {
                        daysSupplyDispensed = Number(daysSupplyDispensed) || 0;
                    }
                    latestDateToConsider = moment(latestFillOrAdmin).add(daysSupplyDispensed, 'days');
                } else if (medOrder.get('lastAdmin')) {
                    latestFillOrAdmin = moment(medOrder.get('lastAdmin'), 'YYYYMMDD');
                    latestDateToConsider = moment(latestFillOrAdmin);
                }

                if (!latestFillOrAdmin || !latestFillOrAdmin.isValid()) {
                    return false;
                }
                var latestFillOrAdminIsBeforeEnd = (latestFillOrAdmin.isSame(endDate) || latestFillOrAdmin.isBefore(endDate));
                var latestDateToConsiderIsAfterStart = (latestDateToConsider.isSame(startDate) || latestDateToConsider.isAfter(startDate));
                var latestDatesSpanRange = (latestFillOrAdminIsBeforeEnd && latestDateToConsiderIsAfterStart);
                if (latestDatesSpanRange) {
                    return true;
                }
                return false;
            } // end local function fillsOrAdminsExtendIntoRange()

            function sortFills(refillA, refillB) {
                var dateA = refillA.releaseDate || refillA.dispenseDate;
                var dateB = refillB.releaseDate || refillB.dispenseDate;
                var momentA = moment(dateA, 'YYYYMMDD');
                var momentB = moment(dateB, 'YYYYMMDD');
                if (momentA.isSame(momentB)) {
                    return 0;
                }
                if (momentA.isAfter(momentB)) {
                    return 1;
                }
                if (momentA.isBefore(momentB)) {
                    return -1;
                }
            } // end local function sortFills()
        },
        getModifiedName: function() {
            var name = this.getDisplayName().value;
            var n = name.search(/,|[0-9]/);
            if (n > 0) {
                name = name.substr(0, n);
            }
            n = name.search(" tab");
            if (n != -1) {
                name = name.substr(0, n);
            }
            n = name.search(" cap");
            if (n != -1) {
                name = name.substr(0, n);
            }
            n = name.search(" inj");
            if (n != -1) {
                name = name.substr(0, n);
            }
            n = name.search(" soln");
            if (n != -1) {
                name = name.substr(0, n);
            }
            n = name.search(" aerosol");
            if (n != -1) {
                name = name.substr(0, n);
            }
            n = name.search(" drip");
            if (n != -1) {
                name = name.substr(0, n);
            }
            n = name.search(" oral");
            if (n != -1) {
                name = name.substr(0, n);
            }

            // remove spaces from medication
            while (name.search(" ") != -1) {
                name = name.replace(" ", "%20");
            }
            return name;
        },
        activeRegionsOverlap: function(otherOrder) {
            if (this.getModifiedVaStatus() === 'pending' || otherOrder.getModifiedVaStatus() === 'pending') {
                return true;
            }
            if (this.getOverallStartAsMoment().isSame(otherOrder.getOverallStartAsMoment())) {
                return true;
            }
            var otherIsEarlier = (otherOrder.getOverallStartAsMoment().isBefore(this.getOverallStartAsMoment()));
            var earlier = otherIsEarlier ? otherOrder : this;
            if (earlier.getIsNonVA() && earlier.getModifiedVaStatus() === 'active') {
                return true;
            }
            var later = otherIsEarlier ? this : otherOrder;
            return earlier.getEarlierStopAsMoment().isAfter(later.getOverallStartAsMoment());
        }
    });
});
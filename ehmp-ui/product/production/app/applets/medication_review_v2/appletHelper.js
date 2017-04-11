define([
    'backbone',
    'marionette',
    'underscore',
    'moment'
], function(Backbone, Marionette, _, moment) {
    'use strict';
    var appletHelper = {
        setStopped: function(medDomainData) {
            if (medDomainData.stopped === undefined) {
                var dateModel = ADK.SessionStorage.getModel('globalDate');
                var newDuration = moment.duration({
                    'months': 6
                });
                var endTime;
                if (dateModel.get('selectedId') === "allRangeGlobal") {
                    endTime = moment().add(newDuration).format('YYYYMMDDHHmm');
                } else {
                    endTime = moment(dateModel.get('toDate'), "MM/DD/YYYY").format('YYYYMMDDHHmm');
                }
                medDomainData.stopped = endTime;
            }
            return medDomainData;
        },
        getGraphTextInfo: function(models) {
            if (models.length === 0) {
                return "";
            }
            var numberOfFacilites = models.length;
            var medOrderInfo = "";
            var startDate = moment(models[0].get('firstFacilityMed').get('graphRelativeityOldestTime')).format("MMMM, DD, YYYY");
            var endDate = moment(models[0].get('firstFacilityMed').get('graphRelativeityNewestTime')).format("MMMM, DD, YYYY");

            var totalMedCount = 0;
            _.each(models, function(model) {
                var facility = model.get('facilityName');
                var numberOfMedOrdersInFacility = model.get('facilityMeds').models.length;
                var orderText = 'order';
                totalMedCount += numberOfMedOrdersInFacility;
                if (numberOfMedOrdersInFacility !== 1) {
                    orderText = orderText + "s";
                }
                medOrderInfo = medOrderInfo + numberOfMedOrdersInFacility + " medication " + orderText + " in " + facility + ". ";
            });
            medOrderInfo = "with overlapping orders from " + numberOfFacilites + " facilities. " + medOrderInfo;
            if (numberOfFacilites === 1) {
                medOrderInfo = "with " + totalMedCount + " orders. ";
            }
            var dateRangeText = "The Graph Shows Order history from " + startDate + " to " + endDate + " ";
            return dateRangeText + medOrderInfo;
        },
        isPRN: function(medDomainData) {
            if (medDomainData.sig && medDomainData.sig.toString().toUpperCase().indexOf("AS NEEDED") != -1) {
                return true;
            } else if (medDomainData.scheduleName && medDomainData.scheduleName.toString() == "PRN") {
                return true;
            } else if (medDomainData.scheduleName && medDomainData.scheduleName.toString().indexOf("PRN") != -1) {
                return true;
            } else {
                return false;
            }
        },

        hasFillDetail: function(medDomainData) {
            if (medDomainData.vaType == "O" || medDomainData.supply) {
                if (medDomainData.orders[0].fillsAllowed) {
                    return true;
                } else return false;
            } else {
                return false;
            }
        },

        hasScheduledTimes: function(medDomainData) {
            if (medDomainData.vaType == "I") {
                return true; //more logic will go into this once we know more about adminitrations
            }
            return false;
        },
        hasDailyDoseInfo: function(medDomainData) {
            if (medDomainData.scheduleFreq) {
                if (medDomainData.dose) {
                    if (medDomainData.vaType == "O" || medDomainData.vaType == "N") {
                        return true;
                    } else return false;
                } else return false;
            }
            return false;
        },

        getDailyOrScheduledDosePrefix: function(medDomainData) {
            if (this.hasScheduledTimes(medDomainData)) {
                return "Scheduled Times";
            }
            if (this.hasDailyDoseInfo(medDomainData)) {
                return "Total Daily";
            } else {
                return false;
            }
        },
        getID: function(medDomainData) {
            return medDomainData.uid.replace(/[:|.]/g, "_");
        },
        isNotUserSiteMed: function(medDomainData) {
            var parsedUID = medDomainData.uid.split(':');
            var userSiteCode = ADK.UserService.getUserSession().get('site');
            var medSiteCode = parsedUID[3];
            if (userSiteCode !== medSiteCode) {

                medDomainData.isNotUserSiteMed = true;
            }
            return medDomainData;
        },
        getDailyOrScheduledDose: function(medDomainData) {
            if (this.hasScheduledTimes(medDomainData)) {
                return "No Data";
            } else if (this.hasDailyDoseInfo(medDomainData)) {
                return 1440 / medDomainData.scheduleFreq * parseInt(medDomainData.dose) + " " + medDomainData.units;
            } else {
                return false;
            }
        },
        getExpirationLabel: function(medDomainData) {
            if (medDomainData.vaStatus) {
                switch (medDomainData.vaStatus.toUpperCase()) {
                    case "PENDING":
                        return ""; //is this what we should put here? FYI, 9E7A;164 has Pending meds.
                    case "ACTIVE":
                        return "Expires";
                    case "SUSPEND":
                        return "Ordered";
                    case "HOLD":
                        return "Ordered";
                    case "EXPIRED":
                        return "Expired";
                    case "UNRELEASED":
                        return "";
                    case "DISCONTINUED":
                        return "Discontinued";
                    case "DISCONTINUED/EDIT":
                        return "Discontinued";
                    default:
                        // return "Add a new case to expirationLabel";
                        return "";
                }
            } else {
                return "";
            }
        },
        getFormattedLastAction: function(medDomainData) {
            return ADK.utils.getTimeSince(medDomainData.lastAction, true);
        },
        getLastDatePrefix: function(medDomainData) {
            if (medDomainData.vaType == "N") {
                return false;
            } else if (medDomainData.vaType == "I") {
                return "Last admin";
            } //add clinic orders to the if statement
            else if (medDomainData.lastFilled || medDomainData.supply) {
                return "Last filled";
            } else {
                return false;
            }
        },

        getLastDate: function(medDomainData) {
            if (medDomainData.vaType == "N") {
                return "";
            }
            if (medDomainData.vaType == "I") { //add clinic orders
                return medDomainData.lastAdmin;
            } else if (medDomainData.vaType == "O" || medDomainData.supply) {
                return medDomainData.lastFilled;
            } else {
                return "";
            }
        },

        getLastFillStyle: function(medDomainData) {
            if (!this.hasFillDetail(medDomainData)) {
                return "";
            } else if (medDomainData.orders[0].fillsRemaining === 0) {
                return "noFillsRemain";
            } else if (medDomainData.orders[0].fillsRemaining <= 3) {
                return "fewFillsRemain";
            } else {
                return "";
            }
        },

        getLastFillDetails: function(medDomainData) {
            if (medDomainData.vaType == "O" && !medDomainData.supply) {
                if (this.hasFillDetail(medDomainData)) {
                    return medDomainData.orders[0].fillsRemaining + " Refills (" + medDomainData.orders[0].daysSupply + " days each)";
                } else {
                    return "";
                }
            } else {
                return "";
            }
        },

        getPickUpType: function(medDomainData) {
            if (medDomainData.routing == "W") {
                return "Window";
            }
            if (medDomainData.routing == "M") {
                return "Mail";
            } else return false;
        },

        getStandarizedFacilityCode: function(medDomainData) {
            if (medDomainData.facilityCode == "DOD") {
                return "DOD";
            }
            if (medDomainData.facilityCode == "500") {
                return "NCH";
            } else {
                return "";
            }
        },

        getStandardizedVaStatus: function(medDomainData) {
            var standardizedStatus;
            if (medDomainData.vaStatus) {
                standardizedStatus = medDomainData.vaStatus.toUpperCase();
                if (standardizedStatus == "DISCONTINUED/EDIT") {
                    standardizedStatus = "DISCONTINUED";
                }
                return standardizedStatus;
            } else {
                return "";
            }
        },

        getSubcategory: function(medDomainData) {
            if (this.isPRN(medDomainData)) {
                return "PRN";
            } else if (medDomainData.vaType == "V") {
                return "IV";
            } else {
                return false;
            }
        },
        getFirstGroupByValue: function(medDomainData) {
            //return outpatient if supplies or clinical Orders
            if (medDomainData.supply) {
                return 'Outpatient';

            } else if (medDomainData.IMO || medDomainData.kind === 'Medication, Clinic Order') {

                return 'Clinic_Order';
            }

            var checkType = medDomainData.vaType;
            switch (checkType.toUpperCase()) {
                case 'O':
                    return 'Outpatient';
                case 'N':
                    return 'Outpatient';
                case 'I':
                    return 'Inpatient';
                case 'V':
                    return 'Inpatient';
            }
        },
        getSummaryViewDate: function(medDomainData) {
            var endStatus = this.getExpirationLabel(medDomainData);
            if (endStatus) {
                switch (endStatus) {
                    case "Expired":
                        return medDomainData.overallStop; //should this be overallStop or stopped?
                    case "Expires":
                        return medDomainData.overallStop;
                    case "Discontinued":
                        return medDomainData.stopped;
                    case "Ordered":
                        return medDomainData.orders[0].ordered;
                    default:
                        return false; //if it is Pending or Unreleased, do not return a date
                }
            } else {
                return false;
            }
        },
        getNextAdminStatus: function(medDomainData) {
            var vaStatus = medDomainData.standardizedVaStatus.toLowerCase();
            var fillableStatus;
            if (vaStatus === "expired") {
                return "Expired";
            } else if (vaStatus === "discontinued") {
                return "Discontinued";
            } else if (vaStatus === "pending") {
                return "Pending";
            } else if (vaStatus === "active") {
                return "Active";
            }
        },
        getNextAdminData: function(medDomainData) {
            var result = {
                display: medDomainData.nextAdminStatus
            };
            if (medDomainData.nextAdminStatus === "Expired") {
                var expired = ADK.utils.getTimeSince(medDomainData.stopped, true);
                result.date = expired.count + expired.timeUnits;
                result.description = "This medication was expired " + expired.timeSinceDescription + " ago. ";
                result.label = 'label label-danger';
                result.hasLabel = true;
            } else if (medDomainData.nextAdminStatus === "Discontinued") {
                var discontinued = ADK.utils.getTimeSince(medDomainData.stopped, true);
                result.date = discontinued.count + discontinued.timeUnits;
                result.description = "This medication was discontinued " + discontinued.timeSinceDescription + " ago. ";
                result.label = 'label label-default';
                result.hasLabel = true;
            } else if (status === "Pending") {
                result.description = "This medication is Pending. ";
            } else if (medDomainData.nextAdminStatus === 'Active') {
                result.description = "This medication is Active. ";
            }
            return result;
        },
        getFillableStatus: function(medDomainData) {
            var vaStatus = medDomainData.standardizedVaStatus.toLowerCase();
            var fillableStatus;
            if (vaStatus === "expired") {
                return "Expired";

            } else if (vaStatus === "discontinued") {
                return (medDomainData.vaType === 'N') ? "Non VA - Discont." : "Discontinued";

            } else if (vaStatus === "pending") {
                return "Pending";

            } else if (medDomainData.vaType === 'N') {
                return "Non VA";

            } else if (medDomainData.fillsRemaining === 0) {
                return "0 Refills";
            }

            return "Fillable for"; //nothing to display
        },
        getLastFill: function(medDomainData) {
            if (_.isUndefined(medDomainData.lastFilled)) {
                if (medDomainData.fills.length > 0) {
                    if (medDomainData.fills.length > 1) _.sortBy(medDomainData.fills, function(d) {
                        return d.dispenseDate;
                    }).reverse();
                    return medDomainData.fills[0].dispenseDate;
                } else {
                    return 'none';
                }
            } else {
                return medDomainData.lastFilled;
            }
        },
        getCalculatedFillsRemaining: function(medDomainData) {
            if (medDomainData.facilityName.toUpperCase() === "DOD") {}
            if (medDomainData.fillsRemaining !== undefined) {
                return parseInt(medDomainData.fillsRemaining);
            } else if (medDomainData.fillsRemaining === undefined) {

                if (medDomainData.orders[0].fillsRemaining !== undefined) {
                    return parseInt(medDomainData.orders[0].fillsRemaining);
                } else {
                    return 0;
                }
            }
        },
        getFillableData: function(medDomainData) {
            var stopped = medDomainData.stopped || "none";
            var daysSupply = medDomainData.daysSupply || medDomainData.orders[0].daysSupply;
            var lastFilled = appletHelper.getLastFill(medDomainData);
            var fillsRemaining = medDomainData.fillsRemaining;

            var status = medDomainData.fillableStatus;
            var result = {
                display: status,
                hasLabel: false
            };
            if (status !== "Fillable for") {

                if (status === "Expired") {
                    //need to replace this with moment() to remove dependency on ADK in unit tests
                    var expired = ADK.utils.getTimeSince(stopped, true);
                    result.description = "This medication was expired " + expired.timeSinceDescription + " ago. ";
                    result.date = expired.count + expired.timeUnits;
                    result.label = 'label label-danger';
                    result.hasLabel = true;
                    return result;
                } else if (status === "0 Refills") {
                    result.description = "This medication is active with no refills remaining. ";
                    result.label = 'label label-danger';
                    result.hasLabel = true;
                    return result;
                } else if (status === "Discontinued" || status === "Non VA - Discont.") {
                    //need to replace this with moment() to remove dependency on ADK in unit tests
                    var discontinued = ADK.utils.getTimeSince(stopped, true);
                    result.description = "This medication was discontinued " + discontinued.timeSinceDescription + " ago. ";
                    if (status === "Non VA - Discont.") {
                        result.description = "This medication is Non VA and was discontinued " + discontinued.timeSinceDescription + " ago. ";
                    }
                    result.date = discontinued.count + discontinued.timeUnits;
                    result.label = 'label label-default';
                    result.hasLabel = true;
                    return result;
                } else if (status === "Pending") {
                    result.description = "This medication is Pending. ";
                    return result;
                } else if (status === "Non VA") {
                    var vaStatus = medDomainData.standardizedVaStatus.toLowerCase();
                    result.description = "This medication is an Active Non VA medication. ";
                    return result;
                } else {
                    return result;
                }
            }

            var today = moment();
            var lastFilledMoment = moment(lastFilled, 'YYYYMMDDHHmm');
            var minutesSupply = daysSupply * 1440;

            var lastFilledMinusToday = lastFilledMoment.diff(today, 'minutes');

            var fillableTimeMinutes = (minutesSupply * (fillsRemaining - 1)) + Math.max((lastFilledMinusToday + minutesSupply), 0);

            //if (expirationDate - today) is less than fillableTimeMinutes, report the lower of the two values
            var expirationDateMoment = moment(medDomainData.expirationDate, 'YYYYMMDDHHmm');
            if (expirationDateMoment.isValid()) {
                var expirationDateMinusToday = expirationDateMoment.diff(today, 'minutes');
                if (((expirationDateMinusToday >= 0) && (expirationDateMinusToday < fillableTimeMinutes)) || expirationDateMinusToday < 0) {
                    fillableTimeMinutes = expirationDateMinusToday;
                }
            }

            var fillableTimeDuration = moment.duration(fillableTimeMinutes, 'minutes');

            //display minutes, hours, months, or years as described in the "Time Annotations" section of the F338 Feature Spec
            var fillableTimeString = '';

            if (fillableTimeMinutes < 60) {
                fillableTimeString = fillableTimeMinutes + '\'';
            } else if (fillableTimeMinutes >= 60 && fillableTimeMinutes < 2880) {
                fillableTimeString = parseInt(fillableTimeDuration.asHours()) + 'h';
            } else if (fillableTimeMinutes >= 2880 && fillableTimeMinutes <= 86400) {
                fillableTimeString = parseInt(fillableTimeDuration.asDays()) + 'd';
            } else if (fillableTimeMinutes > 86400 && fillableTimeMinutes <= 1051200) {
                fillableTimeString = parseInt(fillableTimeDuration.asMonths()) + 'm';
            } else if (fillableTimeMinutes > 1051200) {
                fillableTimeString = parseInt(fillableTimeDuration.asYears()) + 'y';
            }

            //result: {date, description, label, hasLabel}
            result.description = "This medication is Active and fillable for " + fillableTimeString + ". ";
            result.date = fillableTimeString;

            // If no time left, danger label.  If less than 90 days left, warning label
            var fillableTimeDays = fillableTimeMinutes / 1440;
            if (status === 'Fillable for' && fillableTimeDays <= 90) {
                result.label = 'label label-warning';
                result.hasLabel = true;
            }
            if (fillableTimeDays <= 0) {
                result.description = "This medication is "+medDomainData.vaStatus.toLowerCase()+" but expiration date has passed.";
                result.display = "Not Refillable";
                result.label = 'label label-warning';
            } else {
                result.description = "This medication is Active and fillable for " + fillableTimeString + ". ";
                result.date = fillableTimeString;
            }
            return result;
        },
        getIsActiveNonVA: function(medDomainData) {
            if (medDomainData.vaType.toUpperCase() === "N" && medDomainData.standardizedVaStatus.toUpperCase() === "ACTIVE") {
                medDomainData.isActiveNonVA = true;
            }
            return medDomainData;
        },
        setMedCategory: function(medDomainData) {
            if (medDomainData.firstGroupByValue === "Inpatient") {
                medDomainData.CategoryInpatient = true;
            } else {
                medDomainData.CategoryOutpatient = true;
            }
            return medDomainData;
        },
        getGroupByName: function(medDomainData) {
            var groupbyValue;
            if (this.hasIngrediantCodeName(medDomainData)) {
                return medDomainData.products[0].ingredientCodeName.toLowerCase();
            } else if (medDomainData.qualifiedName) {
                return medDomainData.qualifiedName.toLowerCase();
            } else if( medDomainData.name) {
                //get the first word from 'name' with no commas or spaces
                groupbyValue = medDomainData.name.split(",")[0];
                return groupbyValue.split(" ")[0].toLowerCase();
            } else if(medDomainData.productFormName){
                groupbyValue = medDomainData.productFormName.split(",")[0];
                return groupbyValue.split(" ")[0].toLowerCase();

            } else {
                groupbyValue = medDomainData.normalizedName.split(",")[0];
                return groupbyValue.split(" ")[0].toLowerCase();
            }
        },
        hasIngrediantCodeName: function(medDomainData) {
            var hasCodeName = (medDomainData.products && medDomainData.products[0] && medDomainData.products[0].ingredientCodeName);
            return hasCodeName;
        },
        getGroupByValue: function(medDomainData) {
            var groupbyValue;
            //this.hasIngrediantCode(medDomainData);
            if (this.hasIngrediantCodeName(medDomainData)) {

                return medDomainData.products[0].ingredientCodeName;

            } else if (medDomainData.qualifiedName) {
                return medDomainData.qualifiedName;
            } else if( medDomainData.name) {
                //get the first word from 'name' with no commas or spaces
                groupbyValue = medDomainData.name.split(",")[0];
                return groupbyValue.split(" ")[0].toLowerCase();
            } else if(medDomainData.productFormName){
                groupbyValue = medDomainData.productFormName.split(",")[0];
                return groupbyValue.split(" ")[0].toLowerCase();

            } else {
                groupbyValue = medDomainData.normalizedName.split(",")[0];
                return groupbyValue.split(" ")[0].toLowerCase();
            }
        },
        getGroupByField: function(medDomainData) {
            if (this.hasIngrediantCodeName(medDomainData)) {
                return "products[].ingredientCodeName";

            } else if (medDomainData.qualifiedName) {
                return 'qualifiedName';
            } else {
                return 'name';
            }
        },
        getAriaLabelText: function(medDomainData) {
            var medClass = medDomainData.firstGroupByValue.toLowerCase();

            function escapeRegExp(string) {
                return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            }

            function replaceAll(string, find, replace) {
                return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
            }

            var name = medDomainData.displayName;
            var type = medDomainData.vaType;
            switch (type.toUpperCase()) {
                case "I":
                    type = 'Inpatient';
                    break;
                case "O":
                    type = 'Outpatient';
                    break;
                case "V":
                    type = 'IV';
                    break;
                case "N":
                    type = 'Non V.A.';
                    break;
            }
            if (medDomainData.IMO) {
                type = 'Clinical Order';
            } else if (medDomainData.supply) {
                type = 'Supply';
            }
            var sigText = "a Sig value of: " + medDomainData.doseUnitRouteSchedule + ". ";
            if (medDomainData.doseUnitRouteSchedule === undefined || medDomainData.doseUnitRouteSchedule === "" || medDomainData.doseUnitRouteSchedule === null) {
                sigText = "no Sig provided. ";
            }

            sigText = replaceAll(sigText.toLowerCase(), 'inj', 'injection');
            sigText = replaceAll(sigText.toLowerCase(), 'soln', 'solution');
            name = replaceAll(name.toLowerCase(), 'inj', 'injection');
            name = replaceAll(name.toLowerCase(), 'soln', 'solution');

            var nameText = "You are viewing " + type + " medication: " + name + " with " + sigText;
            var lastChange = "The Last change for this medication: " + medDomainData.lastActionDetails.timeSinceDescription + ". ";
            var fillableOrNext = medDomainData.fillableDays.description;
            if (medClass === 'inpatient') {
                fillableOrNext = medDomainData.nextAdminData.description;
            }
            return nameText + fillableOrNext; // + lastChange;

        },
        getSig: function(medDomainData) {

            var doseUnitRouteSchedule = "";
            var sig = "";
            var strength = "";
            var productFormName = "";
            var ivRate = '';
            if (medDomainData.strength !== undefined) {
                strength = medDomainData.strength;
            }
            if (medDomainData.productFormName !== undefined) {
                productFormName = medDomainData.productFormName;
            }
            if (medDomainData.sig !== undefined) {
                sig = medDomainData.sig;
            }

            var textSig = strength + " " + productFormName + " " + sig;

            if (medDomainData.dosages !== undefined) {
                for (var n = 0; n < medDomainData.dosages.length; n++) {
                    if (medDomainData.dosages[n].dose !== undefined && medDomainData.dosages[n].dose !== "" && medDomainData.dosages[n].units !== undefined && medDomainData.dosages[n].routeName !== undefined && medDomainData.dosages[n].scheduleName !== undefined && medDomainData.dosages[n].complexConjunction !== undefined && medDomainData.dosages[n].complexDuration !== undefined) {
                        var complexDuration = " ";
                        var complexConjunction = medDomainData.dosages[n].complexConjunction;
                        var textComplexConjunction = " ";
                        if (complexConjunction) {
                            if (complexConjunction === "T") {
                                textComplexConjunction = "Then";
                            } else if (complexConjunction === "A") {
                                textComplexConjunction = "And";
                            } else {
                                textComplexConjunction = "Except";
                            }
                        }
                        doseUnitRouteSchedule = doseUnitRouteSchedule + " " + medDomainData.dosages[n].dose + "" + medDomainData.dosages[n].units + " " + medDomainData.dosages[n].routeName + " " + medDomainData.dosages[n].scheduleName + " " + medDomainData.dosages[n].complexDuration + " " + textComplexConjunction;
                    } else if (medDomainData.dosages[n].dose !== undefined && medDomainData.dosages[n].dose !== "" && medDomainData.dosages[n].units !== undefined && medDomainData.dosages[n].routeName !== undefined && medDomainData.dosages[n].scheduleName !== undefined) {
                        doseUnitRouteSchedule = doseUnitRouteSchedule + " " + medDomainData.dosages[n].dose + "" + medDomainData.dosages[n].units + " " + medDomainData.dosages[n].routeName + " " + medDomainData.dosages[n].scheduleName;
                    } else if (medDomainData.dosages[n].ivRate !== undefined && medDomainData.dosages[n].ivRate.length > 0) {
                        doseUnitRouteSchedule = medDomainData.dosages[n].ivRate;
                    } else if (medDomainData.dosages[n].duration !== undefined && medDomainData.dosages[n].duration.length > 0) {
                        doseUnitRouteSchedule = medDomainData.dosages[n].duration;
                    } else {
                        doseUnitRouteSchedule = textSig;
                    }
                }
            } else {
                doseUnitRouteSchedule = textSig;
            }

            doseUnitRouteSchedule = doseUnitRouteSchedule.trim();

            return doseUnitRouteSchedule;
        },
        sliceString: function(s) {
            return s.slice(s.lastIndexOf(":") + 1, -1);
        },

        sortCollection: function(collection, key1, key2, sortType, ascending) {
            if (sortType) {
                // Checking collection models to see if they have the specified key
                var hasKey1 = false;
                if (collection.at(0).attributes[key1]) {
                    hasKey1 = true;
                } else if (collection.at(collection.length - 1).attributes[key1]) {
                    hasKey1 = true;
                } else {
                    for (var i = 1, collectionLength1 = collection.length; i < collectionLength1 - 1; i++) {
                        if (collection.at(i).attributes[key1]) {
                            hasKey1 = true;
                            break;
                        }
                    }
                }
                var hasKey2 = false;
                if (collection.at(0).attributes[key2]) {
                    hasKey2 = true;
                } else if (collection.at(collection.length - 1).attributes[key2]) {
                    hasKey2 = true;
                } else {
                    for (var j = 1, collectionLength2 = collection.length; j < collectionLength2 - 1; j++) {
                        if (collection.at(j).attributes[key2]) {
                            hasKey2 = true;
                            break;
                        }
                    }
                }
                if (hasKey1) {
                    collection.comparator = function(item1, item2) {
                        var ascendingToggle;
                        if (ascending) {
                            ascendingToggle = 1;
                        } else {
                            ascendingToggle = -1;
                        }
                        var item1val1 = item1.get(key1);
                        var item2val1 = item2.get(key1);
                        var item1val2 = item1.get(key2);
                        var item2val2 = item2.get(key2);

                        if (sortType === "alphanumerical" || sortType === "numeric" || sortType === "date" || sortType === "alphabetical") {
                            if (item1val1 === item2val1) {
                                if (hasKey2) {
                                    if (item1val2 > item2val2 || item2val2 === undefined) {
                                        return -1;
                                    } else if (item1val2 < item2val2) {
                                        return 1;
                                    }
                                }
                                return 0;
                            } else if ((item1val1 < item2val1) || (item2val1 === undefined)) {
                                return -1 * ascendingToggle;
                            } else {
                                return 1 * ascendingToggle;
                            }
                        }
                    };
                    collection.sort();
                }

            }
        },

        parseMedResponse: function(response) {
            var groupType;
            if (response.supply !== undefined) {
                response.groupType = "Supplies";
            } else if (response.IMO !== undefined) {
                response.groupType = "Clinic Orders";
            } else {
                response.groupType = response.vaType;
                if (response.groupType == "V") {
                    response.groupType = "I";
                }
            }
            if (response.name !== undefined) {
                response.name = response.name.toLowerCase();
            }
            if (response.products !== undefined && response.products[0] !== undefined) {
                if (response.products[0].ingredientName !== undefined) {
                    response.ingredientName = response.products[0].ingredientName;
                }
                if (response.products[0].strength !== undefined) {
                    response.strength = response.products[0].strength;
                }
            }
            if (response.dosages !== undefined && response.dosages[0] !== undefined) {
                if (response.dosages[0].dose !== undefined) {
                    response.dose = response.dosages[0].dose;
                }
                if (response.dosages[0].units !== undefined) {
                    response.dosagesUnits = response.dosages[0].units;
                }
                if (response.dosages[0].routeName !== undefined) {
                    response.routeName = response.dosages[0].routeName;
                }
                if (response.dosages[0].scheduleName !== undefined) {
                    response.scheduleName = response.dosages[0].scheduleName;
                }
                if (response.dosages[0].start !== undefined) {
                    response.start = response.dosages[0].start;
                }
                if (response.dosages[0].scheduleFreq !== undefined) {
                    response.scheduleFreq = response.dosages[0].scheduleFreq;
                }
                if (response.dosages[0].scheduleType !== undefined) {
                    response.scheduleType = response.dosages[0].scheduleType;
                }
                if (response.dosages[0].instructions !== undefined) {
                    response.instructions = response.dosages[0].instructions;
                }
            }

            if (response.orders !== undefined && response.orders[0] !== undefined) {
                if (response.orders[0].fillsAllowed !== undefined) {
                    response.fillsAllowed = response.orders[0].fillsAllowed;
                }
                if (response.orders[0].daysSupply !== undefined) {
                    response.daysSupply = response.orders[0].daysSupply;
                }
                if (response.orders[0].orderUid !== undefined) {
                    response.orderUid = this.sliceString(" \"" + response.orders[0].orderUid + " \"");
                }
                if (response.orders[0].fillsRemaining !== undefined) {
                    response.fillsRemaining = response.orders[0].fillsRemaining;
                }

            }
            if (response.fills !== undefined && response.fills[0] !== undefined) {
                if (response.fills[0].dispenseDate) {
                    response.dispenseDate = response.fills[0].dispenseDate;
                    response.routing = response.fills[0].routing;
                }
            }
            if (response.medStatusName !== undefined) {
                response.medStatusName = response.medStatusName.toUpperCase();
            }

            if (response.uid !== undefined) {
                try {
                    response.detailId = (response.uid).replace(/[:|.]/g, "_");
                } catch (err) {}
            }
            response = appletHelper.isNotUserSiteMed(response);
            response.id = appletHelper.getID(response);
            response.fillsRemaining = appletHelper.getCalculatedFillsRemaining(response);
            response.dailyOrScheduledDosePrefix = appletHelper.getDailyOrScheduledDosePrefix(response);
            response.dailyOrScheduledDose = appletHelper.getDailyOrScheduledDose(response);
            response.summaryViewDate = appletHelper.getSummaryViewDate(response);
            response.expirationLabel = appletHelper.getExpirationLabel(response);
            response.lastDate = appletHelper.getLastDate(response);
            response.lastDatePrefix = appletHelper.getLastDatePrefix(response);
            response.lastFillStyle = appletHelper.getLastFillStyle(response);
            response.lastFillDetails = appletHelper.getLastFillDetails(response);
            response.pickUpType = appletHelper.getPickUpType(response);
            response.standardizedFacilityCode = appletHelper.getStandarizedFacilityCode(response);
            response.standardizedVaStatus = appletHelper.getStandardizedVaStatus(response);
            response = appletHelper.setStopped(response);
            response.subcategory = appletHelper.getSubcategory(response);
            response.firstGroupByValue = appletHelper.getFirstGroupByValue(response);
            response.genericMedClass = appletHelper.getFirstGroupByValue(response).toLowerCase();
            response.fillableStatus = appletHelper.getFillableStatus(response);
            response.fillableDays = appletHelper.getFillableData(response);
            response.nextAdminStatus = appletHelper.getNextAdminStatus(response);
            response.nextAdminData = appletHelper.getNextAdminData(response);
            response.lastActionDetails = appletHelper.getFormattedLastAction(response);
            response.doseUnitRouteSchedule = appletHelper.getSig(response);

            /* create groupByField */
            response.groupbyField = appletHelper.getGroupByField(response);
            response.groupbyValue = appletHelper.getGroupByValue(response);
            if (response.facilityName) {
                response.groupbyFacility = response.facilityName;
            }
            response.displayName = appletHelper.getGroupByName(response);
            response.ariaLabelText = appletHelper.getAriaLabelText(response);
            response = appletHelper.getIsActiveNonVA(response);
            response = appletHelper.setMedCategory(response);

            ADK.Enrichment.addFacilityMoniker(response);

            return response;
        },
        getMedicationGroupbyData: function(medModel) {
            return {
                groupbyValue: medModel.get('groupbyValue'),
                groupbyField: medModel.get('groupbyField'),
                groupbyFacility: medModel.get('groupbyFacility')
            };
        }
    };

    return appletHelper;
});
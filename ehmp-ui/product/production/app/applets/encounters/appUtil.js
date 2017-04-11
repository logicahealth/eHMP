define([
    "underscore",
    "moment"
], function (_, moment) {
    'use strict';
    /* global ADK, Backbone */

    return {
        stringSplitter: function (str) {
            if (_.isUndefined(str)) {
                return "";
            }
            var arrSubstr = str.split(',');
            if (arrSubstr.length > 1) {
                return arrSubstr.join(", ");
            }
            return str;
        },
        encounterProvider: function (obj) {
            var provider = [];
            var primary = [];
            var arrResult = [];
            var result = "Unknown";
            if (obj.providers) {
                for (var m = 0; m < obj.providers.length; m++) {
                    if (obj.providers[m].primary) {
                        if (obj.providers[m].providerDisplayName) {
                            primary.push(this.stringSplitter(obj.providers[m].providerDisplayName));
                        }
                    }
                    if (obj.providers[m].providerDisplayName) {
                        provider.push(this.stringSplitter(obj.providers[m].providerDisplayName));
                    }
                }
                if (primary.length !== 0) {
                    arrResult = _.difference(provider, primary);
                    arrResult.unshift(primary);
                } else {
                    arrResult = provider;
                }
                if (arrResult.length !== 0) {
                    result = arrResult[0];
                }
            } else {
                if (obj.providerDisplayName) {
                    result = _.isEmpty(obj.providerDisplayName) ? "Unknown" : obj.providerDisplayName;
                }
            }
            return result;
        },
        admissionDiagnosis: function (obj) {
            var result;
            var Unknown = "Unknown";
            var diagnosis = [];
            if (_.isUndefined(obj.dischargeDiagnoses)) {
                result = obj.reasonName || Unknown;
            } else {
                _.each(obj.dischargeDiagnoses, function (val) {
                    if (!_.isUndefined(val.icdName)) {
                        if (val.icdName === "") {
                            diagnosis.push(Unknown);
                        } else {
                            diagnosis.push(val.icdName);
                        }
                    }
                });
                if (diagnosis.length > 0) {
                    result = diagnosis.join(";//");
                } else {
                    result = Unknown;
                }
            }
            return result;
        },
        getTimeSinceForFuture: function (array) {
            var dateTime;
            for (var m = array.length - 1; m > 0; m--) {
                dateTime = moment(array[m].dateTime, 'YYYYMMDDHHmm');
                if (dateTime.isAfter()) {
                    return array[m].dateTime;
                }
            }
            return array[m].dateTime;
        },
        getRecentForFuture: function (array) {
            var dateTime;
            var arrRecent = [];
            var index = 0;
            var future = false;
            for (var m = array.length - 1; m > 0; m--) {
                dateTime = moment(array[m].dateTime, 'YYYYMMDDHHmm');
                if (dateTime.isAfter()) {
                    future = true;
                    index = m;
                    break;
                }
            }
            if (!future) { // no events in a future
                arrRecent = array.slice(0, 5);
            } else if ((array.length - (index + 1)) > 0) { //more than 1 event in a future
                for (var n = index, k = 0; n >= 0, k < 5; n--, k++) {
                    arrRecent.push(array[n]);
                }
            } else { // 1 event in a future
                arrRecent = array.slice(0, 5);
                future = false;
            }

            return {
                aResult: arrRecent,
                bFutureTime: future
            };
        },
        displayDate: function (datetime) {
            return [(datetime.substring(0, 4)), '-', (datetime.substring(4, 6)), '-', (datetime.substring(6, 8))].join('');
        },
        isAppointment: function (model) {
            return !!((model.uid.indexOf('appointment') !== -1) && (this.isVisit(model)));

        },
        isProcedure: function (model) {
            return model.kind.indexOf('Procedure') !== -1;
        },
        isAdmission: function (model) {
            return model.kind.indexOf('Admission') !== -1;
        },
        isDoDAppointment: function (model) {
            return model.kind.indexOf('DoD Appointment') !== -1;
        },
        isDoDAppointmentFuture: function (model) {
            if (model.kind.indexOf('DoD Appointment') !== -1) {
                return !!moment(model.dateTime, 'YYYYMMDDHHmm').isAfter(moment());
            } else {
                return false;
            }
        },
        isDoDEncounter: function (model) {
            return model.kind.indexOf('DoD Encounter') !== -1;
        },
        getCPTprocedureDetailViewModel: function (context, uid) {
            var result;
            var model;
            if (!_.isUndefined(context.dataGridOptions.shadowCollection)) {
                model = context.dataGridOptions.shadowCollection.findWhere({kind: "Visit", uid: uid});
                if (!_.isUndefined(model)) {
                    result = model.toJSON();
                } else {
                    result = {
                        fError: true,
                        summary: "Error",
                        errorMsg: "Sorry, there is no detailed information about this event!"
                    };
                }
            }
            return result;
        },
        showDetailView: function (paramObj, channelName) {
            var model = new Backbone.Model(paramObj.model.get('recent_model'));
            var channelObject = _.extend({}, paramObj, {model: model});
            var channel = ADK.Messaging.getChannel(channelName);
            var response = channel.request('detailView', channelObject);
            var viewDetail = new response.view();
            var modal = new ADK.UI.Modal({
                view: viewDetail,
                options: {
                    size: "large",
                    showLoading: true,
                    title: function () {
                        return _.result(response, 'title') || _.result(viewDetail, 'title');
                    }
                }
            });
            modal.show();

        },
        // Clean up kind/subkind
        clanUpItem: function (item) {
            return item.replace(/[\s\\\/()!?*&:;,.^'"<>%]/g, '');
        },
        // sets first event, depends on GDF and first event for patient
        selectStartStopPoint: function (firstEvent) {
            var globalDate = ADK.SessionStorage.getModel_SessionStoragePreference('globalDate');
            var filterMode = globalDate.get("selectedId");
            var fromDate = moment(globalDate.get("fromDate"), "MM/DD/YYYY").format("YYYYMMDD");
            var toDate = moment(globalDate.get("toDate"), "MM/DD/YYYY").format("YYYYMMDD");
            var maxDate = moment().add(6, 'M');
            var aDate = moment().add(1, 'd');

            if (filterMode === "allRangeGlobal") {
                return {
                    start: firstEvent,
                    stop: moment(maxDate).format("YYYYMMDD")
                };
            } else if (filterMode === "customRangeApplyGlobal") {
                return {
                    start: fromDate,
                    stop: toDate
                };
            }
            return {
                start: fromDate,
                stop: moment(aDate).format("YYYYMMDD")
            };
        },
        isHospitalization: function (model) {
            return model.categoryCode === 'urn:va:encounter-category:AD';
        },
        //returns true if discharged, false if admitted
        isDischargedOrAdmitted: function (model) {
            return !!_.get(model, 'stay.dischargeDateTime');
        },
        isVisit: function (model) {
            return this.isKindTypeHelper(model, "visit");
        },
        isKindTypeHelper: function (model, kindType) {
            if (model === undefined) return false;
            var kind = model.kind;
            if (model instanceof Backbone.Model)
                kind = model.get('kind');
            if (kind === undefined) return false;
            kind = kind.toLowerCase();
            return (kind === kindType);
        },
        getActivityDateTime: function (model) {
            if (this.isVisit(model) && this.isHospitalization(model) && this.isDischargedOrAdmitted(model)) {
                return model.stay.dischargeDateTime;
            }
            return model.dateTime;
        },
        convertChartDate: function (time) {
            if (time.length < 8) {
                var repairs = 8 - time.length;
                for (var ind = 0; ind < repairs; ind++) {
                    time = time + "0";
                }
            }
            var utcdatetime = moment.utc(time, "YYYYMMDD");
            if (!utcdatetime.isValid()) {
                var year = time.substr(0, 4);
                var month = time.substr(4, 2);
                var day = time.substr(6, 2);
                var newutcdatetime;
                if (utcdatetime.invalidAt() === 1) { // incorrect month
                    month = "01";
                    newutcdatetime = moment.utc([year, month, day], "YYYYMMDD"); // set month to January
                    if (newutcdatetime.isValid()) {
                        return newutcdatetime.valueOf();
                    } else {
                        if (newutcdatetime.invalidAt() === 2) { // incorrect day
                            day = "01";
                            newutcdatetime = moment.utc([year, month, day], "YYYYMMDD"); // set day to 01
                            return newutcdatetime.valueOf();
                        }
                    }
                }
            }
            return utcdatetime.valueOf();
        },
        nowChart: function () {
            var tm = moment().format("YYYYMMDDHHmmssSSS");
            return this.convertChartDate(tm);
        }
    };
});

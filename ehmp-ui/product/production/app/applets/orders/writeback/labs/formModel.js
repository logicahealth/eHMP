define([
    'main/ADK',
    'backbone',
    'handlebars',
    'app/applets/orders/writeback/labs/labUtils'
], function(ADK, Backbone, Handlebars, Utils) {
    "use strict";

    //constants
    var AVAILABLE_LAB_TEST = '4';
    var COLLECTION_DATE_TIME = '6';
    var COMMENTS = '15';
    var COLLECTION_TYPE = '28';
    var HOW_OFTEN = '29';
    var HOW_LONG = '153';
    var COLLECTION_SAMPLES = '126';
    var SPECIMEN = '127';
    var URGENCY = '180';

    var addOrderModel = Backbone.Model.extend({
        initialize: function() {
            this.patient = ADK.PatientRecordService.getCurrentPatient();
            if (this.patient) {
                this.dfn = this.patient.get('localId');
                this.set('dfn', this.dfn);
            }
            this.session = ADK.UserService.getUserSession();
            if (this.session) {
                this.siteCode = this.session.get('site');
                this.provider = this.session.get('duz')[this.siteCode];
                this.set('provider', this.provider);
            }
        },
        validate: function(attributes, options) {
			this.errorModel.clear();
            if (this.get('collectionType') === 'SP' || this.get('collectionType') === 'WC') {
                var collectionDate = this.get('collectionDate');
                var collectionTime = _.isUndefined(this.get('collectionTime')) ? '00:00' : this.get('collectionTime');
                var collectionDateTime = new Date(collectionDate + ' ' + collectionTime);
                var now = new Date(moment().format('MM/DD/YYYY HH:mm'));
                if (this.get('collectionDateTime') !== 'TODAY' && collectionDateTime < now) {
                    if (this.get('collectionDate') !== moment().format('MM/DD/YYYY')){
						this.errorModel.set({
							collectionDate: "The start date may not be earlier than the present"
						});
                    }
                    if (!_.isUndefined(this.get('collectionTime'))){
						this.errorModel.set({
							collectionTime: "Collection times in the past are not allowed"
						});
                    }
                }
            }
            if (this.get('collectionType') === 'I' && !this.get('labCanCollect')) {
				this.errorModel.set({
					collectionType: "Immediate collect is not available for this test/sample"
				});
            }
            if (!_.isEmpty(this.get('howLong'))) {
                var howLong = this.get('howLong').toLowerCase().replace('x', '');
                if (howLong != parseInt(howLong) || parseInt(howLong) <= 0) {
					this.errorModel.set({
						howLong: 'For continuous orders, enter a number of days, or an "X" followed by a number of times.'
					});
                }
            }
            if (!_.isEmpty(this.errorModel.toJSON())) {
                return "Validation errors. Please fix.";
            }
        },
        validateImmediateCollectDateTime: function() {
            var self = this;
            if (this.get('collectionType') === 'I') {
                var callback = {
                    error: function(model, resp) {
                        self.set({
                            errorMessage: "[Immediate Collection Times] - Error occurred validating.",
                            immediateCollectionIsComplete: true
                        });
                    },
                    success: function(model, resp) {
                        if (resp.data[0].isValid !== "1") {
                            self.set('errorMessage', "[Immediate Collection Times] - " + resp.data[0].validationMessage);
                        }
                        self.set('immediateCollectionIsComplete', true);
                    }
                };
                var dateTimeSelected = new Date(this.get('immediateCollectionDate') + ' ' + this.get('immediateCollectionTime'));

                var siteCode = ADK.UserService.getUserSession().get('site');
                var pid = ADK.PatientRecordService.getCurrentPatient().get("pid");
                var modelUrl = '/resource/write-health-data/labSupportData?site=' + siteCode + '&type=lab-valid-immediate-collect-time&timestamp=' + dateTimeSelected.toString('yyyyMMddHHmmss') + '&pid=' + pid;
                var RetrieveModel = Backbone.Model.extend({
                    url: modelUrl,
                    parse: function(data) {
                        return data.data;
                    }
                });
                var model = new RetrieveModel();
                return model.fetch(callback);
            }
            return false;
        },
        validateHowLong: function() {
            var self = this;
            var callback = {
                error: function(model, resp) {
                    self.set('serverSideError', 'pick-list');
                },
                success: function(model, resp) {
                    var maxDays = (resp.data ? (resp.data.value || resp.data[0]) : undefined);
                    if (_.isUndefined(maxDays)) {
                        maxDays = -1;
                    }

                    if (self.get('howLong').toLowerCase().indexOf('x') !== -1) {
                        var selectedHowOften = _.filter(self.get('howOftenListCache'), function(e) {
                            return e.code === self.get('howOften');
                        });
                        if (selectedHowOften[0]) {
                            var minutes = parseInt(selectedHowOften[0].frequency);
                            var days = (minutes / 1440) * parseInt(self.get('howLong').toLowerCase().replace('x', ''));
                            var maxFrequency = (maxDays * 1440) / minutes;
                            var perHour = minutes / 60;
                            if (days > maxDays) {
                                var message = 'For this frequency, the maximum number of times allowed is: X' + maxFrequency + ' (Every ' + perHour + ' hours for a maximum of ' + maxDays + ' days.)';
                                self.set('errorMessage', '[How Long] - ' + message);
                            }
                        }
                    } else if (self.get('howLong') == parseInt(self.get('howLong'))) { //by days
                        if (parseInt(self.get('howLong')) > maxDays) {
                            self.set('errorMessage', '[How Long] - Maximum number of days allowed is ' + maxDays);
                        }
                    }
                    self.set('howLongIsComplete', true);
                }
            };

            var siteCode = ADK.UserService.getUserSession().get('site');
            var location;
            if (ADK.PatientRecordService.getCurrentPatient().get('visit')) {
                location = ADK.PatientRecordService.getCurrentPatient().get('visit').localId;
            }
            var schedule = this.get('howOften');
            var modelUrl = '';
            if ((this.get('collectionType').toString() === 'LC') || (this.get('collectionType').toString() === 'I')) {
                modelUrl = '/resource/write-health-data/labSupportData?site=' + siteCode + '&type=lab-future-lab-collects&location=' + location;
            } else {
                modelUrl = '/resource/write-pick-list?site=' + siteCode + '&type=lab-order-max-days-continuous&location=' + location + '&schedule=' + schedule;
            }
            var RetrieveModel = Backbone.Model.extend({
                url: modelUrl,
                parse: function(data) {
                    return data.data;
                }
            });
            var model = new RetrieveModel();
            return model.fetch(callback);
        },
        generateInputList: function() {
            var collectionSample = this.get('collectionSample').toString() !== "0" ? this.get('collectionSample').toString() : this.get('otherCollectionSample').toString();
            var specimen = this.get('specimen').toString() !== "0" ? this.get('specimen').toString() : this.get('otherSpecimen').toString();

            var collectionDateTime = this.get('collectionDateTime');
            var collectionDate = this.get('collectionDate');
            var collectionTime = this.get('collectionTime');

            if (collectionDateTime !== 'TODAY') {
                if (collectionTime !== '0:00' && collectionTime !== '00:00' && !_.isUndefined(collectionTime)) {
                    collectionDateTime = new Date(collectionDate + ' ' + collectionTime);
                } else {
                    collectionDateTime = new Date(collectionDate);
                }
                collectionDateTime = collectionDateTime.toString('yyyyMMddHHmmss');
            }

            var collectionType = this.get('collectionType') || '';
            collectionType = collectionType.toString();

            if (collectionType === 'LC' && this.get('collectionDateTimePicklist') === 'LO') {
                var futureLabCollectDateTime = moment(this.get('futureLabCollectDate'));
                var difference = futureLabCollectDateTime.diff(moment(), 'days') + 1;
                collectionDateTime = 'T+' + difference + '@' + this.get('futureLabCollectTime').replace(':','');
            } else if (collectionType === 'LC') {
                collectionDateTime = this.get('collectionDateTimePicklist').length > 0 ? this.get('collectionDateTimePicklist').substr(1) : "";
            } else if (collectionType === 'I') {
                var immediateCollectionDateTime = new Date(this.get('immediateCollectionDate') + ' ' + this.get('immediateCollectionTime'));
                collectionDateTime = immediateCollectionDateTime.toString('yyyyMMddHHmmss');
            }

            var inputList = [{
                    'inputKey': AVAILABLE_LAB_TEST,
                    'inputValue': this.get('availableLabTests').toString()
                }, //lab test
                {
                    'inputKey': COLLECTION_SAMPLES,
                    'inputValue': collectionSample
                }, //collection sample??
                {
                    'inputKey': SPECIMEN,
                    'inputValue': specimen
                }, //specimen
                {
                    'inputKey': URGENCY,
                    'inputValue': this.get('urgency').toString()
                }, //urgency
                {
                    'inputKey': COLLECTION_TYPE,
                    'inputValue': this.get('collectionType').toString()
                }, //collection type
                {
                    'inputKey': COLLECTION_DATE_TIME,
                    'inputValue': collectionDateTime
                }, //collection date time
                {
                    'inputKey': HOW_OFTEN,
                    'inputValue': this.get('howOften').toString()
                } //frequency
            ];

            if (this.get("howLong") && this.get("howLong") !== '') {
                inputList.push({
                    'inputKey': HOW_LONG,
                    'inputValue': this.get('howLong').toString()
                }); //frequency)
            }
            return inputList;
        },
        generateCommentList: function() {
            var commentFields = this.pick(['forTest', 'sampleDrawnAt', 'additionalComments', 'anticoagulantText', 'orderCommentText', 'doseDrawText', 'urineVolume']);
            return _.map(commentFields, function(commentField) {
                return {comment: commentField};
            });
        }

    });

	return addOrderModel;
});

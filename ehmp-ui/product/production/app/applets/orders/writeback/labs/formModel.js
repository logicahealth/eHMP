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
                var serverTimeDifference = this.get('serverTimeDifference');
                var serverTime = moment().add(serverTimeDifference, 'milliseconds');
                if (this.get('collectionDateTime') !== 'TODAY' && collectionDateTime < serverTime) {
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
            if (this.get('collectionType') === 'I' && !this.labCanCollect()) {
				this.errorModel.set({
					collectionType: "Immediate collect is not available for this test/sample"
				});
            }
            if (!_.isEmpty(this.errorModel.toJSON())) {
                return "Validation errors. Please fix.";
            }
        },
        labCanCollect: function() {
            var labCanCollect = false;
            var labCollSampDefault = this.get('labCollSampDefault');
            var collSampList = this.get('collectionSampleListCache');
            var collectionSample = this.get('collectionSample');

            if (!_.isUndefined(collSampList) && !_.isUndefined(labCollSampDefault)){
                var selectedCollectionSample = _.filter(collSampList, function(e) {
                    return e.ien == collectionSample;
                });
                if (!_.isEmpty(selectedCollectionSample) && selectedCollectionSample[0].n === labCollSampDefault) {
                    labCanCollect = true;
                }
            }
            else if (_.isUndefined(collSampList)) {
                labCanCollect = true;
            }
            return labCanCollect;
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
                } //collection date time
            ];
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

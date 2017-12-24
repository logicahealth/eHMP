define([
    'moment',
    'app/resources/fetch/document/imaging/thumbnailCollection'
], function(moment, ThumbnailCollection) {
    'use strict';
    var parse = function(response) {

        //if this collection was retrieved by uid, extract the response from the data array
        response = _.get(response, 'data[0]', response);

        ADK.Enrichment.addFacilityMoniker(response);

        if (response.thumbnails) { //in case of DOD images
            var _thumb = _.map(response.thumbnails, function(thumbnail) {
                return {
                    thumbnailUrl: thumbnail.toString(),
                    viewerUrl: response.viewerUrl,
                    imageCount: response.imageCount
                };
            });
            response.thumbnailCollection = new ThumbnailCollection(_thumb);
        } else if (response.hasImages || response.images) {
            var pid = ADK.PatientRecordService.getCurrentPatient().getIdentifier();
            response.hasImages = true;
            response.thumbnailCollection = new ThumbnailCollection(null, {
                urlOptions: {
                    pid: pid,
                    siteNumber: response.facilityCode,
                    contextId: response.contextId
                }
            });
        }
        if (response.kind) {
            response.complexDoc = false;
            var docType = response.kind.toLowerCase();

            if (docType === "surgery" || docType === "consult" || docType === "procedure" || docType === "imaging" || docType === "radiology report") {
                response.complexDoc = true;
            }

            response.surgeryBool = docType === "surgery" ? true : false;
            response.consultBool = docType === "consult" ? true : false;
            response.imagingBool = docType === "imaging" ? true : false;
            response.radiologyBool = docType === "radiology" ? true : false;
            response.orderableBool = _.isEmpty(response.orderUid) ? false : true;

            if (!response.referenceDateTime) {
                response.referenceDateTime = _.get(response, 'dateTime', '');
            }

            if ((response.radiologyBool || response.imagingBool)) {

                response.orderableBool = true;
                if (response.typeName) {
                    response.localTitle = response.typeName;
                }
                if (response.dateTime) {
                    response.referenceDateTime = response.dateTime;
                }
                if (response.providerDisplayName) {
                    response.authorDisplayName = response.providerDisplayName;
                }
                //Add the requesting provider to the document for imaging documents/reports
                var requestingProvider = _.find(response.providers, {
                    'providerRole': 'Requestor'
                });
                if (!_.isEmpty(requestingProvider)) {
                    response.requestingProviderName = requestingProvider.providerName;
                } else {
                    response.requestingProviderName = 'N/A';
                }
                if (_.isEmpty(response.orderName)) {
                    response.orderName = 'N/A';
                }
            }

            if (response.surgeryBool) {
                if (response.typeName) {
                    response.localTitle = response.typeName;
                }
                if (response.dateTime) {
                    response.referenceDateTime = response.dateTime;
                }
                if (response.providerDisplayName) {
                    response.authorDisplayName = response.providerDisplayName;
                }
            }

            if (response.consultBool) {
                if (response.typeName) {
                    response.localTitle = response.typeName; //verified
                }
                if (response.dateTime) {
                    response.referenceDateTime = response.dateTime;
                }
                if (response.providerDisplayName) {
                    response.authorDisplayName = response.providerDisplayName; //check CprsClassicConsultsViewDev.java for more precise author name
                }
                if (response.results && response.results[0] && response.results[0].localTitle) {
                    response.resultsTitle = response.results[0].localTitle;
                }
            }

            if (response.imagingBool) {
                if (response.dateTime) {
                    response.referenceDateTime = response.dateTime;
                }
            }

            if (response.kind == "Procedure") {
                if (response.typeName) {
                    response.localTitle = response.typeName;
                } else if (response.summary) {
                    response.localTitle = response.summary;
                } else if (response.name) {
                    response.localTitle = response.name;
                }
                if (response.referenceDateTime) {
                    response.referenceDateTime = response.referenceDateTime;
                } else if (response.dateTime) {
                    response.referenceDateTime = response.dateTime;
                }
                if (response.providerDisplayName) {
                    response.authorDisplayName = response.providerDisplayName;
                }
            }

            response.radiologyReportBool = response.kind.toLowerCase() === "radiology report";
        }
        if (_.isUndefined(response.authorDisplayName) || (response.authorDisplayName === "")) {
            response.authorDisplayName = "None";
            if (!_.isUndefined(response.clinicians)) {
                var objAuthor = _.findWhere(response.clinicians, {
                    role: "A"
                });
                if (!_.isUndefined(objAuthor)) {
                    if (!_.isUndefined(objAuthor.name)) response.author = objAuthor.name;
                    if (!_.isUndefined(objAuthor.displayName)) response.authorDisplayName = objAuthor.displayName;
                    if (!_.isUndefined(objAuthor.uid)) response.authorUid = objAuthor.uid;
                }
            }
        }

        if (response.localTitle) {
            response.displayTitle = response.localTitle.toLowerCase();
        }
        if (response.amended) {
            response.dateDisplay = Helper.formatDateTime(response.amended, 'YYYYMMDDHHmmssSSS', 'date');
            response.dateTimeDisplay = Helper.formatDateTime(response.amended, 'YYYYMMDDHHmmssSSS', 'datetime');
        } else if (response.referenceDateTime) {
            response.dateDisplay = Helper.formatDateTime(response.referenceDateTime, 'YYYYMMDDHHmmssSSS', 'date');
            response.dateTimeDisplay = Helper.formatDateTime(response.referenceDateTime, 'YYYYMMDDHHmmssSSS', 'datetime');
        }

        if (response.text !== undefined && response.text && response.text[0]) {
            if (response.text[0].authorDisplayName) {
                response.textAuthor = response.text[0].authorDisplayName;
            }
            response.content = _.get(response, 'text[0].content', 'No Content');
            if (response.text[0].dateTime) {
                response.textDateTime = Helper.formatDateTime(response.text[0].dateTime, 'YYYYMMDDHHmmssSSS', 'datetime');
            }
            if (response.text[0].authorDisplayName) {
                response.textAuthor = response.text[0].authorDisplayName;
            }
        } else if (response.facilityCode && response.facilityCode.toLowerCase() === 'dod') {
            response.content = "No Document Found";
        } else {
            response.text = false;
        }

        if (response.statusDisplayName) {
            var sdn = response.statusDisplayName.toLowerCase();
            response.statusDisplayName = _.capitalize(sdn);
            if (sdn === 'completed' || sdn === 'complete') {
                response.statusDisplayName = 'Completed';
            } else if (sdn === 'rejected') {
                response.statusDisplayClass = 'text-danger';
            }
        }

        if (response.statusName) {
            var sn = response.statusName.toLowerCase();
            response.statusName = _.capitalize(sn);
            if (sn === 'complete' || sn === 'completed') {
                response.statusName = 'Completed';
            }
        }

        if ((response.isInterdisciplinary === 'true' || response.isInterdisciplinary === true) && response.interdisciplinaryType === 'parent') {
            response.interdisciplinaryBool = true;
        } else {
            response.interdisciplinaryBool = false;
        }

        response.addendaText = Helper.formatAddenda(response);
        if (response.complexDoc) {
            response.authorDisplayName = Helper.stringNormalization(Helper.getAuthorVerifier(response));
        }
        return response;
    };
    var Helper = {
        formatDateTime: function(dateTime, source, display) {
            if (display == "datetime") {
                display = 'MM/DD/YYYY - HH:mm';
            } else if (display == "date") {
                display = 'MM/DD/YYYY';
            }
            return moment(dateTime, source).format(display);
        },
        formatAddenda: function(data) {
            if (data.text !== undefined && data.text.length > 1) {
                data.addendumIndicator = 'w/ Addendum';
                var addendaText = [];
                for (var i = 1; i < data.text.length; i++) {
                    if (data.text[i].dateTime) {
                        data.text[i].addendaDateTime = this.formatDateTime(data.text[i].dateTime, 'YYYYMMDDHHmmssSSS', 'datetime');
                    } else {
                        data.text[i].addendaDateTime = false;
                    }
                    if (data.text[i].status !== 'SIGNED') {
                        data.text[i].app = 'vista';
                    }
                    if (data.text[i].status) {
                        var status = data.text[i].status.toLowerCase();
                        data.text[i].status = _.capitalize(status);
                        if (status === 'complete' || status === 'completed') {
                            data.text[i].status = 'Completed';
                        }
                    }
                    addendaText.push(data.text[i]);
                }
                return addendaText;
            } else {
                return false;
            }
        },
        getAuthorVerifier: function(obj) {
            if (!_.isUndefined(obj.activity)) {
                var result = _.findWhere(obj.activity, {
                    name: "COMPLETE/UPDATE"
                });
                var responsible = _.get(result, 'responsible');
                if (responsible) {
                    return responsible;
                }

            }
            return obj.authorDisplayName;
        },
        stringNormalization: function(str) {
            if (_.isString(str)) {
                return str.replace(/\b\w+/g,
                    function(s) {
                        return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
                    });
            }
        }
    };

    return parse;
});
define([
    "backbone",
    "marionette",
    "underscore",
    "moment",
    "app/applets/documents/appConfig",
    "app/applets/documents/imaging/helpers/thumbnailHelper"
], function(Backbone, Marionette, _, moment, appConfig, ThumbnailHelper) {
    "use strict";

    var DEBUG = appConfig.debug;
    var ERROR_LOG = appConfig.errorLog;
    var DETAIL_CHILD_DOC_SORT_FIELD = 'localTitle';

    var appletHelper = {

        isComplexDoc: function(docType) {
            // var docType = data.kind;
            if (docType.toLowerCase() == "surgery" || docType.toLowerCase() == "consult" || docType.toLowerCase() == "procedure" || docType.toLowerCase() == "imaging" || docType.toLowerCase() == "radiology report") { //docType.toLowerCase() == "radiology" ||
                return true;
            } else {
                return false;
            }
        },
        hasChildDocs: function(data) {
            return (data.get('isInterdisciplinary') === true || data.get('isInterdisciplinary') === 'true') && data.get('interdisciplinaryType').toLowerCase() === 'parent';
        },
        isRadiology: function(docType) {
            if (docType.toLowerCase() == "radiology") {
                return true;
            } else {
                return false;
            }
        },
        isImaging: function(docType) {
            if (docType.toLowerCase() == "imaging") { //||(docType == "Radiology"))
                return true;
            } else {
                return false;
            }
        },
        isConsult: function(docType) {
            if (docType.toLowerCase() == "consult") {
                return true;
            } else {
                return false;
            }
        },

        isSurgery: function(docType) {
            if (docType.toLowerCase() == "surgery") {
                return true;
            } else {
                return false;
            }
        },

        hasAddenda: function(data) {
            if (data.text !== undefined && data.text.length > 1) {
                // console.log("hasAddenda is true for " + data.documentDefUid);
                return true;
            } else {
                return false;
            }
        },

        formatAddenda: function(data) {
            if (this.hasAddenda(data)) {
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
                    if(data.text[i].status){
                        var status = data.text[i].status.toLowerCase();
                        data.text[i].status = _.capitalize(status);
                        if(status === 'complete' || status === 'completed'){
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

        formatDateTime: function(dateTime, source, display) {
            if (display == "datetime") {
                display = 'MM/DD/YYYY - HH:mm';
            } else if (display == "date") {
                display = 'MM/DD/YYYY';
            }
            return moment(dateTime, source).format(display);
        },

        ResultsDocCollection: Backbone.Collection.extend({
            model: Backbone.Model.extend({
                idAttribute: 'uid',
                parse: function(resp) {
                    appletHelper.parseDocResponse(resp);
                    if (resp.authorDisplayName.toLowerCase() === 'none' && resp.signerDisplayName) {
                        resp.authorDisplayName = resp.signerDisplayName;
                        resp.providerDisplayName = resp.signerDisplayName;
                    }
                    return resp;
                }
            })
        }),

        getResultsFromUid: function(data, resultDocCollection) {
            if (appletHelper.isComplexDoc(data.get('kind')) && data.get('results') && !data.get('dodComplexNoteUri')) {
                if (data.get('results').length > 0) {
                    var resultUids = _.map(data.get('results'), function(result) {
                        return result.uid;
                    });

                    var fetchOptions = {
                        resourceTitle: 'patient-record-document',
                        criteria: {
                            filter: 'in("uid",' + JSON.stringify(resultUids) + ')',
                            order: DETAIL_CHILD_DOC_SORT_FIELD + ' ASC'
                        }
                    };
                    ADK.PatientRecordService.fetchCollection(fetchOptions, resultDocCollection);
                }
            }
            return resultDocCollection;
        },

        ChildDocCollection: Backbone.Collection.extend({
            model: Backbone.Model.extend({
                idAttribute: 'uid',
                parse: function(resp) {
                    return appletHelper.parseDocResponse(resp);
                }
            })
        }),

        getChildDocs: function(data, childCollection) {
            if (appletHelper.hasChildDocs(data)) {
                var fetchOptions = {
                    resourceTitle: 'patient-record-document',
                    criteria: {
                        filter: 'eq(parentUid,"' + data.get('uid') + '")',
                        order: DETAIL_CHILD_DOC_SORT_FIELD + ' ASC'
                    },
                };

                ADK.PatientRecordService.fetchCollection(fetchOptions, childDocCollection);
                return childDocCollection;
            }
            return null;
        },

        parseDocResponse: function(response) {
            if (DEBUG) console.log("Doc parseDocResponse before-----> ",response.kind);
            if (response.thumbnails) {
                ThumbnailHelper.convertThumbnails(response);
            }
            if (response.kind) {
                response.kind = response.kind;
                response.complexDoc = appletHelper.isComplexDoc(response.kind);
                response.surgeryBool = appletHelper.isSurgery(response.kind);
                response.consultBool = appletHelper.isConsult(response.kind);
                response.imagingBool = appletHelper.isImaging(response.kind);
                response.radiologyBool = appletHelper.isRadiology(response.kind);
                response.orderableBool = _.isEmpty(response.orderUid) ? false : true;

                if ((response.kind == "Radiology") || (response.kind == "Imaging")) {

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
                    var requestingProvider = _.find(response.providers, {'providerRole': 'Requestor'});
                    if (!_.isEmpty(requestingProvider)) {
                        response.requestingProviderName = requestingProvider.providerName;
                    } else {
                        response.requestingProviderName = 'N/A';
                    }
                    if (_.isEmpty(response.orderName)) {
                        response.orderName = 'N/A';
                    }
                }

                if (response.kind == "Surgery") {
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

                if (response.kind == "Consult") {
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

                if (response.kind == "Imaging") {
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
            if (_.isUndefined(response.authorDisplayName) || (response.authorDisplayName === "")){
                response.authorDisplayName = "None";
                if (!_.isUndefined(response.clinicians)) {
                        var objAuthor = _.findWhere(response.clinicians,{role: "A"});
                        if (!_.isUndefined(objAuthor)){
                            if(!_.isUndefined(objAuthor.name)) response.author = objAuthor.name;
                            if(!_.isUndefined(objAuthor.displayName)) response.authorDisplayName = objAuthor.displayName;
                            if(!_.isUndefined(objAuthor.uid)) response.authorUid = objAuthor.uid;
                        }
                    }
            }

            if (response.localTitle) {
                response.displayTitle = response.localTitle.toLowerCase();
            }
            if (response.amended) {
                response.dateDisplay = appletHelper.formatDateTime(response.amended, 'YYYYMMDDHHmmssSSS', 'date');
                response.dateTimeDisplay = appletHelper.formatDateTime(response.amended, 'YYYYMMDDHHmmssSSS', 'datetime');
            }

            else if (response.referenceDateTime) {
                response.dateDisplay = appletHelper.formatDateTime(response.referenceDateTime, 'YYYYMMDDHHmmssSSS', 'date');
                response.dateTimeDisplay = appletHelper.formatDateTime(response.referenceDateTime, 'YYYYMMDDHHmmssSSS', 'datetime');
            }

            if (response.text !== undefined && response.text && response.text[0]) {
                if (response.text[0].authorDisplayName) {
                    response.textAuthor = response.text[0].authorDisplayName;
                }
                if (response.text[0].content) {
                    response.content = response.text[0].content;
                } else {
                    response.content = "No Content";
                }
                if (response.text[0].dateTime) {
                    response.textDateTime = appletHelper.formatDateTime(response.text[0].dateTime, 'YYYYMMDDHHmmssSSS', 'datetime');
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

            response.addendaText = appletHelper.formatAddenda(response);
            if (DEBUG) console.log("Doc parseDocResponse after-----> ",response.kind);
            return response;
        },
        scrollToResultDoc: function($clickedLink, $targetResult) {
            var $scrollRegion = this.getScrollParent($clickedLink, false);

            if ($targetResult.length > 0) {
                // scroll to the selected result document
                var targetOffset = 0,
                    elem = $targetResult,
                    count = 0,
                    body = $(document.body);

                while (!elem.is(body) && !elem.is($scrollRegion) && count++ < 100) {
                    targetOffset += elem.position().top;
                    elem = elem.offsetParent();
                }
                var targetTop = $scrollRegion.scrollTop() + targetOffset;
                $scrollRegion.scrollTop(targetTop);
            }
        },
        getScrollParent: function($elem, includeHidden) {
            // this method copied from jqueryui 1.11.2
            var position = $elem.css("position"),
                excludeStaticParent = position === "absolute",
                overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
                scrollParent = $elem.parents().filter(function() {
                    var parent = $(this);
                    if (excludeStaticParent && parent.css("position") === "static") {
                        return false;
                    }
                    return overflowRegex.test(parent.css("overflow") + parent.css("overflow-y") + parent.css("overflow-x"));
                }).eq(0);

            return position === "fixed" || !scrollParent.length ? $($elem[0].ownerDocument || document) : scrollParent;
        },
        getAuthorVerifier: function (obj) {
            if (!_.isUndefined(obj.activity)) {
                var result = _.findWhere(obj.activity, {
                    name: "COMPLETE/UPDATE"
                });
                if (result.length !== 0) {
                    if (!_.isUndefined(result.responsible)) {
                        return result.responsible;
                    }
                }

            }
            return obj.authorDisplayName;
        },
        stringNormalization: function (str) {
            if (_.isString(str)){
                return str.replace(/\b\w+/g,
                            function(s) {
                                return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
                            });
            }
        }
    };
    return appletHelper;
});

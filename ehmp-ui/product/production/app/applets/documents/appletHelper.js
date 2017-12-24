define([
    "backbone",
    "marionette",
    "underscore",
    "moment",
    "app/applets/documents/appConfig"
], function(
    Backbone,
    Marionette,
    _,
    moment,
    appConfig
) {
    "use strict";

    var DEBUG = appConfig.debug;
    var ERROR_LOG = appConfig.errorLog;
    var DETAIL_CHILD_DOC_SORT_FIELD = 'localTitle';

    var appletHelper = {
        isComplexDoc: function (docType) {
            docType = (docType || '').toLowerCase();
            return docType === 'surgery' || docType === 'consult' || docType === 'procedure' || docType === 'imaging' || docType === 'radiology report' || docType === 'laboratory report';
        },
        hasChildDocs: function(data) {
            return (data.get('isInterdisciplinary') === true || data.get('isInterdisciplinary') === 'true') && data.get('interdisciplinaryType').toLowerCase() === 'parent';
        },
        getResultsFromUid: function(data, resultDocCollection) {
            if (appletHelper.isComplexDoc(data.get('kind')) && data.get('results') && !data.get('dodComplexNoteUri')) {
                if (data.get('results').length > 0) {
                    var resultUids = _.map(data.get('results'), function(result) {
                        return result.uid;
                    });

                    var fetchOptions = {
                        criteria: {
                            filter: 'in("uid",' + JSON.stringify(resultUids) + ')',
                            order: DETAIL_CHILD_DOC_SORT_FIELD + ' ASC'
                        }
                    };
                    resultDocCollection.fetchCollection(fetchOptions);
                }
            }
            return resultDocCollection;
        },
        getChildDocs: function(data, childDocCollection) {
            if (appletHelper.hasChildDocs(data)) {
                var fetchOptions = {
                    criteria: {
                        filter: 'eq(parentUid,"' + data.get('uid') + '")',
                        order: DETAIL_CHILD_DOC_SORT_FIELD + ' ASC'
                    },
                };

                childDocCollection.fetchCollection(fetchOptions);
                return childDocCollection;
            }
            return null;
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
        }
    };
    return appletHelper;
});
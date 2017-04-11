define([
    "backbone",
    "underscore",
    "marionette",
    "handlebars"
], function(Backbone, _, Marionette, Handlebars) {
    'use strict';

    // temporary default detail view. remove once all detail view have been implemented
    var DefaultDetailView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<div>A detail view for this domain is not yet implemented.</div>')
    });
    var ErrorView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<div>{{ error }}</div>')
    });
    var keywords = [];

    var detailAppletChannels = {
        // mapping of domain --> appletId
        "med": "medication_review",
        "allergy": "allergy_grid",
        "immunization": "immunizations",
        "problem": "problems",
        "vital": "vitals",
        "lab": "labresults_timeline_detailview",
        "document": "documents",
        "order": "orders",
        "surgery": "documents",
        "procedure": "documents",
        "consult": "documents",
        "image": "documents"
    };

    function getAllKeywords(uid) {
        var keywords = ADK.SessionStorage.getAppletStorageModel('search', 'searchText').searchTerm.toString().toLowerCase();
        keywords = keywords.split(' ');
        _.each(keywords, function(kw){
            if (!_.find(keywords, function(key){
                    if (_.isUndefined(ADK.utils.stringUtils.singularize(kw))){
                        return true;
                    }
                    return key===ADK.utils.stringUtils.singularize(kw);
                })){
                keywords.push(ADK.utils.stringUtils.singularize(kw));
            }
        });
        $("[data-uid='" + uid + "']").find('.cpe-search-term-match').contents().each(function() {
            var text = $(this).text().toString().toLowerCase();
            if (!_.find(keywords, function(key){
                return key === text;
            })){
                keywords.push(text);
            }
        });
        return keywords;
    }

    function highlightHtmlElement(htmlToHighlight, keywords) {
        $(htmlToHighlight).find("*").contents().each(function() {
            if (this.nodeType == 3) {
                $(this).replaceWith(ADK.utils.stringUtils.addSearchResultElementHighlighting($(this).text(), keywords));
            }
        });
    }

    function onDocumentsLoaded(view) {
        if (view) {
            highlightHtmlElement(view, keywords);
        }
    }

    function onResultClicked(clickedResult) {
        var domain = clickedResult.uid.split(":")[2],
            channelName = detailAppletChannels[domain];
        keywords = getAllKeywords(clickedResult.uid);
        if (channelName) {
            // display spinner in modal while detail view is loading
            var channel = ADK.Messaging.getChannel(channelName),
                deferredResponse = channel.request('detailView', clickedResult);

            if (!deferredResponse) {
                return;
            }
            var modal = new ADK.UI.Modal({
                view: ADK.Views.Loading.create(),
                options: {
                    size: "large",
                    title: "Loading..."
                }
            });

            var showOptions = {triggerElement: $(':focus')};
            modal.show(showOptions);

            // request detail view from whatever applet is listening for this domain
            deferredResponse.done(function(response) {
                var modalOptions = {
                    size: "large",
                    title: ADK.utils.stringUtils.addSearchResultElementHighlighting(response.title, keywords)
                };
                if (response.headerView) {
                    modalOptions.headerView = response.headerView;
                    highlightHtmlElement(response.headerView.$el, keywords);
                }
                if (response.footerView) {
                    modalOptions.footerView = response.footerView;
                }
                var modal = new ADK.UI.Modal({
                    view: response.view,
                    options: modalOptions
                });
                modal.show(showOptions);
                highlightHtmlElement(response.view.$el, keywords);
            });
            deferredResponse.fail(function(response) {
                var errorMsg = _.isString(response) ? response : response && _.isString(response.statusText) ? response.statusText : "An error occurred";
                var modal = new ADK.UI.Modal({
                    view: new ErrorView({
                        model: new Backbone.Model({
                            error: errorMsg
                        })
                    }),
                    options: {
                        size: "large",
                        title: "An Error Occurred"
                    }
                });
                modal.show(modalShowOptions);
            });
        } else {
            // no detail view available; use the default placeholder view
            var modalView = new ADK.UI.Modal({
                view: new DefaultDetailView(),
                options: {
                    size: "large",
                    title: "Detail - Placeholder"
                }
            });
            modalView.show();
        }
    }

    var screenConfig = {
        id: 'record-search',
        context: 'patient',
        contentRegionLayout: 'gridOne',
        appletHeader: 'navigation',
        appLeft: 'patientInfo',
        applets: [{
            id: 'search',
            title: 'Search',
            region: 'center'
        }],
        onStart: function() {
            ADK.SessionStorage.setAppletStorageModel('search', 'useTextSearchFilter', true);
            var searchAppletChannel = ADK.Messaging.getChannel("search");
            searchAppletChannel.on('resultClicked', onResultClicked);
            searchAppletChannel.on('documentsLoaded', onDocumentsLoaded);
        },
        onStop: function() {
            ADK.SessionStorage.setAppletStorageModel('search', 'useTextSearchFilter', false);
            var searchAppletChannel = ADK.Messaging.getChannel("search");
            searchAppletChannel.off('resultClicked', onResultClicked);
            searchAppletChannel.off('documentsLoaded', onDocumentsLoaded);
        },
        patientRequired: true,
        globalDatepicker: false
    };
    return screenConfig;
});

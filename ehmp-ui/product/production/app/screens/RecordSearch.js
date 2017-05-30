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
        "image": "documents",
        'vlerdocument': 'ccd_grid'
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
        $(htmlToHighlight).find('*').not('iframe').contents().each(function() {
            if (this.nodeType === Node.TEXT_NODE) {
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
                response = channel.request('detailView', clickedResult);

            if (!response) {
                return;
            }

            var showOptions = {triggerElement: $(':focus')};

            var bodyView = new response.view();
            bodyView.listenTo(bodyView, 'render', function() {
                highlightHtmlElement(this.$el, keywords);
            });
            if(_.isFunction(bodyView.getRegions)) {
                _.each(bodyView.getRegions(), function(region) {
                    region.listenTo(region, 'before:show', function(view) {
                        highlightHtmlElement(view.$el, keywords);
                    });
                });
            }

            var responseHeaderView = response.headerView;
            var headerView;

            if (responseHeaderView) {
                headerView = responseHeaderView.extend({
                    initialize: function() {
                        responseHeaderView.prototype.initialize.apply(this, arguments);
                        this.listenTo(this, 'render', function() {
                            highlightHtmlElement(this.$el, keywords);
                        });
                    }
                });
            }

            var modalOptions = {
                    size: "large",
                    title: function() {
                        var title = _.result(response, 'title') || _.result(bodyView, 'title');
                        return ADK.utils.stringUtils.addSearchResultElementHighlighting(title, keywords);
                    },
                    showLoading: _.result(response, 'showLoading', true),
                    resourceEntity: response.resourceEntity || bodyView.collection
                };
                if (headerView) {
                    modalOptions.headerView = headerView;
                    highlightHtmlElement(headerView.$el, keywords);
                }
                if (response.footerView) {
                    modalOptions.footerView = response.footerView;
                }
                var modal = new ADK.UI.Modal({
                    view: bodyView,
                    options: modalOptions
                });
                modal.show(showOptions);
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
            var searchAppletChannel = ADK.Messaging.getChannel("search");
            searchAppletChannel.on('resultClicked', onResultClicked);
            searchAppletChannel.on('documentsLoaded', onDocumentsLoaded);
        },
        onStop: function() {
            var searchAppletChannel = ADK.Messaging.getChannel("search");
            searchAppletChannel.off('resultClicked', onResultClicked);
            searchAppletChannel.off('documentsLoaded', onDocumentsLoaded);
        },
        patientRequired: true,
        globalDatepicker: false
    };
    return screenConfig;
});

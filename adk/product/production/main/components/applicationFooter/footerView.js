define([
    'backbone',
    'marionette',
    'underscore',
    'api/Messaging',
    'handlebars'
], function(
    Backbone,
    Marionette,
    _,
    Messaging,
    Handlebars
) {
    "use strict";

    var RightFooterItemCollectionView = Backbone.Marionette.CollectionView.extend({
        itemGroupName: 'right',
        className: 'pull-right',
        getChildView: function(item) {
            return item.get('view');
        },
        filter: function(child) {
            return child.isOfGroup('applicationFooterItem', this.itemGroupName) && child.shouldShow();
        },
        resortView: function() {} // Turning off the rendering of children on a sort of the collection
    });

    var FooterView = Backbone.Marionette.LayoutView.extend({
        tagName: 'footer',
        template: Handlebars.compile([
            '<div class="col-xs-3">',
            '<p><strong>eHMP</strong> version <span id="appVersion">{{overall_version}}</span></p>',
            '</div>',
            '<div class="col-xs-9 application-footer-items-right"></div>'
        ].join("\n")),
        ui: {
            'FooterItemsRight':'.application-footer-items-right',
        },
        regions: {
            'RightItemsRegion': '@ui.FooterItemsRight'
        },
        initialize: function(options) {
            this.model = new Backbone.Model();
            this.model.set(Messaging.request('appManifest').attributes);

            this.footerItemsCollection = Messaging.request('get:components');
            this.rightFooterItemsCollectionView = new RightFooterItemCollectionView({
                collection: this.footerItemsCollection
            });
        },
        onBeforeShow: function() {
            this.showChildView('RightItemsRegion', this.rightFooterItemsCollectionView);
        }
    });
    return FooterView;
});
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
        className: 'flex-display',
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
        className: 'flex-display right-padding-xs left-padding-xs application-footer-items',
        template: Handlebars.compile([
            '<div class="application-footer-items-left">',
            '<p><strong>eHMP</strong> version <span id="appVersion">{{overall_version}}</span></p>',
            '</div>',
            '<div class="application-footer-items-right flex-display flex-width-1 flex-justify-flex-end"></div>'
        ].join("\n")),
        behaviors: {
            FlexContainer: {
                direction: 'row',
                alignItems: 'center',
                container: '> .application-footer-items-left'
            }
        },
        ui: {
            'FooterItemsRight':'.application-footer-items-right'
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
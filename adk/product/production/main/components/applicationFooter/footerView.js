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

    var LeftFooterItemCollectionView = Backbone.Marionette.CompositeView.extend({
        itemGroupName: 'left',
        className: 'flex-display flex-align-center',
        template: Handlebars.compile('<p><strong>eHMP</strong> version <span id="appVersion">{{overall_version}}</span></p>'),
        getChildView: function(item) {
            return item.get('view');
        },
        filter: function(child) {
            return child.isOfGroup('applicationFooterItem', this.itemGroupName) && child.shouldShow();
        },
        resortView: _.noop // Turning off the rendering of children on a sort of the collection
    });

    var FooterView = Backbone.Marionette.LayoutView.extend({
        tagName: 'footer',
        className: 'flex-display right-padding-xs left-padding-xs application-footer-items background-color-primary-dark',
        template: Handlebars.compile([
            '<div class="application-footer-items-left flex-display flex-width-none flex-justify-flex-start"></div>',
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
            'FooterItemsRight':'.application-footer-items-right',
            'FooterItemsLeft':'.application-footer-items-left'
        },
        regions: {
            'RightItemsRegion': '@ui.FooterItemsRight',
            'LeftItemsRegion': '@ui.FooterItemsLeft'
        },
        initialize: function(options) {
            this.model = new Backbone.Model();
            this.model.set(Messaging.request('appManifest').attributes);

            this.footerItemsCollection = Messaging.request('get:components');
            this.leftFooterItemsCollectionView = new LeftFooterItemCollectionView({
                model: this.model,
                collection: this.footerItemsCollection
            });
            this.rightFooterItemsCollectionView = new RightFooterItemCollectionView({
                collection: this.footerItemsCollection
            });
        },
        onBeforeShow: function() {
            this.showChildView('LeftItemsRegion', this.leftFooterItemsCollectionView);
            this.showChildView('RightItemsRegion', this.rightFooterItemsCollectionView);
        }
    });
    return FooterView;
});
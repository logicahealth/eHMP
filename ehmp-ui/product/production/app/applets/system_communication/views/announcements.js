define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars
) {
    "use strict";

    var AnnouncementItemView = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        template: Handlebars.compile(
            '<h6 class="font-size-16 all-margin-no bottom-padding-no">{{title}}</h3>' +
            '<p class="bold-font color-grey-darker">{{getSubHeader}}</p>' +
            '<p>{{getContent}}</p>'
        ),
        templateHelpers: {
            getSubHeader: function() {
                var delimiter = _.isUndefined(this.sender) || _.isUndefined(this.sent) ? '' : ' - ';
                var datePosted = _.isUndefined(this.sent) ? '' : 'Posted: ' + Handlebars.helpers.formatDateTime.apply(this, [this.sent, "YYYYMMDDHHmmssSSS", "MMMM D, YYYY - HH:mm"]);
                return this.sender + delimiter + datePosted;
            },
            getContent: function() {
                return new Handlebars.SafeString(this.content.replace(/\\n/g, "<br/>"));
            }
        }
    });

    var AnnouncementCategoryView = Backbone.Marionette.CompositeView.extend({
        tagName: 'li',
        template: Handlebars.compile(
            '{{#if addDivider}}<hr class="top-margin-lg"/>{{/if}}' +
            '<h5 class="font-size-18{{#if addDivider}} bottom-padding-no{{else}} top-margin-no all-padding-no{{/if}}{{#if label}}">{{label}}{{else}} sr-only">{{id}}{{/if}}</h2>' +
            '<ul class="announcements-{{id}}-list list-unstyled"></ul>'
        ),
        templateHelpers: function() {
            return {
                addDivider: !!this.getOption('addDivider')
            };
        },
        filter: function(child, index, collection) {
            return _.isEqual(child.get('category'), 'announcements-' + this.model.get('id'));
        },
        childView: AnnouncementItemView,
        childViewContainer: '> [class^="announcements-"]'
    });

    var AnnouncementsCategoryCollection = Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: {
                label: ''
            },
            idAttribute: 'id'
        })
    });

    var AnnouncementsView = Backbone.Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'list-unstyled',
        categories: [
            { id: 'terms', label: 'Terms of Use' },
            { id: 'system', label: 'Announcements' }
        ],
        globalAnnouncementsCollection: null,
        initialize: function(options) {
            this.collection = new AnnouncementsCategoryCollection(this.getOption('categories'));
        },
        childView: AnnouncementCategoryView,
        childViewOptions: function(model, index) {
            return {
                addDivider: this.children.length > 0,
                collection: this.getOption('globalAnnouncementsCollection')
            };
        },
        addChild: function(child, ChildView, index) {
            var ViewPrototype = Marionette.CollectionView.prototype;
            if (!(this.getOption('globalAnnouncementsCollection') instanceof Backbone.Collection)) return;
            if (!_.isEmpty(this.getOption('globalAnnouncementsCollection').filter(_.bind(ChildView.prototype.filter, { model: child })))) {
                ViewPrototype.addChild.apply(this, arguments);
            }
        }
    });
    return AnnouncementsView;
});

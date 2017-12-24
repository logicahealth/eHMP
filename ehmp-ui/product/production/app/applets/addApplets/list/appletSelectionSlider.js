define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'handlebars',
    'hbs!app/applets/addApplets/templates/appletSlider'
], function(_, $, Backbone, Marionette, Handlebars, appletSlider) {
    'use strict';


    var ChildView = Backbone.Marionette.ItemView.extend({
        className: 'applet-thumbnail',
        attributes: function() {
            var model = this.getOption('model');
            var pageModel = this.getOption('pageModel');
            var title = model.get('title');
            return {
                'tabindex': -1,
                'data-appletid': model.get('id'),
                'data-flex-width': pageModel.get('isLastPage') ? 0 : 1,
                'aria-label': title + " applet"
            };
        },

        events: {
            keydown: 'keyDownListener',
            keyup: 'keyUpListener',
            focusin: 'focusIn',
            click: 'addApplet'
        },

        template: Handlebars.compile('<span class="applet-thumbnail-title item">{{title}}</span>'),

        keyDownListener: function (event) {
            var which = event.which;
            if (which === $.ui.keyCode.SPACE || which === $.ui.keyCode.ENTER) {
                this.$el.click();
            } else if (which === $.ui.keyCode.LEFT) {
                this.focusPrevious();
            } else if (which === $.ui.keyCode.RIGHT) {
                this.focusNext();
            } else {
                this.shiftTabCheck(event, which);
            }
        },

        shiftTabCheck: function(event, which) {
           if (event.shiftKey && which === $.ui.keyCode.TAB) {
               event.stopPropagation();
               event.preventDefault();
               this.trigger('focus:previous:button');
           }
        },

        /**
         * Blocks the parents focus in event from being triggered
         * @param event
         */
        focusIn: function(event) {
            event.stopPropagation();
        },

        focusNext: function() {
            var $next = this.$el.next();
            if ($next.length) {
                return $next.focus();
            }
            this.trigger('focus:first');
        },

        focusPrevious: function() {
            var $previous = this.$el.prev();
            if ($previous.length) {
                return $previous.focus();
            }
            this.trigger('focus:last');
        },

        addApplet: function() {
            var channel = ADK.Messaging.getChannel('addApplets');
            channel.trigger('addAppletPlaceholder');
            channel.trigger('addAppletToGridster', {
                appletId: this.model.get('id'),
                appletTitle: this.model.get('title')
            });
        }
    });


    var EmptyView = Backbone.Marionette.ItemView.extend({
        tagName: 'p',
        className: 'empty-applets-message color-pure-white flex-width-1',
        template: Handlebars.compile('No Applets Found')
    });


    return Backbone.Marionette.CompositeView.extend({
        behaviors: {
            FlexContainer: {
                container: ['.applet-carousel', {
                    container: '.applet-items-container',
                    alignItems: 'stretch',
                    direction: 'row'
                }],
                direction: 'row'
            }
        },

        template: appletSlider,
        childViewContainer: '@ui.carouselContainer',
        childView: ChildView,
        emptyView: EmptyView,

        modelEvents: {
            'change:currentPage change:pageSize': 'render'
        },

        childEvents: {
            'focus:first': 'focusFirst',
            'focus:last': 'focusLast',
            'focus:previous:button': 'focusPreviousButton'
        },

        collectionEvents: {
            'reset': function() {
                this.model.set('currentPage', 1);
            }
        },

        ui: {
            carouselContainer: '.applet-items-container',
            next: 'button.next-carousel-page-button',
            previous: 'button.previous-carousel-page-button'
        },

        events: {
            'click @ui.previous': 'previous',
            'click @ui.next': 'next',
            'focusin @ui.carouselContainer': 'focusFirst'
        },

        focusFirst: function() {
            var $children = this.ui.carouselContainer.children();
            var $first = $children.first();
            $first.focus();
        },

        focusLast: function() {
            var $children = this.ui.carouselContainer.children();
            var $last = $children.last();
            $last.focus();
        },

        focusPreviousButton: function() {
            this.ui.previous.focus();
        },

        filter: function(model, index, collection) {
            var numberPerSlide = this.model.get('pageSize');
            var numberOfPages = Math.ceil(collection.length / numberPerSlide);
            var currentPage = this.model.get('currentPage'); // 1 based
            this.model.set('isLastPage', (currentPage === numberOfPages));
            return Math.ceil((index + 1) / (numberPerSlide)) === currentPage;
        },

        childViewOptions: function() {
            return {
                pageModel: this.model
            };
        },

        initialize: function() {
            var AppletCollection = Backbone.Collection.extend({
                comparator: 'title'
            });
            this.collection = new AppletCollection();
            this.model = new Backbone.Model({currentPage: 1});
            this.listenTo(ADK.utils.resize.dimensions.viewport, 'change:width', this.onWindowWidthChange);
        },

        onAttach: function() {
            this.setPageSize();

            // avoids initial render. Filter depends on container width
            var AppletsManifest = ADK.Messaging.request('AppletsManifest');
            var appletsInContext = ADK.utils.contextUtils.filterAppletsGivenContext(AppletsManifest.applets);
            var filtered = _.filter(appletsInContext, this._filterPermissions);

            this.collection.set(filtered);
            this.collectionOrig = this.collection.clone();
        },

        _filterPermissions: function(applet) {
            var permissions = applet.permissions || [];
            var hasPermission = true;
            _.each(permissions, function(permission) {
                if (!ADK.UserService.hasPermission(permission)) {
                    hasPermission = false;
                    return false;
                }
            });
            return applet.showInUDWSelection && hasPermission;
        },

        onRender: function() {
            if (this.dragObj) {
                this.dragObj.destroy();
            }
            this.dragObj = this.ui.carouselContainer.drag(this._dragOptionsFactory());
        },

        onBeforeDestroy: function() {
            if (this.dragObj) {
                this.dragObj.destroy();
            }
        },

        _dragOptionsFactory: function() {
            var channel = ADK.Messaging.getChannel('addApplets');
            return {
                items: '.applet-thumbnail',
                helper: 'clone',
                start: this.dragStart.bind(this),
                drag: this.drag.bind(this, channel),
                stop: _.partial(this.dragStop, channel)
            };
        },

        drag: function(channel, event) {
            var $helper = this.$el.find('.helper');

            $helper.css({
                position: 'left',
                left: event.pageX - $helper.width() / 2,
                top: event.pageY - $helper.height() / 2
            });

            if ($helper.hover()) {
                var $container = this.$el.closest('.workspace-editor-container');
                var $gridster = $container.find('#gridster2');
                if ($gridster.length) {
                    var y = event.pageY - $gridster.offset().top - 10;
                    var row = Math.ceil(y / 25);
                    if (row < 1) {
                        row = 1;
                    }
                    channel.trigger('addAppletPlaceholder', {
                        hoverOverRow: row
                    });
                }
            }
        },

        dragStop: function(channel) {
            channel.trigger('addAppletToGridster', {
                appletId: this.attr('data-appletid'),
                appletTitle: this.find('.applet-thumbnail-title').text()
            });
        },

        next: function() {
            var appletsPerSlide = this.model.get('pageSize');
            var currentPage = this.model.get('currentPage');
            var numberOfPages = Math.ceil(this.collection.length / appletsPerSlide);
            var nextPage = currentPage + 1;
            if (nextPage > numberOfPages) {
                nextPage = 1;
            }
            this.model.set('currentPage', nextPage);
        },

        previous: function() {
            var appletsPerSlide = this.model.get('pageSize');
            var currentPage = this.model.get('currentPage');
            var numberOfPages = Math.ceil(this.collection.length / appletsPerSlide);
            var previousPage = currentPage - 1;
            if (previousPage < 1) {
                previousPage = numberOfPages;
            }
            this.model.set('currentPage', previousPage);
        },

        dragStart: function() {
            var $helper = this.$el.find('.helper');
            $helper.css('position', 'fixed');
            $helper.hide();
            setTimeout(function() {
                $helper.show();
            }, 200);
        },

        onWindowWidthChange: function(model, value, options) {
            var currentCollection = this.collection.clone();
            this.collection.reset();
            this.setPageSize();
            this.collection.set(currentCollection.models);
            this.model.set('currentPage', 1);
        },
        filterApplets: function(filterText) {
            this.collection.reset(_.filter(this.collectionOrig.models, function(model) {
                return model.get('title').toLowerCase().indexOf(filterText.toLowerCase()) >= 0;
            }));
        },
        setPageSize: function() {
            this.model.set('pageSize', Math.floor(this.ui.carouselContainer.innerWidth() / 88));
            // TODO check to see if currentPage should change
        }
    });
});
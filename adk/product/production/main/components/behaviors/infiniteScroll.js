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

    var InfiniteScrollMessageView = Backbone.Marionette.ItemView.extend({
        attributes: function() {
            if (_.isEqual(this.tagName, 'tr')) {
                return {
                    'scope': 'row',
                    'colspan': 0
                };
            }
            return {};
        },
        behaviors: {
            Tooltip: {}
        },
        className: 'text-align-center color-grey-darker normal-font',
        template: false
    });

    var LoadingIndicator = InfiniteScrollMessageView.extend({
        template: Handlebars.compile('<i class="fa fa-spinner fa-spin right-margin-xs"></i>Loading more results...')
    });
    var ErrorIndicator = InfiniteScrollMessageView.extend({
        className: '',
        template: Handlebars.compile([
            '<div class="infinite-scroll-error-message-container">',
            '<i class="fa fa-exclamation-circle right-padding-xs color-red font-size-14" aria-hidden="true"></i>',
            '<div data-flex-width="1"><p>Error loading records.<span>{{#if message}} {{message}}{{else}} Response status: {{status}}, {{statusText}}.{{/if}}</span>{{#if logId}}<span> For defect reporting: {{logId}}</span>{{/if}}</p></div>',
            '</div>',
            '<div class="text-center bottom-padding-xs">',
            '<button type="button" class="btn btn-xs btn-default font-size-11 infinite-scroll-retry" title="Press enter to retry loading more records">',
            '<i class="fa fa-refresh right-margin-xs" aria-hidden="true"></i> Retry Loading',
            '</button>',
            '</div>',
        ].join('\n')),
        behaviors: {
            FlexContainer: {
                container: '.infinite-scroll-error-message-container',
                direction: 'row'
            }
        }
    });
    var EndOfCollectionIndicator = InfiniteScrollMessageView.extend({
        template: Handlebars.compile('All{{#if count}} {{count}}{{/if}} records are displayed.')
    });

    var InfiniteScroll = Backbone.Marionette.Behavior.extend({
        defaults: {
            getCollection: _.noop,
            scrollTriggerPoint: 40,
            tagName: {
                wrapper: 'div',
                content: 'div'
            },
            className: '',
            events: ''
        },
        events: {
            'click button.infinite-scroll-retry': function(event) {
                this._fetchRows(event);
                this._transferFocus();
            }
        },
        _transferFocus: function() {
            this.$(this.containerSelector).focus();
        },
        getEventsArray: function() {
            var events = [];
            var eventsOption = this.getOption('events');
            if (!_.isEmpty(eventsOption)) {
                if (_.isString(eventsOption)) {
                    events.push(eventsOption);
                } else if (_.isArray(eventsOption)) {
                    _.each(eventsOption, function(eventString) {
                        if (_.isString(eventString) && !_.isEmpty(eventString)) {
                            events.push(eventString);
                        }
                    });
                }
            }
            return events;
        },
        bindEvents: function() {
            var callback = _.bind(this._fetchRows, this);
            _.each(this.getEventsArray(), function(eventString) {
                this.$el.on(eventString, callback);
            }, this);
        },
        unbindEvents: function() {
            var callback = _.bind(this._fetchRows, this);
            _.each(this.getEventsArray(), function(eventString) {
                this.$el.off(eventString, callback);
            }, this);
        },
        serverCollectionEvents: {
            'sync': '_setScrollListener',
            'reset': '_cleanUpRegions',
            'page:fetch:error': '_onFetchError',
            'page:fetch': '_getNextPage'
        },
        initialize: function(options) {
            this.options = _.defaultsDeep({}, options, this.defaults);
            this._infiniteScrollRegionManager = new Backbone.Marionette.RegionManager();
            this.containerSelector = this.getOption('container');
        },
        onRender: function() {
            var collection = this.getOption('getCollection').call(this.view);
            if (collection instanceof Backbone.Collection && _.isFunction(collection.hasNextPage) && _.isFunction(collection.getNextPage)) {
                this.bindEntityEvents(this.getOption('getCollection').call(this.view), this.serverCollectionEvents);
            } else {
                console.warn('InfiniteScroll Behavior: Not valid collection', collection);
            }
        },
        onDomRefresh: function() {
            this._cleanUpRegions();
            this.unbindEvents();
        },
        onBeforeDestroy: function() {
            this._infiniteScrollRegionManager.destroy();
            if (!_.isUndefined(this._scrollElement)) {
                this._scrollElement.off('scroll.infinite');
            }
            this.unbindEvents();
        },
        /**
         * Registers a scroll listener on the DOM element specified by the
         * "container" option.
         * @private
         */
        _setScrollListener: function() {
            this._cleanUpRegions();
            this._scrollElement = this.$(this.containerSelector);
            if (!_.isEmpty(this._scrollElement)) {
                this._scrollElement.removeClass('no-scroll');
                if (!this.hasScrolling(this._scrollElement)) {
                    this._scrollElement.addClass('no-scroll');
                    var collection = this.getOption('getCollection').call(this.view);
                    if (collection.hasNextPage()) {
                        this._fetchRows();
                    } else if (!collection.isEmpty()) {
                        this._showIndicator({
                            type: 'end'
                        });
                    }
                } else if (!_.isEmpty(this._scrollElement)) {
                    this._scrollElement.on('scroll.infinite', _.bind(this._fetchRows, this));
                    this.bindEvents();
                }
            }
        },
        /**
         * Determines if the container is able to scroll
         * @private
         */
        hasScrolling: function(element) {
            return element[0].clientHeight !== element[0].scrollHeight;
        },
        /**
         * DOM scroll event callback that determines if the scrollTriggerPoint
         * has been reached. When applicable, call for the collection's next
         * page.
         * @private
         */
        _fetchRows: function(event) {
            this._scrollElement = this._scrollElement || this.$(this.containerSelector);
            var e = this._scrollElement[0];
            var collection = this.getOption('getCollection').call(this.view);
            if ((e.scrollTop + e.clientHeight + this.getOption('scrollTriggerPoint') > e.scrollHeight)) {
                this._scrollElement.off('scroll.infinite');
                this.unbindEvents();
                this._getNextPage(collection);
            }
        },
        /**
         * Handles calling for the next page of data
         * and updating the current status to the user.
         * @private
         */
        _getNextPage: function(collection) {
            if (collection.inProgress) {
                return;
            } else if (collection.hasNextPage()) {
                this._showIndicator();
                collection.getNextPage({
                    success: function(collection, resp, options) {
                        collection.trigger('page:fetch:success', collection, resp, options);
                    },
                    error: function(collection, resp, options) {
                        collection.trigger('page:fetch:error', collection, resp, options);
                    }
                });
            } else {
                this._showIndicator({
                    type: 'end'
                });
            }
        },
        /**
         * Generates and shows the appropriate indicator message to the user.
         * Supported indicators:
         *     - loading (default)
         *     - end
         *     - error
         * @private
         */
        _showIndicator: function(options) {
            this._cleanUpRegions();
            var opt = _.extend({
                type: 'loading',
                resp: {}
            }, options);
            this.$scrollingContainer = _.isString(this.containerSelector) ? this.$(this.containerSelector).first() : this.$el;
            if (this.$scrollingContainer instanceof jQuery && this.$scrollingContainer.length > 0) {
                var tagNameObject = _.isObject(this.getOption('tagName')) ? this.getOption('tagName') : _.get(this, 'defaults.tagName');
                var wrapperTagName = _.isString(tagNameObject.wrapper) && !_.isEmpty(tagNameObject.wrapper) ? tagNameObject.wrapper : 'div';
                var contentTagName = _.isString(tagNameObject.content) && !_.isEmpty(tagNameObject.content) ? tagNameObject.content : 'div';
                var className = this.getOption('className');
                className = _.isString(className) ? (_.startsWith(className, ' ') ? className : ' ' + className) : '';
                this.$scrollingContainer.append('<' + wrapperTagName + ' class="infinite-scrolling-indicator-container' + className + '"></' + wrapperTagName + '>');
                var InfiniteScrollIndicatorRegion = Backbone.Marionette.Region.extend({
                    el: this.$scrollingContainer.find('.infinite-scrolling-indicator-container')
                });
                this._infiniteScrollRegionManager.addRegions({
                    'infiniteScrollIndicator': InfiniteScrollIndicatorRegion
                });
                var IndicatorView, indicatorView;
                switch (opt.type) {
                    case 'loading':
                        IndicatorView = LoadingIndicator.extend({
                            tagName: contentTagName
                        });
                        indicatorView = new IndicatorView();
                        break;
                    case 'end':
                        IndicatorView = EndOfCollectionIndicator.extend({
                            tagName: contentTagName
                        });
                        indicatorView = new IndicatorView({
                            model: new Backbone.Model({
                                'count': this.getOption('getCollection').call(this.view).getTotalItems()
                            })
                        });
                        break;
                    case 'error':
                        IndicatorView = ErrorIndicator.extend({
                            tagName: contentTagName
                        });
                        indicatorView = new IndicatorView({
                            model: new Backbone.Model(opt.resp)
                        });
                        this.listenToOnce(indicatorView, 'attach', function() {
                            this.$scrollingContainer[0].scrollTop = this.$scrollingContainer[0].scrollHeight;
                        });
                        break;
                    default:
                        return;
                }
                this._infiniteScrollRegionManager.get('infiniteScrollIndicator').show(indicatorView);
            } else {
                console.warn('InfiniteScroll Behavior: Not valid jquery selector', this.containerSelector);
            }
        },
        _onFetchError: function(collection, resp) {
            if (_.isEqual(_.get(resp, 'statusText'), 'abort')) {
                this._cleanUpRegions();
                return;
            }
            this._showIndicator({
                type: 'error',
                resp: resp
            });
        },
        _cleanUpRegions: function() {
            if (this._infiniteScrollRegionManager && this._infiniteScrollRegionManager.get('infiniteScrollIndicator')) {
                this._infiniteScrollRegionManager.removeRegion('infiniteScrollIndicator');
            }
            if (this.$scrollingContainer && this.$scrollingContainer.children('.infinite-scrolling-indicator-container').length > 0) {
                this.$scrollingContainer.children('.infinite-scrolling-indicator-container').remove();
            }
        }
    });

    return InfiniteScroll;
});

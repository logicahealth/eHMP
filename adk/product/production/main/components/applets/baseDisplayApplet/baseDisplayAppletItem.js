define([
    'jquery',
    'underscore',
    'backbone',
    'api/Messaging',
    'hbs!main/components/views/appletViews/sharedTemplates/gistPopover',
    'main/adk_utils/crsUtil'
], function($, _, Backbone, Messaging, popoverTemplate, CrsUtil) {
    'use strict';

    var SCROLL_RATE = 50;
    var THROTTLE_RATE = 300;

    var BaseAppletItem = Backbone.Marionette.LayoutView.extend({
        className: 'gist-item',
        attributes: function() {
            var modelJSON = this.serializedData || this.serializeData();
            var rowId = (_.has(modelJSON, 'displayName') ? 'row_' + _.get(modelJSON, 'displayName') : 'row_' + _.get(modelJSON, 'uid'));

            return {
                'role': 'presentation',
                'data-row-instanceid': rowId,
                'data-code': _.get(modelJSON, 'dataCode')
            };
        },
        serializeData: function() {
            CrsUtil.applyConceptCodeId(this.model);
            if (this.serializedData) return this.serializedData;

            var serializer = _.get(this, 'appletOptions.serializeData');
            var gistModel = _.get(this, 'appletOptions.gistModel');
            var modelJSON;

            if (_.isFunction(serializer)) {
                modelJSON = serializer.apply(this, arguments);
            } else {
                if (_.isArray(gistModel)) {
                    modelJSON = this.model.toJSON();
                    _.each(gistModel, function(object) {
                        modelJSON[object.id] = modelJSON[object.field];
                    });
                } else if (_.isFunction(gistModel)) {
                    modelJSON = gistModel.call(this, this.model);
                } else {
                    modelJSON = this.model.toJSON();
                }
            }

            this.serializedData = modelJSON;
            return modelJSON;
        },
        ui: {
            popoverEl: '[data-toggle=popover]'
        },
        chartPointer: null,


        /**
         * The arg here is not normal it is passed through the constructor bellow
         * @param isTileSortEnabled
         * @return {*}
         */
        events: function(isTileSortEnabled) {
            var defaultEvents = {
                'click': function(e) {
                    var tileOptions = this.getOption('tileOptions', {});
                    var primaryAction = _.result(tileOptions, 'primaryAction', true);
                    if (primaryAction) {
                        if (!_.result(primaryAction, 'enabled', true)) return;
                        var onClick = _.get(primaryAction, 'onClick');
                        if (onClick) {
                            return onClick.call(this, e, this.model);
                        }
                    } else {
                        return;
                    }
                    var currentPatient = ADK.PatientRecordService.getCurrentPatient();
                    var channelObject = {
                        model: this.model,
                        collection: this.collection || _.get(this, 'model.collection'),
                        uid: this.model.get('uid'),
                        patient: {
                            icn: currentPatient.get('icn'),
                            pid: currentPatient.get('pid')
                        },
                        $el: this.$el
                    };
                    if (this.applet) {
                        channelObject.applet = this.applet;
                    }
                    this.$el.trigger('dropdown.hide');
                    Messaging.getChannel(this.model.get('applet_id')).trigger('detailView', channelObject);
                }
            };

            if (isTileSortEnabled) {
                return _.extend(defaultEvents, {
                    'dragstart': 'dragStart',
                    'dragover': 'dragOver',
                    'dragend': 'dragEnd',
                    'drag': 'drag',
                    'drop': 'drop'
                });
            }
            return defaultEvents;
        },

        initialize: function(options) {
            this.appletOptions = options.appletOptions;
            if (this.model) {
                this.model.set('userWorkspace', this._enableTileSorting);
            }
        },

        dragStart: function() {
            this.trigger('start:drag');
            this.$el.trigger('popover:disable');
            var $parent = this.$el.parent();
            var $placeholder = $parent.find('.placeholder');
            var offset = $parent.offset();
            var height = $parent.height();


            $placeholder.insertAfter(this.$el);

            this.originalIndex = this.$el.index();
            this.parentBoundries = {
                top: offset.top,
                bottom: offset.top + height
            };

        },

        drag: _.throttle(function(event) {
            var y = _.get(event, 'originalEvent.clientY');
            if (y > this.parentBoundries.top && y < this.parentBoundries.bottom) {
                return;
            }
            var offset = (y < this.parentBoundries.top) ? -SCROLL_RATE : SCROLL_RATE;
            offset += this.$el.parent().scrollTop();

            // Note: having the animation rate and the throttle rate being the same should
            // produce the most fluid scrolling
            this.$el.parent().animate({scrollTop: offset}, THROTTLE_RATE);
        }, THROTTLE_RATE),

        dragOver: _.throttle(function(event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            var $original = _.get(this, '_parent.childInDrag');
            if (!$original) {
                return;
            }

            if (_.get(event, 'target.className') === 'placeholder') {
                console.log('a');
                return;
            }

            $original.$el.css('display', 'none');

            var $placeholder = this.$el.parent().find('.placeholder');
            $placeholder.removeClass('hidden');

            if (this.$el.index() === 0) {
                $placeholder.insertBefore(this.$el);
            } else {
                $placeholder.insertAfter(this.$el);
            }
        }, THROTTLE_RATE),

        dragEnd: function(event) {
            event.preventDefault();

            var $placeholder = this.$el.parent().find('.placeholder');
            $placeholder.addClass('hidden');
            this.$el.css('display', 'block');

            var endIndex = $placeholder.index();
            if (this.originalIndex < endIndex) {
                endIndex -= 1;
            }
            this.$el.trigger('popover:enable');
            this.trigger('end:drag', this.originalIndex, endIndex);
        },

        drop: function(event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            var targetIndex = this.$el.index();

            var reorder = {
                oldIndex: this.originalIndex,
                newIndex: targetIndex
            };

            this.$el.trigger('reorder', reorder);
            this.trigger('after:drop');
        },

        onBeforeRender: function() {
            delete this.serializedData;
        }
    });


    //create a new object structure so that children inherit the render and initialize functions
    var Orig = BaseAppletItem;

    BaseAppletItem = Orig.extend({
        constructor: function() {
            if (!this.options) this.options = {};
            var args = Array.prototype.slice.call(arguments),
                init = this.initialize,
                currentScreen = Messaging.request('get:current:screen'),
                predefined = _.get(currentScreen, 'config.predefined', true),
                options = (args[0]) ? args[0] : null,
                appletOptions = (options && options.appletOptions) ? options.appletOptions : {},
                enableTileSorting = !!(appletOptions.enableTileSorting && !predefined),
                argEvents = (args[0]) ? _.extend({}, this.options.events || {}, args[0].events) : _.extend({}, this.options.events);
            this.initialize = function() {
                var args = Array.prototype.slice.call(arguments);
                this._enableTileSorting = enableTileSorting;
                Orig.prototype.initialize.apply(this, args);
                if (Orig.prototype.initialize === init) return;
                init.apply(this, args);
            };
            this.events = _.extend({},
                (_.isFunction(Orig.prototype.events)) ? Orig.prototype.events.call(this, enableTileSorting) : Orig.prototype.events,
                (_.isFunction(this.events)) ? this.events() : this.events,
                (_.isFunction(argEvents)) ? argEvents() : argEvents
            );
            if (args[0] && args[0].events) {
                //required or else Backbone will destroy our inherited events
                delete args[0].events;
            }
            if (this.options.events) {
                //required or else Backbone will destroy our inherited events
                delete this.options.events;
            }

            Orig.prototype.constructor.apply(this, args);
        }
    });

    return BaseAppletItem;
});
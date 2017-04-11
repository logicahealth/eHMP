define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'api/Messaging',
    'main/ui_components/applet_dropdown/component'
], function(Backbone, Marionette, $, Handlebars, Messaging, AppletDropdownView) {
    'use strict';

    var _salience = [
        'bg-danger',
        'bg-warning',
        'bg-success'
    ];

    var ButtonView = AppletDropdownView.prototype.ButtonView.extend({
        modelEvents: {
            'change:icon': 'render',
            'change:salience': 'render',
            'change:alert_count': 'render'
        },
        serializeModel: function(model) {
            var JSON = model.toJSON.apply(model, _.rest(arguments));

            var model_salienceNumber = model.get('salience');
            var function_salienceNumber =  (this.getSalience && _.isFunction(this.getSalience)) ? this.getSalience(model, this.collection) : null;
            var salienceNumber = model_salienceNumber || function_salienceNumber;
            if (_.isNumber(salienceNumber)) {
                var salience = _salience[model.get('salience') - 1];
                JSON.salience = salience;
            }

            var model_alerts = model.get('alert_count');
            var function_alerts =  (this.getAlertCount && _.isFunction(this.getAlertCount)) ? this.getAlertCount(model, this.collection) : null;
            var alerts = _.isNumber(model_alerts) ? model_alerts : function_alerts;
            if (_.isNumber(alerts)) {
                JSON.alert_count = alerts;
            } else {
                var collection = this.getOption('collection');
                if(_.isNumber(collection.length)) JSON.alert_count = collection.length;
            }

            return JSON;
        },
        initialize: function(options) {
            this.triggerMethod('before:initialize', options);
            if(this.getOption('getSalience')) this.getSalience = _.bind(this.getOption('getSalience'), this);
            if(this.getOption('getAlertCount'))this.getAlertCount = _.bind(this.getOption('getAlertCount'), this);
            this.triggerMethod('initialize', options);
        }
    });

    var RowView = Marionette.ItemView.extend({
        tagName: 'li',
        className: 'list-group-item bottom-margin-no',
        attributes: {
            role: 'presentation'
        },
        RowContentTemplate: '{{label}}',
        template: '<a href="#" class="btn btn-link btn-sm" title="{{title}}" role="menuitem" tabindex="-1"><div class="row"><div class="col-xs-1 left-padding-no"><i class="fa fa-arrow-right color-primary-dark top-margin-lg"></i></div><div class="col-xs-11 left-padding-no">{{content}}</div></div></a>',
        getTemplate: function() {
            var template = this.getOption('template');
            if(_.isFunction(template)) return template;
            return Handlebars.compile(template.replace(/{{content}}/, this.getOption('RowContentTemplate')));
        }
    });

    var DropdownListView = Marionette.CompositeView.extend({
        behaviors: {
            'KeySelect': {}
        },
        events: {
            'click .dropdown-footer button': function(e) {
                var footerButtonOptions = this.model.get('footerButton');
                Messaging.getChannel(this.getOption('key')).trigger(footerButtonOptions.eventName);
            }
        },
        attributes: {
            'role': 'menu'
        },
        template: Handlebars.compile([
            '{{#if dropdownTitle}}<div class="dropdown-header">',
            '<p>',
            '<strong>{{dropdownTitle}}</strong>',
            '{{#if count}}<span>({{count}})</span>{{/if}}',
            '</p>',
            '</div>{{/if}}',
            '<ul class="dropdown-body list-group"></ul>',
            '{{#if footerButton}}<div class="dropdown-footer">',
            '<button type="button" class="btn btn-link {{footerButton.extraClasses}}" title="{{footerButton.title}}">{{footerButton.label}}</button>',
            '</div>{{/if}}'
        ].join('\n')),
        childViewContainer: '.dropdown-body',
        serializeModel: function() {
            this.model.set('count', this.collection.length);
            return this.model.toJSON();
        },
        className: function() {
            var classes = ['dropdown-menu dropdown-complex', this.getOption('component') + '-menu'],
                rowClass = this.getOption('rowClass');

            if (rowClass) classes.push(rowClass);
            return classes.join(' ');
        }
    });
    var PageBlur = Backbone.Marionette.Behavior.extend({
        events: {
            'dropdown.show': function(thisE, e) {
                if (!this.view.isOpen() && this.backdrop) {
                    this.$el.addClass('blur-none');
                    $('html').addClass('page-blur');
                }
            },
            'dropdown.hide': function(thisE, e) {
                if (this.view.isOpen() && this.backdrop) {
                    this.$el.removeClass('blur-none');
                    $('html').removeClass('page-blur');
                }
            }
        },
        initialize: function() {
            this.backdrop = _.isBoolean(this.view.getOption('backdrop')) || false;
        }
    });
    var AlertDropdownView = AppletDropdownView.extend({
        behaviors: {
            ZIndex: {
                eventString: 'dropdown.shown',
                element: function() {
                    return this.DropdownRegion.$el.find('#' + this.getOption('dropdown_id') + ' .dropdown-menu');
                }
            }, PageBlur: {
                behaviorClass: PageBlur
            }
        },
        container: 'body',
        position: 'auto',
        RowView: RowView,
        ButtonTemplate: Handlebars.compile([
            '<i class="fa {{icon}} fa-2x"></i>',
            '{{#if alert_count}}',
            '<span class="badge font-size-11">{{alert_count}}</span>',
            '{{/if}}'
        ].join('\n')),
        options: _.extend({}, AppletDropdownView.prototype.options, {
            'component': 'alert-dropdown'
        }),
        align: 'middle',
        ButtonView: ButtonView,
        DropdownListView: DropdownListView,
        getMenu: function(view) {
            return view.$('.dropdown-body');
        },
        initialize: function() {
            var dropdownTitle = this.getOption('dropdownTitle');
            if (dropdownTitle && !this.model.get('dropdownTitle')) { //in case it's already set on the model
                this.model.set({
                    dropdownTitle: (_.isFunction(dropdownTitle)) ? dropdownTitle.call(this) : dropdownTitle
                });
            }
            var footerButton = this.getOption('footerButton');
            if (footerButton && !this.model.get('footerButton')) { //in case it's already set on the model
                this.model.set({
                    footerButton: (_.isFunction(footerButton)) ? footerButton.call(this) : footerButton
                });
            }
            _.extend(this.options, {
//                getSalience: this.getSalience || _.noop,
//                getAlertCount: this.getAlertCount || _.noop,
                collection: this.getOption('collection'),
                RowContentTemplate: this.getOption('RowContentTemplate')
            });
        },
        configureDropdownView: function(options) {
            var collection = this.getOption('collection');
            this.DropdownView = this.DropdownView.extend({
                collection: (_.isArray(collection)) ? new Backbone.Collection(collection) : collection,
                model: this.model,
                options: _.omit(this.options, 'model', 'tagName'),
                childViewOptions: options.childViewOptions || _.omit(this.options, 'model'),
                childView: this.getOption('RowView'),
                'events': {
                    'click [data-dismiss=dropdown]': _.bind(function(e) {
                        this.$el.trigger('dropdown.hide', e, this.$el);
                    }, this)
                }
            });
        },
        onRender: function() {
            if (this.getOption('align') === 'middle') this.ui.DropdownContainer.addClass('middle-arrow');
        },
        onBeforeDestroy: function(){
            this.$el.removeClass('blur-none');
            $('html').removeClass('page-blur');
        }
    });

    //attach these as options for the end user
    AlertDropdownView.DropdownListView = DropdownListView;
    AlertDropdownView.DropdownFormView = AppletDropdownView.DropdownFormView;
    AlertDropdownView.ButtonView = ButtonView;
    AlertDropdownView.RowView = RowView;

    return AlertDropdownView;
});
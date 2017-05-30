define([
	'backbone',
	'marionette',
	'handlebars',
	'underscore',
	'main/ui_components/form/classDefinitions',
	'main/ui_components/form/fieldsCollection',
	'main/ui_components/form/controls/controls'
], function(
	Backbone,
	Marionette,
	Handlebars,
	_,
	ClassDefinitions,
	Fields,
	FormControls
) {
	"use strict";

	return Backbone.Marionette.CompositeView.extend({
		tagName: "form",
		attributes: {
			'action': '#',
			'method': 'post'
		},
		className: function(){
			return "adk-form form-container";
		},
		template: Handlebars.compile('<p class="sr-only">* indicates a required field. Tab to enter form.</p>'),
		// onInitialize is an empty function by default. Override it with your own
		// initialization logic.
		onInitialize: function() {},
		initialize: function(options) {
			this.workflow = this.getOption('workflow');
			this.viewIndex = this.getOption('viewIndex');
			this.beforeGoingToStep = this.getOption('beforeGoingToStep');
			if (!_.isUndefined(this.methodType)) {
				this.$el.attr('method', this.methodType);
			}

			if (!(options.fields instanceof Backbone.Collection))
				options.fields = new Fields(options.fields || this.fields);
			this.fields = options.fields;
			this.collection = this.fields;
			var events = _.defaults({
				'register:control:validate:method': function(event, func) {
					if (_.isFunction(func)) {
						if (_.isFunction(this.model.validate)) {
							this.model.validate = _.compose(func, this.model.validate);
						} else {
							this.model.validate = _.compose(func, _.noop);
						}
					}
				}
			}, this.events);
			this.delegateEvents(events);
			this.model.errorModel = options.errorModel || this.model.errorModel || new Backbone.Model();
			this.model._formView = this;
			this._setUpModelEvents();
			this.onInitialize(options);
		},
		// onRenderCollection calls bindUIElements to allow the form to use the UI hash appropriately.
		onRenderCollection: function() {
			this.bindUIElements();
		},
		childViewOptions: function(model, index) {
			return {
				field: model,
				model: this.model
			};
		},
		getChildView: function(item) {
			return (item.get('control'));
		},
		_setUpModelEvents: function() {
			this.model.set('_labelsForSelectedValues', new Backbone.Model());
			this.listenTo(this.model, 'labelsForSelectedValues:update', function(id, value) {
				this.model.get('_labelsForSelectedValues').set(id, value);
			});
		},
		transferFocusToFirstError: function() {
			var stringOfErrorFields = [
				'.' + ClassDefinitions.errorClassName + ' input:not(.tt-hint, .bootstrap-timepicker-hour, .bootstrap-timepicker-minute, .clone-input)',
				'.' + ClassDefinitions.errorClassName + ' select:not(.select2-hidden-accessible)',
				'.' + ClassDefinitions.errorClassName + ' .select2-selection',
				'.' + ClassDefinitions.errorClassName + ' textarea'
			].join(", ");
			this.$(stringOfErrorFields).first().focus();
		}
	});
});
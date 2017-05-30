define([
	'main/resources/abstract',
], function(Abstract) {
	"use strict";

	var collectionEvents = ['sync', 'invalid', 'sort', 'reset', 'request', 'error', 'fetch'];

	var AggregateModelAbstract = Abstract.Model.extend({
		defaults: function() {
			return {
				collection: new this.Collection()
			};
		},
		initialize: function() {
			//controls the grouped collections
			if (!(this.get('collection') instanceof Backbone.Collection)) this.set('collection', new Backbone.Collection());
			this.listenTo(this.get('collection'), 'add remove change reset', this._update);
		},
		_update: function(model, previousModels, options) {
			var collection = this.getCollection();
			if (!collection.length) {
				this.collection.remove(this);
				return;
			}

			this.update.apply(this, arguments);
		},
		getCollection: function() {
			return this.get('collection');
		},
		update: function(model, previousModels, options) {
			//build the aggregate data
			//var collection = this.get('collection');
			//var results = {
			//    count: collection.count
			//    maxDateModel: collection.max(date)
			//};
			//this.set(results);
		}
	});

	var AggregateCollectionAbstract = Abstract.Collection.extend({
		setFullCollection: function(collectionInstance) {
			if(this.collection) {
				this.stopListening(this.collection);
				if(this.collection !== collectionInstance) {
					this.reset(null, {silent:true});
				}
			}
			this.collection = collectionInstance;
			if(collectionInstance.length) {
				_.each(collectionInstance.models, function(model) {
					this.update(model, collectionInstance, {
						silent: true
					}, 'add');
				}, this);
			}
			this.bindEntityEvents();
		},
		bindEntityEvents: function bindEntityEvents() {
			//controls the master collection
			this.listenTo(this.collection, 'add', _.partialRight(this.update, 'add'));
			this.listenTo(this.collection, 'remove', _.partialRight(this.update, 'remove'));
			this.listenTo(this.collection, 'change:' + this.groupId, _.partialRight(this.update, 'change'));
			this.listenTo(this.collection, 'reset', function(collection, options) {
				this.reset(collection.models, options);
			});
			this.listenTo(this.collection, 'request', function() {
				//prevent a double tap since we might be wrapping fetchCollection
				delete this.readComplete;
			});
			this.listenTo(this.collection, 'all', function() {
				var splitEvent = arguments[0].split(':');
				var found = false;
				_.each(splitEvent, function(event_string) {
					if (this.methodMap[event_string] || _.includes(collectionEvents, event_string)) {
						found = true;
						return false;
					}
				}, this);
				if (found && !this.readComplete)
					Marionette.triggerMethod.apply(this, arguments);
				//set the flag if we've seen this event once
				//both this abstract and fetchCollection will fire this event, so we
				//only want to process it once or else we'll be re-rending views for no reason
				if (splitEvent[0] === 'read' || splitEvent[0] === 'fetch') this.readComplete = true;
			});
		},
		update: function update(model, collection, options, eventName) {
			var searchItem = {};
			if (_.isArray(this.groupId)) {
				_.each(this.groupId, function(id) {
					searchItem[id] = model.get(id);
				});
			} else {
				searchItem[this.groupId] = model.get(this.groupId);
			}
			var aggregateModel = this.findWhere(searchItem);
			var aggregateCollection;
			var emptySet = false;
			if (!aggregateModel) {
				aggregateModel = new this.Model();
				emptySet = true;
			}
			aggregateCollection = aggregateModel.get('collection');
			switch (eventName) {
				case 'add':
					aggregateCollection.add(model);
					break;
				case 'remove':
					aggregateCollection.remove(model);
					if (!aggregateCollection.length) {
						this.remove(aggregateModel);
					}
					emptySet = false;
					break;
				case 'change':
					var removedModel = aggregateCollection.remove(model);
					this.update(removedModel, collection, options, 'add');
					emptySet = false;
					break;
			}
			if (emptySet) this.add(aggregateModel);
		}
	});

	return {
		Collection: AggregateCollectionAbstract,
		Model: AggregateModelAbstract
	};
});
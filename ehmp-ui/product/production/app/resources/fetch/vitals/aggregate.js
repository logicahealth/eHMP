define([
	'backbone',
	'underscore',
	'app/resources/fetch/vitals/collection',
	'app/resources/fetch/vitals/utils'
], function(Backbone, _, Vitals, Utils){
	'use strict';

	var AggregateModel = ADK.Resources.Aggregate.Model.extend({
		defaults: function() {
			var ChildCollection = this.Collection.extend({
				comparator: 'observed'
			});
			return {
				collection: new ChildCollection(),
				'observationType': 'vitals',
				'applet_id': 'vitals',
				'vitalColumns': true,
				'observed': ''
			};
		},
		update: function(model, previousModels, options) {
			var collection = this.getCollection();
			var mostRecentModel = collection.max('observed');
			if(mostRecentModel instanceof Backbone.Model) {
				this.set('noRecordsFound', false);
				this.set(mostRecentModel.attributes, {silent: true});
			}
		}
	});

	var ExtendedBPVitalsCollection = Vitals.Collection.extend({
		parse: function(response) {
			var vitals = _.get(response, 'data.items', []);
			var filteredVitals = [];

			_.each(vitals, function(vital) {
				var displayName = Utils.getDisplayName(vital);

				if (_.contains(this.vitalTypes, displayName)) {
					filteredVitals.push(vital);
				} else if (displayName === 'BP' && this.splitBP) {
					var splitVitals = Utils.splitBpVital(vital);
					filteredVitals.push(splitVitals.bps);
					filteredVitals.push(splitVitals.bpd);
				}
			}, this);

			return filteredVitals;
		}
	});

	var Aggregate = ADK.Resources.Aggregate.Collection.extend({
		initialize: function(models, options) {
			this.setFullCollection(new ExtendedBPVitalsCollection());
		},
		groupId: 'displayName',
		Model: AggregateModel,
		comparator: 'order',
		setInitialCollection: function(vitalTypes) {
			if (!this.isEmpty()) {
				this.reset(null, {silent: true});
			}

			if (!this.collection.isEmpty()) {
				this.collection.reset(null, {silent: true});
			}

			if (!_.isEmpty(vitalTypes)) {
				_.each(vitalTypes, function(vitalType, index) {
					var model = new AggregateModel({
						order: index,
						displayName: vitalType,
						typeName: vitalType,
						noRecordsFound: true,
						resultUnitsMetricResultUnits: 'No Records Found',
						descriptionColumn: Utils.getGistDescriptionColumn(vitalType),
					});
					this.add(model);
				}, this);
			}
		},
		fetchCollection: function(criteria, splitBP, vitalTypes) {
			this.setInitialCollection(vitalTypes);
			this.collection.fetchCollection(criteria, splitBP, vitalTypes);
			this.url = this.collection.url;
		}
	});

	return Aggregate;
});
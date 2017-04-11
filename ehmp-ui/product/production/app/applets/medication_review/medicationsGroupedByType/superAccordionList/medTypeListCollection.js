define([
    'underscore',
    'backbone',
    'app/applets/medication_review/medicationsGroupedByType/superAccordionRow/medTypeRowModel'
], function(_, Backbone, MedTypeRowModel) {
    'use strict';

    return Backbone.Collection.extend({
        model: MedTypeRowModel,
        initialize: function(collection, options) {
            this.earliestStartAsEpoch = Number.POSITIVE_INFINITY;
            var self = this;
            options.channel.reply('earliestStartAsEpoch', function() {
                return self.earliestStartAsEpoch;
            });
        },
        onTextFilteredCollectionReset: function(textFilteredCollection) {
            var groupArrays = textFilteredCollection.groupBy(function(medModel) {
                return medModel.getType();
            });
        },
        parse: function(incomingCollection, options) {
            var groupArrays;
            var self = this;
            if (this.earliestStartAsEpoch === Number.POSITIVE_INFINITY && ADK.SessionStorage.getModel('globalDate').get('selectedId') === 'allRangeGlobal') {
                groupArrays = incomingCollection.groupBy(function(medModel) {
                    var overallStart = medModel.getOverallStartAsMoment();
                    if (overallStart.isValid() && overallStart.valueOf() < self.earliestStartAsEpoch) {
                        self.earliestStartAsEpoch = overallStart.valueOf();
                    }
                    return medModel.getType().type;
                });
            } else {
                groupArrays = incomingCollection.groupBy(function(medModel) {
                    return medModel.getType().type;
                });
            }

            var medType;
            for (var i = 0; i < options.listOrder.required.length; i++) {
                medType = options.listOrder.required[i].requiredType;
                if (!groupArrays[medType]) {
                    groupArrays[medType] = options.listOrder.required[i];
                }
            }

            var groups = [];
            if (options.listOrder.type) {
                _.each(options.listOrder.type, function(type) {
                    if (groupArrays[type]) {
                        groups.push(groupArrays[type]);
                    }
                });
            } else {
                groups = _.values(groupArrays);
            }
            return groups;
        }
    });
});
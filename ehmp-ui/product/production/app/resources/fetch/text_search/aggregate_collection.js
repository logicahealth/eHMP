define([
    'underscore',
    'app/resources/fetch/text_search/collection',
    'app/resources/fetch/text_search/model',
    'app/resources/fetch/text_search/util'

], function(_, Collection, Model, searchUtil) {
    "use strict";
    var TextSearchCollection = Collection.extend({
        model: Model,
        comparator: 'summary'
    });

    var AggregateModel = ADK.Resources.Aggregate.Model.extend({
        defaults: function() {
            var ChildCollection = this.Collection.extend({
                comparator: function(model) {
                    return model.get('summary');
                }
            });
            return {
                'collection': new ChildCollection()
            };
        },
        update: function(model) {
            var highlightedGroupName = _.get(model, 'attributes.highlights.kind');
            if (!highlightedGroupName) {
                highlightedGroupName = ADK.utils.stringUtils.addSearchResultElementHighlighting(model.get('kind'), searchUtil.getKeywords());
            }
            var result = {
                'subGroup': model.get('subGroup'),
                'kind': model.get('kind'),
                'groupName': highlightedGroupName,
                'summary': model.get('summary')
            };
            this.set(result);
        }
    });

    var AggregateCollection = ADK.Resources.Aggregate.Collection.extend({
        initialize: function() {
            this.setFullCollection(new TextSearchCollection());
        },
        groupId: 'kind', //model needs to have this attribute to group
        comparator: 'kind',
        Model: AggregateModel,
        fetchCollection: function fetchCollection(options) {
            this.collection.fetchCollection(options);
            this.url = this.collection.url; //make the resource service happy
        }
    });
    return AggregateCollection;
});
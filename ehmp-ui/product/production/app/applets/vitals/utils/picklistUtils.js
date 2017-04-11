define([
    'backbone'
], function(Backbone) {
    "use strict";

    var PicklistUtil = {
        getQualifier: function(list, type, category){
            var qualifiers = [];
            var qualifier = _.findWhere(list, {name: type});

            if(qualifier && qualifier.categories){
                var categoryItem = qualifier.categories.findWhere({categoryName : category});

                if(categoryItem.get('qualifiers')){
                    _.each(categoryItem.get('qualifiers').models, function(item){
                        qualifiers.push({label: item.get('name'), value: item.get('ien')});
                    });
                }
            }
            return qualifiers;
        },
        getIENMap: function(list){
            var ienMap = {};
            _.each(list, function(item){
                ienMap[item.name] = item.ien;
            });
            return ienMap;
        }
    };

    return PicklistUtil;
});
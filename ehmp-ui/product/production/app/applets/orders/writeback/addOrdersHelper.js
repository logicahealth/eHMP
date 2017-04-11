define([
    "backbone",
    "marionette",
    "underscore"
], function(Backbone, Marionette, _) {
    "use strict";

    var Helper = {};

    Helper.getSelectControlSorter = function(data, params) {
        var filterText = params.term;
        if (filterText) {
            var first = [];
            var others = [];
            var filterTextLower = filterText.toLowerCase();
            data.forEach(function(item){
                var text = item.text.toLowerCase();

                if (text.indexOf(filterTextLower) === 0) {
                    first.push(item);
                } else {
                    others.push(item);
                }
            });
            return first.concat(others);
        }
        else {
            return data;
        }
    };

    Helper.generateCollectionSamplePicklist = function(collSamp) {
        var collectionSampleList = [];
        var previousEntry = null;
        var text = '';
        collSamp.values.forEach(function(entry) {
            if (!_.isUndefined(entry.text)) {
                text += entry.text;
            } else if (!_.isUndefined(entry.ien)) {
                if (!_.isEmpty(previousEntry)) {
                    if (text !== '') {
                        previousEntry.text = text;
                        text = '';
                    }
                    collectionSampleList.push(previousEntry);
                }
                previousEntry = entry;
            }
        });
        if (text !== '') {
            previousEntry.text = text;
        }
        collectionSampleList.push(previousEntry);
        collectionSampleList.forEach(function(collectionSample){
            if (!_.isUndefined(collectionSample.tubeTop) && collectionSample.tubeTop !== '') {
                collectionSample.displayName = collectionSample.name + ' (' + collectionSample.tubeTop + ')';
            }
            else {
                collectionSample.displayName = collectionSample.name;
            }
        });
        return collectionSampleList;
    };

    Helper.labCanCollect = function(labCollSampDefault, collSampList) {
        var labCanCollect = false;

        if (!_.isUndefined(collSampList)){
            var selectedCollectionSample = _.filter(collSampList, function(e) {
                return e.n == labCollSampDefault;
            });
            if (!_.isEmpty(selectedCollectionSample)) {
                labCanCollect = true;
            }
        }
        return labCanCollect;
    };

    return Helper;
});

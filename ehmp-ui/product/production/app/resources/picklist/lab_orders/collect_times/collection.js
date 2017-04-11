define([], function() {

    var CollectTimes = ADK.Resources.Picklist.Model.extend({
        label: 'text'
    });

    var collectTimes = ADK.Resources.Picklist.Collection.extend({
        type: 'lab-collect-times',
        model: CollectTimes
    });

    return collectTimes;
});
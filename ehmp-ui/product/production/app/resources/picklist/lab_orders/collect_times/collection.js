define([], function() {

    var CollectTimes = ADK.Resources.Picklist.Model.extend({
        label: 'text'
    });

    var collectTimes = ADK.Resources.Picklist.Collection.extend({
        resource: 'write-pick-list-lab-collect-times',
        model: CollectTimes
    });

    return collectTimes;
});
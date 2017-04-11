define([
    'underscore'
], function(_) {
    var notes = ADK.Resources.Writeback.Collection.extend({
        comparator: function(left, right) {
            var l = this.getComparatorValue(left);
            var r = this.getComparatorValue(right);
            return r - l;
        },
        getComparatorValue: function(model) {
            var referenceDateTime = model.get('referenceDateTime');
            var entered = model.get('entered');
            //need to sort notes without a reference date before notes with a reference date
            if (referenceDateTime) {
                return (referenceDateTime.length === 12 ? referenceDateTime + '00' : referenceDateTime) * 1;
            } else {
                //multiply the entered date by 10 so it will sort before the reference dates.
                return entered * 10;
            }
        },
        parse: function(items, options) {
            if (!_.isArray(items)) {
                items = [items];
            }
            _.each(items, function(item) {
                if (item instanceof Backbone.Model) {
                    item.set('itemUniqueID', item.get('uid').replace(/\:/g, '_') + '_' + item.get('displayGroup'));
                } else {
                    item.itemUniqueID = item.uid.replace(/\:/g, '_') + '_' + item.displayGroup;
                }
                delete item._labelsForSelectedValues;
            });
            return items;
        }
    });
    return notes;
});
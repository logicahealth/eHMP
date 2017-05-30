define([], function () {
    'use strict';

    var Allergen = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'name',
        //label: 'name',

        //an exacmple of how dynamic mapping can be done
        label: {
            defaultLabel: 'name',
            filters: [{
                'name': 'ABCIXIMAB', //if this.get('name') === 'ABCIX...' then
                'label': 'ien' //set the label to this.get('ien')
            }, {
                'name': 'ABC COMPOUND WITH CODEINE #3', //if this.get('name') === 'ABC...' and
                'ien': '1099', // this.get('ien') === '1099' then
                'label': 'WOOT' //set the label to this.get('WOOT') or 'WOOT'
            }, {
                'name': function (attr) { //need a custom comparision such as a date?  no problem!
                    return this.get(attr).search('ABC CPD AND') >= 0;
                },
                'label': function () { //can use a function for label too
                    return 'Custom Label';
                }
            }] //if none of the conditions are met, set the label to this.get('name') or 'name'
        },
        defaults: {
            file: '',
            foodDrugOther: '',
            ien: '',
            name: '',
            source: ''
        }
    });

    var AllergenGroup = ADK.Resources.Picklist.Group.extend({
        idAttribute: 'source',
        groupLabel: 'categoryName',
        picklist: 'allergens',
        Collection: ADK.Resources.Picklist.Collection.extend({
            model: Allergen
        }),
        defaults: {
            categoryName: '',
            source: '',
            name: '',
            top: '',
            plus: '',
            allergens: []
        }
    });

    var allergies = ADK.Resources.Picklist.Collection.extend({
        resource: 'write-pick-list-allergies-match',
        model: AllergenGroup,
        params: function (method, options) {
            return {
                searchString: options.searchString || '',
            };
        }
    });

    return allergies;
});
define([], function() {

    var Allergen = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'ien', //primary key--can't have duplicates
        label: 'name',
        value: function() {
            return this.get('ien') + ';' + this.get('file');
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
            top: '',
            plus: '',
            allergens: []
        }
    });

    var allergies = ADK.Resources.Picklist.Collection.extend({
        resource: 'write-pick-list-allergies-match',
        model: AllergenGroup,
        params: function(method, options) {
            return {
                searchString: options.searchString || '',
            };
        }
    });

    return allergies;
});
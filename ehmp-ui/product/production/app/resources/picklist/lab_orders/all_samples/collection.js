define([], function() {

    var generateDisplayName = function() {
        var displayName = '';
        if (!_.isEmpty(this.get('tubeTop'))) {
            displayName = this.get('name') + ' (' + this.get('tubeTop') + ')';
        } else {
            displayName = this.get('name');
        }
        return displayName;
    };

    var Sample = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'ien', //primary key--can't have duplicates
        label: generateDisplayName,
        //since value isn't defined, the model's cid will automatically
        //be added to the attributes and made the value so that a unique lookup exists
        value: function() {
            return this.get('ien');
        },
        toPicklist: function() {
            return {
                ien: this.get('ien'),
                labCollect: this.get('labCollect'),
                name: this.get('name'),
                specName: this.get('specName'),
                specPtr: this.get('specPtr'),
                tubeTop: this.get('tubeTop'),
                label: generateDisplayName.apply(this)
            };
        },
        childAttributes: ['ien', 'labCollect', 'name', 'specName', 'specPtr', 'tubeTop'],
        defaults: {
            ien: '',
            labCollect: '',
            name: '',
            specName: '',
            specPtr: '',
            tubeTop: ''
        }
    });

    var SamplesGroup = ADK.Resources.Picklist.Group.extend({
        idAttribute: 'source', //primary key, might be useful to omit in some cases
        groupLabel: 'categoryName', //attribute that will be the group
        //picklist is the attribute that will be parsed into a Collection
        //and will be set as the picklist attribute in grouped lists
        picklist: 'values',
        Collection: ADK.Resources.Picklist.Collection.extend({
            model: Sample
        }),
        defaults: { //remember to include every field
            ien: '',
            labCollect: '',
            name: '',
            specName: '',
            specPtr: '',
            tubeTop: '',
            samples: [] //this will be parsed into a Collection
        }
    });

    var samples = ADK.Resources.Picklist.Collection.extend({
        resource: 'write-pick-list-lab-all-samples',
        model: SamplesGroup,
        params: function(method, options) {
            return { //allergies.fetch({'searchString': 'ABC'})
                searchString: options.searchString || ''
            };
        }
    });

    return samples;
});
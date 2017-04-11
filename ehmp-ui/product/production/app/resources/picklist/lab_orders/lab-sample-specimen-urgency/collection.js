define([], function() {

    var labSampleSpecimenUrgency = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'ien',
        label: 'name',
        value: 'code',
        childParse: true
    });

    var labSampleSpecimenUrgencyGroup = ADK.Resources.Picklist.Group.extend({
        idAttribute: 'source', //primary key, might be useful to omit in some cases
        groupLabel: 'categoryName', //attribute that will be the group
        //picklist is the attribute that will be parsed into a Collection
        //and will be set as the picklist attribute in grouped lists
        picklist: ['values', 'default'],
        Collection: ADK.Resources.Picklist.Collection.extend({
            model: labSampleSpecimenUrgency
        }),
        defaults: { //remember to include every field
            values: ['name', 'code'] //this will be parsed into a Collection
        }
    });

    var labSampleSpecimens = ADK.Resources.Picklist.Collection.extend({
        resource: 'write-pick-list-lab-sample-specimen-urgency',
        model: labSampleSpecimenUrgencyGroup,
        params: function(method, options) {
            return {
                labTestIEN: options.labTestIEN,
                site: this.user.get('site')
            };
        }
    });

    return labSampleSpecimens;
});
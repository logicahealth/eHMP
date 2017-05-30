define([], function () {
    'use strict';

    var Diagnosis = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'icdCode',
        label: 'display',
        name: 'name',
        value: 'icdCode',
        defaults: {
            icdCode: '',
            name: '',
            label: '',
            value: false,
            primary: false
        },
        childParse: false,
        parse: function (response, options) {
            var data = response;
            data.label = response.name + ' (' + response.icdCode + ')';
            data.id = this.cid;
            return data;
        }
    });

    var DiagnosesCategory = ADK.Resources.Picklist.Group.extend({
        idAttribute: 'categoryName',
        groupLabel: 'categoryName',
        picklist: 'values',
        Collection: ADK.Resources.Picklist.Collection.extend({
            model: Diagnosis
        }),
        defaults: {
            categoryName: 'OTHER DIAGNOSES',
            values: new Backbone.Collection()
        },
        initialize: function () {
            this.listenTo(this.get('values'), 'change:value', function (changed) {
                this.trigger('diagnoses:change', changed);
            });
            this.listenTo(this.get('values'), 'change:primary', function (changed) {
                this.trigger('primaryDiag:change', changed);
            });
        }
    });

    var Diagnoses = ADK.Resources.Picklist.Collection.extend({
        type: 'write-pick-list',
        model: DiagnosesCategory,
        params: function (method, options) {
            return {
                type: 'encounters-diagnosis-codes-for-clinic',
                dateTime: options.dateTime || '',
                site: this.user.get('site'),
                locationUid: options.locationUid || ''
            };
        }
    });

    return Diagnoses;

});
define([
    'backgrid',
    'moment',
    'app/applets/newsfeed/newsfeedUtils',
    'hbs!app/applets/newsfeed/summary/visit_templates/stopCodeVisitTemplate',
    'hbs!app/applets/newsfeed/summary/visit_templates/emergencyDeptVisitTemplate',
    'hbs!app/applets/newsfeed/summary/visit_templates/defaultVisitTemplate',
    'hbs!app/applets/newsfeed/summary/visit_templates/admittedPatientTemplate',
    'hbs!app/applets/newsfeed/summary/visit_templates/dischargedPatientTemplate',
    'hbs!app/applets/newsfeed/summary/immunization_templates/immunizationTemplate',
    'hbs!app/applets/newsfeed/summary/surgery_templates/surgeryTemplate',
    'hbs!app/applets/newsfeed/summary/consult_templates/consultTemplate',
    'hbs!app/applets/newsfeed/summary/procedure_templates/procedureTemplate',
    'hbs!app/applets/newsfeed/summary/laboratory_templates/laboratoryTemplate'
], function(Backgrid, moment, newsfeedUtils, stopCodeVisitTemplate, emergencyDeptTemplate, defaultVisitTemplate, admittedPatientTemplate, dischargedPatientTemplate, immunizationTemplate, surgeryTemplate, consultTemplate, procedureTemplate, laboratoryTemplate) {
    'use strict';

    var templateSelector = function(model) {
        var json = model.toJSON();
        var content;
        var templateName = newsfeedUtils.templateSelector(json);

        switch(templateName) {
            case 'emergencyDeptTemplate' :
                return emergencyDeptTemplate(json);
            case 'dischargedPatientTemplate' :
                model.set('ext_filter_field', 'discharged');
                return dischargedPatientTemplate(json);
            case 'admittedPatientTemplate' :
                model.set('ext_filter_field', 'admitted');
                return admittedPatientTemplate(json);
            case 'stopCodeVisitTemplate' :
                var activityDateTimeMoment = moment(json.activityDateTime, 'YYYYMMDDHHmmss');
                if (activityDateTimeMoment.isAfter(moment())){
                    model.set('ext_filter_field','to be seen in');
                } else {
                    model.set('ext_filter_field','seen in');
                }
                return stopCodeVisitTemplate(json);
            case 'defaultVisitTemplate' :
                model.set('ext_filter_field', 'visit');
                return defaultVisitTemplate(json);
            case 'immunizationTemplate' :
                return immunizationTemplate(json);
            case 'surgeryTemplate' :
                content = model.get('typeName') + ' surgery completed';
                model.set('ext_filter_field', content);
                return surgeryTemplate(json);
            case 'procedureTemplate' :
                if (model.get('statusName').toLowerCase() === 'complete'){
                    model.set('ext_filter_field', 'completed');
                } else {
                    model.set('ext_filter_field', model.get('statusName'));
                }
                return procedureTemplate(json);
            case 'consultTemplate' :
                if (model.get('category').toLowerCase() === 'p'){
                    if (model.get('statusName').toLowerCase() === 'pending') {
                        content = 'pending ';
                    }
                    content += model.get('orderName') + ' ordered';
                    if (model.get('providerDisplayName')) {
                        content += ' by ' + model.get('providerDisplayName');
                    }
                } else {
                    if (model.get('statusName').toLowerCase() === 'pending') {
                        content = 'pending ';
                    }
                    content += 'consulted ' + model.get('orderName');
                }
                model.set('ext_filter_field', content);
                return consultTemplate(json);
            case 'laboratoryTemplate' :
                content = model.get('typeName') + ' - ' + model.get('specimen');
                model.set('ext_filter_field', content);
                return laboratoryTemplate(json);
        }
    };

    var ActivityCell = Backgrid.StringCell.extend({
        render: function() {
            this.$el.html(templateSelector(this.model));
            return this;
        }
    });

    return ActivityCell;
});

define([], function() {
    'use strict';

    var NoteProblem = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'uid',
        label: 'icdName',
        value: 'uid',
        childParse: 'false',
    });

    var NoteProblems = ADK.Resources.Picklist.Collection.extend({
        model: NoteProblem,
        getUrl: function(method, options) {
            var pid = this.patient.get('pid');
            var url = 'resource/patient/record/domain/problem?filter=ne(removed%2C%20true)&pid=' + pid;
            if (ADK.PatientRecordService.getCurrentPatient().get('acknowledged')) {
                return url + '&_ack=true';
            }
            return url;
        },
        parse: function(resp) {
            // Filter the data items based on presence (or lack) of SNOMED code values. This is based
            // on the Team Saturn routine for determining the correct problem text to use.
            var items = resp.data.items || [];
            var results = _.map(items, function(item) {
                if (item.problemText && item.statusName === 'ACTIVE') {
                    var icd9Index = item.problemText.indexOf('(ICD-9');
                    if (icd9Index > 0) {
                        item.problemText = item.problemText.substring(0, icd9Index).trim();
                    }
                    var sctIndex = item.problemText.indexOf('(SCT');
                    if (sctIndex > 0) {
                        item.problemText = item.problemText.substring(0, sctIndex).trim();
                    }
                    return {
                        uid: item.uid,
                        icdName: item.problemText
                    };
                }
            });

            // 'result' now contains the raw label value pairs.  From here, we filter blank entries,
            // remove duplicate entries, then sort by label name.
            return _(results)
                .filter('icdName')
                .unique('icdName')
                .sortBy('icdName')
                .value();
        }
    });

    return NoteProblems;
});
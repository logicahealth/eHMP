define([], function() {
    var labSupportData = ADK.Resources.Writeback.Model.extend({
        resource: 'lab-support-data',
        parse: function(resp, options) {
            var isValid = (_.get(resp, 'data[0].isValid') === '1');
            var labSpecimens = _.map(resp.data, function(item){
                return { ien: item.id, name: item.name};
            });
            labSpecimens.push({
                ien: '0',
                name: 'Other'
            });

            return {
                maxDays: _.get(resp, 'data[0]', 0),
                isValid: isValid,
                validationMessage: _.get(resp, 'data[0].validationMessage', 'Error occurred validateImmediateCollectDateTime'),
                labSpecimens: labSpecimens
            };
        }
    });

    return labSupportData;
});
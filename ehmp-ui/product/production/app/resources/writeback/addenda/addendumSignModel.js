define([
    'underscore',
    'app/resources/writeback/esignature/model',
], function(_, ESignatureModel) {
    var AddendumSignModel = ESignatureModel.extend({
            resource: 'addendum-sign',
            parse: function(resp) {
                var successes = resp.data.successes;
                if (successes && successes.signedAddendums && successes.signedAddendums.length > 0) {
                    resp.data.successes = new Backbone.Collection(successes.signedAddendums);
                }
                return resp.data;
            }
        });

    return AddendumSignModel;

});
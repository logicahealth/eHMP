define([
    'backbone',
    'marionette',
    'jasminejquery',
    'test/stubs',
    'require'
], function(Backbone, Marionette, jasminejquery, Stubs, require) {
    'use strict';

    require(['app/resources/fetch/community_health_summaries/model'], function(CcdModel) {
        describe('Test for community health summaries model parse', function() {

            it('Should return model properties correctly', function() {
                var initialJSON = {
                    'creationTime': '20140617014108',
                    'dateTime': '20100101010100',
                    'authorList': [{
                        institution: "Kaiser Permanente"
                    }]
                };

                var parsedJSON = CcdModel.prototype.parse(initialJSON);
                expect(parsedJSON.ccdDateTime).toEqual('20140617014108');

                delete initialJSON.creationTime;
                parsedJSON = CcdModel.prototype.parse(initialJSON);
                expect(parsedJSON.ccdDateTime).toEqual('20100101010100');

                expect(parsedJSON.authorDisplayName).toEqual('Kaiser Permanente');

                initialJSON.authorList = {};
                parsedJSON = CcdModel.prototype.parse(initialJSON);
                expect(parsedJSON.authorDisplayName).toEqual('N/A');
            });

        });
    });
});
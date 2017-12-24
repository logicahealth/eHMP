define([
    'underscore',
    'app/resources/fetch/permission/test/unit/mock-data',
    'app/resources/fetch/permission/permissions-features-collection'
], function(_, mock, Collection) {
    'use strict';


    describe('Permission Features Collection', function() {
        var collection;

        beforeEach(function() {
            collection = new Collection(mock.featureCollection(), {parse: true});
        });

        it('creates a picklist array correctly', function() {
            var array = collection.toPicklistArray();


            collection.each(function(model, index) {
                var item = array[index];
                _.each(model.keys(), function(key) {
                    expect(item[key]).toEqual(model.get(key));
                });
                expect(item.preselected).toBe(false);
                expect(item.selected).toBe(false);
            });
        });

        it('creates a picklist collection correctly', function() {
           var picklist = collection.toPicklist();

           collection.each(function(model, index) {
               var picklistModel = picklist.at(index);
               _.each(model.keys(), function(key) {
                   expect(picklistModel.get(key)).toEqual(model.get(key));
               });
               expect(picklistModel.get('preselected')).toBe(false);
               expect(picklistModel.get('selected')).toBe(false);
           });
        });
    });
});
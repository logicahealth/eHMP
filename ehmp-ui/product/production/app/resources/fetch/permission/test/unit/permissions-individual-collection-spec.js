define([
    'underscore',
    'app/resources/fetch/permission/test/unit/common-spies',
    'app/resources/fetch/permission/test/unit/mock-data',
    'app/resources/fetch/permission/permissions-individual-collection'
], function(_, spy, mock, Collection) {
    'use strict';

    describe('Permissions Collection', function() {
        var collection;

        beforeEach(function() {
            spy.StringFormatter();
            collection = new Collection(mock.permissionCollection(), {parse: true});
        });

        it('has can find models base on uid', function() {
            var original = mock.permissionCollection();
            var first = collection.get(original[0].uid);
            var second = collection.get(original[1].uid);
            var check = ['uid', 'value', 'label', 'description', 'example', 'note'];

            _.each(check, function(key) {
                expect(first.get(key)).toEqual(original[0][key]);
                expect(second.get(key)).toEqual(original[1][key]);
            });
        });

        it('creates a pickslist array correctly with no preselects', function() {
            var array = collection.toPicklistArray();

            collection.each(function(model, index) {
                var item = array[index];
                _.each(model.keys(), function(key) {
                    expect(item[key]).toEqual(model.get(key));
                });
                expect(item.selected).toBe(false);
                expect(item.preselected).toBe(false);
            });
        });

        it('creates a pickslist array correctly with preselects', function() {
            var preselectedIndex = 0;
            var data = mock.permissionCollection();
            var preselect = [data[preselectedIndex].uid];
            var array = collection.toPicklistArray(preselect);

            collection.each(function(model, index) {
                var item = array[index];
                _.each(model.keys(), function(key) {
                    expect(item[key]).toEqual(model.get(key));
                });
                expect(item.selected).toBe(index === preselectedIndex);
                expect(item.preselected).toBe(index === preselectedIndex);
            });
        });

        it('creates a pickslist collection correctly with no preselects', function() {
            var picklist = collection.toPicklist();

            collection.each(function(model) {
                var pModel = picklist.get(model.id);
                _.each(model.keys(), function(key) {
                    expect(pModel.get(key)).toEqual(model.get(key));
                });
                expect(pModel.get('selected')).toBe(false);
                expect(pModel.get('preselected')).toBe(false);
            });
        });

        it('creates a pickslist collection correctly with preselects', function() {
            var preselectedIndex = 0;
            var data = mock.permissionCollection();
            var preselect = [data[preselectedIndex].uid];
            var picklist = collection.toPicklist(preselect);

            collection.each(function(model, index) {
                var pModel = picklist.get(model.id);
                _.each(model.keys(), function(key) {
                    expect(pModel.get(key)).toEqual(model.get(key));
                });
                expect(pModel.get('selected')).toBe(index === preselectedIndex);
                expect(pModel.get('preselected')).toBe(index === preselectedIndex);
            });
        });
    });
});
define([
    'underscore',
    'app/resources/fetch/permission/test/unit/common-spies',
    'app/resources/fetch/permission/test/unit/mock-data',
    'app/resources/fetch/permission/permissions-uma'
], function(_, spy, mock, Collection) {
    'use strict';

    describe('Permissions UMA Collection', function() {
        var collection;

        beforeEach(function() {
            spy.StringFormatter();
            collection = new Collection(mock.permissionCollection(true), {
                parse: true
            });
        });

        it('has can find models base on uid', function() {
            var original = mock.permissionCollection(true);
            var first = collection.get(original[0].uid);
            var second = collection.get(original[1].uid);
            var third = collection.get(original[2].uid);
            var check = ['uid', 'value', 'label', 'description', 'example', 'note'];

            _.each(check, function(key) {
                expect(first.get(key)).toEqual(original[0][key]);
                expect(second.get(key)).toEqual(original[1][key]);
                expect(third.get(key)).toEqual(original[2][key]);
            });
        });

        it('creates a pickslist array correctly with no preselects', function() {
            var array = collection.toPicklistArray();
            expect(array.length).toEqual(2);
            _.each(array, function(item){
                expect(item.selected).toBe(false);
                expect(item.preselected).toBe(false);
                expect(item.status).toEqual('active');
            });
        });

        it('creates a pickslist array correctly with preselects', function() {
            var preselectedIndex = 0;
            var data = mock.permissionCollection(true);
            var preselect = [data[preselectedIndex].uid];
            var array = collection.toPicklistArray(preselect);
            expect(array.length).toEqual(2);
            _.each(array, function(item, index){
                if(item.uid === data[preselectedIndex].uid){
                    expect(item.selected).toBe(true);
                    expect(item.preselected).toBe(true);
                }else{
                    expect(item.selected).toBe(false);
                    expect(item.preselected).toBe(false);
                }
                expect(item.status).toEqual('active');
            });
        });
        it('creates a pickslist array correctly with deprecated preselects', function() {
            var preselectedIndex = 2;
            var data = mock.permissionCollection(true);
            var preselect = [data[preselectedIndex].uid];
            var array = collection.toPicklistArray(preselect);
            expect(array.length).toEqual(3);
            _.each(array, function(item, index){
                if(item.uid === data[preselectedIndex].uid){
                    expect(item.selected).toBe(true);
                    expect(item.preselected).toBe(true);
                    expect(item.status).toEqual('deprecated');
                }else{
                    expect(item.selected).toBe(false);
                    expect(item.preselected).toBe(false);
                    expect(item.status).toEqual('active');
                }
            });
        });
        it('creates a pickslist array correctly with omitted values', function() {
            var omittedIndex = 1;
            var data = mock.permissionCollection(true);
            var omitted = [data[omittedIndex].uid];
            var array = collection.toPicklistArray([], omitted);
            expect(array.length).toEqual(1);
            _.each(array, function(item, index){
                expect(item.selected).toBe(false);
                expect(item.preselected).toBe(false);
                expect(item.status).toEqual('active');
            });
        });

        it('creates a pickslist collection correctly with no preselects', function() {
            var picklist = collection.toPicklist();
            expect(picklist.length).toEqual(2);
            picklist.each(function(model) {
                var cModel = collection.get(model.id);
                _.each(cModel.keys(), function(key) {
                    expect(cModel.get(key)).toEqual(model.get(key));
                });
                expect(model.get('selected')).toBe(false);
                expect(model.get('preselected')).toBe(false);
                expect(model.get('status')).toEqual('active');
            });
        });

        it('creates a pickslist collection correctly with preselects', function() {
            var preselectedIndex = 0;
            var data = mock.permissionCollection(true);
            var preselect = [data[preselectedIndex].uid];
            var picklist = collection.toPicklist(preselect);

            expect(picklist.length).toEqual(2);
            picklist.each(function(model) {
                var cModel = collection.get(model.id);
                _.each(cModel.keys(), function(key) {
                    expect(cModel.get(key)).toEqual(model.get(key));
                });
                if(model.get('uid') === data[preselectedIndex].uid){
                    expect(model.get('selected')).toBe(true);
                    expect(model.get('preselected')).toBe(true);
                }else{
                    expect(model.get('selected')).toBe(false);
                    expect(model.get('preselected')).toBe(false);
                }
                expect(model.get('status')).toEqual('active');
            });
        });
        it('creates a pickslist collection correctly with deprecated preselects', function() {
            var preselectedIndex = 2;
            var data = mock.permissionCollection(true);
            var preselect = [data[preselectedIndex].uid];
            var picklist = collection.toPicklist(preselect);

            expect(picklist.length).toEqual(3);
            picklist.each(function(model) {
                var cModel = collection.get(model.id);
                _.each(cModel.keys(), function(key) {
                    expect(cModel.get(key)).toEqual(model.get(key));
                });
                if(model.get('uid') === data[preselectedIndex].uid){
                    expect(model.get('selected')).toBe(true);
                    expect(model.get('preselected')).toBe(true);
                    expect(model.get('status')).toEqual('deprecated');
                }else{
                    expect(model.get('selected')).toBe(false);
                    expect(model.get('preselected')).toBe(false);
                    expect(model.get('status')).toEqual('active');
                }
            });
        });
        it('creates a pickslist collection correctly with omitted values', function() {
            var omittedIndex = 1;
            var data = mock.permissionCollection(true);
            var omitted = [data[omittedIndex].uid];
            var picklist = collection.toPicklist([], omitted);
            expect(picklist.length).toEqual(1);
            picklist.each(function(model) {
                var cModel = collection.get(model.id);
                _.each(cModel.keys(), function(key) {
                    expect(cModel.get(key)).toEqual(model.get(key));
                });
                expect(model.get('selected')).toBe(false);
                expect(model.get('preselected')).toBe(false);
                expect(model.get('status')).toEqual('active');
            });
        });
        it('creates an array of selected picklist values correctly', function() {
            var data = mock.permissionCollection(true);
            var preselect = [data[0].uid, data[1].uid];
            var picklist = collection.toPicklist(preselect);
            var selected = picklist.getSelected();
            expect(selected.length).toEqual(2);
            _.each(selected, function(value) {
                expect(picklist.get(value).get('selected')).toBe(true);
            });
        });
        it('creates an array of selected picklist labels correctly', function() {
            var data = mock.permissionCollection(true);
            var preselect = [data[0].uid, data[1].uid];
            var picklist = collection.toPicklist(preselect);
            var selected = picklist.getSelected('label');
            expect(selected.length).toEqual(2);
            _.each(selected, function(label) {
                expect(picklist.where({
                    label: label
                })[0].get('selected')).toBe(true);
            });
        });
        it('creates an array of labels correctly', function() {
            var data = mock.permissionCollection(true);
            var uids = [data[0].uid];
            var labels = collection.getLabels(uids);
            expect(labels.length).toEqual(1);
            expect(labels[0]).toEqual(data[0].label);
        });
    });
});
/* global describe, it, beforeEach, expect */
define([
    'underscore',
    'moment',
    'app/resources/fetch/permission/test/unit/common-spies',
    'app/resources/fetch/permission/test/unit/mock-data',
    'app/resources/fetch/permission/permissions-individual-model'
], function(_, Moment, spy, mock, Model) {
    'use strict';

    describe('Individual Permissions Model', function() {
        var model;

        beforeEach(function() {
            spy.StringFormatter();
            model = new Model(mock.permissionItem(), {
                parse: true
            });
        });

        it('parse data correctly', function() {
            var original = mock.permissionItem();

            // Same as original
            expect(model.get('uid')).toEqual(original.uid);
            expect(model.get('value')).toEqual(original.value);
            expect(model.get('label')).toEqual(original.label);
            expect(model.get('example')).toEqual(original.example);
            expect(model.get('note')).toEqual(original.note);
            expect(model.get('version')).toEqual(original.version);
            expect(model.get('status')).toEqual(original.status);
            expect(model.get('nationalAccess')).toEqual(original.nationalAccess);

            // Generated
            expect(model.get('createdOn')).toEqual('01/30/2017');
        });

        it('displays pass through items correctly', function() {
            expect(model.display('uid')).toEqual(model.get('uid'));
            expect(model.display('value')).toEqual(model.get('value'));
            expect(model.display('label')).toEqual(model.get('label'));
            expect(model.display('example')).toEqual(model.get('example'));
            expect(model.display('note')).toEqual(model.get('note'));
            expect(model.display('status')).toEqual(model.get('status'));
        });

        it('displays generated items correctly', function() {
            var version = model.get('version');
            expect(model.display('deprecated')).toEqual('N/A');
            expect(model.display('introduced')).toEqual(version.introduced);
            expect(model.display('starts')).toEqual(version.startsAt);
            expect(model.display('ends')).toEqual(version.endsAt);
            expect(model.display('nationalAccess')).toEqual('No');

            version.deprecated = '2.0.0';
            model.set('version', version);
            model.set('nationalAccess', true);

            expect(model.display('deprecated')).toEqual(version.deprecated);
            expect(model.display('nationalAccess')).toEqual('Yes');
        });
    });
});
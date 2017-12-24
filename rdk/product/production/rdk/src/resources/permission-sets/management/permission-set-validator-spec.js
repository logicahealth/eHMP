'use strict';

var validator = require('./permission-set-validator');

describe('Validate when adding a permission set', function() {
    it('that it fails validation if the model param is empty', function() {
        expect(validator.validateAddModel()).to.equal('Missing message body');
    });

    it('that it fails when the required label parameter is missing', function() {
        expect(validator.validateAddModel({})).to.equal('label is a required parameter');
    });

    it('that it fails when the required status parameter is missing', function() {
        expect(validator.validateAddModel({ label: 'Test permission set' })).to.equal('status is a required parameter');
    });

    it('that it fails when the required version parameter is missing', function() {
        var model = {
            label: 'Test permission set',
            status: 'active'
        };
        expect(validator.validateAddModel(model)).to.equal('version is a required parameter');
    });

    it('that it fails when the required description parameter is missing', function() {
        var model = {
            label: 'Test permission set',
            status: 'active',
            version: '1.7.3'
        };
        expect(validator.validateAddModel(model)).to.equal('description is a required parameter');
    });

    it('that it fails when the required permissions parameter is missing', function() {
        var model = {
            label: 'Test permission set',
            status: 'active',
            version: '1.7.3',
            description: 'Test description'
        };
        expect(validator.validateAddModel(model)).to.equal('permissions is a required parameter and must be an array');

        model.permissions = 'Test permissions';
        expect(validator.validateAddModel(model)).to.equal('permissions is a required parameter and must be an array');
    });

    it('that it fails when the required sub-sets parameter is missing', function() {
        var model = {
            label: 'Test permission set',
            status: 'active',
            version: '1.7.3',
            description: 'Test description',
            permissions: ['add-vital', 'read-vital']
        };
        expect(validator.validateAddModel(model)).to.equal('sub-sets is a required parameter and must be an array');
        model['sub-sets'] = 'Test category';
        expect(validator.validateAddModel(model)).to.equal('sub-sets is a required parameter and must be an array');
    });

    it('that it passes when all properties are valid', function() {
        var model = {
            label: 'Test permission set',
            status: 'active',
            version: '1.7.3',
            description: 'Test description',
            'sub-sets': ['Test category'],
            permissions: ['add-vital', 'read-vital']
        };
        expect(validator.validateAddModel(model)).to.be.null();
    });
});

describe('Validate when updating/deprecating a permission set', function() {
    it('fails if model param is empty', function() {
        expect(validator.validateUpdateModel()).to.equal('Missing message body');
    });

    it('fails when the required uid parameter is missing', function() {
        expect(validator.validateUpdateModel({})).to.equal('uid is a required parameter');
    });

    it('fails if deprecate exists and deprecatedVersion parameter is missing', function() {
        expect(validator.validateUpdateModel({ uid: '1234', deprecate: true })).to.equal('deprecatedVersion is a required parameter');
    });

    it('fails if deprecate is false and label parameter is missing', function() {
        expect(validator.validateUpdateModel({ uid: '1234' })).to.equal('label is a required parameter');
    });

    it('fails if deprecate is false and status parameter is missing', function() {
        var model = {
            uid: '1234',
            label: 'Test permission set'
        };
        expect(validator.validateUpdateModel(model)).to.equal('status is a required parameter');
    });

    it('fails if deprecate is false and version parameter is missing', function() {
        var model = {
            uid: '1234',
            label: 'Test permission set',
            status: 'active'
        };
        expect(validator.validateUpdateModel(model)).to.equal('version is a required parameter');
    });

    it('fails if deprecate is false and sub-sets parameter is missing', function() {
        var model = {
            uid: '1234',
            label: 'Test permission set',
            status: 'active',
            version: '1.1.1'
        };
        expect(validator.validateUpdateModel(model)).to.equal('sub-sets is a required parameter and must be an array');
        model['sub-sets'] = 'Bad format';
        expect(validator.validateUpdateModel(model)).to.equal('sub-sets is a required parameter and must be an array');
    });

    it('fails if deprecate is false and description parameter is missing', function() {
        var model = {
            uid: '1234',
            label: 'Test permission set',
            status: 'active',
            version: '1.1.1',
            'sub-sets': []
        };
        expect(validator.validateUpdateModel(model)).to.equal('description is a required parameter');
    });

    it('fails if deprecate is false and addPermissions parameter is not an array', function() {
        var model = {
            uid: '1234',
            label: 'Test permission set',
            status: 'active',
            version: '1.1.1',
            'sub-sets': [],
            description: 'Test description',
            addPermissions: 'Bad property'
        };
        expect(validator.validateUpdateModel(model)).to.equal('addPermissions must be an array');
    });

    it('fails if deprecate is false and removePermissions parameter is not an array', function() {
        var model = {
            uid: '1234',
            label: 'Test permission set',
            status: 'active',
            version: '1.1.1',
            'sub-sets': [],
            description: 'Test description',
            removePermissions: 'Bad property'
        };
        expect(validator.validateUpdateModel(model)).to.equal('removePermissions must be an array');
    });

    it('passes when all properties are valid', function() {
        var model = {
            uid: '1234',
            label: 'Test permission set',
            status: 'active',
            version: '1.1.1',
            'sub-sets': [],
            description: 'Test description'
        };
        expect(validator.validateUpdateModel(model)).to.be.null();
    });
});

'use strict';

var error = require('../../src/error-builder');

describe('error-builder.js', function() {
    describe('createTransient()', function() {
        it('create only type', function() {
            expect(error.createTransient()).toEqual({
                type: error.transient
            });
        });

        it('create with message', function() {
            expect(error.createTransient('error')).toEqual({
                type: error.transient,
                message: 'error'
            });
        });

        it('create with message and data', function() {
            expect(error.createTransient('error', 500)).toEqual({
                type: error.transient,
                message: 'error',
                data: 500
            });
        });
    });

    describe('createFatal()', function() {
        it('create only type', function() {
            expect(error.createFatal()).toEqual({
                type: error.fatal
            });
        });

        it('create with message', function() {
            expect(error.createFatal('error')).toEqual({
                type: error.fatal,
                message: 'error'
            });
        });

        it('create only with message and data', function() {
            expect(error.createFatal('error', 500)).toEqual({
                type: error.fatal,
                message: 'error',
                data: 500
            });
        });
    });
});
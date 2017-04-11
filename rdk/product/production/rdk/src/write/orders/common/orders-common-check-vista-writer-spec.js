'use strict';

var resource = require('./orders-common-check-vista-writer');

describe('write-back orders common check vista writer', function() {
    var model = {
        'dfn': '3',
        'orderDialog': 'LR OTHER LAB TESTS',
        'location': '285',
        'inputList': [
            {
                'inputKey': '6',
                'inputValue': 'TODAY'
            },
            {
                'inputKey': '4',
                'inputValue': '350'
            },
            {
                'inputKey': '127',
                'inputValue': '72'
            }
        ]
    };

    it('tests that getParameters returns correct parameters array', function() {
        var expectedArray = ['3', 'LR', 'TODAY', '285', {'1': '350^LR^72'}, '', '0'];
        var parameters = resource._getParameters(model);
        expect(parameters).to.eql(expectedArray);
    });

    it('tests that getParameters returns correct parameters array w/ order ID', function() {
        model.orderId = '38888;1'
        var expectedArray = ['3', 'LR', 'TODAY', '285', {'1': '350^LR^72'}, '38888;1', '0'];
        var parameters = resource._getParameters(model);
        expect(parameters).to.eql(expectedArray);
    });
});

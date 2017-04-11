'use strict';

var _ = require('lodash');
var rdkResources = require('./rdk-resources');

describe('processResourceConfigItem', function() {
    it('processes a configuration item', function() {
        //function processResourceConfigItem(configItem, mountpoint) {
        var configItem = {
            name: 'test-config-item',
            path: '/test/config/item',
            get: function() {
            }
        };
        rdkResources._processResourceConfigItem(configItem, '/test/family');
        expect(configItem.title).to.equal('test-config-item');
        expect(configItem.path).to.equal('/test/family/test/config/item');
        expect(configItem.rel).to.equal('vha.read');
    });
});

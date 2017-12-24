'use strict';

var categoriesFile = require('../../../config/permission-set-categories.json');
var _ = require('lodash');

function getCategories(req, res) {

    var categoriesCollection = [];
    _.each(categoriesFile.setCategories, function(name) {
        categoriesCollection.push({
            label: name,
            value: name
        });
    });
    return res.rdkSend({
        items: categoriesCollection
    });
}

module.exports = getCategories;

'use strict';

var favorites = require('./favorites');

module.exports.getResourceConfig = function() {
    return [{
        name: 'favorites-get',
        path: '',
        get: favorites.getFavorites,
        requiredPermissions: [],
        isPatientCentric: false
    },{
        name: 'favorites-add',
        path: '',
        post: favorites.addFavorites,
        requiredPermissions: [],
        isPatientCentric: false
    },{
        name: 'favorites-delete',
        path: '',
        delete: favorites.deleteFavorites,
        requiredPermissions: [],
        isPatientCentric: false
    }];
};

'use strict';

function getPickListInMemoryConfig(app) {
    var pickListConfig = app.config.inMemory.pickListConfig;
    return pickListConfig;
}

function getPickListDirectConfig(app) {
    var pickListConfig = app.config.direct.pickListConfig;
    return pickListConfig;
}

function getPickListGroupsConfig(app) {
    var pickListConfig = app.config.groups.pickListConfig;
    return pickListConfig;
}

module.exports.inMemoryConfig = getPickListInMemoryConfig;
module.exports.directConfig = getPickListDirectConfig;
module.exports.groupsConfig = getPickListGroupsConfig;

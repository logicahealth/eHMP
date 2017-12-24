'use strict';

const ObjectId = require('mongodb').ObjectID;

function validateMongoDBId(id) {
    let oid;
    try {
        oid = new ObjectId(id);
        return;
    } catch (error) {
        return error.message;
    }
}

module.exports.validateMongoDBId = validateMongoDBId;

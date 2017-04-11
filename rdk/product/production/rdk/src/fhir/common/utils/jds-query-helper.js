'use strict';

var _ = require('lodash');

function _unaryOp(operator, a) {
    return operator + '(' + a + ')';
}

function _binaryOp(operator, a, b) {
    return operator + '(' + a + ',' + b + ')';
}

function _n_aryOp(operator, operands) {
    if (_.isEmpty(operands)) {
        return '';
    }
    if (operands.length > 1) {
        return operator + '(' + operands.join(',') + ')';
    }
    return operands[0];
}

function or(a, b) {
    var operands = _.isArray(a) ? a : [a, b];
    return _n_aryOp('or', operands);
}

function and(a, b) {
    var operands = _.isArray(a) ? a : [a, b];
    return _n_aryOp('and', operands);
}

function eq(prop, value) {
    return _binaryOp('eq', prop, value);
}

function exists(prop) {
    return _unaryOp('exists', prop);
}

function like(prop, pattern) {
    return _binaryOp('like', prop, pattern);
}

function not(expression) {
    return _unaryOp('not', expression);
}

function lt(prop, value) {
    return _binaryOp('lt', prop, value);
}

function lte(prop, value) {
    return _binaryOp('lte', prop, value);
}

function gt(prop, value) {
    return _binaryOp('gt', prop, value);
}

function gte(prop, value) {
    return _binaryOp('gte', prop, value);
}

module.exports.or = or;
module.exports.and = and;
module.exports.eq = eq;
module.exports.exists = exists;
module.exports.like = like;
module.exports.not = not;
module.exports.lt = lt;
module.exports.lte = lte;
module.exports.gt = gt;
module.exports.gte = gte;

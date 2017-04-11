module.exports.getResourceConfig = function() {
    return [{
        name: 'add',
        requiredPermissions: ['add-lab-order']
    }, {
        name: 'discontinue',
        requiredPermissions: ['discontinue-lab-order']
    }], {
        name: 'sign',
        requiredPermissions: ['sign-lab-order ']
    };
};
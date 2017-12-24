'use strict';

var notificationsDataAccess = require('./notifications-data-access');
var pepSubsystem = require('../../subsystems/pep/pep-subsystem');
var _ = require('lodash');
var logger = _.noop;

describe('Test notifications-data-access - hasPermissions:', function() {
    var pep;
    beforeEach(function() {
        pep = sinon.stub(pepSubsystem, 'execute');
    });
    afterEach(function() {
        pep.restore();
    });


    it('Should return true if the notification has undefined permissions', function() {
        var notification = {
            navigation: {
                channel: 'channel',
                event: 'event'
            }
        };

        var req = {
            session: {
                user: {}
            },
            logger: logger
        };

        pep.callsFake(function(request, obj, callback) {
            return callback(null);
        });
        notificationsDataAccess.hasPermissions(notification, req, function() {
            expect(notification.hasPermissions).to.be.true();
        });
    });

    it('Should return true if the notification has no permissions', function() {
        var notification = {
            permissions: {},
            navigation: {
                channel: 'channel',
                event: 'event'
            }
        };

        var req = {
            session: {
                user: {}
            },
            logger: logger
        };

        pep.callsFake(function(request, obj, callback) {
            return callback(null);
        });
        notificationsDataAccess.hasPermissions(notification, req, function() {
            expect(notification.hasPermissions).to.be.true();
        });
    });

    it('Should return true if the notification has no required ehmp permissions and the user has no specified permissions', function() {
        var notification = {
            permissions: {
                ehmp: []
            },
            navigation: {
                channel: 'channel',
                event: 'event'
            }
        };

        var req = {
            session: {
                user: {}
            },
            logger: logger
        };

        pep.callsFake(function(request, obj, callback) {
            return callback(null);
        });
        notificationsDataAccess.hasPermissions(notification, req, function() {
            expect(notification.hasPermissions).to.be.true();
        });
    });

    it('Should return true if the notification has no required ehmp permissions and the user has specified permissions', function() {
        var notification = {
            permissions: {
                ehmp: []
            },
            navigation: {
                channel: 'channel',
                event: 'event'
            }
        };

        var req = {
            session: {
                user: {
                    permissions: [
                        'add-coordination-request',
                    ]
                }
            },
            logger: logger
        };

        pep.callsFake(function(request, obj, callback) {
            return callback(null);
        });
        notificationsDataAccess.hasPermissions(notification, req, function() {
            expect(notification.hasPermissions).to.be.true();
        });
    });

    it('Should return true if user has the permission required by the notification', function() {
        var notification = {
            permissions: {
                ehmp: ['edit-coordination-request']
            },
            navigation: {
                channel: 'channel',
                event: 'event'
            }
        };

        var req = {
            session: {
                user: {
                    permissions: [
                        'add-coordination-request',
                        'edit-coordination-request'
                    ]
                }
            },
            logger: logger
        };

        pep.callsFake(function(request, obj, callback) {
            return callback(null);
        });
        notificationsDataAccess.hasPermissions(notification, req, function() {
            expect(notification.hasPermissions).to.be.true();
        });
    });

    it('Should return false if user does not have the permission required by the notification', function() {
        var notification = {
            permissions: {
                ehmp: ['edit-coordination-request']
            },
            navigation: {
                channel: 'channel',
                event: 'event'
            }
        };

        var req = {
            session: {
                user: {
                    permissions: [
                        'add-coordination-request'
                    ]
                }
            },
            logger: logger
        };

        pep.callsFake(function(request, obj, callback) {
            return callback({
                message: 'The user does not have all the required permissions'
            });
        });
        notificationsDataAccess.hasPermissions(notification, req, function() {
            expect(notification.hasPermissions).to.be.false();
        });
    });

    it('Should return false if user does not have all the permissions required by the notification', function() {
        var notification = {
            permissions: {
                ehmp: [
                    'add-coordination-request',
                    'edit-coordination-request'
                ]
            },
            navigation: {
                channel: 'channel',
                event: 'event'
            }
        };

        var req = {
            session: {
                user: {
                    permissions: [
                        'add-coordination-request'
                    ]
                }
            },
            logger: logger
        };

        pep.callsFake(function(request, obj, callback) {
            return callback({
                message: 'The user does not have all the required permissions'
            });
        });
        notificationsDataAccess.hasPermissions(notification, req, function() {
            expect(notification.hasPermissions).to.be.false();
        });
    });
});

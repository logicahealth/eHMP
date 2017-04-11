'use strict';

var _ = require('lodash');
var moment = require('moment');

require('../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var activeUserUserScreenRetriever = require(global.OSYNC_UTILS + 'active-user-userscreen-retriever');

describe('active user handler', function() {

    var mockConfig;
    beforeEach(function() {
        mockConfig = {};
        mockConfig.vistaSites = {};
        mockConfig.vistaSites['9E7A'] = {};
        mockConfig.vistaSites['C877'] = {};
    });

    describe('filter for active users unit test', function() {
        var user1, user2, usersList;
        beforeEach(function() {
            user1 = {
                'duz': {
                    '9E7A': 'user1'
                },
                'lastlogin': '2015-03-30',
                'patientList': [{
                    'pid': 'patient1',
                    'data': 'some data',
                    'information': 'some more data'
                }, {
                    'pid': 'patient2',
                    'data': 'some different data',
                    'information': 'some more different data'
                }]
            };
            user2 = {
                'duz': {
                    'C877': 'user2'
                },
                'lastlogin': '2014-01-11',
                'patientList': [{
                    'pid': 'patient2',
                    'data': 'some different data',
                    'information': 'some more different data'
                }, {
                    'pid': 'patient3',
                    'data': 'some information',
                    'information': 'some more information'
                }]
            };
            usersList = [user1, user2];
        });

        it('returns the active users list', function() {
            var activeUsersList = activeUserUserScreenRetriever._filterForActiveUsers(log, mockConfig, usersList, moment('2014-01-11'));
            expect(activeUsersList).toContain(user1);
            expect(activeUsersList).toContain(user2);
        });

        it('filters by date', function() {
            var activeUsersList = activeUserUserScreenRetriever._filterForActiveUsers(log, mockConfig, usersList, moment('2015-04-20'));
            expect(activeUsersList).toContain(user1);
            expect(activeUsersList).not.toContain(user2);
        });

        it('filters out inactive users', function() {
            mockConfig.vistaSites['9E7A'].inactiveUsers = ['user1', 'user2'];
            var activeUsersList = activeUserUserScreenRetriever._filterForActiveUsers(log, mockConfig, usersList, moment('2014-01-11'));
            expect(activeUsersList).not.toContain(user1);
            expect(activeUsersList).toContain(user2); // user2 should still be here because he's not inactive on C877.
        });
    });
});

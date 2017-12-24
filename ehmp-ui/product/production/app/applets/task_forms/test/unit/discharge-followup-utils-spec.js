/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */


define([
    'test/stubs',
    'backbone',
    'underscore',
    'jasminejquery',
    'app/applets/task_forms/activities/order.dischargefollowup/utils'
], function (Stubs, Backbone, _, Jasmine, Util) {
    'use strict';

    function buildModel(action, comment, assignment) {
        return new Backbone.Model({
            taskId: 12,
            action: action,
            comment: comment,
            deploymentId: 'Order.DischargeFollowup:0.0.0',
            assignment: assignment
        });
    }

    function buildExpectedParameter(comment, routingCode, assignmentType) {
        var parameter = {
            followup: {
                objectType: 'followup',
                executionUserId: 'SITE;12345',
                executionUserName: 'USER, TEST',
                visit: {
                    dateTime: '201708170900',
                    location: 'urn:va:location:SITE:100',
                    serviceCategory: 'SC'
                },
                comment: comment
            },
            routingCode: routingCode
        };

        if (assignmentType) {
            parameter.assignmentType = assignmentType;
            parameter.followup.actionId = 4;
        } else {
            parameter.followup.actionId = 1;
        }

        return parameter;
    }

    describe('Discharge follow up utility - buildAcceptActionModel', function() {
        it('should build the action model', function() {
            var clinicalObject = {};
            _.set(clinicalObject, 'data.activity.processInstanceId', '1');
            var model = new Backbone.Model({
                deploymentId: 'Order.DischargeFollowup:0.0.0',
                comment: 'Test comment',
                clinicalObject: clinicalObject
            });

            var actionModel = new Backbone.Model();
            Util.buildAcceptActionModel(model, actionModel);
            expect(actionModel.get('deploymentId')).toEqual('Order.DischargeFollowup:0.0.0');
            expect(actionModel.get('processInstanceId')).toEqual(1);
            expect(actionModel.get('signalName')).toEqual('END');
            expect(actionModel.get('parameter').signalBody.get('objectType')).toEqual('dischargeSignal');
            expect(actionModel.get('parameter').signalBody.get('name')).toEqual('END');
            expect(actionModel.get('parameter').signalBody.get('actionText')).toEqual('Discontinue');
            expect(actionModel.get('parameter').signalBody.get('actionId')).toEqual('3');
            expect(actionModel.get('parameter').signalBody.get('data').comment).toEqual('Test comment');
        });
    });

    describe('Discharge follow up utility - buildTaskStartModel', function() {
        beforeEach(function() {
            _.set(ADK, 'UIResources.Writeback.Tasks.Model', Backbone.Model);
        });

        it('should return model with properties set', function() {
            var model = Util.buildTaskStartModel(1, 'Order.DischargeFollowup:0.0.0');
            expect(model.get('taskid')).toEqual('1');
            expect(model.get('deploymentid')).toEqual('Order.DischargeFollowup:0.0.0');
            expect(model.get('state')).toEqual('start');
            expect(model.get('processDefId')).toEqual('Order.DischargeFollowup');
            expect(model.get('parameter')).toBeDefined();
        });
    });

    describe('Discharge follow up utiltiy - buildTaskActionModel', function() {
        beforeEach(function() {
            _.set(ADK, 'UIResources.Writeback.Tasks.Model', Backbone.Model);
            ADK.PatientRecordService.setCurrentPatient({
                pid: 'SITE;3',
                visit: {
                    dateTime: '201708170900',
                    serviceCategory: 'SC',
                    locationUid: 'urn:va:location:SITE:100'
                }
            });
        });

        it('should return the model with properties set for non-reassign action', function() {
            var actionModel = Util.buildTaskActionModel(buildModel('1', 'Test comment'));
            expect(actionModel.get('deploymentId')).toEqual('Order.DischargeFollowup:0.0.0');
            expect(actionModel.get('taskid')).toEqual('12');
            expect(actionModel.get('state')).toEqual('complete');
            expect(actionModel.get('parameter')).toEqual(buildExpectedParameter('Test comment', 'SITE;3'));
        });

        it('should return the model with properties set for reassign action: me', function() {
            var assignment = {
                type: 'opt_me'
            };

            var actionModel = Util.buildTaskActionModel(buildModel('4', '', assignment));
            expect(actionModel.get('deploymentId')).toEqual('Order.DischargeFollowup:0.0.0');
            expect(actionModel.get('taskid')).toEqual('12');
            expect(actionModel.get('state')).toEqual('complete');
            expect(actionModel.get('parameter')).toEqual(buildExpectedParameter('', 'SITE;12345', 'Me'));
        });

        it('should return the model with properties set for reassign action: person', function() {
            var assignment = {
                type: 'opt_person',
                person: 'SITE;5555'
            };

            var actionModel = Util.buildTaskActionModel(buildModel('4', '', assignment));
            expect(actionModel.get('deploymentId')).toEqual('Order.DischargeFollowup:0.0.0');
            expect(actionModel.get('taskid')).toEqual('12');
            expect(actionModel.get('state')).toEqual('complete');
            expect(actionModel.get('parameter')).toEqual(buildExpectedParameter('', 'SITE;5555', 'Person'));
        });

        it('should return the model with properties set for reassign action: my teams', function() {
            var assignment = {
                type: 'opt_myteams',
                team: '1111',
                roles: ['23'],
                _labelsForSelectedValues: {
                    team: 'Other primary care',
                    roles: 'Nurse'
                }
            };

            var actionModel = Util.buildTaskActionModel(buildModel('4', '', assignment));
            expect(actionModel.get('deploymentId')).toEqual('Order.DischargeFollowup:0.0.0');
            expect(actionModel.get('taskid')).toEqual('12');
            expect(actionModel.get('state')).toEqual('complete');
            expect(actionModel.get('parameter')).toEqual(buildExpectedParameter('', '[TM:Other primary care(1111)/TR:Nurse(23)]', 'My Teams'));
        });

        it('should return the model with properties set for reassign action: patient teams', function() {
            var assignment = {
                type: 'opt_patientteams',
                team: '1234',
                roles: ['23', '11'],
                _labelsForSelectedValues: {
                    team: 'Primary care',
                    roles: 'Nurse,Attending'
                }
            };

            var actionModel = Util.buildTaskActionModel(buildModel('4', '', assignment));
            expect(actionModel.get('deploymentId')).toEqual('Order.DischargeFollowup:0.0.0');
            expect(actionModel.get('taskid')).toEqual('12');
            expect(actionModel.get('state')).toEqual('complete');
            expect(actionModel.get('parameter')).toEqual(buildExpectedParameter('', '[TM:Primary care(1234)/TR:Nurse(23)],[TM:Primary care(1234)/TR:Attending(11)]', 'Patient\'s Teams'));
        });

        it('should return the model with properties set for reassign action: any team', function() {
            var assignment = {
                type: 'opt_anyteam',
                team: '1234',
                facility: '500',
                roles: ['11'],
                _labelsForSelectedValues: {
                    team: 'Primary care',
                    roles: 'Attending',
                    facility: 'Camp Master'
                }
            };

            var actionModel = Util.buildTaskActionModel(buildModel('4', '', assignment));
            expect(actionModel.get('deploymentId')).toEqual('Order.DischargeFollowup:0.0.0');
            expect(actionModel.get('taskid')).toEqual('12');
            expect(actionModel.get('state')).toEqual('complete');
            expect(actionModel.get('parameter')).toEqual(buildExpectedParameter('', '[TM:Primary care(1234)/TR:Attending(11)/FC:Camp Master(500)]', 'Any Team'));
        });
    });

    describe('Discharge follow up utility - generateRoutingCode', function() {
        it('generate routing without undefined assignment', function() {
            expect(Util.generateRoutingCode()).toEqual('');
        });

        it('generate routing without facility', function() {
            var assignment = {
                team: '333',
                roles: ['12'],
                _labelsForSelectedValues: {
                    team: 'Test team',
                    roles: 'Test role'
                }
            };
            expect(Util.generateRoutingCode(assignment)).toEqual('[TM:Test team(333)/TR:Test role(12)]');
        });

        it('generate routing with facility', function() {
            var assignment = {
                team: '333',
                roles: ['12'],
                facility: '100',
                _labelsForSelectedValues: {
                    team: 'Test team',
                    roles: 'Test role',
                    facility: 'Test facility'
                }
            };
            expect(Util.generateRoutingCode(assignment, true)).toEqual('[TM:Test team(333)/TR:Test role(12)/FC:Test facility(100)]');
        });

        it('generate routing with facility and multiple roles', function() {
            var assignment = {
                team: '333',
                roles: ['12', '13', '14'],
                facility: '100',
                _labelsForSelectedValues: {
                    team: 'Test team',
                    roles: 'Test role,Nurse,Physician',
                    facility: 'Test facility'
                }
            };
            expect(Util.generateRoutingCode(assignment, true)).toEqual('[TM:Test team(333)/TR:Test role(12)/FC:Test facility(100)],[TM:Test team(333)/TR:Nurse(13)/FC:Test facility(100)],[TM:Test team(333)/TR:Physician(14)/FC:Test facility(100)]');
        });
    });
});
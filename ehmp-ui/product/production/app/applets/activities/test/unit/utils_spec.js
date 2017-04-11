/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['jquery', 'backbone', 'marionette', 'jasminejquery', 'app/applets/activities/utils'],
    function ($, Backbone, Marionette, Jasmine, Util) {
        describe('Utility function for comparing activity models for sorting', function(){
            it('Should sort open activities before closed', function(){
                var openFirstResult = Util.compareActivityModels(new Backbone.Model({mode: 'Open'}), new Backbone.Model({mode: 'Closed'}));
                var openSecondResult = Util.compareActivityModels(new Backbone.Model({mode: 'Closed'}), new Backbone.Model({mode: 'Open'}));

                expect(openFirstResult).toEqual(-1);
                expect(openSecondResult).toEqual(1);
            });

            it('Should sort activities with the same mode and different urgency correctly', function(){
                var modelOne = new Backbone.Model({mode: 'Open', urgency: 'Emergent'});
                var modelTwo = new Backbone.Model({mode: 'Open', urgency: 'Urgent'});

                expect(Util.compareActivityModels(modelOne, modelTwo)).toEqual(-1);

                modelOne.set('urgency', 'Urgent');
                modelTwo.set('urgency', 'Emergent');
                expect(Util.compareActivityModels(modelOne, modelTwo)).toEqual(1);

                modelOne.set('urgency', 'Emergent');
                modelTwo.set('urgency', '');
                expect(Util.compareActivityModels(modelOne, modelTwo)).toEqual(-1);

                modelOne.set('urgency', '');
                modelTwo.set('urgency', 'Urgent');
                expect(Util.compareActivityModels(modelOne, modelTwo)).toEqual(1);
            });

            it('Should sort activities with the same model and urgency by activity name', function(){
                var modelOne = new Backbone.Model({mode: 'Closed', urgency: 'Emergent', name: 'Activity 1'});
                var modelTwo = new Backbone.Model({mode: 'Closed', urgency: 'Emergent', name: 'B activity'});
                expect(Util.compareActivityModels(modelOne, modelTwo)).toEqual(-1);

                modelOne.set('name', 'Lab order');
                modelTwo.set('name', 'Consult');
                expect(Util.compareActivityModels(modelOne, modelTwo)).toEqual(1);

                modelOne.set('name', 'Test activity');
                modelTwo.set('name', 'Test activity');
                expect(Util.compareActivityModels(modelOne, modelTwo)).toEqual(0);
            });
        });

        describe('Utility function for matching teams', function(){
            it('Should return true if there is a match on team ID', function(){
                var userTeams = [{
                    teamID: 1131,
                },
                {
                    teamID: 4567
                }];
                expect(Util.matchTeams(userTeams, ['1131', '1132', '9999'], null)).toEqual(true);
            });

            it('Should return false if there is no match', function(){
                var userTeams = [{
                    teamID: 222
                },
                {
                    teamID: 333
                }];
                expect(Util.matchTeams(userTeams, ['444', '555', '666'], null)).toEqual(false);
            });

            it('Should return false if user teams is undefined', function(){
                expect(Util.matchTeams(undefined, ['4444', '5555'], null)).toEqual(false);
            });

            it('Should return false if activity teams is null', function(){
                var userTeams = [{
                    teamID: 4444
                },
                {
                    teamID: 5555
                }];
                expect(Util.matchTeams(userTeams, null, null)).toEqual(false);
            });

            it('Should return false if user teams is undefined and teams is null', function(){
                expect(Util.matchTeams(undefined, null, null)).toEqual(false);
            });

            it('Should match on primary team focus', function(){
                var userTeams = [{
                    teamID: 1234,
                    teamPrimaryFoci: 10,
                    teamSecondaryFoci: null
                },
                {
                    teamID: 4321,
                    teamPrimaryFoci: 11,
                    teamSecondaryFoci: 13
                }];
                expect(Util.matchTeams(userTeams, null, ['11', '10'])).toEqual(true);
            });

            it('Should match on secondary team focus', function(){
                var userTeams = [{
                    teamID: 1234,
                    teamPrimaryFoci: 10,
                    teamSecondaryFoci: null
                },
                {
                    teamID: 4321,
                    teamPrimaryFoci: 11,
                    teamSecondaryFoci: 13
                }];
                expect(Util.matchTeams(userTeams, null, ['13'])).toEqual(true);
            });

            it('Should return false when no focus matches are found', function(){
                var userTeams = [{
                    teamID: 1234,
                    teamPrimaryFoci: 10,
                    teamSecondaryFoci: null
                },
                {
                    teamID: 4321,
                    teamPrimaryFoci: 11,
                    teamSecondaryFoci: 13
                }];
                expect(Util.matchTeams(userTeams, null, ['30'])).toEqual(false);
            });

            it('Should return false when no team or focus matches are found', function(){
                var userTeams = [{
                    teamID: 1234,
                    teamPrimaryFoci: 10,
                    teamSecondaryFoci: null
                },
                {
                    teamID: 4321,
                    teamPrimaryFoci: 11,
                    teamSecondaryFoci: 13
                }];
                expect(Util.matchTeams(userTeams, ['111', '123', '444'], ['333', '122', '789'])).toEqual(false);
            });
        });
    });
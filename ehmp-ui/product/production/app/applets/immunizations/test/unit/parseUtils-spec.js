/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['backbone', 'jasminejquery', 'app/applets/immunizations/writeback/utils/parseUtils'],
    function (Backbone, Jasmine, ParseUtil) {
        describe('Parse utility function for formatting information statements', function(){
            it('should provide empty list if information statement is an empty string', function(){
                expect(ParseUtil.getInformationStatementList('').length).toEqual(0);
            });

            it('should parse information statements correctly and only show current', function(){
                var informationStatementList = new Backbone.Collection();
                informationStatementList.add(new Backbone.Model({name: 'INFLUENZA VACCINE - INACTIVATED VIS', editionStatus: 'CURRENT', ien: '36', label: 'Formatted Influenza Vaccine 1'}));
                informationStatementList.add(new Backbone.Model({name: 'INFLUENZA VACCINE - INACTIVATED VIS', editionStatus: 'HISTORIC', ien: '13', label: 'Formatted Influenza Vaccine 2'}));
                var infoStatements = ParseUtil.getInformationStatementList('13~INFLUENZA VACCINE - INACTIVATED VIS   07-02-12   HISTORIC   1|36~INFLUENZA VACCINE - INACTIVATED VIS   08-19-14   CURRENT   1', informationStatementList);
                expect(infoStatements[0].ien).toEqual('36');
                expect(infoStatements[0].name).toEqual('36');
                expect(infoStatements[0].label).toEqual('Formatted Influenza Vaccine 1');
            });
        });

        describe('Parse utility function for matching immunizations data', function() {
            it('should not match because administered and inactive', function(){
                var substrRegex = new RegExp('hep', 'i');
                var item = new Backbone.Model({inactiveFlag: "1"});
                var isMatch = ParseUtil.doesItemMatch(substrRegex, item, true);
                expect(isMatch).toEqual(false);
            });

            it('should not match because historical and inactive and not selectable for historic', function(){
                var substrRegex = new RegExp('hep', 'i');
                var item = new Backbone.Model({inactiveFlag: "1", selectableHistoric: false});
                var isMatch = ParseUtil.doesItemMatch(substrRegex, item, false);
                expect(isMatch).toEqual(false);
            });

            it('should not match because nothing matches regex', function(){
                var substrRegex = new RegExp('hep', 'i');
                var item = new Backbone.Model({inactiveFlag: "0", label: 'dtp', cvxCode: '100', cdcFullVaccineName: 'No match', shortName: 'nothing', cdcProductName: 'wrong'});
                var isMatch = ParseUtil.doesItemMatch(substrRegex, item, true);
                expect(isMatch).toEqual(false);
            });

            it('should match on label', function(){
                var substrRegex = new RegExp('hep', 'i');
                var item = new Backbone.Model({inactiveFlag: "0", label: 'hepatitis', cvxCode: '100', cdcFullVaccineName: 'No match', shortName: 'nothing', cdcProductName: 'wrong'});
                var isMatch = ParseUtil.doesItemMatch(substrRegex, item, true);
                expect(isMatch).toEqual(true);
            });

            it('should match on cvxCode', function(){
                var substrRegex = new RegExp('100', 'i');
                var item = new Backbone.Model({inactiveFlag: "0", label: 'dtp', cvxCode: '100', cdcFullVaccineName: 'No match', shortName: 'nothing', cdcProductName: 'wrong'});
                var isMatch = ParseUtil.doesItemMatch(substrRegex, item, true);
                expect(isMatch).toEqual(true);
            });

            it('should match on full vaccine name', function(){
                var substrRegex = new RegExp('hep', 'i');
                var item = new Backbone.Model({inactiveFlag: "0", label: 'dtp', cvxCode: '100', cdcFullVaccineName: 'hepatitis', shortName: 'nothing', cdcProductName: 'wrong'});
                var isMatch = ParseUtil.doesItemMatch(substrRegex, item, true);
                expect(isMatch).toEqual(true);
            });

            it('should match on product name', function(){
                var substrRegex = new RegExp('hep', 'i');
                var item = new Backbone.Model({inactiveFlag: "0", label: 'dtp', cvxCode: '100', cdcFullVaccineName: 'No match', shortName: 'nothing', cdcProductName: 'hep-a'});
                var isMatch = ParseUtil.doesItemMatch(substrRegex, item, true);
                expect(isMatch).toEqual(true);
            });
        });

        describe('Parse utility function for getting information sources', function(){
            it('Getting info sources with no response should give empty array', function(){
                expect(ParseUtil.getInformationSourceList({})).toEqual([]);
            });

            it('Getting info sources with valid response', function(){
                var collection = [{label: 'Unspecified', value: '99999-08'}];
                var infoSourceList = ParseUtil.getInformationSourceList(collection);
                expect(infoSourceList.length).toEqual(1);
                expect(infoSourceList[0].label).toEqual('Unspecified');
                expect(infoSourceList[0].value).toEqual('99999-08');
            });

            it('Getting info sources with valid response and proper string formatting', function(){
                var collection = [{label: 'Historical information -unspecified', value: '99999-08'}];
                var infoSourceList = ParseUtil.getInformationSourceList(collection);
                expect(infoSourceList.length).toEqual(1);
                expect(infoSourceList[0].label).toEqual('Unspecified');
                expect(infoSourceList[0].value).toEqual('99999-08');
            });

            it('Filter out info source for new immunization record', function(){
                var collection = [{label: 'New immunization record', value: '99999-01'}];
                expect(ParseUtil.getInformationSourceList(collection).length).toEqual(0);
            });
        });

        describe('Parse utility function for getting series list', function(){
            it('Getting list with no max series value should give default list', function(){
                var seriesList = ParseUtil.getSeriesList('');
                expect(seriesList.length).toEqual(3);
                expect(seriesList[0].label).toEqual('Booster');
                expect(seriesList[1].label).toEqual('Complete');
                expect(seriesList[2].label).toEqual('Partially Complete');
            });

            it('Getting list with max series value should give default list with extra values', function(){
                var seriesList = ParseUtil.getSeriesList('3');
                expect(seriesList.length).toEqual(6);
                expect(seriesList[0].label).toEqual('1');
                expect(seriesList[1].label).toEqual('2');
                expect(seriesList[2].label).toEqual('3');
                expect(seriesList[3].label).toEqual('Booster');
                expect(seriesList[4].label).toEqual('Complete');
                expect(seriesList[5].label).toEqual('Partially Complete');
            });
        });

        describe('Parse utility for finding the current user', function(){
            it('should return the current user', function(){
                var providerList = new Backbone.Collection();
                providerList.add(new Backbone.Model({name: 'USER,PANORAMA', code: '100000027'}));
                providerList.add(new Backbone.Model({name: 'ANOTHER,PROVIDER', code: '123456789'}));
                var duz = {'9E7A': '100000027'};
                var user = new Backbone.Model({duz: duz, site: '9E7A'});
                var foundUser = ParseUtil.findUser(providerList, user);
                expect(foundUser.get('name')).toEqual('USER,PANORAMA');
                expect(foundUser.get('code')).toEqual('100000027');
            });
        });

        describe('Parse utility for getting a formatted VIS name', function(){
            it('Should return the properly formatted name', function(){
                var model = new Backbone.Model({name: 'TEST VACCINE VIS', editionDate: 'SEP 21, 2011', language: 'ENGLISH'});
                var formattedName = ParseUtil.getFormattedVisName(model);
                expect(formattedName).toEqual('Test Vaccine - Sep 21, 2011 Edition (English)');
            });
        });
    });

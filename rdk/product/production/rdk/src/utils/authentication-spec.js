'use strict';

var _ = require('lodash');
var authentication = require('./authentication');

var config = {
    'SITE1': {
        division: [{
            id: '500',
            name: 'DEMO'
        }]
    },
    'SITE2': {
        division: [{
            id: '321',
            name: 'OMED'
        }, {
            id: '321A1',
            name: 'OMED SUB'
        }]
    }
};
var intDivision = 500;
var strDivision = '500';
var uConfig, uDivision;

describe('authentication-spec.js', function() {
    describe('getSiteCode', function() {
        it('Should accept a vistaSitesConfig and an integer division and return the correct hash', function() {
            var siteHash = authentication.getSiteCode(config, intDivision);
            expect(siteHash).to.eql('SITE1');
        });

        it('Should accept a vistaSitesConfig and a string division and return the correct hash', function() {
            var siteHash = authentication.getSiteCode(config, strDivision);
            expect(siteHash).to.eql('SITE1');
        });

        it('Should accept a vistaSitesConfig and division and return the second hash', function() {
            var siteHash = authentication.getSiteCode(config, '321A1');
            expect(siteHash).to.eql('SITE2');
        });

        it('Should accept a vistaSitesConfig and a division but not find a hash and return undefined', function() {
            var siteHash = authentication.getSiteCode(config, '400');
            expect(siteHash).to.eql(undefined);
        });

        it('Should check if vistaSitesConfig is undefined and return undefined if it is', function() {
            var siteHash = authentication.getSiteCode(uConfig, strDivision);
            expect(siteHash).to.eql(undefined);
        });

        it('Should accept a vistaSitesConfig and check if division is undefined and return undefined if it is', function() {
            var siteHash = authentication.getSiteCode(config, uDivision);
            expect(siteHash).to.eql(undefined);
        });
    });

    describe('getSiteDivisions', function() {
        it('Should accept a vistaSitesConfig and a string site hash and return the correct divisions', function() {
            var divisions = authentication.getSiteDivisions(config, 'SITE2');
            expect(divisions.length).to.eql(2);
        });

        it('Should accept a vistaSitesConfig and no site hash and return the correct divisions', function() {
            var divisions = authentication.getSiteDivisions(config);
            expect(divisions.length).to.eql(3);
        });

        it('Should accept a vistaSitesConfig and a corret site hash but not find divisions and return an empty array', function() {
            var divisions = authentication.getSiteDivisions(config, 'SITE3');
            expect(divisions.length).to.eql(0);
        });

        it('Should check if vistaSitesConfig is undefined and return an empty array if it is', function() {
            var divisions = authentication.getSiteDivisions(uConfig, 'SITE1');
            expect(divisions.length).to.eql(0);
        });
    });
});

/**
 * Created by alexluong on 5/26/15.
 */

'use strict';

var pidValidator = require('./pid-validator');
var app = {
    config: {
        vistaSites: {
            'SITE': {
                division: [
                    {id: '507', name: 'KODAK'},
                    {id: '613', name: 'MARTINSBURG'},
                    {id: '688', name: 'WASHINGTON'}
                ],
                host: 'IP        ',
                localIP: 'IP      ',
                localAddress: 'localhost',
                port: PORT,
                production: false,
                accessCode: 'USER  ',
                verifyCode: 'PW      ',
                infoButtonOid: '1.3.6.1.4.1.3768',
                abbreviation: 'KDK',
                uatracker: true
            },
            'SITE': {
                division: [
                    {id: '500', name: 'PANORAMA'}
                ],
                host: 'IP        ',
                localIP: 'IP      ',
                localAddress: 'localhost',
                port: PORT,
                production: false,
                accessCode: 'USER  ',
                verifyCode: 'PW      ',
                infoButtonOid: '1.3.6.1.4.1.3768',
                abbreviation: 'PAN',
                uatracker: true
            }
        }
    },
    logger: sinon.stub(require('bunyan').createLogger({
        name: 'pid-validator-spec'
    }))
};

pidValidator.initialize(app);
describe('pid-validator', function() {
    var patientIdentifiers;
    var req;
    beforeEach(function(){
        patientIdentifiers = {
            icn: '1V1',
            dfn: '1',
            currentSiteDfn: 'SITE;1',
            primarySiteDfn: 'SITE;1',
            edipi: '01',
            pidEdipi: 'DOD;01',
            hdr: 'HDR;50099823V10209899',
            hdrInvalid: 'HDR;5009982310209899',
            siteIcn: 'SITE;1V1',
            invalidSiteIcn: 'site;1v1',
            vhic: 'VHICID;4564654'
        };
        req = {};
    });

    describe('site checks', function() {
        describe('containsSite', function() {
            it('should determine if pid contains the site', function() {
                expect(pidValidator.containsSite(patientIdentifiers.siteIcn)).to.be.true();
                //contains site doesn't check the validity of a site just that something is present there.
                expect(pidValidator.containsSite(patientIdentifiers.invalidSiteIcn)).to.be.true();
                expect(pidValidator.containsSite(patientIdentifiers.icn)).to.be.false();
                expect(pidValidator.containsSite(';1')).to.be.false();
            });
        });
        describe('isCurrentSite', function() {
            it('should determine if pid site is the site currently logged in to', function() {
                req = {
                    session: {
                        user: {
                            site: 'SITE'
                        }
                    }
                };
                expect(pidValidator.isCurrentSite(req, patientIdentifiers.currentSiteDfn)).to.be.true();
                expect(pidValidator.isCurrentSite(req, patientIdentifiers.primarySiteDfn)).to.be.false();
                expect(pidValidator.isCurrentSite(req, patientIdentifiers.hdr)).to.be.false();
                expect(pidValidator.isCurrentSite(req, patientIdentifiers.primarySiteDfn)).to.be.false();
            });
        });
        describe('isPrimarySite', function() {
            it('should determine if pid site is a primary site', function() {
                expect(pidValidator.isPrimarySite(patientIdentifiers.primarySiteDfn), 'a primary site;dfn should return data').to.be.truthy();
                expect(pidValidator.isPrimarySite(patientIdentifiers.currentSiteDfn), 'a primary site;dfn should return data').to.be.truthy();
                expect(pidValidator.isPrimarySite(patientIdentifiers.siteIcn), 'a primary site;dfn should return data').to.be.truthy();
                expect(pidValidator.isPrimarySite(patientIdentifiers.edipi), 'a non primary site should return false').to.be.false();
                expect(pidValidator.isPrimarySite(patientIdentifiers.hdr), 'a non primary site should return false').to.be.false();
                expect(pidValidator.isPrimarySite(patientIdentifiers.vhic), 'a non primary site should return false').to.be.false();
            });
        });
        describe('isSecondarySite', function() {
            it('should determine if pid site is a secondary site', function() {
                expect(pidValidator.isSecondarySite(patientIdentifiers.vhic), 'VHIC is a secondary site').to.be.true();
                expect(pidValidator.isSecondarySite(patientIdentifiers.hdr), 'HDR is a secondary site').to.be.true();
                expect(pidValidator.isSecondarySite(patientIdentifiers.pidEdipi), 'DOD is a secondary site').to.be.true();
                expect(pidValidator.isSecondarySite(undefined), 'undefined is not secondary site').to.be.false();
                expect(pidValidator.isSecondarySite(patientIdentifiers.siteIcn), 'ICN with a preceding primary site is a not a secondary site').to.be.false();
                expect(pidValidator.isSecondarySite(patientIdentifiers.invalidSiteIcn), 'ICN with a preceding unknown site is not a secondary site').to.be.false();
                expect(pidValidator.isSecondarySite(patientIdentifiers.primarySiteDfn), 'Primary sites are not secondary sites').to.be.false();
                expect(pidValidator.isSecondarySite(patientIdentifiers.currentSiteDfn), 'Primary sites are not secondary sites').to.be.false();
                expect(pidValidator.isSecondarySite(patientIdentifiers.edipi), 'edipi digits are not secondary sites').to.be.false();
                expect(pidValidator.isSecondarySite(patientIdentifiers.dfn), 'dfn digits are not secondary sites').to.be.false();
                expect(pidValidator.isSecondarySite(patientIdentifiers.icn), 'valid ICNs are not secondary sites').to.be.false();
                expect(pidValidator.isSecondarySite(patientIdentifiers.hdrInvalid), 'invalid HDR ICNs are not secondary site').to.be.false();
            });
        });
    });

    describe('patient identifier format checks', function() {
        describe('icn regex', function() {
            it('should match a valid icn', function() {
                expect(pidValidator.icnRegex.test(patientIdentifiers.icn)).to.be.true();
            });
            it('should not match an invalid icn', function() {
                expect(pidValidator.icnRegex.test(patientIdentifiers.dfn)).to.be.false();
            });
        });
        describe('dfn regex', function() {
            it('should match a valid dfn', function() {
                expect(pidValidator.dfnRegex.test(patientIdentifiers.dfn)).to.be.true();
            });
            it('should not match an invalid dfn', function() {
                expect(pidValidator.dfnRegex.test(patientIdentifiers.icn)).to.be.false();
            });
        });
        describe('isIcn', function() {
            it('should determine if pid is icn', function() {
                expect(pidValidator.isIcn(patientIdentifiers.icn)).to.be.true();
                expect(pidValidator.isIcn(patientIdentifiers.dfn)).to.be.false();
            });
        });
        describe('isSiteIcn', function() {
            it('should determine if pid is site;icn', function() {
                expect(pidValidator.isSiteIcn(patientIdentifiers.siteIcn)).to.be.true();
                expect(pidValidator.isSiteIcn(patientIdentifiers.icn)).to.be.false();
            });
        });
        describe('isSiteDfn', function() {
            it('should determine if pid is site;dfn', function() {
                expect(pidValidator.isSiteDfn(patientIdentifiers.currentSiteDfn)).to.be.true();
                expect(pidValidator.isSiteDfn(patientIdentifiers.dfn)).to.be.false();
            });
        });
        describe('isPidEdipi', function() {
            it('should determine if pid is DOD;edipi', function() {
                expect(pidValidator.isPidEdipi(patientIdentifiers.pidEdipi)).to.be.true();
                expect(pidValidator.isPidEdipi(patientIdentifiers.primarySiteDfn)).to.be.false();
            });
        });
        describe('isPidHdr', function() {
            it('should determine if pid is HDR;<icn>', function() {
                expect(pidValidator.isPidHdr(patientIdentifiers.hdr), 'should return false with a valid icn').to.be.true();
                expect(pidValidator.isPidHdr(patientIdentifiers.hdrInvalid), 'should return false with an invalid icn').to.be.false();
            });
        });
    });

    describe('pid validator can handle', function() {
        describe('when pid is empty', function(){
            it('containsSite returns false', function() {
                expect(pidValidator.containsSite()).to.be.false();
            });

            it('isCurrentSite returns false', function() {
                expect(pidValidator.isCurrentSite()).to.be.false();
            });

            it('isPrimarySite returns false', function() {
                expect(pidValidator.isPrimarySite()).to.be.false();
            });

            it('isSecondarySite returns false', function() {
                expect(pidValidator.isSecondarySite()).to.be.false();
            });

            it('isIcn returns false', function() {
                expect(pidValidator.isIcn()).to.be.false();
            });

            it('isSiteDfn returns false', function() {
                expect(pidValidator.isSiteDfn()).to.be.false();
            });

            it('isPidEdipi returns false', function() {
                expect(pidValidator.isPidEdipi()).to.be.false();
            });

            it('isEdipi returns false', function() {
                expect(pidValidator.isEdipi()).to.be.false();
            });

            it('isVhic returns false', function() {
                expect(pidValidator.isVhic()).to.be.false();
            });

            it('isPidHdr returns false', function() {
                expect(pidValidator.isPidHdr()).to.be.false();
            });
        });
    });
});

'use strict';

var multidivisionalSubsystem = require('./vista-multidivision-subsystem');

var app = {
    'config': {
        'vistaSites': {
            'SITE': {
                'division': [{
                    'id': '507',
                    'name': 'KODAK'
                }, {
                    'id': '613',
                    'name': 'MARTINSBURG'
                }, {
                    'id': '688',
                    'name': 'WASHINGTON'
                }],
                'environment': 'development',
                'host': 'IP        ',
                'localIP': 'IP      ',
                'localAddress': 'localhost',
                'port': PORT,
                'production': false,
                'accessCode': 'PW',
                'verifyCode': 'PW',
                'infoButtonOid': '1.3.6.1.4.1.3768',
                'abbreviation': 'KDK'
            },
            'SITE': {
                'division': [{
                    'id': '500',
                    'name': 'PANORAMA'
                }],
                'environment': 'development',
                'host': 'IP        ',
                'localIP': 'IP      ',
                'localAddress': 'localhost',
                'port': PORT,
                'production': false,
                'accessCode': 'USER  ',
                'verifyCode': 'PW      ',
                'infoButtonOid': '1.3.6.1.4.1.3768',
                'abbreviation': 'PAN'
            }
        }
    }
};

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'vista-multidivision-subsystem'
}));

describe('vista-multidivision-subsystem', function() {
    describe('getSubsystemConfig', function() {
        it('returns the correct healthcheck', function() {
            var config = multidivisionalSubsystem.getSubsystemConfig(app, logger);
            expect(config).not.to.be.null();
            expect(config.healthcheck).not.to.be.undefined();
            expect(config.healthcheck.name).eql('vista-multidivision-subsystem');
        });

        it('does not define a healthcheck interval', function() {
            var config = multidivisionalSubsystem.getSubsystemConfig(app, logger);
            expect(config.timeout).to.be.undefined();
        });
    });


    describe('parseVistaDivisionResults', function() {
        it('correctly parses a valid division', function() {
            var kodakString = '3\r\n507^CAMP BEE^507^1\r\n613^MARTINSBURG VAMC^613\r\n17102^WASHINGTON^688\r\n';
            var parseResult = multidivisionalSubsystem._parseVistaDivisionResults(kodakString);
            expect(parseResult instanceof Array).to.be.true();
            expect(parseResult.length).to.equal(3);
            expect(parseResult[2]).to.equal('688');
            expect(parseResult[0]).to.equal('507');
        });

        it('correctly parses a non-configured division', function() {
            var emptyDivision = '0\r\n';
            var parseResult = multidivisionalSubsystem._parseVistaDivisionResults(emptyDivision);
            expect(parseResult instanceof Array).to.be.true();
            expect(parseResult.length).to.equal(0);
        });

        it('correctly ignores an invalid division', function() {
            var kodakString = '3\r\n507CAMP BEE5071\r\n613^MARTINSBURG VAMC^613\r\n17102^WASHINGTON^688\r\nNON EMPTY FOOTER';
            var parseResult = multidivisionalSubsystem._parseVistaDivisionResults(kodakString);
            expect(parseResult instanceof Array).to.be.true();
            expect(parseResult.length).to.equal(2);
            expect(parseResult[1]).to.equal('688');
            expect(parseResult[0]).to.equal('613');
        });
    });

    describe('compareDivisionValues', function() {
        it('returns true when vista and config file values match', function() {
            var configDivisions = [{
                id: '507',
                name: 'A'
            }, {
                id: '613',
                name: 'B'
            }, {
                id: '688',
                name: 'C'
            }];
            var vistaDivisions = ['507', '613', '688'];
            var result = multidivisionalSubsystem._compareDivisionValues(configDivisions, vistaDivisions, 'TEST', logger);
            expect(result).to.be.true();
        });

        it('ignores malformed config file values', function() {
            var configDivisions = [{
                id: '507',
                name: 'A'
            }, {
                id: '613',
                name: 'B'
            }, {
                id: '688',
                name: 'C'
            }, {
                div: '200',
                name: 'Bob'
            }];
            var vistaDivisions = ['507', '613', '688'];
            var result = multidivisionalSubsystem._compareDivisionValues(configDivisions, vistaDivisions, 'TEST', logger);
            expect(result).to.be.true();
        });

        it('returns false when config file contains values that vista does not', function() {
            var configDivisions = [{
                id: '507',
                name: 'A'
            }, {
                id: '613',
                name: 'B'
            }, {
                id: '000',
                name: 'C'
            }];
            var vistaDivisions = ['507', '613'];
            var result = multidivisionalSubsystem._compareDivisionValues(configDivisions, vistaDivisions, 'TEST', logger);
            expect(result).to.be.false();
        });

        it('returns true when vista contains divisions that the config file does not', function() {
            var configDivisions = [{
                id: '507',
                name: 'A'
            }, {
                id: '613',
                name: 'B'
            }, {
                id: '688',
                name: 'C'
            }];
            var vistaDivisions = ['507', '613', '688', '901', 'LOL'];
            var result = multidivisionalSubsystem._compareDivisionValues(configDivisions, vistaDivisions, 'TEST', logger);
            expect(result).to.be.true();
        });
    });
});

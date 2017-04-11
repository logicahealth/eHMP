'use strict';

//-----------------------------------------------------------------
// This will test the location-util.js functions.
//---

var locationUtil = require('./location-util');
var validate = require('../write/pick-list/utils/validation-util');

describe('Location Utils - Get IEN', function () {
 it('verify clinics', function() {
            var input = 'urn:va:location:9E7A:64';
            var ien = locationUtil.getLocationIEN(input);
            expect(ien).to.eql('64');
        });
  it('verify wards', function() {
            var input = 'urn:va:location:9E7A:w64';
            var ien = locationUtil.getLocationIEN(input);
            expect(ien).to.eql('64');
        });
  it('verify null', function() {
            var input = null;
            var ien = locationUtil.getLocationIEN(input);
            expect(ien).to.be.null();
        });

    
});

describe('Location Utils - Get UID', function () {
 it('returns LocationUID for wards', function() {
            var ien = '64';
            var site = '9E7A';
            var locationType = 'W';
            var locationUid = locationUtil.getLocationUid(site,locationType,ien);
            expect(locationUid).to.eql('urn:va:location:9E7A:w64');
        });
 it('returns LocationUID for clinics', function() {
            var ien = '64';
            var site = '9E7A';
            var locationType = 'C';
            var locationUid = locationUtil.getLocationUid(site,locationType,ien);
            expect(locationUid).to.eql('urn:va:location:9E7A:64');
        });
  it('verify null', function() {
            var ien = null;
            var site = '9E7A';
            var locationType = 'C';
            var locationUid = locationUtil.getLocationUid(site,locationType,ien);
            expect(locationUid).to.be.null();
        });

    
});
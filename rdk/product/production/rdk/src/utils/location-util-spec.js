'use strict';

//-----------------------------------------------------------------
// This will test the location-util.js functions.
//---

var locationUtil = require('./location-util');

describe('Location Utils - Get IEN', function () {
 it('verify clinics', function() {
            var input = 'urn:va:location:SITE:64';
            var ien = locationUtil.getLocationIEN(input);
            expect(ien).to.eql('64');
        });
  it('verify wards', function() {
            var input = 'urn:va:location:SITE:w64';
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
            var site = 'SITE';
            var locationType = 'W';
            var locationUid = locationUtil.getLocationUid(site,locationType,ien);
            expect(locationUid).to.eql('urn:va:location:SITE:w64');
        });
 it('returns LocationUID for clinics', function() {
            var ien = '64';
            var site = 'SITE';
            var locationType = 'C';
            var locationUid = locationUtil.getLocationUid(site,locationType,ien);
            expect(locationUid).to.eql('urn:va:location:SITE:64');
        });
  it('verify null', function() {
            var ien = null;
            var site = 'SITE';
            var locationType = 'C';
            var locationUid = locationUtil.getLocationUid(site,locationType,ien);
            expect(locationUid).to.be.null();
        });


});

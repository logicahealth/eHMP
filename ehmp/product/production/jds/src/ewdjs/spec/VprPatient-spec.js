'use strict';

var request = require('request');
var url = 'http://IP_ADDRESS:PORT/ewdjs/';
var endpoint = 'vpr/';
var patient;


// Make sure patient ASDF;123 is clear before running integration tests
patient = 'ASDF;123';

request.del(url + endpoint + patient, function(error, response, body) {
  if (error !== null) {
    console.error(error);
  }
});

describe('associate endpoint - assign jpid to pid', function() {
  it('returns status 200 with PID in URL and body', function(done) {
    patient = 'jpid';

    request.post({
          headers: {'content-type': 'application/json'},
          url:     url + endpoint + patient,
          body:    '{"patientIdentifiers":["ASDF;123","HJKL;123"]}'
    }, function(error, response, body){
      if (error !== null) {
        done(error);
      } else {
        expect(response.statusCode).toBe(200);
        done();
      }
    });
  });

  it('returns status 200 with PID in URL and JPID existing', function(done) {
    patient = 'jpid/ASDF;123';

    request.post({
          headers: {'content-type': 'application/json'},
          url:     url + endpoint + patient,
          body:    '{"patientIdentifiers":["ASDF;123"]}'
    }, function(error, response, body){
      if (error !== null) {
        done(error);
      } else {
        expect(response.statusCode).toBe(200);
        done();
      }
    });
  });

  it('returns status 400 with no PID in URL and JPID existing', function(done) {
    patient = 'jpid';

    request.post({
          headers: {'content-type': 'application/json'},
          url:     url + endpoint + patient,
          body:    '{"patientIdentifiers":["ASDF;123"]}'
    }, function(error, response, body){
      if (error !== null) {
        done(error);
      } else {
        expect(response.statusCode).toBe(400);
        expect(body).toMatch(/{.*}/);
        expect(body).toContain('"message":"JPID Collision Detected"');
        expect(body).toContain('"reason":"223"');
        expect(body).toContain('"message":"Bad Request"');
        done();
      }
    });
  });
});

describe('putpt endpoint - add patient demographics', function() {
  it('returns status 200 for ASDF;123', function(done) {
    patient = '';

    request.post({
          headers: {'content-type': 'application/json'},
          url:     url + endpoint + patient,
          body:    '{"address":[{"city":"Any Town",' +
                   '"zip":"99998",' +
                   '"state":"WEST VIRGINIA"}],' +
                   '"alias":[{"fullName":"TEMP7"}],' +
                   '"briefId":"U7767",' +
                   '"birthDate":19350408,' +
                   '"contact":[{"name":"VETERAN,BROTHER",' +
                   '"summary":"VETERAN,BROTHER",' +
                   '"typeCode":"urn:va:pat-contact:NOK",' +
                   '"typeName":"Next of Kin"}],' +
                   '"facility":[{"code":400,"summary":"CAMP MASTER",' +
                   '"name":"CAMP MASTER","systemId":"ASDF"}],' +
                   '"genderName":"Male",' +
                   '"genderCode":"urn:va:pat-gender:M",' +
                   '"givenNames":"SEVEN",' +
                   '"icn":"888V123887",' +
                   '"ssn":"88888887",' +
                   '"pid":"ASDF;123",' +
                   '"uid":"urn:va:patient:ASDF:123:123",' +
                   '"stampTime": "20141031094920"}'
    }, function(error, response, body){
      if (error !== null) {
        done(error);
      } else {
        expect(response.statusCode).toBe(200);
        done();
      }
    });
  });

  it('returns status 200 for HJKL;123', function(done) {
    patient = '';

    request.post({
          headers: {'content-type': 'application/json'},
          url:     url + endpoint + patient,
          body:    '{"address":[{"city":"Any Town",' +
                   '"zip":"99998",' +
                   '"state":"WEST VIRGINIA"}],' +
                   '"alias":[{"fullName":"TEMP7"}],' +
                   '"briefId":"U7767",' +
                   '"birthDate":19350408,' +
                   '"facility":[{"code":400,"summary":"CAMP MASTER",' +
                   '"name":"CAMP MASTER","systemId":"HJKL"}],' +
                   '"genderName":"Male",' +
                   '"genderCode":"urn:va:pat-gender:M",' +
                   '"givenNames":"SEVEN",' +
                   '"icn":"888V123887",' +
                   '"ssn":"88888887",' +
                   '"pid":"HJKL;123",' +
                   '"uid":"urn:va:patient:HJKL:123:123",' +
                   '"stampTime": "20141031094920"}'
    }, function(error, response, body){
      if (error !== null) {
        done(error);
      } else {
        expect(response.statusCode).toBe(200);
        done();
      }
    });
  });
});

// This endpoint is not yet implemented
describe('endpoint - add patient domains', function() {
  it('returns status 200', function(done) {
    patient = '';

    request.post({
          headers: {'content-type': 'application/json'},
          url:     url + endpoint + patient,
          body:    '{"codes":[{"code":"72514-3",' +
                   '"display":' +
                   '"Pain severity 0-10 verbal numeric rating [#] - Reported",' +
                   '"system":"http://loinc.org"}],' +
                   '"displayName":"PN",' +
                   '"enteredByName":"LABTECH,THIRTY",' +
                   '"enteredByUid":"urn:va:user:ASDF:10000000012",' +
                   '"facilityCode":"515.6",' +
                   '"facilityName":"TROY",' +
                   '"kind":"Vital Sign",' +
                   '"lastUpdateTime":"20030415160525",' +
                   '"localId":"8739",' +
                   '"locationName":"GEN MED",' +
                   '"locationUid":"urn:va:location:ASDF:8",' +
                   '"observed":"200304151605",' +
                   '"patientGeneratedDataFlag":false,' +
                   '"pid":"ASDF;123",' +
                   '"qualifiedName":"PAIN",' +
                   '"result":"5",' +
                   '"resultNumber":5,' +
                   '"resulted":"20030415160525",' +
                   '"stampTime":"20030415160525",' +
                   '"summary":"PAIN 5 ",' +
                   '"typeCode":"urn:va:vuid:4500635",' +
                   '"typeName":"PAIN",' +
                   '"uid":"urn:va:vital:ASDF:123:8739",' +
                   '"units":""}'
    }, function(error, response, body){
      if (error !== null) {
        done(error);
      } else {
        expect(response.statusCode).toBe(200);
        done();
      }
    });
  });
});

describe('getpt endpoint - get patient demographics', function() {
  it('returns patient demographics for ASDF;123', function(done) {
    patient = 'ASDF;123';

    request.get(url + endpoint + patient, function(error, response, body) {
      if (error !== null) {
        done(error);
      } else {
        expect(response.statusCode).toBe(200);
        expect(body).toMatch(/{.*}/);
        expect(body).toContain('"totalItems":1');
        expect(body).toContain('"briefId":"U7767"');
        expect(body).toContain('"birthDate":19350408');
        expect(body).toContain('"icn":"888V123887"');
        expect(body).toContain('"uid":"urn:va:patient:ASDF:123:123"');
        expect(body).toContain('"systemId":"ASDF"');
        expect(body).toContain('"pid":"ASDF;123"');
        expect(body).not.toContain('"uid":"urn:va:patient:HJKL:123:123"');
        expect(body).not.toContain('"systemId":"HJKL"');
        expect(body).not.toContain('"pid":"HJKL;123"');
        done();
      }
    });
  });

  it('returns patient demographics for HJKL;123', function(done) {
    patient = 'pid/HJKL;123';

    request.get(url + endpoint + patient, function(error, response, body) {
      if (error !== null) {
        done(error);
      } else {
        expect(body).toMatch(/{.*}/);
        expect(body).toContain('"totalItems":1');
        expect(body).toContain('"briefId":"U7767"');
        expect(body).toContain('"birthDate":19350408');
        expect(body).toContain('"icn":"888V123887"');
        expect(body).not.toContain('"uid":"urn:va:patient:ASDF:123:123"');
        expect(body).not.toContain('"systemId":"ASDF"');
        expect(body).not.toContain('"pid":"ASDF;123"');
        expect(body).toContain('"uid":"urn:va:patient:HJKL:123:123"');
        expect(body).toContain('"systemId":"HJKL"');
        expect(body).toContain('"pid":"HJKL;123"');
        done();
      }
    });
  });

  it('returns patient demographics for all sites', function(done) {
    patient = '888V123887';

    request.get(url + endpoint + patient, function(error, response, body) {
      if (error !== null) {
        done(error);
      } else {
        expect(response.statusCode).toBe(200);
        expect(body).toMatch(/{.*}/);
        expect(body).toContain('"totalItems":2');
        expect(body).toContain('"briefId":"U7767"');
        expect(body).toContain('"birthDate":19350408');
        expect(body).toContain('"icn":"888V123887"');
        expect(body).toContain('"uid":"urn:va:patient:ASDF:123:123"');
        expect(body).toContain('"systemId":"ASDF"');
        expect(body).toContain('"pid":"ASDF;123"');
        expect(body).toContain('"uid":"urn:va:patient:HJKL:123:123"');
        expect(body).toContain('"systemId":"HJKL"');
        expect(body).toContain('"pid":"HJKL;123"');
        done();
      }
    });
  });

  it('returns patient demographics for all sites', function(done) {
    patient = 'pid/888V123887';

    request.get(url + endpoint + patient, function(error, response, body) {
      if (error !== null) {
        done(error);
      } else {
        expect(body).toMatch(/{.*}/);
        expect(body).toContain('"totalItems":2');
        expect(body).toContain('"briefId":"U7767"');
        expect(body).toContain('"birthDate":19350408');
        expect(body).toContain('"icn":"888V123887"');
        expect(body).toContain('"uid":"urn:va:patient:ASDF:123:123"');
        expect(body).toContain('"systemId":"ASDF"');
        expect(body).toContain('"pid":"ASDF;123"');
        expect(body).toContain('"uid":"urn:va:patient:HJKL:123:123"');
        expect(body).toContain('"systemId":"HJKL"');
        expect(body).toContain('"pid":"HJKL;123"');
        done();
      }
    });
  });
});

// Improve this once endpoint to post non-demographic data is implemented
describe('getobj endpoint - get patient demographics', function() {
  it('returns patient data domain for ASDF;123', function(done) {
    patient = 'ASDF;123/urn:va:patient:ASDF:123:123';

    request.get(url + endpoint + patient, function(error, response, body) {
      if (error !== null) {
        done(error);
      } else {
        expect(body).toMatch(/{.*}/);
        expect(body).toContain('"totalItems":1');
        expect(body).toContain('"briefId":"U7767"');
        expect(body).toContain('"birthDate":19350408');
        expect(body).toContain('"icn":"888V123887"');
        expect(body).toContain('"uid":"urn:va:patient:ASDF:123:123"');
        expect(body).toContain('"systemId":"ASDF"');
        expect(body).toContain('"pid":"ASDF;123"');
        done();
      }
    });
  });

  it('returns patient data domain for HJKL;123', function(done) {
    patient = '888V123887/urn:va:patient:HJKL:123:123';

    request.get(url + endpoint + patient, function(error, response, body) {
      if (error !== null) {
        done(error);
      } else {
        expect(body).toMatch(/{.*}/);
        expect(body).toContain('"totalItems":1');
        expect(body).toContain('"briefId":"U7767"');
        expect(body).toContain('"birthDate":19350408');
        expect(body).toContain('"icn":"888V123887"');
        expect(body).toContain('"uid":"urn:va:patient:HJKL:123:123"');
        expect(body).toContain('"systemId":"HJKL"');
        expect(body).toContain('"pid":"HJKL;123"');
        done();
      }
    });
  });
});

// Improve this once endpoint to post non-demographic data is implemented
describe('deluid endpoint - delete patient demographics by UID', function() {
  it('returns status 400 for HJKL;123', function(done) {
    patient = 'HJKL;123/urn:va:patient:HJKL:123:123';

    request.del(url + endpoint + patient, function(error, response, body) {
      if (error !== null) {
        done(error);
      } else {
        expect(response.statusCode).toBe(400);
        expect(body).toMatch(/{.*}/);
        expect(body).toContain('"domain":"urn:va:patient:HJKL:123:123"');
        expect(body).toContain('"message":"Delete demographics only not allowed"');
        expect(body).toContain('"reason":"213"')
        done();
      }
    });
  });
});

describe('delpt endpoint - delete all patient demographics', function() {
  it('returns status 200 for ASDF;123', function(done) {
    patient = 'ASDF;123';

    request.del(url + endpoint + patient, function(error, response, body) {
      if (error !== null) {
        done(error);
      } else {
        expect(response.statusCode).toBe(200);
        done();
      }
    });
  });
});

describe('getpt endpoint - get patient demographics', function() {
  it('returns status 400 after delpt endpoint', function(done) {
    patient = 'ASDF;123';

    request.get(url + endpoint + patient, function(error, response, body) {
      if (error !== null) {
        done(error);
      } else {
        expect(response.statusCode).toBe(400);
        expect(body).toMatch(/{.*}/);
        expect(body).toContain('"domain":"Identifier ASDF;123"');
        expect(body).toContain('"message":"Patient Demographics not on File"');
        expect(body).toContain('"reason":"225"');
        done();
      }
    });
  });
});

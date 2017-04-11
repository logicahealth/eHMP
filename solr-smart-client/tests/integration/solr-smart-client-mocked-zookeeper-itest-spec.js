'use strict';
//require('../../../env-setup');

//Note: running this test and other solr related test requires access to the zookeeper port (curently 2181)
//Working through this in dev my manually enabling the port forwarding via Virtualbox GUI
//but this needs to be taken care of from within chef-repo
var solrSmartClient = require('../../solr-smart-client');
var config = require('./worker-config.json');
var _ = require('underscore');
var sinon = require('sinon');
var solrClientLib = require('solr-client');


var solrClient = null;
var finished = false;
var eventCaptured = false;

//var logger = require('bunyan').createLogger({
//  name: 'test:solr-smart-client',
//  level: 'fatal'
//});


var logger = {};
logger.info = console.log;
logger.debug = console.log;
logger.error = console.log;

describe('solr-smart-client', function () {

  beforeEach(function () {
    finished = false;
    eventCaptured = false;
  });


  var stubClient = null;
  var stubInitClient = function(core, connection, logger){
    //console.log('stubInitClient called');
    //console.log(core);
    //console.log(connection);
    //console.log(logger);
    stubClient = new solrSmartClient._SolrSmartClient(null);
    //console.log('client created:');
    //console.log(client);
    return stubClient;
  };
  sinon.stub(solrSmartClient, "initClient", stubInitClient);


  var stubGetOptions = function(agent){
    return {
      "host": "IPADDRESS",
      "port": "8983",
      "core": "vpr",
      "path": "/solr",
      "agent": null
    }
  };
  //sinon.stub(solrSmartClient, "getOptions", stubGetOptions);

  var stubGetValidSolrClient = function(callback, agent){
    console.log('stubGetValidSolrClient()');
    var options = stubGetOptions(null);

    var client = solrClientLib.createClient(options);
    callback(null, client);
  };

  sinon.stub(solrSmartClient, "getValidSolrClient", stubGetValidSolrClient);


  xit('uses the correct config', function () {
    expect(config).not.toBeNull();
    expect(config.solrClient).not.toBeNull();
    expect(config.vxsync.solrClient.zooKeeperConnection).toBe('localhost:2181');
  });

  it('can create solr client', function () {
    var solrConfig = config.vxsync.solrClient;


    //console.log('calling solrSmartClient.initClient');
    solrClient = solrSmartClient.initClient(solrConfig.core, solrConfig.zooKeeperConnection, logger);
    //console.log('solrClient created');
    //console.log(solrClient);
    expect(solrClient).not.toBeUndefined();
    expect(solrClient).not.toBeNull();
  });

  it('Can add one document to SOLR.', function () {
    var solrRecord = {"pid": "1001", "uid":"1001"};
    expect(_.isObject(solrRecord)).toBe(true);
    if (_.isObject(solrRecord)) {
      runs(function () {
        solrClient.add(solrRecord, function (error, data) {
          /**console.log(doc, error, data);/**/
          console.log('error');
          console.log(error);
          console.log('data');
          console.log(data);

          expect(error).toBeNull();
          expect(data).not.toBeUndefined();
          expect(data).not.toBeNull();
          expect(data['responseHeader']).not.toBeUndefined();
          expect(data['responseHeader']['status']).toBe(0);
          finished = true;
        });
      });

      waitsFor(function () {
        return finished;
      });
    }
  })


  /***
   * There might be issues with this test on timing, the commit forces rebuilding of spelling index, which may take
   * too long.
   */
  xit('Can call commit', function () {
      runs(function () {
        solrClient.commit(function (error, data) {
          /**console.log(doc, error, data);/**/
          console.log('commit callback');
          expect(error).toBeNull();
          expect(data).not.toBeUndefined();
          expect(data['responseHeader']).not.toBeUndefined();
          expect(data['responseHeader']['status']).toBe(0);
          finished = true;
        });
      });

      waitsFor(function () {
        return finished;
      });
  })

  it('Can search.', function () {
      runs(function () {
        solrClient.search('9E7A;3', function (error, data) {
          /**console.log(doc, error, data);/**/
          console.log(data);
          expect(error).toBeNull();
          expect(data).not.toBeUndefined();
          expect(data['responseHeader']).not.toBeUndefined();
          expect(data['responseHeader']['status']).toBe(0);
          finished = true;
        });
      });

      waitsFor(function () {
        return finished;
      });
  })

  it('Can delete by query', function () {
      runs(function () {
        solrClient.deleteByQuery('PID:1', function (error, data) {
          /**console.log(doc, error, data);/**/
          expect(error).toBeNull();
          expect(data).not.toBeUndefined();
          expect(data['responseHeader']).not.toBeUndefined();
          expect(data['responseHeader']['status']).toBe(0);
          finished = true;
        });
      });

      waitsFor(function () {
        return finished;
      });
  })

  xit('Can delete all.', function () {
      runs(function () {
        solrClient.deleteAll(function (error, data) {
          /**console.log(doc, error, data);/**/
          expect(error).toBeNull();
          expect(data).not.toBeUndefined();
          expect(data['responseHeader']).not.toBeUndefined();
          expect(data['responseHeader']['status']).toBe(0);
          finished = true;
        });
      });

      waitsFor(function () {
        return finished;
      });
  })


  xit('waits forever so we can see connection logs', function() {
    waitsFor(function(){
      return false;
    }, 'wait as long as we can', 100000)
  })

  it('can close the zk connection', function () {
    solrClient.closeZookeeper();
  })
});

var vprRecord = {
  'codes': [{
    'code': 'C0008299',
    'display': 'Chocolate',
    'system': 'urn:oid:2.16.840.1.113883.6.86'
  }],
  'drugClasses': [{
    'code': 'CHOCO100',
    'name': 'CHOCOLATE'
  }],
  'entered': '200712171515',
  'enteredByUid': 'urn:va:user:9E7A:100',
  'verifiedByUid': 'urn:va:user:9E7A:101',
  'facilityCode': '500',
  'facilityName': 'CAMP MASTER',
  'historical': true,
  'kind': 'Allergy/Adverse Reaction',
  'lastUpdateTime': '20071217151553',
  'localId': '876',
  'mechanism': 'ALLERGY',
  'originatorName': 'PROVIDER,ONE',
  'pid': '9E7A;3',
  'products': [{
    'name': 'CHOCOLATE',
    'summary': 'AllergyProduct{uid=\'\'}',
    'vuid': 'urn:va:vuid:4636681'
  }],
  'reactions': [{
    'name': 'DIARRHEA',
    'summary': 'AllergyReaction{uid=\'\'}',
    'vuid': 'urn:va:vuid:4637011'
  }],
  'reference': '3;GMRD(120.82,',
  'stampTime': '20071217151553',
  'summary': 'CHOCOLATE',
  'typeName': 'DRUG, FOOD',
  'uid': 'urn:va:allergy:9E7A:3:876',
  'verified': '20071217151553',
  'verifierName': '<auto-verified>',
  'comments': [{
    'entered': 200503172009,
    'comment': 'The allergy comment.'
  }],
  'observations': [{
    'date': 200503172009,
    'severity': 'bad'
  }],
  'severityName': 'SEVERE'

};


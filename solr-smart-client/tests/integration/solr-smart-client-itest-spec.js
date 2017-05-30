'use strict';

// NOTICE: in order to run this test, the Mocks VM must be running with Solr and ZooKeeper.
// Also, the test for "deleteAll()" will delete all of the records in Solr.

// These tests only verify that the functions execute without errors. Verifying that inserting,
// finding, and deleting data is a manual process.

var SolrSmartClient = require('../../solr-smart-client').SolrSmartClient;
var initClient = require('../../solr-smart-client').initClient;
var createClient = require('../../solr-smart-client').createClient;

var _ = require('underscore');

var solrClient = null;
var finished = false;

var config = {
  solrClient: {
    timeoutMillis: 3000,
    core: 'vpr',
    path: '/live_nodes',
    zooKeeperConnection: 'IP             '
  }
};

// Use this logger to prevent logging output during testing
var logger = {
  trace: _.noop,
  debug: _.noop,
  info: _.noop,
  warn: _.noop,
  error: _.noop,
  fatal: _.noop,
  child: function() { return this; }
};

// Use this logger for debugging
// var logger = require('bunyan').createLogger({
//  name: 'test',
//  level: 'debug'
// });

describe('solr-smart-client', function() {
  beforeEach(function() {
    finished = false;
  });

  describe('General Initialization/Startup', function() {
    it('tests create solr client with old factory function', function() {
      solrClient = initClient(config.solrClient.core, config.solrClient.zooKeeperConnection, logger);
      expect(solrClient).not.toBeUndefined();
      expect(solrClient).not.toBeNull();
    });

    it('tests create solr client with new factory function', function() {
      solrClient = createClient(logger, config.solrClient);
      expect(solrClient).not.toBeUndefined();
      expect(solrClient).not.toBeNull();
    });

    it('testscreate solr client with constructor function', function() {
      solrClient = new SolrSmartClient(logger, config.solrClient);
      expect(solrClient).not.toBeUndefined();
      expect(solrClient).not.toBeNull();
    });

    it('creates a childInstance', function() {
      solrClient = new SolrSmartClient(logger, config.solrClient);
      var childLogger = logger.child();
      var childInstance = solrClient.childInstance(childLogger);
      expect(childInstance).not.toBe(solrClient);
      expect(childInstance.zkClient).toEqual(solrClient.zkClient);
    });
  });

  describe('Timeout functionality', function() {
    it('tests that timeout works when attempting to get a connection', function() {
      var badConfig = {
        solrClient: {
          timeoutMillis: 500, // short timeout so we don't wait a long time for the test
          core: 'vpr',
          path: '/live_nodes',
          zooKeeperConnection: 'IP            ' // this should point to a non-existent ZooKeeper server
        }
      };

      solrClient = createClient(logger, badConfig.solrClient);

      runs(function() {
        solrClient.search('PID:1', function(error) {
          expect(error).not.toBeNull();
          expect(error).not.toBeUndefined();
        });
        finished = true;
      });

      waitsFor(function() {
        return finished;
      }, 5000);
    });
  });

  describe('add()', function() {
    it('tests that add executes', function() {
      var solrRecord = {
        pid: '1001',
        uid: '1001'
      };

      solrClient = createClient(logger, config.solrClient);

      expect(_.isObject(solrRecord)).toBe(true);
      if (_.isObject(solrRecord)) {
        runs(function() {
          solrClient.add(solrRecord, function(error, data) {
            expect(error).toBeNull();
            expect(data).not.toBeUndefined();
            expect(data).not.toBeNull();
            if (data) {
              expect(data.responseHeader).not.toBeUndefined();
              expect(data.responseHeader.status).toBe(0);
            }
            finished = true;
          });
        });

        waitsFor(function() {
          return finished;
        });
      }
    });
  });

  describe('search()', function() {
    it('tests that search executes', function() {
      solrClient = createClient(logger, config.solrClient);

      runs(function() {
        solrClient.search('PID:1', function(error, data) {
          expect(error).toBeNull();
          expect(data).not.toBeUndefined();
          if (data) {
            expect(data.responseHeader).not.toBeUndefined();
            expect(data.responseHeader.status).toBe(0);
          }
          finished = true;
        });
      });

      waitsFor(function() {
        return finished;
      });
    });
  });

  describe('get()', function() {
    // disabled because no search handler is available for testing
    xit('tests that get executes', function() {
      runs(function() {
        solrClient.get('', 'PID:1', function(error, data) {
          expect(error).toBeNull();
          expect(data).not.toBeUndefined();
          if (data) {
            expect(data.responseHeader).not.toBeUndefined();
            expect(data.responseHeader.status).toBe(0);
          }
          finished = true;
        });
      });

      waitsFor(function() {
        return finished;
      });
    });
  });

  describe('deleteByQuery()', function() {
    it('tests delete by query executes', function() {
      runs(function() {
        solrClient.deleteByQuery('PID:1', function(error, data) {
          expect(error).toBeNull();
          expect(data).not.toBeUndefined();
          if (data) {
            expect(data.responseHeader).not.toBeUndefined();
            expect(data.responseHeader.status).toBe(0);
          }
          finished = true;
        });
      });

      waitsFor(function() {
        return finished;
      });
    });
  });

  describe('deleteAll()', function() {
    it('tests delete all documents executes', function() {
      runs(function() {
        solrClient.deleteAll(function(error, data) {
          expect(error).toBeNull();
          expect(data).not.toBeUndefined();
          if (data) {
            expect(data.responseHeader).not.toBeUndefined();
            expect(data.responseHeader.status).toBe(0);
          }
          finished = true;
        });
      });

      waitsFor(function() {
        return finished;
      });
    });
  });

  describe('commit()', function() {
    it('tests commit executes', function() {
      runs(function() {
        solrClient.commit(function(error) {
          expect(_.isUndefined(error) || _.isNull(error)).toBe(true);
          finished = true;
        });
      });

      waitsFor(function() {
        return finished;
      });
    });
  });
});
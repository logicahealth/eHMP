'use strict';

// NOTICE: in order to run this test, the Mocks VM must be running with Solr and ZooKeeper.
// Also, the test for "deleteAll()" will delete all of the records in Solr.

// These tests only verify that the functions execute without errors. Verifying that inserting,
// finding, and deleting data is a manual process.

const bunyan = require('bunyan');

const SolrSmartClient = require('../../solr-smart-client').SolrSmartClient;
const createClient = require('../../solr-smart-client').createClient;

const _ = require('underscore');

const PATH = '/collections/vpr/state.json';
const CORE = 'vpr';

const logger = bunyan.createLogger({
  name: 'test',
  level: 'debug',
  // comment out the next three lines to see logger output
  streams: [{
    path: '/dev/null',
  }]
});

let solrSmartClient = null;
let finished = false;

function getConfig(config) {
  return _.defaults(config || {}, {
    dataTimeoutMillis: 3000,
    core: CORE,
    path: PATH,
    zooKeeperConnection: 'IP             ',
  });
}


describe('solr-smart-client', function() {
  beforeEach(function() {
    finished = false;
  });

  describe('General Initialization/Startup', function() {
    it('tests creating solr client with factory function', function() {
      solrSmartClient = createClient(logger, getConfig());
      expect(solrSmartClient).not.toBeUndefined();
      expect(solrSmartClient).not.toBeNull();
    });

    it('tests creating solr client with constructor function', function() {
      solrSmartClient = new SolrSmartClient(logger, getConfig());
      expect(solrSmartClient).not.toBeUndefined();
      expect(solrSmartClient).not.toBeNull();
    });

    it('tests that a childInstance is created when childInstanceEnabled === true', function() {
      solrSmartClient = new SolrSmartClient(logger, getConfig({
        childInstanceEnabled: true
      }));
      let childLogger = logger.child();
      let childInstance = solrSmartClient.childInstance(childLogger);
      expect(childInstance).not.toBe(solrSmartClient);
    });

    it('tests that a childInstance is not created when childInstanceEnabled !== true', function() {
      solrSmartClient = new SolrSmartClient(logger, getConfig({
        childInstanceEnabled: false
      }));

      let childLogger = logger.child();
      let childInstance = solrSmartClient.childInstance(childLogger);
      expect(childInstance).toBe(solrSmartClient);
    });
  });

  describe('Timeout functionality', function() {
    it('tests that timeout works when attempting to get a connection', function() {
      let badConfig = {
        solrClient: {
          dataTimeoutMillis: 500, // short timeout so we don't wait a long time for the test
          core: CORE,
          path: PATH,
          zooKeeperConnection: 'IP            ' // this should point to a non-existent ZooKeeper server
        }
      };

      solrSmartClient = createClient(logger, badConfig.solrClient);

      runs(function() {
        solrSmartClient.search('PID:1', error => {
          expect(error).not.toBeNull();
          expect(error).not.toBeUndefined();
          finished = true;
        });
      });

      waitsFor(function() {
        return finished;
      }, 1000);
    });
  });

  describe('solr functions', function() {
    describe('add()', function() {
      it('tests that add() executes', function() {
        let solrRecord = {
          pid: '1001',
          uid: '1001'
        };

        solrSmartClient = createClient(logger, getConfig());

        expect(_.isObject(solrRecord)).toBe(true);
        if (_.isObject(solrRecord)) {
          runs(function() {
            solrSmartClient.add(solrRecord, (error, data) => {
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
          }, 1000);
        }
      });
    });

    describe('search()', function() {
      it('tests that search() executes', function() {
        solrSmartClient = createClient(logger, getConfig());

        runs(function() {
          solrSmartClient.search('PID:1', (error, data) => {
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
        }, 1000);
      });
    });

    describe('get()', function() {
      it('tests that get() executes', function() {
        runs(function() {
          solrSmartClient.get('admin/ping', (error, data) => {
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
        }, 1000);
      });
    });

    describe('deleteByQuery()', function() {
      it('tests that deleteByQuery() executes', function() {
        runs(function() {
          solrSmartClient.deleteByQuery('PID:1', (error, data) => {
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
        }, 1000);
      });
    });

    describe('deleteAll()', function() {
      it('tests that deleteAll() executes', function() {
        runs(function() {
          solrSmartClient.deleteAll((error, data) => {
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
        }, 1000);
      });
    });

    describe('ping()', function() {
      it('tests that ping() executes', function() {
        runs(function() {
          solrSmartClient.ping(error => {
            expect(_.isUndefined(error) || _.isNull(error)).toBe(true);
            finished = true;
          });
        });

        waitsFor(function() {
          return finished;
        }, 1000);
      });
    });

    describe('commit()', function() {
      it('tests that commit() executes', function() {
        runs(function() {
          solrSmartClient.commit(error => {
            expect(_.isUndefined(error) || _.isNull(error)).toBe(true);
            finished = true;
          });
        });

        waitsFor(function() {
          return finished;
        }, 1000);
      });
    });
  });
});
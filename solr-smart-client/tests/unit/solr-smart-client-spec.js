'use strict';

const bunyan = require('bunyan');
const SolrSmartClient = require('../../solr-smart-client').SolrSmartClient;

const dummyLogger = bunyan.createLogger({
  name: 'test',
  level: 'debug',
  // comment out the next three lines to see logger output
  streams: [{
    path: '/dev/null',
  }]
});

function clusterStateString(...params) {
  return JSON.stringify(clusterState(...params));
}

function badClusterStateString(...params) {
  let state = clusterState(...params);
  delete state.shards;
  return JSON.stringify(state);
}

function clusterState({
  protocol = 'http',
  address = 'IP        ',
  core = 'vpr'
} = {}) {
  return {
    [core]: {
      'replicationFactor': '1',
      'shards': {
        'shard1': {
          'range': '80000000-7fffffff',
          'state': 'active',
          'replicas': {
            'core_node1': {
              'core': 'vpr_shard1_replica1',
              'base_url': (protocol ? protocol + '://' : '') + address + ':PORT/solr',
              'node_name': 'IP             _solr',
              'state': 'active',
              'leader': 'true'
            },
            'core_node2': {
              'core': 'vpr_shard1_replica2',
              'base_url': (protocol ? protocol + '://' : '') + address + ':PORT/solr',
              'node_name': 'IP             _solr',
              'state': 'active',
              'leader': 'true'
            }
          }
        },
        'shard2': {
          'range': '80000000-7fffffff',
          'state': 'active',
          'replicas': {
            'core_node3': {
              'core': 'vpr_shard2_replica1',
              'base_url': (protocol ? protocol + '://' : '') + address + ':PORT/solr',
              'node_name': 'IP             _solr',
              'state': 'active',
              'leader': 'true'
            },
            'core_node4': {
              'core': 'vpr_shard2_replica2',
              'base_url': (protocol ? protocol + '://' : '') + address + ':PORT/solr',
              'node_name': 'IP             _solr',
              'state': 'active',
              'leader': 'true'
            }
          }
        }
      },
      'router': {
        'name': 'compositeId'
      },
      'maxShardsPerNode': '2',
      'autoAddReplicas': 'false'
    }
  };
}

console.log(clusterStateString())

describe('solr-smart-client', function() {
  describe('_getValidSolrClient()', function() {
    it('tests that correct agent is used to create solrClient instance', function() {
      let expectSolrConfig;
      let finished = false;
      let testAgent = 'test instance';

      let solrClient = {
        createClient: function(solrConfig) {
          expectSolrConfig = solrConfig;
        }
      };

      let instance = {
        logger: dummyLogger,
        config: {
          core: 'vpr'
        },
        agent: testAgent,
        _getValidSolrClient: SolrSmartClient.prototype._getValidSolrClient,
        _getSolrClientInfo: function(callback) {
          this.logger.debug('test._getSolrClient()');
          return setTimeout(callback, 0, null, clusterStateString());
        }
      };

      runs(function() {
        instance._getValidSolrClient(solrClient, error => {
          expect(error).toBeFalsy();
          expect(expectSolrConfig.agent).toEqual(testAgent);
          finished = true;
        });
      });

      waitsFor(function() {
        return finished;
      }, 500);
    });
  });

  describe('_findFirstReadyNodeUrl()', function() {
    it('tests that urls with protocols are accepted', function() {
      let result;

      result = SolrSmartClient._findFirstReadyNodeUrl(dummyLogger, clusterState().vpr.shards);
      expect(result).toBeTruthy();
      if (result) {
        expect(result.length).toBe(6);
        expect(result[2]).toBe('http');
        expect(result[3]).toBe('IP        ');
        expect(result[4]).toBe('PORT');
        expect(result[5]).toBe('/solr');
      }

      result = SolrSmartClient._findFirstReadyNodeUrl(dummyLogger, clusterState({
        protocol: 'https'
      }).vpr.shards);

      expect(result).toBeTruthy();
      if (result) {
        expect(result.length).toBe(6);
        expect(result[2]).toBe('https');
        expect(result[3]).toBe('IP        ');
        expect(result[4]).toBe('PORT');
        expect(result[5]).toBe('/solr');
      }
    });

    it('tests that urls without protocols are accepted', function() {
      let result;

      result = SolrSmartClient._findFirstReadyNodeUrl(dummyLogger, clusterState({
        protocol: ''
      }).vpr.shards);

      expect(result).toBeTruthy();
      if (result) {
        expect(result.length).toBe(6);
        expect(result[2]).toBeFalsy();
        expect(result[3]).toBe('IP        ');
        expect(result[4]).toBe('PORT');
        expect(result[5]).toBe('/solr');
      }
    });

    it('tests that nodes that are not in the correct state are omitted', function() {
      let result;
      let shards = clusterState().vpr.shards;

      shards.shard1.replicas.core_node1.state = 'inactive';
      shards.shard1.replicas.core_node1.leader = 'true';
      result = SolrSmartClient._findFirstReadyNodeUrl(dummyLogger, shards);
      expect(result).toBeTruthy();
      if (result) {
        expect(result.length).toBe(6);
        expect(result[2]).toBe('http');
        expect(result[3]).toBe('IP        ');
        expect(result[4]).toBe('PORT');
        expect(result[5]).toBe('/solr');
      }

      shards.shard1.replicas.core_node1.state = 'active';
      shards.shard1.replicas.core_node1.leader = 'false';
      result = SolrSmartClient._findFirstReadyNodeUrl(dummyLogger, shards);
      expect(result).toBeTruthy();
      if (result) {
        expect(result.length).toBe(6);
        expect(result[2]).toBe('http');
        expect(result[3]).toBe('IP        ');
        expect(result[4]).toBe('PORT');
        expect(result[5]).toBe('/solr');
      }
    });
  });

  describe('_createSolrClientConfig()', function() {
    let core = 'vpr';
    let agent = 'agent';

    it('tests that any empty core or clusterState parameter returns undefined', function() {
      expect(SolrSmartClient._createSolrClientConfig(dummyLogger, null, agent, clusterState())).toBeUndefined();
      expect(SolrSmartClient._createSolrClientConfig(dummyLogger, core, agent, null)).toBeUndefined();
      expect(SolrSmartClient._createSolrClientConfig(dummyLogger, core, agent, [])).toBeUndefined();
    });

    it('tests that non-JSON clusterState parameter returns undefined', function() {
      expect(SolrSmartClient._createSolrClientConfig(dummyLogger, null, agent, 'non-JSON-test-string')).toBeUndefined();
    });

    it('tests that clusterState without "vpr" collection returns undefined', function() {
      expect(SolrSmartClient._createSolrClientConfig(dummyLogger, null, agent, clusterStateString({
        core: 'test'
      }))).toBeUndefined();
    });

    it('tests that bad format clusterState parameter returns undefined', function() {
      expect(SolrSmartClient._createSolrClientConfig(dummyLogger, null, agent, badClusterStateString())).toBeUndefined();
    });

    it('tests that first valid configuration is returned', function() {
      expect(SolrSmartClient._createSolrClientConfig(dummyLogger, core, agent, clusterStateString())).toEqual({
        host: 'IP        ',
        port: 'PORT',
        path: '/solr',
        secure: false,
        core: core,
        agent: agent
      });

      expect(SolrSmartClient._createSolrClientConfig(dummyLogger, core, agent, clusterStateString({
        protocol: ''
      }))).toEqual({
        host: 'IP        ',
        port: 'PORT',
        path: '/solr',
        secure: false,
        core: core,
        agent: agent
      });

      expect(SolrSmartClient._createSolrClientConfig(dummyLogger, core, agent, clusterStateString({
        protocol: 'https'
      }))).toEqual({
        host: 'IP        ',
        port: 'PORT',
        path: '/solr',
        secure: true,
        core: core,
        agent: agent
      });
    });
  });
});
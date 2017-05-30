'use strict';

var SolrSmartClient = require('../../solr-smart-client').SolrSmartClient;

describe('solr-smart-client', function() {
  describe('createSolrClientConfig()', function() {
    var core = 'vpr';
    var agent = 'agent';

    it('tests that any empty core liveNodes or parameter returns undefined', function() {
      expect(SolrSmartClient._createSolrClientConfig(null, agent, ['127.0.0.1:8983_solr'])).toBeUndefined();
      expect(SolrSmartClient._createSolrClientConfig(core, agent, null)).toBeUndefined();
      expect(SolrSmartClient._createSolrClientConfig(core, agent, [])).toBeUndefined();
    });

    it('tests that urls with and without protocols are accepted', function() {
      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['127.0.0.1:8983_solr']).length).toBe();
      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['127.0.0.1:8983_']).length).toBe();
      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['http://127.0.0.1:8983_solr']).length).toBe();
      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['http://localhost:8983_solr']).length).toBe();

      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['127.0.0.1:8983/solr']).length).toBe();
      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['127.0.0.1:8983/']).length).toBe();
      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['http://127.0.0.1:8983/solr']).length).toBe();
      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['http://localhost:8983/solr']).length).toBe();
    });

    it('tests that all pieces are in the right place with underscore urls', function() {
      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['127.0.0.1:8983_solr'])).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        secure: false,
        core: core,
        agent: agent
      });

      expect(SolrSmartClient._createSolrClientConfig(core, undefined, ['127.0.0.1:8983_solr'])).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        secure: false,
        core: core,
        agent: undefined
      });

      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['127.0.0.1:8983_'])).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/',
        secure: false,
        core: core,
        agent: agent
      });

      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['http://127.0.0.1:8983_solr'])).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        secure: false,
        core: core,
        agent: agent
      });

      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['https://localhost:8983_solr'])).toEqual({
        host: 'localhost',
        port: '8983',
        path: '/solr',
        secure: true,
        core: core,
        agent: agent
      });
    });

    it('tests that all pieces are in the right place with forward-slash urls', function() {
      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['127.0.0.1:8983/solr'])).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        secure: false,
        core: core,
        agent: agent
      });

      expect(SolrSmartClient._createSolrClientConfig(core, undefined, ['127.0.0.1:8983/solr'])).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        secure: false,
        core: core,
        agent: undefined
      });

      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['127.0.0.1:8983/'])).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/',
        secure: false,
        core: core,
        agent: agent
      });

      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['http://127.0.0.1:8983/solr'])).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        secure: false,
        core: core,
        agent: agent
      });

      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['https://localhost:8983/solr'])).toEqual({
        host: 'localhost',
        port: '8983',
        path: '/solr',
        secure: true,
        core: core,
        agent: agent
      });
    });

    it('tests that first valid configuration is returned', function() {
      expect(SolrSmartClient._createSolrClientConfig(core, agent, [null, '127.0.0.1:8983_solr'])).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        secure: false,
        core: core,
        agent: agent
      });

      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['localhost:8983_solr', '127.0.0.1:8983_solr'])).toEqual({
        host: 'localhost',
        port: '8983',
        path: '/solr',
        secure: false,
        core: core,
        agent: agent
      });

      expect(SolrSmartClient._createSolrClientConfig(core, agent, [null, '127.0.0.1:8983/solr'])).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        secure: false,
        core: core,
        agent: agent
      });

      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['localhost:8983/solr', '127.0.0.1:8983_solr'])).toEqual({
        host: 'localhost',
        port: '8983',
        path: '/solr',
        secure: false,
        core: core,
        agent: agent
      });

      expect(SolrSmartClient._createSolrClientConfig(core, agent, ['localhost:8983_solr', '127.0.0.1:8983/solr'])).toEqual({
        host: 'localhost',
        port: '8983',
        path: '/solr',
        secure: false,
        core: core,
        agent: agent
      });
    });
  });

  describe('copyWithout()', function() {
    var object = {
      host: '127.0.0.1',
      port: '8983',
      path: '/solr',
      secure: false,
      core: 'vpr',
      agent: {}
    };

    it('tests that empty excluded properties returns full clone', function() {
      expect(SolrSmartClient._copyWithout(object)).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        secure: false,
        core: 'vpr',
        agent: {}
      });

      expect(SolrSmartClient._copyWithout(object, null)).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        secure: false,
        core: 'vpr',
        agent: {}
      });

      expect(SolrSmartClient._copyWithout(object, '')).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        secure: false,
        core: 'vpr',
        agent: {}
      });

      expect(SolrSmartClient._copyWithout(object, [])).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        secure: false,
        core: 'vpr',
        agent: {}
      });
    });

    it('tests that string excluded properties returns correct value', function() {
      expect(SolrSmartClient._copyWithout(object, 'agent')).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        secure: false,
        core: 'vpr'
      });

      expect(SolrSmartClient._copyWithout(object, ['agent'])).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        secure: false,
        core: 'vpr'
      });

      expect(SolrSmartClient._copyWithout(object, ['agent', 'secure'])).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        core: 'vpr'
      });

      expect(SolrSmartClient._copyWithout(object, 'non_existent')).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        secure: false,
        core: 'vpr',
        agent: {}
      });

      expect(SolrSmartClient._copyWithout(object, ['non_existent'])).toEqual({
        host: '127.0.0.1',
        port: '8983',
        path: '/solr',
        secure: false,
        core: 'vpr',
        agent: {}
      });
    });
  });
});
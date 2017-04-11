'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var orderables = require('./orderables');

var enterpriseOrderable = require('../../subsystems/orderables/enterprise-orderable-subsystem');


var logger = {
    trace: function() {},
    debug: function() {},
    info: function() {},
    warn: function() {},
    error: function() {},
    fatal: function() {}
};

function noop() {}

function createReqWithParam(map) {
    map = map || {};
    var req = {
        param: (function param(map, name, defaultValue) {
            if (_.has(map, name)) {
                return map[name] !== null ? String(map[name]) : null;
            }

            if (defaultValue !== undefined && defaultValue !== null) {
                String(defaultValue);
            }

            return defaultValue;
        }).bind(null, map),

        query: map,
        logger: logger,
        audit: {},
        app: {
            config: {},
            subsystems: {
                enterpriseOrderable: enterpriseOrderable
            }
        },
        session: {
            user: {
                site: 'vistaSite',
                uid: 'userUid'
            }
        },
        headers: {
            cookie: 'rdk.sid=s%3AvP4rzW1HOPNOhSwN2TItjJMAGywD0H3-.SfY8AeND6wZJJDa28sODUc2V1EJsvJ74DLb874sbU%2FQ'

        }
    };
    return req;
}


function getMockPickListResponse() {
    //NOTE: doing this as a function as if we use a variable, any changes to it in processing
    //will actually edit this and cause trouble with sequential tests, etc.
    return {
       'data':[
          {
             'ien':'1255',
             'synonym':'BB CBC-TEST',
             'name':'BB CBC-TEST',
             'typeOfOrderable':'lab'
          },
          {
             'ien':'210',
             'synonym':'CBC',
             'name':'CBC',
             'typeOfOrderable':'lab'
          },
          {
             'active':true,
             'createdBy':'urn:va:user:9E7A:10000000270',
             'data':{
                'activity':{
                   'deploymentId':'VistaCore:Order',
                   'processDefinitionId':'Order:Consult'
                },
                'codes':[
                   {
                      'code':'2601-3',
                      'display':'Magnesium [Moles/volume] in Serum or Plasma',
                      'system':'urn:oid:2.16.840.1.113883.6.1'
                   }
                ],
                'prerequisites':{
                   'cdsIntent':'name on a cds intent to be executed',
                   'questions':[
                      'Q1',
                      'Q2'
                   ]
                }
             },
             'domain':'ehmp-activity',
             'facility-enterprise':'',
             'name':'Physical Therapy Consult CBC',
             'state':'active',
             'subDomain':'consult',
             'timestamp':'2016-03-10T22:13:23.105Z',
             'type':'ehmp-enterprise-orderable',
             'uid':'urn:va:entordrbls:2',
             'typeOfOrderable':'entr'
          }
       ],
       'totalItems':3,
       'status':200
    };
}

describe('orderables', function() {
    var responseBody;
    var req;
    var res = {
        status: function() {
            return {
                rdkSend: function(body) {
                    responseBody = body;
                },
                send: noop
            };
        }
    };

    describe('GET getOrderables', function() {

        beforeEach(function() {
            req = createReqWithParam();

            sinon.spy(res, 'status');
            sinon.stub(rdk.utils.http, 'get', function(options, callback) {
                return callback(null, null, getMockPickListResponse());
            });

        });

        it('responds HTTP OK for a general request', function() {
            var req = createReqWithParam({});
            orderables.getOrderables(req, res);
            expect(res.status.calledWith(rdk.httpstatus.ok)).to.be.true();
        });

        it('responds HTTP OK for a search string request', function() {
            var req = createReqWithParam({
                searchString: 'CBC'
            });
            orderables.getOrderables(req, res);
            expect(res.status.calledWith(rdk.httpstatus.ok)).to.be.true();
        });

        it('finds the appropriate number of results.', function() {
            var req = createReqWithParam({
                searchString: 'CBC'
            });
            orderables.getOrderables(req, res);
            expect(responseBody.length).to.equal(3);
        });

        it('parses a laboratory orderable correctly.', function() {
            var req = createReqWithParam({
                searchString: 'CBC'
            });
            orderables.getOrderables(req, res);

            expect(responseBody[0].uid).to.equal('1255');
            expect(responseBody[0].type).to.equal('vista-orderable');
            expect(responseBody[0].domain).to.equal('ehmp-order');
            expect(responseBody[0].subDomain).to.equal('laboratory');
            expect(responseBody[0]['facility-enterprise']).to.equal('vistaSite');
            expect(responseBody[0].state).to.equal('active');
            expect(responseBody[0].name).to.equal('BB CBC-TEST');

        });

        it('parses a consult (enterprise) orderable correctly.', function() {
            var req = createReqWithParam({
                searchString: 'CBC'
            });
            orderables.getOrderables(req, res);

            expect(responseBody[2].uid).to.equal('urn:va:entordrbls:2');
            expect(responseBody[2].active).to.equal(true);
            expect(responseBody[2].domain).to.equal('ehmp-activity');
            expect(responseBody[2].subDomain).to.equal('consult');
            expect(responseBody[2]['facility-enterprise']).to.equal('');
            expect(responseBody[2].type).to.equal('ehmp-enterprise-orderable');

        });
    });

});



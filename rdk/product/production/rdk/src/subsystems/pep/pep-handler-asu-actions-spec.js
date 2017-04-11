'use strict';

var rdk = require('../../core/rdk');
var httpMocks = require('node-mocks-http');
var handler = require('./pep-handler-asu-actions');
var asuProcess = require('../../subsystems/asu/asu-process');

describe('When pep handler asu actions is called', function() {
    var req;
    var mock;
    var callback;
    var res;
    var puUid = 'urn:va:user:9E7A:10000000270';
    var puName = 'USER,PANORAMA';
    var site = '9E7A';
    var puDuz = {
        '9E7A': '10000000270'
    };

    var defaultVistaClass = [
        {
          role: 'USER',
          uid: 'urn:va:asu-class:9E7A:561'
        }
    ];

    beforeEach(function(done) {
        req = {};
        req._resourceConfigItem = {};
        req._resourceConfigItem.requiredASUActions = ['VIEW','SIGNATURE','CHANGE TITLE','EDIT RECORD'];
        req._resourceConfigItem.isPatientCentric = false;
        req.logger = sinon.stub(require('bunyan').createLogger(
            {name: 'pep-handler-asu-actions-spec.js'}
        ));
        req.session = {};
        req.session.user = {
            uid: puUid,
            label: 'Read Access',
            site: site,
            duz: puDuz,
            vistaUserClass: defaultVistaClass
        };
        req.body = {};
        //callback = sinon.spy(next);
        callback = sinon.spy();
        res = httpMocks.createResponse();

        done();
    });

    afterEach(function(done) {
        if (mock) {
            asuProcess.getAsuPermissionForActionNames.restore();
            mock = undefined;
        }
        callback.reset();
        done();
    });

    it('returns true when all permission checks pass', function(done) {
        mock = sinon.stub(asuProcess, 'getAsuPermissionForActionNames', function (req, dataItems, acallback) {
            var result = [
            {
                'actionName' : 'VIEW',
                'hasPermission' : true
            },
            {
                'actionName' : 'SIGNATURE',
                'hasPermission' : true
            },
            {
                'actionName' : 'CHANGE TITLE',
                'hasPermission' : true
            },
            {
                'actionName' : 'EDIT RECORD',
                'hasPermission' : true
            }
            ];
            return acallback(null, result);
        });
        req.body = {
            author: puName,
            authorUid:puUid,
            documentClass:'PROGRESS NOTES',
            documentDefUid:'urn:va:doc-def:9E7A:20',
            localTitle:'CRISIS NOTE',
            status:'UNSIGNED',
        };
        handler(req, res, callback);
        expect(callback.calledWith(null, 'asu success')).to.be.true();
        expect(mock.callCount).to.be(1);
        done();
    });

    it('returns false when any ASU permission check fails', function(done) {
        mock = sinon.stub(asuProcess, 'getAsuPermissionForActionNames', function (req, dataItems, acallback) {
            var result = [
            {
                'actionName' : 'VIEW',
                'hasPermission' : true
            },
            {
                'actionName' : 'SIGNATURE',
                'hasPermission' : true
            },
            {
                'actionName' : 'CHANGE TITLE',
                'hasPermission' : false
            },
            {
                'actionName' : 'EDIT RECORD',
                'hasPermission' : true
            }
            ];
            return acallback(null, result);
        });
        req.body = {
            author: puName,
            authorUid:puUid,
            documentClass:'PROGRESS NOTES',
            documentDefUid:'urn:va:doc-def:9E7A:20',
            documentTypeName:'Crisis Note',
            kind:'Crisis Note',
            localTitle:'CRISIS NOTE',
            status:'UNSIGNED',
        };
        handler(req,res,callback);
        var msg = 'UNAUTHORIZED - User lacks ASU permissions for this resource.';
        var err = {message: msg, code: rdk.httpstatus.unauthorized};
        //expect(callback.calledWith(null, 'asu success')).to.be.false();
        expect(callback.calledWith(err, null)).to.be.true();
        expect(callback.callCount).to.be(1);
        done();
    });

});

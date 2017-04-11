'use strict';
var httpStatus = require('../../core/httpstatus.js');
var destroySession = require('./destroy-session.js');


describe('User Session', function() {

    it('internal_server_error if none found', function(done){
        var req = {
            session: {
                destroy: function(cb){
                    cb();
                }
            },
            logger: {
                info: function(){},
                debug: function(){}
            }
        };
        var res = {
            status: function(status) {
                res.status = status;
                return this;
            },
            rdkSend: function(){
                expect(res.status).to.be.equal(httpStatus.internal_server_error);
                done();
            }
        };

        destroySession(req, res);
    });

    it('destroyed if user found', function(done){
        var req = {
            session: {
                destroy: function(cb){
                    cb();
                },
                user: {}
            },
            logger: {
                info: function(){},
                debug: function(){}
            }
        };
        var res = {
            status: function(status) {
                res.status = status;
                return this;
            },
            rdkSend: function(){
                expect(res.status).to.be.equal(httpStatus.ok);
                done();
            }
        };

        destroySession(req, res);
    });
});

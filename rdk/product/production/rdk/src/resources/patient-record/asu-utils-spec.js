'use strict';


var asu_utils = require('./asu-utils');
var _ = require('lodash');

//jshint -W031
describe('Verify Document', function () {
    var item;
    var errorMessage = 'Item missing Required Information';
    beforeEach(function (done) {
        item = {};

        done();
    });
    it('constructor: no asu permissions required', function () {
        _.set(item, 'test1', 'test2');
        var test_doc = new asu_utils._Document(item);
        expect(test_doc.response).to.be(item);
        expect(test_doc.asuRequest).to.not.be.undefined();
    });

    it('constructor: required asu permissions', function () {
        _.set(item, 'documentDefUid', 'value');
        _.set(item, 'status', 'value');
        var test_doc = new asu_utils._Document(item);
        expect(test_doc.response).to.be(item);
        expect(test_doc.asuRequest).to.not.be.undefined();
    });

    it('constructor: missing information for asu permissions', function () {
        _.set(item, 'documentDefUid', 'value');
        expect(function () {
            new asu_utils._Document(item);
        }).to.throw(errorMessage);
    });

    it('throws error if created with null', function () {
        item = null;
        expect(function () {
            new asu_utils._Document(item);
        }).to.throw(errorMessage);
    });
});

describe('Document.needsPermissions', function () {
    var item;

    beforeEach(function (done) {
        item = {};

        done();
    });

    it('returns true if item has documentDefUid', function () {
        _.set(item, 'documentDefUid', 'test_uid');
        _.set(item, 'status', 'value');
        var test_doc = new asu_utils._Document(item);
        expect(test_doc.needsPermissions()).to.be.true();
    });

    it('returns false if item has null documentDefUid', function () {
        _.set(item, 'documentDefUid', null);
        var test_doc = new asu_utils._Document(item);
        expect(test_doc.needsPermissions()).to.be.false();
    });

    it('returns false if item does not have documentDefUid', function () {
        _.set(item, 'other', 'test_uid');
        var test_doc = new asu_utils._Document(item);
        expect(test_doc.needsPermissions()).to.be.false();
    });

});

describe('Document.setDocDefUid', function () {
    var item;

    beforeEach(function (done) {
        item = {};

        done();
    });

    it('is set correctly', function () {
        _.set(item, 'documentDefUid', 'valid uid');
        _.set(item, 'status', 'value');
        var test_doc = new asu_utils._Document(item);
        test_doc.setDocDefUid();
        expect(test_doc.asuRequest.docDefUid).to.be('valid uid');
    });
});

describe('Document.setDocStatus', function () {
    var item;

    beforeEach(function (done) {
        item = {};

        done();
    });

    it('', function () {
        _.set(item, 'status', null);
        var test_doc = new asu_utils._Document(item);
        test_doc.setDocStatus();
        expect(test_doc.asuRequest.docStatus).to.be(null);
    });

    it('', function () {
        _.set(item, 'status', 'valid status');
        var test_doc = new asu_utils._Document(item);
        test_doc.setDocStatus();
        expect(test_doc.asuRequest.docStatus).to.be('valid status');
    });
});

describe('Document.extractRolesFromText', function () {
    var currentUser;
    var item;

    beforeEach(function (done) {
        item = {
            cannot: 'be empty'
        };
        currentUser = {};

        done();
    });
    it('returns empty array', function () {
        var test_doc = new asu_utils._Document(item);
        var test_response = test_doc._extractRolesFromText(currentUser);
        expect(test_response).to.not.be.undefined();
        expect(test_response.length).to.be(0);
    });

    it('returns role AUTHOR/DICTATOR when authorUid is the current user', function () {
        _.set(currentUser, 'testuser', 'testuser');
        _.set(item, 'authorUid', currentUser);
        var test_doc = new asu_utils._Document(item);
        var test_response = test_doc._extractRolesFromText(currentUser);

        expect(test_response).to.not.be.undefined();
        expect(test_response.length).to.be(1);
        expect(test_response[0]).to.be('AUTHOR/DICTATOR');
    });

    it('does not return role AUTHOR/DICTATOR when authorUid is a different user', function () {
        _.set(currentUser, 'testuser', 'testuser');
        _.set(item, 'authorUid', 'not current user');
        var test_doc = new asu_utils._Document(item);
        var test_response = test_doc._extractRolesFromText(currentUser);

        expect(test_response).to.not.be.undefined();
        expect(test_response.length).to.be(0);
    });

    it('returns role SIGNER when signerUid is the current user', function () {
        _.set(currentUser, 'testuser', 'testuser');
        _.set(item, 'signerUid', currentUser);
        var test_doc = new asu_utils._Document(item);
        var test_response = test_doc._extractRolesFromText(currentUser);

        expect(test_response).to.not.be.undefined();
        expect(test_response.length).to.be(1);
        expect(test_response[0]).to.be('SIGNER');
    });

    it('does not return role SIGNER when signerUid is a different user', function () {
        _.set(currentUser, 'testuser', 'testuser');
        _.set(item, 'signerUid', 'not current user');
        var test_doc = new asu_utils._Document(item);
        var test_response = test_doc._extractRolesFromText(currentUser);

        expect(test_response).to.not.be.undefined();
        expect(test_response.length).to.be(0);
    });

    it('returns role COSIGNER when cosignerUid is the current user', function () {
        _.set(currentUser, 'testuser', 'testuser');
        _.set(item, 'cosignerUid', currentUser);
        var test_doc = new asu_utils._Document(item);
        var test_response = test_doc._extractRolesFromText(currentUser);

        expect(test_response).to.not.be.undefined();
        expect(test_response.length).to.be(1);
        expect(test_response[0]).to.be('COSIGNER');
    });

    it('does not return role COSIGNER when cosignerUid is a different user', function () {
        _.set(currentUser, 'testuser', 'testuser');
        _.set(item, 'cosignerUid', 'not current user');
        var test_doc = new asu_utils._Document(item);
        var test_response = test_doc._extractRolesFromText(currentUser);

        expect(test_response).to.not.be.undefined();
        expect(test_response.length).to.be(0);
    });

    it('returns role ATTENDING PHYSICIAN when attendingUid is the current user', function () {
        _.set(currentUser, 'testuser', 'testuser');
        _.set(item, 'attendingUid', currentUser);
        var test_doc = new asu_utils._Document(item);
        var test_response = test_doc._extractRolesFromText(currentUser);

        expect(test_response).to.not.be.undefined();
        expect(test_response.length).to.be(1);
        expect(test_response[0]).to.be('ATTENDING PHYSICIAN');
    });

    it('does not return role ATTENDING PHYSICIAN when attendingUid is a different user', function () {
        _.set(currentUser, 'testuser', 'testuser');
        _.set(item, 'attendingUid', 'not current user');
        var test_doc = new asu_utils._Document(item);
        var test_response = test_doc._extractRolesFromText(currentUser);

        expect(test_response).to.not.be.undefined();
        expect(test_response.length).to.be(0);
    });

    it('returns all possible roles when expected', function () {
        _.set(currentUser, 'testuser', 'testuser');
        _.set(item, 'attendingUid', currentUser);
        _.set(item, 'cosignerUid', currentUser);
        _.set(item, 'signerUid', currentUser);
        _.set(item, 'authorUid', currentUser);
        var test_doc = new asu_utils._Document(item);
        var test_response = test_doc._extractRolesFromText(currentUser);

        expect(test_response).to.not.be.undefined();
        expect(test_response).to.contain('ATTENDING PHYSICIAN');
        expect(test_response).to.contain('COSIGNER');
        expect(test_response).to.contain('SIGNER');
        expect(test_response).to.contain('AUTHOR/DICTATOR');
    });
});


describe('Document.setExtractRoles', function () {
    var currentUser;
    var item;


    beforeEach(function () {
        currentUser = 'user';
        item = {};
    });

    it('check each role for user with permission', function () {
        _.each(asu_utils.POSSIBLE_ROLES, function checkRole(val, key) {
            var info = {
                clinicians: [{role: key, uid: currentUser}]
            };
            var doc = new asu_utils._Document(info);
            doc.setExtractRoles(currentUser);
            expect(doc.asuRequest.roleNames.length).to.be(1);
            expect(doc.asuRequest.roleNames[0]).to.be(val);
        });
    });

    it('check each role for user without permission', function () {
        _.each(asu_utils.POSSIBLE_ROLES, function checkRole(val, key) {
            var info = {
                clinicians: [{role: key, uid: 'invalid'}]
            };
            var doc = new asu_utils._Document(info);
            doc.setExtractRoles(currentUser);
            expect(doc.asuRequest.roleNames.length).to.be(0);
        });
    });

    it('check adding all roles', function () {
        var values = [];
        item.clinicians = _.map(asu_utils.POSSIBLE_ROLES, function (val, key) {
            values.push(val);
            return {role: key, uid: currentUser};
        });
        values = _.uniq(values);
        var doc = new asu_utils._Document(item);
        doc.setExtractRoles(currentUser);

        _.each(values, function checkRole(val) {
            expect(doc.asuRequest.roleNames).to.contain(val);
        });
    });

});

describe('Document.redactDocument', function () {
    var item;
    var req;
    var approved;
    var regEx = /\(Retracted\)/g;
    beforeEach(function (done) {
        item = {
            summary: 'summary',
            localTitle: 'localTitle',
            text: 'text',
            stub: 'stub'
        };
        req = {session: {user: {vistaClass: []}}};
        approved = [];
        done();
    });

    it('Do not alter Document', function () {
        _.set(item, 'status', 'good');
        var doc = new asu_utils._Document(item);
        doc.redactDocument(req, approved);
        _.each(item, function (val, key) {
            expect(doc.response[key]).to.be(val);
        });
    });

    it('Redact not as chief', function () {
        _.set(item, 'status', 'RETRACTED');
        var doc = new asu_utils._Document(item);
        doc.redactDocument(req, approved);
        var response = doc.response;
        expect(response.summary.match(regEx)).to.not.be.null();
        expect(response.localTitle.match(regEx)).to.not.be.null();
        expect(_.isArray(response.text)).to.be.true();
        expect(_.isArray(response.activity)).to.be.true();
        expect(_.isArray(response.results)).to.be.true();
        expect(response.stub).to.be('true');
        expect(approved).to.contain('VIEW');
    });

    it('Redact as chief', function () {
        _.set(item, 'status', 'RETRACTED');
        req.session.user.vistaClass.push({role: 'CHIEF, MIS'});
        var doc = new asu_utils._Document(item);
        doc.redactDocument(req, approved);
        var response = doc.response;
        expect(response.summary.match(regEx)).to.not.be.null();
        expect(response.localTitle.match(regEx)).to.not.be.null();
        expect(response.text).to.be(item.text);
        expect(response.stub).to.be(item.stub);
        expect(approved).to.contain('VIEW');
    });
});

describe('asu-util wrapping functions', function () {
    it('_getUsers returns object', function () {
        var item = {data: {items: 'value'}};
        var str = JSON.stringify(item);
        var result = asu_utils._getUsers(str);
        expect(result).to.be(item.data.items);
    });

    it('_getUsers returns error', function () {
        var invalid = 'invalid';
        var result = asu_utils._getUsers(invalid);
        expect(result instanceof Error).to.be.true();
    });

    it('_createDocument returns Document', function () {
        var item = {not: 'empty'};
        var result = asu_utils._createDocument(item);
        expect(result instanceof asu_utils._Document).to.be.true();
    });

    it('_createDocument returns error', function () {
        var result = asu_utils._createDocument(null);
        expect(result instanceof Error).to.be.true();
    });

    it('_createDocument returns _DocumentList', function () {
        var items = ['value'];
        var defaultUser = 'user';
        var result = asu_utils._createDocumentList(items, defaultUser);
        expect(result instanceof asu_utils.DocumentList).to.be.true();
    });

    it('_createDocument returns error', function () {
        var result = asu_utils._createDocumentList();
        expect(result instanceof Error).to.be.true();
    });
});

describe('Document.formatAddendum', function () {
    it('overwrites the no addemenum fields', function () {
        var item = {
            noteType: 'ADDENDUM',
            addendumBody: 'text',
            text: [
                {content: 'words'},
                {contentPreview: 'words'}
            ]
        };
        var document = asu_utils._createDocument(item);

        document.formatAddendum();
        expect(item.addendumBody).to.equal(asu_utils.NO_PERMISSION_FOR_ADDENDUM);
        expect(item.text[0].content).to.equal(asu_utils.NO_PERMISSION_FOR_ADDENDUM);
        expect(item.text[1].content).to.equal(asu_utils.NO_PERMISSION_FOR_ADDENDUM);
        expect(item.text[1].contentPreview).to.equal(asu_utils.NO_PERMISSION_FOR_ADDENDUM);
    });
});


describe('Document.setUserClassUids', function () {

    it('checks the ids get set', function () {
        var item = {
            status: 'valid status',
            documentDefUid: 'urn:va:doc-def:C877:111'
        };
        var userClasses = [
            {'uid':'urn:va:user:9E7A:10000000270'},
            {'uid':'urn:va:asu-class:C877:561'},
            {'uid': 'bad:id'}
        ];
        var userDetails = {
            vistaUserClass: [{'uid':'urn:va:user:9E7A:10000000270'}]
        };

        var document = asu_utils._createDocument(item);
        document.asuRequest.userClassUids = [];
        document.setUserClassUids(userClasses, userDetails);

        var check = document.asuRequest.userClassUids;

        expect(check.length).to.be(1);
        expect(check[0]).to.equal(userClasses[1].uid);
    });
});

describe('Document.setActionNames', function () {
    it('asuRequest.actionsNames contains value', function () {
        var document = asu_utils._createDocument({not: 'empty'});
        var input = ['this', 'is', 'a', 'test'];
        var output;

        document.setActionNames(input);
        output = document.asuRequest.actionNames;
        expect(input).to.equal(output);
    });
});

describe('DocumentList.constructors', function () {
    it('throws error when there are no arguments', function () {
        function errorCheck() {
            new asu_utils.DocumentList();
        }

        expect(errorCheck).to.throw(Error);
    });

    it('throws error when missing defaultUser', function () {
        function errorCheck() {
            var items = ['not', 'empty'];
            new asu_utils.DocumentList(items);
        }

        expect(errorCheck).to.throw(Error);
    });

    it('succeeds when items and defaultUser are passed to it', function () {
        var items = ['not', 'empty'];
        var defaultUser = ['me'];
        var docList = new asu_utils.DocumentList(items, defaultUser);

        expect(docList._jdsDocuments).to.eql(items);
        expect(docList.userClasses).to.eql(defaultUser);
        expect(docList.isAccessDocument).to.be.true();
    });

    it('succeeds when all possible params are passed to it', function () {
        var items = ['not', 'empty'];
        var defaultUser = ['me'];
        var requiredPermissions = ['VIEW'];
        var allPermissions = 'VIEW';
        var docList = new asu_utils.DocumentList(items, defaultUser, requiredPermissions, allPermissions);

        expect(docList._jdsDocuments).to.eql(items);
        expect(docList.userClasses).to.eql(defaultUser);
        expect(docList.isAccessDocument).to.be.false();
    });
});

describe('DocumentList.filterPermission', function () {
    var sites = {};
    var user = {
        clinicians: [{role: 'something', uid: 'user'}]
    };
    var defaultUser = ['me'];

    _.set(sites, 'app.config.vistaSites', 'does not matter');
    _.set(sites, 'logger.debug', _.noop);

    Object.freeze(sites);
    Object.freeze(user);
    Object.freeze(defaultUser);

    it('has no documents filtered because permission not required', function () {
        var documents = [_.extend({any: 'value'}, user), _.extend({any: 'otherValue'}, user)];
        var docList = new asu_utils.DocumentList(documents, defaultUser);
        var spy = sinon.spy(asu_utils._Document.prototype, 'needsPermissions');

        docList.filterPermission(sites);

        expect(docList._asuRequest).to.be.empty();

        // The once for each _Document it creates, and once for each document it filters;
        expect(spy.callCount).to.be(4);
        expect(spy.alwaysReturned(false)).to.be.true();
    });

    it('userDetails does not have duz key', function(){
        var requiredInfo = {
            documentDefUid: 'id',
            status: 'status',
            userdetails: {
                site: 'key'
            }
        };
        var documents = [
            _.extend(requiredInfo, user),
            _.extend({any: 'otherValue'}, user)
        ];
        var docList = new asu_utils.DocumentList(documents, defaultUser);

        sinon.stub(asu_utils._Document.prototype, 'setUserClassUids', _.noop);
        docList.filterPermission(sites);

        expect(docList._asuRequest).have.length(0);
    });

    it('has one document that should be added to filter list', function () {
        var requiredInfo = {
            documentDefUid: 'id',
            status: 'status',
            userdetails: {
                site: 'key',
                duz: {
                    key: 'user'
                }
            }
        };
        var documents = [
            _.extend(requiredInfo, user),
            _.extend({any: 'otherValue'}, user)
        ];
        var docList = new asu_utils.DocumentList(documents, defaultUser);

        sinon.stub(asu_utils._Document.prototype, 'setUserClassUids', _.noop);
        docList.filterPermission(sites);

        expect(docList._asuRequest).have.length(1);
        expect(docList._asuRequest[0]).have.ownProperties({docDefUid: 'id', docStatus: 'status'});
    });


    it('ignores all documents because of missing information', function () {
        var spy = sinon.spy(asu_utils._Document.prototype, 'needsPermissions');
        var documents = [_.extend({documentDefUid: 'value'}, user), _.extend({documentDefUid: 'otherValue'}, user)];
        var docList = new asu_utils.DocumentList(documents, defaultUser);

        docList.filterPermission(sites);

        expect(spy.callCount).to.be(2);
    });
});

describe('DocumentList._asuCallback', function () {
    var user = {
        clinicians: [{role: 'something', uid: 'user'}]
    };
    var defaultUser = ['me'];

    it('will return all documents because asu filters are not needed', function (done) {
        var documents = [_.extend({any: 'value'}, user), _.extend({any: 'otherValue'}, user)];
        var docList = new asu_utils.DocumentList(documents, defaultUser);

        function callback(error, response) {
            expect(response.length).to.be(2);
            expect(response[0]).to.have.ownProperty('any', 'value');
            expect(response[1]).to.have.ownProperty('any', 'otherValue');

            done();
        }

        docList._asuCallback(undefined, [], callback);
    });

    it('will return a documents because asu filters removed the other', function (done) {
        var requiredInfo = {
            documentDefUid: 'id',
            status: 'status',
            userdetails: {
                site: 'key',
                duz: {
                    key: 'user'
                }
            }
        };
        var documents = [
            _.extend({id: 1}, requiredInfo, user),
            _.extend({id: 2}, requiredInfo, user)
        ];

        var mockResponse = [
            [{hasPermission: true, actionName: 'AN'}],
            [{hasPermission: false, actionName: 'AN'}]
        ];
        var docList = new asu_utils.DocumentList(documents, defaultUser, 'AN', 'AN');

        function callback(error, response) {
            console.log(response);
            expect(response.length).to.be(1);
            expect(response[0]).to.have.ownProperty('id', 1);

            done();
        }

        sinon.stub(asu_utils._Document.prototype, 'formatAddendum', _.noop);
        sinon.stub(asu_utils._Document.prototype, 'redactDocument', _.noop);

        docList._asuCallback(undefined, mockResponse, callback);

    });

    it('will ignore documents because they are invalid', function (done) {
        var spy = sinon.spy(asu_utils._Document.prototype, 'needsPermissions');
        var documents = [_.extend({documentDefUid: 'value'}, user), _.extend({documentDefUid: 'otherValue'}, user)];
        var docList = new asu_utils.DocumentList(documents, defaultUser);

        function callback(error, response){
            expect(response).to.be.empty();

            // If more than two it made it into the inner function
            expect(spy.callCount).to.be(2);

            done();
        }


        docList._asuCallback(undefined, [], callback);
    });
});

describe('DocumentList._asuCallbackAccess', function () {
    var user = {
        clinicians: [{role: 'something', uid: 'user'}]
    };
    var defaultUser = ['me'];

    it('will return all documents because asu filters are not needed', function (done) {
        var documents = [_.extend({any: 'value'}, user), _.extend({any: 'otherValue'}, user)];
        var docList = new asu_utils.DocumentList(documents, defaultUser);

        function callback(error, response) {
            expect(response.length).to.be(2);
            expect(response[0]).to.have.ownProperty('any', 'value');
            expect(response[1]).to.have.ownProperty('any', 'otherValue');

            done();
        }

        docList._asuCallbackAccess([], callback);
    });

    it('will return a documents because asu filters removed the other', function (done) {
        var requiredInfo = {
            documentDefUid: 'id',
            status: 'status',
            userdetails: {
                site: 'key',
                duz: {
                    key: 'user'
                }
            }
        };
        var documents = [
            _.extend({id: 1}, requiredInfo, user),
            _.extend({id: 2}, requiredInfo, user)
        ];

        var docList = new asu_utils.DocumentList(documents, defaultUser, 'AN', 'AN');

        function callback(error, response) {
            console.log(response);
            expect(response.length).to.be(1);
            expect(response[0]).to.have.ownProperty('id', 1);

            done();
        }

        sinon.stub(asu_utils._Document.prototype, 'formatAddendum', _.noop);
        sinon.stub(asu_utils._Document.prototype, 'redactDocument', _.noop);

        docList._asuCallbackAccess([true, false], callback);

    });

    it('will ignore documents because they are invalid', function (done) {
        var spy = sinon.spy(asu_utils._Document.prototype, 'needsPermissions');
        var documents = [_.extend({documentDefUid: 'value'}, user), _.extend({documentDefUid: 'otherValue'}, user)];
        var docList = new asu_utils.DocumentList(documents, defaultUser);

        function callback(error, response){
            expect(response).to.be.empty();

            // If more than two it made it into the inner function
            expect(spy.callCount).to.be(2);

            done();
        }


        docList._asuCallbackAccess([], callback);
    });
});

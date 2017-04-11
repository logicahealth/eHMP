var _ = require('lodash');

var adjustTreatmentFactor = require('./utils').adjustTreatmentFactor;
var handleIncomingComments = require('./utils').handleIncomingComments;
var handleOriginalComments = require('./utils').handleOriginalComments;
var getVistaFormattedDateString = require('./utils')._getVistaFormattedDateString;

describe('Problem write back utilities', function() {
    var logger;
    beforeEach(function () {
        logger = sinon.stub(require('bunyan').createLogger({name: 'problems-uitl-writer'}));
    });
    var originalCommentIndeces;

    describe('transform treatment factor', function () {
        it('tests for no explicit and implicit values', function () {

            expect(adjustTreatmentFactor(undefined)).to.be.eql('0^NO');
            expect(adjustTreatmentFactor('0')).to.be.eql('0^NO');
            expect(adjustTreatmentFactor('No')).to.be.eql('0^NO');
            expect(adjustTreatmentFactor('NO')).to.be.eql('0^NO');
        });

        it('tests for yes explicit and implicit values', function () {
            expect(adjustTreatmentFactor('1')).to.be.eql('1^YES');
            expect(adjustTreatmentFactor('Yes')).to.be.eql('1^YES');
            expect(adjustTreatmentFactor('YES')).to.be.eql('1^YES');
            expect(adjustTreatmentFactor('something')).to.be.eql('1^YES');
        });
    });

    describe('comments management', function() {

        it('handle original comments with bad input', function () {

            var index = handleOriginalComments(logger);
            expect(index).to.be.equal(0);

            var params = {};
            var userIEN = undefined;
            var username = undefined;
            index = 0;
            index = handleOriginalComments(logger, originalCommentIndeces, null, userIEN, username, params, index);
            expect(index).to.be.equal(1);
        });

        it('handle original comments with good input', function () {
            var index = 0;
            var username = 'user';
            var params = {};
            index = handleOriginalComments(logger, originalCommentIndeces, null, undefined, username, params, index);
            var arr = _.values(params);
            expect(index).to.be.equal(1);
            expect(arr[0]).to.be.equal('GMPORIG(10,0)="0^"');

            index = 0;
            params = {};
            var originalComments = ['comment one', 'comment two'];
            var userIEN = 32;
            var originalCommentIndeces = [1,2];
            index = handleOriginalComments(logger, originalCommentIndeces, originalComments, userIEN, username, params, index);
            expect(index).to.be.equal(3);
            arr = _.values(params);
            expect(arr[0]).to.be.equal('GMPORIG(10,0)="2^"');
            expect(arr[1].indexOf('1^1^comment one^A') > 0).to.be.truthy();
            expect(arr[2].indexOf('2^1^comment two^A') > 0).to.be.truthy();
        });

        it('handle original comments with good input version 2', function () {
            var index = 0;
            var username = 'user';
            var params = {};

            var originalComments = ['testing 1','testing 3','peach'];
            var userIEN = 32;
            var originalCommentIndeces = [1,2,3];
            index = handleOriginalComments(logger, originalCommentIndeces, originalComments, userIEN, username, params, index);

            arr = _.values(params);

            expect(index).to.be.equal(originalComments.length + 1);
            expect(arr[0]).to.be.equal('GMPORIG(10,0)="3^"');
            expect(arr[1].indexOf('1^1^testing 1^A') > 0).to.be.truthy();
            expect(arr[2].indexOf('2^1^testing 3^A') > 0).to.be.truthy();
            expect(arr[3].indexOf('3^1^peach^A') > 0).to.be.truthy();
        });



        it('handle incoming comments with bad input', function () {
            var index = undefined;
            var params = undefined;
            var incomingComments = undefined;
            var originalComments = undefined;
            var userIEN = undefined;

            index = handleIncomingComments(logger, originalCommentIndeces, incomingComments, originalComments, userIEN, params, index);
            expect(index).to.be.equal(0);
        });

        it('handle incoming comments with existing comments less than modified ones', function () {
            var index = 0;
            var params = {};
            var originalComments = ['comment one', 'comment two'];
            var incomingComments = ['comment two'];
            var userIEN = 32;
            index = handleIncomingComments(logger, originalCommentIndeces, incomingComments, originalComments,
                userIEN, params, index);
            expect(index).to.be.equal(1);
            arr = _.values(params);
            expect(arr[0]).to.be.equal('GMPFLD(10,0)="0"');
        });

        it('handle incoming comments with no comments at all', function () {
            var index = 0;
            var params = {};
            var incomingComments = undefined;
            var originalComments = undefined;
            var userIEN = undefined;

            index = handleIncomingComments(logger, originalCommentIndeces, incomingComments, originalComments, userIEN, params, index);
            var arr = _.values(params);
            expect(index).to.be.equal(1);
            expect(arr.length).to.be.equal(1);
            expect(arr[0]).to.be.equal('GMPFLD(10,0)="0"');
        });

        it('handle incoming comments with just new comments', function () {
            var index = 0;
            var params = {};
            var incomingComments = ['comment one', 'comment two'];
            var userIEN = 32;
            index = handleIncomingComments(logger, originalCommentIndeces, incomingComments, [], userIEN, params, index);
            expect(index).to.be.equal(3);
            arr = _.values(params);
            expect(arr[0]).to.be.equal('GMPFLD(10,"NEW",1)="comment one"');
            expect(arr[1]).to.be.equal('GMPFLD(10,"NEW",2)="comment two"');
            expect(arr[2]).to.be.equal('GMPFLD(10,0)="2"');
        });

        it('handle incoming comments with just one original comment deleted', function () {
            var index = 0;
            var params = {};
            var incomingComments = ['comment one', '', 'comment three'];
            var originalComments = ['comment one', 'comment two', 'comment three'];
            var originalCommentIndeces = [1,2,3];
            var userIEN = 32;
            index = handleIncomingComments(logger, originalCommentIndeces, incomingComments,
                originalComments, userIEN, params, index);
            expect(index).to.be.equal(4);
            arr = _.values(params);

            expect(arr[0].indexOf('GMPFLD(10,1)=')).to.be.equal(0);
            expect(arr[0].indexOf('1^1') > 0).to.be.truthy();
            expect(arr[0].indexOf('comment one') > 0).to.be.truthy();

            expect(arr[1].indexOf('GMPFLD(10,2)=')).to.be.equal(0);
            expect(arr[1].indexOf('2^1') > 0).to.be.truthy();
            expect(arr[1].indexOf('comment two')).to.be.equal(-1);

            expect(arr[2].indexOf('GMPFLD(10,3)=')).to.be.equal(0);
            expect(arr[2].indexOf('3^1') > 0).to.be.truthy();
            expect(arr[2].indexOf('comment three') > 0).to.be.truthy();

            expect(arr[3]).to.be.equal('GMPFLD(10,0)="3"');
        });

        it('handle incoming comments with just one original comment modified', function () {
            var index = 0;
            var params = {};
            var incomingComments = ['comment one', 'comment two modified', 'comment three'];
            var originalComments = ['comment one', 'comment two', 'comment three'];
            var originalCommentIndeces = [1,2,3];
            var userIEN = 32;
            index = handleIncomingComments(logger, originalCommentIndeces, incomingComments,
                originalComments, userIEN, params, index);
            expect(index).to.be.equal(4);
            arr = _.values(params);

            // the following strangeness is due to the fact(bug) in indexOf routine, if
            // there is a " embedded in the string, indexOf always returns a -1.
            // thus the need to break things up to check the different parts of the strings.
            expect(arr[0].indexOf('GMPFLD(10,1)=')).to.be.equal(0);
            expect(arr[0].indexOf('1^1') > 0).to.be.truthy();
            expect(arr[0].indexOf('comment one') > 0).to.be.truthy();

            expect(arr[1].indexOf('GMPFLD(10,2)=')).to.be.equal(0);
            expect(arr[1].indexOf('2^1') > 0).to.be.truthy();
            expect(arr[1].indexOf('comment two modified')> 0).to.be.truthy();

            expect(arr[2].indexOf('GMPFLD(10,3)=')).to.be.equal(0);
            expect(arr[2].indexOf('3^1') > 0).to.be.truthy();
            expect(arr[2].indexOf('comment three') > 0).to.be.truthy();

            expect(arr[3]).to.be.equal('GMPFLD(10,0)="3"');
        });

        it('handle incoming comments with one deleted from the middele and 2 added at the end', function () {
            var index = 0;
            var params = {};
            var incomingComments = ['comment one', 'comment two', 'comment three'];
            var originalComments = ['comment one', 'comment two'];
            var originalCommentIndeces = [1,2,3];
            var userIEN = 32;
            index = handleIncomingComments(logger, originalCommentIndeces, incomingComments,
                originalComments, userIEN, params, index);
            expect(index).to.be.equal(4);
            arr = _.values(params);

            // the following strangeness is due to the fact(bug) in indexOf routine, if
            // there is a " embedded in the string, indexOf always returns a -1.
            // thus the need to break things up to check the different parts of the strings.
            expect(arr[0].indexOf('GMPFLD(10,1)=')).to.be.equal(0);
            expect(arr[0].indexOf('1^1') > 0).to.be.truthy();
            expect(arr[0].indexOf('comment one') > 0).to.be.truthy();

            expect(arr[1].indexOf('GMPFLD(10,2)=')).to.be.equal(0);
            expect(arr[1].indexOf('2^1') > 0).to.be.truthy();
            expect(arr[1].indexOf('comment two')> 0).to.be.truthy();

            expect(arr[2].indexOf('GMPFLD(10,"NEW",3')).to.be.equal(0);
            expect(arr[2].indexOf('3') > 0).to.be.truthy();
            expect(arr[2].indexOf('comment three') > 0).to.be.truthy();

            expect(arr[3]).to.be.equal('GMPFLD(10,0)="3"');
        });

        it('handle incoming comments with one added at the end', function () {
            var index = 0;
            var params = {};

            var incomingComments = ['testing 12','testing 3233','','another comment','a third comment'];
            var originalComments = ['testing 1','testing 3','peach'];
            var originalCommentIndeces = [1,2,3];

            var userIEN = 32;
            index = handleIncomingComments(logger, originalCommentIndeces, incomingComments,
                originalComments, userIEN, params, index);
            arr = _.values(params);
            expect(index).to.be.equal(6);


            // the following strangeness is due to the fact(bug) in indexOf routine, if
            // there is a " embedded in the string, indexOf always returns a -1.
            // thus the need to break things up to check the different parts of the strings.
            expect(arr[0].indexOf('GMPFLD(10,1)=')).to.be.equal(0);
            expect(arr[0].indexOf('1^1') > 0).to.be.truthy();
            expect(arr[0].indexOf('testing 12') > 0).to.be.truthy();

            expect(arr[1].indexOf('GMPFLD(10,2)=')).to.be.equal(0);
            expect(arr[1].indexOf('2^1') > 0).to.be.truthy();
            expect(arr[1].indexOf('testing 3233')> 0).to.be.truthy();

            expect(arr[2].indexOf('GMPFLD(10,3)=')).to.be.equal(0);
            expect(arr[2].indexOf('3^1^^A') > 0).to.be.truthy();

            expect(arr[3].indexOf('GMPFLD(10,"NEW",4')).to.be.equal(0);
            expect(arr[3].indexOf('another comment') > 0).to.be.truthy();

            expect(arr[4].indexOf('GMPFLD(10,"NEW",5')).to.be.equal(0);
            expect(arr[4].indexOf('a third comment') > 0).to.be.truthy();

            expect(arr[5]).to.be.equal('GMPFLD(10,0)="5"');
        });
    });

    describe('Problems vista formatted date string', function(){
        it('Should handle fuzzy dates properly', function(){
            expect(getVistaFormattedDateString('20150000')).to.eql('3150000');
            expect(getVistaFormattedDateString('20150900')).to.eql('3150900');
        });

        it('Should handle regular dates properly', function(){
            expect(getVistaFormattedDateString('20151018')).to.eql('3151018^10 18 2015');
            expect(getVistaFormattedDateString('201510182359')).to.eql('3151018^10 18 2015');
        });
    });
});
define(['jquery', 'backbone', 'marionette', 'jasminejquery', 'app/applets/task_forms/activities/order.consult/utils'],
    function ($, Backbone, Marionette, Jasmine, Util) {
        'use strict';

        describe('Test setPrerequisiteData function', function(){
            it('Should show counts of zero when there are no prereq questions or orders', function(){
                var consultOrder = {};
                Util.setPrerequisiteData(consultOrder);
                expect(consultOrder.totalCount).toEqual(0);
                expect(consultOrder.totalMet).toEqual(0);
            });

            it('Should set appropriate counts and met flags', function(){
                var consultOrder = {
                    questions: [{
                        answer: 'c928767e-f519-3b34-bff2-a2ed3cd5c6c3',
                        question: 'Question 1'
                    },
                    {
                        answer: 'd58a8003-b801-3da2-83c1-e09497c9bb53',
                        question: 'Question 2'
                    },
                    {
                        answer: '3E8DD206-FBDF-4478-9B05-7638682DD102',
                        question: 'Question 3'
                    }],
                    orderResults: [{
                        orderName: 'Rheumatoid Factor',
                        status: 'Order'
                    },
                    {
                        orderName: 'Lab test 2',
                        status: 'override'
                    },
                    {
                        orderName: 'Lab test 3',
                        status: 'satisfied'
                    },
                    {
                        orderName: 'Lab test 4',
                        status: 'urn:va:order-status:comp'
                    },
                    {
                        orderName: 'Lab test 5',
                        status: 'urn:va:order-status:dc/e'
                    },
                    {
                        orderName: 'Lab test 6',
                        status: 'passed'
                    },
                    {
                        orderName: 'Lab test 7',
                        status: 'urn:va:order-status:xyz'
                    },
                    {
                        orderName: 'Lab test 8',
                        status: 'urn:va:order-status:hold'
                    },
                    {
                        orderName: 'Lab test 9',
                        status: 'urn:va:order-status:flag'
                    },
                    {
                        orderName: 'Lab test 10',
                        status: 'urn:va:order-status:pend'
                    },
                    {
                        orderName: 'Lab test 11',
                        status: 'urn:va:order-status:dc'
                    },
                    {
                        orderName: 'Lab test 12',
                        status: 'urn:va:order-status:actv'
                    },
                    {
                        orderName: 'Lab test 13',
                        status: 'urn:va:order-status:exp'
                    },
                    {
                        orderName: 'Lab test 14',
                        status: 'urn:va:order-status:schd'
                    },
                    {
                        orderName: 'Lab test 15',
                        status: 'urn:va:order-status:part'
                    },
                    {
                        orderName: 'Lab test 16',
                        status: 'urn:va:order-status:dlay'
                    },
                    {
                        orderName: 'Lab test 17',
                        status: 'urn:va:order-status:unr'
                    },
                    {
                        orderName: 'Lab test 18',
                        status: 'urn:va:order-status:canc'
                    },
                    {
                        orderName: 'Lab test 19',
                        status: 'urn:va:order-status:laps'
                    },
                    {
                        orderName: 'Lab test 20',
                        status: 'urn:va:order-status:rnew'
                    },
                    {
                        orderName: 'Lab test 21',
                        status: 'urn:va:order-status:none'
                    }]
                };
                Util.setPrerequisiteData(consultOrder);
                expect(consultOrder.prerequisiteQuestions[0].label).toEqual('Question 1');
                expect(consultOrder.prerequisiteQuestions[0].value).toEqual('Yes');
                expect(consultOrder.prerequisiteQuestions[0].met).toEqual(true);
                expect(consultOrder.prerequisiteQuestions[1].label).toEqual('Question 2');
                expect(consultOrder.prerequisiteQuestions[1].value).toEqual('No');
                expect(consultOrder.prerequisiteQuestions[1].met).toEqual(false);
                expect(consultOrder.prerequisiteQuestions[2].label).toEqual('Question 3');
                expect(consultOrder.prerequisiteQuestions[2].value).toEqual('Overridden');
                expect(consultOrder.prerequisiteQuestions[2].met).toEqual(true);
                expect(consultOrder.prerequisiteOrders[0].label).toEqual('Rheumatoid Factor');
                expect(consultOrder.prerequisiteOrders[0].value).toEqual('Ordered');
                expect(consultOrder.prerequisiteOrders[0].met).toEqual(false);
                expect(consultOrder.prerequisiteOrders[1].label).toEqual('Lab test 2');
                expect(consultOrder.prerequisiteOrders[1].value).toEqual('Overridden');
                expect(consultOrder.prerequisiteOrders[1].met).toEqual(true);
                expect(consultOrder.prerequisiteOrders[2].label).toEqual('Lab test 3');
                expect(consultOrder.prerequisiteOrders[2].value).toEqual('Met by external data');
                expect(consultOrder.prerequisiteOrders[2].met).toEqual(true);
                expect(consultOrder.prerequisiteOrders[3].label).toEqual('Lab test 4');
                expect(consultOrder.prerequisiteOrders[3].value).toEqual('Complete');
                expect(consultOrder.prerequisiteOrders[3].met).toEqual(true);
                expect(consultOrder.prerequisiteOrders[4].label).toEqual('Lab test 5');
                expect(consultOrder.prerequisiteOrders[4].value).toEqual('Discontinued/Edit');
                expect(consultOrder.prerequisiteOrders[4].met).toEqual(false);
                expect(consultOrder.prerequisiteOrders[5].label).toEqual('Lab test 6');
                expect(consultOrder.prerequisiteOrders[5].value).toEqual('Complete');
                expect(consultOrder.prerequisiteOrders[5].met).toEqual(true);
                expect(consultOrder.prerequisiteOrders[6].label).toEqual('Lab test 7');
                expect(consultOrder.prerequisiteOrders[6].value).toEqual('Unknown');
                expect(consultOrder.prerequisiteOrders[6].met).toEqual(false);
                expect(consultOrder.prerequisiteOrders[7].label).toEqual('Lab test 8');
                expect(consultOrder.prerequisiteOrders[7].value).toEqual('Hold');
                expect(consultOrder.prerequisiteOrders[7].met).toEqual(false);
                expect(consultOrder.prerequisiteOrders[8].label).toEqual('Lab test 9');
                expect(consultOrder.prerequisiteOrders[8].value).toEqual('Flagged');
                expect(consultOrder.prerequisiteOrders[8].met).toEqual(false);
                expect(consultOrder.prerequisiteOrders[9].label).toEqual('Lab test 10');
                expect(consultOrder.prerequisiteOrders[9].value).toEqual('Pending');
                expect(consultOrder.prerequisiteOrders[9].met).toEqual(false);
                expect(consultOrder.prerequisiteOrders[10].label).toEqual('Lab test 11');
                expect(consultOrder.prerequisiteOrders[10].value).toEqual('Discontinued');
                expect(consultOrder.prerequisiteOrders[10].met).toEqual(false);
                expect(consultOrder.prerequisiteOrders[11].label).toEqual('Lab test 12');
                expect(consultOrder.prerequisiteOrders[11].value).toEqual('Active');
                expect(consultOrder.prerequisiteOrders[11].met).toEqual(false);
                expect(consultOrder.prerequisiteOrders[12].label).toEqual('Lab test 13');
                expect(consultOrder.prerequisiteOrders[12].value).toEqual('Expired');
                expect(consultOrder.prerequisiteOrders[12].met).toEqual(false);
                expect(consultOrder.prerequisiteOrders[13].label).toEqual('Lab test 14');
                expect(consultOrder.prerequisiteOrders[13].value).toEqual('Scheduled');
                expect(consultOrder.prerequisiteOrders[13].met).toEqual(false);
                expect(consultOrder.prerequisiteOrders[14].label).toEqual('Lab test 15');
                expect(consultOrder.prerequisiteOrders[14].value).toEqual('Partial Results');
                expect(consultOrder.prerequisiteOrders[14].met).toEqual(false);
                expect(consultOrder.prerequisiteOrders[15].label).toEqual('Lab test 16');
                expect(consultOrder.prerequisiteOrders[15].value).toEqual('Delayed');
                expect(consultOrder.prerequisiteOrders[15].met).toEqual(false);
                expect(consultOrder.prerequisiteOrders[16].label).toEqual('Lab test 17');
                expect(consultOrder.prerequisiteOrders[16].value).toEqual('Unreleased');
                expect(consultOrder.prerequisiteOrders[16].met).toEqual(false);
                expect(consultOrder.prerequisiteOrders[17].label).toEqual('Lab test 18');
                expect(consultOrder.prerequisiteOrders[17].value).toEqual('Canceled');
                expect(consultOrder.prerequisiteOrders[17].met).toEqual(false);
                expect(consultOrder.prerequisiteOrders[18].label).toEqual('Lab test 19');
                expect(consultOrder.prerequisiteOrders[18].value).toEqual('Lapsed');
                expect(consultOrder.prerequisiteOrders[18].met).toEqual(false);
                expect(consultOrder.prerequisiteOrders[19].label).toEqual('Lab test 20');
                expect(consultOrder.prerequisiteOrders[19].value).toEqual('Renewed');
                expect(consultOrder.prerequisiteOrders[19].met).toEqual(false);
                expect(consultOrder.prerequisiteOrders[20].label).toEqual('Lab test 21');
                expect(consultOrder.prerequisiteOrders[20].value).toEqual('No Status');
                expect(consultOrder.prerequisiteOrders[20].met).toEqual(false);
                expect(consultOrder.enablePrerequisiteQuestions).toEqual(true);
                expect(consultOrder.enablePrerequisiteOrders).toEqual(true);
                expect(consultOrder.totalCount).toEqual(24);
                expect(consultOrder.totalMet).toEqual(6);
            });
        });
    });
'use strict';

//-----------------------------------------------------------------
// This will test the solr-xform-utils.js functions.
//
// Author: Les Westberg
//-----------------------------------------------------------------

require('../../../../env-setup');

var _ = require('underscore');
var solrXformUtil = require(global.VX_UTILS + 'solr-xform/solr-xform-utils');

describe('solr-xform-utils.js', function () {
    describe('setSimpleFromSimple()', function () {
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': true
            };
            solrXformUtil.setSimpleFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(solrRecord.test).toBe(true);
        });
        it('Verify solrRecord null', function () {
            var solrRecord = null;
            var vprRecord = {
                'test': 'testValue'
            };
            solrXformUtil.setSimpleFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(solrRecord).toBeNull();
        });
        it('Verify vprRecord null', function () {
            var solrRecord = {};
            var vprRecord = null;
            solrXformUtil.setSimpleFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is undefined', function () {
            var solrRecord = {};
            var vprRecord = {};
            solrXformUtil.setSimpleFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': null
            };
            solrXformUtil.setSimpleFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
    });
    describe('setStringFromSimple()', function () {
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': 'testValue'
            };
            solrXformUtil.setStringFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(solrRecord.test).toBe('testValue');
        });
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': true
            };
            solrXformUtil.setStringFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(solrRecord.test).toBe('true');
        });
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': 100
            };
            solrXformUtil.setStringFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(solrRecord.test).toBe('100');
        });
        it('Verify solrRecord null', function () {
            var solrRecord = null;
            var vprRecord = {
                'test': 'testValue'
            };
            solrXformUtil.setStringFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(solrRecord).toBeNull();
        });
        it('Verify vprRecord null', function () {
            var solrRecord = {};
            var vprRecord = null;
            solrXformUtil.setStringFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is not string', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': {}
            };
            solrXformUtil.setStringFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
    });
    describe('setStringFromValue()', function () {
        it('Verify valid value', function () {
            var solrRecord = {};
            solrXformUtil.setStringFromValue(solrRecord, 'test', 'testValue');
            expect(solrRecord.test).toBe('testValue');
        });
        it('Verify valid value', function () {
            var solrRecord = {};
            solrXformUtil.setStringFromValue(solrRecord, 'test', true);
            expect(solrRecord.test).toBe('true');
        });
        it('Verify valid value', function () {
            var solrRecord = {};
            solrXformUtil.setStringFromValue(solrRecord, 'test', 100);
            expect(solrRecord.test).toBe('100');
        });
        it('Verify solrRecord null', function () {
            var solrRecord = null;
            solrXformUtil.setStringFromValue(solrRecord, 'test', 'testValue');
            expect(solrRecord).toBeNull();
        });
        it('Verify vprRecord null', function () {
            var solrRecord = {};
            solrXformUtil.setStringFromValue(solrRecord, 'test', null);
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is not string', function () {
            var solrRecord = {};
            solrXformUtil.setStringFromValue(solrRecord, 'test', {});
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
    });
    describe('addStringFromSimple()', function () {
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': 'testValue'
            };
            solrXformUtil.addStringFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(solrRecord.test).toEqual(['testValue']);
        });
        it('Verify adding a valid value', function () {
            var solrRecord = {
                'test': ['testValue1']
            };
            var vprRecord = {
                'test': 'testValue2'
            };
            solrXformUtil.addStringFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(solrRecord.test).toEqual(['testValue1', 'testValue2']);
        });
        it('Verify solrRecord null', function () {
            var solrRecord = null;
            var vprRecord = {
                'test': 'testValue'
            };
            solrXformUtil.addStringFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(solrRecord).toBeNull();
        });
        it('Verify vprRecord null', function () {
            var solrRecord = {};
            var vprRecord = null;
            solrXformUtil.addStringFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is not string', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': 100
            };
            solrXformUtil.addStringFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
    });
    describe('setStringArrayFromSimple()', function () {
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': 'testValue'
            };
            solrXformUtil.setStringArrayFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(solrRecord.test).toEqual(['testValue']);
        });
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': true
            };
            solrXformUtil.setStringArrayFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(solrRecord.test).toEqual(['true']);
        });
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': 100
            };
            solrXformUtil.setStringArrayFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(solrRecord.test).toEqual(['100']);
        });
        it('Verify solrRecord null', function () {
            var solrRecord = null;
            var vprRecord = {
                'test': 'testValue'
            };
            solrXformUtil.setStringArrayFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(solrRecord).toBeNull();
        });
        it('Verify vprRecord null', function () {
            var solrRecord = {};
            var vprRecord = null;
            solrXformUtil.setStringArrayFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is not string', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': {}
            };
            solrXformUtil.setStringArrayFromSimple(solrRecord, 'test', vprRecord, 'test');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
    });
    describe('setStringArrayFromObjectArrayField()', function () {
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': [{
                    name: 'name1'
                }, {
                    name: 'name2'
                }]
            };
            solrXformUtil.setStringArrayFromObjectArrayField(solrRecord, 'test', vprRecord, 'test', 'name');
            expect(solrRecord.test).toEqual(['name1', 'name2']);
        });
        it('Verify solrRecord null', function () {
            var solrRecord = null;
            var vprRecord = {
                'test': [{
                    name: 'name1'
                }, {
                    name: 'name2'
                }]
            };
            solrXformUtil.setStringArrayFromObjectArrayField(solrRecord, 'test', vprRecord, 'test', 'name');
            expect(solrRecord).toBeNull();
        });
        it('Verify vprRecord null', function () {
            var solrRecord = {};
            var vprRecord = null;
            solrXformUtil.setStringArrayFromObjectArrayField(solrRecord, 'test', vprRecord, 'test', 'name');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is null', function () {
            var solrRecord = {};
            var vprRecord = {};
            solrXformUtil.setStringArrayFromObjectArrayField(solrRecord, 'test', vprRecord, 'test', 'name');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is an array where not all have the property we are looking for.', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': [{
                    otherName: 'name1'
                }, {
                    name: 'name2'
                }]
            };
            solrXformUtil.setStringArrayFromObjectArrayField(solrRecord, 'test', vprRecord, 'test', 'name');
            expect(solrRecord.test).toEqual(['name2']);
        });
    });
    describe('setStringArrayFromObjectArrayFields()', function () {
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': [{
                    name: 'name1',
                    text: 'text1'
                }, {
                    name: 'name2',
                    text: 'text2'
                }]
            };
            solrXformUtil.setStringArrayFromObjectArrayFields(solrRecord, 'test', vprRecord, 'test', 'name', 'text', ' ');
            expect(solrRecord.test).toEqual(['name1 text1', 'name2 text2']);
        });
        it('Verify solrRecord null', function () {
            var solrRecord = null;
            var vprRecord = {
                'test': [{
                    name: 'name1',
                    text: 'text1'
                }, {
                    name: 'name2',
                    text: 'text2'
                }]
            };
            solrXformUtil.setStringArrayFromObjectArrayFields(solrRecord, 'test', vprRecord, 'test', 'name', 'text', ' ');
            expect(solrRecord).toBeNull();
        });
        it('Verify vprRecord null', function () {
            var solrRecord = {};
            var vprRecord = null;
            solrXformUtil.setStringArrayFromObjectArrayFields(solrRecord, 'test', vprRecord, 'test', 'name', 'text', ' ');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is null', function () {
            var solrRecord = {};
            var vprRecord = {};
            solrXformUtil.setStringArrayFromObjectArrayFields(solrRecord, 'test', vprRecord, 'test', 'name', 'text', ' ');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is an array where not all have the property we are looking for.', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': [{
                    otherName: 'name1',
                    otherText: 'text1'
                }, {
                    name: 'name2',
                    text: 'text2'
                }]
            };
            solrXformUtil.setStringArrayFromObjectArrayFields(solrRecord, 'test', vprRecord, 'test', 'name', 'text', ' ');
            expect(solrRecord.test).toEqual(['name2 text2']);
        });
        it('Verify vprRecord.field is an array where not all have the child properties are present.', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': [{
                    name: 'name1'
                }, {
                    text: 'text2'
                }]
            };
            solrXformUtil.setStringArrayFromObjectArrayFields(solrRecord, 'test', vprRecord, 'test', 'name', 'text', ' ');
            expect(solrRecord.test).toEqual(['name1', 'text2']);
        });
    });
    describe('setStringArrayFromObjectArrayArrayField()', function () {
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': [{
                    'testChild': [{
                        name: 'name1'
                    }, {
                        name: 'name2'
                    }]
                }, {
                    'testChild': [{
                        name: 'name10'
                    }, {
                        name: 'name20'
                    }]
                }]
            };
            solrXformUtil.setStringArrayFromObjectArrayArrayField(solrRecord, 'test', vprRecord, 'test', 'testChild', 'name');
            expect(solrRecord.test).toEqual(['name1', 'name2', 'name10', 'name20']);
        });
        it('Verify solrRecord null', function () {
            var solrRecord = null;
            var vprRecord = {
                'test': [{
                    'testChild': [{
                        name: 'name1'
                    }, {
                        name: 'name2'
                    }]
                }, {
                    'testChild': [{
                        name: 'name10'
                    }, {
                        name: 'name20'
                    }]
                }]
            };
            solrXformUtil.setStringArrayFromObjectArrayArrayField(solrRecord, 'test', vprRecord, 'test', 'testChild', 'name');
            expect(solrRecord).toBeNull();
        });
        it('Verify vprRecord null', function () {
            var solrRecord = {};
            var vprRecord = null;
            solrXformUtil.setStringArrayFromObjectArrayArrayField(solrRecord, 'test', vprRecord, 'test', 'testChild', 'name');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is null', function () {
            var solrRecord = {};
            var vprRecord = {};
            solrXformUtil.setStringArrayFromObjectArrayArrayField(solrRecord, 'test', vprRecord, 'test', 'testChild', 'name');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': []
            };
            solrXformUtil.setStringArrayFromObjectArrayArrayField(solrRecord, 'test', vprRecord, 'test', 'testChild', 'name');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': [{
                    'testChild': []
                }, {
                    'testChild': []
                }]
            };
            solrXformUtil.setStringArrayFromObjectArrayArrayField(solrRecord, 'test', vprRecord, 'test', 'testChild', 'name');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is an array where not all have the property we are looking for.', function () {
            var solrRecord = {};
            var vprRecord = {
                'test': [{
                    'testChild': [{
                        otherName: 'name1'
                    }, {
                        name: 'name2'
                    }]
                }, {
                    'otherTestChild': [{
                        name: 'name10'
                    }, {
                        name: 'name20'
                    }]
                }]
            };
            solrXformUtil.setStringArrayFromObjectArrayArrayField(solrRecord, 'test', vprRecord, 'test', 'testChild', 'name');
            expect(solrRecord.test).toEqual(['name2']);
        });
    });
    describe('setStringArrayFromObjectObjectArrayField()', function () {
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': [{
                        comment: 'Comment1'
                    }, {
                        comment: 'Comment2'
                    }, {
                        somethingElse: 'Test3'
                    }]
                }
            };
            solrXformUtil.setStringArrayFromObjectObjectArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'comment');
            expect(solrRecord.test).toEqual(['Comment1', 'Comment2']);
        });
        it('Verify solrRecord null', function () {
            var solrRecord = null;
            var vprRecord = {
                'data': {
                    'consultOrders': [{
                        comment: 'Comment1'
                    }, {
                        comment: 'Comment2'
                    }, {
                        somethingElse: 'Test3'
                    }]
                }
            };
            solrXformUtil.setStringArrayFromObjectObjectArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'comment');
            expect(solrRecord).toBeNull();
        });
        it('Verify vprRecord null', function () {
            var solrRecord = {};
            var vprRecord = null;
            solrXformUtil.setStringArrayFromObjectObjectArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'comment');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is null', function () {
            var solrRecord = {};
            var vprRecord = {};
            solrXformUtil.setStringArrayFromObjectObjectArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'comment');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is empty array', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {}
            };
            solrXformUtil.setStringArrayFromObjectObjectArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'comment');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify when vprRecord.field.field is not an array.', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': {}
                }
            };
            solrXformUtil.setStringArrayFromObjectObjectArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'comment');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify when vprRecord.field.field is not an empty array.', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': []
                }
            };
            solrXformUtil.setStringArrayFromObjectObjectArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'comment');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify when vprRecord.field.field is an array but none of the array items have a child with the correct field name.', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': [
                        {
                            'test': 'SomeValue1'
                        }, {
                            'test2': 'SomeValue2'
                        }
                    ]
                }
            };
            solrXformUtil.setStringArrayFromObjectObjectArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'comment');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
    });
    describe('setStringFromPrimaryProviders()', function () {
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'providers': [{
                    providerName: 'name1'
                }, {
                    primary: true,
                    providerName: 'name2'
                }]
            };
            solrXformUtil.setStringFromPrimaryProviders(solrRecord, 'test', vprRecord, 'providers', 'providerName');
            expect(solrRecord.test).toEqual('name2');
        });
        it('Verify vprRecord has a primary provider - but no providerName there.', function () {
            var solrRecord = {};
            var vprRecord = {
                'providers': [{
                    providerName: 'name1'
                }, {
                    primary: true,
                }]
            };
            solrXformUtil.setStringFromPrimaryProviders(solrRecord, 'test', vprRecord, 'providers', 'providerName');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify solrRecord null', function () {
            var solrRecord = null;
            var vprRecord = {
                'providers': [{
                    providerName: 'name1'
                }, {
                    primary: true,
                    providerName: 'name2'
                }]
            };
            solrXformUtil.setStringFromPrimaryProviders(solrRecord, 'test', vprRecord, 'providers', 'providerName');
            expect(solrRecord).toBeNull();
        });
        it('Verify vprRecord null', function () {
            var solrRecord = {};
            var vprRecord = null;
            solrXformUtil.setStringFromPrimaryProviders(solrRecord, 'test', vprRecord, 'providers', 'providerName');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is null', function () {
            var solrRecord = {};
            var vprRecord = {};
            solrXformUtil.setStringFromPrimaryProviders(solrRecord, 'test', vprRecord, 'providers', 'providerName');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
    });
    describe('setCommonFields()', function () {
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'uid': 'urn:va:allergy:SITE:3:1',
                'pid': 'SITE;3',
                'facilityCode': '500',
                'facilityName': 'SomeFacility',
                'kind': 'SomeKind',
                'summary': 'SomeSummary',
                'codes': [{
                    'code': '100',
                    'system': 'http://theSystem100',
                    'display': 'SomeDisplay100'
                }, {
                    'code': '200',
                    'system': 'http://theSystem200',
                    'display': 'SomeDisplay200'
                }],
                'referenceDateTime': '20051010100001',
                'visitDateTime': '20051010100002',
                'observed': '20051010100003',
                'resulted': '20051010100004',
                'entered': '20051010100005',
                'updated': '20051010100006',
                'resolved': '20051010100007',
                'onset': '20051010100008',
                'stopped': '20051010100009',
                'overallStart': '20051010100010',
                'overallStop': '20051010100011',
                'administeredDateTime': '20051010100012',
                'procedureDateTime': '20051010100013',
                'start': '20051010100014',
                'healthFactorDateTime': '20051010100015',
                'documentEntered': '20051010100016',
                'obsEntered': '20051010100017',
                'verified': '20051010100018'
            };
            solrXformUtil.setCommonFields(solrRecord, vprRecord);
            expect(solrRecord.uid).toBe(vprRecord.uid);
            expect(solrRecord.pid).toBe(vprRecord.pid);
            expect(solrRecord.facility_code).toBe(vprRecord.facilityCode);
            expect(solrRecord.facility_name).toBe(vprRecord.facilityName);
            expect(solrRecord.kind).toBe(vprRecord.kind);
            expect(solrRecord.summary).toBe(vprRecord.summary);
            expect(solrRecord.codes_code).toEqual([vprRecord.codes[0].code, vprRecord.codes[1].code]);
            expect(solrRecord.codes_system).toEqual([vprRecord.codes[0].system, vprRecord.codes[1].system]);
            expect(solrRecord.codes_display).toEqual([vprRecord.codes[0].display, vprRecord.codes[1].display]);
            expect(solrRecord.reference_date_time).toBe(vprRecord.referenceDateTime);
            expect(solrRecord.visit_date_time).toBe(vprRecord.visitDateTime);
            expect(solrRecord.observed).toBe(vprRecord.observed);
            expect(solrRecord.resulted).toBe(vprRecord.resulted);
            expect(solrRecord.entered).toBe(vprRecord.entered);
            expect(solrRecord.updated).toBe(vprRecord.updated);
            expect(solrRecord.resolved).toBe(vprRecord.resolved);
            expect(solrRecord.onset).toBe(vprRecord.onset);
            expect(solrRecord.stopped).toBe(vprRecord.stopped);
            expect(solrRecord.overall_start).toBe(vprRecord.overallStart);
            expect(solrRecord.overall_stop).toBe(vprRecord.overallStop);
            expect(solrRecord.administered_date_time).toBe(vprRecord.administeredDateTime);
            expect(solrRecord.procedure_date_time).toBe(vprRecord.procedureDateTime);
            expect(solrRecord.order_start_date_time).toBe(vprRecord.start);
            expect(solrRecord.health_factor_date_time).toBe(vprRecord.healthFactorDateTime);
            expect(solrRecord.document_entered).toBe(vprRecord.documentEntered);
            expect(solrRecord.obs_entered).toBe(vprRecord.obsEntered);
        });
    });
    describe('setStringArrayFromLatestChildArrayArrayField()', function () {
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': [{
                        'conditions': [{
                            'name': 'Name1'
                        }, {
                            'name': 'Name2'
                        }]
                    }, {
                        'conditions': [{
                            'name': 'Name10'
                        }, {
                            'name': 'Name20'
                        }]
                    }, {
                        'conditions': [{
                            'name': 'Name100'
                        }, {
                            'name': 'Name200'
                        }]
                    }]
                }
            };
            solrXformUtil.setStringArrayFromLatestChildArrayArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'conditions', 'name');
            expect(solrRecord.test).toEqual(['Name100', 'Name200']);
        });
        it('Verify solrRecord null', function () {
            var solrRecord = null;
            var vprRecord = {
                'data': {
                    'consultOrders': [{
                        'conditions': [{
                            'name': 'Name1'
                        }, {
                            'name': 'Name2'
                        }]
                    }, {
                        'conditions': [{
                            'name': 'Name10'
                        }, {
                            'name': 'Name20'
                        }]
                    }, {
                        'conditions': [{
                            'name': 'Name100'
                        }, {
                            'name': 'Name200'
                        }]
                    }]
                }
            };
            solrXformUtil.setStringArrayFromLatestChildArrayArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'conditions', 'name');
            expect(solrRecord).toBeNull();
        });
        it('Verify vprRecord null', function () {
            var solrRecord = {};
            var vprRecord = null;
            solrXformUtil.setStringArrayFromLatestChildArrayArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'conditions', 'name');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is null', function () {
            var solrRecord = {};
            var vprRecord = {};
            solrXformUtil.setStringArrayFromLatestChildArrayArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'conditions', 'name');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field.field is not an array', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': {}
                }
            };
            solrXformUtil.setStringArrayFromLatestChildArrayArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'conditions', 'name');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field.field is an array with length of 0', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': []
                }
            };
            solrXformUtil.setStringArrayFromLatestChildArrayArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'conditions', 'name');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field.field.field is not an array', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': [{
                        'conditions': {}
                    }, {
                        'conditions': {}
                    }, {
                        'conditions': {}
                    }]
                }
            };
            solrXformUtil.setStringArrayFromLatestChildArrayArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'conditions', 'name');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field.field.field is not an empty array', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': [{
                        'conditions': []
                    }, {
                        'conditions': []
                    }, {
                        'conditions': []
                    }]
                }
            };
            solrXformUtil.setStringArrayFromLatestChildArrayArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'conditions', 'name');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
    });
    describe('setStringFromLatestChildArrayObjectField()', function () {
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': [{
                        'acceptingProvider': {
                            'displayName': 'Name1'
                        }
                    }, {
                        'acceptingProvider': {
                            'displayName': 'Name10'
                        }
                    }, {
                        'acceptingProvider': {
                            'displayName': 'Name100'
                        }
                    }]
                }
            };
            solrXformUtil.setStringFromLatestChildArrayObjectField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'acceptingProvider', 'displayName');
            expect(solrRecord.test).toEqual('Name100');
        });
        it('Verify solrRecord null', function () {
            var solrRecord = null;
            var vprRecord = {
                'data': {
                    'consultOrders': [{
                        'acceptingProvider': {
                            'displayName': 'Name1'
                        }
                    }, {
                        'acceptingProvider': {
                            'displayName': 'Name10'
                        }
                    }, {
                        'acceptingProvider': {
                            'displayName': 'Name100'
                        }
                    }]
                }
            };
            solrXformUtil.setStringFromLatestChildArrayObjectField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'acceptingProvider', 'displayName');
            expect(solrRecord).toBeNull();
        });
        it('Verify vprRecord null', function () {
            var solrRecord = {};
            var vprRecord = null;
            solrXformUtil.setStringFromLatestChildArrayObjectField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'acceptingProvider', 'displayName');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is null', function () {
            var solrRecord = {};
            var vprRecord = {};
            solrXformUtil.setStringFromLatestChildArrayObjectField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'acceptingProvider', 'displayName');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is not an object', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': 'someString'
            };
            solrXformUtil.setStringFromLatestChildArrayObjectField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'acceptingProvider', 'displayName');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field.field is not an array', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': {}
                }
            };
            solrXformUtil.setStringFromLatestChildArrayObjectField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'acceptingProvider', 'displayName');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field.field is an empty array', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': []
                }
            };
            solrXformUtil.setStringFromLatestChildArrayObjectField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'acceptingProvider', 'displayName');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field.field[].field is not an object', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': [{
                        'acceptingProvider': 'someText1'
                    }, {
                        'acceptingProvider': 'someText10'
                    }, {
                        'acceptingProvider': 'someText100'
                    }]
                }
            };
            solrXformUtil.setStringFromLatestChildArrayObjectField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'acceptingProvider', 'displayName');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field.field[].field is an object but the field is not a string.', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': [{
                        'acceptingProvider': {
                            'displayName': {}
                        }
                    }, {
                        'acceptingProvider': {
                            'displayName': {}
                        }
                    }, {
                        'acceptingProvider': {
                            'displayName': {}
                        }
                    }]
                }
            };
            solrXformUtil.setStringFromLatestChildArrayObjectField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'acceptingProvider', 'displayName');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field.field[].field is an object but the field is an empty string.', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': [{
                        'acceptingProvider': {
                            'displayName': ''
                        }
                    }, {
                        'acceptingProvider': {
                            'displayName': ''
                        }
                    }, {
                        'acceptingProvider': {
                            'displayName': ''
                        }
                    }]
                }
            };
            solrXformUtil.setStringFromLatestChildArrayObjectField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'acceptingProvider', 'displayName');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
    });
    describe('setStringFromLatestChildArrayField()', function () {
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': [{
                        'overrideReason': 'Reason 1'
                    }, {
                        'overrideReason': 'Reason 10'
                    }, {
                        'overrideReason': 'Reason 100'
                    }]
                }
            };
            solrXformUtil.setStringFromLatestChildArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'overrideReason');
            expect(solrRecord.test).toEqual('Reason 100');
        });
        it('Verify solrRecord null', function () {
            var solrRecord = null;
            var vprRecord = {
                'data': {
                    'consultOrders': [{
                        'overrideReason': 'Reason 1'
                    }, {
                        'overrideReason': 'Reason 10'
                    }, {
                        'overrideReason': 'Reason 100'
                    }]
                }
            };
            solrXformUtil.setStringFromLatestChildArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'overrideReason');
            expect(solrRecord).toBeNull();
        });
        it('Verify vprRecord null', function () {
            var solrRecord = {};
            var vprRecord = null;
            solrXformUtil.setStringFromLatestChildArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'overrideReason');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is not an object', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': 'NotAnObject'
            };
            solrXformUtil.setStringFromLatestChildArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'overrideReason');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field.field is not an array', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': {}
                }
            };
            solrXformUtil.setStringFromLatestChildArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'overrideReason');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field.field is an empty array', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': []
                }
            };
            solrXformUtil.setStringFromLatestChildArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'overrideReason');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field.field[].field is not a string', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': [{
                        'overrideReason': {}
                    }, {
                        'overrideReason': {}
                    }, {
                        'overrideReason': {}
                    }]
                }
            };
            solrXformUtil.setStringFromLatestChildArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'overrideReason');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field.field[].field is an empty string', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'consultOrders': [{
                        'overrideReason': ''
                    }, {
                        'overrideReason': ''
                    }, {
                        'overrideReason': ''
                    }]
                }
            };
            solrXformUtil.setStringFromLatestChildArrayField(solrRecord, 'test', vprRecord, 'data', 'consultOrders', 'overrideReason');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
    });
    describe('setStringPidFromSimpleUid()', function () {
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'patientUid': 'urn:va:patient:SITE:239:239'
            };
            solrXformUtil.setStringPidFromSimpleUid(solrRecord, 'pid', vprRecord, 'patientUid');
            expect(solrRecord.pid).toEqual('SITE;239');
        });
        it('Verify solrRecord null', function () {
            var solrRecord = null;
            var vprRecord = {
                'patientUid': 'urn:va:patient:SITE:239:239'
            };
            solrXformUtil.setStringPidFromSimpleUid(solrRecord, 'pid', vprRecord, 'patientUid');
            expect(solrRecord).toBeNull();
        });
        it('Verify vprRecord null', function () {
            var solrRecord = {};
            var vprRecord = null;
            solrXformUtil.setStringPidFromSimpleUid(solrRecord, 'pid', vprRecord, 'patientUid');
            expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is not a string', function () {
            var solrRecord = null;
            var vprRecord = {
                'patientUid': {}
            };
            solrXformUtil.setStringPidFromSimpleUid(solrRecord, 'pid', vprRecord, 'patientUid');
            expect(solrRecord).toBeNull();
        });
        it('Verify vprRecord.field is not a valid UID', function () {
            var solrRecord = null;
            var vprRecord = {
                'patientUid': 'urn:va:patient:SITE'
            };
            solrXformUtil.setStringPidFromSimpleUid(solrRecord, 'pid', vprRecord, 'patientUid');
            expect(solrRecord).toBeNull();
        });
    });
    describe('setStringFromObjectObjectField()', function () {
        it('Verify valid value', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'activity': {
                        processInstanceId: '100'
                    }
                }
            };
            solrXformUtil.setStringFromObjectObjectField(solrRecord, 'test', vprRecord, 'data', 'activity', 'processInstanceId');
            expect(solrRecord.test).toEqual('100');
        });
        it('Verify solrRecord null', function () {
        	var solrRecord = null;
            var vprRecord = {
                'data': {
                    'activity': {
                        processInstanceId: '100'
                    }
                }
            };
            solrXformUtil.setStringFromObjectObjectField(solrRecord, 'test', vprRecord, 'data', 'activity', 'processInstanceId');
        	expect(solrRecord).toBeNull();
        });
        it('Verify vprRecord null', function () {
        	var solrRecord = {};
        	var vprRecord = null;
            solrXformUtil.setStringFromObjectObjectField(solrRecord, 'test', vprRecord, 'data', 'activity', 'processInstanceId');
        	expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is null', function () {
        	var solrRecord = {};
        	var vprRecord = {};
            solrXformUtil.setStringFromObjectObjectField(solrRecord, 'test', vprRecord, 'data', 'activity', 'processInstanceId');
        	expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify vprRecord.field is empty array', function () {
        	var solrRecord = {};
        	var vprRecord = {
        		'data': {}
        	};
            solrXformUtil.setStringFromObjectObjectField(solrRecord, 'test', vprRecord, 'data', 'activity', 'processInstanceId');
        	expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify when vprRecord.field.field is not an object.', function () {
        	var solrRecord = {};
        	var vprRecord = {
        		'data': {
        			'activity': '11'
        		}
        	};
            solrXformUtil.setStringFromObjectObjectField(solrRecord, 'test', vprRecord, 'data', 'activity', 'processInstanceId');
        	expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify when vprRecord.field.field.field is an empty string.', function () {
        	var solrRecord = {};
            var vprRecord = {
                'data': {
                    'activity': {
                        processInstanceId: ''
                    }
                }
            };
            solrXformUtil.setStringFromObjectObjectField(solrRecord, 'test', vprRecord, 'data', 'activity', 'processInstanceId');
        	expect(_.isEmpty(solrRecord)).toBe(true);
        });
        it('Verify when vprRecord.field.field.field is a numeric value.', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'activity': {
                        processInstanceId: 100
                    }
                }
            };
            solrXformUtil.setStringFromObjectObjectField(solrRecord, 'test', vprRecord, 'data', 'activity', 'processInstanceId');
            expect(solrRecord.test).toBe('100');
        });
        it('Verify when vprRecord.field.field.field is a boolean value.', function () {
            var solrRecord = {};
            var vprRecord = {
                'data': {
                    'activity': {
                        processInstanceId: true
                    }
                }
            };
            solrXformUtil.setStringFromObjectObjectField(solrRecord, 'test', vprRecord, 'data', 'activity', 'processInstanceId');
            expect(solrRecord.test).toBe('true');
        });
    });

});
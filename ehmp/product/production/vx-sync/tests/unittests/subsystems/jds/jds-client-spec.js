'use strict';
require('../../../../env-setup');
var _ = require('underscore');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');

var logger = require(global.VX_DUMMIES + '/dummy-logger');
var jds = new JdsClient(logger, logger);

// This is in a separate file so that it doesn't overwhelm the editor
var opstamp = require('./opstamp');

var metastampDomains = {
    'icn': '10110V004877',
    'stampTime': '20131031094920',
    'sourceMetaStamp': {
        'DOD': {
            'pid': 'DOD;0000000008',
            'localId': '0000000008',
            'stampTime': '20131031094920',
            'domainMetaStamp': {
                'allergy': {
                    'domain': 'allergy',
                    'stampTime': '20131031094920',
                    'eventMetaStamp': {
                        'urn:va:allergy:DOD:0000000008:1000001122': {
                            'stampTime': '20131031094920'
                        }
                    }
                },
                'vital': {
                    'domain': 'vital',
                    'stampTime': '20131031094920',
                    'eventMetaStamp': {
                        'urn:va:vital:DOD:0000000008:80': {
                            'stampTime': '20131031094920'
                        }
                    }
                }
            }
        }
    }
};

var metastampLargeDomain = {
    'icn': '10110V004877',
    'stampTime': '20131031094920',
    'sourceMetaStamp': {
        'SITE': {
            'pid': 'SITE;8',
            'localId': '8',
            'stampTime': '20131031094920',
            'domainMetaStamp': {
                'lab': {
                    'domain': 'lab',
                    'stampTime': '20131031094920',
                    'eventMetaStamp': {
                        'urn:va:lab:SITE:8:CH;6899693.87PORT;80': {
                            'stampTime': '20131031094920'
                        },
                        'urn:va:lab:SITE:8:CH;6899693.87PORT;81': {
                            'stampTime': '20131031094920'
                        },
                        'urn:va:lab:SITE:8:CH;6899693.87PORT;82': {
                            'stampTime': '20131031094920'
                        },
                        'urn:va:lab:SITE:8:CH;6899693.87PORT;83': {
                            'stampTime': '20131031094920'
                        },
                        'urn:va:lab:SITE:8:CH;6899693.87PORT;84': {
                            'stampTime': '20131031094920'
                        },
                        'urn:va:lab:SITE:8:CH;6899693.87PORT;85': {
                            'stampTime': '20131031094920'
                        },
                        'urn:va:lab:SITE:8:CH;6899693.87PORT;86': {
                            'stampTime': '20131031094920'
                        },
                        'urn:va:lab:SITE:8:CH;6899693.87PORT;87': {
                            'stampTime': '20131031094920'
                        }
                    }
                }
            }
        }
    }
};

var metastampSources = {
    'icn': '10110V004877',
    'stampTime': '20131031094920',
    'sourceMetaStamp': {
        'SITE': {
            'pid': 'SITE;8',
            'localId': '8',
            'stampTime': '20131031094920',
            'domainMetaStamp': {
                'lab': {
                    'domain': 'lab',
                    'stampTime': '20131031094920',
                    'eventMetaStamp': {
                        'urn:va:lab:SITE:8:CH;6899693.87PORT;80': {
                            'stampTime': '20131031094920'
                        },
                        'urn:va:lab:SITE:8:CH;6899693.87PORT;81': {
                            'stampTime': '20131031094920'
                        },
                        'urn:va:lab:SITE:8:CH;6899693.87PORT;82': {
                            'stampTime': '20131031094920'
                        },
                        'urn:va:lab:SITE:8:CH;6899693.87PORT;83': {
                            'stampTime': '20131031094920'
                        },
                        'urn:va:lab:SITE:8:CH;6899693.87PORT;84': {
                            'stampTime': '20131031094920'
                        },
                        'urn:va:lab:SITE:8:CH;6899693.87PORT;85': {
                            'stampTime': '20131031094920'
                        },
                        'urn:va:lab:SITE:8:CH;6899693.87PORT;86': {
                            'stampTime': '20131031094920'
                        },
                        'urn:va:lab:SITE:8:CH;6899693.87PORT;87': {
                            'stampTime': '20131031094920'
                        }
                    }
                }
            }
        },
        'DOD': {
            'pid': 'DOD;0000000008',
            'localId': '0000000008',
            'stampTime': '20131031094920',
            'domainMetaStamp': {
                'allergy': {
                    'domain': 'allergy',
                    'stampTime': '20131031094920',
                    'eventMetaStamp': {
                        'urn:va:allergy:DOD:0000000008:1000001122': {
                            'stampTime': '20131031094920'
                        }
                    }
                }
            }
        }
    }
};

var largeOPDomain = {
    'stampTime': '20150623215404',
    'sourceMetaStamp': {
        'SITE': {
            'stampTime': '20150623215404',
            'domainMetaStamp': {
                'asu-class': {
                    'domain': 'asu-class',
                    'stampTime': '20150623215404',
                    'itemMetaStamp': {
                        'urn:va:asu-class:SITE:19': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:31': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:34': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:35': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:42': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:46': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:48': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:54': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:55': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:56': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:58': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:91': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:92': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:93': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:94': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:100': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:101': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:104': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:119': {
                            'stampTime': '20150623215404'
                        },
                        'urn:va:asu-class:SITE:151': {
                            'stampTime': '20150623215404'
                        }
                    }
                }
            }
        }
    }
};


describe('jds-client.js', function() {
    describe('getSyncStatus()', function() {
        var patientIdentifier = {
            type: 'pid',
            value: 'SITE;3'
        };
        var expectedBasePath = '/status/' + patientIdentifier.value;
        var finished = false;
        var calledPath;

        var callback = function() {
            finished = true;
        };

        beforeEach(function() {
            calledPath = null;
            finished = false;
            spyOn(jds, 'execute').andCallFake(function(path, dataToPost, method, metricsObj, callback) {
                calledPath = path;
                return setTimeout(callback);
            });
        });

        it('called without filter', function() {
            runs(function() {
                jds.getSyncStatus(patientIdentifier, callback);
            });

            waitsFor(function() {
                expect(jds.execute).toHaveBeenCalled();
                expect(calledPath).toEqual(expectedBasePath);
                return finished;
            }, 500);
        });

        it('called with empty filter', function() {
            var filter = null;

            runs(function() {
                jds.getSyncStatus(patientIdentifier, filter, callback);
            });

            waitsFor(function() {
                expect(jds.execute).toHaveBeenCalled();
                expect(calledPath).toEqual(expectedBasePath);
                return finished;
            }, 500);
        });

        it('called with non-object non-string filter', function() {
            var filter = 10;

            runs(function() {
                jds.getSyncStatus(patientIdentifier, filter, callback);
            });

            waitsFor(function() {
                expect(jds.execute).toHaveBeenCalled();
                expect(calledPath).toEqual(expectedBasePath);
                return finished;
            }, 500);
        });

        it('called with empty object filter', function() {
            var filter = {};

            runs(function() {
                jds.getSyncStatus(patientIdentifier, filter, callback);
            });

            waitsFor(function() {
                expect(jds.execute).toHaveBeenCalled();
                expect(calledPath).toEqual(expectedBasePath);
                return finished;
            }, 500);
        });

        it('called with object with empty filter attribute', function() {
            var filter = {
                filter: null
            };

            runs(function() {
                jds.getSyncStatus(patientIdentifier, filter, callback);
            });

            waitsFor(function() {
                expect(jds.execute).toHaveBeenCalled();
                expect(calledPath).toEqual(expectedBasePath);
                return finished;
            }, 500);
        });

        it('called with string filter', function() {
            var filter = '?detailed=true&filter=lt("stampTime",20171231000000)';

            runs(function() {
                jds.getSyncStatus(patientIdentifier, filter, callback);
            });

            waitsFor(function() {
                expect(jds.execute).toHaveBeenCalled();
                expect(calledPath).toEqual(expectedBasePath + filter);
                return finished;
            }, 500);
        });

        it('called with object filter', function() {
            var filter = {
                filter: '?detailed=true&filter=lt("stampTime",20171231000000)'
            };

            runs(function() {
                jds.getSyncStatus(patientIdentifier, filter, callback);
            });

            waitsFor(function() {
                expect(jds.execute).toHaveBeenCalled();
                expect(calledPath).toEqual(expectedBasePath + filter.filter);
                return finished;
            }, 500);
        });
    });

    describe('_splitMetastampBySource()', function() {
        it('split metastamp by source', function() {
            var metastamps = jds._splitMetastampBySource(metastampSources);
            expect(metastamps.length).toBe(2);
            expect(_.size(metastamps[0].sourceMetaStamp)).toBe(1);
            expect(_.size(metastamps[1].sourceMetaStamp)).toBe(1);
        });

        it('split metastamp by domain', function() {
            var metastamps = jds._splitMetastampByDomain(metastampDomains);
            expect(metastamps.length).toBe(2);
            expect(_.size(metastamps[0].sourceMetaStamp.DOD.domainMetaStamp)).toBe(1);
            expect(_.size(metastamps[1].sourceMetaStamp.DOD.domainMetaStamp)).toBe(1);
        });

        it('split metastamp by event', function() {
            var metastamps = jds._splitMetastampDomain(metastampLargeDomain, 800);
            expect(metastamps.length).toBe(2);
            expect(_.size(metastamps[0].sourceMetaStamp['SITE'].domainMetaStamp.lab.eventMetaStamp)).toBe(4);
            expect(_.size(metastamps[1].sourceMetaStamp['SITE'].domainMetaStamp.lab.eventMetaStamp)).toBe(4);
        });

        it('split operational metastamp by event', function() {
            var metastamps = jds._splitMetastampDomain(largeOPDomain, 800);
            expect(metastamps.length).toBe(3);
            expect(_.size(metastamps[0].sourceMetaStamp.SITE.domainMetaStamp['asu-class'].itemMetaStamp)).toBe(7);
            expect(_.size(metastamps[1].sourceMetaStamp.SITE.domainMetaStamp['asu-class'].itemMetaStamp)).toBe(7);
            expect(_.size(metastamps[1].sourceMetaStamp.SITE.domainMetaStamp['asu-class'].itemMetaStamp)).toBe(7);
        });

        it('split metastamp', function() {
            var metastamps = jds._ensureMetastampSize(opstamp, 20000);
            expect(metastamps.length).toBeGreaterThan(17);
            _.each(metastamps, function(stamp) {
                expect(_.size(stamp.sourceMetaStamp.SITE.domainMetaStamp)).toBeGreaterThan(0);
            });
        });

        it('don\'t split metastamp', function() {
            var metastamps = jds._ensureMetastampSize(opstamp, 2000000);
            expect(metastamps.length).toBe(1);
        });
    });
});
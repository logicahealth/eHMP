VPRJT2D ;V4W/DLW -- Integration tests for operational utilities
 ;
STARTUP ; Run once before all tests
 D ODSCLR^VPRJTX
 QUIT
 ;
SHUTDOWN ; Run once after all tests
 D ODSCLR^VPRJTX
 QUIT
 ;
SETUP ; Run before each test
 D ODSCLR^VPRJTX
 QUIT
 ;
TEARDOWN ; Run after each test
 D ODSCLR^VPRJTX
 QUIT
 ;
ASSERT(EXPECT,ACTUAL,MSG) ; for convenience
 D EQ^VPRJT(EXPECT,ACTUAL,$G(MSG))
 QUIT
 ;
BUILD ; Build up test data
 N DATA,LOC
 D GETDATA^VPRJTX("TEST1","VPRJTD01",.DATA)
 S LOC=$$SAVE^VPRJDS(.DATA)
 K DATA,LOC
 D GETDATA^VPRJTX("TEST2","VPRJTD01",.DATA)
 S LOC=$$SAVE^VPRJDS(.DATA)
 K DATA,LOC
 D GETDATA^VPRJTX("TEST3","VPRJTD01",.DATA)
 S LOC=$$SAVE^VPRJDS(.DATA)
 K DATA,LOC
 D GETDATA^VPRJTX("TEST4","VPRJTD01",.DATA)
 S LOC=$$SAVE^VPRJDS(.DATA)
 K DATA,LOC
 D GETDATA^VPRJTX("TEST5","VPRJTD01",.DATA)
 S LOC=$$SAVE^VPRJDS(.DATA)
 K DATA,LOC
 D GETDATA^VPRJTX("TEST6","VPRJTD01",.DATA)
 S LOC=$$SAVE^VPRJDS(.DATA)
 K DATA,LOC
 D GETDATA^VPRJTX("TEST7","VPRJTD01",.DATA)
 S LOC=$$SAVE^VPRJDS(.DATA)
 K DATA,LOC
 D GETDATA^VPRJTX("LINK1","VPRJTD01",.DATA)
 S LOC=$$SAVE^VPRJDS(.DATA)
 ;
 QUIT
 ;
RIDXALL ;; @TEST reindexing all operational data indexes
 D BUILD
 ;
 D ASSERT(1,$D(^VPRJDX("attr","test-name","alpha ","798789799542=","urn:va:test:1",1)))
 D ASSERT(1,$D(^VPRJDX("attr","test-name","omega ","798789768244=","urn:va:test:7",1)))
 D ASSERT(1,$D(^VPRJDX("attr","utest-name","alpha ","urn:va:test:1",1)))
 D ASSERT(1,$D(^VPRJDX("attr","utest-name","omega ","urn:va:test:7",1)))
 D ASSERT(1,$D(^VPRJDX("rev","urn:va:test:2","utest-ods","urn:va:utestods:1","items#1")))
 D ASSERT(1,^VPRJDX("tally","test-name-count","alpha"))
 D ASSERT(2,^VPRJDX("tally","test-name-count","delta"))
 D ASSERT(7,^VPRJDX("count","collection","test"))
 ;
 D RIDXALL^VPRJ2D
 ;
 D ASSERT(1,$D(^VPRJDX("attr","test-name","alpha ","798789799542=","urn:va:test:1",1)))
 D ASSERT(1,$D(^VPRJDX("attr","test-name","omega ","798789768244=","urn:va:test:7",1)))
 D ASSERT(1,$D(^VPRJDX("attr","utest-name","alpha ","urn:va:test:1",1)))
 D ASSERT(1,$D(^VPRJDX("attr","utest-name","omega ","urn:va:test:7",1)))
 D ASSERT(1,$D(^VPRJDX("rev","urn:va:test:2","utest-ods","urn:va:utestods:1","items#1")))
 D ASSERT(1,^VPRJDX("tally","test-name-count","alpha"))
 D ASSERT(2,^VPRJDX("tally","test-name-count","delta"))
 D ASSERT(7,^VPRJDX("count","collection","test"))
 ;
 QUIT
 ;
RIDXONE ;; @TEST reindexing one operational data index
 D BUILD
 ;
 D ASSERT(1,$D(^VPRJDX("attr","test-name","alpha ","798789799542=","urn:va:test:1",1)))
 D ASSERT(1,$D(^VPRJDX("attr","test-name","omega ","798789768244=","urn:va:test:7",1)))
 D ASSERT(1,$D(^VPRJDX("attr","utest-name","alpha ","urn:va:test:1",1)))
 D ASSERT(1,$D(^VPRJDX("attr","utest-name","omega ","urn:va:test:7",1)))
 D ASSERT(1,$D(^VPRJDX("rev","urn:va:test:2","utest-ods","urn:va:utestods:1","items#1")))
 D ASSERT(1,^VPRJDX("tally","test-name-count","alpha"))
 D ASSERT(2,^VPRJDX("tally","test-name-count","delta"))
 D ASSERT(7,^VPRJDX("count","collection","test"))
 ;
 D RIDXALL^VPRJ2D("test-name")
 ;
 D ASSERT(1,$D(^VPRJDX("attr","test-name","alpha ","798789799542=","urn:va:test:1",1)))
 D ASSERT(1,$D(^VPRJDX("attr","test-name","omega ","798789768244=","urn:va:test:7",1)))
 D ASSERT(1,$D(^VPRJDX("attr","utest-name","alpha ","urn:va:test:1",1)))
 D ASSERT(1,$D(^VPRJDX("attr","utest-name","omega ","urn:va:test:7",1)))
 D ASSERT(1,$D(^VPRJDX("rev","urn:va:test:2","utest-ods","urn:va:utestods:1","items#1")))
 D ASSERT(1,^VPRJDX("tally","test-name-count","alpha"))
 D ASSERT(2,^VPRJDX("tally","test-name-count","delta"))
 D ASSERT(7,^VPRJDX("count","collection","test"))
 ;
 QUIT
 ;
RIDXSOME ;; @TEST reindexing some operational data indexes
 D BUILD
 ;
 D ASSERT(1,$D(^VPRJDX("attr","test-name","alpha ","798789799542=","urn:va:test:1",1)))
 D ASSERT(1,$D(^VPRJDX("attr","test-name","omega ","798789768244=","urn:va:test:7",1)))
 D ASSERT(1,$D(^VPRJDX("attr","utest-name","alpha ","urn:va:test:1",1)))
 D ASSERT(1,$D(^VPRJDX("attr","utest-name","omega ","urn:va:test:7",1)))
 D ASSERT(1,$D(^VPRJDX("rev","urn:va:test:2","utest-ods","urn:va:utestods:1","items#1")))
 D ASSERT(1,^VPRJDX("tally","test-name-count","alpha"))
 D ASSERT(2,^VPRJDX("tally","test-name-count","delta"))
 D ASSERT(7,^VPRJDX("count","collection","test"))
 ;
 D RIDXALL^VPRJ2D("test-name,utest-name")
 ;
 D ASSERT(1,$D(^VPRJDX("attr","test-name","alpha ","798789799542=","urn:va:test:1",1)))
 D ASSERT(1,$D(^VPRJDX("attr","test-name","omega ","798789768244=","urn:va:test:7",1)))
 D ASSERT(1,$D(^VPRJDX("attr","utest-name","alpha ","urn:va:test:1",1)))
 D ASSERT(1,$D(^VPRJDX("attr","utest-name","omega ","urn:va:test:7",1)))
 D ASSERT(1,$D(^VPRJDX("rev","urn:va:test:2","utest-ods","urn:va:utestods:1","items#1")))
 D ASSERT(1,^VPRJDX("tally","test-name-count","alpha"))
 D ASSERT(2,^VPRJDX("tally","test-name-count","delta"))
 D ASSERT(7,^VPRJDX("count","collection","test"))
 ;
 QUIT

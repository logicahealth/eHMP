package org.opencds.service.HEDIS_2015_0;

import org.opencds.service.util.OpencdsClient
import org.opencds.service.util.VMRUtil

import spock.lang.Specification
import spock.lang.Unroll

public class Hedis_v2015_0_0_MPM_FunctionalSpec extends Specification 
{
	//missing DOB
	private static final String VMR000 = "src/test/resources/samples/hedis-mpm/Empty0001.xml" 
    private static final Map MEAS000 = [C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C3346: [num: 0, denom: 0]]
	private static final Map ASRT000 = [C529: '', C569: '', reject: '']
	
    //20 + 180 days wrong drugs, no tests
	private static final String VMR001 = "src/test/resources/samples/hedis-mpm/MPM0001.xml" 
    private static final Map MEAS001 = [C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C3346: [num: 0, denom: 0]]
	private static final Map ASRT001 = [:]
	
	//ace-i/arb 179 days NDC + 180 UUHC, no tests
	private static final String VMR002 = "src/test/resources/samples/hedis-mpm/MPM0002.xml" 
	private static final Map MEAS002 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 1]]
	private static final Map ASRT002 = [:]
	
	//ace-i/arb 20 days NDC + 160 NDC, no tests
	private static final String VMR003 = "src/test/resources/samples/hedis-mpm/MPM0003.xml" 
	private static final Map MEAS003 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 1]]
	private static final Map ASRT003 = [:]
	
	//ace-i/arb 20 days + 60 + 120 NDC -30 days overlap, no tests
	private static final String VMR004 = "src/test/resources/samples/hedis-mpm/MPM0004.xml" 
	private static final Map MEAS004 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT004 = [:]

	//ace-i/arb 180 days NDC, lab panel CPT
	private static final String VMR005 = "src/test/resources/samples/hedis-mpm/MPM0005.xml" 
	private static final Map MEAS005 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 1, denom: 1], C3344: [num: 1, denom: 1]]
	private static final Map ASRT005 = [:]

	//ace-i/arb 180 days NDC, potassium LOINC, creatinine LOINC
	private static final String VMR006 = "src/test/resources/samples/hedis-mpm/MPM0006.xml" 
	private static final Map MEAS006 = [ C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 1, denom: 1], C3344: [num: 1, denom: 1]]
	private static final Map ASRT006 = [:]

	//ace-i/arb 180 days NDC, potassium LOINC, blood urea LOINC
	private static final String VMR007 = "src/test/resources/samples/hedis-mpm/MPM0007.xml" 
	private static final Map MEAS007 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 1]]
	private static final Map ASRT007 = [:]

	//ace-i/arb 180 days NDC, creatinine LOINC, blood urea LOINC
	private static final String VMR008 = "src/test/resources/samples/hedis-mpm/MPM0008.xml" 
	private static final Map MEAS008 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 1]]
	private static final Map ASRT008 = [:]

	//ace-i/arb 180 days NDC, potassium LOINC, blood urea CPT
	private static final String VMR009 = "src/test/resources/samples/hedis-mpm/MPM0009.xml" 
	private static final Map MEAS009 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 1]]
	private static final Map ASRT009 = [:]

	//180 days ace-i/arb, creatinine LOINC, blood urea CPT
	private static final String VMR010 = "src/test/resources/samples/hedis-mpm/MPM0010.xml" 
	private static final Map MEAS010 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 1]]
	private static final Map ASRT010 = [:]

	//179 days digoxin
	private static final String VMR011 = "src/test/resources/samples/hedis-mpm/MPM0011.xml" 
	private static final Map MEAS011 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT011 = [:]

	//179 days + 1 day digoxin
	private static final String VMR012 = "src/test/resources/samples/hedis-mpm/MPM0012.xml" 
	private static final Map MEAS012 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 1], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT012 = [:]

	//180 days digoxin + lab panel
	private static final String VMR013 = "src/test/resources/samples/hedis-mpm/MPM0013.xml" 
	private static final Map MEAS013 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 1], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT013 = [:]

	//180 days digoxin + potassium
	private static final String VMR014 = "src/test/resources/samples/hedis-mpm/MPM0014.xml" 
	private static final Map MEAS014 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 1], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT014 = [:]

	//180 days digoxin + potassium + creatinine
	private static final String VMR015 = "src/test/resources/samples/hedis-mpm/MPM0015.xml" 
	private static final Map MEAS015 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 1], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT015 = [:]

	//180 days digoxin + potassium + blood urea
	private static final String VMR016 = "src/test/resources/samples/hedis-mpm/MPM0016.xml" 
	private static final Map MEAS016 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 1], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT016 = [:]

	//180 days digoxin + creatinine + blood urea
	private static final String VMR017 = "src/test/resources/samples/hedis-mpm/MPM0017.xml" 
	private static final Map MEAS017 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 1], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT017 = [:]

	//180 days digoxin + potassium + blood urea CPT
	private static final String VMR018 = "src/test/resources/samples/hedis-mpm/MPM0018.xml" 
	private static final Map MEAS018 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 1], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT018 = [:]

	//180 days digoxin + creatinine + blood urea CPT
	private static final String VMR019 = "src/test/resources/samples/hedis-mpm/MPM0019.xml" 
	private static final Map MEAS019 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 1], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT019 = [:]

	//180 days digoxin + potassium CPT + creatinine CPT
	private static final String VMR020 = "src/test/resources/samples/hedis-mpm/MPM0020.xml" 
	private static final Map MEAS020 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 1], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT020 = [:]

	//179 days diuretics
	private static final String VMR021 = "src/test/resources/samples/hedis-mpm/MPM0021.xml" 
	private static final Map MEAS021 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT021 = [:]

	//180 days diuretics
	private static final String VMR022 = "src/test/resources/samples/hedis-mpm/MPM0022.xml" 
	private static final Map MEAS022 = [C3346: [num: 0, denom: 1], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT022 = [:]

	//180 days diuretics + lab panel
	private static final String VMR023 = "src/test/resources/samples/hedis-mpm/MPM0023.xml" 
	private static final Map MEAS023 = [C3346: [num: 1, denom: 1], C3345: [num: 0, denom: 0], C2619: [num: 1, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT023 = [:]

	//180 days diuretics + potassium
	private static final String VMR024 = "src/test/resources/samples/hedis-mpm/MPM0024.xml" 
	private static final Map MEAS024 = [C3346: [num: 0, denom: 1], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT024 = [:]

	//180 days diuretics + potassium + creatinine
	private static final String VMR025 = "src/test/resources/samples/hedis-mpm/MPM0025.xml" 
	private static final Map MEAS025 = [C3346: [num: 1, denom: 1], C3345: [num: 0, denom: 0], C2619: [num: 1, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT025 = [:]

	//180 days diuretics + potassium + blood urea
	private static final String VMR026 = "src/test/resources/samples/hedis-mpm/MPM0026.xml" 
	private static final Map MEAS026 = [C3346: [num: 0, denom: 1], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT026 = [:]

	//180 days diuretics + creatinine + blood urea
	private static final String VMR027 = "src/test/resources/samples/hedis-mpm/MPM0027.xml" 
	private static final Map MEAS027 = [C3346: [num: 0, denom: 1], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT027 = [:]

	//180 days diuretics + potassium + blood urea CPT
	private static final String VMR028 = "src/test/resources/samples/hedis-mpm/MPM0028.xml" 
	private static final Map MEAS028 = [C3346: [num: 0, denom: 1], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT028 = [:]

	//180 days diuretics + creatinine + blood urea CPT
	private static final String VMR029 = "src/test/resources/samples/hedis-mpm/MPM0029.xml" 
	private static final Map MEAS029 = [C3346: [num: 0, denom: 1], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT029 = [:]

	//180 days diuretics + potassium CPT + creatinine CPT
	private static final String VMR030 = "src/test/resources/samples/hedis-mpm/MPM0030.xml" 
	private static final Map MEAS030 = [C3346: [num: 1, denom: 1], C3345: [num: 0, denom: 0], C2619: [num: 1, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT030 = [:]

	//180 days ace/arb, digoxin, diuretics, fire num-denoms for all 3 of them
	private static final String VMR031 = "src/test/resources/samples/hedis-mpm/MPM0031.xml" 
	private static final Map MEAS031 = [C3346: [num: 1, denom: 1], C3345: [num: 1, denom: 1], /*C2619: [num: 3, denom: 3],*/ C3344: [num: 1, denom: 1]]
	private static final Map ASRT031 = [:]
	
	//180 days barbit, dibenzaz, hydantoin, misc, fire num-denoms for all 4 of them
	private static final String VMR032 = "src/test/resources/samples/hedis-mpm/MPM0032.xml" 
	private static final Map MEAS032 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT032 = [:]

	//179 days barbit 
	private static final String VMR033 = "src/test/resources/samples/hedis-mpm/MPM0033.xml" 
	private static final Map MEAS033 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT033 = [:]

	//180 days barbit
	private static final String VMR034 = "src/test/resources/samples/hedis-mpm/MPM0034.xml" 
	private static final Map MEAS034 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT034 = [:]

	//180 days barbit, barbit loinc
	private static final String VMR035 = "src/test/resources/samples/hedis-mpm/MPM0035.xml" 
	private static final Map MEAS035 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT035 = [:]

	//180 days barbit, barbit CPT
	private static final String VMR036 = "src/test/resources/samples/hedis-mpm/MPM0036.xml" 
	private static final Map MEAS036 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT036 = [:]

	//179 days dibenzaz
	private static final String VMR037 = "src/test/resources/samples/hedis-mpm/MPM0037.xml" 
	private static final Map MEAS037 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT037 = [:]

	//180 days dibenzaz
	private static final String VMR038 = "src/test/resources/samples/hedis-mpm/MPM0038.xml" 
	private static final Map MEAS038 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT038 = [:]

	//180 days dibenzaz, dibenzaz loinc
	private static final String VMR039 = "src/test/resources/samples/hedis-mpm/MPM0039.xml" 
	private static final Map MEAS039 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT039 = [:]

	//180 days dibenzaz, dibenzaz CPT
	private static final String VMR040 = "src/test/resources/samples/hedis-mpm/MPM0040.xml" 
	private static final Map MEAS040 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT040 = [:]

	//179 days hydantoin
	private static final String VMR041 = "src/test/resources/samples/hedis-mpm/MPM0041.xml" 
	private static final Map MEAS041 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT041 = [:]

	//180 days hydantoin
	private static final String VMR042 = "src/test/resources/samples/hedis-mpm/MPM0042.xml" 
	private static final Map MEAS042 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT042 = [:]

	//180 days hydantoin, hydantoin loinc
	private static final String VMR043 = "src/test/resources/samples/hedis-mpm/MPM0043.xml" 
	private static final Map MEAS043 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT043 = [:]

	//180 days hydantoin, hydantoin CPT
	private static final String VMR044 = "src/test/resources/samples/hedis-mpm/MPM0044.xml" 
	private static final Map MEAS044 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT044 = [:]
	
	//179 days misc
	private static final String VMR045 = "src/test/resources/samples/hedis-mpm/MPM0045.xml" 
	private static final Map MEAS045 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT045 = [:]
	
	//180 days misc
	private static final String VMR046 = "src/test/resources/samples/hedis-mpm/MPM0046.xml" 
	private static final Map MEAS046 = [C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C2619: [num: 0, denom: 0], C3344: [num: 0, denom: 0]]
	private static final Map ASRT046 = [:]
	
	//180 days misc, misc loinc
	private static final String VMR047 = "src/test/resources/samples/hedis-mpm/MPM0047.xml" 
	private static final Map MEAS047 = [C3344: [num: 0, denom: 0], C3345: [num: 0, denom: 0], C3346: [num: 0, denom: 0]/*, C2619: [num: 0, denom: 0]*/]
	private static final Map ASRT047 = [:]
	
	//180 days misc, misc cpt
	private static final String VMR048 = "src/test/resources/samples/hedis-mpm/MPM0048.xml" 
	private static final Map MEAS048 = [C3344: [num: 0, denom: 0], C3346: [num: 0, denom: 0], C3345: [num: 0, denom: 0]/*, C2619: [num: 0, denom: 0]*/]
	private static final Map ASRT048 = [:]
	
	//180 days digoxin + lab panel CPT + serum digoxin CPT
	private static final String VMR049 = "src/test/resources/samples/hedis-mpm/MPM0049.xml"
	private static final Map MEAS049 = [C3346: [num: 0, denom: 0], C3345: [num: 1, denom: 1], C2619: [num: 1, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT049 = [:]

	//180 days digoxin + potassium CPT + creatinine CPT + serum digoxin CPT
	private static final String VMR050 = "src/test/resources/samples/hedis-mpm/MPM0050.xml"
	private static final Map MEAS050 = [C3346: [num: 0, denom: 0], C3345: [num: 1, denom: 1], C2619: [num: 1, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT050 = [:]

	//180 days digoxin + creatinine CPT + serum digoxin CPT
	private static final String VMR051 = "src/test/resources/samples/hedis-mpm/MPM0051.xml" 
	private static final Map MEAS051 = [C3346: [num: 0, denom: 0], C3345: [num: 1, denom: 1], C2619: [num: 1, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT051 = [:]

	//180 days digoxin + potassium LOINC + creatinine LOINC + serum digoxin LOINC
	private static final String VMR052 = "src/test/resources/samples/hedis-mpm/MPM0052.xml" 
	private static final Map MEAS052 = [C3346: [num: 0, denom: 0], C3345: [num: 1, denom: 1], C2619: [num: 1, denom: 1], C3344: [num: 0, denom: 0]]
	private static final Map ASRT052 = [:]
	
	//180 days ace/arb, digoxin, diuretics, anticonvulsants: fire num-denoms for all of them
	private static final String VMR098 = "src/test/resources/samples/hedis-mpm/MPM0099.xml"
	private static final Map MEAS098 = [C3344: [num: 1, denom: 1], C3345: [num: 1, denom: 1], C3346: [num: 1, denom: 1], C2619: [num: 3, denom: 3]]
	private static final Map ASRT098 = [:]

	//180 days ace/arb, digoxin, diuretics, anticonvulsants: fire num-denoms for all of them
	private static final String VMR099 = "src/test/resources/samples/hedis-mpm/MPM0099.xml" 
	private static final Map MEAS099 = [C3344: [num: 1, denom: 1], C3345: [num: 1, denom: 1], C3346: [num: 1, denom: 1], C2619: [num: 3, denom: 3]]
	private static final Map ASRT099 = [:]

	
/*
	C2619: QM HEDIS-MPM Annual Mon. Persistent Meds
Concepts:
	C2850: diuretics
	C2852: digoxin
	C3230: barbiturates
	C3231: dibenzazepine
	C3232: hydantoin
	C3233: misc anticonvulsant
	C3261: ace-i / arb
	
	revised expectations for v2015.0.0:
C2619: QM HEDIS-MPM Annual Mon. Persistent Meds (C2619) for the total total (max 7/7)
C3347: QM HEDIS-MPM Annual Mon. Persistent Meds - Anticonvulsants (C3347) for the anticonvulsant total (max 4/4)

Note that the table-based Apelon concepts now use the QM HEDIS-based concepts:
C3356: QM HEDIS-MPM Annual Mon. Persistent Meds - Anticonvulsants-Barbiturate    C3356
C3357: QM HEDIS-MPM Annual Mon. Persistent Meds - Anticonvulsants-Dibenzazepine  C3357
C3358: QM HEDIS-MPM Annual Mon. Persistent Meds - Anticonvulsants-Hydantoin  C3358
C3359: QM HEDIS-MPM Annual Mon. Persistent Meds - Anticonvulsants-Miscellaneous C3359

C3344: QM HEDIS-MPM Annual Mon. Persistent Meds - ACE Inhibitor/ARB C3344
C3345: QM HEDIS-MPM Annual Mon. Persistent Meds - Digoxin C3345
C3346: QM HEDIS-MPM Annual Mon. Persistent Meds - Diuretics C3346

*/
	@Unroll
	def "test HEDIS MPM 2015.0.0"() 
	{
		when:
		def input = new File(vmr).text
		def params = [
			kmEvaluationRequest:[scopingEntityId: 'edu.utah', businessId: 'HEDIS_MPM', version: '2015.0.0'],
			specifiedTime: '2012-01-01'
		]
		def responsePayload = OpencdsClient.sendEvaluateAtSpecifiedTimeMessage(params, input)
//		comment the following line out before committing fully tested functionalSpec to reduce useless messages during normal builds
//		println responsePayload

		then:
		def data = new XmlSlurper().parseText(responsePayload)
		def results = VMRUtil.getResults(data, '\\|')
		
//		comment the following lines out before committing fully tested functionalSpec to reduce useless messages during normal builds
		results.measures.each {entry ->
//			System.err.println "${entry.key} -> ${entry.value.num} ${entry.value.denom}"
		}
		results.assertions.each {entry ->
			System.err.println "${entry.key} -> ${entry.value}"
		}
		
//		  assertions.size() == results.assertions.size() 
		
//        measures.size() == results.measures.size()
		
		measuresList.each {entry ->
			assert results.measuresList.get(entry.key).num == entry.value.num
			assert results.measuresList.get(entry.key).denom == entry.value.denom
		}
	
			where:
			vmr | measuresList | assertions 
			
		VMR000 | MEAS000  | ASRT000 
		VMR001 | MEAS001  | ASRT001
		VMR002 | MEAS002  | ASRT002
		VMR003 | MEAS003  | ASRT003
		VMR004 | MEAS004  | ASRT004
		VMR005 | MEAS005  | ASRT005
		VMR006 | MEAS006  | ASRT006
		VMR007 | MEAS007  | ASRT007
		VMR008 | MEAS008  | ASRT008
		VMR009 | MEAS009  | ASRT009
		VMR010 | MEAS010  | ASRT010
		VMR011 | MEAS011  | ASRT011
		VMR012 | MEAS012  | ASRT012
		VMR013 | MEAS013  | ASRT013
		VMR014 | MEAS014  | ASRT014
		VMR015 | MEAS015  | ASRT015
		VMR016 | MEAS016  | ASRT016
		VMR017 | MEAS017  | ASRT017
		VMR018 | MEAS018  | ASRT018
		VMR019 | MEAS019  | ASRT019
		VMR020 | MEAS020  | ASRT020
		VMR021 | MEAS021  | ASRT021
		VMR022 | MEAS022  | ASRT022
		VMR023 | MEAS023  | ASRT023
		VMR024 | MEAS024  | ASRT024
		VMR025 | MEAS025  | ASRT025
		VMR026 | MEAS026  | ASRT026
		VMR027 | MEAS027  | ASRT027
		VMR028 | MEAS028  | ASRT028
		VMR029 | MEAS029  | ASRT029
		VMR030 | MEAS030  | ASRT030
		VMR031 | MEAS031  | ASRT031
		VMR032 | MEAS032  | ASRT032
		VMR033 | MEAS033  | ASRT033
		VMR034 | MEAS034  | ASRT034
		VMR035 | MEAS035  | ASRT035
		VMR036 | MEAS036  | ASRT036
		VMR037 | MEAS037  | ASRT037
		VMR038 | MEAS038  | ASRT038
		VMR039 | MEAS039  | ASRT039
		VMR040 | MEAS040  | ASRT040
		VMR041 | MEAS041  | ASRT041
		VMR042 | MEAS042  | ASRT042
		VMR043 | MEAS043  | ASRT043
		VMR044 | MEAS044  | ASRT044
		VMR045 | MEAS045  | ASRT045
		VMR046 | MEAS046  | ASRT046
		VMR047 | MEAS047  | ASRT047
		VMR048 | MEAS048  | ASRT048
		VMR049 | MEAS049  | ASRT049
		VMR050 | MEAS050  | ASRT050
		VMR051 | MEAS051  | ASRT052
		VMR052 | MEAS052  | ASRT052
				
		VMR098 | MEAS098  | ASRT098
		VMR099 | MEAS099  | ASRT099
		
	}
}

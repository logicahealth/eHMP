import org.junit.Test
import static org.junit.Assert.*

class CoberturaTest {
    @Test
    public void checkShouldFailCauseNewClassHasCoverageRateBelowDefault() {
        Cobertura cobertura = new Cobertura()

        def thresholds = null

        def report = new XmlParser().parseText('''<?xml version="1.0" encoding="UTF-8"?>
<coverage>
	<packages>
		<package>
			<classes>
				<class name="us.vistacore.leipr.leiprApplication" filename="us/vistacore/leipr/leiprApplication.java" line-rate="0.2" branch-rate="1.0" complexity="1.0">
					<lines>
						<line number="1" hits="0" branch="false"/>
						<line number="2" hits="0" branch="false"/>
						<line number="3" hits="0" branch="false"/>
						<line number="4" hits="0" branch="false"/>
						<line number="5" hits="0" branch="false"/>
						<line number="6" hits="0" branch="false"/>
						<line number="7" hits="0" branch="false"/>
						<line number="8" hits="0" branch="false"/>
						<line number="9" hits="0" branch="false"/>
						<line number="10" hits="0" branch="false"/>
					</lines>
				</class>
			</classes>
		</package>
	</packages>
</coverage>''')

        def projectName = 'leipr'
        def defaultBranchrate = 80
        def defaultLinerate = 80

        def buffer = new ByteArrayOutputStream()
        def newErr = new PrintStream(buffer)
        def saveErr = System.err

        System.err = newErr
        try {
            cobertura.check(projectName, thresholds, report, defaultBranchrate, defaultLinerate)
            fail('Should have failed coverage check.')
        }
        catch (Exception e) {
            System.err = saveErr
            //expect this to happen
            e.printStackTrace()
        }

        assertEquals('''Project leipr, Class us.vistacore.leipr.leiprApplication failed check. Line coverage rate of 20% is below 80%.
''', buffer.toString())
    }

    @Test
    public void checkShouldSuceedCauseNewCodeWasCoveredWithAdequateTesting() {
        Cobertura cobertura = new Cobertura()

        def thresholds = new XmlParser().parseText('''<?xml version="1.0" encoding="UTF-8"?>
<thresholds>
  <threshold class="us.vistacore.leipr.leiprApplication" branchcount="0" branchsexecuted="0" branchrate="1.0" linecount="10" linesexecuted="4" linerate="0.4"/>
</thresholds>''')

        def report = new XmlParser().parseText('''<?xml version="1.0" encoding="UTF-8"?>
<coverage>
	<packages>
		<package>
			<classes>
				<class name="us.vistacore.leipr.leiprApplication" filename="us/vistacore/leipr/leiprApplication.java" line-rate="0.7" branch-rate="1.0" complexity="1.0">
					<lines>
						<line number="1" hits="0" branch="false"/>
						<line number="2" hits="0" branch="false"/>
						<line number="3" hits="0" branch="false"/>
						<line number="4" hits="0" branch="false"/>
						<line number="5" hits="0" branch="false"/>
						<line number="6" hits="0" branch="false"/>
						<line number="7" hits="0" branch="false"/>
						<line number="8" hits="0" branch="false"/>
						<line number="9" hits="0" branch="false"/>
						<line number="10" hits="0" branch="false"/>
						<line number="11" hits="0" branch="false"/>
						<line number="12" hits="0" branch="false"/>
						<line number="13" hits="0" branch="false"/>
						<line number="14" hits="0" branch="false"/>
						<line number="15" hits="0" branch="false"/>
						<line number="16" hits="0" branch="false"/>
						<line number="17" hits="0" branch="false"/>
						<line number="18" hits="0" branch="false"/>
						<line number="19" hits="0" branch="false"/>
						<line number="20" hits="0" branch="false"/>
					</lines>
				</class>
			</classes>
		</package>
	</packages>
</coverage>''')

        def projectName = 'leipr'
        def defaultBranchrate = 80
        def defaultLinerate = 80

        def buffer = new ByteArrayOutputStream()
        def newErr = new PrintStream(buffer)
        def saveErr = System.err

        System.err = newErr
        def shouldSave = cobertura.check(projectName, thresholds, report, defaultBranchrate, defaultLinerate)

        def threshold = thresholds.threshold.find { it.@class == 'us.vistacore.leipr.leiprApplication' }
        println "threshold.@linerate ${threshold.@linerate}"
        assertEquals(0.7, threshold.@linerate, 0)
        assertEquals(14, threshold.@linesexecuted)
        assertEquals(20, threshold.@linecount)
        assertTrue('Expected flag to save thresholds file to be set to true.', shouldSave)
        assertEquals('', buffer.toString())
    }

    @Test
    public void checkShouldFailCauseNewCodeLoweredCoverageRateBelowExistingThreshold() {
        Cobertura cobertura = new Cobertura()

        def thresholds = new XmlParser().parseText('''<?xml version="1.0" encoding="UTF-8"?>
<thresholds>
  <threshold class="us.vistacore.leipr.leiprApplication" branchcount="0" branchsexecuted="0" branchrate="1.0" linecount="10" linesexecuted="0" linerate="0.0"/>
</thresholds>''')

        def report = new XmlParser().parseText('''<?xml version="1.0" encoding="UTF-8"?>
<coverage>
	<packages>
		<package>
			<classes>
				<class name="us.vistacore.leipr.leiprApplication" filename="us/vistacore/leipr/leiprApplication.java" line-rate="0.2" branch-rate="1.0" complexity="1.0">
					<lines>
						<line number="1" hits="0" branch="false"/>
						<line number="2" hits="0" branch="false"/>
						<line number="3" hits="0" branch="false"/>
						<line number="4" hits="0" branch="false"/>
						<line number="5" hits="0" branch="false"/>
						<line number="6" hits="0" branch="false"/>
						<line number="7" hits="0" branch="false"/>
						<line number="8" hits="0" branch="false"/>
						<line number="9" hits="0" branch="false"/>
						<line number="10" hits="0" branch="false"/>
						<line number="11" hits="0" branch="false"/>
						<line number="12" hits="0" branch="false"/>
						<line number="13" hits="0" branch="false"/>
						<line number="14" hits="0" branch="false"/>
						<line number="15" hits="0" branch="false"/>
						<line number="16" hits="0" branch="false"/>
						<line number="17" hits="0" branch="false"/>
						<line number="18" hits="0" branch="false"/>
						<line number="19" hits="0" branch="false"/>
						<line number="20" hits="0" branch="false"/>
					</lines>
				</class>
			</classes>
		</package>
	</packages>
</coverage>''')

        def projectName = 'leipr'
        def defaultBranchrate = 80
        def defaultLinerate = 80

        def buffer = new ByteArrayOutputStream()
        def newErr = new PrintStream(buffer)
        def saveErr = System.err

        System.err = newErr
        try {
            cobertura.check(projectName, thresholds, report, defaultBranchrate, defaultLinerate)
            fail('Should have failed coverage check.')
        }
        catch (Exception e) {
            System.err = saveErr
            //expect this to happen
            e.printStackTrace()
        }

        def threshold = thresholds.threshold.find { it.@class == 'us.vistacore.leipr.leiprApplication' }
        assertEquals(0.4, threshold.@linerate)
        assertEquals(8, threshold.@linesexecuted)
        assertEquals(20, threshold.@linecount)

        assertEquals('''Project leipr, Class us.vistacore.leipr.leiprApplication failed check. Line coverage rate of 20% is below 40%.
''', buffer.toString())
    }

    @Test
    public void checkShouldSucceed() {
        Cobertura cobertura = new Cobertura()

        def thresholds = new XmlParser().parseText('''<?xml version="1.0" encoding="UTF-8"?>
<thresholds>
  <threshold class="us.vistacore.leipr.leiprApplication" branchcount="0" branchsexecuted="0" branchrate="1.0" linecount="10" linesexecuted="0" linerate="0.0"/>
</thresholds>''')

        def report = new XmlParser().parseText('''<?xml version="1.0" encoding="UTF-8"?>
<coverage>
	<packages>
		<package>
			<classes>
				<class name="us.vistacore.leipr.leiprApplication" filename="us/vistacore/leipr/leiprApplication.java" line-rate="0.4" branch-rate="1.0" complexity="1.0">
					<lines>
						<line number="1" hits="0" branch="false"/>
						<line number="2" hits="0" branch="false"/>
						<line number="3" hits="0" branch="false"/>
						<line number="4" hits="0" branch="false"/>
						<line number="5" hits="0" branch="false"/>
						<line number="6" hits="0" branch="false"/>
						<line number="7" hits="0" branch="false"/>
						<line number="8" hits="0" branch="false"/>
						<line number="9" hits="0" branch="false"/>
						<line number="10" hits="0" branch="false"/>
						<line number="11" hits="0" branch="false"/>
						<line number="12" hits="0" branch="false"/>
						<line number="13" hits="0" branch="false"/>
						<line number="14" hits="0" branch="false"/>
						<line number="15" hits="0" branch="false"/>
						<line number="16" hits="0" branch="false"/>
						<line number="17" hits="0" branch="false"/>
						<line number="18" hits="0" branch="false"/>
						<line number="19" hits="0" branch="false"/>
						<line number="20" hits="0" branch="false"/>
					</lines>
				</class>
			</classes>
		</package>
	</packages>
</coverage>''')

        def projectName = 'leipr'
        def defaultBranchrate = 80
        def defaultLinerate = 80

        def buffer = new ByteArrayOutputStream()
        def newErr = new PrintStream(buffer)
        def saveErr = System.err

        System.err = newErr
        def shouldSave = cobertura.check(projectName, thresholds, report, defaultBranchrate, defaultLinerate)
        System.err = saveErr

        def threshold = thresholds.threshold.find { it.@class == 'us.vistacore.leipr.leiprApplication' }
        assertEquals(0.4, threshold.@linerate)
        assertEquals(8, threshold.@linesexecuted)
        assertEquals(20, threshold.@linecount)
        assertTrue('Expected flag to save thresholds file to be set to true.', shouldSave)
        assertEquals('', buffer.toString())
    }

    @Test
    public void checkShouldFailWithRemovedCode() {
        Cobertura cobertura = new Cobertura()

        def thresholds = new XmlParser().parseText('''<?xml version="1.0" encoding="UTF-8"?>
<thresholds>
  <threshold class="us.vistacore.leipr.leiprApplication" branchcount="0" branchsexecuted="0" branchrate="1.0" linecount="100" linesexecuted="40" linerate="0.4"/>
</thresholds>''')

        def report = new XmlParser().parseText('''<?xml version="1.0" encoding="UTF-8"?>
<coverage>
	<packages>
		<package>
			<classes>
				<class name="us.vistacore.leipr.leiprApplication" filename="us/vistacore/leipr/leiprApplication.java" line-rate="0.4" branch-rate="1.0" complexity="1.0">
					<lines>
						<line number="1" hits="0" branch="false"/>
						<line number="2" hits="0" branch="false"/>
						<line number="3" hits="0" branch="false"/>
						<line number="4" hits="0" branch="false"/>
						<line number="5" hits="0" branch="false"/>
						<line number="6" hits="0" branch="false"/>
						<line number="7" hits="0" branch="false"/>
						<line number="8" hits="0" branch="false"/>
						<line number="9" hits="0" branch="false"/>
						<line number="10" hits="0" branch="false"/>
						<line number="11" hits="0" branch="false"/>
						<line number="12" hits="0" branch="false"/>
						<line number="13" hits="0" branch="false"/>
						<line number="14" hits="0" branch="false"/>
						<line number="15" hits="0" branch="false"/>
						<line number="16" hits="0" branch="false"/>
						<line number="17" hits="0" branch="false"/>
						<line number="18" hits="0" branch="false"/>
						<line number="19" hits="0" branch="false"/>
						<line number="20" hits="0" branch="false"/>
					</lines>
				</class>
			</classes>
		</package>
	</packages>
</coverage>''')

        def projectName = 'leipr'
        def defaultBranchrate = 80
        def defaultLinerate = 80

        def buffer = new ByteArrayOutputStream()
        def newErr = new PrintStream(buffer)
        def saveErr = System.err

        System.err = newErr
        try {
            cobertura.check(projectName, thresholds, report, defaultBranchrate, defaultLinerate)
            fail('Should have failed coverage check.')
        }
        catch (Exception e) {
            System.err = saveErr
            //expect this to happen
            e.printStackTrace()
        }

        def threshold = thresholds.threshold.find { it.@class == 'us.vistacore.leipr.leiprApplication' }
        assertEquals(0.8, threshold.@linerate)
        assertEquals(16, threshold.@linesexecuted)
        assertEquals(20, threshold.@linecount)

        assertEquals('''Project leipr, Class us.vistacore.leipr.leiprApplication failed check. Line coverage rate of 40% is below 80%.
''', buffer.toString())
    }

    @Test
    public void lineStatisticsTest() {
        def report = new XmlParser().parseText('''<?xml version="1.0" encoding="UTF-8"?>
<coverage>
    <packages>
        <package>
            <classes>
                <class name="us.vistacore.leipr.leiprApplication" filename="us/vistacore/leipr/leiprApplication.java" line-rate="0.4" branch-rate="1.0" complexity="1.0">
                    <lines>
                        <line number="1" hits="1" branch="true" condition-coverage="25% (1/4)">
                            <conditions>
                                <condition number="0" type="switch" coverage="25%"/>
                            </conditions>
                        </line>
                        <line number="56" hits="1" branch="true" condition-coverage="50% (1/2)">
                            <conditions>
                                <condition number="0" type="jump" coverage="50%"/>
                            </conditions>
                        </line>
                    </lines>
                </class>
            </classes>
        </package>
    </packages>
</coverage>''')

        def (lineCount, linesExecuted, branchCount, branchesExecuted) = Cobertura.getLineStatistics(report.packages.package.classes.class.lines.line)
        assertEquals(2, lineCount)
        assertEquals(2, linesExecuted)
        assertEquals(6, branchCount)
        assertEquals(2, branchesExecuted)

    }
}

package us.vistacore.ehmp.command;

import com.google.common.collect.ImmutableList;
import com.google.gson.JsonElement;
import com.netflix.hystrix.Hystrix;
import com.netflix.hystrix.strategy.concurrency.HystrixRequestContext;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import us.vistacore.ehmp.ITestUtils;

import java.io.IOException;
import java.util.Collection;

@RunWith(Parameterized.class)
public class JdsSearchCommandITest {

    @Parameterized.Parameters
    public static Collection<Object[]> data() throws IOException {
        return ImmutableList.<Object[]>builder()
                .add(new Object[]{JdsSearchCommand.Index.PATIENT_NAME, 10, 0, new JdsSearchCommand.SearchFilter(JdsSearchCommand.Field.NAME, JdsSearchCommand.MatchType.CONTAINS, "eight"), JdsSearchCommand.ResultsRecordType.DEFAULT})
                .add(new Object[]{JdsSearchCommand.Index.PATIENT_NAME, 10, 0, new JdsSearchCommand.SearchFilter(JdsSearchCommand.Field.NAME, JdsSearchCommand.MatchType.CONTAINS, "ten"), JdsSearchCommand.ResultsRecordType.SUMMARY})
                .build();
    }

    /**
     * Parameterized instance variables
     */
    private JdsSearchCommand.Index index;
    private int limit;
    private int start;
    private JdsSearchCommand.SearchFilter searchFilter;
    private JdsSearchCommand.ResultsRecordType resultsRecordType;

    public JdsSearchCommandITest(JdsSearchCommand.Index index, int limit, int start, JdsSearchCommand.SearchFilter searchFilter, JdsSearchCommand.ResultsRecordType resultsRecordType) {
        this.index = index;
        this.limit = limit;
        this.start = start;
        this.searchFilter = searchFilter;
        this.resultsRecordType = resultsRecordType;
    }

    @Before
    public void setup() {
        Hystrix.reset();
        HystrixRequestContext.initializeContext();
    }

    @After
    public void tearDown() {
        HystrixRequestContext.getContextForCurrentThread().shutdown();
    }

    @SuppressWarnings("unused")
    @Test
    public void testReturnString() {
        JsonElement json = new JdsSearchCommand(ITestUtils.getJdsConfiguration(), this.index, this.limit, this.start, this.searchFilter).execute();
    }

    @SuppressWarnings("unused")
    @Test
    public void testReturnStringSummary() {
        JsonElement json = new JdsSearchCommand(ITestUtils.getJdsConfiguration(), this.index, this.limit, this.start, this.searchFilter, this.resultsRecordType).execute();
    }

}

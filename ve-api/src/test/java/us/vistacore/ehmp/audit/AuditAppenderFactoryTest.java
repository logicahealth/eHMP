package us.vistacore.ehmp.audit;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.FileAppender;
import ch.qos.logback.core.boolex.EventEvaluator;
import ch.qos.logback.core.filter.EvaluatorFilter;
import ch.qos.logback.core.filter.Filter;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.LoggerFactory;

import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

/**
 * Test class for AuditAppenderFactory
 */
public class AuditAppenderFactoryTest {

    private AuditAppenderFactory appenderFactory;

    @Before
    public void setup() {
        appenderFactory = new AuditAppenderFactory();
    }

    @Test
    public void testBuildAppender() {

        Logger root = (Logger) LoggerFactory.getLogger(org.slf4j.Logger.ROOT_LOGGER_NAME);
        LoggerContext context = root.getLoggerContext();

        appenderFactory.setCurrentLogFilename("test.log");
        appenderFactory.setArchive(true);
        appenderFactory.setArchivedLogFilenamePattern("test-%d.log");
        appenderFactory.setArchivedFileCount(1);
        FileAppender appender = appenderFactory.buildAppender(context);

        assertNotNull(appender);

        List<Filter<ILoggingEvent>> filters = appender.getCopyOfAttachedFiltersList();

        assertEquals(1, filters.size());

        Filter filter = filters.get(0);

        assertTrue(filter instanceof EvaluatorFilter);

        EventEvaluator evaluator = ((EvaluatorFilter)filter).getEvaluator();
    }
}

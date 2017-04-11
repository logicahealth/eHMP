package us.vistacore.ehmp.audit;

import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.boolex.OnMarkerEvaluator;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.FileAppender;
import ch.qos.logback.core.filter.EvaluatorFilter;
import ch.qos.logback.core.spi.FilterReply;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.dropwizard.logging.FileAppenderFactory;
import com.fasterxml.jackson.annotation.JsonTypeName;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

import javax.validation.constraints.Min;

/**
 *
 */
@JsonTypeName("audit")
public class AuditAppenderFactory extends FileAppenderFactory {

    public static final String AUDIT_MARKER_NAME = "AUDIT-MESSAGE";
    public static final Marker AUDIT_MARKER = MarkerFactory.getMarker(AuditAppenderFactory.AUDIT_MARKER_NAME);


    @Min(0)
    private int archivedFileCountOverride = 0;

    @JsonProperty
    public int getArchivedFileCountOverride() {
        return archivedFileCountOverride;
    }

    @JsonProperty
    public void setArchivedFileCountOverride(int archivedFileCountOverride) {
        this.archivedFileCountOverride = archivedFileCountOverride;
    }

    @Override
    protected FileAppender<ILoggingEvent> buildAppender(LoggerContext context) {

        setArchivedFileCount(archivedFileCountOverride);

        FileAppender<ILoggingEvent> appender = super.buildAppender(context);
        OnMarkerEvaluator evaluator = new OnMarkerEvaluator();
        EvaluatorFilter<ILoggingEvent> filter = new EvaluatorFilter<>();

        evaluator.addMarker(AUDIT_MARKER_NAME);
        filter.setEvaluator(evaluator);
        filter.setOnMismatch(FilterReply.DENY);

        evaluator.start();
        filter.start();

        appender.addFilter(filter);

        return appender;
    }
}

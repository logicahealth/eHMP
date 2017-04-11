package us.vistacore.ehmp.command;

import com.google.common.base.Objects;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.netflix.hystrix.*;
import com.netflix.hystrix.exception.HystrixBadRequestException;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.UniformInterfaceException;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import org.apache.commons.lang.NotImplementedException;
import org.apache.commons.lang.Validate;
import org.eclipse.jetty.server.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import us.vistacore.ehmp.config.JdsConfiguration;

import javax.ws.rs.core.MediaType;

import static java.lang.String.format;

public class JdsSearchCommand extends HystrixCommand<JsonElement> {

    /**
     * Hysterix group and command key used for statistics, circuit-breaker, properties, etc.
     */
    public static final HystrixCommandGroupKey GROUP_KEY = HystrixCommandGroupKey.Factory.asKey("jds");
    public static final HystrixCommandKey COMMAND_KEY = HystrixCommandKey.Factory.asKey("search");
    public static final HystrixThreadPoolKey THREAD_KEY = HystrixThreadPoolKey.Factory.asKey("jds-pool");

    private static final int TIMEOUT_MS = 10 * 1000;
    private static final int MAX_THREADS = 50;

    private static Logger logger = LoggerFactory.getLogger(JdsCommand.class);

    /**
     * Constructor-passed members and derived members
     */
    private final Index index;
    private final int limit;
    private final int start;
    private final SearchFilter searchFilter;
    private JdsConfiguration jdsConfiguration;
    private ResultsRecordType resultsRecordType;

    public JdsSearchCommand(JdsConfiguration jdsConfiguration, Index index, int limit, int start, SearchFilter searchFilter) {
        this(jdsConfiguration, index, limit, start, searchFilter, ResultsRecordType.DEFAULT);
    }

    public JdsSearchCommand(JdsConfiguration jdsConfiguration, Index index, int limit, int start, SearchFilter searchFilter, ResultsRecordType resultsRecordType) {
        // instantiate Command and properties
        super(Setter.withGroupKey(GROUP_KEY)
                .andCommandKey(COMMAND_KEY)
                .andThreadPoolKey(THREAD_KEY)
                .andThreadPoolPropertiesDefaults(HystrixThreadPoolProperties.Setter().withCoreSize(MAX_THREADS))
                .andCommandPropertiesDefaults(
                        HystrixCommandProperties.Setter()
                                .withCircuitBreakerEnabled(false)
                                .withFallbackEnabled(false)
                                .withRequestCacheEnabled(false)
                                .withRequestLogEnabled(false)
                                .withExecutionIsolationThreadTimeoutInMilliseconds(TIMEOUT_MS)
                                .withExecutionIsolationStrategy(HystrixCommandProperties.ExecutionIsolationStrategy.THREAD)
                ));
        Validate.notNull(jdsConfiguration, "jdsConfiguration cannot be null");
        Validate.notNull(index, "index cannot be null");

        this.jdsConfiguration = jdsConfiguration;
        this.index = index;
        this.limit = limit;
        this.start = start;
        this.searchFilter = searchFilter;
        this.resultsRecordType = resultsRecordType;

    }


    /**
     * This method contains the logic for executing the command.
     *
     * All exceptions thrown (except for {@link com.netflix.hystrix.exception.HystrixBadRequestException}) count as
     * failures and trigger circuit-breaker logic.
     *
     * @return The stored JDS data for {@code uid}
     * @throws CommandException if an error or unexpected result was returned from the the {@code site}
     */
    @Override
    protected JsonElement run() throws CommandException {
        JsonElement jsonElement = null;
        String json = null;
        try {
            String queryPath = "/data/index/" + this.index.getIndex() + resultsRecordType.getUrlSuffix() + "?limit=" + this.limit + "&start=" + this.start;
            if (this.searchFilter != null) {
                switch (searchFilter.getMatchType()) {
                    case CONTAINS:
                        queryPath += "&range=*%22" + searchFilter.getMatch() + "%22*";
                        break;
                    case STARTS_WITH:
                        queryPath += "&range=%22" + searchFilter.getMatch() + "%22*";
                        break;
                    default:
                        throw new NotImplementedException();
                }
            }
            json = getJson(queryPath);
            jsonElement = toJson(json);
        } catch (UniformInterfaceException e) {
            if (e.getResponse().getStatus() == Response.SC_NOT_FOUND) {
                logger.error("404 Response: " + json);
                throw new HystrixBadRequestException("404 Response Received.", e);
            }
        }
        return jsonElement;
    }

    private String getJson(String path) {
        ClientConfig clientConfig = new DefaultClientConfig();
        Client client = Client.create(clientConfig);
        String host = format("http://%s:%s", this.jdsConfiguration.getHost(), this.jdsConfiguration.getPort());
        WebResource resource = client.resource(host + path);
        return resource.accept(MediaType.APPLICATION_JSON).get(String.class);
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("jdsConfiguration", this.jdsConfiguration)
                .add("timeout", TIMEOUT_MS)
                .toString();
    }

    protected JsonElement toJson(String json) {
        return new JsonParser().parse(json);
    }


    public static class SearchFilter {
        private Field field;
        private MatchType matchType;
        private String match;

        public SearchFilter(Field field, MatchType matchType, String match) {
            this.field = field;
            this.matchType = matchType;
            this.match = match;
        }

        public Field getField() {
            return field;
        }

        public MatchType getMatchType() { return matchType; }

        public String getMatch() { return match; }
    }

    public enum Index {
        PATIENT_NAME("pt-select-name");

        private String index;

        Index(String index) {
            this.index = index;
        }

        public String getIndex() {
            return index;
        }
    }

    public enum ResultsRecordType {
        DEFAULT("",""),
        SUMMARY("summary", "/summary");

        private String resultsRecordType;
        private String urlSuffix;

        private ResultsRecordType(String resultsRecordType, String urlSuffix) {
            this.resultsRecordType = resultsRecordType;
            this.urlSuffix = urlSuffix;
        }

        public String getResultsRecordType() {
            return resultsRecordType;
        }

        public static ResultsRecordType fromString(String text) {
            if (text != null) {
              for (ResultsRecordType b : ResultsRecordType.values()) {
                if (text.equalsIgnoreCase(b.resultsRecordType)) {
                  return b;
                }
              }
            }
            return null;
          }

        public String getUrlSuffix() {
            return urlSuffix;
        }
    }

    // Only one field suported
    public enum Field {
        NAME
    }

    public enum MatchType {
        CONTAINS,
        STARTS_WITH;
    }
}

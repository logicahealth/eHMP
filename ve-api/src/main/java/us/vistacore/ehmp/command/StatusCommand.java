package us.vistacore.ehmp.command;

import com.google.common.base.Objects;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.netflix.hystrix.*;
import org.apache.commons.lang.NotImplementedException;
import org.apache.commons.lang.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import us.vistacore.ehmp.config.JdsConfiguration;

public class StatusCommand extends HystrixCommand<JsonElement> {

    /**
     * Hysterix group and command key used for statistics, circuit-breaker, properties, etc.
     */
    public static final HystrixCommandGroupKey GROUP_KEY = HystrixCommandGroupKey.Factory.asKey("jds");
    public static final HystrixCommandKey COMMAND_KEY = HystrixCommandKey.Factory.asKey("odc");
    public static final HystrixThreadPoolKey THREAD_KEY = HystrixThreadPoolKey.Factory.asKey("jds-pool");

    private static final int TIMEOUT_MS = 10 * 1000;
    private static final int MAX_THREADS = 50;


    @SuppressWarnings("unused") private static Logger logger = LoggerFactory.getLogger(StatusCommand.class);

    /**
     * Constructor-passed members and derived members
     */
    private final JdsConfiguration jdsConfiguration;
    private final JdsStatusType jdsStatusType;
    private final String pid;

    public StatusCommand(JdsConfiguration jdsConfiguration, JdsStatusType jdsStatusType) {
        this(jdsConfiguration, jdsStatusType, null);
    }

    public StatusCommand(JdsConfiguration jdsConfiguration, JdsStatusType jdsStatusType, String pid) {
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
        Validate.notNull(jdsStatusType, "jdsStatusType cannot be null");
        if (jdsStatusType.equals(JdsStatusType.PID)) {
            Validate.notNull(pid, "pid cannot be null");
        }
        this.jdsConfiguration = jdsConfiguration;
        this.jdsStatusType = jdsStatusType;
        this.pid = pid;
    }

    /**
     * This method contains the logic for executing the command.
     *
     * All exceptions thrown (except for {@link com.netflix.hystrix.exception.HystrixBadRequestException}) count as failures and trigger circuit-breaker logic.
     *
     * @return The stored JDS data for the status type
     */
    @Override
    protected JsonObject run() throws CommandException {
        switch (jdsStatusType) {
            case OPERATIONAL:
                return getOperationalSyncStatus(this.jdsConfiguration);
            case PID:
                return getSyncStatus(this.jdsConfiguration, this.pid);
            default:
                throw new NotImplementedException();
        }
    }

    private static JsonObject getOperationalSyncStatus(JdsConfiguration jdsConfiguration) {
        String statusString = JdsCommand.get(jdsConfiguration, "/data/find/syncstatus?filter=eq(forOperational,true)");
        return new Gson().fromJson(statusString, JsonObject.class);
    }

    /**
     * Return a syncStatus result or null, if patient has sync has not been started
     *
     * @param jdsConfiguration configuration for JDS instance to query
     * @param pid patient id to query
     * @return syncStatus json result or null
     */
    public static JsonObject getSyncStatus(JdsConfiguration jdsConfiguration, String pid) {
        String response = JdsCommand.get(jdsConfiguration, "/data/urn:va:syncstatus:" + pid);
        if (response == null) {
            // Attempt with UID in another format
            response = JdsCommand.get(jdsConfiguration, "/data/urn:va:syncstatus:" + pid.replaceAll(";", ":"));
        }
        if (response == null) {
            return null;
        } else {
            JsonObject jsonObject = jsonObject(response);
            return jsonObject;
        }
    }

    // may throw com.google.gson.stream.MalformedJsonException if unexpected response is returned
    private static JsonObject jsonObject(String json) {
        return new Gson().fromJson(json, JsonElement.class).getAsJsonObject();
    }

    /**
     * Return true if the operationalStatus is an operational status message and it indicates that operational data sync is complete
     *
     * @param operationalStatus the operational status
     * @return true, if operational data is synced
     */
    public static boolean isOperationalSyncComplete(JsonElement operationalStatus) {
        try {
            return operationalStatus.getAsJsonObject().getAsJsonObject("data").getAsJsonArray("items").get(0).getAsJsonObject().get("syncOperationalComplete").getAsBoolean();
        } catch (Exception e) {
            return false;
        }
    }

    public enum JdsStatusType {
        PID, OPERATIONAL
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("jdsConfiguration", this.jdsConfiguration)
                .add("timeout", TIMEOUT_MS)
                .toString();
    }

}

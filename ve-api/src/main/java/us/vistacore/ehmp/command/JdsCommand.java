package us.vistacore.ehmp.command;

import com.google.common.base.Objects;
import com.google.common.base.Stopwatch;
import com.google.common.collect.ImmutableList;
import com.google.gson.*;
import com.netflix.hystrix.*;
import com.netflix.hystrix.exception.HystrixBadRequestException;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import org.apache.commons.lang.Validate;
import org.eclipse.jetty.server.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import us.vistacore.ehmp.config.JdsConfiguration;
import us.vistacore.ehmp.model.VprDomain;
import us.vistacore.ehmp.util.ClientBuilder;

import javax.ws.rs.core.MediaType;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static java.lang.String.format;
import static us.vistacore.ehmp.command.SyncCommand.isIcn;

/**
 * This command class returns patient data for synced patients in JDS.
 */
public class JdsCommand extends HystrixCommand<JsonElement> {

    /**
     * Hysterix group and command key used for statistics, circuit-breaker, properties, etc.
     */
    public static final HystrixCommandGroupKey GROUP_KEY = HystrixCommandGroupKey.Factory.asKey("jds");
    public static final HystrixCommandKey COMMAND_KEY = HystrixCommandKey.Factory.asKey("vpr");
    public static final HystrixThreadPoolKey THREAD_KEY = HystrixThreadPoolKey.Factory.asKey("jds-pool");

    /**
     * time limits
     */
    private static final int TIMEOUT_MS = 10 * 1000;
    private static final int MAX_THREADS = 50;
    private static final List<String> OPERATIONAL_DATA_COLLECTIONS = ImmutableList.<String>builder()
                                                                    .add("pt-select")
                                                                    .build();

    @SuppressWarnings("unused")
    private static Logger logger = LoggerFactory.getLogger(JdsCommand.class);

    /**
     * Constructor-passed members and derived members
     */
    private String pid = null;
    private VprDomain vprDomain = null;
    private String uid = null;
    private boolean useFilter = false;
    private JdsConfiguration jdsConfiguration;

    /**
     * Creates a JdsCommand object
     *
     * @param jdsConfiguration configuration for JDS instance associated with this sync
     * @param pid the pid of the patient to return data for
     * @param vprDomain the data domain
     */
    public JdsCommand(JdsConfiguration jdsConfiguration, String pid, VprDomain vprDomain) {
        // instantiate Command and properties
        super(Setter.withGroupKey(GROUP_KEY)
            .andCommandKey(COMMAND_KEY)
            .andThreadPoolKey(THREAD_KEY)
            .andThreadPoolPropertiesDefaults(HystrixThreadPoolProperties.Setter().withCoreSize(MAX_THREADS))
            .andCommandPropertiesDefaults(
                    HystrixCommandProperties.Setter()
                            .withCircuitBreakerEnabled(false)
                            .withFallbackEnabled(false)
                            .withRequestCacheEnabled(true)
                            .withRequestLogEnabled(true)
                            .withExecutionIsolationThreadTimeoutInMilliseconds(TIMEOUT_MS)
                            .withExecutionIsolationStrategy(HystrixCommandProperties.ExecutionIsolationStrategy.THREAD)
            ));

        Validate.notNull(jdsConfiguration, "jdsConfiguration cannot be null");
        Validate.notNull(pid, "pid cannot be null");
        Validate.notNull(vprDomain, "vprDomain cannot be null");

        this.jdsConfiguration = jdsConfiguration;
        this.pid = pid;
        this.vprDomain = vprDomain;
    }

    /**
     * Creates a JdsCommand object
     *
     * @param jdsConfiguration configuration for JDS instance associated with this sync
     * @param pid the pid of the patient to return data for
     * @param uid the uid of data in the VPR
     * @param vprDomain the data domain
     * @param useFilter determines whether or not to search via filter
     */
    public JdsCommand(JdsConfiguration jdsConfiguration, String pid, String uid, VprDomain vprDomain, boolean useFilter) {
        // instantiate Command and properties
        super(Setter.withGroupKey(GROUP_KEY)
                .andCommandKey(COMMAND_KEY)
                .andCommandPropertiesDefaults(
                        HystrixCommandProperties.Setter()
                                .withCircuitBreakerEnabled(false)
                                .withFallbackEnabled(false)
                                .withRequestCacheEnabled(true)
                                .withRequestLogEnabled(true)
                                .withExecutionIsolationThreadTimeoutInMilliseconds(TIMEOUT_MS)
                                .withExecutionIsolationStrategy(HystrixCommandProperties.ExecutionIsolationStrategy.THREAD)));

        Validate.notNull(jdsConfiguration, "jdsConfiguration cannot be null");
        Validate.notNull(uid, "uid cannot be null");

        this.jdsConfiguration = jdsConfiguration;
        this.pid = pid;
        this.uid = uid;
        this.vprDomain = vprDomain;
        this.useFilter = useFilter;
    }

    /**
     * Creates a JdsCommand object
     *
     * @param jdsConfiguration configuration for JDS instance associated with this sync
     * @param uid the uid of data in the VPR
     */
    public JdsCommand(JdsConfiguration jdsConfiguration, String uid) {
        // instantiate Command and properties
        super(Setter.withGroupKey(GROUP_KEY)
                .andCommandKey(COMMAND_KEY)
                .andCommandPropertiesDefaults(
                        HystrixCommandProperties.Setter()
                                .withCircuitBreakerEnabled(false)
                                .withFallbackEnabled(false)
                                .withRequestCacheEnabled(true)
                                .withRequestLogEnabled(true)
                                .withExecutionIsolationThreadTimeoutInMilliseconds(TIMEOUT_MS)
                                .withExecutionIsolationStrategy(HystrixCommandProperties.ExecutionIsolationStrategy.THREAD)));

        Validate.notNull(jdsConfiguration, "jdsConfiguration cannot be null");
        Validate.notNull(uid, "uid cannot be null");

        this.jdsConfiguration = jdsConfiguration;
        this.uid = uid;
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
        JsonElement jsonElement;
        String response;
        if (uid != null && pid != null) {
            if (useFilter && vprDomain != null) {
                response = get(this.jdsConfiguration, "/vpr/" + this.pid + "/find/" + this.vprDomain.getId() + "?filter=like(%22uid%22,%22" + this.uid + "%22)");
            } else {
                response = get(this.jdsConfiguration, "/vpr/" + this.pid + "/" + this.uid);
            }
        } else if (uid != null && pid == null) {
            if (isOperationalData(uid)) {
                response = get(this.jdsConfiguration, "/data/" + this.uid);
            } else {
                response = get(this.jdsConfiguration, "/vpr/uid/" + this.uid);
            }
        } else if (VprDomain.PATIENT.equals(vprDomain)) {
            response = this.get(this.jdsConfiguration, "/vpr/" + pid + "/find/patient");
        } else {
            response = this.get(this.pid, this.vprDomain);
        }
        if (response == null) {
            throw new HystrixBadRequestException("404 Response", new IllegalArgumentException());
        }
        jsonElement = toJson(response);
        return jsonElement;
    }

    private boolean isOperationalData(String uid) {
        String[] split = uid.split(":");
        if (split.length >= 4) {
            return OPERATIONAL_DATA_COLLECTIONS.contains(split[2]);
        }
        return false;
    }

    private String get(String pid, VprDomain vprDomain) {
        if (VprDomain.PATIENT_SELECT.equals(vprDomain)) {
            if (isIcn(pid)) {
                return get(jdsConfiguration, "/data/index/pt-select-icn?range=" + pid);
            } else {
                return get(jdsConfiguration, "/data/index/pt-select-pid?range=" + pid);
            }
        } else {
            return get(this.jdsConfiguration, "/vpr/" + pid + "/index/" + vprDomain.getJdsIndex());
        }
    }

    protected JsonElement toJson(String json) {
        return new JsonParser().parse(json);
    }

    public static JsonObject getDemographics(JsonObject json) {
        return json.getAsJsonObject("data").getAsJsonArray("items").get(0).getAsJsonObject();
    }

    public static String getDemographics(String json) {
        return getDemographics(new Gson().fromJson(json, JsonObject.class)).toString();
    }

    public static String get(JdsConfiguration jdsConfiguration, String path) {
        String json = null;
        Stopwatch stopwatch = Stopwatch.createStarted();

        if (json == null) {
            Client client = Client.create(new DefaultClientConfig());
            String host = format("http://%s:%s", jdsConfiguration.getHost(), jdsConfiguration.getPort());
            WebResource resource = client.resource(host + path);
            ClientResponse response = resource.accept(MediaType.APPLICATION_JSON).get(ClientResponse.class);
            if (response.getStatus() == Response.SC_OK) {
                json = response.getEntity(String.class);
            }
            
            response.close();
            client.destroy();
        }
        
        logger.info("TIME ELAPSED FOR GET(" + path + ") = " + stopwatch.elapsed(TimeUnit.MILLISECONDS));
        return json;
    }

    public static ClientResponse put(JdsConfiguration jdsConfiguration, String path, String json) {
        Client client = ClientBuilder.createClient();
        String host = format("http://%s:%s", jdsConfiguration.getHost(), jdsConfiguration.getPort());
        WebResource resource = client.resource(host + path);
        ClientResponse response = resource.accept(MediaType.APPLICATION_JSON).put(ClientResponse.class, json);
        return response;
    }

    public static List<String> getLabUids(String orderJson) {
        List<String> labUids = new ArrayList<String>();
        JsonObject orderJsonObject = new Gson().fromJson(orderJson, JsonObject.class);
        JsonArray labsJsonArray = null;

        if (orderJsonObject.getAsJsonObject("data") != null
                && orderJsonObject.getAsJsonObject("data").getAsJsonArray("items") != null
                && orderJsonObject.getAsJsonObject("data").getAsJsonArray("items").size() > 0
                && orderJsonObject.getAsJsonObject("data").getAsJsonArray("items").get(0).getAsJsonObject() != null
                && orderJsonObject.getAsJsonObject("data").getAsJsonArray("items").get(0).getAsJsonObject().getAsJsonArray("results") != null) {
            labsJsonArray = orderJsonObject.getAsJsonObject("data").getAsJsonArray("items").get(0).getAsJsonObject().getAsJsonArray("results");

            for (JsonElement jsonElement : labsJsonArray) {
                labUids.add(jsonElement.getAsJsonObject().get("uid").getAsString());
            }
        }

        return labUids;
    }

    public static JsonElement getFirstLab(String labJson) {
        JsonObject labJsonObject = new Gson().fromJson(labJson, JsonObject.class);
        JsonElement labJsonElement = null;

        if (labJsonObject.getAsJsonObject("data") != null
                && labJsonObject.getAsJsonObject("data").getAsJsonArray("items") != null
                && labJsonObject.getAsJsonObject("data").getAsJsonArray("items").size() > 0) {
            labJsonElement = labJsonObject.getAsJsonObject("data").getAsJsonArray("items").get(0);
        }

        return labJsonElement;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("jdsConfiguration", this.jdsConfiguration)
                .add("timeout", TIMEOUT_MS)
                .toString();
    }
    
    @Override
    public String getCacheKey() {
        if (this.vprDomain != null && this.vprDomain.equals(VprDomain.PATIENT_SELECT)) {
            return "PATIENT_SELECT for " + pid;
        } else {
            // Don't cache other data
            return UUID.randomUUID().toString();
        }
    }
}

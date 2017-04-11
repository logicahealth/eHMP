package us.vistacore.ehmp.command;

import com.google.common.base.Objects;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.netflix.hystrix.HystrixCommand;
import com.netflix.hystrix.HystrixCommandGroupKey;
import com.netflix.hystrix.HystrixCommandKey;
import com.netflix.hystrix.HystrixCommandProperties;
import com.netflix.hystrix.exception.HystrixBadRequestException;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;

import org.apache.commons.lang.Validate;
import org.eclipse.jetty.server.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import us.vistacore.ehmp.authentication.User;
import us.vistacore.ehmp.config.HmpConfiguration;
import us.vistacore.ehmp.config.JdsConfiguration;
import us.vistacore.ehmp.model.VprDomain;
import us.vistacore.ehmp.util.ClientBuilder;

import javax.ws.rs.core.MediaType;

import java.util.Date;

import static java.lang.String.format;
import static us.vistacore.ehmp.command.SyncCommand.isIcn;

/**
 * This command class returns patient data for synced patients in HMP.
 */
public class HmpCommand extends HystrixCommand<JsonElement> {

    /**
     * Hysterix group and command key used for statistics, circuit-breaker, properties, etc.
     */
    public static final HystrixCommandGroupKey GROUP_KEY = HystrixCommandGroupKey.Factory.asKey("hmp");
    public static final HystrixCommandKey COMMAND_KEY = HystrixCommandKey.Factory.asKey("text-search");

    /**
     * time limits
     */
    private static final int TIMEOUT_MS = 10 * 1000;

    @SuppressWarnings("unused")
    private static Logger logger = LoggerFactory.getLogger(HmpCommand.class);

    /**
     * Constructor-passed members and derived members
     */
    private String pid = null;
    private String searchDomain = null;
    private String textSearch = null;
    private String uid = null;
    private User user = null;
    private HmpConfiguration hmpConfiguration;
    private JdsConfiguration jdsConfiguration;

    /**
     * Creates a HmpCommand object
     *
     * @param user from resource authentication used for HMP services
     * @param hmpConfiguration configuration for HMP instance associated with this sync
     * @param pid the pid of the patient to return data for
     */
    public HmpCommand(User user, HmpConfiguration hmpConfiguration, JdsConfiguration jdsConfiguration, String pid, String textSearch, String searchDomain) {
        // instantiate Command and properties
        super(Setter.withGroupKey(GROUP_KEY)
            .andCommandKey(COMMAND_KEY)
            .andCommandPropertiesDefaults(
                HystrixCommandProperties.Setter()
                    .withCircuitBreakerEnabled(false)
                    .withFallbackEnabled(false)
                    .withRequestCacheEnabled(false)
                    .withRequestLogEnabled(false)
                    .withExecutionIsolationThreadTimeoutInMilliseconds(TIMEOUT_MS)
                    .withExecutionIsolationStrategy(HystrixCommandProperties.ExecutionIsolationStrategy.THREAD)));
        this.jdsConfiguration = jdsConfiguration;

        Validate.notNull(user, "user cannot be null");
        Validate.notNull(hmpConfiguration, "hmpConfiguration cannot be null");
        Validate.notNull(jdsConfiguration, "jdsConfiguration cannot be null");
        Validate.notNull(pid, "pid cannot be null");
        Validate.notNull(textSearch, "textSearch cannot be null");
        Validate.notNull(searchDomain, "searchDomain cannot be null");
        
        this.user = user;
        this.hmpConfiguration = hmpConfiguration;
        this.jdsConfiguration = jdsConfiguration;
        this.pid = pid;
        this.textSearch = textSearch;
        this.searchDomain = searchDomain;
    }

    /**
     * This method contains the logic for executing the command.
     *
     * All exceptions thrown (except for {@link com.netflix.hystrix.exception.HystrixBadRequestException}) count as
     * failures and trigger circuit-breaker logic.
     *
     * @return The stored HMP data for {@code uid}
     * @throws CommandException if an error or unexpected result was returned from the the {@code site}
     */
    @Override
    protected JsonElement run() throws CommandException {
        JsonElement jsonElement;
        ClientResponse response;

        String siteDfn;
        if (isIcn(this.pid)) {
            // Lookup site;dfn for a patient that has an ICN pid. Assume the first entry in the list if more than site is present.
            JsonElement patientSelectData = new JdsCommand(this.jdsConfiguration, this.pid, VprDomain.PATIENT_SELECT).execute();
            siteDfn = patientSelectData.getAsJsonObject().getAsJsonObject("data").getAsJsonArray("items").get(0).getAsJsonObject().get("pid").getAsString();
        } else {
            siteDfn = this.pid;
        }

        if (uid != null) {
            response = get(this.user, this.hmpConfiguration, "/vpr/uid/" + this.uid);
        } else {
            response = this.get(siteDfn, this.searchDomain, this.textSearch);
        }
        jsonElement = toJson(response.getEntity(String.class));
        if (response.getStatus() == Response.SC_NOT_FOUND) {
            throw new HystrixBadRequestException("404 Response: " + jsonElement, new IllegalArgumentException());
        }
        return jsonElement;
    }


    /**
    * builds the query call string
    * @param textSearch
    * @param patientDomain
    * @return The call to query with refined search parameters
    */
    private String querySearchBuilder(String siteDfn, String textSearch, String patientDomain) {
        String schFilter = "";
        // hard coded part for default testing on med domain
        if (patientDomain == null) {
            schFilter = "&format=json&types=med&range=";
        } else if (VprDomain.hasDomain(patientDomain)) {
            //Check for existing domain values
            schFilter = "&format=json&types=" + VprDomain.valueOf(patientDomain) + "&range=";
        } else {
            // hard coded part for default testing on med domain
            schFilter = "&format=json&types=med&range=";
        }

        String queryCall = "search?_dc=" + (new Date().getTime()) + schFilter + "&query=" + textSearch + "&pid=" + siteDfn + "&page=1&start=0&limit=25";
        return queryCall;
    }
    /**
     * Builds the search url call uses VprDomain enum for PatientDomain values
     */
    private ClientResponse get(String siteDfn, String searchDomain, String textSearch) {
        if (isSensitive()) {
            return get(this.user, this.hmpConfiguration, "/vpr/v1/search?_dc=" + querySearchBuilder(siteDfn, textSearch, searchDomain));
        } else {
            return get(this.user, this.hmpConfiguration, "/vpr/v1/search?_dc=" + querySearchBuilder(siteDfn, textSearch, searchDomain));
        }
    }

    /**
     * method to check patient sensitivity
     * @return
     */
    protected boolean isSensitive() {
        // some code to check patient sensitivity
        return true;
    }

    protected JsonElement toJson(String json) {
        return new JsonParser().parse(json);
    }

    public static JsonObject getDemographics(JsonObject json) {
        return json.getAsJsonObject("data").getAsJsonArray("items").get(0).getAsJsonObject();
    }

    /**
     * Returns the full url to Json
     * @param user
     * @param hmpConfiguration
     * @param path
     * @return full url to Json
     */
    public static ClientResponse get(User user, HmpConfiguration hmpConfiguration, String path)  {
        //This handles all SSL connection setup (may not be secure)
        //Do NOT use DefaultClientConfig, or you will need to set up SSL manually
        Client client = ClientBuilder.createClient();
        String host = format("https://%s:%s", hmpConfiguration.getHost(), hmpConfiguration.getPort());
        WebResource resource = client.resource(host + path);
        return resource.accept(MediaType.APPLICATION_JSON)
                .header("Authorization", SyncCommand.getBasicAuthorization(user))
                .get(ClientResponse.class);
    }

    public static ClientResponse put(HmpConfiguration hmpConfiguration, String path, String json) {
        Client client = ClientBuilder.createClient();
        String host = format("https://%s:%s", hmpConfiguration.getHost(), hmpConfiguration.getPort());
        WebResource resource = client.resource(host + path);
        return resource.accept(MediaType.APPLICATION_JSON).put(ClientResponse.class, json);
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
        		.add("user", this.user)
                .add("hmpConfiguration", this.hmpConfiguration)
                .add("timeout", TIMEOUT_MS)
                .toString();
    }

}

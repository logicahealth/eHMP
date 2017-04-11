package us.vistacore.ehmp.command;

import com.google.common.base.Objects;
import com.google.common.base.Stopwatch;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.netflix.hystrix.*;
import com.netflix.hystrix.exception.HystrixBadRequestException;
import com.netflix.hystrix.exception.HystrixRuntimeException;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.core.util.MultivaluedMapImpl;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import us.vistacore.ehmp.authentication.User;
import us.vistacore.ehmp.config.HmpConfiguration;
import us.vistacore.ehmp.config.JdsConfiguration;
import us.vistacore.ehmp.domain.SyncStatus;
import us.vistacore.ehmp.domain.SyncStatus.VistaAccountSyncStatus;
import us.vistacore.ehmp.model.VprDomain;
import us.vistacore.ehmp.util.ClientBuilder;
import us.vistacore.ehmp.util.NullChecker;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import static java.lang.String.format;
import static java.lang.Thread.sleep;
import static us.vistacore.ehmp.command.JdsCommand.get;
import static us.vistacore.ehmp.util.NullChecker.isNotNullish;

/**
 * This command class will synchronize (or unsynchronize) a patient and return a
 * result only when the sync/unsync is complete. This command is idempotent, but
 * a sync and unsync command for the same patient should not overlap.
 */
public class SyncCommand extends HystrixCommand<JsonElement> {

    /**
     * Hystrix group and command key used for statistics, circuit-breaker, properties, etc.
     */
    public static final HystrixCommandGroupKey GROUP_KEY = HystrixCommandGroupKey.Factory.asKey("ehmp");
    public static final HystrixCommandKey COMMAND_KEY = HystrixCommandKey.Factory.asKey("sync");
    public static final HystrixThreadPoolKey THREAD_KEY = HystrixThreadPoolKey.Factory.asKey("sync-pool");

    /**
     * Sync-related time limits
     */
    private static final int TIMEOUT_MS = 240 * 1000;
    private static final int WAIT_INCREMENT_MS = 200;
    private static final int MAX_THREADS = 50;
    protected static final int RETRY_ATTEMPTS = 1;

    private static Logger logger = LoggerFactory.getLogger(SyncCommand.class);

    /**
     * Constructor-passed members and derived members
     */
    private final String pid;
    private final boolean unsync;
    private final User user;
    private final HmpConfiguration hmpConfiguration;
    private final JdsConfiguration jdsConfiguration;
    private int numRetries;

    /**
     * Creates a SyncCommand object.
     *
     * @param user from resource authentication used for HMP services
     * @param hmpConfiguration configuration for the HMP instance associated with this sync (must correspond to the {@code jdsConfiguration})
     * @param jdsConfiguration configuration for JDS instance associated with this sync (must correspond to the {@code hmpConfiguration})
     * @param pid the pid of the patient to sync
     * @param unsync true to unsync and patient, false to sync a patient
     */
    public SyncCommand(User user, HmpConfiguration hmpConfiguration, JdsConfiguration jdsConfiguration, String pid, boolean unsync) {
        this(user, hmpConfiguration, jdsConfiguration, pid, unsync, RETRY_ATTEMPTS);
    }

    private SyncCommand(User user, HmpConfiguration hmpConfiguration, JdsConfiguration jdsConfiguration, String pid, boolean unsync, int numRetries) {
        // instantiate Command and properties
        super(Setter.withGroupKey(GROUP_KEY)
                .andCommandKey(COMMAND_KEY)
                .andThreadPoolKey(THREAD_KEY)
                .andThreadPoolPropertiesDefaults(HystrixThreadPoolProperties.Setter().withCoreSize(MAX_THREADS))
                .andCommandPropertiesDefaults(
                        HystrixCommandProperties.Setter()
                                .withCircuitBreakerEnabled(false)
                                .withFallbackEnabled(true)
                                .withRequestCacheEnabled(false)
                                .withRequestLogEnabled(false)
                                .withExecutionIsolationThreadTimeoutInMilliseconds(TIMEOUT_MS)
                                .withExecutionIsolationStrategy(HystrixCommandProperties.ExecutionIsolationStrategy.THREAD)
                ));
        
        Validate.notNull(user, "user cannot be null");
        Validate.notNull(hmpConfiguration, "hmpConfiguration cannot be null");
        Validate.notNull(jdsConfiguration, "jdsConfiguration cannot be null");
        Validate.notNull(pid, "pid cannot be null");
        Validate.notNull(numRetries, "numRetries cannot be null");
        
        this.user = user;
        this.jdsConfiguration = jdsConfiguration;
        this.hmpConfiguration = hmpConfiguration;
        this.pid = pid;
        this.unsync = unsync;
        this.numRetries = numRetries;
    }

    /**
     * Creates a SyncCommand object.
     *
     * @param user from resource authentication used for HMP services
     * @param hmpConfiguration configuration for the HMP instance associated with this sync (must correspond to the {@code jdsConfiguration})
     * @param jdsConfiguration configuration for JDS instance associated with this sync (must correspond to the {@code hmpConfiguration})
     * @param pid the pid of the patient to sync
     */
    public SyncCommand(User user, HmpConfiguration hmpConfiguration, JdsConfiguration jdsConfiguration, String pid) {
        this(user, hmpConfiguration, jdsConfiguration, pid, false);
    }

    /**
     * Executes the command and returns the result. Returns a syncstatus, or patient demographics if {@code unsync==true}.
     *
     * All exceptions thrown (except for {@link com.netflix.hystrix.exception.HystrixBadRequestException}) count as
     * failures and trigger circuit-breaker logic.
     *
     * @return The sync or unsync result
     * @throws HystrixBadRequestException if pid is invalid
     */
    @Override
    protected JsonElement run() throws InterruptedException {
        if (!isValidPid(this.jdsConfiguration, this.pid)) {
            throw new HystrixBadRequestException(this.pid + " is not a valid pid for " + this.jdsConfiguration.toString(), new IllegalArgumentException());
        }
        if (this.unsync) {
            return this.unsynchronize(pid);
        } else {
            return this.synchronize(pid);
        }
    }

    /**
     * Defines the fallback behavior in the case of failed execution. The fallback will attempt to re-execute the failed command.
     *
     * @return The sync or unsync result from retrying the command
     */
    @Override
    protected JsonElement getFallback() {
        if (numRetries > 0) {
            logger.warn("Fallback triggered for command: " + this.toLoggingString());
            return new SyncCommand(this.user, this.hmpConfiguration, this.jdsConfiguration, this.pid, this.unsync, this.numRetries - 1).execute();
        } else {
            throw new HystrixRuntimeException(HystrixRuntimeException.FailureType.COMMAND_EXCEPTION, this.getClass(), "retry limit reached; fallback cancelled.", null, this.getFailedExecutionException());
        }
    }

    /**
     * Returns true if there are enough resources to queue command execution
     * @return true if there are adequete resources to queue command
     */
    public boolean isQueueable() {
        HystrixThreadPoolMetrics metrics = HystrixThreadPoolMetrics.getInstance(SyncCommand.THREAD_KEY);
        return metrics.getCurrentActiveCount().intValue() < (SyncCommand.MAX_THREADS / 2);
    }

    /**
     * Returns the {@link JsonObject} represented by {@code data.items[index]}, or null if no such item exists
     * @return a json object or {@code null}
     */
    public static JsonObject getDataItem(JsonObject json, int index) {
        try {
            return json.getAsJsonObject("data").getAsJsonArray("items").get(index).getAsJsonObject();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Returns the JSON string represented by {@code data.items[index]}, or null if no such item exists
     * @return JSON string or null
     */
    public static String getDataItem(String json, int index) {
        JsonObject item = getDataItem(new Gson().fromJson(json, JsonObject.class), index);
        if (item != null) {
            return item.toString();
        } else {
            return null;
        }
    }

    private String extractSiteFromPatientUid(String uid) {
        String site = "";

        if (isNotNullish(uid)) {
            String[] uidParts = uid.split(":");
            if ((uidParts != null) && (uid.length() >= 4)) {
                site = uidParts[3];
            }
        }

        return site;
    }

    private String outputStringArray(List<String> stringArray) {
        StringBuffer sbOutput = new StringBuffer();

        if (isNotNullish(stringArray)) {
            for (String sValue : stringArray) {
                if (sbOutput.length() > 0) {
                    sbOutput.append(", ");
                }

                sbOutput.append("'" + sValue + "'");
            }
        }
        else {
            sbOutput.append("list was empty");
        }

        return sbOutput.toString();
    }

    public List<String> getVistaSites(String pid) {
        List<String> saSite = new ArrayList<String>();

        if (isIcn(pid)) {
            JsonObject ptDemographics = getPatientFromPid(pid);
            if (ptDemographics != null) {
                logger.debug("Retrieved pt demographics: " + ptDemographics.toString());

                for (JsonElement jsonElement : ptDemographics.getAsJsonObject("data").getAsJsonArray("items").getAsJsonArray()) {
                    if ((jsonElement != null) &&
                        (jsonElement.isJsonObject())) {
                        JsonObject jsonPatient = jsonElement.getAsJsonObject();
                        String uid = jsonPatient.getAsJsonPrimitive("uid").getAsString();
                        String site = extractSiteFromPatientUid(uid);
                        saSite.add(site);
                    }
                    else {
                        logger.debug("getVistaSites: jsonElement was not a JsonObject.   No clue what it is...");
                    }
                }
            }

        }
        else {
            String sVistaSite = extractSiteFromPid(pid);
            if (NullChecker.isNotNullish(sVistaSite)) {
                saSite.add(sVistaSite);
            }
        }

        logger.debug("getVistaSites: saSite: " + outputStringArray(saSite));
        return saSite;
    }

    /**
     * A naive check for sync completion.
     * @param syncStatus the JSON of a syncStatus to check for completion
     * @param pid TODO unused
     * @param vistaSitesToCheck The vista sites to be checked.
     * @return true, if sync is marked complete
     */
    public static boolean isSyncMarkedCompleted(JsonObject syncStatus, String pid, List<String> vistaSitesToCheck) {
        if (syncStatus == null) {
            return false;
        } else {
            // Make sure that we have a site to check before going through this code...
            //-------------------------------------------------------------------------
            if (vistaSitesToCheck.size() > 0) {
                SyncStatus status = new Gson().fromJson(syncStatus.getAsJsonObject("data").getAsJsonArray("items").getAsJsonArray().get(0), SyncStatus.class);
                Map<String, VistaAccountSyncStatus> mapVistaSyncStatus = status.getSyncStatusByVistaSystemId();
                if (NullChecker.isNotNullish(mapVistaSyncStatus)) {
                    // Verify that expected site are complete
                    for (String sVistaSiteToCheck : vistaSitesToCheck) {
                        VistaAccountSyncStatus oVistaSyncStatus = mapVistaSyncStatus.get(sVistaSiteToCheck);
                        if ((oVistaSyncStatus == null) || (!oVistaSyncStatus.isSyncComplete())) {
                            return false;   // Found one that is not ready.
                        }
                    }
                    // Verify that all listed sites are complete
                    for (VistaAccountSyncStatus vistaAccountSyncStatus : mapVistaSyncStatus.values()) {
                        if (!vistaAccountSyncStatus.isSyncComplete()) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    /**
     * This is a bandaid method.   For some reason because of threading issues - a sync message is lost.  When that happens
     * this loops forever waiting for a sync that is never going to occur.  So if we see a case when the patient has synced
     * success on one site, but there is no record of the other site at all.  We need to resend the sync request.  Return TRUE
     * if this is the case.
     *
     * @param syncStatus the JSON of a syncStatus to check for completion
     * @param pid The PID of the patient.
     * @return TRUE if one or more sites has synced with no record of the other sites.
     */
    private boolean needToReissueSync(JsonObject syncStatus, String pid) {
        boolean bFoundSome = false;
        boolean bSomeMissing = false;
        if ((syncStatus != null) && (isIcn(pid))) {
            List<String> saVistaSiteToCheck = getVistaSites(pid);
            SyncStatus status = new Gson().fromJson(syncStatus.getAsJsonObject("data").getAsJsonArray("items").getAsJsonArray().get(0), SyncStatus.class);
            Map<String, VistaAccountSyncStatus> mapVistaSyncStatus = status.getSyncStatusByVistaSystemId();
            if (NullChecker.isNotNullish(mapVistaSyncStatus)) {
                for (String sVistaSiteToCheck : saVistaSiteToCheck) {
                    VistaAccountSyncStatus oVistaSyncStatus = mapVistaSyncStatus.get(sVistaSiteToCheck);
                    if ((oVistaSyncStatus != null) &&
                        (oVistaSyncStatus.isSyncComplete())) {
                        bFoundSome = true;   // Found one that is not ready.
                    }
                    else if (oVistaSyncStatus == null) {
                        bSomeMissing = true;
                    }
                }
            }
        }
        if ((bFoundSome) && (bSomeMissing)) {
            return true;
        }
        else {
            return false;
        }

    }

    /**
     * Extracts the vista site from the site;dfn pid.
     *
     * @param pid The pid containing the site info.
     * @return The site that was extracted.
     */
    private static String extractSiteFromPid(String pid) {
        String sVistaSite = "";

        if ((NullChecker.isNotNullish(pid)) &&
            (pid.contains(";"))) {
            sVistaSite = pid.substring(0, pid.indexOf(";"));
        }

        return sVistaSite;
    }

    /**
     * Return true of this pid is an ICN.   A pid that has a ';' is NOT an ICN.
     *
     * @param pid The pid to check.
     * @return TRUE if the pid is an icn.
     */
    protected static boolean isIcn(String pid) {
        if ((NullChecker.isNotNullish(pid)) && (pid.contains(";"))) {
            return false;
        }
        else if ((NullChecker.isNotNullish(pid))) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Returns true if a pid represents a valid patient
     * @param jdsConfiguration configuration for JDS instance to query
     * @param pid patient id to check
     * @return true if a pid is valid, otherwise false
     */
    protected static boolean isValidPid(JdsConfiguration jdsConfiguration, String pid) {
        JsonElement ptSelect = new JdsCommand(jdsConfiguration, pid, VprDomain.PATIENT_SELECT).execute();
        return ptSelect.getAsJsonObject().getAsJsonObject("data").get("totalItems").getAsLong() > 0;
    }

    private JsonObject synchronize(String pid) throws InterruptedException {
        JsonObject syncStatus = getSyncStatus(pid);
        List<String> vistaSitesToCheck = getVistaSites(pid);
        logger.debug("synchronize: Request received to synchronize pid:" + pid + ".  SyncStatus: " + ((syncStatus == null)?"null":syncStatus.toString()));
        if (!isSyncMarkedCompleted(syncStatus, pid, vistaSitesToCheck)) {
            logger.debug("synchronize: Patient not synchronized yet. " + pid + ".  Synchronizing now. ");
            this.load(this.pid);
            while (!isSyncMarkedCompleted(syncStatus, pid, vistaSitesToCheck)) {
                if (needToReissueSync(syncStatus, pid)) {
                    logger.debug("synchronize: Some full sites are synced while others are completely empty - resending the sync request for pid: " + pid);
                    this.load(this.pid);
                }
                logger.debug("synchronize: SyncStatus is NOT marked as complete for pid:" + pid + ".  Waiting for it to complete. Syncstatus: " + syncStatus);
                sleep(WAIT_INCREMENT_MS);
                syncStatus = getSyncStatus(pid);
            }

            logger.debug("synchronize: SyncStatus is now marked as complete for pid:" + pid + ".  Now check to see if everything is stored.");

            // The syncStatus response may report syncComplete=true and domainExpectedTotals with total=count,
            // but retrieving the data by collection or index will return incomplete data. To correct for this,
            // we check every reported total in syncStatus against the actuals in the returned domains.
            while (!domainTotalsAccurate(syncStatus)) {
                logger.debug("synchronize: All data has not been stored yet for pid:" + pid + ".  Waiting for data to finish storing.");
                sleep(WAIT_INCREMENT_MS);
                syncStatus = getSyncStatus(pid);
            }
        }
        else {
            logger.debug("synchronize: Request received to synchronize pid:" + pid + ".  Patient was already synchronized.  SyncStatus: " + ((syncStatus == null)?"null":syncStatus.toString()));
        }
        return syncStatus;
    }

    private boolean domainTotalsAccurate(JsonObject syncStatus) {
        // Get actual domain totals
        String response = get(this.jdsConfiguration, "/vpr/" + this.pid + "/count/collection");
        if (response == null) {
            // No domain totals found
            return false;
        }
        JsonArray collectionTotals = new Gson().fromJson(response, JsonObject.class).getAsJsonObject("data").getAsJsonArray("items").getAsJsonArray();
        
        // Get reported domain totals
        SyncStatus status = new Gson().fromJson(syncStatus.getAsJsonObject("data").getAsJsonArray("items").getAsJsonArray().get(0), SyncStatus.class);
        Map<String, Integer> domainExpectedTotalsForAllSystemIds = status.getDomainExpectedTotalsForAllSystemIds();

        for (Map.Entry<String, Integer> domainTotal : domainExpectedTotalsForAllSystemIds.entrySet()) {
            Integer actualTotal = getCount(collectionTotals, domainTotal.getKey());
            if (actualTotal == null) {
                logger.debug(domainTotal.getKey() + " domain for pid " + status.getPid() + " NOT synced. Expected total: " + domainTotal.getValue() + ", actual total: " + "not found");
                return false;
            } else if (actualTotal < domainTotal.getValue()) {
                logger.debug(domainTotal.getKey() + " domain for pid " + status.getPid() + " NOT synced. Expected total: " + domainTotal.getValue() + ", actual total: " + actualTotal);
                return false;
            } else {
                logger.debug(domainTotal.getKey() + " domain for pid " + status.getPid() + " successfully synced. Expected total: " + domainTotal.getValue() + ", actual total: " + actualTotal);
            }
        }
        return true;
    }
    
    protected Integer getCount(JsonArray collectionTotals, String topic) {
        Integer result = null;
        for (JsonElement collectionTotal : collectionTotals) {
            if (topic.equals(collectionTotal.getAsJsonObject().get("topic").getAsString())) {
                result = collectionTotal.getAsJsonObject().get("count").getAsInt();
                break;
            }
        }
        return result;
    }

    private JsonObject load(String pid) {
        Stopwatch stopwatch = Stopwatch.createStarted();
        logger.info("TIME ELAPSED BEFORE LOAD = " + stopwatch.elapsed(TimeUnit.MILLISECONDS));
        MultivaluedMap<String, String> parameters = new MultivaluedMapImpl();
        if (isIcn(pid)) {
            parameters.add("icn", pid);
        } else {
            parameters.add("dfn", pid);
        }
        String path = "/sync/load";
        Client client = ClientBuilder.createClient();
        String host = format("https://%s:%s", this.hmpConfiguration.getHost(), this.hmpConfiguration.getPort());
        WebResource resource = client.resource(host + path);

        ClientResponse response = resource
            .accept(MediaType.APPLICATION_JSON)
            .header("Authorization", getBasicAuthorization(this.user))
            .post(ClientResponse.class, parameters);

        String json = response.getEntity(String.class);
        response.close();
        logger.info("TIME ELAPSED AFTER LOAD =  " + stopwatch.elapsed(TimeUnit.MILLISECONDS));
        return jsonObject(json);
    }

    /**
     * Unsynchronizes a patient.
     * @param pid the pid of the patient to unsync
     * @return The clearPatient response from HMP
     */
    private JsonObject unsynchronize(String pid) throws InterruptedException {
        MultivaluedMap<String, String> parameters = new MultivaluedMapImpl();
        if (isIcn(pid)) {
            JsonElement patientSelectData = new JdsCommand(this.jdsConfiguration, pid, VprDomain.PATIENT_SELECT).execute();
            parameters.add("pid", getDataItem(patientSelectData.getAsJsonObject(), 0).get("pid").getAsString());
        } else {
            parameters.add("pid", pid);
        }

        // clear patient
        String path = "/sync/clearPatient";
        Client client = ClientBuilder.createClient();
        String host = format("https://%s:%s", this.hmpConfiguration.getHost(), this.hmpConfiguration.getPort());
        WebResource resource = client.resource(host + path);
        ClientResponse response = resource
                .accept(MediaType.APPLICATION_JSON)
                .header("Authorization", getBasicAuthorization(this.user))
                .post(ClientResponse.class, parameters);

        String clearPatientResponse = response.getEntity(String.class);

        while (getSyncStatus(pid) != null) {
            logger.debug("pid " + pid + " not yet unsynced - still contains sync status.  Waiting...");
            sleep(WAIT_INCREMENT_MS);
        }
        logger.debug("pid " + pid + " unsynced.");

        // We are really not completely done unsync until after the operational data for this patient is reloaded.
        //---------------------------------------------------------------------------------------------------------
        while (getPatientFromPid(pid) == null) {
            logger.debug("Operational data for pid: " + pid + " has not been restored yet.  Waiting...");
            sleep(WAIT_INCREMENT_MS);
        }

        response.close();
        return new Gson().fromJson(clearPatientResponse, JsonObject.class);
    }

    private JsonObject getPatientFromPid(String pid) {
        JsonElement ptDemographics = new JdsCommand(this.jdsConfiguration, pid, VprDomain.PATIENT_SELECT).execute();
        if (ptDemographics != null) {
            logger.debug("Retrieved pt demographics: " + ptDemographics.toString());
        }
        return ptDemographics.getAsJsonObject();
    }

    private JsonObject getSyncStatus(String pid) {
        return StatusCommand.getSyncStatus(this.jdsConfiguration, pid);
    }

    // may throw com.google.gson.stream.MalformedJsonException if unexpected response is returned
    private static JsonObject jsonObject(String json) {
        return new Gson().fromJson(json, JsonElement.class).getAsJsonObject();
    }

    protected static String getBasicAuthorization(User user) {
        return "Basic " + getEncodedAuthorizationHeader(user.getHmpUser(), user.getHmpPassword());
    }

    protected static String getEncodedAuthorizationHeader(String user, String password) {
        try {
            return new String(Base64.encodeBase64((user + ":" + password).getBytes("UTF-8")), "UTF-8");
        } catch (UnsupportedEncodingException e) {
            logger.warn("Error during authorization header encoding; returning an empty string.", e);
            return "";
        }
    }

    public String toLoggingString() {
        return Objects.toStringHelper(this)
                .add("jds", this.jdsConfiguration.toString())
                .add("hmp", this.hmpConfiguration.toString())
                .add("pid", this.pid)
                .add("unsync", this.unsync)
                .toString();
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
        		.add("user", this.user.toString())
                .add("jds", this.jdsConfiguration.toString())
                .add("hmp", this.hmpConfiguration.toString())
                .add("pid", this.pid)
                .add("unsync", this.unsync)
                .toString();
    }

}

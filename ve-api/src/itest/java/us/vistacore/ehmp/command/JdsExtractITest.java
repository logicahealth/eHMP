package us.vistacore.ehmp.command;

import ch.qos.logback.classic.Level;

import com.google.common.base.Function;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.netflix.hystrix.Hystrix;
import com.netflix.hystrix.HystrixThreadPoolMetrics;
import com.netflix.hystrix.strategy.concurrency.HystrixRequestContext;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;

import org.apache.commons.io.FileUtils;
import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import rx.util.TimeInterval;
import rx.util.functions.Action1;
import us.vistacore.ehmp.ITestUtils;
import us.vistacore.ehmp.config.JdsConfiguration;
import us.vistacore.ehmp.model.VprDomain;
import us.vistacore.ehmp.util.ClientBuilder;

import javax.ws.rs.core.MediaType;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static java.lang.String.format;
import static java.lang.Thread.sleep;
import static us.vistacore.ehmp.ITestUtils.getHmpConfiguration;
import static us.vistacore.ehmp.ITestUtils.getJdsConfiguration;

public class JdsExtractITest {

    private static Logger logger = LoggerFactory.getLogger(JdsExtractITest.class);

    @Before
    public void setup() {
        ITestUtils.setLoggingLevel(Level.ALL);
        Hystrix.reset();
        HystrixRequestContext.initializeContext();
    }

    @After
    public void tearDown() {
        HystrixRequestContext.getContextForCurrentThread().shutdown();
    }

    @Test
    @Ignore("This test case synchronizes and saves all patient data to disk. It may take several hours.")
    public void extractAllJds() throws IOException, InterruptedException {
        DateFormat format = new SimpleDateFormat("yyyyMMdd'T'HHmm");
        String directory = System.getProperty("user.home") + "/jds_" + format.format(new Date());
        Boolean useUserDirectory = new File(directory).mkdirs();

        String allPatients = get(ITestUtils.getJdsConfiguration(), "/data/index/pt-select-name").getEntity(String.class);
        JsonObject allPatientsJson = new Gson().fromJson(allPatients, JsonObject.class);

        Function<JsonElement, String> idFunction = new Function<JsonElement, String>() {
            public String apply(JsonElement patient) {
                if (patient.getAsJsonObject().get("icn") != null) {
                    return patient.getAsJsonObject().get("icn").getAsString();
                } else {
                    return patient.getAsJsonObject().get("pid").getAsString();
                }
            }
        };
        List<String> ids = Lists.newArrayList(Iterables.transform(allPatientsJson.getAsJsonObject("data").getAsJsonArray("items"), idFunction));

        logger.debug("ids = " + Arrays.toString(ids.toArray()));

        synchronize(ids);

        for (String pid : ids) {
            for (VprDomain vprDomain : VprDomain.values()) {
                logger.debug("extracting " + vprDomain.name() + " for " + pid);

                Gson gson = new GsonBuilder().disableHtmlEscaping().setPrettyPrinting().create();
                String json;
                try {
                    json = gson.toJson(new JdsCommand(ITestUtils.getJdsConfiguration(), pid, vprDomain).execute());
                } catch (Exception e) {
                    logger.warn("Exception caught. Retrying JDS call.", e);
                    json = gson.toJson(new JdsCommand(ITestUtils.getJdsConfiguration(), pid, vprDomain).execute());
                }

                String basename = vprDomain.name().toLowerCase() + "_" + pid.replaceAll(";", "-");
                String filename = directory + File.separator + basename + ".json";
                if (!useUserDirectory) {
                    filename = File.createTempFile(basename, "json").getName();
                }
                FileUtils.writeStringToFile(new File(filename), json, Charset.defaultCharset().name());
            }
        }
    }

    private static ClientResponse get(JdsConfiguration jdsConfiguration, String path) {
        Client client = ClientBuilder.createClient();
        String host = format("http://%s:%s", jdsConfiguration.getHost(), jdsConfiguration.getPort());
        WebResource resource = client.resource(host + path);
        return resource.accept(MediaType.APPLICATION_JSON).get(ClientResponse.class);
    }


    private static void synchronize(List<String> pids) throws InterruptedException {
        for (String pid : pids) {
            logger.debug("syncing " + pid);
            SyncCommand syncCommand = new SyncCommand(ITestUtils.getUser(), getHmpConfiguration(), getJdsConfiguration(), pid);

            while (!syncCommand.isQueueable()) {
                // thread pool exhausted
                HystrixThreadPoolMetrics metrics = HystrixThreadPoolMetrics.getInstance(SyncCommand.THREAD_KEY);
                logger.debug("threads exhausted; active=" + metrics.getCurrentActiveCount() + ", queue=" + metrics.getCurrentQueueSize() + ", taskCount=" + metrics.getCurrentTaskCount() + ", completedTaskCount=" + metrics.getCurrentCompletedTaskCount());
                sleep(1000);
            }

            syncCommand.observe()
                .timeInterval()
                .subscribe(new Action1<TimeInterval<JsonElement>>() {
                    @Override
                    public void call(TimeInterval<JsonElement> jsonElementTimeInterval) {
                        logger.debug("sync finished (" + jsonElementTimeInterval.getIntervalInMilliseconds() / 1000.0 + "s) : " + jsonElementTimeInterval.getValue().toString());
                    }
                });
        }
    }

}

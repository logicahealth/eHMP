package us.vistacore.ehmp.command;

import com.google.common.base.Charsets;
import com.google.common.io.Resources;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.netflix.hystrix.exception.HystrixRuntimeException;
import org.junit.Assert;
import org.junit.Test;
import us.vistacore.ehmp.authentication.User;
import us.vistacore.ehmp.config.HmpConfiguration;
import us.vistacore.ehmp.config.JdsConfiguration;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicInteger;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

public class SyncCommandTest {

    private static final String COLLECTION_COUNTS = toText("vpr_json/count_collection.json");
    
    @Test
    public void testGetCount() {
        User user = new User("pu1234", "pu1234!!", "9E7A", "500");
        SyncCommand testCommand = new SyncCommand(user, new HmpConfiguration() { }, new JdsConfiguration() { }, "12345", true);
        JsonObject counts = new Gson().fromJson(COLLECTION_COUNTS, JsonObject.class);
        JsonArray asJsonArray = counts.getAsJsonObject("data").getAsJsonArray("items").getAsJsonArray();

        Assert.assertThat(testCommand.getCount(asJsonArray, "allergy"), is(4));
        Assert.assertThat(testCommand.getCount(asJsonArray, "appointment"), is(92));
    }
    
    @Test
    public void testGetEncodedAuthorizationHeader() {
        // "QjM2Mjs1MDA6cHUxMjM0O3B1MTIzNCEh" = new String(Base64.encodeBase64(new String(vistaId + ";" + division + ":" + accessCode + ";" + verifyCode).getBytes("UTF-8")), "UTF-8")
        assertThat(SyncCommand.getEncodedAuthorizationHeader("B362;500", "pu1234;pu1234!!"), is("QjM2Mjs1MDA6cHUxMjM0O3B1MTIzNCEh"));
        assertThat(SyncCommand.getEncodedAuthorizationHeader("9E7A;500", "pu1234;pu1234!!"), is("OUU3QTs1MDA6cHUxMjM0O3B1MTIzNCEh"));
    }

    @Test
    public void testGetDataItem() {
        String emptyJson = "{ }";
        String emptyData = "{ \"data\": { } }";
        String emptyItems = "{ \"data\": { \"items\": [ ] } }";
        String valueJson = "{ \"data\": { \"items\": [ { \"item\": \"value\" } ] } }";

        assertNull(SyncCommand.getDataItem(emptyJson, 0));
        assertNull(SyncCommand.getDataItem(emptyJson, 1));
        assertNull(SyncCommand.getDataItem(emptyJson, 100));

        assertNull(SyncCommand.getDataItem(emptyData, 0));
        assertNull(SyncCommand.getDataItem(emptyData, 1));
        assertNull(SyncCommand.getDataItem(emptyData, 100));

        assertNull(SyncCommand.getDataItem(emptyItems, 0));
        assertNull(SyncCommand.getDataItem(emptyItems, 1));
        assertNull(SyncCommand.getDataItem(emptyItems, 100));

        assertNotNull(SyncCommand.getDataItem(valueJson, 0));
        assertThat(SyncCommand.getDataItem(valueJson, 0), equalToIgnoringWhiteSpace("{\"item\":\"value\"}"));
        assertNull(SyncCommand.getDataItem(emptyItems, 1));
        assertNull(SyncCommand.getDataItem(emptyItems, 100));
    }

    @Test
    public void testFallback() {
        final AtomicInteger fallbacks = new AtomicInteger(0);
        User user = new User("pu1234", "pu1234!!", "9E7A", "500");
        SyncCommand testCommand = new SyncCommand(user, new HmpConfiguration() { }, new JdsConfiguration() { }, "12345", true) {
            @Override
            protected JsonElement run() {
                return this.failingMethod();
            }

            private JsonElement failingMethod() {
                throw new RuntimeException("Trigger fallback.");
            }

            @Override
            protected JsonElement getFallback() {
                fallbacks.getAndIncrement();
                return this.failingMethod();
            }
        };

        JsonElement result = null;
        Exception expected = null;
        try {
            result = testCommand.execute();
        } catch (RuntimeException e) {
            expected = e;
        }

        assertNotNull(expected);
        assertThat(expected, instanceOf(HystrixRuntimeException.class));
        assertNull(result);
        assertThat(fallbacks.get(), is(1));
    }

    private static String toText(String resource) {
        try {
            return Resources.toString(Resources.getResource(resource), Charsets.UTF_8);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

}

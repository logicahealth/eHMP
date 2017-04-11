package us.vistacore.ehmp.command;

import com.google.common.collect.ImmutableList;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import java.util.Collection;

import static org.junit.Assert.assertEquals;

@RunWith(Parameterized.class)
public class StatusCommandTest {

    private static final String OPERATIONAL_SYNC_COMPLETE =
            "{\n"
            + "  \"apiVersion\": \"1.0\",\n"
            + "  \"data\": {\n"
            + "    \"updated\": 20140606153115,\n"
            + "    \"totalItems\": 1,\n"
            + "    \"currentItemCount\": 1,\n"
            + "    \"items\": [\n"
            + "      {\n"
            + "        \"uid\": \"urn:va:syncstatus:OPD\",\n"
            + "        \"summary\": \"SyncStatus{uid='null'}\",\n"
            + "        \"forOperational\": true,\n"
            + "        \"syncOperationalComplete\": true,\n"
            + "        \"operationalSyncStatus\": {\n"
            + "          \"domainExpectedTotals\": {\n"
            + "            \"user\": {\n"
            + "              \"total\": 1326,\n"
            + "              \"count\": 1326\n"
            + "            }\n"
            + "          },\n"
            + "          \"syncComplete\": false\n"
            + "        }\n"
            + "      }\n"
            + "    ]\n"
            + "  }\n"
            + "}";

    private static final String OPERATIONAL_SYNC_INCOMPLETE =
            "{\n"
            + "  \"apiVersion\": \"1.0\",\n"
            + "  \"data\": {\n"
            + "    \"updated\": 20140606153115,\n"
            + "    \"totalItems\": 1,\n"
            + "    \"currentItemCount\": 1,\n"
            + "    \"items\": [\n"
            + "      {\n"
            + "        \"uid\": \"urn:va:syncstatus:OPD\",\n"
            + "        \"summary\": \"SyncStatus{uid='null'}\",\n"
            + "        \"forOperational\": true,\n"
            + "        \"syncOperationalComplete\": false,\n"
            + "        \"operationalSyncStatus\": {\n"
            + "          \"domainExpectedTotals\": {\n"
            + "            \"user\": {\n"
            + "              \"total\": 1326,\n"
            + "              \"count\": 1326\n"
            + "            }\n"
            + "          },\n"
            + "          \"syncComplete\": false\n"
            + "        }\n"
            + "      }\n"
            + "    ]\n"
            + "  }\n"
            + "}";

    private static final String NO_STATUSES =
            "{\n"
            + "  \"apiVersion\": \"1.0\",\n"
            + "  \"data\": {\n"
            + "    \"updated\": 20140607082552,\n"
            + "    \"totalItems\": 14,\n"
            + "    \"currentItemCount\": 14,\n"
            + "    \"items\": [\n"
            + "      {\n"
            + "      }\n"
            + "    ]\n"
            + "  }\n"
            + "}";

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        return ImmutableList.<Object[]>builder()
                .add(new Object[] {OPERATIONAL_SYNC_COMPLETE, true})
                .add(new Object[] {OPERATIONAL_SYNC_INCOMPLETE, false})
                .add(new Object[] {NO_STATUSES, false})
                .add(new Object[] {null, false})
                .add(new Object[] {"", false})
                .build();
    }

    private final String json;
    private final boolean expected;

    public StatusCommandTest(String json, boolean expected) {
        this.json = json;
        this.expected = expected;
    }

    @Test
    public void testIsOperationalSyncComplete() {
        assertEquals(expected, StatusCommand.isOperationalSyncComplete(new Gson().fromJson(json, JsonElement.class)));
    }
}
